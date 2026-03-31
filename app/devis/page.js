'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Devis() {
  const router = useRouter()
  const [devis, setDevis] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmSupprimer, setConfirmSupprimer] = useState(null)
  const [converting, setConverting] = useState(null)

  const fetchDevis = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { data } = await supabase
      .from('devis')
      .select('*')
      .order('created_at', { ascending: false })

    setDevis(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchDevis()
  }, [fetchDevis])

  const changerStatut = async (id, statutActuel) => {
    const cycle = {
      'Brouillon': 'Envoyé',
      'Envoyé': 'Accepté',
      'Accepté': 'Refusé',
      'Refusé': 'Brouillon'
    }
    const nouveauStatut = cycle[statutActuel] || 'Brouillon'
    await supabase.from('devis').update({ statut: nouveauStatut }).eq('id', id)
    setDevis(prev => prev.map(d => d.id === id ? { ...d, statut: nouveauStatut } : d))
  }

  const supprimerDevis = async (id) => {
    await supabase.from('devis').delete().eq('id', id)
    setConfirmSupprimer(null)
    await fetchDevis()
  }

  const convertirEnFacture = async (devis) => {
    setConverting(devis.id)
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase.from('factures').insert([{
      user_id: session.user.id,
      client: devis.client,
      email: devis.email,
      description: devis.description,
      montant: devis.montant,
      date: new Date().toISOString().split('T')[0],
      statut: 'En attente',
    }])

    if (!error) {
      await supabase.from('devis').update({ statut: 'Accepté' }).eq('id', devis.id)
      setDevis(prev => prev.map(d => d.id === devis.id ? { ...d, statut: 'Accepté' } : d))
      alert('✅ Devis converti en facture avec succès !')
    }
    setConverting(null)
  }

  const exporterPDF = async (devis) => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFontSize(24)
    doc.setTextColor(29, 78, 216)
    doc.text('Zimvu', 20, 25)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Votre outil de facturation intelligent', 20, 33)

    doc.setDrawColor(29, 78, 216)
    doc.setLineWidth(0.5)
    doc.line(20, 38, 190, 38)

    doc.setFontSize(18)
    doc.setTextColor(30, 30, 30)
    doc.text('DEVIS', 20, 52)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Date : ${devis.date}`, 20, 62)
    doc.text(`Valide jusqu'au : ${devis.date_validite || 'Non défini'}`, 20, 70)
    doc.text(`Statut : ${devis.statut}`, 20, 78)

    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Informations client', 20, 93)
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(`Nom : ${devis.client}`, 20, 101)
    doc.text(`Email : ${devis.email || 'Non renseigné'}`, 20, 109)

    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Détails de la prestation', 20, 124)

    doc.setFillColor(245, 247, 250)
    doc.rect(20, 130, 170, 30, 'F')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text('Description', 25, 140)
    doc.text('Montant', 155, 140)
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 144, 190, 144)
    doc.text(devis.description || '', 25, 154)
    doc.setTextColor(29, 78, 216)
    doc.text(`${devis.montant} €`, 155, 154)

    doc.setDrawColor(29, 78, 216)
    doc.line(20, 166, 190, 166)
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Total TTC', 130, 176)
    doc.setFontSize(14)
    doc.setTextColor(29, 78, 216)
    doc.text(`${devis.montant} €`, 165, 176)

    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('Ce devis est valable jusqu\'à la date de validité indiquée.', 20, 240)
    doc.text('Merci pour votre confiance — Zimvu.vercel.app', 20, 248)

    doc.save(`devis-${devis.client}-${devis.date}.pdf`)
  }

  const couleurStatut = (statut) => {
    switch (statut) {
      case 'Brouillon': return 'bg-gray-100 text-gray-600'
      case 'Envoyé': return 'bg-blue-100 text-blue-700'
      case 'Accepté': return 'bg-green-100 text-green-700'
      case 'Refusé': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar pageCourante="/devis" />

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmSupprimer && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer le devis ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Le devis de <strong>{confirmSupprimer.client}</strong> ({confirmSupprimer.montant} €) sera supprimé définitivement.
            </p>
            <div className="flex gap-3">
              <button onClick={() => supprimerDevis(confirmSupprimer.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-sm">
                Supprimer
              </button>
              <button onClick={() => setConfirmSupprimer(null)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes devis</h2>
          <button
            onClick={() => router.push('/devis/nouveau')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau devis
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : devis.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm mb-4">Aucun devis pour le moment</p>
              <button
                onClick={() => router.push('/devis/nouveau')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                Créer mon premier devis
              </button>
            </div>
          ) : (
            <>
              {/* Vue mobile : cartes */}
              <div className="md:hidden divide-y divide-gray-100">
                {devis.map((d) => (
                  <div key={d.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{d.client}</span>
                      <span className="font-bold text-blue-700">{d.montant} €</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">{d.description}</p>
                    <p className="text-gray-400 text-xs mb-3">Créé le {d.date} · Valide jusqu'au {d.date_validite || '—'}</p>
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => changerStatut(d.id, d.statut)}
                        title="Cliquer pour changer le statut"
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${couleurStatut(d.statut)}`}>
                        {d.statut}
                      </span>
                      <div className="flex gap-3">
                        <span onClick={() => exporterPDF(d)} className="text-blue-600 cursor-pointer text-sm">PDF</span>
                        {d.statut !== 'Refusé' && (
                          <span onClick={() => convertirEnFacture(d)} className="text-green-600 cursor-pointer text-sm font-medium">
                            {converting === d.id ? '...' : '→ Facture'}
                          </span>
                        )}
                        <span onClick={() => setConfirmSupprimer(d)} className="text-red-500 cursor-pointer text-sm">Supprimer</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vue desktop : tableau */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Validité</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Montant</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devis.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{d.client}</td>
                        <td className="px-6 py-4 text-gray-600">{d.description}</td>
                        <td className="px-6 py-4 text-gray-600">{d.date}</td>
                        <td className="px-6 py-4 text-gray-600">{d.date_validite || '—'}</td>
                        <td className="px-6 py-4 font-semibold text-blue-700">{d.montant} €</td>
                        <td className="px-6 py-4">
                          <span
                            onClick={() => changerStatut(d.id, d.statut)}
                            title="Cliquer pour changer le statut"
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-75 ${couleurStatut(d.statut)}`}>
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-3 items-center">
                          <span onClick={() => exporterPDF(d)} className="text-blue-600 cursor-pointer hover:underline text-sm">PDF</span>
                          {d.statut !== 'Refusé' && (
                            <span onClick={() => convertirEnFacture(d)} className="text-green-600 cursor-pointer hover:underline text-sm font-medium">
                              {converting === d.id ? 'Conversion...' : '→ Facture'}
                            </span>
                          )}
                          <span onClick={() => setConfirmSupprimer(d)} className="text-red-500 cursor-pointer hover:underline text-sm">
                            Supprimer
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
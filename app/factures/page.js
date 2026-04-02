'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Factures() {
  const router = useRouter()
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmSupprimer, setConfirmSupprimer] = useState(null)
  const [menuOuvert, setMenuOuvert] = useState(null)
  const menuRef = useRef(null)

  const fetchFactures = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    const { data } = await supabase
      .from('factures')
      .select('*')
      .order('created_at', { ascending: false })
    setFactures(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchFactures()
  }, [fetchFactures])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOuvert(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changerStatut = async (id, statutActuel) => {
    const cycle = { 'En attente': 'Payée', 'Payée': 'Annulée', 'Annulée': 'En attente' }
    const nouveauStatut = cycle[statutActuel] || 'Payée'
    await supabase.from('factures').update({ statut: nouveauStatut }).eq('id', id)
    setFactures(prev => prev.map(f => f.id === id ? { ...f, statut: nouveauStatut } : f))
  }

  const supprimerFacture = async (id) => {
    await supabase.from('factures').delete().eq('id', id)
    setConfirmSupprimer(null)
    await fetchFactures()
  }

  const exporterPDF = async (facture) => {
    setMenuOuvert(null)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    const montantHT = Number(facture.montant_ht || facture.montant || 0)
    const tauxTVA = Number(facture.tva_taux || 0)
    const montantTVA = Number(facture.montant_tva || 0)
    const montantTTC = Number(facture.montant || 0)

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
    doc.text('FACTURE', 20, 52)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    if (facture.numero) doc.text(`N° : ${facture.numero}`, 130, 52)
    doc.text(`Date : ${facture.date}`, 20, 62)
    doc.text(`Statut : ${facture.statut}`, 20, 70)

    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Informations client', 20, 85)
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(`Nom : ${facture.client}`, 20, 93)
    doc.text(`Email : ${facture.email || 'Non renseigné'}`, 20, 101)

    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Détails de la prestation', 20, 116)

    doc.setFillColor(245, 247, 250)
    doc.rect(20, 122, 170, 30, 'F')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text('Description', 25, 132)
    doc.text('Montant HT', 150, 132)
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 136, 190, 136)
    doc.text(facture.description || '', 25, 146)
    doc.setTextColor(29, 78, 216)
    doc.text(`${montantHT.toFixed(2)} €`, 150, 146)

    doc.setDrawColor(29, 78, 216)
    doc.line(20, 158, 190, 158)

    let y = 168
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text('Montant HT', 120, y)
    doc.setTextColor(30, 30, 30)
    doc.text(`${montantHT.toFixed(2)} €`, 165, y)
    y += 10

    doc.setTextColor(60, 60, 60)
    doc.text(`TVA (${tauxTVA}%)`, 120, y)
    doc.setTextColor(30, 30, 30)
    doc.text(`${montantTVA.toFixed(2)} €`, 165, y)
    y += 10

    doc.setFillColor(29, 78, 216)
    doc.rect(115, y - 4, 75, 12, 'F')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('Total TTC', 120, y + 4)
    doc.text(`${montantTTC.toFixed(2)} €`, 165, y + 4)
    y += 18

    if (tauxTVA === 0) {
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('TVA non applicable — article 293 B du CGI', 20, y + 10)
    }

    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('Merci pour votre confiance — Zimvu.vercel.app', 20, 280)
    doc.save(`facture-${facture.numero || facture.client}-${facture.date}.pdf`)
  }

  // Composant menu réutilisable
  const MenuActions = ({ facture }) => (
    <div className="relative" ref={menuOuvert === facture.id ? menuRef : null}>
      <button
        onClick={() => setMenuOuvert(menuOuvert === facture.id ? null : facture.id)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-colors ${
          menuOuvert === facture.id
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}>
        ···
      </button>
      {menuOuvert === facture.id && (
        <div
          className="absolute right-0 top-10 bg-white rounded-2xl z-50 overflow-hidden"
          style={{
            minWidth: '180px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
          <div className="p-1">
            <button
              onClick={() => exporterPDF(facture)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center gap-3 transition-colors">
              <span className="text-base">📄</span>
              Télécharger PDF
            </button>
            <div className="h-px bg-gray-100 mx-2" />
            <button
              onClick={() => { setConfirmSupprimer(facture); setMenuOuvert(null) }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
              <span className="text-base">🗑️</span>
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/factures" />

      {confirmSupprimer && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer la facture ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              La facture <strong>{confirmSupprimer.numero || confirmSupprimer.client}</strong> ({confirmSupprimer.montant} €) sera supprimée définitivement.
            </p>
            <div className="flex gap-3">
              <button onClick={() => supprimerFacture(confirmSupprimer.id)}
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes factures</h2>
          <button onClick={() => router.push('/factures/nouvelle')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : factures.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">Aucune facture pour le moment</p>
          ) : (
            <>
              {/* Vue mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {factures.map((facture) => (
                  <div key={facture.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{facture.client}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">{Number(facture.montant).toFixed(2)} €</span>
                        <MenuActions facture={facture} />
                      </div>
                    </div>
                    {facture.numero && <p className="text-xs text-blue-600 font-medium mb-1">{facture.numero}</p>}
                    <p className="text-gray-500 text-sm mb-1">{facture.description}</p>
                    <p className="text-gray-400 text-xs mb-1">{facture.date}</p>
                    {facture.tva_taux > 0 && (
                      <p className="text-gray-400 text-xs mb-3">
                        HT : {Number(facture.montant_ht).toFixed(2)} € · TVA {facture.tva_taux}% : {Number(facture.montant_tva).toFixed(2)} €
                      </p>
                    )}
                    <span onClick={() => changerStatut(facture.id, facture.statut)}
                      title="Cliquer pour changer le statut"
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                        facture.statut === "Payée" ? "bg-green-100 text-green-700" :
                        facture.statut === "En attente" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                      {facture.statut}
                    </span>
                  </div>
                ))}
              </div>

              {/* Vue desktop */}
              <div className="hidden md:block overflow-visible">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">N°</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">HT</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">TVA</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">TTC</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factures.map((facture) => (
                      <tr key={facture.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-blue-600 font-medium text-sm">{facture.numero || '—'}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{facture.client}</td>
                        <td className="px-6 py-4 text-gray-600">{facture.description}</td>
                        <td className="px-6 py-4 text-gray-600">{facture.date}</td>
                        <td className="px-6 py-4 text-gray-600">{Number(facture.montant_ht || facture.montant).toFixed(2)} €</td>
                        <td className="px-6 py-4 text-gray-600">{facture.tva_taux > 0 ? `${facture.tva_taux}%` : '—'}</td>
                        <td className="px-6 py-4 font-semibold text-blue-700">{Number(facture.montant).toFixed(2)} €</td>
                        <td className="px-6 py-4">
                          <span onClick={() => changerStatut(facture.id, facture.statut)}
                            title="Cliquer pour changer le statut"
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-75 ${
                              facture.statut === "Payée" ? "bg-green-100 text-green-700" :
                              facture.statut === "En attente" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                            {facture.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <MenuActions facture={facture} />
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
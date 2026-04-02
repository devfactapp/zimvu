'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Devis() {
  const router = useRouter()
  const [devis, setDevis] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmSupprimer, setConfirmSupprimer] = useState(null)
  const [converting, setConverting] = useState(null)
  const [menuOuvert, setMenuOuvert] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const menuRef = useRef(null)

  const fetchDevis = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    const { data } = await supabase.from('devis').select('*').order('created_at', { ascending: false })
    if (data) {
      const aujourd_hui = new Date().toISOString().split('T')[0]
      const devisAExpirer = data.filter(d => d.date_validite && d.date_validite < aujourd_hui && d.statut !== 'Expiré' && d.statut !== 'Accepté' && d.statut !== 'Refusé')
      if (devisAExpirer.length > 0) {
        await Promise.all(devisAExpirer.map(d => supabase.from('devis').update({ statut: 'Expiré' }).eq('id', d.id)))
      }
      setDevis(data.map(d => {
        if (d.date_validite && d.date_validite < aujourd_hui && d.statut !== 'Accepté' && d.statut !== 'Refusé') return { ...d, statut: 'Expiré' }
        return d
      }))
    }
    setLoading(false)
  }, [router])

  useEffect(() => { fetchDevis() }, [fetchDevis])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOuvert(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const ouvrirMenu = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 4, left: rect.left })
    setMenuOuvert(prev => prev === id ? null : id)
  }

  const changerStatut = async (id, statutActuel) => {
    const cycle = { 'Brouillon': 'Envoyé', 'Envoyé': 'Accepté', 'Accepté': 'Refusé', 'Refusé': 'Brouillon' }
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
    setMenuOuvert(null)
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('factures').insert([{
      user_id: session.user.id,
      client: devis.client,
      email: devis.email,
      description: devis.description,
      montant_ht: devis.montant_ht || devis.montant,
      tva_taux: devis.tva_taux || 0,
      montant_tva: devis.montant_tva || 0,
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
    setMenuOuvert(null)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(24); doc.setTextColor(29, 78, 216); doc.text('Zimvu', 20, 25)
    doc.setFontSize(10); doc.setTextColor(100, 100, 100)
    doc.text('Votre outil de facturation intelligent', 20, 33)
    doc.setDrawColor(29, 78, 216); doc.setLineWidth(0.5); doc.line(20, 38, 190, 38)
    doc.setFontSize(18); doc.setTextColor(30, 30, 30); doc.text('DEVIS', 20, 52)
    doc.setFontSize(10); doc.setTextColor(100, 100, 100)
    if (devis.numero) doc.text(`N° : ${devis.numero}`, 130, 52)
    doc.text(`Date : ${devis.date}`, 20, 62)
    doc.text(`Valide jusqu'au : ${devis.date_validite || 'Non défini'}`, 20, 70)
    doc.text(`Statut : ${devis.statut}`, 20, 78)
    doc.setFontSize(12); doc.setTextColor(30, 30, 30); doc.text('Informations client', 20, 93)
    doc.setFontSize(10); doc.setTextColor(60, 60, 60)
    doc.text(`Nom : ${devis.client}`, 20, 101)
    doc.text(`Email : ${devis.email || 'Non renseigné'}`, 20, 109)
    doc.setFontSize(12); doc.setTextColor(30, 30, 30); doc.text('Détails de la prestation', 20, 124)
    doc.setFillColor(245, 247, 250); doc.rect(20, 130, 170, 30, 'F')
    doc.setFontSize(10); doc.setTextColor(60, 60, 60)
    doc.text('Description', 25, 140); doc.text('Montant HT', 150, 140)
    doc.setDrawColor(200, 200, 200); doc.line(20, 144, 190, 144)
    doc.text(devis.description || '', 25, 154)
    doc.setTextColor(29, 78, 216); doc.text(`${Number(devis.montant_ht || devis.montant).toFixed(2)} €`, 150, 154)
    doc.setDrawColor(29, 78, 216); doc.line(20, 166, 190, 166)
    let y = 176
    doc.setFontSize(10); doc.setTextColor(60, 60, 60); doc.text('Montant HT', 120, y)
    doc.setTextColor(30, 30, 30); doc.text(`${Number(devis.montant_ht || devis.montant).toFixed(2)} €`, 165, y); y += 10
    doc.setTextColor(60, 60, 60); doc.text(`TVA (${devis.tva_taux || 0}%)`, 120, y)
    doc.setTextColor(30, 30, 30); doc.text(`${Number(devis.montant_tva || 0).toFixed(2)} €`, 165, y); y += 10
    doc.setFillColor(29, 78, 216); doc.rect(115, y - 4, 75, 12, 'F')
    doc.setFontSize(11); doc.setTextColor(255, 255, 255)
    doc.text('Total TTC', 120, y + 4); doc.text(`${Number(devis.montant).toFixed(2)} €`, 165, y + 4)
    if (devis.tva_taux === 0) { doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text('TVA non applicable — article 293 B du CGI', 20, y + 20) }
    doc.setFontSize(9); doc.setTextColor(150, 150, 150)
    doc.text('Ce devis est valable jusqu\'à la date de validité indiquée.', 20, 240)
    doc.text('Merci pour votre confiance — Zimvu.vercel.app', 20, 248)
    doc.save(`devis-${devis.numero || devis.client}-${devis.date}.pdf`)
  }

  const couleurStatut = (statut) => {
    switch (statut) {
      case 'Brouillon': return 'bg-gray-100 text-gray-600'
      case 'Envoyé': return 'bg-blue-100 text-blue-700'
      case 'Accepté': return 'bg-green-100 text-green-700'
      case 'Refusé': return 'bg-red-100 text-red-700'
      case 'Expiré': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const devisSelectionne = devis.find(d => d.id === menuOuvert)
  const statuts = ['Tous', 'Brouillon', 'Envoyé', 'Accepté', 'Refusé', 'Expiré']
  const devisFiltres = devis.filter(d => {
    const matchRecherche = d.client?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.numero?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.description?.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'Tous' || d.statut === filtreStatut
    return matchRecherche && matchStatut
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/devis" />

      {menuOuvert && devisSelectionne && (
        <div ref={menuRef} className="fixed bg-white rounded-2xl z-50 overflow-hidden"
          style={{
            top: menuPosition.top, left: menuPosition.left, minWidth: '180px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
          <div className="p-1">
            <button onClick={() => exporterPDF(devisSelectionne)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center gap-3 transition-colors">
              <span>📄</span> Télécharger PDF
            </button>
            {devisSelectionne.statut !== 'Refusé' && (
              <>
                <div className="h-px bg-gray-100 mx-2" />
                <button onClick={() => convertirEnFacture(devisSelectionne)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 rounded-xl flex items-center gap-3 transition-colors">
                  <span>→</span> {converting === devisSelectionne.id ? 'Conversion...' : 'Convertir en facture'}
                </button>
              </>
            )}
            <div className="h-px bg-gray-100 mx-2" />
            <button onClick={() => { setConfirmSupprimer(devisSelectionne); setMenuOuvert(null) }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
              <span>🗑️</span> Supprimer
            </button>
          </div>
        </div>
      )}

      {confirmSupprimer && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer le devis ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Le devis <strong>{confirmSupprimer.numero || confirmSupprimer.client}</strong> ({confirmSupprimer.montant} €) sera supprimé définitivement.
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-gray-700">Mes devis</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="🔍 Rechercher client, n°..."
              value={recherche} onChange={(e) => setRecherche(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
            <button onClick={() => router.push('/devis/nouveau')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Nouveau devis
            </button>
          </div>
        </div>

        {/* Filtres statut */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {statuts.map(s => (
            <button key={s} onClick={() => setFiltreStatut(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filtreStatut === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}>
              {s}
              {s !== 'Tous' && (
                <span className="ml-1.5 opacity-70">
                  ({devis.filter(d => d.statut === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : devisFiltres.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm mb-4">
                {recherche || filtreStatut !== 'Tous' ? 'Aucun devis trouvé' : 'Aucun devis pour le moment'}
              </p>
              {!recherche && filtreStatut === 'Tous' && (
                <button onClick={() => router.push('/devis/nouveau')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Créer mon premier devis
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Vue mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {devisFiltres.map((d) => (
                  <div key={d.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{d.client}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">{Number(d.montant).toFixed(2)} €</span>
                        <button onClick={(e) => ouvrirMenu(e, d.id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-colors ${
                            menuOuvert === d.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}>···</button>
                      </div>
                    </div>
                    {d.numero && <p className="text-xs text-blue-600 font-medium mb-1">{d.numero}</p>}
                    <p className="text-gray-500 text-sm mb-1">{d.description}</p>
                    <p className="text-gray-400 text-xs mb-3">Créé le {d.date} · Valide jusqu'au {d.date_validite || '—'}</p>
                    <span onClick={() => changerStatut(d.id, d.statut)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${couleurStatut(d.statut)}`}>
                      {d.statut}
                    </span>
                  </div>
                ))}
              </div>

              {/* Vue desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">N°</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Validité</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">HT</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">TVA</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">TTC</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devisFiltres.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-blue-600 font-medium text-sm">{d.numero || '—'}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{d.client}</td>
                        <td className="px-6 py-4 text-gray-600">{d.description}</td>
                        <td className="px-6 py-4 text-gray-600">{d.date}</td>
                        <td className="px-6 py-4 text-gray-600">{d.date_validite || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">{Number(d.montant_ht || d.montant).toFixed(2)} €</td>
                        <td className="px-6 py-4 text-gray-600">{d.tva_taux > 0 ? `${d.tva_taux}%` : '—'}</td>
                        <td className="px-6 py-4 font-semibold text-blue-700">{Number(d.montant).toFixed(2)} €</td>
                        <td className="px-6 py-4">
                          <span onClick={() => changerStatut(d.id, d.statut)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-75 ${couleurStatut(d.statut)}`}>
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={(e) => ouvrirMenu(e, d.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-colors ${
                              menuOuvert === d.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}>···</button>
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
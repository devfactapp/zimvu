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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const [profil, setProfil] = useState(null)
  const menuRef = useRef(null)

  const fetchFactures = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    const { data } = await supabase
      .from('factures')
      .select('*')
      .order('created_at', { ascending: false })
    setFactures(data || [])

    const { data: profilData } = await supabase
      .from('profils')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfil(profilData)

    setLoading(false)
  }, [router])

  useEffect(() => { fetchFactures() }, [fetchFactures])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOuvert(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const ouvrirMenu = (e, id) => {
    e.stopPropagation()
    if (menuOuvert === id) { setMenuOuvert(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 4, left: rect.left })
    setMenuOuvert(id)
  }

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

    const nomEmetteur = profil ? `${profil.prenom || ''} ${profil.nom || ''}`.trim() : ''
    const entreprise = profil?.nom_entreprise || nomEmetteur || 'Zimvu'
    const adresse = profil?.adresse || ''
    const telephone = profil?.telephone || ''
    const siret = profil?.siret || ''

    // ── HEADER ──
    doc.setFillColor(17, 24, 39)
    doc.rect(0, 0, 210, 45, 'F')

    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('ZIMVU', 20, 20)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text('Logiciel de facturation', 20, 28)

    doc.setFontSize(9)
    doc.setTextColor(229, 231, 235)
    if (entreprise) doc.text(entreprise, 190, 14, { align: 'right' })
    if (adresse) doc.text(adresse, 190, 21, { align: 'right' })
    if (telephone) doc.text(telephone, 190, 28, { align: 'right' })
    if (siret) doc.text(`SIRET : ${siret}`, 190, 35, { align: 'right' })

    // ── TITRE FACTURE + NUMÉRO ──
    doc.setFontSize(26)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE', 20, 65)

    if (facture.numero) {
      doc.setFontSize(11)
      doc.setTextColor(99, 102, 241)
      doc.setFont('helvetica', 'bold')
      doc.text(facture.numero, 190, 58, { align: 'right' })
    }

    // Date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(`Date d'émission : ${facture.date}`, 20, 74)

    // Statut aligné avec la ligne (190)
    const statutColor = facture.statut === 'Payée' ? [22, 163, 74] :
      facture.statut === 'En attente' ? [217, 119, 6] : [220, 38, 38]
    doc.setTextColor(...statutColor)
    doc.setFont('helvetica', 'bold')
    doc.text(`${facture.statut}`, 185, 74, { align: 'right' })

    // Ligne séparatrice de 20 à 190
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(20, 80, 190, 80)

    // ── BLOC CLIENT ──
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(20, 87, 80, 35, 3, 3, 'F')

    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURÉ À', 27, 96)

    doc.setFontSize(11)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.text(facture.client || '', 27, 105)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    if (facture.email) doc.text(facture.email, 27, 113)

    // ── TABLEAU PRESTATIONS ──
    const tableTop = 135

    /// En-tête tableau — bande noire de 20 à 190 avec bords arrondis
    doc.setFillColor(17, 24, 39)
    doc.roundedRect(20, tableTop, 170, 10, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('DESCRIPTION', 27, tableTop + 7)
    // MONTANT HT à 187 align right pour rester dans la bande
    doc.text('MONTANT HT', 187, tableTop + 7, { align: 'right' })

    // Ligne prestation
    doc.setFillColor(255, 255, 255)
    doc.rect(20, tableTop + 10, 170, 18, 'F')
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'normal')

    const descriptionText = facture.description || 'Prestation de services'
    const descLines = doc.splitTextToSize(descriptionText, 120)
    doc.text(descLines, 27, tableTop + 20)
    doc.setFont('helvetica', 'bold')
    doc.text(`${montantHT.toFixed(2)} €`, 187, tableTop + 20, { align: 'right' })

    doc.setDrawColor(229, 231, 235)
    doc.line(20, tableTop + 28, 190, tableTop + 28)

    // ── TOTAUX ──
    let y = tableTop + 45

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Montant HT', 130, y)
    doc.setTextColor(17, 24, 39)
    doc.text(`${montantHT.toFixed(2)} €`, 190, y, { align: 'right' })
    y += 10

    doc.setTextColor(107, 114, 128)
    doc.text(`TVA (${tauxTVA}%)`, 130, y)
    doc.setTextColor(17, 24, 39)
    doc.text(`${montantTVA.toFixed(2)} €`, 190, y, { align: 'right' })
    y += 5

    doc.setDrawColor(229, 231, 235)
    doc.line(125, y, 190, y)
    y += 8

    // Total TTC
    doc.setFillColor(17, 24, 39)
    doc.roundedRect(120, y - 5, 72, 14, 2, 2, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('TOTAL TTC', 127, y + 4)
    doc.text(`${montantTTC.toFixed(2)} €`, 188, y + 4, { align: 'right' })
    y += 22

    if (tauxTVA === 0) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('TVA non applicable — article 293 B du CGI', 20, y)
    }

    // ── FOOTER ──
    doc.setFillColor(17, 24, 39)
    doc.rect(0, 272, 210, 25, 'F')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    doc.text('Merci pour votre confiance', 20, 281)
    doc.text('zimvu.fr', 20, 288)

    if (siret) {
      doc.text(`SIRET : ${siret}`, 105, 281, { align: 'center' })
    }

    doc.setTextColor(99, 102, 241)
    doc.text(facture.numero || '', 190, 281, { align: 'right' })
    doc.setTextColor(156, 163, 175)
    doc.text(facture.date, 190, 288, { align: 'right' })

    doc.save(`facture-${facture.numero || facture.client}-${facture.date}.pdf`)
  }

  const factureSelectionnee = factures.find(f => f.id === menuOuvert)
  const facturesFiltrees = factures.filter(f => {
    const matchRecherche = f.client?.toLowerCase().includes(recherche.toLowerCase()) ||
      f.numero?.toLowerCase().includes(recherche.toLowerCase()) ||
      f.description?.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'Tous' || f.statut === filtreStatut
    return matchRecherche && matchStatut
  })

  const statuts = ['Tous', 'En attente', 'Payée', 'Annulée']

  return (
    <div className="min-h-screen bg-gray-100" onClick={() => setMenuOuvert(null)}>
      <Navbar pageCourante="/factures" />

      {menuOuvert && factureSelectionnee && (
        <div ref={menuRef} className="fixed bg-white rounded-2xl z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            top: menuPosition.top, left: menuPosition.left, minWidth: '180px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
          <div className="p-1">
            <button onClick={() => exporterPDF(factureSelectionnee)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center gap-3 transition-colors">
              <span>📄</span> Télécharger PDF
            </button>
            <div className="h-px bg-gray-100 mx-2" />
            <button onClick={() => { setConfirmSupprimer(factureSelectionnee); setMenuOuvert(null) }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
              <span>🗑️</span> Supprimer
            </button>
          </div>
        </div>
      )}

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-gray-700">Mes factures</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="🔍 Rechercher client, n°..."
              value={recherche} onChange={(e) => setRecherche(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
            <button onClick={() => router.push('/factures/nouvelle')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Nouvelle
            </button>
          </div>
        </div>

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
                  ({factures.filter(f => f.statut === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : facturesFiltrees.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">
              {recherche || filtreStatut !== 'Tous' ? 'Aucune facture trouvée' : 'Aucune facture pour le moment'}
            </p>
          ) : (
            <>
              <div className="md:hidden divide-y divide-gray-100">
                {facturesFiltrees.map((facture) => (
                  <div key={facture.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{facture.client}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">{Number(facture.montant).toFixed(2)} €</span>
                        <button onClick={(e) => ouvrirMenu(e, facture.id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-colors ${
                            menuOuvert === facture.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}>···</button>
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                        facture.statut === "Payée" ? "bg-green-100 text-green-700" :
                        facture.statut === "En attente" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{facture.statut}</span>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
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
                    {facturesFiltrees.map((facture) => (
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
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-75 ${
                              facture.statut === "Payée" ? "bg-green-100 text-green-700" :
                              facture.statut === "En attente" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>{facture.statut}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={(e) => ouvrirMenu(e, facture.id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg transition-colors ${
                              menuOuvert === facture.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
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
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default function Export() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth())
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear())
  const [donnees, setDonnees] = useState({ factures: [], frais: [] })

  const annees = [2024, 2025, 2026, 2027]

  useEffect(() => {
    fetchDonnees()
  }, [moisSelectionne, anneeSelectionnee])

  const fetchDonnees = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const debut = `${anneeSelectionnee}-${String(moisSelectionne + 1).padStart(2, '0')}-01`
    const fin = `${anneeSelectionnee}-${String(moisSelectionne + 1).padStart(2, '0')}-31`

    const { data: factures } = await supabase
      .from('factures')
      .select('*')
      .gte('date', debut)
      .lte('date', fin)
      .neq('statut', 'Annulée')
      .order('date')

    const { data: frais } = await supabase
      .from('notes_frais')
      .select('*')
      .gte('date', debut)
      .lte('date', fin)
      .order('date')

    setDonnees({ factures: factures || [], frais: frais || [] })
    setLoading(false)
  }

  const totalCA = donnees.factures.reduce((sum, f) => sum + Number(f.montant), 0)
  const totalFrais = donnees.frais.reduce((sum, f) => sum + Number(f.montant), 0)
  const netEstime = totalCA - totalFrais

  const exporterPDF = async () => {
    setExporting(true)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const periode = `${MOIS[moisSelectionne]} ${anneeSelectionnee}`

    // En-tête
    doc.setFontSize(24)
    doc.setTextColor(29, 78, 216)
    doc.text('Zimvu', 20, 25)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Export comptable mensuel', 20, 33)
    doc.setDrawColor(29, 78, 216)
    doc.setLineWidth(0.5)
    doc.line(20, 38, 190, 38)

    doc.setFontSize(16)
    doc.setTextColor(30, 30, 30)
    doc.text(`Rapport — ${periode}`, 20, 52)

    // Résumé
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text('Résumé', 20, 68)
    doc.setFillColor(245, 247, 250)
    doc.rect(20, 72, 170, 40, 'F')
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text('Chiffre d\'affaires', 25, 83)
    doc.setTextColor(29, 78, 216)
    doc.text(`${totalCA.toFixed(2)} €`, 155, 83)
    doc.setTextColor(60, 60, 60)
    doc.text('Total des frais', 25, 93)
    doc.setTextColor(239, 68, 68)
    doc.text(`- ${totalFrais.toFixed(2)} €`, 155, 93)
    doc.setTextColor(60, 60, 60)
    doc.text('Net estimé', 25, 103)
    doc.setTextColor(22, 163, 74)
    doc.text(`${netEstime.toFixed(2)} €`, 155, 103)

    // Factures
    let y = 122
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text(`Factures (${donnees.factures.length})`, 20, y)
    y += 6

    // En-tête tableau factures
    doc.setFillColor(29, 78, 216)
    doc.rect(20, y, 170, 8, 'F')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('Date', 25, y + 5.5)
    doc.text('Client', 55, y + 5.5)
    doc.text('Description', 95, y + 5.5)
    doc.text('Statut', 140, y + 5.5)
    doc.text('Montant', 165, y + 5.5)
    y += 10

    if (donnees.factures.length === 0) {
      doc.setTextColor(150, 150, 150)
      doc.text('Aucune facture ce mois-ci', 25, y)
      y += 8
    } else {
      donnees.factures.forEach((f, i) => {
        if (y > 260) { doc.addPage(); y = 20 }
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252)
          doc.rect(20, y - 3, 170, 8, 'F')
        }
        doc.setFontSize(8)
        doc.setTextColor(60, 60, 60)
        doc.text(f.date, 25, y + 2)
        doc.text(f.client.substring(0, 18), 55, y + 2)
        doc.text((f.description || '').substring(0, 22), 95, y + 2)
        doc.text(f.statut, 140, y + 2)
        doc.setTextColor(29, 78, 216)
        doc.text(`${Number(f.montant).toFixed(2)} €`, 165, y + 2)
        y += 8
      })

      // Total factures
      doc.setFillColor(29, 78, 216)
      doc.rect(20, y, 170, 8, 'F')
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text('TOTAL CA', 25, y + 5.5)
      doc.text(`${totalCA.toFixed(2)} €`, 165, y + 5.5)
      y += 12
    }

    // Frais
    y += 4
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text(`Notes de frais (${donnees.frais.length})`, 20, y)
    y += 6

    // En-tête tableau frais
    doc.setFillColor(239, 68, 68)
    doc.rect(20, y, 170, 8, 'F')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('Date', 25, y + 5.5)
    doc.text('Catégorie', 55, y + 5.5)
    doc.text('Description', 100, y + 5.5)
    doc.text('Montant', 165, y + 5.5)
    y += 10

    if (donnees.frais.length === 0) {
      doc.setTextColor(150, 150, 150)
      doc.text('Aucune note de frais ce mois-ci', 25, y)
    } else {
      donnees.frais.forEach((f, i) => {
        if (y > 260) { doc.addPage(); y = 20 }
        if (i % 2 === 0) {
          doc.setFillColor(255, 248, 248)
          doc.rect(20, y - 3, 170, 8, 'F')
        }
        doc.setFontSize(8)
        doc.setTextColor(60, 60, 60)
        doc.text(f.date, 25, y + 2)
        doc.text(f.categorie, 55, y + 2)
        doc.text((f.description || '').substring(0, 25), 100, y + 2)
        doc.setTextColor(239, 68, 68)
        doc.text(`- ${Number(f.montant).toFixed(2)} €`, 165, y + 2)
        y += 8
      })

      // Total frais
      doc.setFillColor(239, 68, 68)
      doc.rect(20, y, 170, 8, 'F')
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text('TOTAL FRAIS', 25, y + 5.5)
      doc.text(`- ${totalFrais.toFixed(2)} €`, 165, y + 5.5)
      y += 12
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} — Zimvu.vercel.app`, 20, 285)

    doc.save(`zimvu-export-${MOIS[moisSelectionne].toLowerCase()}-${anneeSelectionnee}.pdf`)
    setExporting(false)
  }

  const exporterExcel = async () => {
    setExporting(true)
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const periode = `${MOIS[moisSelectionne]} ${anneeSelectionnee}`

    // ── Feuille Résumé ──
    const wsResume = XLSX.utils.aoa_to_sheet([
      ['RAPPORT ZIMVU', periode],
      ['Généré le', new Date().toLocaleDateString('fr-FR')],
      [],
      ['RÉCAPITULATIF', ''],
      ['Chiffre d\'affaires', totalCA],
      ['Total des frais', totalFrais],
      ['Net estimé', netEstime],
      [],
      ['Nombre de factures', donnees.factures.length],
      ['Nombre de notes de frais', donnees.frais.length],
    ])

    // Largeurs colonnes
    wsResume['!cols'] = [{ wch: 30 }, { wch: 20 }]

    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé')

    // ── Feuille Factures ──
    const facturesRows = [
      ['Date', 'Client', 'Description', 'Statut', 'Montant (€)'],
      ...donnees.factures.map(f => [
        f.date,
        f.client,
        f.description || '',
        f.statut,
        Number(f.montant)
      ]),
      [],
      ['', '', '', 'TOTAL CA', totalCA],
    ]

    const wsFactures = XLSX.utils.aoa_to_sheet(facturesRows)
    wsFactures['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
    ]
    XLSX.utils.book_append_sheet(wb, wsFactures, 'Factures')

    // ── Feuille Frais ──
    const fraisRows = [
      ['Date', 'Catégorie', 'Description', 'Statut', 'Montant (€)'],
      ...donnees.frais.map(f => [
        f.date,
        f.categorie,
        f.description || '',
        f.statut,
        Number(f.montant)
      ]),
      [],
      ['', '', '', 'TOTAL FRAIS', totalFrais],
    ]

    const wsFrais = XLSX.utils.aoa_to_sheet(fraisRows)
    wsFrais['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
    ]
    XLSX.utils.book_append_sheet(wb, wsFrais, 'Notes de frais')

    XLSX.writeFile(wb, `zimvu-export-${MOIS[moisSelectionne].toLowerCase()}-${anneeSelectionnee}.xlsx`)
    setExporting(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/export" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Export comptable</h2>

        {/* Sélecteur période */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Sélectionner la période</h3>
          <div className="flex gap-4 flex-wrap">
            <select
              value={moisSelectionne}
              onChange={(e) => setMoisSelectionne(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {MOIS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={anneeSelectionnee}
              onChange={(e) => setAnneeSelectionnee(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {annees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {!loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm mb-1">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-blue-700">{totalCA.toFixed(2)} €</p>
                <p className="text-xs text-gray-400 mt-1">{donnees.factures.length} facture(s)</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm mb-1">Total frais</p>
                <p className="text-2xl font-bold text-red-500">{totalFrais.toFixed(2)} €</p>
                <p className="text-xs text-gray-400 mt-1">{donnees.frais.length} note(s)</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm mb-1">Net estimé</p>
                <p className={`text-2xl font-bold ${netEstime >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {netEstime.toFixed(2)} €
                </p>
                <p className="text-xs text-gray-400 mt-1">CA - Frais</p>
              </div>
            </div>

            {/* Boutons export */}
            <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">
                Exporter — {MOIS[moisSelectionne]} {anneeSelectionnee}
              </h3>
              <div className="flex gap-3 flex-wrap">
                <button onClick={exporterPDF} disabled={exporting}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold">
                  📄 {exporting ? 'Export...' : 'Exporter en PDF'}
                </button>
                <button onClick={exporterExcel} disabled={exporting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold">
                  📊 {exporting ? 'Export...' : 'Exporter en Excel'}
                </button>
              </div>
            </div>

            {/* Aperçu factures */}
            <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Factures ({donnees.factures.length}) — hors annulées
              </h3>
              {donnees.factures.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune facture ce mois-ci</p>
              ) : (
                <div className="space-y-2">
                  {donnees.factures.map(f => (
                    <div key={f.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{f.client}</span>
                        <span className="text-gray-400 text-xs ml-2">{f.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          f.statut === 'Payée' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{f.statut}</span>
                        <span className="font-semibold text-blue-700 text-sm">{Number(f.montant).toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aperçu frais */}
            <div className="bg-white rounded-2xl shadow p-4 md:p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Notes de frais ({donnees.frais.length})
              </h3>
              {donnees.frais.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune note de frais ce mois-ci</p>
              ) : (
                <div className="space-y-2">
                  {donnees.frais.map(f => (
                    <div key={f.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{f.categorie}</span>
                        <span className="text-gray-400 text-xs ml-2">{f.description}</span>
                      </div>
                      <span className="font-semibold text-red-500 text-sm">- {Number(f.montant).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Chargement...</p>
          </div>
        )}
      </div>
    </div>
  )
}
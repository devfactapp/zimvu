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

  const totalCA = donnees.factures
    .filter(f => f.statut !== 'Annulée')
    .reduce((sum, f) => sum + Number(f.montant), 0)

  const totalFrais = donnees.frais
    .reduce((sum, f) => sum + Number(f.montant), 0)

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
    y += 8

    if (donnees.factures.length === 0) {
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text('Aucune facture ce mois-ci', 25, y)
      y += 8
    } else {
      donnees.factures.forEach(f => {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        doc.text(f.date, 25, y)
        doc.text(f.client, 55, y)
        doc.text(f.statut, 120, y)
        doc.setTextColor(29, 78, 216)
        doc.text(`${Number(f.montant).toFixed(2)} €`, 165, y)
        y += 8
      })
    }

    // Frais
    y += 8
    doc.setFontSize(12)
    doc.setTextColor(30, 30, 30)
    doc.text(`Notes de frais (${donnees.frais.length})`, 20, y)
    y += 8

    if (donnees.frais.length === 0) {
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text('Aucune note de frais ce mois-ci', 25, y)
    } else {
      donnees.frais.forEach(f => {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        doc.text(f.date, 25, y)
        doc.text(f.categorie, 55, y)
        doc.text(f.description || '', 100, y)
        doc.setTextColor(239, 68, 68)
        doc.text(`- ${Number(f.montant).toFixed(2)} €`, 165, y)
        y += 8
      })
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

    // Feuille Résumé
    const resume = [
      ['Rapport Zimvu', `${MOIS[moisSelectionne]} ${anneeSelectionnee}`],
      [],
      ['Chiffre d\'affaires', totalCA.toFixed(2) + ' €'],
      ['Total frais', totalFrais.toFixed(2) + ' €'],
      ['Net estimé', netEstime.toFixed(2) + ' €'],
    ]
    const wsResume = XLSX.utils.aoa_to_sheet(resume)
    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé')

    // Feuille Factures
    const facturesData = [
      ['Date', 'Client', 'Description', 'Statut', 'Montant (€)'],
      ...donnees.factures.map(f => [f.date, f.client, f.description || '', f.statut, Number(f.montant)])
    ]
    const wsFactures = XLSX.utils.aoa_to_sheet(facturesData)
    XLSX.utils.book_append_sheet(wb, wsFactures, 'Factures')

    // Feuille Frais
    const fraisData = [
      ['Date', 'Catégorie', 'Description', 'Statut', 'Montant (€)'],
      ...donnees.frais.map(f => [f.date, f.categorie, f.description || '', f.statut, Number(f.montant)])
    ]
    const wsFrais = XLSX.utils.aoa_to_sheet(fraisData)
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

        {/* Résumé */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm mb-1">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-blue-700">{totalCA.toFixed(2)} €</p>
                <p className="text-xs text-gray-400 mt-1">{donnees.factures.filter(f => f.statut !== 'Annulée').length} facture(s)</p>
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
                <button
                  onClick={exporterPDF}
                  disabled={exporting}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                  📄 {exporting ? 'Export...' : 'Exporter en PDF'}
                </button>
                <button
                  onClick={exporterExcel}
                  disabled={exporting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                  📊 {exporting ? 'Export...' : 'Exporter en Excel'}
                </button>
              </div>
            </div>

            {/* Aperçu factures */}
            <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Factures ({donnees.factures.length})
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
                          f.statut === 'Payée' ? 'bg-green-100 text-green-700' :
                          f.statut === 'Annulée' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
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
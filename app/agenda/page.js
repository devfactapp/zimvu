'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const TYPES = [
  { label: 'Échéance facture', emoji: '💰', couleur: 'bg-blue-100 text-blue-700' },
  { label: 'Relance client', emoji: '📧', couleur: 'bg-yellow-100 text-yellow-700' },
  { label: 'Rendez-vous', emoji: '🤝', couleur: 'bg-purple-100 text-purple-700' },
  { label: 'Tâche', emoji: '✅', couleur: 'bg-gray-100 text-gray-700' },
  { label: 'Déclaration URSSAF', emoji: '🏛️', couleur: 'bg-red-100 text-red-700' },
]

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function Agenda() {
  const router = useRouter()
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmSupprimer, setConfirmSupprimer] = useState(null)
  const [moisActuel, setMoisActuel] = useState(new Date().getMonth())
  const [anneeActuelle, setAnneeActuelle] = useState(new Date().getFullYear())
  const [jourSelectionne, setJourSelectionne] = useState(null)
  const [form, setForm] = useState({
    titre: '',
    type: 'Tâche',
    date: new Date().toISOString().split('T')[0],
    description: '',
    statut: 'À faire',
  })

  const fetchEvenements = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { data } = await supabase
      .from('agenda')
      .select('*')
      .order('date')

    setEvenements(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchEvenements()
  }, [fetchEvenements])

  const ajouterEvenement = async () => {
    if (!form.titre || !form.date) {
      alert('Merci de remplir le titre et la date')
      return
    }
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('agenda').insert([{
      user_id: session.user.id,
      titre: form.titre,
      type: form.type,
      date: form.date,
      description: form.description,
      statut: form.statut,
    }])

    setForm({
      titre: '',
      type: 'Tâche',
      date: new Date().toISOString().split('T')[0],
      description: '',
      statut: 'À faire',
    })
    setShowForm(false)
    setSaving(false)
    await fetchEvenements()
  }

  const toggleStatut = async (id, statut) => {
    const nouveau = statut === 'À faire' ? 'Fait' : 'À faire'
    await supabase.from('agenda').update({ statut: nouveau }).eq('id', id)
    setEvenements(prev => prev.map(e => e.id === id ? { ...e, statut: nouveau } : e))
  }

  const supprimerEvenement = async (id) => {
    await supabase.from('agenda').delete().eq('id', id)
    setConfirmSupprimer(null)
    await fetchEvenements()
  }

  // Génération calendrier
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const joursCalendrier = () => {
    const nbJours = getDaysInMonth(moisActuel, anneeActuelle)
    const premierJour = getFirstDayOfMonth(moisActuel, anneeActuelle)
    const jours = []

    for (let i = 0; i < premierJour; i++) jours.push(null)
    for (let i = 1; i <= nbJours; i++) jours.push(i)
    return jours
  }

  const getEvenementsJour = (jour) => {
    if (!jour) return []
    const dateStr = `${anneeActuelle}-${String(moisActuel + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`
    return evenements.filter(e => e.date === dateStr)
  }

  const getEmoji = (type) => TYPES.find(t => t.label === type)?.emoji || '📌'
  const getCouleur = (type) => TYPES.find(t => t.label === type)?.couleur || 'bg-gray-100 text-gray-700'

  const aujourdhui = new Date()
  const estAujourdhui = (jour) => {
    return jour === aujourdhui.getDate() &&
      moisActuel === aujourdhui.getMonth() &&
      anneeActuelle === aujourdhui.getFullYear()
  }

  // Événements du mois
  const evenementsMois = evenements.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === moisActuel && d.getFullYear() === anneeActuelle
  })

  // Événements à venir (30 jours)
  const dans30jours = new Date()
  dans30jours.setDate(dans30jours.getDate() + 30)
  const evenementsAVenir = evenements.filter(e => {
    const d = new Date(e.date)
    return d >= aujourdhui && d <= dans30jours && e.statut === 'À faire'
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  const jourSelectionnéEvenements = jourSelectionne ? getEvenementsJour(jourSelectionne) : []

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/agenda" />

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmSupprimer && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer cet événement ?</h3>
            <p className="text-gray-500 text-sm mb-6"><strong>{confirmSupprimer.titre}</strong> sera supprimé définitivement.</p>
            <div className="flex gap-3">
              <button onClick={() => supprimerEvenement(confirmSupprimer.id)}
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

      {/* MODAL JOUR SÉLECTIONNÉ */}
      {jourSelectionne && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {jourSelectionne} {MOIS[moisActuel]} {anneeActuelle}
              </h3>
              <span onClick={() => setJourSelectionne(null)} className="text-gray-400 cursor-pointer hover:text-gray-600 text-xl">✕</span>
            </div>

            {jourSelectionnéEvenements.length === 0 ? (
              <p className="text-gray-400 text-sm mb-4">Aucun événement ce jour</p>
            ) : (
              <div className="space-y-3 mb-4">
                {jourSelectionnéEvenements.map(e => (
                  <div key={e.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{getEmoji(e.type)}</span>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${e.statut === 'Fait' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {e.titre}
                      </p>
                      {e.description && <p className="text-gray-500 text-xs mt-0.5">{e.description}</p>}
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getCouleur(e.type)}`}>
                        {e.type}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => toggleStatut(e.id, e.statut)}
                        className={`text-xs px-2 py-1 rounded-lg ${e.statut === 'Fait' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {e.statut === 'Fait' ? 'Refaire' : '✓ Fait'}
                      </button>
                      <button onClick={() => { setConfirmSupprimer(e); setJourSelectionne(null) }}
                        className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-600">
                        Suppr.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                const dateStr = `${anneeActuelle}-${String(moisActuel + 1).padStart(2, '0')}-${String(jourSelectionne).padStart(2, '0')}`
                setForm({ ...form, date: dateStr })
                setJourSelectionne(null)
                setShowForm(true)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
              + Ajouter un événement ce jour
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Agenda</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Ajouter
          </button>
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Nouvel événement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  placeholder="Ex: Relancer M. Dupont"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {TYPES.map(t => (
                    <option key={t.label} value={t.label}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" placeholder="Détails optionnels..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={ajouterEvenement} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm">
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CALENDRIER */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 md:p-6">
            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (moisActuel === 0) { setMoisActuel(11); setAnneeActuelle(a => a - 1) }
                  else setMoisActuel(m => m - 1)
                }}
                className="text-gray-500 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                ←
              </button>
              <h3 className="font-semibold text-gray-800">{MOIS[moisActuel]} {anneeActuelle}</h3>
              <button
                onClick={() => {
                  if (moisActuel === 11) { setMoisActuel(0); setAnneeActuelle(a => a + 1) }
                  else setMoisActuel(m => m + 1)
                }}
                className="text-gray-500 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                →
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 mb-2">
              {JOURS.map(j => (
                <div key={j} className="text-center text-xs font-semibold text-gray-400 py-2">{j}</div>
              ))}
            </div>

            {/* Cases du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {joursCalendrier().map((jour, i) => {
                const evJour = getEvenementsJour(jour)
                return (
                  <div
                    key={i}
                    onClick={() => jour && setJourSelectionne(jour)}
                    className={`min-h-12 p-1 rounded-lg text-sm cursor-pointer transition-colors ${
                      !jour ? 'cursor-default' :
                      estAujourdhui(jour) ? 'bg-blue-600 text-white font-bold' :
                      evJour.length > 0 ? 'bg-blue-50 hover:bg-blue-100' :
                      'hover:bg-gray-50'
                    }`}>
                    {jour && (
                      <>
                        <div className={`text-center text-xs mb-1 ${estAujourdhui(jour) ? 'text-white' : 'text-gray-700'}`}>
                          {jour}
                        </div>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {evJour.slice(0, 2).map((e, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          ))}
                          {evJour.length > 2 && (
                            <span className="text-xs text-blue-600">+{evJour.length - 2}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SIDEBAR — À venir */}
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <h3 className="font-semibold text-gray-700 mb-4">📅 À venir (30 jours)</h3>
            {evenementsAVenir.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun événement à venir</p>
            ) : (
              <div className="space-y-3">
                {evenementsAVenir.map(e => (
                  <div key={e.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg">{getEmoji(e.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{e.titre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(e.date).toLocaleDateString('fr-FR')}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getCouleur(e.type)}`}>
                        {e.type}
                      </span>
                    </div>
                    <button onClick={() => toggleStatut(e.id, e.statut)}
                      className="text-green-600 hover:text-green-700 text-xs font-medium shrink-0">
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Résumé mois */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">CE MOIS-CI</p>
              <p className="text-sm text-gray-600">{evenementsMois.length} événement(s)</p>
              <p className="text-sm text-green-600">{evenementsMois.filter(e => e.statut === 'Fait').length} terminé(s)</p>
              <p className="text-sm text-yellow-600">{evenementsMois.filter(e => e.statut === 'À faire').length} à faire</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import { getUserPlan } from '../utils/planUtils'

const CATEGORIES = [
  { label: 'Transport', emoji: '🚗' },
  { label: 'Repas', emoji: '🍽️' },
  { label: 'Materiel', emoji: '💻' },
  { label: 'Logiciel', emoji: '📱' },
  { label: 'Formation', emoji: '📚' },
  { label: 'Bureau', emoji: '🏢' },
  { label: 'Communication', emoji: '📞' },
  { label: 'Autre', emoji: '📦' },
]

export default function NotesFrais() {
  const router = useRouter()
  const [frais, setFrais] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmSupprimer, setConfirmSupprimer] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [planInfo, setPlanInfo] = useState({ plan: 'gratuit', joursRestants: 0 })
  const [form, setForm] = useState({
    categorie: 'Transport',
    description: '',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    statut: 'En attente',
  })

  const fetchFrais = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const plan = await getUserPlan(supabase, session.user.id)
    setPlanInfo(plan)

    const { data } = await supabase
      .from('notes_frais')
      .select('*')
      .order('date', { ascending: false })

    setFrais(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchFrais()
  }, [fetchFrais])

  const isPlanGratuit = planInfo.plan === 'gratuit'

  const ajouterFrais = async () => {
    if (isPlanGratuit) return
    if (!form.montant || !form.date || !form.categorie) {
      alert('Merci de remplir les champs obligatoires')
      return
    }
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('notes_frais').insert([{
      user_id: session.user.id,
      categorie: form.categorie,
      description: form.description,
      montant: parseFloat(form.montant),
      date: form.date,
      statut: form.statut,
    }])

    setForm({
      categorie: 'Transport',
      description: '',
      montant: '',
      date: new Date().toISOString().split('T')[0],
      statut: 'En attente',
    })
    setShowForm(false)
    setSaving(false)
    await fetchFrais()
  }

  const changerStatut = async (id, statutActuel) => {
    const nouveauStatut = statutActuel === 'En attente' ? 'Remboursé' : 'En attente'
    await supabase.from('notes_frais').update({ statut: nouveauStatut }).eq('id', id)
    setFrais(prev => prev.map(f => f.id === id ? { ...f, statut: nouveauStatut } : f))
  }

  const supprimerFrais = async (id) => {
    await supabase.from('notes_frais').delete().eq('id', id)
    setConfirmSupprimer(null)
    await fetchFrais()
  }

  const totalGeneral = frais.reduce((sum, f) => sum + Number(f.montant), 0)
  const statsCat = CATEGORIES.map(cat => ({
    ...cat,
    total: frais.filter(f => f.categorie === cat.label).reduce((sum, f) => sum + Number(f.montant), 0)
  })).filter(c => c.total > 0)

  const getEmoji = (cat) => CATEGORIES.find(c => c.label === cat)?.emoji || '📦'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/frais" />

      {confirmSupprimer && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer cette note ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              La note de <strong>{confirmSupprimer.montant} euros</strong> ({confirmSupprimer.categorie}) sera supprimee definitivement.
            </p>
            <div className="flex gap-3">
              <button onClick={() => supprimerFrais(confirmSupprimer.id)}
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
          <h2 className="text-xl font-semibold text-gray-700">Notes de frais</h2>
          {!isPlanGratuit && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Ajouter
            </button>
          )}
        </div>

        {/* Blocage plan gratuit */}
        {isPlanGratuit && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">Fonctionnalite Pro</h3>
            <p className="text-orange-600 text-sm mb-4">
              Les notes de frais sont disponibles avec le plan Pro.
            </p>
            <button onClick={() => router.push('/profil')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm">
              Passer au Pro — 9 euros/mois
            </button>
          </div>
        )}

        {!isPlanGratuit && (
          <>
            {statsCat.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {statsCat.map(cat => (
                    <div key={cat.label} className="bg-white rounded-2xl shadow p-4">
                      <p className="text-gray-500 text-xs mb-1">{cat.emoji} {cat.label}</p>
                      <p className="text-lg font-bold text-blue-700">{cat.total.toFixed(2)} euros</p>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-600 rounded-2xl p-4 text-white flex justify-between items-center">
                  <span className="font-semibold">Total des frais</span>
                  <span className="text-2xl font-bold">{totalGeneral.toFixed(2)} euros</span>
                </div>
              </div>
            )}

            {showForm && (
              <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Nouvelle note de frais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                    <select value={form.categorie}
                      onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {CATEGORIES.map(c => (
                        <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant (euros) *</label>
                    <input type="number" placeholder="0.00"
                      value={form.montant}
                      onChange={(e) => setForm({ ...form, montant: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input type="date" value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select value={form.statut}
                      onChange={(e) => setForm({ ...form, statut: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="En attente">En attente</option>
                      <option value="Remboursé">Rembourse</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" placeholder="Ex: Billet de train Paris-Lyon"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={ajouterFrais} disabled={saving}
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

            <div className="bg-white rounded-2xl shadow overflow-hidden">
              {loading ? (
                <p className="text-gray-400 text-sm p-6">Chargement...</p>
              ) : frais.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm mb-4">Aucune note de frais pour le moment</p>
                  <button onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                    Ajouter ma premiere note
                  </button>
                </div>
              ) : (
                <>
                  <div className="md:hidden divide-y divide-gray-100">
                    {frais.map((f) => (
                      <div key={f.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800">{getEmoji(f.categorie)} {f.categorie}</span>
                          <span className="font-bold text-blue-700">{f.montant} euros</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">{f.description}</p>
                        <p className="text-gray-400 text-xs mb-3">{f.date}</p>
                        <div className="flex items-center justify-between">
                          <span onClick={() => changerStatut(f.id, f.statut)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                              f.statut === 'Remboursé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {f.statut}
                          </span>
                          <span onClick={() => setConfirmSupprimer(f)} className="text-red-500 cursor-pointer text-sm">Supprimer</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Categorie</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Montant</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {frais.map((f) => (
                          <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-800">{getEmoji(f.categorie)} {f.categorie}</td>
                            <td className="px-6 py-4 text-gray-600">{f.description}</td>
                            <td className="px-6 py-4 text-gray-600">{f.date}</td>
                            <td className="px-6 py-4 font-semibold text-blue-700">{f.montant} euros</td>
                            <td className="px-6 py-4">
                              <span onClick={() => changerStatut(f.id, f.statut)}
                                title="Cliquer pour changer le statut"
                                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-75 ${
                                  f.statut === 'Remboursé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {f.statut}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span onClick={() => setConfirmSupprimer(f)} className="text-red-500 cursor-pointer hover:underline text-sm">Supprimer</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
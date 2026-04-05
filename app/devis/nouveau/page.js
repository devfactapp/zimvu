'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import Navbar from '../../components/Navbar'
import { getUserPlan } from '../../utils/planUtils'

const TAUX_TVA = [
  { label: 'Sans TVA (auto-entrepreneur)', value: 0 },
  { label: '5,5% — Taux réduit', value: 5.5 },
  { label: '10% — Taux intermédiaire', value: 10 },
  { label: '20% — Taux normal', value: 20 },
]

export default function NouveauDevis() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [saving, setSaving] = useState(false)
  const [limitAtteinte, setLimitAtteinte] = useState(false)
  const [nbDevis, setNbDevis] = useState(0)
  const [plan, setPlan] = useState({ plan: 'gratuit', joursRestants: 0 })
  const [form, setForm] = useState({
    client: '',
    email: '',
    description: '',
    montant_ht: '',
    tva_taux: 0,
    date: new Date().toISOString().split('T')[0],
    date_validite: '',
    statut: 'Brouillon',
  })

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data } = await supabase.from('clients').select('*').order('nom')
      setClients(data || [])

      const planInfo = await getUserPlan(supabase, session.user.id)
      setPlan(planInfo)

      const maintenant = new Date()
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString()

      const { data: devisData } = await supabase
        .from('devis')
        .select('id, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', debutMois)

      const nb = devisData?.length || 0
      setNbDevis(nb)

      const isAdmin = session.user.email === 'devfact.app@gmail.com'
      const isTrial = planInfo.plan === 'trial'

      if (nb >= 3 && !isAdmin && !isTrial) {
        setLimitAtteinte(true)
      }
    }
    fetchClients()
  }, [])

  const handleClientChange = (e) => {
    const nomClient = e.target.value
    const clientTrouve = clients.find(c => c.nom === nomClient)
    setForm({ ...form, client: nomClient, email: clientTrouve?.email || '' })
  }

  const montantHT = parseFloat(form.montant_ht) || 0
  const tauxTVA = parseFloat(form.tva_taux) || 0
  const montantTVA = (montantHT * tauxTVA) / 100
  const montantTTC = montantHT + montantTVA

  const handleSubmit = async () => {
    if (limitAtteinte) {
      router.push('/profil')
      return
    }
    if (!form.client || !form.montant_ht || !form.date) {
      alert('Merci de remplir les champs obligatoires (client, montant, date)')
      return
    }
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch('/api/devis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        userEmail: session.user.email,
        devisData: {
          client: form.client,
          email: form.email,
          description: form.description,
          montant_ht: montantHT,
          tva_taux: tauxTVA,
          montant_tva: montantTVA,
          montant: montantTTC,
          date: form.date,
          date_validite: form.date_validite || null,
          statut: form.statut,
        }
      }),
    })

    const data = await response.json()

    if (data.error === 'LIMITE_ATTEINTE') {
      setLimitAtteinte(true)
    } else if (!data.error) {
      router.push('/devis')
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/devis" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => router.push('/devis')}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1">
          Retour aux devis
        </button>

        <h2 className="text-xl font-semibold text-gray-700 mb-6">Nouveau devis</h2>

        {plan.plan === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <p className="text-blue-700 text-sm">
              Essai Pro — <strong>Devis illimites</strong> · {plan.joursRestants} jour{plan.joursRestants > 1 ? 's' : ''} restant{plan.joursRestants > 1 ? 's' : ''}
            </p>
            <span onClick={() => router.push('/profil')}
              className="text-blue-600 text-xs cursor-pointer hover:underline font-medium">
              Passer au Pro
            </span>
          </div>
        )}

        {limitAtteinte && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">Limite du plan gratuit atteinte</h3>
            <p className="text-orange-600 text-sm mb-4">
              Vous avez utilise vos <strong>3 devis ce mois-ci</strong>. Passez au plan Pro pour creer des devis illimites.
            </p>
            <button onClick={() => router.push('/profil')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm">
              Passer au Pro — 9 euros/mois
            </button>
          </div>
        )}

        {!limitAtteinte && plan.plan === 'gratuit' && (
          <div className="bg-blue-50 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <p className="text-blue-700 text-sm">
              Plan gratuit : <strong>{nbDevis}/3 devis</strong> ce mois-ci
            </p>
            <span onClick={() => router.push('/profil')}
              className="text-blue-600 text-xs cursor-pointer hover:underline font-medium">
              Passer au Pro
            </span>
          </div>
        )}

        <div className={`bg-white rounded-2xl shadow p-6 space-y-4 ${limitAtteinte ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <input list="liste-clients" placeholder="Nom du client"
              value={form.client} onChange={handleClientChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="liste-clients">
              {clients.map(c => <option key={c.id} value={c.nom} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email client</label>
            <input type="email" placeholder="email@client.fr"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea placeholder="Decrivez la prestation..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (euros) *</label>
              <input type="number" placeholder="0.00" step="0.01"
                value={form.montant_ht}
                onChange={(e) => setForm({ ...form, montant_ht: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux TVA</label>
              <select value={form.tva_taux}
                onChange={(e) => setForm({ ...form, tva_taux: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {TAUX_TVA.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {montantHT > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Recapitulatif</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant HT</span>
                <span className="font-medium text-gray-800">{montantHT.toFixed(2)} euros</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA ({tauxTVA}%)</span>
                <span className="font-medium text-gray-800">{montantTVA.toFixed(2)} euros</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-700">Total TTC</span>
                <span className="text-blue-700 text-lg">{montantTTC.toFixed(2)} euros</span>
              </div>
              {tauxTVA === 0 && (
                <p className="text-xs text-gray-400 italic">
                  TVA non applicable — article 293 B du CGI
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du devis *</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de validite</label>
              <input type="date" value={form.date_validite}
                onChange={(e) => setForm({ ...form, date_validite: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="Brouillon">Brouillon</option>
              <option value="Envoyé">Envoye</option>
              <option value="Accepté">Accepte</option>
              <option value="Refusé">Refuse</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={saving || limitAtteinte}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg text-sm">
              {saving ? 'Enregistrement...' : 'Enregistrer le devis'}
            </button>
            <button onClick={() => router.push('/devis')}
              className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
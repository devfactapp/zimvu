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

export default function NouvelleFacture() {
  const router = useRouter()
  const [facture, setFacture] = useState({
    client: '',
    email: '',
    description: '',
    montant_ht: '',
    tva_taux: 0,
    date: new Date().toISOString().split('T')[0],
  })
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitAtteinte, setLimitAtteinte] = useState(false)
  const [nbFactures, setNbFactures] = useState(0)
  const [plan, setPlan] = useState({ plan: 'gratuit', joursRestants: 0 })

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data: clientsData } = await supabase.from('clients').select('*').order('nom')
      setClients(clientsData || [])

      const planInfo = await getUserPlan(supabase, session.user.id)
      setPlan(planInfo)

      const maintenant = new Date()
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString()

      const { data: factures } = await supabase
        .from('factures')
        .select('id, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', debutMois)

      const nb = factures?.length || 0
      setNbFactures(nb)

      const isAdmin = session.user.email === 'devfact.app@gmail.com'
      const isTrial = planInfo.plan === 'trial'

      if (nb >= 3 && !isAdmin && !isTrial) {
        setLimitAtteinte(true)
      }
    }
    fetchClients()
  }, [])

  const handleChange = (e) => {
    setFacture({ ...facture, [e.target.name]: e.target.value })
  }

  const handleClientChange = (e) => {
    const nomClient = e.target.value
    const clientTrouve = clients.find(c => c.nom === nomClient)
    setFacture({ ...facture, client: nomClient, email: clientTrouve?.email || facture.email })
  }

  const montantHT = parseFloat(facture.montant_ht) || 0
  const tauxTVA = parseFloat(facture.tva_taux) || 0
  const montantTVA = (montantHT * tauxTVA) / 100
  const montantTTC = montantHT + montantTVA

  const creerFacture = async () => {
    if (limitAtteinte) {
      router.push('/profil')
      return
    }
    if (!facture.client || !facture.montant_ht || !facture.date) {
      setError('Veuillez remplir les champs obligatoires')
      return
    }
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const response = await fetch('/api/factures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        userEmail: session.user.email,
        factureData: {
          client: facture.client,
          email: facture.email,
          description: facture.description,
          montant_ht: montantHT,
          tva_taux: tauxTVA,
          montant_tva: montantTVA,
          montant: montantTTC,
          date: facture.date,
          statut: 'En attente',
        }
      }),
    })

    const data = await response.json()

    if (data.error === 'LIMITE_ATTEINTE') {
      setLimitAtteinte(true)
      setError('Limite de 3 factures atteinte ce mois-ci.')
    } else if (data.error) {
      setError('Erreur lors de la creation')
    } else {
      router.push('/factures')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/factures" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Nouvelle facture</h2>
          <button onClick={() => router.push('/factures')} className="text-gray-500 hover:text-gray-700 text-sm">← Retour</button>
        </div>

        {plan.plan === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <p className="text-blue-700 text-sm">
              ⭐ Essai Pro — <strong>Factures illimitées</strong> · {plan.joursRestants} jour{plan.joursRestants > 1 ? 's' : ''} restant{plan.joursRestants > 1 ? 's' : ''}
            </p>
            <span onClick={() => router.push('/profil')}
              className="text-blue-600 text-xs cursor-pointer hover:underline font-medium">
              Passer au Pro →
            </span>
          </div>
        )}

        {limitAtteinte && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-orange-700 mb-2">Limite du plan gratuit atteinte</h3>
            <p className="text-orange-600 text-sm mb-4">
              Vous avez utilisé vos <strong>3 factures gratuites</strong>. Passez au plan Pro pour créer des factures illimitées.
            </p>
            <button onClick={() => router.push('/profil')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm">
              🚀 Passer au Pro — 9€/mois
            </button>
          </div>
        )}

        {!limitAtteinte && plan.plan === 'gratuit' && (
          <div className="bg-blue-50 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <p className="text-blue-700 text-sm">
              Plan gratuit : <strong>{nbFactures}/3 factures</strong> utilisées
            </p>
            <span onClick={() => router.push('/profil')}
              className="text-blue-600 text-xs cursor-pointer hover:underline font-medium">
              Passer au Pro →
            </span>
          </div>
        )}

        <div className={`bg-white rounded-2xl shadow p-8 space-y-6 ${limitAtteinte ? 'opacity-50 pointer-events-none' : ''}`}>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nom du client *</label>
                <input
                  list="liste-clients"
                  name="client"
                  value={facture.client}
                  onChange={handleClientChange}
                  placeholder="Jean Dupont"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="liste-clients">
                  {clients.map(c => <option key={c.id} value={c.nom} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email client</label>
                <input name="email" value={facture.email} onChange={handleChange} placeholder="jean@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Détails de la prestation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea name="description" value={facture.description} onChange={handleChange}
                  placeholder="Description de la prestation..." rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Montant HT (€) *</label>
                  <input name="montant_ht" value={facture.montant_ht} onChange={handleChange}
                    placeholder="0.00" type="number" step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Taux TVA</label>
                  <select name="tva_taux" value={facture.tva_taux} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {TAUX_TVA.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date *</label>
                  <input name="date" value={facture.date} onChange={handleChange} type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {montantHT > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Récapitulatif</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant HT</span>
                <span className="font-medium text-gray-800">{montantHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA ({tauxTVA}%)</span>
                <span className="font-medium text-gray-800">{montantTVA.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-700">Total TTC</span>
                <span className="text-blue-700 text-lg">{montantTTC.toFixed(2)} €</span>
              </div>
              {tauxTVA === 0 && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  TVA non applicable — article 293 B du CGI
                </p>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button onClick={() => router.push('/factures')}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button onClick={creerFacture} disabled={loading || limitAtteinte}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg">
              {loading ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
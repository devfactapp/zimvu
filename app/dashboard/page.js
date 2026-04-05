'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import { getUserPlan } from '../utils/planUtils'

const MOIS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState({ plan: 'gratuit', joursRestants: 0 })
  const [stats, setStats] = useState({
    chiffreAffaires: 0,
    facturesEnvoyees: 0,
    facturesEnAttente: 0,
    nombreClients: 0,
  })
  const [dernieresFactures, setDernieresFactures] = useState([])
  const [dataGraphique, setDataGraphique] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)

      const { data: profilData } = await supabase
        .from('profils')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfil(profilData)

      // Détecter nouvel utilisateur Google OAuth
      const isGoogle = session.user.app_metadata?.provider === 'google'
      const createdAt = new Date(session.user.created_at)
      const maintenant = new Date()
      const diffMinutes = (maintenant - createdAt) / 1000 / 60
      const isNouvelUtilisateur = diffMinutes < 5

      if (isGoogle && isNouvelUtilisateur) {
        try {
          await fetch('/api/checkout/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              prenom: session.user.user_metadata?.full_name?.split(' ')[0] || '',
            }),
          })
        } catch (e) {
          console.error('Email bienvenue Google non envoye:', e)
        }
      }

      const planInfo = await getUserPlan(supabase, session.user.id)
      setPlan(planInfo)

      const { data: factures } = await supabase
        .from('factures')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: clients } = await supabase
        .from('clients')
        .select('*')

      if (factures) {
        const facturesValides = factures.filter(f => f.statut !== 'Annulee')
        const total = facturesValides.reduce((sum, f) => sum + Number(f.montant), 0)
        const enAttente = factures.filter(f => f.statut === 'En attente').length

        setStats({
          chiffreAffaires: total,
          facturesEnvoyees: facturesValides.length,
          facturesEnAttente: enAttente,
          nombreClients: clients?.length || 0,
        })
        setDernieresFactures(factures.slice(0, 3))

        const annee = new Date().getFullYear()
        const caParMois = Array(12).fill(0)
        facturesValides.forEach(f => {
          if (!f.date) return
          const date = new Date(f.date)
          if (date.getFullYear() === annee) {
            caParMois[date.getMonth()] += Number(f.montant)
          }
        })
        setDataGraphique(caParMois)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const maxCA = Math.max(...dataGraphique, 1)

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/dashboard" />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {plan.plan === 'trial' && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-lg">Essai Pro en cours</p>
              <p className="text-blue-100 text-sm">
                Il vous reste <strong>{plan.joursRestants} jour{plan.joursRestants > 1 ? 's' : ''}</strong> d'essai Pro gratuit. Profitez de toutes les fonctionnalites !
              </p>
            </div>
            <button
              onClick={() => router.push('/profil')}
              className="bg-white text-blue-600 font-semibold px-5 py-2 rounded-xl text-sm whitespace-nowrap hover:bg-blue-50 transition-colors">
              Passer au Pro — 9 euros/mois
            </button>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Bonjour {profil?.prenom ? profil.prenom : user?.email}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.chiffreAffaires.toFixed(0)} euros</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Factures envoyees</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.facturesEnvoyees}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Factures en attente</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.facturesEnAttente}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Clients</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.nombreClients}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Chiffre d'affaires {new Date().getFullYear()}
          </h3>
          <div className="flex items-end gap-2 h-40">
            {dataGraphique.map((ca, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">
                  {ca > 0 ? `${ca.toFixed(0)}` : ''}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((ca / maxCA) * 120, ca > 0 ? 4 : 0)}px`,
                    backgroundColor: i === new Date().getMonth() ? '#1d4ed8' : '#93c5fd',
                  }}
                />
                <span className="text-xs text-gray-400">{MOIS[i]}</span>
              </div>
            ))}
          </div>
          {dataGraphique.every(v => v === 0) && (
            <p className="text-center text-gray-400 text-sm mt-4">
              Aucune donnee pour le moment
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Dernieres factures</h3>
            <span onClick={() => router.push('/factures')} className="text-blue-600 cursor-pointer text-sm hover:underline">Voir tout</span>
          </div>
          {dernieresFactures.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune facture pour le moment</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px]">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">N°</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">Client</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">Montant</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {dernieresFactures.map((facture) => (
                    <tr key={facture.id} className="border-b border-gray-50">
                      <td className="py-3 text-blue-600 text-sm font-medium">{facture.numero || '—'}</td>
                      <td className="py-3 text-gray-800">{facture.client}</td>
                      <td className="py-3 font-semibold text-blue-700">{facture.montant} euros</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          facture.statut === "Payee" ? "bg-green-100 text-green-700" :
                          facture.statut === "En attente" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {facture.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
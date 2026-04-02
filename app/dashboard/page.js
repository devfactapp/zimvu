'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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

      const { data: factures } = await supabase
        .from('factures')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: clients } = await supabase
        .from('clients')
        .select('*')

      if (factures) {
        const facturesValides = factures.filter(f => f.statut !== 'Annulée')
        const total = facturesValides.reduce((sum, f) => sum + Number(f.montant), 0)
        const enAttente = factures.filter(f => f.statut === 'En attente').length

        setStats({
          chiffreAffaires: total,
          facturesEnvoyees: facturesValides.length,
          facturesEnAttente: enAttente,
          nombreClients: clients?.length || 0,
        })
        setDernieresFactures(factures.slice(0, 3))

        // Graphique CA par mois (année en cours)
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
    <div className="min-h-screen bg-gray-100">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/dashboard" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Bonjour 👋 {user?.email}
        </h2>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.chiffreAffaires.toFixed(0)} €</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Factures envoyées</p>
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

        {/* GRAPHIQUE CA */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Chiffre d'affaires {new Date().getFullYear()}
          </h3>
          <div className="flex items-end gap-2 h-40">
            {dataGraphique.map((ca, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">
                  {ca > 0 ? `${ca.toFixed(0)}€` : ''}
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
              Aucune donnée pour le moment
            </p>
          )}
        </div>

        {/* DERNIÈRES FACTURES */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Dernières factures</h3>
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
                      <td className="py-3 font-semibold text-blue-700">{facture.montant} €</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          facture.statut === "Payée" ? "bg-green-100 text-green-700" :
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
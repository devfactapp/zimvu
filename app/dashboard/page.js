'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [stats, setStats] = useState({
    chiffreAffaires: 0,
    facturesEnvoyees: 0,
    facturesEnAttente: 0,
    nombreClients: 0,
  })
  const [dernieresFactures, setDernieresFactures] = useState([])

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
        const total = factures.reduce((sum, f) => sum + Number(f.montant), 0)
        const enAttente = factures.filter(f => f.statut === 'En attente').length
        setStats({
          chiffreAffaires: total,
          facturesEnvoyees: factures.length,
          facturesEnAttente: enAttente,
          nombreClients: clients?.length || 0,
        })
        setDernieresFactures(factures.slice(0, 3))
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-bold text-blue-700 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            Zimvu
          </h1>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center gap-6">
            <span onClick={() => router.push('/dashboard')} className="text-blue-600 font-semibold cursor-pointer">Tableau de bord</span>
            <span onClick={() => router.push('/clients')} className="text-gray-600 cursor-pointer hover:text-blue-600">Clients</span>
            <span onClick={() => router.push('/factures')} className="text-gray-600 cursor-pointer hover:text-blue-600">Factures</span>
            <span onClick={() => router.push('/profil')} className="text-gray-600 cursor-pointer hover:text-blue-600">Mon profil</span>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
              Déconnexion
            </button>
          </div>

          {/* Bouton hamburger mobile */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOuvert(!menuOuvert)}
          >
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {menuOuvert && (
          <div className="md:hidden flex flex-col gap-3 mt-4 pb-2 border-t border-gray-100 pt-4">
            <span onClick={() => { router.push('/dashboard'); setMenuOuvert(false) }} className="text-blue-600 font-semibold cursor-pointer">Tableau de bord</span>
            <span onClick={() => { router.push('/clients'); setMenuOuvert(false) }} className="text-gray-600 cursor-pointer">Clients</span>
            <span onClick={() => { router.push('/factures'); setMenuOuvert(false) }} className="text-gray-600 cursor-pointer">Factures</span>
            <span onClick={() => { router.push('/profil'); setMenuOuvert(false) }} className="text-gray-600 cursor-pointer">Mon profil</span>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm w-full">
              Déconnexion
            </button>
          </div>
        )}
      </nav>

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Bonjour 👋 {user?.email}
        </h2>

        {/* STATS — 2 colonnes sur mobile, 4 sur desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.chiffreAffaires} €</p>
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
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">Client</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">Montant</th>
                    <th className="text-left py-2 text-sm font-semibold text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {dernieresFactures.map((facture) => (
                    <tr key={facture.id} className="border-b border-gray-50">
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
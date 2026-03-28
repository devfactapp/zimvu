'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Profil() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ factures: 0, clients: 0, chiffreAffaires: 0 })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)

      const { data: factures } = await supabase.from('factures').select('*')
      const { data: clients } = await supabase.from('clients').select('*')

      if (factures) {
        const total = factures.reduce((sum, f) => sum + Number(f.montant), 0)
        setStats({
          factures: factures.length,
          clients: clients?.length || 0,
          chiffreAffaires: total,
        })
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
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => router.push('/dashboard')}>Zimvu</h1>
        <div className="flex items-center gap-6">
          <span onClick={() => router.push('/dashboard')} className="text-gray-600 cursor-pointer hover:text-blue-600">Tableau de bord</span>
          <span onClick={() => router.push('/clients')} className="text-gray-600 cursor-pointer hover:text-blue-600">Clients</span>
          <span onClick={() => router.push('/factures')} className="text-gray-600 cursor-pointer hover:text-blue-600">Factures</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Mon profil</h2>

        {/* Infos compte */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations du compte</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.email}</p>
              <p className="text-gray-400 text-sm">Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.factures}</p>
            <p className="text-gray-500 text-sm mt-1">Factures créées</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.clients}</p>
            <p className="text-gray-500 text-sm mt-1">Clients</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.chiffreAffaires} €</p>
            <p className="text-gray-500 text-sm mt-1">Chiffre d'affaires</p>
          </div>
        </div>

        {/* Abonnement */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Mon abonnement</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Plan Gratuit</p>
              <p className="text-gray-400 text-sm">Passez au plan Pro pour débloquer toutes les fonctionnalités</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Passer au Pro — 4,99€/mois
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl shadow p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h3>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="border border-red-300 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
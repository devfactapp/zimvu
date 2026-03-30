'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Profil() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
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
        setStats({ factures: factures.length, clients: clients?.length || 0, chiffreAffaires: total })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const passerAuPro = async () => {
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error('Erreur:', error)
    }
    setCheckoutLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar pageCourante="/profil" />

      {/* CONTENU */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Mon profil</h2>

        {/* Infos compte */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations du compte</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 break-all">{user?.email}</p>
              <p className="text-gray-400 text-sm">Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 flex md:flex-col items-center justify-between md:justify-center md:text-center">
            <p className="text-gray-500 text-sm md:mb-1">Factures créées</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.factures}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex md:flex-col items-center justify-between md:justify-center md:text-center">
            <p className="text-gray-500 text-sm md:mb-1">Clients</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.clients}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex md:flex-col items-center justify-between md:justify-center md:text-center">
            <p className="text-gray-500 text-sm md:mb-1">Chiffre d'affaires</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.chiffreAffaires} €</p>
          </div>
        </div>

        {/* Abonnement */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Mon abonnement</h3>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">Plan Gratuit</p>
              <p className="text-gray-400 text-sm">Passez au plan Pro pour débloquer toutes les fonctionnalités</p>
            </div>
            <button
              onClick={passerAuPro}
              disabled={checkoutLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full md:w-auto">
              {checkoutLoading ? 'Chargement...' : 'Passer au Pro — 4,99€/mois'}
            </button>
          </div>
        </div>

        {/* Zone danger */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 border border-red-100">
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
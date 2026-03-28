'use client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => router.push('/dashboard')}>Zimvu</h1>
        <div className="flex items-center gap-6">
          <span onClick={() => router.push('/dashboard')} className="text-blue-600 font-semibold cursor-pointer">Tableau de bord</span>
          <span onClick={() => router.push('/clients')} className="text-gray-600 cursor-pointer hover:text-blue-600">Clients</span>
          <span onClick={() => router.push('/factures')} className="text-gray-600 cursor-pointer hover:text-blue-600">Factures</span>
          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Mon compte</span>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Bonjour 👋 Bienvenue sur Zimvu</h2>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Chiffre d'affaires du mois</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">0 €</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Factures envoyées</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">0</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Factures en attente</p>
            <p className="text-3xl font-bold text-blue-700 mt-2">0</p>
          </div>
        </div>

        {/* Dernières factures */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Dernières factures</h3>
          <p className="text-gray-400 text-sm">Aucune facture pour le moment</p>
        </div>

        {/* Derniers clients */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Derniers clients</h3>
          <p className="text-gray-400 text-sm">Aucun client pour le moment</p>
        </div>
      </div>
    </div>
  )
}
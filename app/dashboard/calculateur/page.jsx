'use client'
import { useRouter } from 'next/navigation'
import CalculateurCotisations from "@/app/calculateur/CalculateurCotisations"
import Navbar from "@/app/components/Navbar"

export default function PageCalculateurDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/dashboard/calculateur" />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
        >
          ← Retour au tableau de bord
        </button>
        <CalculateurCotisations />
      </div>
    </div>
  )
}
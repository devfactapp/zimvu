'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Factures() {
  const router = useRouter()
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFactures = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data } = await supabase
        .from('factures')
        .select('*')
        .order('created_at', { ascending: false })

      setFactures(data || [])
      setLoading(false)
    }
    fetchFactures()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => router.push('/dashboard')}>Zimvu</h1>
        <div className="flex items-center gap-6">
          <span onClick={() => router.push('/dashboard')} className="text-gray-600 cursor-pointer hover:text-blue-600">Tableau de bord</span>
          <span onClick={() => router.push('/clients')} className="text-gray-600 cursor-pointer hover:text-blue-600">Clients</span>
          <span onClick={() => router.push('/factures')} className="text-blue-600 font-semibold cursor-pointer">Factures</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes factures</h2>
          <button onClick={() => router.push('/factures/nouvelle')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle facture
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : factures.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">Aucune facture pour le moment</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Montant</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture) => (
                  <tr key={facture.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{facture.client}</td>
                    <td className="px-6 py-4 text-gray-600">{facture.description}</td>
                    <td className="px-6 py-4 text-gray-600">{facture.date}</td>
                    <td className="px-6 py-4 font-semibold text-blue-700">{facture.montant} €</td>
                    <td className="px-6 py-4">
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
          )}
        </div>
      </div>
    </div>
  )
}
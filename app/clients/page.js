'use client'
import { useRouter } from 'next/navigation'

export default function Clients() {
  const router = useRouter()

  const clients = [
    { id: 1, nom: "Jean Dupont", email: "jean@email.com", telephone: "06 12 34 56 78", totalFactures: "1 200 €" },
    { id: 2, nom: "Marie Martin", email: "marie@email.com", telephone: "06 98 76 54 32", totalFactures: "850 €" },
    { id: 3, nom: "Paul Bernard", email: "paul@email.com", telephone: "07 11 22 33 44", totalFactures: "2 400 €" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => router.push('/dashboard')}>Zimvu</h1>
        <div className="flex items-center gap-6">
          <span onClick={() => router.push('/dashboard')} className="text-gray-600 cursor-pointer hover:text-blue-600">Tableau de bord</span>
          <span onClick={() => router.push('/clients')} className="text-blue-600 font-semibold cursor-pointer">Clients</span>
          <span onClick={() => router.push('/factures')} className="text-gray-600 cursor-pointer hover:text-blue-600">Factures</span>
          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Mon compte</span>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes clients</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau client
          </button>
        </div>

        {/* Tableau clients */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nom</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Téléphone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total facturé</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{client.nom}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email}</td>
                  <td className="px-6 py-4 text-gray-600">{client.telephone}</td>
                  <td className="px-6 py-4 font-semibold text-blue-700">{client.totalFactures}</td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 cursor-pointer hover:underline text-sm mr-4">Voir</span>
                    <span className="text-red-500 cursor-pointer hover:underline text-sm">Supprimer</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
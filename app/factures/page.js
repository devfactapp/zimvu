'use client'
import { useRouter } from 'next/navigation'

export default function Factures() {
  const router = useRouter()

  const factures = [
    { id: 1, numero: "F-2024-001", client: "Jean Dupont", date: "01/03/2024", montant: "1 200 €", statut: "Payée" },
    { id: 2, numero: "F-2024-002", client: "Marie Martin", date: "10/03/2024", montant: "850 €", statut: "En attente" },
    { id: 3, numero: "F-2024-003", client: "Paul Bernard", date: "15/03/2024", montant: "2 400 €", statut: "En retard" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => router.push('/dashboard')}>Zimvu</h1>
        <div className="flex items-center gap-6">
          <span onClick={() => router.push('/dashboard')} className="text-gray-600 cursor-pointer hover:text-blue-600">Tableau de bord</span>
          <span onClick={() => router.push('/clients')} className="text-gray-600 cursor-pointer hover:text-blue-600">Clients</span>
          <span onClick={() => router.push('/factures')} className="text-blue-600 font-semibold cursor-pointer">Factures</span>
          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Mon compte</span>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes factures</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouvelle facture
          </button>
        </div>

        {/* Tableau factures */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Numéro</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Montant</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((facture) => (
                <tr key={facture.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{facture.numero}</td>
                  <td className="px-6 py-4 text-gray-600">{facture.client}</td>
                  <td className="px-6 py-4 text-gray-600">{facture.date}</td>
                  <td className="px-6 py-4 font-semibold text-blue-700">{facture.montant}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      facture.statut === "Payée" ? "bg-green-100 text-green-700" :
                      facture.statut === "En attente" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {facture.statut}
                    </span>
                  </td>
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
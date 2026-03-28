'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Clients() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nouveau, setNouveau] = useState({ nom: '', email: '', telephone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    setClients(data || [])
    setLoading(false)
  }

  const ajouterClient = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('clients').insert([{
      nom: nouveau.nom,
      email: nouveau.email,
      telephone: nouveau.telephone,
      user_id: session.user.id,
    }])

    setNouveau({ nom: '', email: '', telephone: '' })
    setShowForm(false)
    fetchClients()
    setSaving(false)
  }

  const supprimerClient = async (id) => {
    await supabase.from('clients').delete().eq('id', id)
    fetchClients()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => router.push('/dashboard')}>Zimvu</h1>
        <div className="flex items-center gap-6">
          <span onClick={() => router.push('/dashboard')} className="text-gray-600 cursor-pointer hover:text-blue-600">Tableau de bord</span>
          <span onClick={() => router.push('/clients')} className="text-blue-600 font-semibold cursor-pointer">Clients</span>
          <span onClick={() => router.push('/factures')} className="text-gray-600 cursor-pointer hover:text-blue-600">Factures</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes clients</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau client
          </button>
        </div>

        {/* Formulaire nouveau client */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ajouter un client</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <input
                placeholder="Nom"
                value={nouveau.nom}
                onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Email"
                value={nouveau.email}
                onChange={(e) => setNouveau({ ...nouveau, email: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Téléphone"
                value={nouveau.telephone}
                onChange={(e) => setNouveau({ ...nouveau, telephone: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={ajouterClient} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Tableau clients */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : clients.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">Aucun client pour le moment</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nom</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Téléphone</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{client.nom}</td>
                    <td className="px-6 py-4 text-gray-600">{client.email}</td>
                    <td className="px-6 py-4 text-gray-600">{client.telephone}</td>
                    <td className="px-6 py-4">
                      <span onClick={() => supprimerClient(client.id)}
                        className="text-red-500 cursor-pointer hover:underline text-sm">
                        Supprimer
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
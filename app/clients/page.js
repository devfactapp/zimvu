'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Clients() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nouveau, setNouveau] = useState({ nom: '', email: '', telephone: '' })
  const [saving, setSaving] = useState(false)
  const [confirmSupprimer, setConfirmSupprimer] = useState(null)

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
    setConfirmSupprimer(null)
    fetchClients()
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar pageCourante="/clients" />

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmSupprimer && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Supprimer le client ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Le client <strong>{confirmSupprimer.nom}</strong> sera supprimé définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => supprimerClient(confirmSupprimer.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-sm">
                Supprimer
              </button>
              <button
                onClick={() => setConfirmSupprimer(null)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Mes clients</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nouveau client
          </button>
        </div>

        {/* Formulaire nouveau client */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ajouter un client</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

        {/* Liste clients */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : clients.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">Aucun client pour le moment</p>
          ) : (
            <>
              {/* Vue mobile : cartes */}
              <div className="md:hidden divide-y divide-gray-100">
                {clients.map((client) => (
                  <div key={client.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{client.nom}</span>
                      <span onClick={() => setConfirmSupprimer(client)} className="text-red-500 cursor-pointer text-sm">Supprimer</span>
                    </div>
                    <p className="text-gray-500 text-sm">{client.email}</p>
                    <p className="text-gray-400 text-sm">{client.telephone}</p>
                  </div>
                ))}
              </div>

              {/* Vue desktop : tableau */}
              <div className="hidden md:block">
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
                          <span onClick={() => setConfirmSupprimer(client)} className="text-red-500 cursor-pointer hover:underline text-sm">Supprimer</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
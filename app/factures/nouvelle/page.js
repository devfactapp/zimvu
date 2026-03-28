'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'

export default function NouvelleFacture() {
  const router = useRouter()
  const [facture, setFacture] = useState({
    client: '',
    email: '',
    description: '',
    montant: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFacture({ ...facture, [e.target.name]: e.target.value })
  }

  const creerFacture = async () => {
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { error } = await supabase.from('factures').insert([{
      client: facture.client,
      email: facture.email,
      description: facture.description,
      montant: facture.montant,
      date: facture.date,
      statut: 'En attente',
      user_id: session.user.id,
    }])

    if (error) setError('Erreur lors de la création')
    else router.push('/factures')

    setLoading(false)
  }

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

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Nouvelle facture</h2>
          <button onClick={() => router.push('/factures')} className="text-gray-500 hover:text-gray-700 text-sm">← Retour</button>
        </div>

        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations client</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nom du client</label>
                <input name="client" value={facture.client} onChange={handleChange} placeholder="Jean Dupont"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email client</label>
                <input name="email" value={facture.email} onChange={handleChange} placeholder="jean@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Détails de la prestation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea name="description" value={facture.description} onChange={handleChange}
                  placeholder="Description de la prestation..." rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Montant (€)</label>
                  <input name="montant" value={facture.montant} onChange={handleChange} placeholder="0.00" type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                  <input name="date" value={facture.date} onChange={handleChange} type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button onClick={() => router.push('/factures')}
              className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button onClick={creerFacture} disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
              {loading ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
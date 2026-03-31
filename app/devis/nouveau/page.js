'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import Navbar from '../../components/Navbar'

export default function NouveauDevis() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client: '',
    email: '',
    description: '',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    date_validite: '',
    statut: 'Brouillon',
  })

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data } = await supabase.from('clients').select('*').order('nom')
      setClients(data || [])
    }
    fetchClients()
  }, [])

  const handleClientChange = (e) => {
    const nomClient = e.target.value
    const clientTrouve = clients.find(c => c.nom === nomClient)
    setForm({
      ...form,
      client: nomClient,
      email: clientTrouve?.email || '',
    })
  }

  const handleSubmit = async () => {
    if (!form.client || !form.montant || !form.date) {
      alert('Merci de remplir les champs obligatoires (client, montant, date)')
      return
    }
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('devis').insert([{
      user_id: session.user.id,
      client: form.client,
      email: form.email,
      description: form.description,
      montant: parseFloat(form.montant),
      date: form.date,
      date_validite: form.date_validite || null,
      statut: form.statut,
    }])

    setSaving(false)
    router.push('/devis')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/devis" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push('/devis')}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1">
          ← Retour aux devis
        </button>

        <h2 className="text-xl font-semibold text-gray-700 mb-6">Nouveau devis</h2>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <input
              list="liste-clients"
              placeholder="Nom du client"
              value={form.client}
              onChange={handleClientChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="liste-clients">
              {clients.map(c => (
                <option key={c.id} value={c.nom} />
              ))}
            </datalist>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email client</label>
            <input
              type="email"
              placeholder="email@client.fr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description de la prestation</label>
            <textarea
              placeholder="Décrivez la prestation..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
            <input
              type="number"
              placeholder="0"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du devis *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de validité</label>
              <input
                type="date"
                value={form.date_validite}
                onChange={(e) => setForm({ ...form, date_validite: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Brouillon">Brouillon</option>
              <option value="Envoyé">Envoyé</option>
              <option value="Accepté">Accepté</option>
              <option value="Refusé">Refusé</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm">
              {saving ? 'Enregistrement...' : 'Enregistrer le devis'}
            </button>
            <button
              onClick={() => router.push('/devis')}
              className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Beta() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [activite, setActivite] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInscription = async () => {
    setError('')
    if (!prenom || !nom || !email || !telephone || !activite || !password) {
      setError('Veuillez remplir tous les champs obligatoires (*)')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        setError('Cet email est déjà utilisé.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (data?.user?.identities?.length === 0) {
      setError('Cet email est déjà utilisé.')
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profils').insert([{
        id: data.user.id,
        prenom,
        nom,
        telephone,
        nom_entreprise: activite,
      }])
    }

    try {
      await fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch (e) {
      console.error('Email non envoyé:', e)
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <h1 onClick={() => router.push('/')} className="text-2xl font-bold text-blue-700 cursor-pointer">Zimvu</h1>
        <span onClick={() => router.push('/')} className="text-gray-500 text-sm cursor-pointer hover:text-blue-600">
          ← Retour
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {success ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bienvenue dans la bêta Zimvu !</h2>
            <p className="text-gray-500 mb-6">
              Ton compte a été créé. Vérifie ton email pour confirmer ton compte puis connecte-toi.
            </p>
            <button onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold">
              Aller sur Zimvu →
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                🧪 Programme Bêta — Places limitées
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Rejoignez la bêta<br />
                <span className="text-blue-700">Zimvu gratuitement</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Testez Zimvu en avant-première et aidez-nous à construire le meilleur outil de facturation pour auto-entrepreneurs français.
              </p>
            </div>

            {/* Avantages bêta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl mb-2">🎁</div>
                <p className="font-semibold text-gray-800 text-sm">Accès gratuit</p>
                <p className="text-gray-400 text-xs mt-1">Toutes les fonctionnalités Pro offertes</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl mb-2">💬</div>
                <p className="font-semibold text-gray-800 text-sm">Influence le produit</p>
                <p className="text-gray-400 text-xs mt-1">Vos retours façonnent Zimvu</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl mb-2">⭐</div>
                <p className="font-semibold text-gray-800 text-sm">Tarif préférentiel</p>
                <p className="text-gray-400 text-xs mt-1">Prix bloqué à vie pour les bêta-testeurs</p>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Créer mon compte bêta</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input type="text" placeholder="Jean" value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input type="text" placeholder="Dupont" value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" placeholder="jean@exemple.fr" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input type="tel" placeholder="06 00 00 00 00" value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre activité *</label>
                  <select value={activite} onChange={(e) => setActivite(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Sélectionnez votre activité</option>
                    <option value="Freelance informatique">Freelance informatique</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Artisan">Artisan</option>
                    <option value="Commerce">Commerce / Vente</option>
                    <option value="Services">Prestation de services</option>
                    <option value="Créatif">Métier créatif (design, photo...)</option>
                    <option value="Santé">Santé / Bien-être</option>
                    <option value="Formation">Formation / Coaching</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input type="password" placeholder="Minimum 6 caractères" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button onClick={handleInscription} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl text-lg">
                  {loading ? 'Inscription...' : 'Rejoindre la bêta gratuitement →'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  En vous inscrivant, vous acceptez nos{' '}
                  <span onClick={() => router.push('/cgv')} className="text-blue-600 cursor-pointer hover:underline">CGV</span>
                  {' '}et notre{' '}
                  <span onClick={() => router.push('/confidentialite')} className="text-blue-600 cursor-pointer hover:underline">politique de confidentialité</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
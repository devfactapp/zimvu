'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Mode reset password activé')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    setError('')
    if (!password || !confirm) {
      setError('Veuillez remplir les deux champs')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Erreur lors de la mise à jour. Réessaie.')
    } else {
      setMessage('✅ Mot de passe mis à jour avec succès !')
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Zimvu</h1>
          <p className="text-gray-500 text-sm mt-1">Réinitialisation du mot de passe</p>
        </div>

        {message ? (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-green-600 font-semibold mb-2">{message}</p>
            <p className="text-gray-400 text-sm">Redirection en cours...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                placeholder="Répète ton mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>

            <p className="text-center text-sm text-gray-400">
              <span onClick={() => router.push('/')}
                className="text-blue-600 cursor-pointer hover:underline">
                Retour à l'accueil
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
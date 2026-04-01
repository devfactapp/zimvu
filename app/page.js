'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [nomEntreprise, setNomEntreprise] = useState('')
  const [siret, setSiret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [motDePasseOublie, setMotDePasseOublie] = useState(false)
  const [resetEnvoye, setResetEnvoye] = useState(false)

  const handleAuth = async () => {
    setError('')
    if (isSignUp) {
      if (!prenom || !nom || !telephone || !email || !password) {
        setError('Veuillez remplir tous les champs obligatoires (*)')
        return
      }
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        return
      }
    } else {
      if (!email || !password) {
        setError('Veuillez renseigner votre email et mot de passe')
        return
      }
    }

    setLoading(true)
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
          setError('Cet email est déjà utilisé. Connecte-toi ou utilise un autre email.')
        } else {
          setError(error.message)
        }
      } else if (data?.user?.identities?.length === 0) {
        setError('Cet email est déjà utilisé. Connecte-toi ou utilise un autre email.')
      } else {
        if (data.user) {
          await supabase.from('profils').insert([{
            id: data.user.id,
            prenom,
            nom,
            telephone,
            adresse,
            nom_entreprise: nomEntreprise,
            siret,
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
        setError('Vérifie ton email pour confirmer ton compte !')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou mot de passe incorrect')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) { setError('Entre ton adresse email'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError('Erreur lors de l\'envoi. Vérifie ton email.')
    } else {
      setResetEnvoye(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-700">Zimvu</h1>
        <div className="flex items-center gap-4">
          <span onClick={() => { setShowAuth(true); setIsSignUp(false); setMotDePasseOublie(false); setResetEnvoye(false) }}
            className="text-gray-600 cursor-pointer hover:text-blue-600 text-sm font-medium">
            Se connecter
          </span>
          <button onClick={() => { setShowAuth(true); setIsSignUp(true); setMotDePasseOublie(false); setResetEnvoye(false) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Essai gratuit
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          🚀 L'outil de facturation pour auto-entrepreneurs
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Créez vos devis et factures<br />
          <span className="text-blue-700">sans vous perdre dans un logiciel compliqué</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Zimvu est l'outil simple pour créer ses devis, factures et suivre ses frais — pensé pour les indépendants, freelances et auto-entrepreneurs français.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => { setShowAuth(true); setIsSignUp(true) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold">
            Commencer gratuitement →
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-4">Pas de carte bancaire requise</p>
      </div>

      {/* Fonctionnalités */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Tout ce dont vous avez besoin</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">📄</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Factures & Devis</h4>
            <p className="text-gray-500 text-sm">Créez des documents professionnels en quelques secondes et exportez-les en PDF.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">👥</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Gestion des clients</h4>
            <p className="text-gray-500 text-sm">Gardez tous vos clients organisés en un seul endroit.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Tableau de bord</h4>
            <p className="text-gray-500 text-sm">Suivez votre chiffre d'affaires et vos factures en temps réel.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">🧾</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Notes de frais</h4>
            <p className="text-gray-500 text-sm">Suivez vos dépenses par catégorie et exportez votre comptabilité.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">🧮</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Calculateur cotisations</h4>
            <p className="text-gray-500 text-sm">Estimez vos charges sociales avec les taux officiels 2025.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">📱</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Accessible partout</h4>
            <p className="text-gray-500 text-sm">Accédez à votre compte depuis n'importe quel appareil.</p>
          </div>
        </div>
      </div>

      {/* Prix */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Un prix simple et transparent</h3>
          <p className="text-gray-500 mb-10">Commencez gratuitement, passez au Pro quand vous êtes prêt.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Gratuit */}
            <div className="bg-white rounded-2xl shadow p-8 text-left">
              <p className="text-gray-500 text-sm font-medium mb-2">GRATUIT</p>
              <p className="text-5xl font-bold text-gray-900 mb-1">0€</p>
              <p className="text-gray-400 text-sm mb-6">Pour démarrer</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600"><span className="text-green-500">✓</span> 3 factures / mois</li>
                <li className="flex items-center gap-2 text-gray-600"><span className="text-green-500">✓</span> 3 devis / mois</li>
                <li className="flex items-center gap-2 text-gray-600"><span className="text-green-500">✓</span> Gestion clients</li>
                <li className="flex items-center gap-2 text-gray-600"><span className="text-green-500">✓</span> Calculateur cotisations</li>
                <li className="flex items-center gap-2 text-gray-400 line-through">Export PDF illimité</li>
                <li className="flex items-center gap-2 text-gray-400 line-through">Notes de frais</li>
              </ul>
              <button onClick={() => { setShowAuth(true); setIsSignUp(true) }}
                className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold">
                Commencer gratuitement
              </button>
            </div>

            {/* Plan Pro */}
            <div className="bg-blue-600 rounded-2xl shadow p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                ⭐ RECOMMANDÉ
              </div>
              <p className="text-blue-200 text-sm font-medium mb-2">PRO</p>
              <p className="text-5xl font-bold text-white mb-1">9€</p>
              <p className="text-blue-200 text-sm mb-6">par mois · sans engagement</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Factures illimitées</li>
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Devis illimités</li>
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Clients illimités</li>
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Export PDF + Excel</li>
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Notes de frais</li>
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Agenda + Relances auto</li>
                <li className="flex items-center gap-2 text-white"><span className="text-green-300">✓</span> Support prioritaire</li>
              </ul>
              <button onClick={() => { setShowAuth(true); setIsSignUp(true) }}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold">
                Essayer gratuitement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        <p className="mb-3">© 2026 Zimvu — L'outil de facturation pour auto-entrepreneurs</p>
        <div className="flex items-center justify-center gap-6">
          <span onClick={() => router.push('/mentions-legales')} className="cursor-pointer hover:text-blue-600">Mentions légales</span>
          <span onClick={() => router.push('/cgv')} className="cursor-pointer hover:text-blue-600">CGV</span>
          <span onClick={() => router.push('/confidentialite')} className="cursor-pointer hover:text-blue-600">Politique de confidentialité</span>
        </div>
      </footer>

      {/* Modal Auth */}
      {showAuth && (
        <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'0 16px'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-700">Zimvu</h2>
              <span onClick={() => { setShowAuth(false); setMotDePasseOublie(false); setResetEnvoye(false) }} className="text-gray-400 cursor-pointer hover:text-gray-600 text-xl">✕</span>
            </div>

            {motDePasseOublie ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mot de passe oublié</h3>
                {resetEnvoye ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-4">📧</div>
                    <p className="text-green-600 font-medium mb-2">Email envoyé !</p>
                    <p className="text-gray-500 text-sm">Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.</p>
                    <button onClick={() => { setMotDePasseOublie(false); setResetEnvoye(false) }}
                      className="mt-6 text-blue-600 text-sm cursor-pointer hover:underline">
                      Retour à la connexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-sm mb-4">Entre ton email et on t'envoie un lien de réinitialisation.</p>
                    <input type="email" placeholder="Adresse e-mail *" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <button onClick={handleResetPassword} disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
                      {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      <span onClick={() => { setMotDePasseOublie(false); setError('') }} className="text-blue-600 cursor-pointer hover:underline">
                        Retour à la connexion
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6">{isSignUp ? 'Créer un compte' : 'Se connecter'}</h3>
                <div className="space-y-4">
                  {isSignUp && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Prénom *" value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Nom *" value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <input type="tel" placeholder="Téléphone *" value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" placeholder="Adresse postale (optionnel)" value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" placeholder="Nom de l'entreprise (optionnel)" value={nomEntreprise}
                        onChange={(e) => setNomEntreprise(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" placeholder="Numéro SIRET (optionnel)" value={siret}
                        onChange={(e) => setSiret(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </>
                  )}
                  <input type="email" placeholder="Adresse e-mail *" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="password" placeholder="Mot de passe *" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {!isSignUp && (
                    <p className="text-right">
                      <span onClick={() => { setMotDePasseOublie(true); setError('') }}
                        className="text-blue-600 text-sm cursor-pointer hover:underline">
                        Mot de passe oublié ?
                      </span>
                    </p>
                  )}
                  {error && <p className="text-sm text-center text-red-500">{error}</p>}
                  <button onClick={handleAuth} disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
                    {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
                  <span onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="text-blue-600 cursor-pointer font-medium">
                    {isSignUp ? 'Se connecter' : 'Créer un compte'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
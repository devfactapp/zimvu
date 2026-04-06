'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import { getUserPlan } from '../utils/planUtils'

export default function Profil() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [stats, setStats] = useState({ factures: 0, clients: 0, chiffreAffaires: 0 })
  const [planInfo, setPlanInfo] = useState({ plan: 'gratuit', joursRestants: 0 })

  const [profil, setProfil] = useState({
    prenom: '', nom: '', telephone: '', adresse: '', nom_entreprise: '', siret: ''
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [nouvelEmail, setNouvelEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState(null)

  const [mdpLoading, setMdpLoading] = useState(false)
  const [mdpMsg, setMdpMsg] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)

      const { data: profilData } = await supabase
        .from('profils')
        .select('prenom, nom, telephone, adresse, nom_entreprise, siret')
        .eq('id', session.user.id)
        .single()

      if (profilData) {
        setProfil({
          prenom: profilData.prenom || '',
          nom: profilData.nom || '',
          telephone: profilData.telephone || '',
          adresse: profilData.adresse || '',
          nom_entreprise: profilData.nom_entreprise || '',
          siret: profilData.siret || '',
        })
      }

      const plan = await getUserPlan(supabase, session.user.id)
      setPlanInfo(plan)

      const { data: factures } = await supabase.from('factures').select('*')
      const { data: clients } = await supabase.from('clients').select('*')
      if (factures) {
        const total = factures.filter(f => f.statut !== 'Annulée').reduce((sum, f) => sum + Number(f.montant), 0)
        setStats({ factures: factures.filter(f => f.statut !== 'Annulée').length, clients: clients?.length || 0, chiffreAffaires: total })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const sauvegarderProfil = async () => {
    setSaving(true)
    setSaveSuccess(false)
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase
      .from('profils')
      .upsert({
        id: session.user.id,
        prenom: profil.prenom,
        nom: profil.nom,
        telephone: profil.telephone,
        adresse: profil.adresse,
        nom_entreprise: profil.nom_entreprise,
        siret: profil.siret,
      }, { onConflict: 'id' })
    setSaving(false)
    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const changerEmail = async () => {
    if (!nouvelEmail || !nouvelEmail.includes('@')) {
      setEmailMsg({ type: 'error', text: 'Adresse email invalide.' })
      return
    }
    setEmailLoading(true)
    setEmailMsg(null)
    const { error } = await supabase.auth.updateUser({ email: nouvelEmail })
    setEmailLoading(false)
    if (error) {
      setEmailMsg({ type: 'error', text: 'Erreur : ' + error.message })
    } else {
      setNouvelEmail('')
      setEmailMsg({ type: 'success', text: '✓ Un lien de confirmation a été envoyé sur ' + nouvelEmail })
    }
  }

  const changerMotDePasse = async () => {
    setMdpLoading(true)
    setMdpMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `https://zimvu.app/reset-password`,
    })
    setMdpLoading(false)
    if (error) {
      setMdpMsg({ type: 'error', text: 'Erreur : ' + error.message })
    } else {
      setMdpMsg({ type: 'success', text: '✓ Email envoyé sur ' + user.email + ' — vérifiez votre boîte mail.' })
    }
  }

  const passerAuPro = async (plan = 'mensuel') => {
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, plan }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error('Erreur:', error)
    }
    setCheckoutLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"

  const BoutonsPro = () => (
    <div className="mt-4 space-y-3">
      <button onClick={() => passerAuPro('annuel')} disabled={checkoutLoading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors relative">
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-400 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          💰 ECONOMISEZ 33%
        </span>
        {checkoutLoading ? 'Chargement...' : '🚀 Pro Annuel — 5.99€/mois · 71.88€/an'}
      </button>
      <button onClick={() => passerAuPro('mensuel')} disabled={checkoutLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
        {checkoutLoading ? 'Chargement...' : '🚀 Pro Mensuel — 8.99€/mois · Sans engagement'}
      </button>
      <p className="text-center text-xs text-gray-400">Essai 14 jours inclus · Annulable à tout moment</p>
    </div>
  )

  const renderAbonnement = () => {
    if (planInfo.plan === 'pro') {
      return (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ PRO</span>
            <span className="text-blue-700 font-semibold">Plan Pro actif</span>
          </div>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✓ Factures & devis illimités</li>
            <li>✓ Notes de frais</li>
            <li>✓ Export PDF + Excel</li>
            <li>✓ Agenda + Relances automatiques</li>
            <li>✓ Support prioritaire</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3 font-medium">Abonnement actif</p>
        </div>
      )
    }

    if (planInfo.plan === 'trial') {
      return (
        <>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ ESSAI PRO</span>
              <span className="text-yellow-700 font-semibold">Essai Pro en cours</span>
            </div>
            <p className="text-sm text-yellow-700">
              Il vous reste <span className="font-bold">{planInfo.joursRestants} jour{planInfo.joursRestants > 1 ? 's' : ''}</span> d'essai gratuit.
              Après l'essai, votre compte basculera automatiquement sur le plan Gratuit.
            </p>
          </div>
          <BoutonsPro />
        </>
      )
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">GRATUIT</span>
              <span className="text-gray-700 font-semibold text-sm">Actuel</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>✓ 3 factures / mois</li>
              <li>✓ 3 devis / mois</li>
              <li>✓ Gestion clients</li>
              <li className="text-gray-300">✗ Notes de frais</li>
              <li className="text-gray-300">✗ Export PDF + Excel</li>
              <li className="text-gray-300">✗ Agenda</li>
              <li className="text-gray-300">✗ Relances auto</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ PRO</span>
              <span className="text-blue-700 font-semibold text-sm">8.99€/mois</span>
            </div>
            <ul className="space-y-1.5 text-xs text-blue-700">
              <li>✓ Factures illimitées</li>
              <li>✓ Devis illimités</li>
              <li>✓ Gestion clients</li>
              <li>✓ Notes de frais</li>
              <li>✓ Export PDF + Excel</li>
              <li>✓ Agenda</li>
              <li>✓ Relances auto</li>
            </ul>
          </div>
        </div>
        <BoutonsPro />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/profil" />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Mon profil</h2>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Informations du compte</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profil.prenom ? profil.prenom.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800 break-all">{user?.email}</p>
                {planInfo.plan === 'pro' && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">⭐ PRO</span>
                )}
                {planInfo.plan === 'trial' && (
                  <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">ESSAI PRO</span>
                )}
              </div>
              <p className="text-gray-400 text-sm">Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Prénom</label>
              <input type="text" value={profil.prenom}
                onChange={e => setProfil({ ...profil, prenom: e.target.value })}
                placeholder="Votre prénom" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nom</label>
              <input type="text" value={profil.nom}
                onChange={e => setProfil({ ...profil, nom: e.target.value })}
                placeholder="Votre nom" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
              <input type="tel" value={profil.telephone}
                onChange={e => setProfil({ ...profil, telephone: e.target.value })}
                placeholder="06 00 00 00 00" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Adresse</label>
              <input type="text" value={profil.adresse}
                onChange={e => setProfil({ ...profil, adresse: e.target.value })}
                placeholder="7 rue de la Paix, 75001 Paris" className={inputClass} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-3">Informations entreprise</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nom de l'entreprise</label>
                <input type="text" value={profil.nom_entreprise}
                  onChange={e => setProfil({ ...profil, nom_entreprise: e.target.value })}
                  placeholder="Mon Entreprise" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Numéro SIRET</label>
                <input type="text" value={profil.siret}
                  onChange={e => setProfil({ ...profil, siret: e.target.value })}
                  placeholder="000 000 000 00000" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button onClick={sauvegarderProfil} disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            {saveSuccess && <span className="text-green-600 text-sm font-medium">✓ Profil mis à jour</span>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-5">Sécurité du compte</h3>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Changer d'adresse email</p>
            <p className="text-xs text-gray-400 mb-3">Un email de confirmation sera envoyé à la nouvelle adresse avant toute modification.</p>
            <div className="flex gap-2">
              <input type="email" value={nouvelEmail}
                onChange={e => setNouvelEmail(e.target.value)}
                placeholder="Nouvelle adresse email"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <button onClick={changerEmail} disabled={emailLoading || !nouvelEmail}
                className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap">
                {emailLoading ? '...' : 'Confirmer'}
              </button>
            </div>
            {emailMsg && (
              <p className={`text-sm mt-2 ${emailMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {emailMsg.text}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-600 mb-1">Changer de mot de passe</p>
            <p className="text-xs text-gray-400 mb-3">Un email avec un lien de réinitialisation sera envoyé à <span className="font-medium text-gray-500">{user?.email}</span>.</p>
            <button onClick={changerMotDePasse} disabled={mdpLoading}
              className="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
              {mdpLoading ? 'Envoi...' : '🔑 Envoyer le lien de réinitialisation'}
            </button>
            {mdpMsg && (
              <p className={`text-sm mt-2 ${mdpMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {mdpMsg.text}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 flex md:flex-col items-center justify-between md:justify-center md:text-center">
            <p className="text-gray-500 text-sm md:mb-1">Factures créées</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.factures}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex md:flex-col items-center justify-between md:justify-center md:text-center">
            <p className="text-gray-500 text-sm md:mb-1">Clients</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.clients}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 flex md:flex-col items-center justify-between md:justify-center md:text-center">
            <p className="text-gray-500 text-sm md:mb-1">Chiffre d'affaires</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.chiffreAffaires.toFixed(0)} €</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Mon abonnement</h3>
          {renderAbonnement()}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h3>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="border border-red-300 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Relances() {
  const router = useRouter()
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [confirmation, setConfirmation] = useState(false)
  const [erreurFetch, setErreurFetch] = useState(null)

  const fetchFactures = useCallback(async () => {
    setErreurFetch(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    setUser(session.user)
    setSession(session)

    const dateLimite = new Date()
    dateLimite.setDate(dateLimite.getDate() - 7)
    const dateLimiteStr = dateLimite.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('factures')
      .select('id, client, email, montant, date, numero, description, relance_envoyee, statut')
      .eq('user_id', session.user.id)
      .eq('statut', 'En attente')
      .lte('date', dateLimiteStr)
      .order('date')

    if (error) {
      setErreurFetch('Impossible de charger les factures. Veuillez réessayer.')
      setLoading(false)
      return
    }

    setFactures(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchFactures()
  }, [fetchFactures])

  const lancerRelances = async () => {
    setConfirmation(false)
    setEnvoi(true)
    setResultat(null)

    try {
      const response = await fetch('/api/relances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      const data = await response.json()
      setResultat(data)
      await fetchFactures()
    } catch (error) {
      setResultat({ error: 'Erreur lors de l\'envoi des relances' })
    }
    setEnvoi(false)
  }

  const joursRetard = (date) => {
    const diff = new Date() - new Date(date)
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const facturesEligibles = factures.filter(f => f.email && !f.relance_envoyee)
  const montantTotal = factures.reduce((sum, f) => sum + Number(f.montant), 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/relances" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Relances automatiques</h2>

        {/* Explication */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-blue-700 text-sm">
            📧 Les relances sont envoyées automatiquement aux clients dont la facture est en attente depuis plus de <strong>7 jours</strong>. Seules les factures avec un email client et non encore relancées sont incluses.
          </p>
        </div>

        {/* Erreur fetch */}
        {erreurFetch && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-700 text-sm font-medium">{erreurFetch}</p>
          </div>
        )}

        {/* Résultat envoi */}
        {resultat && (
          <div className={`rounded-2xl p-4 mb-6 ${resultat.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${resultat.error ? 'text-red-700' : 'text-green-700'}`}>
              {resultat.error || resultat.message}
            </p>
            {resultat.resultats && resultat.resultats.length > 0 && (
              <ul className="mt-2 space-y-1">
                {resultat.resultats.map((r, i) => (
                  <li key={i} className="text-green-600 text-sm">✅ Relance envoyée à {r.client}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">Factures en retard</p>
            <p className="text-3xl font-bold text-red-500">{factures.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">Relances à envoyer</p>
            <p className="text-3xl font-bold text-blue-700">{facturesEligibles.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">Montant total en attente</p>
            <p className="text-3xl font-bold text-orange-500">
              {montantTotal.toFixed(2)} €
            </p>
          </div>
        </div>

        {/* Bouton lancer relances */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Lancer les relances</h3>
          <p className="text-gray-500 text-sm mb-4">
            {facturesEligibles.length === 0
              ? 'Aucune facture éligible pour le moment.'
              : `${facturesEligibles.length} relance(s) seront envoyées par email.`}
          </p>

          {!confirmation ? (
            <button
              onClick={() => setConfirmation(true)}
              disabled={envoi || facturesEligibles.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-3 rounded-xl text-sm">
              📧 Envoyer les relances
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">Confirmer l'envoi de {facturesEligibles.length} email(s) ?</p>
              <button
                onClick={lancerRelances}
                disabled={envoi}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm">
                {envoi ? '⏳ Envoi...' : '✅ Confirmer'}
              </button>
              <button
                onClick={() => setConfirmation(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-xl text-sm">
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Liste factures en retard */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600">
              Factures en retard ({factures.length})
            </h3>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm p-6">Chargement...</p>
          ) : factures.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-gray-600 font-medium">Aucune facture en retard !</p>
              <p className="text-gray-400 text-sm mt-1">Tous vos clients sont à jour.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {factures.map(f => (
                <div key={f.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{f.client}</p>
                    <p className="text-gray-500 text-sm">{f.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-red-500 font-medium">
                        {joursRetard(f.date)} jours de retard
                      </span>
                      {f.email ? (
                        <span className="text-xs text-green-600">✓ Email disponible</span>
                      ) : (
                        <span className="text-xs text-orange-500">⚠ Pas d'email</span>
                      )}
                      {f.relance_envoyee && (
                        <span className="text-xs text-blue-600">📧 Déjà relancé</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-700">{Number(f.montant).toFixed(2)} €</p>
                    <p className="text-gray-400 text-xs">{formatDate(f.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
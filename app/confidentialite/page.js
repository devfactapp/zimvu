export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>

        <div className="bg-white rounded-2xl shadow p-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Données collectées</h2>
            <p className="text-gray-600">Zimvu collecte les données suivantes :</p>
            <ul className="text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Adresse email lors de l'inscription</li>
              <li>Prénom, nom, téléphone, adresse</li>
              <li>Informations des factures et devis créés</li>
              <li>Informations des clients ajoutés</li>
              <li>Données de paiement via Stripe</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Utilisation des données</h2>
            <p className="text-gray-600">Vos données sont utilisées uniquement pour :</p>
            <ul className="text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Faire fonctionner le service Zimvu</li>
              <li>Générer vos factures et devis en PDF</li>
              <li>Gérer votre abonnement</li>
              <li>Vous envoyer des emails liés au service</li>
              <li>Améliorer l'application</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Partage des données</h2>
            <p className="text-gray-600">
              Vos données ne sont <strong>jamais vendues</strong> à des tiers.
              Elles peuvent être partagées uniquement avec nos prestataires techniques :
            </p>
            <ul className="text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li><strong>Supabase</strong> — stockage des données</li>
              <li><strong>Stripe</strong> — traitement des paiements</li>
              <li><strong>Vercel</strong> — hébergement du site</li>
              <li><strong>Resend</strong> — envoi des emails transactionnels</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Conservation des données</h2>
            <p className="text-gray-600">
              Vos données sont conservées pendant toute la durée de votre utilisation du service
              et supprimées dans les 30 jours suivant la suppression de votre compte.
              Les données de facturation sont conservées 10 ans conformément à l'obligation légale française.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Vos droits RGPD</h2>
            <p className="text-gray-600">Conformément au RGPD vous disposez des droits suivants :</p>
            <ul className="text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Pour exercer ces droits contactez-nous à : <strong>contact@zimvu.app</strong>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Cookies</h2>
            <p className="text-gray-600">
              Zimvu utilise uniquement des cookies essentiels au fonctionnement du service
              (authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Contact</h2>
            <p className="text-gray-600">
              Pour toute question relative à vos données : <strong>contact@zimvu.app</strong>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          <a href="/" className="hover:text-blue-600">← Retour à l'accueil</a>
        </p>
      </div>
    </div>
  )
}
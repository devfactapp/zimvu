export default function CGV() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales de Vente</h1>

        <div className="bg-white rounded-2xl shadow p-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Objet</h2>
            <p className="text-gray-600">
              Les présentes CGV régissent l'utilisation du service Zimvu, un outil de facturation en ligne 
              destiné aux auto-entrepreneurs et petites entreprises, accessible sur zimvu-avlk.vercel.app.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Prix et abonnement</h2>
            <p className="text-gray-600">
              Zimvu propose un abonnement mensuel au tarif de <strong>4,99€ TTC par mois</strong>. 
              L'abonnement est sans engagement et peut être résilié à tout moment. 
              Le paiement est effectué via Stripe, plateforme sécurisée de paiement en ligne.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Accès au service</h2>
            <p className="text-gray-600">
              L'accès au service est disponible 24h/24 et 7j/7, sauf en cas de maintenance ou 
              de force majeure. L'utilisateur est responsable de la confidentialité de ses identifiants.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Droit de rétractation</h2>
            <p className="text-gray-600">
              Conformément à la loi, vous disposez d'un délai de <strong>14 jours</strong> à compter 
              de votre inscription pour exercer votre droit de rétractation et obtenir un remboursement complet.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Résiliation</h2>
            <p className="text-gray-600">
              L'abonnement peut être résilié à tout moment depuis votre espace profil. 
              La résiliation prend effet à la fin de la période en cours. 
              Aucun remboursement partiel ne sera effectué.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Données personnelles</h2>
            <p className="text-gray-600">
              Les données collectées sont utilisées uniquement pour le fonctionnement du service. 
              Elles ne sont jamais vendues à des tiers. Consultez notre politique de confidentialité 
              pour plus d'informations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Responsabilité</h2>
            <p className="text-gray-600">
              Zimvu ne peut être tenu responsable des pertes de données ou interruptions de service 
              dues à des causes extérieures. L'utilisateur est responsable de l'exactitude des 
              informations saisies dans l'application.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes CGV sont soumises au droit français. 
              En cas de litige, les tribunaux français seront compétents.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Contact</h2>
            <p className="text-gray-600">
              Pour toute question : <strong>contact@zimvu.fr</strong>
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
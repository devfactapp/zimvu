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
              destiné aux auto-entrepreneurs et petites entreprises, accessible sur zimvu.app.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Prix et abonnements</h2>
            <p className="text-gray-600 mb-3">
              Zimvu propose deux formules d'abonnement Pro :
            </p>
            <ul className="text-gray-600 space-y-2 mb-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span><strong>Plan Pro Mensuel : 8,99€ TTC par mois</strong>, sans engagement, résiliable à tout moment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span><strong>Plan Pro Annuel : 71,88€ TTC par an</strong> (soit 5,99€/mois), facturé en une seule fois pour une durée de 12 mois.</span>
              </li>
            </ul>
            <p className="text-gray-600">
              Le paiement est effectué via Stripe, plateforme sécurisée de paiement en ligne.
              Un plan Gratuit est également disponible sans frais avec des fonctionnalités limitées.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Essai gratuit</h2>
            <p className="text-gray-600">
              Tout nouvel utilisateur bénéficie d'un essai gratuit de <strong>14 jours</strong> avec accès
              à toutes les fonctionnalités Pro. Aucune carte bancaire n'est requise pour l'essai.
              À l'issue de la période d'essai, le compte passe automatiquement sur le plan Gratuit.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Accès au service</h2>
            <p className="text-gray-600">
              L'accès au service est disponible 24h/24 et 7j/7, sauf en cas de maintenance ou
              de force majeure. L'utilisateur est responsable de la confidentialité de ses identifiants.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Droit de rétractation</h2>
            <p className="text-gray-600">
              Conformément à la loi, vous disposez d'un délai de <strong>14 jours</strong> à compter
              de votre inscription pour exercer votre droit de rétractation et obtenir un remboursement complet.
              Pour le plan annuel, le remboursement est intégral si la demande intervient dans ce délai.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Résiliation</h2>
            <p className="text-gray-600">
              Le plan mensuel peut être résilié à tout moment depuis votre espace profil.
              La résiliation prend effet à la fin de la période mensuelle en cours.
              Le plan annuel est souscrit pour une durée de 12 mois et n'est pas remboursable
              au-delà du délai légal de rétractation de 14 jours.
              Aucun remboursement partiel ne sera effectué après ce délai.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Données personnelles</h2>
            <p className="text-gray-600">
              Les données collectées sont utilisées uniquement pour le fonctionnement du service.
              Elles ne sont jamais vendues à des tiers. Consultez notre politique de confidentialité
              pour plus d'informations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Responsabilité</h2>
            <p className="text-gray-600">
              Zimvu ne peut être tenu responsable des pertes de données ou interruptions de service
              dues à des causes extérieures. L'utilisateur est responsable de l'exactitude des
              informations saisies dans l'application.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes CGV sont soumises au droit français.
              En cas de litige, les tribunaux français seront compétents.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact</h2>
            <p className="text-gray-600">
              Pour toute question : <strong>contact@zimvu.app</strong>
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
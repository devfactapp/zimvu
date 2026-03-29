export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>

        <div className="bg-white rounded-2xl shadow p-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Éditeur du site</h2>
            <p className="text-gray-600">Le site Zimvu est édité par :</p>
            <p className="text-gray-600 mt-2">
              <strong>Nom :</strong> À compléter<br />
              <strong>Statut :</strong> Auto-entrepreneur<br />
              <strong>SIRET :</strong> À compléter après déclaration<br />
              <strong>Email :</strong> contact@zimvu.fr<br />
              <strong>Adresse :</strong> Marseille, France
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Hébergement</h2>
            <p className="text-gray-600">
              Le site est hébergé par <strong>Vercel Inc.</strong><br />
              340 Pine Street, Suite 701, San Francisco, CA 94104, USA<br />
              Site web : vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L'ensemble du contenu de ce site (textes, images, logos) est protégé par le droit d'auteur. 
              Toute reproduction sans autorisation est interdite.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
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
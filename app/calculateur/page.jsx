import CalculateurCotisations from "./CalculateurCotisations";

export const metadata = {
  title: "Calculateur de cotisations auto-entrepreneur 2025 | Zimvu",
  description: "Estimez gratuitement vos cotisations sociales en tant qu'auto-entrepreneur.",
};

export default function PageCalculateur() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 text-center">
        <a href="/" className="text-blue-600 font-bold text-lg">Zimvu</a>
      </div>

      <CalculateurCotisations />

      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-blue-600 rounded-2xl p-6 text-center text-white">
          <p className="font-semibold text-lg mb-1">Gérez aussi vos factures avec Zimvu</p>
          <p className="text-blue-100 text-sm mb-4">Facturation, clients, dashboard — tout en un.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/inscription" className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-xl text-sm">
              Créer un compte gratuit
            </a>
            <a href="/connexion" className="border border-blue-400 text-white font-medium px-6 py-2.5 rounded-xl text-sm">
              Se connecter
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-8">
        <a href="/mentions-legales" className="hover:text-gray-600">Mentions légales</a>
        <span className="mx-2">·</span>
        <a href="/cgv" className="hover:text-gray-600">CGV</a>
        <span className="mx-2">·</span>
        <span>© 2025 Zimvu</span>
      </div>
    </main>
  );
}
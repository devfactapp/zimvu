// app/dashboard/calculateur/page.jsx
import CalculateurCotisations from "@/app/calculateur/CalculateurCotisations";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Calculateur de cotisations | Zimvu",
};

export default function PageCalculateurDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar pageCourante="/dashboard/calculateur" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Bouton retour */}
        
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6"
        >
          ← Retour au tableau de bord
        </a>

        <CalculateurCotisations />
      </div>
    </div>
  );
}
// app/dashboard/calculateur/page.jsx

import CalculateurCotisations from "@/app/calculateur/CalculateurCotisations";

export const metadata = {
  title: "Calculateur de cotisations | Zimvu",
  description: "Estimez vos cotisations sociales auto-entrepreneur — taux 2025",
};

export default function PageCalculateurDashboard() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calculateur de cotisations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Estimez vos charges sociales en fonction de votre activité — taux officiels 2025
        </p>
      </div>
      <CalculateurCotisations />
    </div>
  );
}
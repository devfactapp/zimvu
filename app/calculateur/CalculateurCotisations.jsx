// app/calculateur/CalculateurCotisations.jsx
"use client";

import { useState } from "react";
import {
  TAUX_COTISATIONS,
  calculerCotisations,
  formaterEuros,
} from "./cotisations";

export default function CalculateurCotisations() {
  const [ca, setCa] = useState("");
  const [typeActivite, setTypeActivite] = useState("bic_service");
  const [acre, setAcre] = useState(false);
  const [resultat, setResultat] = useState(null);

  function handleCalculer() {
    const caNum = parseFloat(ca.replace(/\s/g, "").replace(",", "."));
    if (!caNum || caNum <= 0) return;
    setResultat(calculerCotisations(caNum, typeActivite, acre));
  }

  function handleReset() {
    setCa("");
    setTypeActivite("bic_service");
    setAcre(false);
    setResultat(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-transparent">
      {/* Titre */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Calculateur de cotisations
        </h1>
        <p className="text-gray-500 text-sm">
          Estimez vos charges sociales en tant qu'auto-entrepreneur — taux 2025
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Type d'activité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'activité
          </label>
          <select
            value={typeActivite}
            onChange={(e) => {
              setTypeActivite(e.target.value);
              setResultat(null);
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            {Object.entries(TAUX_COTISATIONS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chiffre d'affaires */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chiffre d'affaires annuel (€)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex : 30000"
            value={ca}
            onChange={(e) => {
              setCa(e.target.value);
              setResultat(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCalculer()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* ACRE */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            id="acre"
            checked={acre}
            onChange={(e) => {
              setAcre(e.target.checked);
              setResultat(null);
            }}
            className="mt-0.5 accent-blue-600"
          />
          <label htmlFor="acre" className="text-sm text-gray-700 cursor-pointer">
            <span className="font-medium">Bénéficiaire de l'ACRE</span>
            <span className="block text-gray-500 text-xs mt-0.5">
              Réduction de 50% des cotisations pendant les 4 premiers trimestres
            </span>
          </label>
        </div>

        {/* Bouton */}
        <button
          onClick={handleCalculer}
          disabled={!ca}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
        >
          Calculer mes cotisations
        </button>
      </div>

      {/* Résultats */}
      {resultat && (
        <div className="mt-6 space-y-4">

          {/* Alerte dépassement plafond */}
          {resultat.depassePlafond && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠️ Votre CA dépasse le plafond auto-entrepreneur (
              {formaterEuros(resultat.plafond)}). Vous devrez peut-être changer
              de statut juridique.
            </div>
          )}

          {/* Alerte TVA */}
          {resultat.statutTva === "assujetti" && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
              ⚠️ Votre CA dépasse le seuil de TVA majoré (
              {formaterEuros(resultat.seuilTva.majoré)}). Vous êtes assujetti à
              la TVA.
            </div>
          )}
          {resultat.statutTva === "periode_grace" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
              ⚠️ Votre CA dépasse le seuil TVA normal (
              {formaterEuros(resultat.seuilTva.normal)}). Vous disposez d'une
              période de tolérance de 2 ans avant d'être assujetti.
            </div>
          )}

          {/* Carte principale */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Résultat de l'estimation
            </h2>

            <div className="space-y-3">
              {/* CA */}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Chiffre d'affaires</span>
                <span className="font-semibold text-gray-900">
                  {formaterEuros(resultat.ca)}
                </span>
              </div>

              {/* Cotisations */}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">
                  Cotisations sociales
                  {resultat.acre && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      ACRE −50%
                    </span>
                  )}
                </span>
                <span className="font-semibold text-red-500">
                  − {formaterEuros(resultat.montantCotisations)}
                </span>
              </div>

              {/* Taux appliqué */}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Taux appliqué</span>
                <span className="text-sm text-gray-700">
                  {resultat.tauxApplique.toFixed(1)} %
                </span>
              </div>

              {/* Net annuel */}
              <div className="flex justify-between items-center py-3 bg-green-50 rounded-xl px-3 mt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Net estimé / an
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formaterEuros(resultat.netEstime)}
                </span>
              </div>

              {/* Net mensuel */}
              <div className="flex justify-between items-center py-3 bg-blue-50 rounded-xl px-3">
                <span className="text-sm font-semibold text-gray-700">
                  Net estimé / mois
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formaterEuros(resultat.netMensuel)}
                </span>
              </div>
            </div>
          </div>

          {/* Info TVA */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
            <p>
              📌 Seuil franchise TVA :{" "}
              <strong>{formaterEuros(resultat.seuilTva.normal)}</strong> (seuil
              majoré : {formaterEuros(resultat.seuilTva.majoré)})
            </p>
            <p>
              📌 Plafond CA auto-entrepreneur :{" "}
              <strong>{formaterEuros(resultat.plafond)}</strong>
            </p>
            <p className="pt-1 text-gray-400 italic">
              * Estimation indicative. Ces chiffres ne remplacent pas un conseil
              comptable.
            </p>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            ↺ Recommencer un calcul
          </button>
        </div>
      )}
    </div>
  );
}
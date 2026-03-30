// app/calculateur/cotisations.js
// Taux officiels auto-entrepreneur 2025

export const TAUX_COTISATIONS = {
  bic_vente: {
    label: "Achat-revente / Hébergement (BIC vente)",
    cotisations: 12.3,
    impot_libératoire: 1.0,
    cfe: true,
  },
  bic_service: {
    label: "Prestations de services commerciales (BIC service)",
    cotisations: 21.2,
    impot_libératoire: 1.7,
    cfe: true,
  },
  bnc: {
    label: "Prestations de services libérales (BNC)",
    cotisations: 21.1,
    impot_libératoire: 2.2,
    cfe: true,
  },
  liberal_cipav: {
    label: "Profession libérale réglementée (CIPAV)",
    cotisations: 21.2,
    impot_libératoire: 2.2,
    cfe: true,
  },
};

// Plafonds CA auto-entrepreneur 2025
export const PLAFONDS = {
  bic_vente: 188_700,
  bic_service: 77_700,
  bnc: 77_700,
  liberal_cipav: 77_700,
};

// Seuils TVA (franchise en base) 2025
export const SEUILS_TVA = {
  bic_vente: { normal: 91_900, majoré: 101_000 },
  bic_service: { normal: 36_800, majoré: 39_100 },
  bnc: { normal: 36_800, majoré: 39_100 },
  liberal_cipav: { normal: 36_800, majoré: 39_100 },
};

// Taux ACRE (réduction 50% les 4 premiers trimestres)
export const TAUX_ACRE = 0.5;

/**
 * Calcule les cotisations sociales et le net estimé
 * @param {number} ca - Chiffre d'affaires annuel en €
 * @param {string} typeActivite - Clé dans TAUX_COTISATIONS
 * @param {boolean} acre - Bénéficie de l'ACRE ou non
 * @returns {object} Résultat complet du calcul
 */
export function calculerCotisations(ca, typeActivite, acre = false) {
  const taux = TAUX_COTISATIONS[typeActivite];
  if (!taux || !ca || ca <= 0) return null;

  const tauxCotisations = acre
    ? taux.cotisations * (1 - TAUX_ACRE)
    : taux.cotisations;

  const montantCotisations = (ca * tauxCotisations) / 100;
  const netEstime = ca - montantCotisations;
  const plafond = PLAFONDS[typeActivite];
  const seuilTva = SEUILS_TVA[typeActivite];

  // Statut TVA
  let statutTva = "franchise"; // exonéré TVA
  if (ca > seuilTva.majoré) {
    statutTva = "assujetti"; // doit facturer la TVA
  } else if (ca > seuilTva.normal) {
    statutTva = "periode_grace"; // période de tolérance (2 ans)
  }

  // Dépassement plafond auto-entrepreneur
  const depassePlafond = ca > plafond;

  return {
    ca,
    typeActivite,
    acre,
    tauxApplique: tauxCotisations,
    montantCotisations: Math.round(montantCotisations),
    netEstime: Math.round(netEstime),
    netMensuel: Math.round(netEstime / 12),
    plafond,
    depassePlafond,
    seuilTva,
    statutTva,
    pourcentageNet: Math.round((netEstime / ca) * 100),
  };
}

/**
 * Formate un montant en euros
 * @param {number} montant
 * @returns {string}
 */
export function formaterEuros(montant) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(montant);
}
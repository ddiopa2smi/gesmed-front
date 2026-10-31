/**
 * Test de diagnostic rapide (TDR) du paludisme.
 *
 * test_tdr           : "Oui" / "Non" (le test a-t-il été réalisé ?)
 * resultat_test_tdr  : "positif" / "negatif" / "invalide" (à refaire)
 *
 * Anciennes consultations : test_tdr contenait directement le résultat ("positif", "negatif", "invalide").
 */

export const RESULTATS_TDR = [
    { value: "positif", label: "Positif", color: "error" },
    { value: "negatif", label: "Négatif", color: "success" },
    { value: "invalide", label: "À refaire", color: "warning" },
];

const VALEURS_RESULTAT = RESULTATS_TDR.map((r) => r.value);

// Résultat du TDR d'une consultation (nouveau champ, ou ancien format).
// resultat_test_tdr n'est pris en compte que si test_tdr = "Oui" : en base, la colonne a pu être
// remplie par une valeur par défaut ("negatif") sur des consultations où aucun TDR n'a été fait.
export const getResultatTdr = (consultation) => {
    if (consultation?.test_tdr === "Oui") return consultation?.resultat_test_tdr || null;
    return VALEURS_RESULTAT.includes(consultation?.test_tdr) ? consultation.test_tdr : null;
};

// Le TDR a-t-il été réalisé ?
export const isTdrRealise = (consultation) =>
    consultation?.test_tdr === "Oui" || VALEURS_RESULTAT.includes(consultation?.test_tdr);

// Valeurs du formulaire à partir d'une consultation enregistrée (conversion de l'ancien format)
export const tdrInitialValues = (consultation) => ({
    test_tdr: isTdrRealise(consultation) ? "Oui" : "Non",
    resultat_test_tdr: getResultatTdr(consultation) || undefined,
});

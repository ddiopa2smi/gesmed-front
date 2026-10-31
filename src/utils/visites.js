import { getResultatVisite, typesVisiteMedicaleOptions } from "../constants/app.constants";
import { normaliserTexte, pct } from "../components/specific/StatistiquesMedicales/statsUtils";

/**
 * Analyse des consultations dont le motif est une visite ("VISITE", "VISITE D'EMBAUCHE"...).
 * Le type et le résultat sont des champs récents : pour l'historique, le type est repris du motif
 * et l'aptitude du diagnostic, où elle était saisie en texte libre. Ces valeurs sont marquées "deduit".
 */

export const NON_RENSEIGNE = "Non renseigné";
export const TYPE_NON_PRECISE = "Non précisé";
const APTE_AVEC_RESERVE = "Apte avec réserve";
const INAPTE_SANS_PRECISION = "Inapte (sans précision)";

// Du plus favorable au moins favorable : ordre d'affichage des résultats
const COULEURS_RESULTAT = {
    "Apte": "#52c41a",
    "Apte avec restrictions": "#a0d911",
    "Apte avec aménagement de poste": "#13c2c2",
    [APTE_AVEC_RESERVE]: "#95de64",
    "Avis différé": "#31bae8",
    "Inapte temporaire": "#faad14",
    "Inapte définitif au poste": "#ff4d4f",
    "Inapte à tout poste": "#eb2f96",
    [INAPTE_SANS_PRECISION]: "#cf1322",
    [NON_RENSEIGNE]: "#bfbfbf",
};
const ORDRE_RESULTATS = Object.keys(COULEURS_RESULTAT);

export const estVisite = (consultation) =>
    !!consultation?.libelle_motifcons?.trim().toLowerCase().startsWith("visite");

export const typeVisite = (consultation) => {
    if (consultation.type_visite) {
        const option = typesVisiteMedicaleOptions.find((t) => t.value === consultation.type_visite);
        return { label: option?.label || consultation.type_visite, deduit: false };
    }
    if (/embauche/i.test(consultation.libelle_motifcons || "")) return { label: "Visite d'embauche", deduit: true };
    return { label: TYPE_NON_PRECISE, deduit: false };
};

export const resultatVisite = (consultation) => {
    const code = consultation.resultat_visite;
    if (code) return { label: getResultatVisite(code)?.label || code, deduit: false };

    const texte = normaliserTexte(consultation.diagnostic);
    if (/\bINAPTE\b|\b(NON|PAS) APTE\b/.test(texte)) return { label: INAPTE_SANS_PRECISION, deduit: true };
    if (/\bAPTE\b/.test(texte)) {
        return { label: /\b(AVEC|SOUS|SUIVI|RESERVE|RESTRICTION)/.test(texte) ? APTE_AVEC_RESERVE : "Apte", deduit: true };
    }
    return { label: NON_RENSEIGNE, deduit: false };
};

export const couleurResultat = (label) => COULEURS_RESULTAT[label] || "#8c8c8c";

const compter = (lignes, cle) => Object.entries(lignes.reduce((acc, ligne) => {
    acc[ligne[cle]] = (acc[ligne[cle]] || 0) + 1;
    return acc;
}, {})).map(([name, value]) => ({ name, value }));

const rangResultat = (label) => {
    const rang = ORDRE_RESULTATS.indexOf(label);
    return rang === -1 ? ORDRE_RESULTATS.length : rang;
};

export const statistiquesVisites = (visites) => {
    const lignes = visites.map((c) => {
        const type = typeVisite(c);
        const resultat = resultatVisite(c);
        return { type: type.label, resultat: resultat.label, deduit: type.deduit || resultat.deduit };
    });
    const avecResultat = lignes.filter((l) => l.resultat !== NON_RENSEIGNE);
    const aptes = avecResultat.filter((l) => l.resultat.startsWith("Apte")).length;
    const inaptes = avecResultat.filter((l) => l.resultat.startsWith("Inapte")).length;
    const parResultat = compter(lignes, "resultat")
        .sort((a, b) => rangResultat(a.name) - rangResultat(b.name))
        .map((r) => ({ ...r, couleur: couleurResultat(r.name), part: pct(r.value, lignes.length) }));
    const parType = compter(lignes, "type").sort((a, b) => b.value - a.value).map((t) => ({ ...t, part: pct(t.value, lignes.length) }));

    return {
        total: lignes.length,
        patients: new Set(visites.map((c) => c.numpat)).size,
        aptes,
        inaptes,
        tauxAptitude: pct(aptes, avecResultat.length),
        nonRenseignes: lignes.length - avecResultat.length,
        deduits: lignes.filter((l) => l.deduit).length,
        parType,
        parResultat,
        // Résultats de chaque type de visite (histogramme empilé)
        parTypeResultat: parType.map(({ name }) => ({
            type: name,
            ...Object.fromEntries(compter(lignes.filter((l) => l.type === name), "resultat").map((r) => [r.name, r.value])),
        })),
    };
};

// Lignes d'export communes aux statistiques et à la page de détail
export const lignesExportVisites = (stats) => [
    ...stats.parType.map((t) => ({ Dimension: "Type de visite", Valeur: t.name, Visites: t.value, "Part (%)": t.part })),
    ...stats.parResultat.map((r) => ({ Dimension: "Résultat", Valeur: r.name, Visites: r.value, "Part (%)": r.part })),
];

export const graphiquesExportVisites = (stats) => [
    { titre: "Types de visites", type: "donut", data: stats.parType, x: "name", series: [{ cle: "value" }], demi: true },
    { titre: "Résultats des visites", type: "donut", data: stats.parResultat, x: "name", series: [{ cle: "value" }], demi: true },
    {
        titre: "Résultats par type de visite", type: "barres", empile: true, data: stats.parTypeResultat, x: "type",
        series: stats.parResultat.map((r) => ({ cle: r.name, couleur: r.couleur })),
    },
];

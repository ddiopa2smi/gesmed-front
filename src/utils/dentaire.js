/**
 * Référentiels du cabinet dentaire : numérotation FDI, états des dents, actes, antécédents à risque.
 * Quadrants : 1 haut droit, 2 haut gauche, 3 bas gauche, 4 bas droit (5 à 8 : dents de lait, même ordre).
 * "Droit" et "gauche" sont ceux du patient : son côté droit est à gauche de l'écran.
 */

const numeros = (quadrants, nombre) => quadrants.flatMap((q) => Array.from({ length: nombre }, (_, i) => q * 10 + i + 1));

export const DENTS_PERMANENTES = numeros([1, 2, 3, 4], 8);
export const DENTS_LAIT = numeros([5, 6, 7, 8], 5);

export const QUADRANTS = {
    1: "Maxillaire droit", 2: "Maxillaire gauche", 3: "Mandibule gauche", 4: "Mandibule droite",
    5: "Maxillaire droit (lait)", 6: "Maxillaire gauche (lait)", 7: "Mandibule gauche (lait)", 8: "Mandibule droite (lait)",
};

export const estDentLait = (dent) => dent >= 50;
export const estMaxillaire = (dent) => [1, 2, 5, 6].includes(Math.floor(dent / 10));
// Incisives et canines : bord libre au lieu d'une face occlusale
const estAnterieure = (dent) => dent % 10 <= 3;

const NOMS_PERMANENTES = ["Incisive centrale", "Incisive latérale", "Canine", "1re prémolaire", "2e prémolaire", "1re molaire", "2e molaire", "3e molaire (dent de sagesse)"];
const NOMS_LAIT = ["Incisive centrale", "Incisive latérale", "Canine", "1re molaire", "2e molaire"];

export const nomDent = (dent) => (estDentLait(dent) ? NOMS_LAIT : NOMS_PERMANENTES)[dent % 10 - 1];
export const decrireDent = (dent) => `${dent} · ${nomDent(dent)}${estDentLait(dent) ? " de lait" : ""} · ${QUADRANTS[Math.floor(dent / 10)]}`;

// Formule dentaire selon l'âge : "adulte", "mixte" (6-12 ans) ou "enfant"
export const denturePourAge = (age) => {
    if (age === null || age === undefined || age >= 13) return "adulte";
    return age >= 6 ? "mixte" : "enfant";
};

export const dentsDeLaDenture = (denture) => {
    if (denture === "enfant") return DENTS_LAIT;
    return denture === "mixte" ? [...DENTS_PERMANENTES, ...DENTS_LAIT] : DENTS_PERMANENTES;
};

/* ------------------------------------------------------------------ */
/* États                                                               */
/* ------------------------------------------------------------------ */

export const ETATS_DENT = {
    SAINE: { label: "Saine", couleur: "#ffffff", trait: "#b9a88e" },
    CARIEE: { label: "Cariée", couleur: "#ffd8d6", trait: "#e5484d" },
    OBTUREE: { label: "Obturée", couleur: "#d6e8ff", trait: "#1f6fd1" },
    COURONNE: { label: "Couronne", couleur: "#ffe7a3", trait: "#c98a00" },
    DEVITALISEE: { label: "Dévitalisée", couleur: "#ecdcff", trait: "#7c3aed" },
    FRACTUREE: { label: "Fracturée", couleur: "#ffe2c6", trait: "#e8590c" },
    A_EXTRAIRE: { label: "À extraire", couleur: "#ffd8d6", trait: "#c1121f" },
    IMPLANT: { label: "Implant", couleur: "#d3f1ee", trait: "#0d9488" },
    PROTHESE: { label: "Prothèse", couleur: "#dff5d8", trait: "#3f9142" },
    INCLUSE: { label: "Incluse", couleur: "#eeeeee", trait: "#8c8c8c" },
    ABSENTE: { label: "Absente", couleur: "transparent", trait: "#a8a8a8" },
};

export const ETATS_ABSENCE = ["ABSENTE", "IMPLANT", "PROTHESE"];

// Faces : la 5e est occlusale sur les prémolaires et molaires, incisive (bord libre) sur les dents antérieures
export const nomsFaces = (dent) => ({
    V: "Vestibulaire",
    L: estMaxillaire(dent) ? "Palatine" : "Linguale",
    M: "Mésiale",
    D: "Distale",
    O: estAnterieure(dent) ? "Incisive (bord libre)" : "Occlusale",
});

export const LESIONS_FACE = {
    CARIE: { label: "Carie", couleur: "#e5484d" },
    OBTURATION: { label: "Obturation", couleur: "#1f6fd1" },
};
const CYCLE_FACE = [null, "CARIE", "OBTURATION"];

// "M:CARIE,O:OBTURATION" <-> { M: "CARIE", O: "OBTURATION" }
export const lireFaces = (texte) => Object.fromEntries((texte || "").split(",").filter(Boolean).map((f) => f.split(":")));
export const ecrireFaces = (faces) => Object.entries(faces).filter(([, lesion]) => lesion).map(([face, lesion]) => `${face}:${lesion}`).join(",");
export const faceSuivante = (lesion) => CYCLE_FACE[(CYCLE_FACE.indexOf(lesion || null) + 1) % CYCLE_FACE.length];

export const dentVierge = (dent) => ({ dent, etat: "SAINE", faces: "", mobilite: 0, note: "" });

export const MOBILITES = [
    { value: 0, label: "0", detail: "Physiologique" },
    { value: 1, label: "1", detail: "Perceptible" },
    { value: 2, label: "2", detail: "Visible, < 1 mm" },
    { value: 3, label: "3", detail: "> 1 mm ou axiale" },
];

// Indice CAO : dents Cariées, Absentes ou Obturées (indice de référence en santé bucco-dentaire).
// Une dent cariée et obturée compte une seule fois, en C. Les dents de lait forment l'indice "cao" de l'enfant.
export const calculerCao = (dents, denture) => {
    const listees = dentsDeLaDenture(denture).filter((d) => denture === "enfant" || !estDentLait(d));
    const stats = { C: 0, A: 0, O: 0 };
    listees.forEach((numero) => {
        const dent = dents[numero];
        if (!dent) return;
        const faces = Object.values(lireFaces(dent.faces));
        if (dent.etat === "CARIEE" || faces.includes("CARIE")) stats.C += 1;
        else if (ETATS_ABSENCE.includes(dent.etat) || dent.etat === "A_EXTRAIRE") stats.A += 1;
        else if (["OBTUREE", "COURONNE"].includes(dent.etat) || faces.includes("OBTURATION")) stats.O += 1;
    });
    return { ...stats, total: stats.C + stats.A + stats.O, present: listees.length - stats.A };
};

/* ------------------------------------------------------------------ */
/* Actes : état de la dent une fois l'acte réalisé                     */
/* ------------------------------------------------------------------ */

export const ACTES_DENTAIRES = [
    {
        groupe: "Prévention et parodontologie", actes: [
            { value: "Détartrage et polissage", bouche: true },
            { value: "Surfaçage radiculaire" },
            { value: "Application de fluor", bouche: true },
            { value: "Scellement de sillons" },
            { value: "Motivation à l'hygiène", bouche: true },
        ],
    },
    {
        groupe: "Soins conservateurs", actes: [
            { value: "Obturation composite", etat: "OBTUREE" },
            { value: "Obturation amalgame", etat: "OBTUREE" },
            { value: "Obturation CVI", etat: "OBTUREE" },
            { value: "Coiffage pulpaire" },
            { value: "Pulpotomie" },
            { value: "Traitement canalaire (dévitalisation)", etat: "DEVITALISEE" },
            { value: "Inlay / onlay", etat: "OBTUREE" },
        ],
    },
    {
        groupe: "Chirurgie", actes: [
            { value: "Extraction simple", etat: "ABSENTE", chirurgie: true },
            { value: "Extraction chirurgicale", etat: "ABSENTE", chirurgie: true },
            { value: "Extraction de dent de sagesse", etat: "ABSENTE", chirurgie: true },
            { value: "Drainage d'abcès", chirurgie: true },
            { value: "Pose d'implant", etat: "IMPLANT", chirurgie: true },
            { value: "Biopsie", chirurgie: true },
        ],
    },
    {
        groupe: "Prothèse et esthétique", actes: [
            { value: "Couronne", etat: "COURONNE" },
            { value: "Bridge", etat: "PROTHESE" },
            { value: "Prothèse amovible", etat: "PROTHESE" },
            { value: "Facette" },
            { value: "Blanchiment", bouche: true },
        ],
    },
    {
        groupe: "Imagerie et divers", actes: [
            { value: "Radiographie rétro-alvéolaire" },
            { value: "Radiographie panoramique", bouche: true },
            { value: "Contrôle / suivi", bouche: true },
            { value: "Gouttière occlusale", bouche: true },
        ],
    },
];

const TOUS_LES_ACTES = ACTES_DENTAIRES.flatMap((g) => g.actes);
export const trouverActe = (libelle) => TOUS_LES_ACTES.find((a) => a.value === libelle);

export const PRIORITES = [
    { value: 1, label: "Urgent", color: "error" },
    { value: 2, label: "Normal", color: "processing" },
    { value: 3, label: "Différé", color: "default" },
];

/* ------------------------------------------------------------------ */
/* Antécédents et points de vigilance                                  */
/* ------------------------------------------------------------------ */

export const RISQUES_PATIENT = [
    { value: "ANTICOAGULANT", label: "Anticoagulants / antiagrégants", chirurgie: "Risque hémorragique : évaluer le traitement et l'hémostase avant tout geste sanglant." },
    { value: "HEMOSTASE", label: "Trouble de l'hémostase", chirurgie: "Risque hémorragique : avis spécialisé avant tout geste sanglant." },
    { value: "ENDOCARDITE", label: "Cardiopathie à risque d'endocardite", chirurgie: "Évaluer la nécessité d'une antibioprophylaxie avant le geste." },
    { value: "CARDIOPATHIE", label: "Cardiopathie / HTA", tous: "Contrôler la tension et adapter l'anesthésie (vasoconstricteur)." },
    { value: "DIABETE", label: "Diabète", chirurgie: "Vérifier l'équilibre glycémique : cicatrisation et risque infectieux." },
    { value: "BISPHOSPHONATES", label: "Bisphosphonates / anti-résorbeurs", chirurgie: "Risque d'ostéonécrose des maxillaires : à évaluer avant toute chirurgie." },
    { value: "IMMUNODEPRESSION", label: "Immunodépression", chirurgie: "Risque infectieux : évaluer une couverture antibiotique." },
    { value: "RADIOTHERAPIE", label: "Radiothérapie cervico-faciale", chirurgie: "Risque d'ostéoradionécrose : avis spécialisé avant toute extraction." },
    { value: "GROSSESSE", label: "Grossesse", tous: "Limiter radiographies et prescriptions ; adapter le plan de soins." },
    { value: "ALLERGIE_ANESTHESIQUE", label: "Allergie aux anesthésiques", tous: "Vérifier le produit avant toute anesthésie locale." },
    { value: "ALLERGIE_ANTIBIOTIQUE", label: "Allergie aux antibiotiques", tous: "À prendre en compte dans toute prescription." },
    { value: "ALLERGIE_LATEX", label: "Allergie au latex", tous: "Utiliser du matériel sans latex." },
    { value: "EPILEPSIE", label: "Épilepsie", tous: "Séances courtes, éviter le stress et les lumières intenses." },
    { value: "ASTHME", label: "Asthme", tous: "Avoir le traitement de crise à portée de main." },
];

export const pointsDeVigilance = (risques, avecChirurgie) => (risques || [])
    .map((code) => RISQUES_PATIENT.find((r) => r.value === code))
    .filter(Boolean)
    .map((risque) => ({ code: risque.value, label: risque.label, conseil: risque.tous || (avecChirurgie ? risque.chirurgie : null) }))
    .filter((point) => point.conseil);

/* ------------------------------------------------------------------ */
/* Listes de l'examen et des soins                                     */
/* ------------------------------------------------------------------ */

const options = (valeurs) => valeurs.map((value) => ({ value, label: value }));

export const OPTIONS_EXAMEN = {
    hygiene: options(["Bonne", "Moyenne", "Mauvaise"]),
    tartre: options(["Absent", "Léger", "Modéré", "Abondant"]),
    gencives: options(["Saines", "Gingivite localisée", "Gingivite généralisée", "Parodontite", "Récession gingivale"]),
    occlusion: options(["Classe I d'Angle", "Classe II d'Angle", "Classe III d'Angle", "Béance", "Supraclusion", "Articulé croisé"]),
    atm: options(["Normale", "Claquements", "Douleur", "Limitation d'ouverture"]),
    muqueuses: options(["Normales", "Ulcération / aphte", "Candidose", "Leucoplasie", "Tuméfaction", "Fistule"]),
};

export const CARACTERES_DOULEUR = options(["Spontanée", "Provoquée", "Nocturne", "Pulsatile", "Au froid", "Au chaud", "Au sucre", "À la mastication", "Irradiante"]);
export const TYPES_RADIO = options(["Rétro-alvéolaire", "Panoramique", "Rétro-coronaire", "Occlusale", "Cone beam (3D)"]);
export const ANESTHESIES = options(["Aucune", "Topique", "Para-apicale", "Tronculaire", "Intra-ligamentaire", "Intra-septale"]);
export const ANESTHESIQUES = options(["Articaïne 4 % adrénalinée", "Articaïne 4 % sans vasoconstricteur", "Lidocaïne 2 % adrénalinée", "Lidocaïne 2 % sans vasoconstricteur", "Mépivacaïne 3 %"]);
export const ORIENTATIONS = options(["Stomatologie", "Chirurgie maxillo-faciale", "ORL", "Médecine générale", "Cardiologie", "Orthodontie", "Laboratoire de prothèse"]);

export const CONSEILS_POST_OP = {
    EXTRACTION: {
        titre: "Après une extraction dentaire",
        conseils: [
            "Mordre sur la compresse pendant 30 minutes sans la mâcher.",
            "Ne pas cracher, ne pas rincer la bouche et ne pas fumer pendant 24 heures.",
            "Ne pas toucher la plaie avec la langue ou les doigts.",
            "Manger froid ou tiède et mou le jour même, du côté opposé.",
            "Appliquer une poche de glace sur la joue en cas de gonflement.",
            "Dormir la tête surélevée la première nuit.",
            "Prendre les médicaments prescrits sans dépasser les doses.",
            "Consulter en cas de saignement persistant, de fièvre ou de douleur croissante.",
        ],
    },
    SOIN: {
        titre: "Après un soin ou une obturation",
        conseils: [
            "Ne pas manger tant que l'anesthésie persiste, pour éviter de se mordre.",
            "Une sensibilité au chaud et au froid est possible pendant quelques jours.",
            "Consulter si la dent gêne lorsque vous fermez la bouche.",
            "Continuer le brossage habituel.",
        ],
    },
    ENDODONTIE: {
        titre: "Après un traitement de racine (dévitalisation)",
        conseils: [
            "Une gêne à la mastication est normale pendant quelques jours.",
            "Éviter de mâcher du côté traité jusqu'à la restauration définitive.",
            "Respecter le rendez-vous de restauration : la dent reste fragile.",
            "Consulter en cas de gonflement ou de douleur intense.",
        ],
    },
    DETARTRAGE: {
        titre: "Après un détartrage",
        conseils: [
            "Une sensibilité et de légers saignements sont possibles pendant 48 heures.",
            "Se brosser les dents deux fois par jour, 2 minutes, avec une brosse souple.",
            "Utiliser du fil dentaire ou des brossettes chaque jour.",
            "Prévoir un contrôle tous les 6 à 12 mois.",
        ],
    },
};

// Conseils adaptés aux soins réalisés
export const conseilsPourActes = (actes) => {
    const cles = new Set();
    actes.forEach((libelle) => {
        if (/extraction/i.test(libelle)) cles.add("EXTRACTION");
        else if (/canalaire|pulpo/i.test(libelle)) cles.add("ENDODONTIE");
        else if (/détartrage|surfaçage/i.test(libelle)) cles.add("DETARTRAGE");
        else if (/obturation|coiffage|inlay/i.test(libelle)) cles.add("SOIN");
    });
    return [...cles].map((cle) => CONSEILS_POST_OP[cle]);
};

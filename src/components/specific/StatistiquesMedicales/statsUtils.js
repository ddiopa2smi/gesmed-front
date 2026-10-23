import dayjs from "dayjs";
import { codesPrescriptions } from "../../../constants/app.constants";

/**
 * Calculs des statistiques médicales (sans affichage).
 * Toutes les fonctions prennent des listes brutes renvoyées par l'API.
 */

export const SEUIL_FIEVRE = 37.5;

// Périodes proposées : [début, fin] en dayjs
export const PERIODES = {
    jour: { label: "Aujourd'hui", range: () => [dayjs().startOf("day"), dayjs().endOf("day")] },
    hier: { label: "Hier", range: () => [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")] },
    semaine: { label: "Cette semaine", range: () => [dayjs().startOf("week"), dayjs().endOf("day")] },
    semaine_derniere: { label: "Semaine dernière", range: () => [dayjs().subtract(1, "week").startOf("week"), dayjs().subtract(1, "week").endOf("week")] },
    mois: { label: "Ce mois", range: () => [dayjs().startOf("month"), dayjs().endOf("day")] },
    mois_dernier: { label: "Mois dernier", range: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
    trimestre: { label: "3 derniers mois", range: () => [dayjs().subtract(3, "month").startOf("day"), dayjs().endOf("day")] },
    annee: { label: "Cette année", range: () => [dayjs().startOf("year"), dayjs().endOf("day")] },
};

// Période précédente de même durée, pour les comparaisons
export const periodePrecedente = ([debut, fin]) => {
    const jours = fin.endOf("day").diff(debut.startOf("day"), "day") + 1;
    return [debut.subtract(jours, "day").startOf("day"), debut.subtract(1, "day").endOf("day")];
};

export const inRange = (value, [debut, fin]) => {
    if (!value) return false;
    const date = dayjs(value);
    return !date.isBefore(debut) && !date.isAfter(fin);
};

// Texte libre normalisé pour regrouper les saisies ("Asthénie physique " = "ASTHENIE PHYSIQUE")
export const normaliserTexte = (value) =>
    String(value || "")
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toUpperCase().replace(/\s+/g, " ").trim();

// Tension "146/73" (mmHg) ou "12/8" (cmHg) -> { sys, dia } en mmHg
export const parseTension = (value) => {
    const match = /^\s*(\d{1,3}(?:[.,]\d)?)\s*\/\s*(\d{1,3}(?:[.,]\d)?)\s*$/.exec(String(value || ""));
    if (!match) return null;
    let sys = parseFloat(match[1].replace(",", "."));
    let dia = parseFloat(match[2].replace(",", "."));
    if (sys < 30) { sys *= 10; dia *= 10; }
    if (sys < 60 || sys > 260 || dia < 30 || dia > 160) return null;
    return { sys, dia };
};

export const isHta = (tension) => {
    const t = parseTension(tension);
    return t ? t.sys >= 140 || t.dia >= 90 : false;
};

export const TRANCHES_AGE = [
    // Petite enfance isolée : suivi spécifique des moins de 5 ans
    { label: "≤ 5 ans", min: 0, max: 5 },
    { label: "6-17 ans", min: 6, max: 17 },
    { label: "18-29 ans", min: 18, max: 29 },
    { label: "30-39 ans", min: 30, max: 39 },
    { label: "40-49 ans", min: 40, max: 49 },
    { label: "50-59 ans", min: 50, max: 59 },
    { label: "60 ans et +", min: 60, max: 200 },
];

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const pct = (value, total) => (total ? Math.round((value / total) * 1000) / 10 : 0);

// Évolution en % entre deux valeurs (null si pas de base de comparaison)
export const evolution = (courant, precedent) =>
    precedent ? Math.round(((courant - precedent) / precedent) * 1000) / 10 : null;

const countBy = (rows, keyFn) =>
    rows.reduce((acc, row) => {
        const key = keyFn(row);
        if (key !== null && key !== undefined && key !== "") acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

const sortEntries = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

const estRenseigne = (value) => value !== null && value !== undefined && value !== "" && value !== 0 && value !== "NaN";

/* ------------------------------------------------------------------ */
/* Indicateurs clés                                                    */
/* ------------------------------------------------------------------ */

export const calculerKpis = ({ consultations, rendezVous, prescriptions }) => {
    const nbCons = consultations.length;
    const patients = new Set(consultations.map((c) => c.numpat)).size;
    const validees = consultations.filter((c) => c.medecin).length;
    const rvEffectues = rendezVous.filter((rv) => rv.effectue).length;
    const fievres = consultations.filter((c) => c.temp > SEUIL_FIEVRE).length;
    const tensionsMesurees = consultations.filter((c) => parseTension(c.tension)).length;
    const hta = consultations.filter((c) => isHta(c.tension)).length;
    const repos = consultations.filter((c) => c.nb_jours_rm > 0);
    const joursRepos = repos.reduce((acc, c) => acc + (c.nb_jours_rm || 0), 0);
    const tdrPositifs = consultations.filter((c) => c.test_tdr === "positif").length;
    const tdrRealises = consultations.filter((c) => c.test_tdr).length;
    const consultationsAvecPrescription = new Set(prescriptions.filter((p) => p.numcons).map((p) => p.numcons)).size;
    const jours = new Set(consultations.map((c) => dayjs(c.datecons).format("YYYY-MM-DD"))).size;

    const enfants5 = consultations.filter((c) => c.age_patient !== null && c.age_patient !== undefined && c.age_patient <= 5).length;

    return {
        consultations: nbCons,
        patients,
        enfants5,
        tauxEnfants5: pct(enfants5, nbCons),
        consultationsParPatient: patients ? Math.round((nbCons / patients) * 100) / 100 : 0,
        moyenneParJour: jours ? Math.round((nbCons / jours) * 10) / 10 : 0,
        tauxValidation: pct(validees, nbCons),
        rendezVous: rendezVous.length,
        tauxHonoration: pct(rvEffectues, rendezVous.length),
        rvNonHonores: rendezVous.length - rvEffectues,
        fievres,
        tauxFievre: pct(fievres, nbCons),
        hta,
        tauxHta: pct(hta, tensionsMesurees),
        tensionsMesurees,
        repos: repos.length,
        joursRepos,
        dureeMoyenneRepos: repos.length ? Math.round((joursRepos / repos.length) * 10) / 10 : 0,
        tdrRealises,
        tdrPositifs,
        prescriptions: prescriptions.length,
        tauxPrescription: pct(consultationsAvecPrescription, nbCons),
        ordonnances: prescriptions.filter((p) => p.codepresc === codesPrescriptions.ORD).length,
        analyses: prescriptions.filter((p) => p.codepresc === codesPrescriptions.ANA).length,
        imageries: prescriptions.filter((p) => p.codepresc === codesPrescriptions.IMG).length,
    };
};

/* ------------------------------------------------------------------ */
/* Séries pour les graphiques                                          */
/* ------------------------------------------------------------------ */

// Granularité adaptée à la durée de la période
export const granularite = ([debut, fin]) => {
    const jours = fin.diff(debut, "day") + 1;
    if (jours <= 1) return "heure";
    if (jours <= 45) return "jour";
    if (jours <= 180) return "semaine";
    return "mois";
};

export const serieEvolution = ({ consultations, rendezVous, range }) => {
    const unite = granularite(range);
    const cle = (value) => {
        const d = dayjs(value);
        if (unite === "heure") return d.format("HH[h]");
        if (unite === "jour") return d.format("DD/MM");
        if (unite === "semaine") return `S${d.startOf("week").format("DD/MM")}`;
        return d.format("MMM YY");
    };
    // Axe complet, y compris les intervalles sans activité
    const axe = [];
    let curseur = range[0].startOf(unite === "semaine" ? "week" : unite === "heure" ? "day" : unite);
    const pas = unite === "heure" ? "hour" : unite === "jour" ? "day" : unite === "semaine" ? "week" : "month";
    const limite = unite === "heure" ? range[0].endOf("day") : range[1];
    while (!curseur.isAfter(limite) && axe.length < 400) {
        const label = cle(curseur);
        if (!axe.includes(label)) axe.push(label);
        curseur = curseur.add(1, pas);
    }
    const cons = countBy(consultations, (c) => cle(c.datecons));
    const rv = countBy(rendezVous, (r) => cle(r.date_rv));
    return { unite, data: axe.map((label) => ({ periode: label, Consultations: cons[label] || 0, "Rendez-vous": rv[label] || 0 })) };
};

export const repartitionSexe = (consultations) => {
    const parSexe = countBy(consultations, (c) => (c.sexe_patient === "FE" ? "Femmes" : c.sexe_patient === "MA" ? "Hommes" : "Non renseigné"));
    return sortEntries(parSexe).map(([name, value]) => ({ name, value }));
};

export const repartitionAge = (consultations) =>
    TRANCHES_AGE.map((tranche) => ({
        tranche: tranche.label,
        Patients: consultations.filter((c) => c.age_patient >= tranche.min && c.age_patient <= tranche.max).length,
    }));

export const repartitionType = (consultations) =>
    sortEntries(countBy(consultations, (c) => c.type_patient || "Non renseigné")).map(([name, value]) => ({ name, value }));

export const repartitionHeures = (consultations) => {
    const parHeure = countBy(consultations, (c) => dayjs(c.datecons).hour());
    return Array.from({ length: 24 }, (_, h) => ({ heure: `${h}h`, Consultations: parHeure[h] || 0 }))
        .filter((row, index) => index >= 6 && index <= 20);
};

export const repartitionJours = (consultations) => {
    const parJour = countBy(consultations, (c) => dayjs(c.datecons).day());
    // Lundi -> Dimanche
    return [1, 2, 3, 4, 5, 6, 0].map((d) => ({ jour: JOURS[d], Consultations: parJour[d] || 0 }));
};

/* ------------------------------------------------------------------ */
/* Tableaux                                                            */
/* ------------------------------------------------------------------ */

// Classement d'une dimension avec comparaison à la période précédente
export const classement = ({ courant, precedent, keyFn, labelFn = (k) => k, limite = 15 }) => {
    const total = courant.length;
    const parCle = countBy(courant, keyFn);
    const parClePrecedent = countBy(precedent, keyFn);
    return sortEntries(parCle).slice(0, limite).map(([cle, nombre], index) => ({
        key: cle,
        rang: index + 1,
        libelle: labelFn(cle),
        nombre,
        part: pct(nombre, total),
        precedent: parClePrecedent[cle] || 0,
        evolution: evolution(nombre, parClePrecedent[cle] || 0),
    }));
};

export const activiteParMedecin = ({ consultations, prescriptions }) => {
    const medecinParCons = Object.fromEntries(consultations.map((c) => [c.numcons, c.medecin]));
    const lignes = {};
    const ligne = (medecin) => {
        if (!lignes[medecin]) {
            lignes[medecin] = { key: medecin, medecin, consultations: 0, patients: new Set(), ordonnances: 0, analyses: 0, imageries: 0, repos: 0, joursRepos: 0, fievres: 0 };
        }
        return lignes[medecin];
    };
    consultations.forEach((c) => {
        if (!c.medecin) return;
        const l = ligne(c.medecin);
        l.consultations += 1;
        l.patients.add(c.numpat);
        if (c.nb_jours_rm > 0) { l.repos += 1; l.joursRepos += c.nb_jours_rm; }
        if (c.temp > SEUIL_FIEVRE) l.fievres += 1;
    });
    prescriptions.forEach((p) => {
        const medecin = medecinParCons[p.numcons];
        if (!medecin) return;
        const l = ligne(medecin);
        if (p.codepresc === codesPrescriptions.ORD) l.ordonnances += 1;
        if (p.codepresc === codesPrescriptions.ANA) l.analyses += 1;
        if (p.codepresc === codesPrescriptions.IMG) l.imageries += 1;
    });
    const totalCons = consultations.filter((c) => c.medecin).length;
    return Object.values(lignes)
        .map((l) => ({ ...l, patients: l.patients.size, part: pct(l.consultations, totalCons) }))
        .sort((a, b) => b.consultations - a.consultations);
};

// Actes les plus prescrits (médicaments, analyses, imageries)
export const topActes = (prescriptions, codepresc, limite = 15) => {
    const lignes = {};
    prescriptions
        .filter((p) => p.codepresc === codepresc)
        .forEach((p) => {
            (p.listActes || []).forEach((acte) => {
                const cle = normaliserTexte(acte.libacte);
                if (!cle) return;
                if (!lignes[cle]) lignes[cle] = { key: cle, libelle: acte.libacte, prescriptions: 0, quantite: 0 };
                lignes[cle].prescriptions += 1;
                lignes[cle].quantite += acte.qte || 1;
            });
        });
    return Object.values(lignes).sort((a, b) => b.prescriptions - a.prescriptions).slice(0, limite)
        .map((l, index) => ({ ...l, rang: index + 1 }));
};

/* ------------------------------------------------------------------ */
/* Accidents du travail                                                */
/* ------------------------------------------------------------------ */

// Zones de lésions enregistrées en JSON : [{"zone":"MAIN_D","type":"Plaie"}, ...]
const zonesAT = (at) => {
    try {
        const parsed = typeof at.zones_lesions === "string" ? JSON.parse(at.zones_lesions) : at.zones_lesions;
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

export const statistiquesAT = (accidents) => {
    const total = accidents.length;
    const avecArret = accidents.filter((at) => at.itt > 0);
    const joursItt = avecArret.reduce((acc, at) => acc + (at.itt || 0), 0);
    const toutesZones = accidents.flatMap((at) => zonesAT(at).map((zone) => ({ ...zone, num_at: at.num_at })));
    const tableau = (obj) => sortEntries(obj).map(([name, value]) => ({ key: name, name, value, part: pct(value, total) }));
    return {
        total,
        avecArret: avecArret.length,
        tauxArret: pct(avecArret.length, total),
        joursItt,
        ittMoyen: avecArret.length ? Math.round((joursItt / avecArret.length) * 10) / 10 : 0,
        avecCroquis: accidents.filter((at) => zonesAT(at).length > 0).length,
        parLieu: tableau(countBy(accidents, (at) => at.lieu_at || "Non renseigné")),
        parService: tableau(countBy(accidents, (at) => at.service || "Non renseigné")),
        parJour: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
            jour: JOURS[d],
            Accidents: accidents.filter((at) => (at.jour_semaine ? at.jour_semaine === JOURS[d] : at.date_at && dayjs(at.date_at).day() === d)).length,
        })),
        parZone: sortEntries(countBy(toutesZones, (z) => z.zone)).map(([zone, value]) => ({ key: zone, zone, value, part: pct(value, total) })),
        parTypeLesion: sortEntries(countBy(toutesZones, (z) => z.type || "Non précisé")).map(([name, value]) => ({ key: name, name, value })),
        // Toutes les zones touchées sur la période, pour le croquis de synthèse
        zonesCroquis: [...new Set(toutesZones.map((z) => z.zone))].map((zone) => ({ zone })),
    };
};

// Taux de remplissage des champs clés : fiabilité des statistiques
export const qualiteDonnees = (consultations) => {
    const total = consultations.length;
    const champs = [
        { champ: "Diagnostic", fn: (c) => estRenseigne((c.diagnostic || "").trim()) },
        { champ: "Motif de consultation", fn: (c) => estRenseigne(c.code_motifcons) },
        { champ: "Pathologie", fn: (c) => estRenseigne(c.code_patho) },
        { champ: "Région concernée", fn: (c) => estRenseigne(c.code_region) },
        { champ: "Tension", fn: (c) => !!parseTension(c.tension) },
        { champ: "Température", fn: (c) => estRenseigne(c.temp) },
        { champ: "Poids / taille (IMC)", fn: (c) => estRenseigne(c.poids) && estRenseigne(c.taille) },
        { champ: "Sexe du patient", fn: (c) => estRenseigne(c.sexe_patient) },
        { champ: "Type de patient", fn: (c) => estRenseigne(c.type_patient) },
    ];
    return champs.map(({ champ, fn }) => ({ key: champ, champ, taux: pct(consultations.filter(fn).length, total) }));
};

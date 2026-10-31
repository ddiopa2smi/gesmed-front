import dayjs from "dayjs";
import { granularite, normaliserTexte, pct } from "../StatistiquesMedicales/statsUtils";

/**
 * Calculs des statistiques des examens (analyses biologiques, imagerie), sans affichage.
 * Une demande = une prescription (codepresc "01" analyses, "02" imagerie) ; un examen = une ligne (listActes).
 * Une demande est réalisée (clôturée) quand isdone = "Oui".
 */

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const SEUIL_RETARD_MINUTES = 24 * 60;

const countBy = (rows, keyFn) =>
    rows.reduce((acc, row) => {
        const key = keyFn(row);
        if (key !== null && key !== undefined && key !== "") acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

const mediane = (valeurs) => {
    if (!valeurs.length) return null;
    const tri = [...valeurs].sort((a, b) => a - b);
    const m = Math.floor(tri.length / 2);
    return tri.length % 2 ? tri[m] : (tri[m - 1] + tri[m]) / 2;
};

const percentile = (valeurs, p) => {
    if (!valeurs.length) return null;
    const tri = [...valeurs].sort((a, b) => a - b);
    return tri[Math.min(tri.length - 1, Math.floor(tri.length * p))];
};

export const estRealisee = (demande) => demande.isdone === "Oui";

// Délai entre la prescription et la clôture, en minutes
export const delaiRealisation = (demande) =>
    estRealisee(demande) && demande.date_effet && demande.datepresc
        ? Math.max(0, dayjs(demande.date_effet).diff(dayjs(demande.datepresc), "minute"))
        : null;

// Un même prescripteur est saisi de plusieurs façons ("Dr Kadialy SAMBOU", "DOCTEUR KADIALY SAMBOU")
export const clePrescripteur = (nom) =>
    normaliserTexte(nom).replace(/^(DOCTEUR|DOCTEURE|DR|DRE|PR|PROFESSEUR)\.?\s+/, "").replace(/^(MME|MR|M\.)\s+/, "");

/* ------------------------------------------------------------------ */
/* Indicateurs clés                                                    */
/* ------------------------------------------------------------------ */

export const calculerKpisExamens = (demandes) => {
    const realisees = demandes.filter(estRealisee);
    const enAttente = demandes.filter((d) => !estRealisee(d));
    const delais = realisees.map(delaiRealisation).filter((d) => d !== null);
    const examens = demandes.flatMap((d) => d.listActes || []);
    const examensRealises = realisees.flatMap((d) => d.listActes || []);
    const avecResultat = realisees.filter((d) => d.resultat).length;
    const attenteAncienne = enAttente.filter((d) => dayjs().diff(dayjs(d.datepresc), "minute") > SEUIL_RETARD_MINUTES).length;

    return {
        demandes: demandes.length,
        realisees: realisees.length,
        enAttente: enAttente.length,
        tauxRealisation: pct(realisees.length, demandes.length),
        delaiMedian: mediane(delais),
        delaiP90: percentile(delais, 0.9),
        tauxRetard: pct(delais.filter((d) => d > SEUIL_RETARD_MINUTES).length, delais.length),
        avecResultat,
        tauxResultat: pct(avecResultat, realisees.length),
        sansResultat: realisees.length - avecResultat,
        examens: examens.length,
        examensRealises: examensRealises.length,
        examensParDemande: demandes.length ? Math.round((examens.length / demandes.length) * 100) / 100 : 0,
        externes: demandes.filter((d) => d.type_prescription === "Externe").length,
        tauxExternes: pct(demandes.filter((d) => d.type_prescription === "Externe").length, demandes.length),
        patients: new Set(demandes.map((d) => d.num_patient)).size,
        attenteAncienne,
    };
};

/* ------------------------------------------------------------------ */
/* Séries                                                              */
/* ------------------------------------------------------------------ */

export const serieExamens = ({ demandes, range }) => {
    const unite = granularite(range);
    const cle = (value) => {
        const d = dayjs(value);
        if (unite === "heure") return d.format("HH[h]");
        if (unite === "jour") return d.format("DD/MM");
        if (unite === "semaine") return `S${d.startOf("week").format("DD/MM")}`;
        return d.format("MMM YY");
    };
    const axe = [];
    const pas = unite === "heure" ? "hour" : unite === "jour" ? "day" : unite === "semaine" ? "week" : "month";
    let curseur = range[0].startOf(unite === "semaine" ? "week" : unite === "heure" ? "day" : unite);
    const limite = unite === "heure" ? range[0].endOf("day") : range[1];
    while (!curseur.isAfter(limite) && axe.length < 400) {
        const label = cle(curseur);
        if (!axe.includes(label)) axe.push(label);
        curseur = curseur.add(1, pas);
    }
    const recues = countBy(demandes, (d) => cle(d.datepresc));
    const realisees = countBy(demandes.filter(estRealisee), (d) => cle(d.date_effet || d.datepresc));
    return { unite, data: axe.map((label) => ({ periode: label, "Reçues": recues[label] || 0, "Réalisées": realisees[label] || 0 })) };
};

// Affluence : heure de réception des demandes et heure de réalisation
export const affluenceHoraire = (demandes) => {
    const reception = countBy(demandes, (d) => dayjs(d.datepresc).hour());
    const realisation = countBy(demandes.filter((d) => estRealisee(d) && d.date_effet), (d) => dayjs(d.date_effet).hour());
    return Array.from({ length: 24 }, (_, h) => ({ heure: `${h}h`, "Reçues": reception[h] || 0, "Réalisées": realisation[h] || 0 }))
        .filter((_, h) => h >= 6 && h <= 20);
};

export const affluenceJours = (demandes) => {
    const parJour = countBy(demandes, (d) => dayjs(d.datepresc).day());
    return [1, 2, 3, 4, 5, 6, 0].map((j) => ({ jour: JOURS[j], Demandes: parJour[j] || 0 }));
};

export const repartitionOrigine = (demandes) =>
    Object.entries(countBy(demandes, (d) => (d.type_prescription === "Externe" ? "Externes" : "Internes")))
        .map(([name, value]) => ({ name, value }));

// Demandes par type de patient (Permanent, Epouse, Enfant...), comparées à la période précédente
export const parTypePatient = ({ courant, precedent }) => {
    const libelle = (d) => d.type_patient || "Non renseigné";
    const lignes = {};
    courant.forEach((d) => {
        const type = libelle(d);
        if (!lignes[type]) lignes[type] = { key: type, type, demandes: 0, examens: 0, realisees: 0 };
        lignes[type].demandes += 1;
        lignes[type].examens += (d.listActes || []).length;
        if (estRealisee(d)) lignes[type].realisees += 1;
    });
    const demandesPrec = countBy(precedent, libelle);
    return Object.values(lignes)
        .map((l) => ({ ...l, part: pct(l.demandes, courant.length), precedent: demandesPrec[l.type] || 0 }))
        .sort((a, b) => b.demandes - a.demandes);
};

/* ------------------------------------------------------------------ */
/* Tableaux                                                            */
/* ------------------------------------------------------------------ */

// Examens les plus demandés (libellés regroupés sans tenir compte des accents / majuscules)
export const topExamens = ({ courant, precedent, catalogue, limite = 25 }) => {
    const categorieParCode = Object.fromEntries((catalogue || []).map((a) => [a.codeacte, a.categorie]));
    const agreger = (demandes) => {
        const lignes = {};
        demandes.forEach((d) => (d.listActes || []).forEach((acte) => {
            const cle = normaliserTexte(acte.libacte);
            if (!cle) return;
            if (!lignes[cle]) lignes[cle] = { key: cle, libelle: acte.libacte, categorie: categorieParCode[acte.codeacte] || "Autres", nombre: 0, realises: 0 };
            lignes[cle].nombre += acte.qte || 1;
            if (estRealisee(d)) lignes[cle].realises += acte.qte || 1;
        }));
        return lignes;
    };
    const lignes = agreger(courant);
    const lignesPrec = agreger(precedent);
    const total = Object.values(lignes).reduce((acc, l) => acc + l.nombre, 0);
    return Object.values(lignes)
        .sort((a, b) => b.nombre - a.nombre)
        .slice(0, limite)
        .map((l, i) => {
            const prec = lignesPrec[l.key]?.nombre || 0;
            return { ...l, rang: i + 1, part: pct(l.nombre, total), precedent: prec, evolution: prec ? Math.round(((l.nombre - prec) / prec) * 1000) / 10 : null };
        });
};

export const parCategorie = (demandes, catalogue) => {
    const categorieParCode = Object.fromEntries((catalogue || []).map((a) => [a.codeacte, a.categorie]));
    const parCat = {};
    demandes.forEach((d) => (d.listActes || []).forEach((acte) => {
        const cat = categorieParCode[acte.codeacte] || "Autres";
        parCat[cat] = (parCat[cat] || 0) + (acte.qte || 1);
    }));
    const total = Object.values(parCat).reduce((a, b) => a + b, 0);
    return Object.entries(parCat).sort((a, b) => b[1] - a[1])
        .map(([categorie, nombre]) => ({ key: categorie, categorie, nombre, part: pct(nombre, total) }));
};

export const parPrescripteur = (demandes, limite = 20) => {
    const lignes = {};
    demandes.forEach((d) => {
        const cle = d.prescripteur ? clePrescripteur(d.prescripteur) : "__AUCUN__";
        if (!lignes[cle]) {
            lignes[cle] = {
                key: cle,
                prescripteur: d.prescripteur || (d.type_prescription === "Externe" ? "Prescripteur externe non renseigné" : "Non renseigné"),
                demandes: 0, examens: 0, realisees: 0,
            };
        }
        // Libellé préféré : la forme "Dr ..." si elle existe
        if (d.prescripteur && /^dr\s/i.test(d.prescripteur)) lignes[cle].prescripteur = d.prescripteur;
        lignes[cle].demandes += 1;
        lignes[cle].examens += (d.listActes || []).length;
        if (estRealisee(d)) lignes[cle].realisees += 1;
    });
    const total = demandes.length;
    return Object.values(lignes)
        .map((l) => ({ ...l, part: pct(l.demandes, total), tauxRealisation: pct(l.realisees, l.demandes) }))
        .sort((a, b) => b.demandes - a.demandes)
        .slice(0, limite);
};

export const parTechnicien = (demandes) => {
    const lignes = {};
    demandes.filter(estRealisee).forEach((d) => {
        const nom = d.effectue_par || "Non renseigné";
        if (!lignes[nom]) lignes[nom] = { key: nom, technicien: nom, demandes: 0, examens: 0, resultats: 0, delais: [] };
        lignes[nom].demandes += 1;
        lignes[nom].examens += (d.listActes || []).length;
        if (d.resultat) lignes[nom].resultats += 1;
        const delai = delaiRealisation(d);
        if (delai !== null) lignes[nom].delais.push(delai);
    });
    return Object.values(lignes)
        .map(({ delais, ...l }) => ({ ...l, delaiMedian: mediane(delais), tauxResultat: pct(l.resultats, l.demandes) }))
        .sort((a, b) => b.demandes - a.demandes);
};

const ligneDemande = (d) => ({
    key: d.numpresc,
    numpresc: d.numpresc,
    datepresc: d.datepresc,
    date_effet: d.date_effet,
    patient: d.patient,
    prescripteur: d.prescripteur,
    origine: d.type_prescription,
    examens: (d.listActes || []).map((a) => a.libacte).join(", "),
});

// Demandes en attente, les plus anciennes d'abord
export const demandesEnAttente = (demandes, limite = 30) =>
    demandes.filter((d) => !estRealisee(d))
        .map((d) => ({ ...ligneDemande(d), age: dayjs().diff(dayjs(d.datepresc), "day") }))
        .sort((a, b) => b.age - a.age)
        .slice(0, limite);

// Demandes clôturées dont le résultat n'a pas été déposé : à compléter
export const realiseesSansResultat = (demandes, limite = 50) =>
    demandes.filter((d) => estRealisee(d) && !d.resultat)
        .map(ligneDemande)
        .sort((a, b) => dayjs(b.date_effet).valueOf() - dayjs(a.date_effet).valueOf())
        .slice(0, limite);

// Qualité des données des demandes
export const qualiteDemandes = (demandes) => {
    const total = demandes.length;
    const examens = demandes.flatMap((d) => d.listActes || []);
    return [
        { champ: "Prescripteur renseigné", taux: pct(demandes.filter((d) => d.prescripteur).length, total) },
        { champ: "Rattachée à une consultation", taux: pct(demandes.filter((d) => d.numcons).length, total) },
        { champ: "Diagnostic / renseignement clinique", taux: pct(demandes.filter((d) => (d.diagnostic || "").trim()).length, total) },
        { champ: "Motif de l'examen (par examen)", taux: pct(examens.filter((a) => a.observation || a.motifImagerie).length, examens.length) },
        { champ: "Résultat déposé (demandes réalisées)", taux: pct(demandes.filter((d) => estRealisee(d) && d.resultat).length, demandes.filter(estRealisee).length) },
        { champ: "Tarif de l'examen", taux: pct(examens.filter((a) => a.tarif > 0).length, examens.length) },
    ].map((q) => ({ ...q, key: q.champ }));
};

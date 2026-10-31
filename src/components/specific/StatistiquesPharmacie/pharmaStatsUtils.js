import dayjs from "dayjs";
import { pct, granularite, normaliserTexte } from "../StatistiquesMedicales/statsUtils";

/**
 * Calculs des statistiques de la pharmacie (sans affichage).
 * Ordonnances = prescriptions de type "06" ; une ordonnance est servie quand isdone = "Oui".
 */

const countBy = (rows, keyFn) =>
    rows.reduce((acc, row) => {
        const key = keyFn(row);
        if (key !== null && key !== undefined && key !== "") acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

const mediane = (valeurs) => {
    if (!valeurs.length) return null;
    const tri = [...valeurs].sort((a, b) => a - b);
    const milieu = Math.floor(tri.length / 2);
    return tri.length % 2 ? tri[milieu] : (tri[milieu - 1] + tri[milieu]) / 2;
};

const percentile = (valeurs, p) => {
    if (!valeurs.length) return null;
    const tri = [...valeurs].sort((a, b) => a - b);
    return tri[Math.min(tri.length - 1, Math.floor(tri.length * p))];
};

// Délai entre la prescription et le service, en minutes
const delaiService = (ordonnance) =>
    ordonnance.date_effet && ordonnance.datepresc
        ? Math.max(0, dayjs(ordonnance.date_effet).diff(dayjs(ordonnance.datepresc), "minute"))
        : null;

// Montant servi d'une ligne : tarif unitaire x quantité servie, arrondi au franc supérieur
const montantLigne = (ligne) =>
    ligne.dispo === "Non" ? 0 : Math.ceil((Number(ligne.tarif) || 0) * (Number(ligne.qte_servie) || 0));

export const montantOrdonnance = (ordonnance) =>
    (ordonnance.listActes || []).reduce((acc, ligne) => acc + montantLigne(ligne), 0);

export const formatDuree = (minutes) => {
    if (minutes === null || minutes === undefined) return "—";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    if (minutes < 60 * 24) return `${(minutes / 60).toFixed(1).replace(".", ",")} h`;
    return `${(minutes / 60 / 24).toFixed(1).replace(".", ",")} j`;
};

/* ------------------------------------------------------------------ */
/* Indicateurs clés                                                    */
/* ------------------------------------------------------------------ */

export const calculerKpisPharmacie = ({ ordonnances, commandes, receptions, sorties }) => {
    const servies = ordonnances.filter((o) => o.isdone === "Oui");
    const enAttente = ordonnances.filter((o) => o.isdone !== "Oui");
    const delais = servies.map(delaiService).filter((d) => d !== null);
    const lignesServies = servies.flatMap((o) => o.listActes || []);
    const qtePrescrite = lignesServies.reduce((acc, l) => acc + (l.qte || 0), 0);
    const qteServie = lignesServies.reduce((acc, l) => acc + (l.dispo === "Non" ? 0 : (l.qte_servie || 0)), 0);
    const valeur = servies.reduce((acc, o) => acc + montantOrdonnance(o), 0);
    const lignesIncompletes = lignesServies.filter((l) => l.dispo === "Non" || (l.qte_servie || 0) < (l.qte || 0)).length;

    return {
        ordonnances: ordonnances.length,
        servies: servies.length,
        enAttente: enAttente.length,
        tauxService: pct(servies.length, ordonnances.length),
        delaiMedian: mediane(delais),
        delaiP90: percentile(delais, 0.9),
        valeur,
        panierMoyen: servies.length ? Math.round(valeur / servies.length) : 0,
        lignesParOrdonnance: ordonnances.length
            ? Math.round((ordonnances.reduce((acc, o) => acc + (o.listActes || []).length, 0) / ordonnances.length) * 10) / 10
            : 0,
        tauxSatisfaction: pct(qteServie, qtePrescrite),
        lignesIncompletes,
        medicamentsDistincts: new Set(lignesServies.map((l) => l.codeacte)).size,
        externes: ordonnances.filter((o) => o.type_prescription === "Externe").length,
        commandes: commandes.length,
        montantCommandes: commandes.reduce((acc, c) => acc + (c.montant_bc || 0), 0),
        commandesEnCours: commandes.filter((c) => c.etat !== "received").length,
        receptions: receptions.length,
        montantReceptions: receptions.reduce((acc, r) => acc + (r.montant_br || 0), 0),
        sorties: sorties.length,
    };
};

/* ------------------------------------------------------------------ */
/* Séries                                                              */
/* ------------------------------------------------------------------ */

export const serieDispensation = ({ ordonnances, range }) => {
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
    const recues = countBy(ordonnances, (o) => cle(o.datepresc));
    const servies = ordonnances.filter((o) => o.isdone === "Oui");
    const serviesParPeriode = countBy(servies, (o) => cle(o.date_effet || o.datepresc));
    const valeurParPeriode = servies.reduce((acc, o) => {
        const k = cle(o.date_effet || o.datepresc);
        acc[k] = (acc[k] || 0) + montantOrdonnance(o);
        return acc;
    }, {});
    return {
        unite,
        data: axe.map((label) => ({
            periode: label,
            "Reçues": recues[label] || 0,
            Servies: serviesParPeriode[label] || 0,
            "Valeur (FCFA)": valeurParPeriode[label] || 0,
        })),
    };
};

export const heuresDeService = (ordonnances) => {
    const parHeure = countBy(ordonnances.filter((o) => o.isdone === "Oui" && o.date_effet), (o) => dayjs(o.date_effet).hour());
    return Array.from({ length: 24 }, (_, h) => ({ heure: `${h}h`, Servies: parHeure[h] || 0 })).filter((_, h) => h >= 6 && h <= 21);
};

/* ------------------------------------------------------------------ */
/* Tableaux                                                            */
/* ------------------------------------------------------------------ */

// Médicaments dispensés (ordonnances servies) : quantité servie, valeur, nombre d'ordonnances
export const topMedicamentsDispenses = (ordonnances, limite = 20) => {
    const lignes = {};
    ordonnances.filter((o) => o.isdone === "Oui").forEach((o) => {
        (o.listActes || []).forEach((l) => {
            const cle = l.codeacte || normaliserTexte(l.libacte);
            if (!lignes[cle]) lignes[cle] = { key: cle, libelle: l.libacte, ordonnances: 0, quantite: 0, valeur: 0 };
            lignes[cle].ordonnances += 1;
            lignes[cle].quantite += l.dispo === "Non" ? 0 : (l.qte_servie || 0);
            lignes[cle].valeur += montantLigne(l);
        });
    });
    return Object.values(lignes).sort((a, b) => b.valeur - a.valeur || b.quantite - a.quantite).slice(0, limite)
        .map((l, i) => ({ ...l, rang: i + 1 }));
};

// Médicaments en attente de service : demande non satisfaite
export const topMedicamentsEnAttente = (ordonnances, limite = 20) => {
    const lignes = {};
    ordonnances.filter((o) => o.isdone !== "Oui").forEach((o) => {
        (o.listActes || []).forEach((l) => {
            const cle = l.codeacte || normaliserTexte(l.libacte);
            if (!lignes[cle]) lignes[cle] = { key: cle, libelle: l.libacte, ordonnances: 0, quantite: 0 };
            lignes[cle].ordonnances += 1;
            lignes[cle].quantite += l.qte || 0;
        });
    });
    return Object.values(lignes).sort((a, b) => b.ordonnances - a.ordonnances).slice(0, limite)
        .map((l, i) => ({ ...l, rang: i + 1 }));
};

export const activiteParDispensateur = (ordonnances) => {
    const lignes = {};
    ordonnances.filter((o) => o.isdone === "Oui").forEach((o) => {
        const nom = o.effectue_par || "Non renseigné";
        if (!lignes[nom]) lignes[nom] = { key: nom, dispensateur: nom, ordonnances: 0, valeur: 0, delais: [] };
        lignes[nom].ordonnances += 1;
        lignes[nom].valeur += montantOrdonnance(o);
        const d = delaiService(o);
        if (d !== null) lignes[nom].delais.push(d);
    });
    const total = Object.values(lignes).reduce((acc, l) => acc + l.ordonnances, 0);
    return Object.values(lignes)
        .map(({ delais, ...l }) => ({ ...l, part: pct(l.ordonnances, total), delaiMedian: mediane(delais) }))
        .sort((a, b) => b.ordonnances - a.ordonnances);
};

export const activiteParPrescripteur = (ordonnances, limite = 20) => {
    const lignes = {};
    ordonnances.forEach((o) => {
        const nom = o.prescripteur || "Non renseigné";
        if (!lignes[nom]) lignes[nom] = { key: nom, prescripteur: nom, ordonnances: 0, servies: 0 };
        lignes[nom].ordonnances += 1;
        if (o.isdone === "Oui") lignes[nom].servies += 1;
    });
    return Object.values(lignes)
        .map((l) => ({ ...l, tauxService: pct(l.servies, l.ordonnances) }))
        .sort((a, b) => b.ordonnances - a.ordonnances).slice(0, limite);
};

// Ordonnances en attente les plus anciennes : à traiter en priorité
export const ordonnancesEnAttente = (ordonnances, limite = 30) =>
    ordonnances
        .filter((o) => o.isdone !== "Oui")
        .map((o) => ({
            key: o.numpresc,
            numpresc: o.numpresc,
            datepresc: o.datepresc,
            patient: o.patient,
            prescripteur: o.prescripteur,
            lignes: (o.listActes || []).length,
            age: dayjs().diff(dayjs(o.datepresc), "day"),
        }))
        .sort((a, b) => b.age - a.age)
        .slice(0, limite);

export const repartitionOrigine = (ordonnances) =>
    Object.entries(countBy(ordonnances, (o) => (o.type_prescription === "Externe" ? "Externes" : "Internes")))
        .map(([name, value]) => ({ name, value }));

/* ------------------------------------------------------------------ */
/* Approvisionnement et stock                                          */
/* ------------------------------------------------------------------ */

export const parFournisseur = (commandes) => {
    const lignes = {};
    commandes.forEach((c) => {
        const nom = c.fourn_raisoc || c.code_fourn || "Non renseigné";
        if (!lignes[nom]) lignes[nom] = { key: nom, fournisseur: nom, commandes: 0, montant: 0 };
        lignes[nom].commandes += 1;
        lignes[nom].montant += c.montant_bc || 0;
    });
    const total = Object.values(lignes).reduce((acc, l) => acc + l.montant, 0);
    return Object.values(lignes).map((l) => ({ ...l, part: pct(l.montant, total) })).sort((a, b) => b.montant - a.montant);
};

// Délai entre la commande et la livraison (réception rattachée par num_bc), en jours
export const delaisLivraison = (commandes, receptions) => {
    const parBc = Object.fromEntries(receptions.map((r) => [r.num_bc, r]));
    const delais = commandes
        .map((c) => parBc[c.num_bc] && c.date_bc && parBc[c.num_bc].date_liv
            ? dayjs(parBc[c.num_bc].date_liv).diff(dayjs(c.date_bc), "day") : null)
        .filter((d) => d !== null && d >= 0);
    return { median: mediane(delais), nombre: delais.length };
};

// Lots reçus et leur date de péremption (toutes réceptions, indépendamment de la période)
export const lotsPeremption = (receptions) =>
    receptions
        .flatMap((r) => (r.listProd || []).map((p) => ({ ...p, num_br: r.num_br, fournisseur: r.fourn_raisoc })))
        .filter((p) => p.date_peremption)
        .map((p, i) => {
            const jours = dayjs(p.date_peremption).startOf("day").diff(dayjs().startOf("day"), "day");
            return {
                key: `${p.num_br}-${p.code_prod}-${p.num_lot || i}`,
                produit: p.libelle_produit,
                lot: p.num_lot,
                peremption: p.date_peremption,
                quantite: p.qte_liv,
                fournisseur: p.fournisseur,
                jours,
                statut: jours < 0 ? "Périmé" : jours <= 90 ? "Moins de 3 mois" : jours <= 180 ? "3 à 6 mois" : "Plus de 6 mois",
            };
        })
        .sort((a, b) => a.jours - b.jours);

export const sortiesParMotif = (sorties) =>
    Object.entries(countBy(sorties, (s) => {
        const motif = normaliserTexte(s.motif_sortie);
        if (motif.startsWith("PERIM")) return "Péremption";
        if (motif.startsWith("DEFAUT")) return "Défaut / casse";
        return s.motif_sortie || "Non renseigné";
    })).map(([name, value]) => ({ key: name, name, value }));

// Qualité du référentiel produits : conditionne la fiabilité des montants et du stock
export const qualiteReferentiel = (produits) => {
    const total = produits.length;
    const accentInvalide = (v) => /�/.test(String(v || ""));
    return [
        { champ: "Prix de vente", taux: pct(produits.filter((p) => p.prix_vente > 0).length, total) },
        { champ: "Prix d'achat (calcul des marges)", taux: pct(produits.filter((p) => p.prix_achat > 0).length, total) },
        { champ: "Famille thérapeutique", taux: pct(produits.filter((p) => p.libelle_famille).length, total) },
        { champ: "Unité de distribution lisible", taux: pct(produits.filter((p) => p.unite_distribution && !accentInvalide(p.unite_distribution)).length, total) },
        { champ: "Quantité par emballage (> 1)", taux: pct(produits.filter((p) => p.qte_emb > 1).length, total) },
        { champ: "Stock théorique (> 0)", taux: pct(produits.filter((p) => p.qte_stock_th > 0).length, total) },
    ].map((q) => ({ ...q, key: q.champ }));
};

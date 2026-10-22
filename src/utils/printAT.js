import dayjs from "dayjs";
import { images } from "../constants/app.constants";
import { bodyMapSvgMarkup, parseZonesLesions, ZONES_LESIONS } from "../components/common/BodyMap/BodyMap";

/**
 * Impression de la fiche récapitulative d'un accident du travail (format A4).
 * La fiche est générée en HTML puis envoyée à l'impression du navigateur,
 * qui permet aussi de l'enregistrer en PDF ("Enregistrer au format PDF").
 */

const CIRCONSTANCES_PREFIXES = { avant: "Avant :", au_moment: "Au moment :", apres: "Après :" };

// "Avant : ...\nAu moment : ...\nAprès : ..." -> { avant, au_moment, apres }
// Un texte sans ces préfixes (ancienne saisie) est repris tel quel dans "avant".
export const parseCirconstances = (text) => {
    if (!text) return {};
    const result = {};
    let currentKey = null;
    text.split("\n").forEach((line) => {
        const key = Object.keys(CIRCONSTANCES_PREFIXES).find((k) => line.startsWith(CIRCONSTANCES_PREFIXES[k]));
        if (key) {
            currentKey = key;
            result[key] = line.slice(CIRCONSTANCES_PREFIXES[key].length).trim();
        } else {
            currentKey = currentKey || "avant";
            result[currentKey] = result[currentKey] ? `${result[currentKey]}\n${line}` : line;
        }
    });
    return result;
};

const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const isEmpty = (value) => value === null || value === undefined || value === "" || value === "0001-01-01T00:00:00";

// Valeur affichée : texte échappé (retours à la ligne conservés) ou tiret si vide
const show = (value) => (isEmpty(value) ? '<span class="empty">—</span>' : escapeHtml(value).replace(/\n/g, "<br/>"));
const showDate = (value) => (isEmpty(value) ? show(null) : dayjs(value).format("DD/MM/YYYY"));
const showDateTime = (value) => (isEmpty(value) ? show(null) : dayjs(value).format("DD/MM/YYYY à HH:mm"));
const showTime = (value) => (isEmpty(value) ? show(null) : dayjs(value).format("HH:mm"));
const showSexe = (value) => (value === "MA" ? "Masculin" : value === "FE" ? "Féminin" : show(value));
const showAge = (datenaiss) => (isEmpty(datenaiss) ? "" : ` (${dayjs().diff(dayjs(datenaiss), "year")} ans)`);

// Grille de champs "libellé / valeur"
const fields = (items, columns = 3) => `
    <table class="fields cols-${columns}">
        ${chunk(items, columns).map((row) => `
            <tr>
                ${row.map(([label, value]) => `<td><div class="label">${label}</div><div class="value">${value}</div></td>`).join("")}
                ${"<td></td>".repeat(columns - row.length)}
            </tr>`).join("")}
    </table>`;

const chunk = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));
    return result;
};

const section = (number, title, content) => `
    <section>
        <h2><span class="num">${number}</span>${title}</h2>
        ${content}
    </section>`;

const buildHtml = (at) => {
    const lesions = parseZonesLesions(at.zones_lesions);
    const circonstances = parseCirconstances(at.circonstances);
    const user = JSON.parse(sessionStorage.getItem("userConnected") || "null");

    const lesionsTable = lesions.length
        ? `<table class="list">
                <thead><tr><th>Zone</th><th>Type de lésion</th></tr></thead>
                <tbody>${lesions.map((lesion) => `<tr><td>${show(ZONES_LESIONS[lesion.zone] || lesion.zone)}</td><td>${show(lesion.type)}</td></tr>`).join("")}</tbody>
           </table>`
        : '<p class="empty">Aucune zone marquée sur le croquis.</p>';

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>Fiche AT ${escapeHtml(at.num_at || "")} - ${escapeHtml(at.prenoms || "")} ${escapeHtml(at.nom || "")}</title>
<style>
    /* Les marges de page définies ici remplacent les en-têtes / pieds de page du navigateur
       (adresse de la page, date...) : seule la pagination est conservée, en bas à droite. */
    @page {
        size: A4;
        margin: 14mm 14mm 16mm 14mm;
        @bottom-left { content: ""; }
        @bottom-right { content: counter(page) "/" counter(pages); font-family: Arial, sans-serif; font-size: 8pt; color: #555; }
    }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #222; margin: 0; }
    header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #31bae8; padding-bottom: 8px; margin-bottom: 12px; }
    header img { height: 52px; }
    header .org { font-size: 9pt; color: #555; line-height: 1.4; }
    header .ref { text-align: right; font-size: 9pt; color: #555; line-height: 1.5; }
    header .ref strong { color: #222; font-size: 11pt; }
    h1 { text-align: center; font-size: 15pt; letter-spacing: 1px; margin: 4px 0 2px; color: #9f5822; }
    .subtitle { text-align: center; font-size: 9pt; color: #666; margin-bottom: 12px; }
    section { margin-bottom: 10px; page-break-inside: avoid; }
    h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.5px; background: #eef8fc; color: #1d6f8c; padding: 4px 8px; margin: 0 0 6px; border-left: 4px solid #31bae8; }
    h2 .num { display: inline-block; min-width: 18px; font-weight: 700; }
    h3 { font-size: 9.5pt; margin: 8px 0 4px; color: #444; }
    table { width: 100%; border-collapse: collapse; }
    .fields td { vertical-align: top; padding: 3px 8px 5px 0; }
    .fields.cols-3 td { width: 33.33%; }
    .fields.cols-2 td { width: 50%; }
    .fields.cols-1 td { width: 100%; }
    .label { font-size: 8pt; color: #777; text-transform: uppercase; letter-spacing: 0.3px; }
    .value { font-weight: 600; min-height: 14px; }
    .empty { color: #aaa; font-weight: 400; }
    .list th, .list td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
    .list th { background: #f5f5f5; font-size: 9pt; }
    .lesions { display: flex; gap: 16px; align-items: flex-start; }
    .lesions .map { display: flex; gap: 6px; text-align: center; font-size: 8pt; color: #666; }
    .lesions .details { flex: 1; }
    .text-block { border: 1px solid #ddd; border-radius: 4px; padding: 6px 8px; min-height: 28px; margin-bottom: 4px; }
    .signatures { display: flex; gap: 12px; margin-top: 18px; page-break-inside: avoid; }
    .signatures div { flex: 1; border: 1px solid #ccc; border-radius: 4px; height: 80px; padding: 6px 8px; font-size: 9pt; color: #555; }
    footer { margin-top: 14px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 8pt; color: #888; display: flex; justify-content: space-between; }
</style>
</head>
<body>
    <header>
        <div style="display:flex;align-items:center;gap:12px">
            <img src="${new URL(images.logo, window.location.href).href}" alt="Logo"/>
            <div class="org">Service médical<br/>Médecine du travail</div>
        </div>
        <div class="ref">
            <strong>N° AT : ${show(at.num_at)}</strong><br/>
            N° carnet AT : ${show(at.num_carnet_at)}<br/>
            Édité le ${dayjs().format("DD/MM/YYYY à HH:mm")}
        </div>
    </header>

    <h1>FICHE D'ACCIDENT DU TRAVAIL</h1>
    <div class="subtitle">Rapport récapitulatif de l'accident et des soins</div>

    ${section("1", "Identification de la victime", fields([
        ["Matricule", show(at.matricule)],
        ["Nom", show(at.nom)],
        ["Prénom(s)", show(at.prenoms)],
        ["Sexe", showSexe(at.sexe)],
        ["Date de naissance", `${showDate(at.datenaiss)}${showAge(at.datenaiss)}`],
        ["Lieu de résidence", show(at.lieu_residence)],
        ["Service", show(at.service)],
        ["Emploi occupé", show(at.emploi)],
        ["Horaire de travail", show(at.horaire_travail)],
    ]))}

    ${section("2", "L'accident", fields([
        ["Date et heure", showDateTime(at.date_at)],
        ["Jour de la semaine", show(at.jour_semaine)],
        ["Lieu exact", show(at.lieu_at)],
        ["Date de déclaration", showDate(at.date_declaration)],
        ["N° carnet AT", show(at.num_carnet_at)],
    ]))}

    ${section("3", "Lésions", `
        <div class="lesions">
            <div class="map">
                <div>${bodyMapSvgMarkup(lesions, "face", 105)}<br/>Face</div>
                <div>${bodyMapSvgMarkup(lesions, "dos", 105)}<br/>Dos</div>
            </div>
            <div class="details">
                ${lesionsTable}
                <h3>Nature et siège des lésions</h3>
                <div class="text-block">${show(at.nature_lesions)}</div>
            </div>
        </div>`)}

    ${section("4", "Premiers soins et transport", `
        <h3>Premiers soins</h3>
        ${fields([
            ["Heure", showTime(at.heure_premiers_soins)],
            ["Par qui", show(at.structure_premiers_soins)],
        ], 2)}
        <h3>Transport de la victime</h3>
        ${fields([
            ["Destination", show(at.lieu_transport)],
            ["Heure", showTime(at.heure_transport)],
            ["Par qui", show(at.structure_tansport)],
            ["Moyen de transport", show(at.moyen_transport)],
        ], 2)}`)}

    ${section("5", "Témoins", fields([
        ["Qui a vu", show(at.temoin_vu)],
        ["Qui a entendu", show(at.temoin_entendu)],
        ["Premier avisé", show(at.temoin_avise)],
    ]))}

    ${section("6", "Circonstances de l'accident", `
        <h3>Avant (action dans laquelle la victime était engagée)</h3>
        <div class="text-block">${show(circonstances.avant)}</div>
        <h3>Au moment de l'accident</h3>
        <div class="text-block">${show(circonstances.au_moment)}</div>
        <h3>Après (intervention, mesures immédiates)</h3>
        <div class="text-block">${show(circonstances.apres)}</div>`)}

    ${section("7", "Suites et conséquences", `
        ${fields([
            ["Certificat médical", show(at.certicat_medical)],
            ["ITT", isEmpty(at.itt) || at.itt === 0 ? show(null) : `${escapeHtml(at.itt)} jour(s)`],
            ["Date de guérison prévue", showDate(at.date_guerison_prevue)],
            ["Date de consolidation", showDate(at.date_consolidation)],
        ], 2)}
        <h3>Recherche des causes</h3>
        ${fields([
            ["Date prévue", showDate(at.causes_date_prevue)],
            ["Par qui", show(at.causes_par_qui)],
            ["Avec qui", show(at.causes_avec_qui)],
        ])}
        <h3>Mesures prises</h3>
        <div class="text-block">${show(at.mesures_prises)}</div>`)}

    <div class="signatures">
        <div>Le médecin<br/>${user?.username ? escapeHtml(user.username) : ""}<br/>Date et signature :</div>
        <div>La victime<br/><br/>Date et signature :</div>
        <div>L'employeur / Le responsable<br/><br/>Date, cachet et signature :</div>
    </div>

    <footer>
        <span>Document confidentiel — soumis au secret médical</span>
        <span>Fiche AT ${show(at.num_at)}</span>
    </footer>
</body>
</html>`;
};

export const printAccidentTravail = (at) => {
    // Impression via un iframe caché : pas de nouvel onglet ni de bloqueur de fenêtres
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(buildHtml(at));
    doc.close();

    const print = () => {
        // Le titre du document sert de nom de fichier proposé pour l'enregistrement en PDF
        const previousTitle = document.title;
        document.title = doc.title;
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.title = previousTitle;
        setTimeout(() => iframe.remove(), 1000);
    };

    // Attendre le chargement du logo avant d'imprimer
    const logo = doc.querySelector("img");
    if (logo && !logo.complete) {
        logo.onload = print;
        logo.onerror = print;
    } else {
        print();
    }
};

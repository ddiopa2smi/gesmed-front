import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import dayjs from "dayjs";
import { images } from "../constants/app.constants";
import Odontogramme from "../components/common/Odontogramme/Odontogramme";
import { ETATS_DENT, calculerCao, conseilsPourActes, decrireDent, lireFaces, nomsFaces } from "./dentaire";

/**
 * Documents du cabinet dentaire, imprimés (ou enregistrés en PDF) via le navigateur :
 * fiche dentaire, plan de traitement et conseils remis au patient.
 */

const echapper = (valeur) => String(valeur ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const libelleDents = (dents) => (dents ? dents.split(",").join(", ") : "Bouche entière");

const STYLES = `
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #222; background: #fff; margin: 0; }
    .entete { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #31bae8; padding-bottom: 8px; margin-bottom: 12px; }
    .entete img { height: 46px; margin-right: 12px; }
    .entete .gauche { display: flex; align-items: center; }
    h1 { font-size: 16pt; color: #9f5822; margin: 0; }
    h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .4px; color: #1d6f8c; background: #eef8fc; border-left: 4px solid #31bae8; padding: 4px 8px; margin: 14px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    th { background: #f3f6f8; text-align: left; padding: 5px 6px; border-bottom: 1px solid #d9d9d9; }
    td { padding: 4px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
    .muted { color: #666; font-size: 9pt; }
    .schema { width: 330px; margin: 0 auto; }
    .legende { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 8.5pt; color: #444; justify-content: center; margin-top: 6px; }
    .pastille { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: -1px; border: 1px solid; }
    .alerte { border: 1px solid #ffa39e; background: #fff1f0; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px; }
    ul { margin: 6px 0 0 18px; padding: 0; } li { margin-bottom: 4px; }
    .signature { margin-top: 36px; text-align: right; }
`;

const imprimer = (titre, corps) => {
    // Impression via un iframe caché : pas de nouvel onglet ni de bloqueur de fenêtres
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echapper(titre)}</title><style>${STYLES}</style></head><body>${corps}</body></html>`);
    doc.close();
    // Le logo doit être chargé avant d'imprimer
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1000);
    }, 300);
};

const entete = (titre, patient, consultation) => `
    <div class="entete">
        <div class="gauche">
            <img src="${images.logo}" alt="Logo" />
            <div>
                <h1>${echapper(titre)}</h1>
                <div>${echapper(patient?.prenom_patient)} ${echapper(patient?.nom_patient)} · N° ${echapper(patient?.num_patient)}</div>
            </div>
        </div>
        <div class="muted" style="text-align:right">
            Le ${dayjs(consultation?.datecons || undefined).format("DD/MM/YYYY")}<br/>
            ${consultation?.medecin ? echapper(consultation.medecin) : ""}
        </div>
    </div>`;

const tableauSoins = (soins, vide) => (soins.length ? `
    <table>
        <thead><tr><th>Acte</th><th>Dents</th><th>Observation</th></tr></thead>
        <tbody>${soins.map((s) => `<tr><td><b>${echapper(s.acte)}</b></td><td>${echapper(libelleDents(s.dents))}</td><td>${echapper(s.observation)}</td></tr>`).join("")}</tbody>
    </table>` : `<div class="muted">${vide}</div>`);

const legende = () => `<div class="legende">${Object.values(ETATS_DENT).filter((e) => e.couleur !== "#ffffff")
    .map((e) => `<span><span class="pastille" style="background:${e.couleur};border-color:${e.trait}"></span>${e.label}</span>`).join("")}</div>`;

const alertes = (points) => (points.length
    ? `<div class="alerte"><b>Points de vigilance :</b> ${points.map((p) => echapper(p.label)).join(", ")}</div>`
    : "");

export const imprimerFicheDentaire = ({ patient, consultation, dents, denture, soins, points }) => {
    const schema = renderToStaticMarkup(<Odontogramme dents={dents} denture={denture} />);
    const cao = calculerCao(dents, denture);
    const renseignees = Object.values(dents).filter((d) => d.etat !== "SAINE" || d.faces || d.note || d.mobilite).sort((a, b) => a.dent - b.dent);
    const lignes = renseignees.map((d) => {
        const noms = nomsFaces(d.dent);
        const faces = Object.entries(lireFaces(d.faces)).map(([face, lesion]) => `${noms[face]} (${lesion === "CARIE" ? "carie" : "obturation"})`).join(", ");
        return `<tr><td><b>${echapper(decrireDent(d.dent))}</b></td><td>${ETATS_DENT[d.etat]?.label || ""}</td><td>${echapper(faces)}</td><td>${d.mobilite || ""}</td><td>${echapper(d.note)}</td></tr>`;
    }).join("");

    imprimer(`Fiche dentaire ${patient?.num_patient || ""}`, `
        ${entete("Fiche dentaire", patient, consultation)}
        ${alertes(points)}
        <h2>Schéma dentaire</h2>
        <div class="schema">${schema}</div>
        ${legende()}
        <p style="text-align:center"><b>Indice CAO : ${cao.total}</b> (C : ${cao.C} · A : ${cao.A} · O : ${cao.O})</p>
        <h2>Détail par dent</h2>
        ${lignes ? `<table><thead><tr><th>Dent</th><th>État</th><th>Faces</th><th>Mob.</th><th>Note</th></tr></thead><tbody>${lignes}</tbody></table>` : '<div class="muted">Aucune anomalie notée.</div>'}
        <h2>Diagnostic</h2>
        <div>${echapper(consultation?.diagnostic) || '<span class="muted">Non renseigné</span>'}</div>
        <h2>Soins à faire</h2>
        ${tableauSoins(soins.filter((s) => s.statut === "PLANIFIE"), "Aucun soin planifié.")}
    `);
};

export const imprimerPlanTraitement = ({ patient, consultation, soins }) => {
    imprimer(`Plan de traitement ${patient?.num_patient || ""}`, `
        ${entete("Plan de traitement", patient, consultation)}
        <h2>Soins prévus</h2>
        ${tableauSoins(soins.filter((s) => s.statut === "PLANIFIE"), "Aucun soin planifié.")}
        <h2>Soins réalisés lors de cette séance</h2>
        ${tableauSoins(soins.filter((s) => s.statut === "REALISE" && s.numcons === consultation?.numcons), "Aucun soin réalisé.")}
        <div class="signature">Le praticien</div>
    `);
};

export const imprimerConseils = ({ patient, consultation, actes }) => {
    const blocs = conseilsPourActes(actes);
    imprimer(`Conseils ${patient?.num_patient || ""}`, `
        ${entete("Conseils après votre soin", patient, consultation)}
        ${blocs.map((b) => `<h2>${echapper(b.titre)}</h2><ul>${b.conseils.map((c) => `<li>${echapper(c)}</li>`).join("")}</ul>`).join("")}
        <p class="muted" style="margin-top:18px">En cas de doute ou de symptôme inquiétant, contactez le cabinet dentaire.</p>
    `);
};

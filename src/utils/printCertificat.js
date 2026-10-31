import dayjs from "dayjs";
import "dayjs/locale/fr";
import { images } from "../constants/app.constants";
import logoService from "../assets/logo_service.jpg";

/**
 * Certificat médical (A4), généré en HTML : le même document sert à l'aperçu et à l'impression.
 * La date de consultation et le repos sont affichés, jamais le diagnostic (secret médical).
 */

const echapper = (valeur) => String(valeur ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dateLongue = (valeur) => dayjs(valeur).locale("fr").format("D MMMM YYYY");
const dateCourte = (valeur) => dayjs(valeur).format("DD/MM/YYYY");

const STYLES = `
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: #fff; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #24323d; font-size: 12pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { position: relative; width: 210mm; height: 296mm; padding: 16mm 18mm 14mm; overflow: hidden; }
    .bandeau { position: absolute; inset: 0 0 auto 0; height: 7mm; background: linear-gradient(90deg, #31bae8 0%, #31bae8 62%, #f6c416 62%, #f6c416 82%, #9f5822 82%); }
    .entete { display: flex; justify-content: space-between; align-items: center; margin-top: 4mm; }
    .entete img { height: 20mm; object-fit: contain; }
    .titre { text-align: center; margin: 15mm 0 3mm; }
    .titre h1 { margin: 0; font-size: 25pt; font-weight: 700; letter-spacing: 3px; color: #1d6f8c; }
    .titre .ref { margin-top: 2mm; font-size: 10pt; color: #6b7a86; }
    .filet { width: 28mm; height: 3px; background: #f6c416; margin: 4mm auto 0; border-radius: 2px; }
    .corps { margin-top: 12mm; line-height: 1.75; }
    .corps b { color: #14222c; }
    .patient { margin: 6mm 0; padding: 5mm 7mm; border-left: 4px solid #31bae8; background: #eef8fc; border-radius: 0 6px 6px 0; }
    .patient .nom { font-size: 15pt; font-weight: 700; color: #9f5822; }
    .patient .infos { font-size: 10.5pt; color: #4d5c68; }
    .repos { display: flex; gap: 4mm; margin: 7mm 0 5mm; }
    .tuile { flex: 1; text-align: center; padding: 4mm 2mm; border: 1px solid #cfe7f2; border-radius: 8px; }
    .tuile .libelle { font-size: 9pt; letter-spacing: .5px; text-transform: uppercase; color: #6b7a86; }
    .tuile .valeur { margin-top: 1mm; font-size: 16pt; font-weight: 700; color: #1d6f8c; }
    .tuile.forte { background: #1d6f8c; border-color: #1d6f8c; }
    .tuile.forte .libelle, .tuile.forte .valeur { color: #fff; }
    .signature { position: absolute; right: 18mm; bottom: 42mm; width: 76mm; text-align: center; }
    .signature .fait { font-size: 10.5pt; color: #4d5c68; }
    .signature .role { margin-top: 2mm; font-weight: 700; letter-spacing: .5px; }
    .signature .nom { font-size: 11pt; }
    .signature .cachet { height: 26mm; margin-top: 2mm; border: 1px dashed #c3ced6; border-radius: 6px; font-size: 8.5pt; color: #a4b0b9; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2mm; }
    .pied { position: absolute; left: 18mm; right: 18mm; bottom: 10mm; border-top: 1px solid #e1e7eb; padding-top: 3mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #8795a0; }
`;

const civilite = (sexe) => (sexe === "FE" ? "Mme" : sexe === "MA" ? "M." : "Mme, M.");
const nomMedecin = (medecin) => (medecin ? (/^dr\.?\s/i.test(medecin) ? medecin : `Dr ${medecin}`) : "");
// Les libellés de service sont stockés en majuscules, sans accent
const service = (libelle) => (libelle ? `le service ${libelle.toLowerCase().replace("medical", "médical").replace("gynecologie", "gynécologie")}` : "le service médical");

const blocRepos = (c) => {
    if (!c.nb_jours_rm) {
        return `<p>Son état de santé ne nécessite pas d'arrêt d'activité à l'issue de cette consultation.</p>`;
    }
    return `
        <p>Son état de santé nécessite un repos médical, sauf complication :</p>
        <div class="repos">
            <div class="tuile forte"><div class="libelle">Durée</div><div class="valeur">${c.nb_jours_rm} jour${c.nb_jours_rm > 1 ? "s" : ""}</div></div>
            <div class="tuile"><div class="libelle">Du</div><div class="valeur">${dateCourte(c.debut_rm)}</div></div>
            <div class="tuile"><div class="libelle">Au (inclus)</div><div class="valeur">${dateCourte(c.fin_rm)}</div></div>
        </div>`;
};

export const certificatPage = (c) => {
    const infos = [
        c.matricule ? `Matricule ${echapper(c.matricule)}` : `N° ${echapper(c.numpat)}`,
        c.datenaiss_patient ? `Né(e) le ${dateCourte(c.datenaiss_patient)}` : "",
    ].filter(Boolean).join(" · ");

    return `
        <div class="page">
            <div class="bandeau"></div>
            <div class="entete">
                <img src="${images.logo}" alt="CSS" />
                <img src="${logoService}" alt="Service médical" />
            </div>
            <div class="titre">
                <h1>CERTIFICAT MÉDICAL</h1>
                <div class="ref">Consultation N° ${echapper(c.numcons)}</div>
                <div class="filet"></div>
            </div>
            <div class="corps">
                <div>Je soussigné(e), <b>${echapper(nomMedecin(c.medecin))}</b>${c.profil_medecin ? `, ${echapper(c.profil_medecin)}` : ""}, certifie avoir reçu en consultation dans ${echapper(service(c.lib_service))}, le <b>${dateLongue(c.datecons)}</b> :</div>
                <div class="patient">
                    <div class="nom">${civilite(c.sexe_patient)} ${echapper(c.prenom_patient)} ${echapper(c.nom_patient)}</div>
                    <div class="infos">${infos}</div>
                </div>
                ${blocRepos(c)}
            </div>
            <div class="signature">
                <div class="fait">Fait le ${dateLongue(dayjs())}</div>
                <div class="role">Le médecin traitant</div>
                <div class="nom">${echapper(nomMedecin(c.medecin))}</div>
                <div class="cachet">Cachet et signature</div>
            </div>
            <div class="pied">
                <span>Document médical confidentiel</span>
                <span>Certificat établi pour servir et valoir ce que de droit</span>
            </div>
        </div>`;
};

export const certificatHtml = (c) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Certificat médical ${echapper(c.numcons)}</title><style>${STYLES}</style></head><body>${certificatPage(c)}</body></html>`;

export const imprimerCertificat = (c) => {
    // Impression via un iframe caché : pas de nouvel onglet ni de bloqueur de fenêtres
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(certificatHtml(c));
    doc.close();
    // Les logos doivent être chargés avant d'imprimer
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1000);
    }, 400);
};

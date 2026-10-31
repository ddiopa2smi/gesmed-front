import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { images, LOGO_BROWN, PRIMARY_COLOR } from "../constants/app.constants";

/**
 * Classeurs Excel mis en forme, prêts à être imprimés.
 *   sheets = [{ name, rows, synthese }] : une feuille par tableau (synthese : tableau d'indicateurs, valeurs saisies en texte)
 *   options = { titre, sousTitre, details, indicateurs, graphiques } : si des graphiques sont fournis,
 *   une première feuille "Rapport" les présente avec les indicateurs clés.
 *   indicateurs = [{ label, valeur, pied, couleur }]
 *   graphiques = [{ titre, type: "aire" | "barres" | "barresH" | "donut", data, x, series: [{ cle, nom, couleur }], demi, empile }]
 */

const FOND_ENTETE = "FF1D6F8C";
const FOND_ALTERNE = "FFF3F9FC";
const BORDURE = { style: "thin", color: { argb: "FFD9E2E8" } };
const BORDURES = { top: BORDURE, bottom: BORDURE, left: BORDURE, right: BORDURE };
const POLICE = "Calibri";
const COULEURS = ["#31bae8", "#fa8c16", "#52c41a", "#722ed1", "#eb2f96", "#9f5822", "#13c2c2", "#faad14", "#2f54eb", "#a0d911"];

const LIGNE_ENTETE_TABLE = 4;
const LARGEUR_TEXTE_MAX = 50;
const LARGEUR_TITRE_MIN = 60;

// Feuille Rapport : 12 colonnes de 89 px, imprimées à 65 % sur une page A4 portrait
const COLONNES_RAPPORT = 12;
const LARGEUR_COLONNE_RAPPORT = 12;
const PX_COLONNE = 89;
const PX_LIGNE = 20;
const ECHELLE_IMPRESSION = 65;
const HAUTEUR_PAGE_PX = 1500;
const HAUTEUR_GRAPHIQUE = 280;
const ENTETE_IMAGE = 40;

const argb = (hex) => `FF${hex.replace("#", "").toUpperCase()}`;
const nomFeuille = (name) => name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31);

/* ------------------------------------------------------------------ */
/* Graphiques : rendus par recharts hors écran puis convertis en image */
/* ------------------------------------------------------------------ */

const SANS_ANIMATION = { isAnimationActive: false };
const AXE = { tick: { fontSize: 12, fill: "#555" } };

const seriesDe = (g) => g.series.map((s, i) => ({ ...s, nom: s.nom || s.cle, couleur: s.couleur || COULEURS[i % COULEURS.length] }));

const donneesDonut = (g) => g.data
    .map((d) => ({ name: String(d[g.x]), value: Number(d[g.series[0].cle]) || 0, couleur: d.couleur }))
    .filter((d) => d.value > 0);

const etiquetteDonut = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.04) return null;
    const rayon = (innerRadius + outerRadius) / 2;
    const angle = (-midAngle * Math.PI) / 180;
    return (
        <text x={cx + rayon * Math.cos(angle)} y={cy + rayon * Math.sin(angle)} fill="#fff" fontSize={13} fontWeight={700} textAnchor="middle" dominantBaseline="central">
            {`${Math.round(percent * 100)} %`}
        </text>
    );
};

const graphiqueRecharts = (g, width, height) => {
    const taille = { width, height };
    const grille = <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={g.type === "barresH"} horizontal={g.type !== "barresH"} />;
    const marge = { top: 10, right: 20, left: 0, bottom: 0 };
    const series = seriesDe(g);

    if (g.type === "donut") {
        const data = donneesDonut(g);
        return (
            <PieChart {...taille}>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="48%" outerRadius="92%" label={etiquetteDonut} labelLine={false} {...SANS_ANIMATION}>
                    {data.map((d, i) => <Cell key={d.name} fill={d.couleur || COULEURS[i % COULEURS.length]} />)}
                </Pie>
            </PieChart>
        );
    }
    if (g.type === "barresH") {
        return (
            <BarChart {...taille} data={g.data} layout="vertical" margin={marge}>
                {grille}
                <XAxis type="number" allowDecimals={false} {...AXE} />
                <YAxis type="category" dataKey={g.x} width={Math.min(240, width / 2.5)} interval={0} {...AXE} />
                {series.map((s) => <Bar key={s.cle} dataKey={s.cle} fill={s.couleur} {...SANS_ANIMATION} />)}
            </BarChart>
        );
    }
    if (g.type === "aire") {
        return (
            <AreaChart {...taille} data={g.data} margin={marge}>
                {grille}
                <XAxis dataKey={g.x} {...AXE} />
                <YAxis allowDecimals={false} {...AXE} />
                {series.map((s) => <Area key={s.cle} type="monotone" dataKey={s.cle} stroke={s.couleur} fill={s.couleur} fillOpacity={0.18} strokeWidth={2} {...SANS_ANIMATION} />)}
            </AreaChart>
        );
    }
    return (
        <BarChart {...taille} data={g.data} margin={marge}>
            {grille}
            <XAxis dataKey={g.x} {...AXE} />
            <YAxis allowDecimals={false} {...AXE} />
            {series.map((s) => <Bar key={s.cle} dataKey={s.cle} fill={s.couleur} stackId={g.empile ? "pile" : undefined} {...SANS_ANIMATION} />)}
        </BarChart>
    );
};

// Entrées de légende ; pour un donut : libellé et valeur de chaque part
const legendeDe = (g) => {
    if (g.type === "donut") return donneesDonut(g).map((d, i) => ({ nom: `${d.name} (${d.value})`, couleur: d.couleur || COULEURS[i % COULEURS.length] }));
    return g.series.length > 1 ? seriesDe(g) : [];
};

const chargerImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
});

// La légende de recharts est en HTML (absente du SVG) : titre et légende sont dessinés sur le canvas
const composerImage = async (svg, g, width, height) => {
    const copie = svg.cloneNode(true);
    copie.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copie.setAttribute("font-family", "Segoe UI, Arial, sans-serif");
    const image = await chargerImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copie))}`);

    const legende = legendeDe(g);
    const canvas = document.createElement("canvas");
    const contexte = canvas.getContext("2d");
    const echelle = 2;
    contexte.font = "12px Segoe UI, Arial, sans-serif";

    // Répartition des entrées de légende sur une ou plusieurs lignes
    const lignes = [[]];
    let x = 12;
    legende.forEach((entree) => {
        const largeur = 18 + contexte.measureText(entree.nom).width + 16;
        if (x + largeur > width - 12 && lignes[lignes.length - 1].length) {
            lignes.push([]);
            x = 12;
        }
        lignes[lignes.length - 1].push({ ...entree, x });
        x += largeur;
    });
    const hauteurLegende = legende.length ? lignes.length * 22 + 8 : 0;
    const hauteurTotale = ENTETE_IMAGE + height + hauteurLegende;

    canvas.width = width * echelle;
    canvas.height = hauteurTotale * echelle;
    contexte.scale(echelle, echelle);
    contexte.fillStyle = "#ffffff";
    contexte.fillRect(0, 0, width, hauteurTotale);
    contexte.strokeStyle = "#d9e2e8";
    contexte.strokeRect(0.5, 0.5, width - 1, hauteurTotale - 1);
    contexte.fillStyle = PRIMARY_COLOR;
    contexte.fillRect(0, 0, 4, ENTETE_IMAGE);
    contexte.fillStyle = "#1d6f8c";
    contexte.font = "600 15px Segoe UI, Arial, sans-serif";
    contexte.textBaseline = "middle";
    contexte.fillText(g.titre, 14, ENTETE_IMAGE / 2, width - 28);
    contexte.drawImage(image, 0, ENTETE_IMAGE, width, height);

    contexte.font = "12px Segoe UI, Arial, sans-serif";
    lignes.forEach((ligne, i) => ligne.forEach((entree) => {
        const y = ENTETE_IMAGE + height + 4 + i * 22 + 11;
        contexte.fillStyle = entree.couleur;
        contexte.fillRect(entree.x, y - 6, 12, 12);
        contexte.fillStyle = "#444";
        contexte.fillText(entree.nom, entree.x + 18, y);
    }));
    return { base64: canvas.toDataURL("image/png"), width, height: hauteurTotale };
};

const rendreGraphique = async (g, width) => {
    const height = g.type === "barresH" ? Math.max(HAUTEUR_GRAPHIQUE, g.data.length * 30) : HAUTEUR_GRAPHIQUE;
    const conteneur = document.createElement("div");
    conteneur.style.cssText = `position:fixed;left:-${width + 100}px;top:0;width:${width}px;height:${height}px;`;
    document.body.appendChild(conteneur);
    const racine = createRoot(conteneur);
    try {
        flushSync(() => racine.render(graphiqueRecharts(g, width, height)));
        await new Promise((resolve) => setTimeout(resolve, 60));
        return await composerImage(conteneur.querySelector("svg.recharts-surface"), g, width, height);
    } finally {
        racine.unmount();
        conteneur.remove();
    }
};

/* ------------------------------------------------------------------ */
/* Feuilles de tableaux                                                */
/* ------------------------------------------------------------------ */

const formatNombre = (valeur) => (Number.isInteger(valeur) ? "#,##0" : "#,##0.00");

const formatColonne = (titre) => {
    if (/évolution/i.test(titre)) return '+0.0" %";-0.0" %";0" %"';
    if (/%/.test(titre)) return '0.0" %"';
    return null;
};

// Tableau d'indicateurs : "12" et "78 %" deviennent de vraies valeurs numériques
const valeurSynthese = (valeur) => {
    if (typeof valeur !== "string") return { valeur };
    const nombre = valeur.trim().match(/^(-?\d+(?:\.\d+)?)( %)?$/);
    if (!nombre) return { valeur };
    return { valeur: Number(nombre[1]), format: nombre[2] ? '0.0" %"' : null };
};

const largeursColonnes = (colonnes, rows) => {
    const largeurs = colonnes.map((col) => Math.min(LARGEUR_TEXTE_MAX, Math.max(col.length + 4, ...rows.map((row) => String(row[col] ?? "").length + 2))));
    const manque = LARGEUR_TITRE_MIN - largeurs.reduce((a, b) => a + b, 0);
    return manque > 0 ? largeurs.map((l) => l + manque / colonnes.length) : largeurs;
};

const preparerImpression = (feuille, { paysage, zone }) => {
    feuille.pageSetup = {
        ...feuille.pageSetup,
        paperSize: 9,
        orientation: paysage ? "landscape" : "portrait",
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 },
        horizontalCentered: true,
        ...zone,
    };
    feuille.headerFooter.oddFooter = `&L&8${feuille.name}&C&8Page &P / &N&R&8Édité le ${dayjs().format("DD/MM/YYYY")}`;
};

const ajouterFeuilleTableau = (classeur, { name, rows, synthese }, { titre, sousTitre }) => {
    const lignes = rows && rows.length ? rows : [{ Information: "Aucune donnée" }];
    const colonnes = Object.keys(lignes[0]);
    const feuille = classeur.addWorksheet(nomFeuille(name), {
        views: [{ state: "frozen", ySplit: LIGNE_ENTETE_TABLE, showGridLines: false }],
    });
    largeursColonnes(colonnes, lignes).forEach((width, i) => { feuille.getColumn(i + 1).width = width; });

    if (colonnes.length > 1) {
        feuille.mergeCells(1, 1, 1, colonnes.length);
        feuille.mergeCells(2, 1, 2, colonnes.length);
    }
    const celluleTitre = feuille.getCell(1, 1);
    celluleTitre.value = titre ? `${titre} — ${name}` : name;
    celluleTitre.font = { name: POLICE, size: 14, bold: true, color: { argb: argb(LOGO_BROWN) } };
    feuille.getRow(1).height = 24;
    const celluleSousTitre = feuille.getCell(2, 1);
    celluleSousTitre.value = sousTitre || `Édité le ${dayjs().format("DD/MM/YYYY à HH:mm")}`;
    celluleSousTitre.font = { name: POLICE, size: 10, italic: true, color: { argb: "FF666666" } };

    const entete = feuille.getRow(LIGNE_ENTETE_TABLE);
    entete.height = 30;
    colonnes.forEach((col, i) => {
        const cellule = entete.getCell(i + 1);
        cellule.value = col;
        cellule.font = { name: POLICE, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
        cellule.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FOND_ENTETE } };
        cellule.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cellule.border = BORDURES;
    });

    lignes.forEach((row, r) => {
        const ligne = feuille.getRow(LIGNE_ENTETE_TABLE + 1 + r);
        colonnes.forEach((col, c) => {
            const cellule = ligne.getCell(c + 1);
            const { valeur, format } = synthese ? valeurSynthese(row[col]) : { valeur: row[col] };
            cellule.value = valeur === "" || valeur === undefined ? null : valeur;
            cellule.font = { name: POLICE, size: 11, bold: !!synthese && c === 0 };
            cellule.border = BORDURES;
            if (r % 2 === 1) cellule.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FOND_ALTERNE } };
            const estNombre = typeof valeur === "number";
            if (estNombre) cellule.numFmt = format || formatColonne(col) || formatNombre(valeur);
            cellule.alignment = { vertical: "middle", horizontal: col === "Rang" ? "center" : estNombre ? "right" : "left", wrapText: !estNombre };
        });
    });

    feuille.autoFilter = { from: { row: LIGNE_ENTETE_TABLE, column: 1 }, to: { row: LIGNE_ENTETE_TABLE + lignes.length, column: colonnes.length } };
    preparerImpression(feuille, {
        paysage: colonnes.length > 5,
        zone: { fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: `${LIGNE_ENTETE_TABLE}:${LIGNE_ENTETE_TABLE}` },
    });
};

/* ------------------------------------------------------------------ */
/* Feuille Rapport                                                     */
/* ------------------------------------------------------------------ */

const chargerLogo = async () => {
    try {
        const reponse = await fetch(images.logo);
        const blob = await reponse.blob();
        const base64 = await new Promise((resolve, reject) => {
            const lecteur = new FileReader();
            lecteur.onload = () => resolve(lecteur.result);
            lecteur.onerror = reject;
            lecteur.readAsDataURL(blob);
        });
        const extension = /jpe?g/.test(blob.type) ? "jpeg" : "png";
        return /image\//.test(blob.type) ? { base64, extension } : null;
    } catch (e) {
        return null;
    }
};

const titreSection = (feuille, ligne, texte) => {
    feuille.mergeCells(ligne, 1, ligne, COLONNES_RAPPORT);
    const cellule = feuille.getCell(ligne, 1);
    cellule.value = texte.toUpperCase();
    cellule.font = { name: POLICE, size: 11, bold: true, color: { argb: FOND_ENTETE } };
    cellule.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF8FC" } };
    cellule.border = { left: { style: "thick", color: { argb: argb(PRIMARY_COLOR) } } };
    cellule.alignment = { vertical: "middle", indent: 1 };
    feuille.getRow(ligne).height = 20;
};

// Tuiles d'indicateurs : 4 par ligne, 3 colonnes chacune (libellé, valeur, précision)
const ajouterIndicateurs = (feuille, indicateurs, ligneDepart) => {
    let ligne = ligneDepart;
    indicateurs.forEach((kpi, i) => {
        const colonne = (i % 4) * 3 + 1;
        if (i > 0 && i % 4 === 0) ligne += 4;
        [[ligne, kpi.label, { size: 9, color: { argb: "FF777777" } }, 18],
         [ligne + 1, kpi.valeur, { size: 18, bold: true, color: { argb: "FF222222" } }, 28],
         [ligne + 2, kpi.pied, { size: 9, color: { argb: "FF666666" } }, 16]].forEach(([l, valeur, police, hauteur], position) => {
            feuille.mergeCells(l, colonne, l, colonne + 2);
            const cellule = feuille.getCell(l, colonne);
            cellule.value = valeur === undefined || valeur === null ? "" : valeur;
            cellule.font = { name: POLICE, ...police };
            cellule.alignment = { vertical: "middle", horizontal: "left", indent: 1, shrinkToFit: true };
            cellule.border = {
                top: position === 0 ? { style: "thick", color: { argb: argb(kpi.couleur || PRIMARY_COLOR) } } : undefined,
                bottom: position === 2 ? BORDURE : undefined,
                left: BORDURE,
            };
            feuille.getRow(l).height = hauteur;
            feuille.getCell(l, colonne + 2).border = { ...cellule.border, left: undefined, right: BORDURE };
        });
    });
    return ligne + 4;
};

const ajouterFeuilleRapport = async (classeur, { titre, sousTitre, details, indicateurs = [], graphiques }) => {
    const feuille = classeur.addWorksheet("Rapport", { views: [{ showGridLines: false }] });
    for (let c = 1; c <= COLONNES_RAPPORT; c += 1) feuille.getColumn(c).width = LARGEUR_COLONNE_RAPPORT;

    const logo = await chargerLogo();
    if (logo) feuille.addImage(classeur.addImage(logo), { tl: { col: 0.1, row: 0.2 }, ext: { width: 120, height: 70 }, editAs: "oneCell" });

    [[1, titre, { size: 18, bold: true, color: { argb: argb(LOGO_BROWN) } }, 28],
     [2, sousTitre, { size: 11 }, 18],
     [3, details, { size: 10, color: { argb: "FF666666" } }, 16],
     [4, `Édité le ${dayjs().format("DD/MM/YYYY à HH:mm")}`, { size: 10, italic: true, color: { argb: "FF666666" } }, 16]].forEach(([ligne, valeur, police, hauteur]) => {
        feuille.mergeCells(ligne, 3, ligne, COLONNES_RAPPORT);
        const cellule = feuille.getCell(ligne, 3);
        cellule.value = valeur || "";
        cellule.font = { name: POLICE, ...police };
        cellule.alignment = { vertical: "middle" };
        feuille.getRow(ligne).height = hauteur;
    });
    for (let c = 1; c <= COLONNES_RAPPORT; c += 1) feuille.getCell(4, c).border = { bottom: { style: "medium", color: { argb: argb(PRIMARY_COLOR) } } };

    let ligne = 6;
    if (indicateurs.length) {
        titreSection(feuille, ligne, "Indicateurs clés");
        ligne = ajouterIndicateurs(feuille, indicateurs, ligne + 2);
    }
    titreSection(feuille, ligne, "Graphiques");
    ligne += 2;

    // Hauteur déjà occupée sur la page : un saut de page évite de couper un graphique
    let occupe = PX_LIGNE * (ligne + 4);
    const largeurTotale = COLONNES_RAPPORT * PX_COLONNE - 8;
    const largeurDemi = Math.floor(COLONNES_RAPPORT / 2) * PX_COLONNE - 8;
    const visibles = graphiques.filter((g) => g.data && (g.type === "donut" ? donneesDonut(g).length : g.data.length));

    for (let i = 0; i < visibles.length; i += 1) {
        const g = visibles[i];
        const voisin = g.demi && visibles[i + 1]?.demi ? visibles[i + 1] : null;
        const rendus = await Promise.all([rendreGraphique(g, g.demi ? largeurDemi : largeurTotale), ...(voisin ? [rendreGraphique(voisin, largeurDemi)] : [])]);
        if (voisin) i += 1;
        const hauteur = Math.max(...rendus.map((r) => r.height));
        if (occupe + hauteur > HAUTEUR_PAGE_PX) {
            feuille.getRow(ligne - 2).addPageBreak();
            occupe = 0;
        }
        const ligneImage = ligne - 1;
        rendus.forEach((rendu, position) => {
            feuille.addImage(classeur.addImage({ base64: rendu.base64, extension: "png" }), {
                tl: { col: position * (COLONNES_RAPPORT / 2), row: ligneImage },
                ext: { width: rendu.width, height: rendu.height },
                editAs: "oneCell",
            });
        });
        const lignesOccupees = Math.ceil(hauteur / PX_LIGNE) + 2;
        ligne += lignesOccupees;
        occupe += lignesOccupees * PX_LIGNE;
    }

    preparerImpression(feuille, { paysage: false, zone: { scale: ECHELLE_IMPRESSION } });
};

/* ------------------------------------------------------------------ */
/* Classeur                                                            */
/* ------------------------------------------------------------------ */

export const exporterClasseurExcel = async (sheets, fileName, options = {}) => {
    const module = await import("exceljs");
    const ExcelJS = module.default || module;
    const classeur = new ExcelJS.Workbook();
    classeur.creator = "GESMED";
    classeur.created = new Date();

    if (options.graphiques?.length) await ajouterFeuilleRapport(classeur, options);
    sheets.forEach((sheet) => ajouterFeuilleTableau(classeur, sheet, options));

    const contenu = await classeur.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([contenu], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `${fileName}.xlsx`;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    URL.revokeObjectURL(url);
};

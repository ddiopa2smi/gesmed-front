import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { images, LOGO_BROWN, PRIMARY_COLOR } from "../../../constants/app.constants";
import { evolution } from "../../specific/StatistiquesMedicales/statsUtils";
import "./RapportPdf.scss";

/**
 * Briques communes des rapports de statistiques imprimés en PDF (A4 portrait).
 * Graphiques à taille fixe et sans animation, tableaux HTML simples : le rendu ne dépend pas de l'écran.
 */

// Largeur utile d'une page A4 portrait (210 mm - 2 x 12 mm de marge) en pixels CSS
export const LARGEUR_PAGE = 700;
export const DEMI_PAGE = 340;
export const TIERS_PAGE = 214;
export const SANS_ANIMATION = { isAnimationActive: false };
export const AXE = { tick: { fontSize: 9 } };
export const COULEURS_PDF = ["#31bae8", "#fa8c16", "#52c41a", "#722ed1", "#eb2f96", "#9f5822", "#13c2c2", "#faad14", "#2f54eb", "#a0d911"];

export const stylesPdf = {
  page: { width: LARGEUR_PAGE, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9pt", color: "#222", background: "#fff" },
  section: { breakInside: "avoid", pageBreakInside: "avoid", marginBottom: 14 },
  titreSection: {
    fontSize: "10pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#1d6f8c",
    borderLeft: `4px solid ${PRIMARY_COLOR}`, background: "#eef8fc", padding: "4px 8px", margin: "0 0 8px",
  },
  grille: (colonnes) => ({ display: "grid", gridTemplateColumns: `repeat(${colonnes}, 1fr)`, gap: 8 }),
  kpi: (couleur) => ({ border: "1px solid #e5e5e5", borderTop: `3px solid ${couleur}`, borderRadius: 4, padding: "6px 8px" }),
  kpiLabel: { fontSize: "7.5pt", color: "#777", textTransform: "uppercase", letterSpacing: 0.3 },
  kpiValeur: { fontSize: "16pt", fontWeight: 700, lineHeight: 1.2 },
  kpiPied: { fontSize: "7.5pt", color: "#666" },
  carteGraphique: { border: "1px solid #e5e5e5", borderRadius: 4, padding: 6 },
  titreGraphique: { fontSize: "8.5pt", fontWeight: 600, marginBottom: 4 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "8pt" },
  th: { background: "#f3f6f8", textAlign: "left", padding: "4px 6px", borderBottom: "1px solid #d9d9d9", fontWeight: 600 },
  td: { padding: "3px 6px", borderBottom: "1px solid #eee" },
  note: { fontSize: "8pt", color: "#666", marginBottom: 6 },
};

// Variation colorée par rapport à la période précédente ; "inverse" : une hausse est défavorable
export const variationPdf = (courant, precedent, inverse = false) => {
  const ev = evolution(courant, precedent);
  if (ev === null) return <span>Pas de comparaison</span>;
  const favorable = inverse ? ev <= 0 : ev >= 0;
  const couleur = ev === 0 ? "#666" : favorable ? "#389e0d" : "#cf1322";
  return (
    <span>
      <b style={{ color: couleur }}>{ev > 0 ? "▲" : ev < 0 ? "▼" : "="} {Math.abs(ev)} %</b> vs préc. ({precedent})
    </span>
  );
};

export const KpiPdf = ({ label, valeur, pied, couleur }) => (
  <div style={stylesPdf.kpi(couleur)}>
    <div style={stylesPdf.kpiLabel}>{label}</div>
    <div style={stylesPdf.kpiValeur}>{valeur}</div>
    <div style={stylesPdf.kpiPied}>{pied}</div>
  </div>
);

export const SectionPdf = ({ titre, children }) => (
  <div style={stylesPdf.section}>
    <div style={stylesPdf.titreSection}>{titre}</div>
    {children}
  </div>
);

export const GraphiquePdf = ({ titre, children }) => (
  <div style={stylesPdf.carteGraphique}>
    <div style={stylesPdf.titreGraphique}>{titre}</div>
    {children}
  </div>
);

// Tableau simple : colonnes = [{ titre, rendu(row), align }]
export const TableauPdf = ({ colonnes, lignes, vide = "Aucune donnée" }) => (
  <table style={stylesPdf.table}>
    <thead>
      <tr>{colonnes.map((c) => <th key={c.titre} style={{ ...stylesPdf.th, textAlign: c.align || "left" }}>{c.titre}</th>)}</tr>
    </thead>
    <tbody>
      {lignes.length === 0 ? (
        <tr><td style={{ ...stylesPdf.td, color: "#999" }} colSpan={colonnes.length}>{vide}</td></tr>
      ) : lignes.map((ligne, index) => (
        <tr key={ligne.key || index}>
          {colonnes.map((c) => <td key={c.titre} style={{ ...stylesPdf.td, textAlign: c.align || "left" }}>{c.rendu(ligne)}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

// Barres de remplissage (qualité des données)
export const QualitePdf = ({ lignes, note }) => (
  <>
    {note && <div style={stylesPdf.note}>{note}</div>}
    <div style={stylesPdf.grille(3)}>
      {lignes.map((q) => (
        <div key={q.champ} style={{ fontSize: "8pt" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>{q.champ}</span><b>{q.taux} %</b></div>
          <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3 }}>
            <div style={{ width: `${q.taux}%`, height: 5, borderRadius: 3, background: q.taux < 50 ? "#ff4d4f" : q.taux < 80 ? "#faad14" : "#52c41a" }} />
          </div>
        </div>
      ))}
    </div>
  </>
);

export const labelCamembertPdf = ({ name, percent }) => (percent >= 0.04 ? `${name} ${(percent * 100).toFixed(0)} %` : "");

// En-tête du rapport : logo, titre, périmètre, date d'édition
export const EnTetePdf = ({ titre, sousTitre, details, user }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${PRIMARY_COLOR}`, paddingBottom: 8, marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img src={images.logo} alt="Logo" style={{ height: 44 }} />
      <div>
        <div style={{ fontSize: "15pt", fontWeight: 700, color: LOGO_BROWN }}>{titre}</div>
        <div style={{ fontSize: "9pt" }}>{sousTitre}</div>
        {details && <div style={{ fontSize: "8pt", color: "#666" }}>{details}</div>}
      </div>
    </div>
    <div style={{ textAlign: "right", fontSize: "8pt", color: "#666" }}>
      Édité le {dayjs().format("DD/MM/YYYY à HH:mm")}
      {user?.username && <div>par {user.username}</div>}
    </div>
  </div>
);

// Conteneur du rapport : rendu dans <body>, hors de l'écran, imprimé seul
export const PortailPdf = ({ children }) =>
  createPortal(
    <div className="stats-print-portal">
      <div style={stylesPdf.page}>{children}</div>
    </div>,
    document.body
  );

/**
 * Lance l'impression du rapport. Renvoie { impression, imprimer } :
 * - impression : vrai pendant la préparation / l'impression (afficher alors <PortailPdf>)
 * - imprimer() : déclenche l'export ; titreFichier sert de nom de fichier PDF proposé
 */
export const useImpressionPdf = (titreFichier) => {
  const [impression, setImpression] = useState(false);

  useEffect(() => {
    if (!impression) return undefined;
    const titrePrecedent = document.title;
    const terminer = () => {
      document.body.classList.remove("impression-statistiques");
      document.title = titrePrecedent;
      setImpression(false);
    };
    document.body.classList.add("impression-statistiques");
    document.title = titreFichier;
    window.addEventListener("afterprint", terminer, { once: true });
    // Laisse le temps au rapport (et au logo) d'être rendus avant d'ouvrir l'impression
    const timer = setTimeout(() => window.print(), 300);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", terminer);
      document.body.classList.remove("impression-statistiques");
      document.title = titrePrecedent;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impression]);

  return { impression, imprimer: () => setImpression(true) };
};

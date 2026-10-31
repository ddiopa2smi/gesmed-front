import React from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis,
} from "recharts";
import dayjs from "dayjs";
import { images, LOGO_BROWN, PRIMARY_COLOR } from "../../../constants/app.constants";
import { ZONES_LESIONS } from "../../common/BodyMap/BodyMap";
import { evolution } from "./statsUtils";

/**
 * Rapport de statistiques médicales mis en page pour l'impression A4 portrait (export PDF).
 * Graphiques à taille fixe et sans animation, tableaux HTML simples : le rendu ne dépend pas de l'écran.
 */

// Largeur utile d'une page A4 portrait (210 mm - 2 x 12 mm de marge) en pixels CSS
const LARGEUR = 700;
const DEMI = 340;
const COULEURS = ["#31bae8", "#fa8c16", "#52c41a", "#722ed1", "#eb2f96", "#9f5822", "#13c2c2", "#faad14", "#2f54eb", "#a0d911"];
const SANS_ANIMATION = { isAnimationActive: false };

const styles = {
  page: { width: LARGEUR, fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "9pt", color: "#222", background: "#fff" },
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
};

const variationTexte = (courant, precedent, inverse = false) => {
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

const Kpi = ({ label, valeur, pied, couleur }) => (
  <div style={styles.kpi(couleur)}>
    <div style={styles.kpiLabel}>{label}</div>
    <div style={styles.kpiValeur}>{valeur}</div>
    <div style={styles.kpiPied}>{pied}</div>
  </div>
);

const Section = ({ titre, children }) => (
  <div style={styles.section}>
    <div style={styles.titreSection}>{titre}</div>
    {children}
  </div>
);

const Graphique = ({ titre, children }) => (
  <div style={styles.carteGraphique}>
    <div style={styles.titreGraphique}>{titre}</div>
    {children}
  </div>
);

// Tableau simple : colonnes = [{ titre, rendu(row), align }]
const Tableau = ({ colonnes, lignes, vide = "Aucune donnée" }) => (
  <table style={styles.table}>
    <thead>
      <tr>{colonnes.map((c) => <th key={c.titre} style={{ ...styles.th, textAlign: c.align || "left" }}>{c.titre}</th>)}</tr>
    </thead>
    <tbody>
      {lignes.length === 0 ? (
        <tr><td style={{ ...styles.td, color: "#999" }} colSpan={colonnes.length}>{vide}</td></tr>
      ) : lignes.map((ligne, index) => (
        <tr key={ligne.key || index}>
          {colonnes.map((c) => <td key={c.titre} style={{ ...styles.td, textAlign: c.align || "left" }}>{c.rendu(ligne)}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

const evolutionCellule = (row, inverse = false) => {
  if (row.evolution === null || row.evolution === undefined) return <span style={{ color: "#999" }}>nouveau</span>;
  const hausse = row.evolution > 0;
  const couleur = row.evolution === 0 ? "#666" : (inverse ? !hausse : hausse) ? "#389e0d" : "#cf1322";
  return <span style={{ color: couleur }}>{hausse ? "+" : ""}{row.evolution} %</span>;
};

const colonnesClassement = (titre, inverse) => [
  { titre: "#", rendu: (r) => r.rang, align: "center" },
  { titre, rendu: (r) => <b>{r.libelle}</b> },
  { titre: "Nombre", rendu: (r) => r.nombre, align: "right" },
  { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" },
  { titre: "Préc.", rendu: (r) => r.precedent, align: "right" },
  { titre: "Évol.", rendu: (r) => evolutionCellule(r, inverse), align: "right" },
];

const colonnesActes = (titre) => [
  { titre: "#", rendu: (r) => r.rang, align: "center" },
  { titre, rendu: (r) => <b>{r.libelle}</b> },
  { titre: "Prescriptions", rendu: (r) => r.prescriptions, align: "right" },
  { titre: "Quantité", rendu: (r) => r.quantite, align: "right" },
];

const labelCamembert = ({ name, percent }) => (percent >= 0.04 ? `${name} ${(percent * 100).toFixed(0)} %` : "");

function RapportImpression({
  libelleService, libellePeriode, libellePrecedent, medecins, user,
  kpi, kpiPrec, evolutionSerie, sexe, ages, types, heures, joursSemaine,
  diagnostics, parPathologie, parMotif, parRegion, parMedecin, medicaments, analyses, imageries, qualite,
  at, atPrec, accidents, visites,
}) {
  const axe = { tick: { fontSize: 9 } };

  return (
    <div className="stats-print-portal">
      <div style={styles.page}>
        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${PRIMARY_COLOR}`, paddingBottom: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={images.logo} alt="Logo" style={{ height: 44 }} />
            <div>
              <div style={{ fontSize: "15pt", fontWeight: 700, color: LOGO_BROWN }}>Rapport de statistiques médicales</div>
              <div style={{ fontSize: "9pt" }}><b>{libelleService}</b> · {libellePeriode}</div>
              <div style={{ fontSize: "8pt", color: "#666" }}>
                Comparé à la période précédente ({libellePrecedent}) · {medecins.length ? `Médecins : ${medecins.join(", ")}` : "Tous les médecins"}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "8pt", color: "#666" }}>
            Édité le {dayjs().format("DD/MM/YYYY à HH:mm")}
            {user?.username && <div>par {user.username}</div>}
          </div>
        </div>

        {/* Indicateurs clés */}
        <Section titre="Indicateurs clés">
          <div style={styles.grille(4)}>
            <Kpi couleur={PRIMARY_COLOR} label="Consultations" valeur={kpi.consultations} pied={variationTexte(kpi.consultations, kpiPrec.consultations)} />
            <Kpi couleur="#722ed1" label="Patients vus" valeur={kpi.patients} pied={`${kpi.consultationsParPatient} cons./patient · ${kpi.moyenneParJour} / jour`} />
            <Kpi couleur="#52c41a" label="Rendez-vous honorés" valeur={`${kpi.tauxHonoration} %`} pied={`${kpi.rendezVous} RV · ${kpi.rvNonHonores} non honorés`} />
            <Kpi couleur="#52c41a" label="Consultations validées" valeur={`${kpi.tauxValidation} %`} pied={`${kpi.tauxPrescription} % avec prescription`} />
            <Kpi couleur="#13c2c2" label="Jours de repos médical" valeur={kpi.joursRepos} pied={variationTexte(kpi.joursRepos, kpiPrec.joursRepos, true)} />
            <Kpi couleur="#ff4d4f" label="Tensions ≥ 140/90" valeur={kpi.hta} pied={`${kpi.tauxHta} % des ${kpi.tensionsMesurees} mesurées`} />
            <Kpi couleur="#fa541c" label="Fièvres (> 37,5 °C)" valeur={kpi.fievres} pied={`${kpi.tauxFievre} % · ${kpi.tdrPositifs} TDR positif(s) / ${kpi.tdrRealises}`} />
            <Kpi couleur={LOGO_BROWN} label="Prescriptions" valeur={kpi.prescriptions} pied={`${kpi.ordonnances} ord. · ${kpi.analyses} anal. · ${kpi.imageries} imag.`} />
          </div>
        </Section>

        {/* Activité */}
        <Section titre="Activité">
          <Graphique titre={`Évolution des consultations et des rendez-vous (par ${evolutionSerie.unite})`}>
            <AreaChart width={LARGEUR - 14} height={190} data={evolutionSerie.data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="periode" {...axe} />
              <YAxis allowDecimals={false} {...axe} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Area type="monotone" dataKey="Rendez-vous" stroke={PRIMARY_COLOR} fill={PRIMARY_COLOR} fillOpacity={0.15} strokeWidth={1.5} {...SANS_ANIMATION} />
              <Area type="monotone" dataKey="Consultations" stroke="#fa8c16" fill="#fa8c16" fillOpacity={0.2} strokeWidth={1.5} {...SANS_ANIMATION} />
            </AreaChart>
          </Graphique>
          <div style={{ ...styles.grille(2), marginTop: 8 }}>
            <Graphique titre="Heures d'affluence">
              <BarChart width={DEMI - 14} height={150} data={heures} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="heure" {...axe} interval={1} />
                <YAxis allowDecimals={false} {...axe} />
                <Bar dataKey="Consultations" fill="#fa8c16" {...SANS_ANIMATION} />
              </BarChart>
            </Graphique>
            <Graphique titre="Jours de la semaine">
              <BarChart width={DEMI - 14} height={150} data={joursSemaine.map((j) => ({ ...j, jour: j.jour.slice(0, 3) }))} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="jour" {...axe} />
                <YAxis allowDecimals={false} {...axe} />
                <Bar dataKey="Consultations" fill="#52c41a" {...SANS_ANIMATION} />
              </BarChart>
            </Graphique>
          </div>
        </Section>

        {/* Profil des patients */}
        <Section titre="Profil des patients">
          <div style={styles.grille(3)}>
            <Graphique titre="Sexe">
              <PieChart width={214} height={150}>
                <Pie data={sexe} dataKey="value" nameKey="name" innerRadius={28} outerRadius={50} label={labelCamembert} labelLine={false} fontSize={8} {...SANS_ANIMATION}>
                  {sexe.map((s) => <Cell key={s.name} fill={s.name === "Femmes" ? "#eb2f96" : s.name === "Hommes" ? PRIMARY_COLOR : "#d9d9d9"} />)}
                </Pie>
              </PieChart>
            </Graphique>
            <Graphique titre="Type de patient">
              <PieChart width={214} height={150}>
                <Pie data={types} dataKey="value" nameKey="name" outerRadius={50} label={labelCamembert} labelLine={false} fontSize={8} {...SANS_ANIMATION}>
                  {types.map((t, i) => <Cell key={t.name} fill={COULEURS[i % COULEURS.length]} />)}
                </Pie>
              </PieChart>
            </Graphique>
            <Graphique titre="Tranches d'âge">
              <BarChart width={214} height={150} data={ages} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="tranche" tick={{ fontSize: 7 }} interval={0} />
                <YAxis allowDecimals={false} {...axe} />
                <Bar dataKey="Patients" fill="#722ed1" {...SANS_ANIMATION} />
              </BarChart>
            </Graphique>
          </div>
        </Section>

        {/* Morbidité */}
        <Section titre="Diagnostics les plus fréquents">
          <Tableau colonnes={colonnesClassement("Diagnostic", true)} lignes={diagnostics} />
        </Section>
        <div style={styles.grille(2)}>
          <Section titre="Pathologies">
            <Tableau colonnes={colonnesClassement("Pathologie", true).filter((c) => c.titre !== "Préc.")} lignes={parPathologie.slice(0, 10)} />
          </Section>
          <Section titre="Motifs de consultation">
            <Tableau colonnes={colonnesClassement("Motif").filter((c) => c.titre !== "Préc.")} lignes={parMotif.slice(0, 10)} />
          </Section>
        </div>
        <Section titre="Régions concernées">
          <Tableau colonnes={colonnesClassement("Région", true)} lignes={parRegion.slice(0, 10)} />
        </Section>

        {/* Activité par médecin */}
        <Section titre="Activité par médecin">
          <Tableau
            lignes={parMedecin}
            colonnes={[
              { titre: "Médecin", rendu: (r) => <b>{r.medecin}</b> },
              { titre: "Consult.", rendu: (r) => r.consultations, align: "right" },
              { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" },
              { titre: "Patients", rendu: (r) => r.patients, align: "right" },
              { titre: "Ordonn.", rendu: (r) => r.ordonnances, align: "right" },
              { titre: "Analyses", rendu: (r) => r.analyses, align: "right" },
              { titre: "Imageries", rendu: (r) => r.imageries, align: "right" },
              { titre: "Repos", rendu: (r) => `${r.repos} (${r.joursRepos} j)`, align: "right" },
              { titre: "Fièvres", rendu: (r) => r.fievres, align: "right" },
            ]}
          />
        </Section>

        {/* Prescriptions */}
        <Section titre="Médicaments les plus prescrits">
          <Tableau colonnes={colonnesActes("Médicament")} lignes={medicaments.slice(0, 10)} />
        </Section>
        <div style={styles.grille(2)}>
          <Section titre="Analyses les plus prescrites">
            <Tableau colonnes={colonnesActes("Analyse")} lignes={analyses.slice(0, 10)} />
          </Section>
          <Section titre="Imageries les plus prescrites">
            <Tableau colonnes={colonnesActes("Imagerie")} lignes={imageries.slice(0, 10)} />
          </Section>
        </div>

        {/* Accidents du travail */}
        <Section titre="Accidents du travail">
          {at.total === 0 ? (
            <div style={{ color: "#999" }}>Aucun accident du travail sur cette période.</div>
          ) : (
            <>
              <div style={{ ...styles.grille(4), marginBottom: 8 }}>
                <Kpi couleur="#fa541c" label="Accidents" valeur={at.total} pied={variationTexte(at.total, atPrec.total, true)} />
                <Kpi couleur="#13c2c2" label="Jours d'ITT" valeur={at.joursItt} pied={`ITT moyenne ${at.ittMoyen} j`} />
                <Kpi couleur="#faad14" label="Avec arrêt" valeur={at.avecArret} pied={`${at.tauxArret} % des accidents`} />
                <Kpi couleur="#9f5822" label="Lieu principal" valeur={at.parLieu[0]?.name || "—"} pied={at.parLieu[0] ? `${at.parLieu[0].value} accident(s)` : ""} />
              </div>
              <div style={styles.grille(2)}>
                <Tableau
                  lignes={accidents}
                  colonnes={[
                    { titre: "N°", rendu: (r) => r.num_at },
                    { titre: "Date", rendu: (r) => (r.date_at ? dayjs(r.date_at).format("DD/MM/YYYY") : "-") },
                    { titre: "Victime", rendu: (r) => `${r.prenoms || ""} ${r.nom || ""}`.trim() },
                    { titre: "Lieu", rendu: (r) => r.lieu_at || "-" },
                    { titre: "ITT", rendu: (r) => (r.itt ? `${r.itt} j` : "-"), align: "right" },
                  ]}
                />
                <Tableau
                  lignes={at.parZone}
                  vide="Aucune zone de lésion renseignée"
                  colonnes={[
                    { titre: "Zone touchée", rendu: (r) => ZONES_LESIONS[r.zone] || r.zone },
                    { titre: "Accidents", rendu: (r) => r.value, align: "right" },
                  ]}
                />
              </div>
            </>
          )}
        </Section>

        {/* Visites médicales */}
        <Section titre="Visites médicales">
          <div style={{ fontSize: "8pt", color: "#666", marginBottom: 6 }}>
            {visites.total} visite(s), {visites.patients} patient(s), taux d'aptitude {visites.tauxAptitude} %. Pour l'historique, le type et le résultat sont déduits du motif et du diagnostic saisi en texte libre ({visites.deduits} visite(s)).
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Tableau lignes={visites.parType} colonnes={[{ titre: "Type de visite", rendu: (r) => <b>{r.name}</b> }, { titre: "Visites", rendu: (r) => r.value, align: "right" }, { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" }]} />
            <Tableau lignes={visites.parResultat} colonnes={[{ titre: "Résultat", rendu: (r) => <b>{r.name}</b> }, { titre: "Visites", rendu: (r) => r.value, align: "right" }, { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" }]} />
          </div>
        </Section>

        {/* Qualité des données */}
        <Section titre="Qualité des données">
          <div style={{ fontSize: "8pt", color: "#666", marginBottom: 6 }}>
            Taux de remplissage des champs des consultations : un taux faible rend les classements correspondants peu représentatifs.
          </div>
          <div style={styles.grille(3)}>
            {qualite.map((q) => (
              <div key={q.champ} style={{ fontSize: "8pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{q.champ}</span><b>{q.taux} %</b>
                </div>
                <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3 }}>
                  <div style={{ width: `${q.taux}%`, height: 5, borderRadius: 3, background: q.taux < 50 ? "#ff4d4f" : q.taux < 80 ? "#faad14" : "#52c41a" }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

export default RapportImpression;

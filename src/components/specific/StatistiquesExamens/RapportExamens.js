import React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { LOGO_BROWN, PRIMARY_COLOR } from "../../../constants/app.constants";
import {
  AXE, COULEURS_PDF, DEMI_PAGE, EnTetePdf, GraphiquePdf, KpiPdf, LARGEUR_PAGE, PortailPdf, QualitePdf, SANS_ANIMATION, SectionPdf,
  TableauPdf, labelCamembertPdf, stylesPdf, variationPdf,
} from "../../common/RapportPdf/RapportPdf";
import { formatDuree } from "../StatistiquesPharmacie/pharmaStatsUtils";

// Rapport PDF (A4 portrait) des statistiques du laboratoire ou de la radiologie
function RapportExamens({
  config, libellePeriode, libellePrecedent, origineFiltre, user, kpi, kpiPrec, serie, horaires, jours, origine, typesPatient,
  examens, categories, prescripteurs, techniciens, enAttente, sansResultat, qualite,
}) {
  return (
    <PortailPdf>
      <EnTetePdf
        titre={`Rapport — ${config.titre}`}
        sousTitre={<>{libellePeriode} · {origineFiltre === "ALL" ? "toutes origines" : `demandes ${origineFiltre.toLowerCase()}s`}</>}
        details={`Comparé à la période précédente (${libellePrecedent})`}
        user={user}
      />

      <SectionPdf titre="Indicateurs clés">
        <div style={stylesPdf.grille(4)}>
          <KpiPdf couleur={PRIMARY_COLOR} label={`${config.demandes} reçues`} valeur={kpi.demandes} pied={variationPdf(kpi.demandes, kpiPrec.demandes)} />
          <KpiPdf couleur="#52c41a" label="Taux de réalisation" valeur={`${kpi.tauxRealisation} %`} pied={`${kpi.realisees} réalisées · ${kpi.enAttente} en attente`} />
          <KpiPdf couleur="#722ed1" label="Délai médian" valeur={formatDuree(kpi.delaiMedian)} pied={`90 % < ${formatDuree(kpi.delaiP90)} · ${kpi.tauxRetard} % > 24 h`} />
          <KpiPdf couleur={kpi.tauxResultat < 50 ? "#ff4d4f" : "#52c41a"} label="Résultats déposés" valeur={`${kpi.tauxResultat} %`} pied={`${kpi.avecResultat} / ${kpi.realisees} réalisées`} />
          <KpiPdf couleur="#fa8c16" label={`${config.examens} demandés`} valeur={kpi.examens} pied={`${kpi.examensParDemande} par demande`} />
          <KpiPdf couleur={LOGO_BROWN} label="Patients distincts" valeur={kpi.patients} pied={`${kpi.tauxExternes} % de demandes externes`} />
          <KpiPdf couleur="#ff4d4f" label="En attente > 24 h" valeur={kpi.attenteAncienne} pied={variationPdf(kpi.attenteAncienne, kpiPrec.attenteAncienne, true)} />
          <KpiPdf couleur="#13c2c2" label="Réalisées sans résultat" valeur={kpi.sansResultat} pied="résultats à déposer" />
        </div>
      </SectionPdf>

      <SectionPdf titre={`${config.demandes} par type de patient`}>
        <TableauPdf lignes={typesPatient} vide="Aucune demande sur la période" colonnes={[
          { titre: "Type de patient", rendu: (r) => <b>{r.type}</b> },
          { titre: "Demandes", rendu: (r) => r.demandes, align: "right" },
          { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" },
          { titre: config.examens, rendu: (r) => r.examens, align: "right" },
          { titre: "Préc.", rendu: (r) => r.precedent, align: "right" },
        ]} />
      </SectionPdf>

      <SectionPdf titre="Activité">
        <GraphiquePdf titre={`Demandes reçues et réalisées (par ${serie.unite})`}>
          <AreaChart width={LARGEUR_PAGE - 14} height={180} data={serie.data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="periode" {...AXE} />
            <YAxis allowDecimals={false} {...AXE} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Area type="monotone" dataKey="Reçues" stroke={PRIMARY_COLOR} fill={PRIMARY_COLOR} fillOpacity={0.15} {...SANS_ANIMATION} />
            <Area type="monotone" dataKey="Réalisées" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} {...SANS_ANIMATION} />
          </AreaChart>
        </GraphiquePdf>
        <div style={{ ...stylesPdf.grille(2), marginTop: 8 }}>
          <GraphiquePdf titre="Affluence horaire">
            <BarChart width={DEMI_PAGE - 14} height={150} data={horaires} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="heure" {...AXE} interval={1} />
              <YAxis allowDecimals={false} {...AXE} />
              <Legend wrapperStyle={{ fontSize: 8 }} />
              <Bar dataKey="Reçues" fill={PRIMARY_COLOR} {...SANS_ANIMATION} />
              <Bar dataKey="Réalisées" fill="#52c41a" {...SANS_ANIMATION} />
            </BarChart>
          </GraphiquePdf>
          <GraphiquePdf titre="Jours de la semaine">
            <BarChart width={DEMI_PAGE - 14} height={150} data={jours.map((j) => ({ ...j, jour: j.jour.slice(0, 3) }))} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="jour" {...AXE} />
              <YAxis allowDecimals={false} {...AXE} />
              <Bar dataKey="Demandes" fill="#fa8c16" {...SANS_ANIMATION} />
            </BarChart>
          </GraphiquePdf>
        </div>
      </SectionPdf>

      <div style={stylesPdf.grille(2)}>
        <SectionPdf titre="Origine des demandes">
          <PieChart width={DEMI_PAGE} height={160}>
            <Pie data={origine} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55} label={labelCamembertPdf} labelLine={false} fontSize={8} {...SANS_ANIMATION}>
              {origine.map((o, i) => <Cell key={o.name} fill={COULEURS_PDF[i % COULEURS_PDF.length]} />)}
            </Pie>
          </PieChart>
        </SectionPdf>
        <SectionPdf titre="Répartition par catégorie">
          <TableauPdf lignes={categories} colonnes={[
            { titre: "Catégorie", rendu: (r) => <b>{r.categorie}</b> },
            { titre: "Examens", rendu: (r) => r.nombre, align: "right" },
            { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" },
          ]} />
        </SectionPdf>
      </div>

      <SectionPdf titre={`${config.examens} les plus demandés`}>
        <TableauPdf lignes={examens.slice(0, 15)} colonnes={[
          { titre: "#", rendu: (r) => r.rang, align: "center" },
          { titre: config.examen, rendu: (r) => <b>{r.libelle}</b> },
          { titre: "Catégorie", rendu: (r) => r.categorie },
          { titre: "Nombre", rendu: (r) => r.nombre, align: "right" },
          { titre: "Part", rendu: (r) => `${r.part} %`, align: "right" },
          { titre: "Préc.", rendu: (r) => r.precedent, align: "right" },
        ]} />
      </SectionPdf>

      <div style={stylesPdf.grille(2)}>
        <SectionPdf titre="Par prescripteur">
          <TableauPdf lignes={prescripteurs.slice(0, 10)} colonnes={[
            { titre: "Prescripteur", rendu: (r) => <b>{r.prescripteur}</b> },
            { titre: "Dem.", rendu: (r) => r.demandes, align: "right" },
            { titre: "Réalisées", rendu: (r) => `${r.tauxRealisation} %`, align: "right" },
          ]} />
        </SectionPdf>
        <SectionPdf titre={`Par ${config.technicien.toLowerCase()}`}>
          <TableauPdf lignes={techniciens} colonnes={[
            { titre: config.technicien, rendu: (r) => <b>{r.technicien}</b> },
            { titre: "Réalisées", rendu: (r) => r.demandes, align: "right" },
            { titre: "Résultats", rendu: (r) => `${r.tauxResultat} %`, align: "right" },
            { titre: "Délai méd.", rendu: (r) => formatDuree(r.delaiMedian), align: "right" },
          ]} />
        </SectionPdf>
      </div>

      <SectionPdf titre="Demandes en attente (les plus anciennes)">
        <TableauPdf lignes={enAttente.slice(0, 15)} vide="Aucune demande en attente" colonnes={[
          { titre: "N°", rendu: (r) => r.numpresc },
          { titre: "Date", rendu: (r) => dayjs(r.datepresc).format("DD/MM/YYYY") },
          { titre: "Patient", rendu: (r) => r.patient },
          { titre: config.examens, rendu: (r) => r.examens },
          { titre: "Ancienneté", rendu: (r) => `${r.age} j`, align: "right" },
        ]} />
      </SectionPdf>

      <SectionPdf titre="Réalisées sans résultat déposé">
        <TableauPdf lignes={sansResultat.slice(0, 15)} vide="Toutes les demandes réalisées ont un résultat" colonnes={[
          { titre: "N°", rendu: (r) => r.numpresc },
          { titre: "Réalisée le", rendu: (r) => (r.date_effet ? dayjs(r.date_effet).format("DD/MM/YYYY") : "-") },
          { titre: "Patient", rendu: (r) => r.patient },
          { titre: config.examens, rendu: (r) => r.examens },
        ]} />
        {sansResultat.length > 15 && <div style={stylesPdf.note}>… et {sansResultat.length - 15} autre(s) (liste complète dans l'export Excel).</div>}
      </SectionPdf>

      <SectionPdf titre="Qualité des données">
        <QualitePdf lignes={qualite} note="Taux de remplissage des informations des demandes : un taux faible limite la portée des analyses correspondantes." />
      </SectionPdf>
    </PortailPdf>
  );
}

export default RapportExamens;

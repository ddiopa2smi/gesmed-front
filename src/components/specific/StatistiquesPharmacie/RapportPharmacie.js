import React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { LOGO_BROWN, PRIMARY_COLOR } from "../../../constants/app.constants";
import { formatMontant } from "../../../utils/helpers";
import {
  AXE, COULEURS_PDF, DEMI_PAGE, EnTetePdf, GraphiquePdf, KpiPdf, LARGEUR_PAGE, PortailPdf, QualitePdf, SANS_ANIMATION, SectionPdf,
  TableauPdf, labelCamembertPdf, stylesPdf, variationPdf,
} from "../../common/RapportPdf/RapportPdf";
import { formatDuree } from "./pharmaStatsUtils";

const fcfa = (value) => `${formatMontant(Math.round(value || 0)) || 0} FCFA`;

// Rapport PDF (A4 portrait) des statistiques de la pharmacie
function RapportPharmacie({
  libellePeriode, libellePrecedent, user, kpi, kpiPrec, serie, heures, origine, dispenses, attente, dispensateurs,
  prescripteurs, aTraiter, fournisseurs, livraison, lots, sortiesMotif, qualite, nbProduits,
}) {
  const lotsAlertes = lots.filter((l) => l.jours <= 90);
  return (
    <PortailPdf>
      <EnTetePdf
        titre="Rapport de statistiques de la pharmacie"
        sousTitre={<><b>Pharmacie</b> · {libellePeriode}</>}
        details={`Comparé à la période précédente (${libellePrecedent})`}
        user={user}
      />

      <SectionPdf titre="Dispensation">
        <div style={stylesPdf.grille(4)}>
          <KpiPdf couleur={PRIMARY_COLOR} label="Ordonnances reçues" valeur={kpi.ordonnances} pied={variationPdf(kpi.ordonnances, kpiPrec.ordonnances)} />
          <KpiPdf couleur="#52c41a" label="Taux de service" valeur={`${kpi.tauxService} %`} pied={`${kpi.servies} servies · ${kpi.enAttente} en attente`} />
          <KpiPdf couleur="#722ed1" label="Délai médian de service" valeur={formatDuree(kpi.delaiMedian)} pied={`90 % en moins de ${formatDuree(kpi.delaiP90)}`} />
          <KpiPdf couleur={LOGO_BROWN} label="Valeur dispensée" valeur={fcfa(kpi.valeur)} pied={`Panier moyen ${fcfa(kpi.panierMoyen)}`} />
          <KpiPdf couleur="#13c2c2" label="Satisfaction des quantités" valeur={`${kpi.tauxSatisfaction} %`} pied={`${kpi.lignesIncompletes} ligne(s) incomplète(s)`} />
          <KpiPdf couleur="#fa8c16" label="Médicaments distincts" valeur={kpi.medicamentsDistincts} pied={`sur ${nbProduits} produits`} />
          <KpiPdf couleur={PRIMARY_COLOR} label="Commandes fournisseurs" valeur={kpi.commandes} pied={`${fcfa(kpi.montantCommandes)} · livraison ${livraison.median === null ? "—" : `${livraison.median} j`}`} />
          <KpiPdf couleur="#ff4d4f" label="Lots périmés ou < 3 mois" valeur={lotsAlertes.length} pied={`${lots.filter((l) => l.jours < 0).length} périmé(s) / ${lots.length} lots`} />
        </div>
      </SectionPdf>

      <SectionPdf titre="Activité">
        <GraphiquePdf titre={`Ordonnances reçues et servies (par ${serie.unite})`}>
          <AreaChart width={LARGEUR_PAGE - 14} height={180} data={serie.data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="periode" {...AXE} />
            <YAxis allowDecimals={false} {...AXE} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Area type="monotone" dataKey="Reçues" stroke={PRIMARY_COLOR} fill={PRIMARY_COLOR} fillOpacity={0.15} {...SANS_ANIMATION} />
            <Area type="monotone" dataKey="Servies" stroke="#52c41a" fill="#52c41a" fillOpacity={0.2} {...SANS_ANIMATION} />
          </AreaChart>
        </GraphiquePdf>
        <div style={{ ...stylesPdf.grille(2), marginTop: 8 }}>
          <GraphiquePdf titre="Valeur dispensée (FCFA)">
            <BarChart width={DEMI_PAGE - 14} height={150} data={serie.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="periode" {...AXE} />
              <YAxis {...AXE} tickFormatter={(v) => formatMontant(v)} />
              <Bar dataKey="Valeur (FCFA)" fill={LOGO_BROWN} {...SANS_ANIMATION} />
            </BarChart>
          </GraphiquePdf>
          <GraphiquePdf titre="Heures de service">
            <BarChart width={DEMI_PAGE - 14} height={150} data={heures} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="heure" {...AXE} interval={1} />
              <YAxis allowDecimals={false} {...AXE} />
              <Bar dataKey="Servies" fill="#52c41a" {...SANS_ANIMATION} />
            </BarChart>
          </GraphiquePdf>
        </div>
      </SectionPdf>

      <div style={stylesPdf.grille(2)}>
        <SectionPdf titre="Origine des ordonnances">
          <PieChart width={DEMI_PAGE} height={150}>
            <Pie data={origine} dataKey="value" nameKey="name" innerRadius={28} outerRadius={52} label={labelCamembertPdf} labelLine={false} fontSize={8} {...SANS_ANIMATION}>
              {origine.map((o, i) => <Cell key={o.name} fill={COULEURS_PDF[i % COULEURS_PDF.length]} />)}
            </Pie>
          </PieChart>
        </SectionPdf>
        <SectionPdf titre="Par dispensateur">
          <TableauPdf lignes={dispensateurs} colonnes={[
            { titre: "Dispensateur", rendu: (r) => <b>{r.dispensateur}</b> },
            { titre: "Servies", rendu: (r) => r.ordonnances, align: "right" },
            { titre: "Valeur", rendu: (r) => fcfa(r.valeur), align: "right" },
            { titre: "Délai méd.", rendu: (r) => formatDuree(r.delaiMedian), align: "right" },
          ]} />
        </SectionPdf>
      </div>

      <SectionPdf titre="Médicaments dispensés">
        <TableauPdf lignes={dispenses.slice(0, 15)} colonnes={[
          { titre: "#", rendu: (r) => r.rang, align: "center" },
          { titre: "Médicament", rendu: (r) => <b>{r.libelle}</b> },
          { titre: "Ordonnances", rendu: (r) => r.ordonnances, align: "right" },
          { titre: "Qté servie", rendu: (r) => r.quantite, align: "right" },
          { titre: "Valeur", rendu: (r) => fcfa(r.valeur), align: "right" },
        ]} />
      </SectionPdf>

      <div style={stylesPdf.grille(2)}>
        <SectionPdf titre="Demande en attente">
          <TableauPdf lignes={attente.slice(0, 10)} colonnes={[
            { titre: "Médicament", rendu: (r) => <b>{r.libelle}</b> },
            { titre: "Ordonn.", rendu: (r) => r.ordonnances, align: "right" },
            { titre: "Qté", rendu: (r) => r.quantite, align: "right" },
          ]} />
        </SectionPdf>
        <SectionPdf titre="Par prescripteur">
          <TableauPdf lignes={prescripteurs.slice(0, 10)} colonnes={[
            { titre: "Prescripteur", rendu: (r) => <b>{r.prescripteur}</b> },
            { titre: "Ordonn.", rendu: (r) => r.ordonnances, align: "right" },
            { titre: "Servies", rendu: (r) => `${r.tauxService} %`, align: "right" },
          ]} />
        </SectionPdf>
      </div>

      <SectionPdf titre="Ordonnances à traiter (les plus anciennes)">
        <TableauPdf lignes={aTraiter.slice(0, 15)} vide="Aucune ordonnance en attente" colonnes={[
          { titre: "N°", rendu: (r) => r.numpresc },
          { titre: "Date", rendu: (r) => dayjs(r.datepresc).format("DD/MM/YYYY") },
          { titre: "Patient", rendu: (r) => r.patient },
          { titre: "Prescripteur", rendu: (r) => r.prescripteur },
          { titre: "Ancienneté", rendu: (r) => `${r.age} j`, align: "right" },
        ]} />
      </SectionPdf>

      <div style={stylesPdf.grille(2)}>
        <SectionPdf titre="Approvisionnement">
          <TableauPdf lignes={fournisseurs} vide="Aucune commande sur la période" colonnes={[
            { titre: "Fournisseur", rendu: (r) => <b>{r.fournisseur}</b> },
            { titre: "Cmd", rendu: (r) => r.commandes, align: "right" },
            { titre: "Montant", rendu: (r) => fcfa(r.montant), align: "right" },
          ]} />
        </SectionPdf>
        <SectionPdf titre="Sorties de stock">
          <TableauPdf lignes={sortiesMotif} vide="Aucune sortie sur la période" colonnes={[
            { titre: "Motif", rendu: (r) => <b>{r.name}</b> },
            { titre: "Sorties", rendu: (r) => r.value, align: "right" },
          ]} />
        </SectionPdf>
      </div>

      <SectionPdf titre="Péremptions (lots périmés ou à moins de 3 mois)">
        <TableauPdf lignes={lotsAlertes.slice(0, 20)} vide="Aucun lot périmé ou proche de la péremption" colonnes={[
          { titre: "Produit", rendu: (r) => <b>{r.produit}</b> },
          { titre: "Lot", rendu: (r) => r.lot },
          { titre: "Péremption", rendu: (r) => dayjs(r.peremption).format("DD/MM/YYYY") },
          { titre: "Jours", rendu: (r) => r.jours, align: "right" },
          { titre: "Statut", rendu: (r) => r.statut },
        ]} />
      </SectionPdf>

      <SectionPdf titre="Qualité du référentiel produits">
        <QualitePdf lignes={qualite} note={`Taux de remplissage des fiches produits (${nbProduits} produits) : un taux faible rend les indicateurs de stock et de marge inexploitables.`} />
      </SectionPdf>
    </PortailPdf>
  );
}

export default RapportPharmacie;

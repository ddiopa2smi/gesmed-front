import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Button, Card, Col, DatePicker, Flex, Progress, Row, Select, Skeleton, Space, Table, Tabs, Tag, Tooltip, Typography, theme,
} from "antd";
import {
  ArrowDownOutlined, ArrowUpOutlined, BarChartOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, FieldTimeOutlined, FileExcelOutlined, FilePdfOutlined, InboxOutlined, MedicineBoxOutlined, ReloadOutlined, ShoppingCartOutlined, WarningOutlined,
} from "@ant-design/icons";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis,
} from "recharts";
import dayjs from "dayjs";
import { getActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions, LOGO_BROWN } from "../../../constants/app.constants";
import { exportWorkbookToExcel, formatMontant } from "../../../utils/helpers";
import { KpiCard } from "../../common/KpiCard/KpiCard";
import { PERIODES, evolution, inRange, periodePrecedente } from "../StatistiquesMedicales/statsUtils";
import {
  activiteParDispensateur, activiteParPrescripteur, calculerKpisPharmacie, delaisLivraison, formatDuree, heuresDeService,
  lotsPeremption, ordonnancesEnAttente, parFournisseur, qualiteReferentiel, repartitionOrigine, serieDispensation,
  sortiesParMotif, topMedicamentsDispenses, topMedicamentsEnAttente,
} from "./pharmaStatsUtils";
import RapportPharmacie from "./RapportPharmacie";
import { useImpressionPdf } from "../../common/RapportPdf/RapportPdf";
import { getUserConnected } from "../../../utils/profils";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COULEURS = ["#31bae8", "#9f5822", "#52c41a", "#722ed1", "#fa8c16", "#eb2f96", "#13c2c2"];
const fcfa = (value) => `${formatMontant(Math.round(value || 0)) || 0} FCFA`;

// Variation par rapport à la période précédente ; "inverse" : une hausse est défavorable
const Variation = ({ courant, precedent, inverse = false, format = (v) => v }) => {
  const { token } = theme.useToken();
  const ev = evolution(courant, precedent);
  if (ev === null) return <Text type="secondary">Pas de comparaison possible</Text>;
  const favorable = inverse ? ev <= 0 : ev >= 0;
  return (
    <Text type="secondary">
      <span style={{ color: ev === 0 ? token.colorTextSecondary : favorable ? token.colorSuccess : token.colorError, fontWeight: 600 }}>
        {ev > 0 ? <ArrowUpOutlined /> : ev < 0 ? <ArrowDownOutlined /> : null} {Math.abs(ev)} %
      </span>{" "}
      vs période précédente ({format(precedent)})
    </Text>
  );
};

const ChartCard = ({ title, icon, extra, children, height = 260 }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Card size="small" title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>} extra={extra} style={{ height: "100%" }}>
      <div style={{ width: "100%", height }}>{children}</div>
    </Card>
  );
};

const STATUT_PEREMPTION = {
  "Périmé": "error",
  "Moins de 3 mois": "warning",
  "3 à 6 mois": "gold",
  "Plus de 6 mois": "success",
};

function StatistiquesPharmacie() {
  const { token } = theme.useToken();
  const [periode, setPeriode] = useState("mois");
  const [rangePerso, setRangePerso] = useState(null);
  const [refetch, setRefetch] = useState(0);

  const range = useMemo(
    () => (periode === "perso" && rangePerso ? [rangePerso[0].startOf("day"), rangePerso[1].endOf("day")] : PERIODES[periode === "perso" ? "mois" : periode].range()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periode, rangePerso, refetch]
  );
  const rangePrecedent = useMemo(() => periodePrecedente(range), [range]);
  const { impression, imprimer } = useImpressionPdf(
    `Statistiques pharmacie ${range[0].format("DD-MM-YYYY")} au ${range[1].format("DD-MM-YYYY")}`
  );

  const [donnees, setDonnees] = useState({ ordonnances: [], produits: [], commandes: [], receptions: [], sorties: [] });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const debut = rangePrecedent[0].format("YYYY-MM-DD");
    const fin = range[1].format("YYYY-MM-DD");
    setLoading(true);
    setErreur(null);
    Promise.all([
      // Servies : l'API filtre sur la date de service -> chargées jusqu'à aujourd'hui, puis filtrées sur la date de prescription
      getActions(endpoints.prescriptions.LIST_BY_DATE(debut, dayjs().format("YYYY-MM-DD"), "Oui")),
      getActions(endpoints.prescriptions.LIST_BY_DATE(debut, fin, "Non")),
      getActions(endpoints.fiche_produit.LIST),
      getActions(endpoints.commande_produit.LIST).catch(() => ({ data: [] })),
      getActions(endpoints.entrees_produits.LIST).catch(() => ({ data: [] })),
      getActions(endpoints.sorties_produits.LIST).catch(() => ({ data: [] })),
    ])
      .then(([servies, enAttente, produits, commandes, receptions, sorties]) => {
        const ordonnances = [...(servies?.data || []), ...(enAttente?.data || [])]
          .filter((p) => p.codepresc === codesPrescriptions.ORD)
          .filter((p) => inRange(p.datepresc, [rangePrecedent[0], range[1]]));
        setDonnees({
          ordonnances: Object.values(Object.fromEntries(ordonnances.map((o) => [o.numpresc, o]))),
          produits: produits?.data || [],
          commandes: commandes?.data || [],
          receptions: receptions?.data || [],
          sorties: sorties?.data || [],
        });
      })
      .catch(() => setErreur("Impossible de charger les données de la pharmacie."))
      .finally(() => setLoading(false));
  }, [range, rangePrecedent]);

  const decouper = (r) => ({
    ordonnances: donnees.ordonnances.filter((o) => inRange(o.datepresc, r)),
    commandes: donnees.commandes.filter((c) => inRange(c.date_bc, r)),
    receptions: donnees.receptions.filter((x) => inRange(x.date_br || x.date_liv, r)),
    sorties: donnees.sorties.filter((s) => inRange(s.date_sortie, r)),
  });
  const courant = useMemo(() => decouper(range), [donnees, range]); // eslint-disable-line react-hooks/exhaustive-deps
  const precedent = useMemo(() => decouper(rangePrecedent), [donnees, rangePrecedent]); // eslint-disable-line react-hooks/exhaustive-deps

  const kpi = useMemo(() => calculerKpisPharmacie(courant), [courant]);
  const kpiPrec = useMemo(() => calculerKpisPharmacie(precedent), [precedent]);
  const serie = useMemo(() => serieDispensation({ ordonnances: courant.ordonnances, range }), [courant, range]);
  const heures = useMemo(() => heuresDeService(courant.ordonnances), [courant]);
  const origine = useMemo(() => repartitionOrigine(courant.ordonnances), [courant]);
  const dispenses = useMemo(() => topMedicamentsDispenses(courant.ordonnances), [courant]);
  const attente = useMemo(() => topMedicamentsEnAttente(courant.ordonnances), [courant]);
  const dispensateurs = useMemo(() => activiteParDispensateur(courant.ordonnances), [courant]);
  const prescripteurs = useMemo(() => activiteParPrescripteur(courant.ordonnances), [courant]);
  const aTraiter = useMemo(() => ordonnancesEnAttente(courant.ordonnances), [courant]);
  const fournisseurs = useMemo(() => parFournisseur(courant.commandes), [courant]);
  const livraison = useMemo(() => delaisLivraison(donnees.commandes, donnees.receptions), [donnees]);
  const lots = useMemo(() => lotsPeremption(donnees.receptions), [donnees]);
  const sortiesMotif = useMemo(() => sortiesParMotif(courant.sorties), [courant]);
  const qualite = useMemo(() => qualiteReferentiel(donnees.produits), [donnees]);

  const lotsAlertes = lots.filter((l) => l.jours <= 90);
  const libellePeriode = `du ${range[0].format("DD/MM/YYYY")} au ${range[1].format("DD/MM/YYYY")}`;
  const libellePrecedent = `${rangePrecedent[0].format("DD/MM/YYYY")} – ${rangePrecedent[1].format("DD/MM/YYYY")}`;
  const referentielIncomplet = qualite.filter((q) => q.taux < 50);

  /* ---------------- Export Excel ---------------- */
  const exporter = () => {
    const ligne = (indicateur, cle, unite = "") => ({
      Indicateur: indicateur, "Période": `${kpi[cle] ?? ""}${unite}`, "Période précédente": `${kpiPrec[cle] ?? ""}${unite}`,
      "Évolution (%)": evolution(kpi[cle], kpiPrec[cle]) ?? "",
    });
    exportWorkbookToExcel([
      {
        name: "Synthèse", synthese: true,
        rows: [
          { Indicateur: "Période", "Période": libellePeriode, "Période précédente": libellePrecedent, "Évolution (%)": "" },
          ligne("Ordonnances reçues", "ordonnances"),
          ligne("Ordonnances servies", "servies"),
          ligne("Ordonnances en attente", "enAttente"),
          ligne("Taux de service", "tauxService", " %"),
          { Indicateur: "Délai médian de service", "Période": formatDuree(kpi.delaiMedian), "Période précédente": formatDuree(kpiPrec.delaiMedian), "Évolution (%)": "" },
          { Indicateur: "Délai de service (90 % des ordonnances)", "Période": formatDuree(kpi.delaiP90), "Période précédente": formatDuree(kpiPrec.delaiP90), "Évolution (%)": "" },
          ligne("Valeur dispensée (FCFA)", "valeur"),
          ligne("Panier moyen (FCFA)", "panierMoyen"),
          ligne("Lignes par ordonnance", "lignesParOrdonnance"),
          ligne("Taux de satisfaction des quantités", "tauxSatisfaction", " %"),
          ligne("Lignes servies incomplètes", "lignesIncompletes"),
          ligne("Médicaments distincts dispensés", "medicamentsDistincts"),
          ligne("Ordonnances externes", "externes"),
          ligne("Commandes fournisseurs", "commandes"),
          ligne("Montant des commandes (FCFA)", "montantCommandes"),
          ligne("Réceptions", "receptions"),
          ligne("Montant des réceptions (FCFA)", "montantReceptions"),
          ligne("Sorties de stock", "sorties"),
        ],
      },
      { name: "Évolution", rows: serie.data.map((r) => ({ "Période": r.periode, "Reçues": r["Reçues"], Servies: r.Servies, "Valeur (FCFA)": r["Valeur (FCFA)"] })) },
      { name: "Médicaments dispensés", rows: dispenses.map((r) => ({ Rang: r.rang, "Médicament": r.libelle, Ordonnances: r.ordonnances, "Quantité servie": r.quantite, "Valeur (FCFA)": r.valeur })) },
      { name: "Demande en attente", rows: attente.map((r) => ({ Rang: r.rang, "Médicament": r.libelle, "Ordonnances en attente": r.ordonnances, "Quantité demandée": r.quantite })) },
      { name: "Dispensateurs", rows: dispensateurs.map((r) => ({ Dispensateur: r.dispensateur, "Ordonnances servies": r.ordonnances, "Part (%)": r.part, "Valeur (FCFA)": r.valeur, "Délai médian": formatDuree(r.delaiMedian) })) },
      { name: "Prescripteurs", rows: prescripteurs.map((r) => ({ Prescripteur: r.prescripteur, Ordonnances: r.ordonnances, Servies: r.servies, "Taux de service (%)": r.tauxService })) },
      { name: "Ordonnances à traiter", rows: aTraiter.map((r) => ({ "N° ordonnance": r.numpresc, Date: dayjs(r.datepresc).format("DD/MM/YYYY HH:mm"), Patient: r.patient, Prescripteur: r.prescripteur, Lignes: r.lignes, "Ancienneté (jours)": r.age })) },
      { name: "Fournisseurs", rows: fournisseurs.map((r) => ({ Fournisseur: r.fournisseur, Commandes: r.commandes, "Montant (FCFA)": r.montant, "Part (%)": r.part })) },
      { name: "Péremptions", rows: lots.map((r) => ({ Produit: r.produit, Lot: r.lot, "Péremption": dayjs(r.peremption).format("DD/MM/YYYY"), "Jours restants": r.jours, Statut: r.statut, "Quantité reçue": r.quantite, Fournisseur: r.fournisseur })) },
      { name: "Sorties", rows: sortiesMotif.map((r) => ({ Motif: r.name, Sorties: r.value })) },
      { name: "Qualité référentiel", rows: qualite.map((r) => ({ Champ: r.champ, "Taux de remplissage (%)": r.taux })) },
    ], `Statistiques_pharmacie_${range[0].format("YYYYMMDD")}_${range[1].format("YYYYMMDD")}`, {
      titre: "Statistiques de la pharmacie",
      sousTitre: libellePeriode,
      details: `Comparé à la période précédente (${libellePrecedent})`,
      indicateurs: [
        { label: "Ordonnances reçues", valeur: kpi.ordonnances, pied: `${kpiPrec.ordonnances} sur la période précédente`, couleur: token.colorPrimary },
        { label: "Taux de service", valeur: `${kpi.tauxService} %`, pied: `${kpi.servies} servies · ${kpi.enAttente} en attente`, couleur: token.colorSuccess },
        { label: "Délai médian de service", valeur: formatDuree(kpi.delaiMedian), pied: `90 % en moins de ${formatDuree(kpi.delaiP90)}`, couleur: "#722ed1" },
        { label: "Valeur dispensée", valeur: fcfa(kpi.valeur), pied: `Panier moyen ${fcfa(kpi.panierMoyen)}`, couleur: LOGO_BROWN },
        { label: "Satisfaction des quantités", valeur: `${kpi.tauxSatisfaction} %`, pied: `${kpi.lignesIncompletes} ligne(s) incomplète(s)`, couleur: "#13c2c2" },
        { label: "Médicaments distincts dispensés", valeur: kpi.medicamentsDistincts, pied: `sur ${donnees.produits.length} produits référencés`, couleur: "#fa8c16" },
        { label: "Commandes fournisseurs", valeur: kpi.commandes, pied: fcfa(kpi.montantCommandes), couleur: token.colorPrimary },
        { label: "Lots périmés ou < 3 mois", valeur: lotsAlertes.length, pied: `sur ${lots.length} lots reçus`, couleur: token.colorError },
      ],
      graphiques: [
        { titre: "Ordonnances reçues et servies", type: "aire", data: serie.data, x: "periode", series: [{ cle: "Reçues", couleur: token.colorPrimary }, { cle: "Servies", couleur: token.colorSuccess }] },
        { titre: "Origine des ordonnances", type: "donut", data: origine, x: "name", series: [{ cle: "value" }], demi: true },
        { titre: "Heures de service", type: "barres", data: heures, x: "heure", series: [{ cle: "Servies", couleur: token.colorSuccess }], demi: true },
        { titre: "Valeur dispensée (FCFA)", type: "barres", data: serie.data, x: "periode", series: [{ cle: "Valeur (FCFA)", couleur: LOGO_BROWN }] },
        { titre: "Médicaments les plus dispensés", type: "barresH", data: dispenses.slice(0, 12), x: "libelle", series: [{ cle: "quantite", couleur: token.colorPrimary }] },
      ],
    });
  };

  const pieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)} %`;
  const tableProps = { size: "small", className: "compact-table", pagination: false, loading };

  return (
    <div>
      {impression && (
        <RapportPharmacie
          libellePeriode={libellePeriode} libellePrecedent={libellePrecedent} user={getUserConnected()}
          kpi={kpi} kpiPrec={kpiPrec} serie={serie} heures={heures} origine={origine} dispenses={dispenses}
          attente={attente} dispensateurs={dispensateurs} prescripteurs={prescripteurs} aTraiter={aTraiter}
          fournisseurs={fournisseurs} livraison={livraison} lots={lots} sortiesMotif={sortiesMotif}
          qualite={qualite} nbProduits={donnees.produits.length}
        />
      )}
      {/* En-tête et filtres */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <div>
            <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: token.colorPrimary }}>
              <BarChartOutlined /> Pilotage de la pharmacie
            </Text>
            <Title level={3} style={{ margin: 0, color: LOGO_BROWN }}>Statistiques de la pharmacie</Title>
            <Text type="secondary">{libellePeriode} · comparé à la période précédente ({libellePrecedent})</Text>
          </div>
          <Space wrap>
            <Select
              value={periode}
              onChange={setPeriode}
              style={{ minWidth: 180 }}
              suffixIcon={<CalendarOutlined />}
              options={[...Object.entries(PERIODES).map(([value, { label }]) => ({ value, label })), { value: "perso", label: "Période personnalisée" }]}
            />
            {periode === "perso" && <RangePicker format="DD/MM/YYYY" value={rangePerso} onChange={setRangePerso} allowClear={false} />}
            <Tooltip title="Actualiser"><Button icon={<ReloadOutlined />} onClick={() => setRefetch(Date.now())} /></Tooltip>
            <Button icon={<FileExcelOutlined />} onClick={exporter} disabled={loading} style={{ color: "#1d6f42", borderColor: "#1d6f42" }}>
              Export Excel
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={imprimer}
              loading={impression}
              disabled={loading}
              style={{ color: "#c0392b", borderColor: "#c0392b" }}
            >
              Export PDF
            </Button>
          </Space>
        </Flex>
      </Card>

      {erreur && <Alert type="error" showIcon message={erreur} style={{ marginBottom: 16 }} />}
      {referentielIncomplet.length > 0 && !loading && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message="Référentiel produits incomplet"
          description={`Champs peu renseignés : ${referentielIncomplet.map((q) => `${q.champ.toLowerCase()} (${q.taux} %)`).join(", ")}. Les indicateurs de stock et de marge ne sont pas encore exploitables (voir l'onglet « Qualité du référentiel »).`}
        />
      )}

      {/* Dispensation */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<MedicineBoxOutlined />} color={token.colorPrimary} label="Ordonnances reçues" value={kpi.ordonnances} loading={loading}
            footer={<Variation courant={kpi.ordonnances} precedent={kpiPrec.ordonnances} />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<CheckCircleOutlined />} color={token.colorSuccess} label="Taux de service" value={`${kpi.tauxService} %`} loading={loading}
            footer={<Text type="secondary"><Text strong>{kpi.servies}</Text> servies · <Text strong type="warning">{kpi.enAttente}</Text> en attente</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<FieldTimeOutlined />} color="#722ed1" label="Délai médian de service" value={formatDuree(kpi.delaiMedian)} loading={loading}
            footer={<Text type="secondary">90 % servies en moins de <Text strong>{formatDuree(kpi.delaiP90)}</Text></Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<DollarOutlined />} color={LOGO_BROWN} label="Valeur dispensée" value={fcfa(kpi.valeur)} loading={loading}
            footer={<Text type="secondary">Panier moyen <Text strong>{fcfa(kpi.panierMoyen)}</Text></Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<InboxOutlined />} color="#13c2c2" label="Satisfaction des quantités" value={`${kpi.tauxSatisfaction} %`} loading={loading}
            footer={<Text type="secondary"><Text strong>{kpi.lignesIncompletes}</Text> ligne(s) servie(s) incomplète(s) · {kpi.lignesParOrdonnance} lignes / ordonnance</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<MedicineBoxOutlined />} color="#fa8c16" label="Médicaments distincts dispensés" value={kpi.medicamentsDistincts} loading={loading}
            footer={<Text type="secondary">sur <Text strong>{donnees.produits.length}</Text> produits référencés</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<ShoppingCartOutlined />} color={token.colorPrimary} label="Commandes fournisseurs" value={kpi.commandes} loading={loading}
            footer={<Text type="secondary"><Text strong>{fcfa(kpi.montantCommandes)}</Text> · {kpi.commandesEnCours} en cours · livraison en {livraison.median === null ? "—" : `${livraison.median} j`}</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<WarningOutlined />} color={token.colorError} label="Lots périmés ou < 3 mois" value={lotsAlertes.length} loading={loading}
            footer={<Text type="secondary"><Text strong type="danger">{lots.filter((l) => l.jours < 0).length}</Text> périmé(s) · sur {lots.length} lots reçus</Text>} />
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={16}>
          <ChartCard title="Ordonnances reçues et servies" icon={<BarChartOutlined />} extra={<Text type="secondary">par {serie.unite}</Text>}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <AreaChart data={serie.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Reçues" stroke={token.colorPrimary} fill={token.colorPrimary} fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="Servies" stroke={token.colorSuccess} fill={token.colorSuccess} fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <ChartCard title="Origine des ordonnances" icon={<MedicineBoxOutlined />}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={origine} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" label={pieLabel}>
                    {origine.map((o, i) => <Cell key={o.name} fill={COULEURS[i % COULEURS.length]} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} xl={16}>
          <ChartCard title="Valeur dispensée" icon={<DollarOutlined />} extra={<Text type="secondary">FCFA, par {serie.unite}</Text>}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <BarChart data={serie.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatMontant(v)} />
                  <ChartTooltip formatter={(v) => fcfa(v)} />
                  <Bar dataKey="Valeur (FCFA)" fill={LOGO_BROWN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <ChartCard title="Heures de service" icon={<ClockCircleOutlined />}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <BarChart data={heures} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="heure" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip />
                  <Bar dataKey="Servies" fill={token.colorSuccess} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
      </Row>

      {/* Tableaux */}
      <Card size="small" styles={{ body: { paddingTop: 0 } }}>
        <Tabs
          items={[
            {
              key: "dispenses", label: "Médicaments dispensés",
              children: (
                <Table {...tableProps} dataSource={dispenses} columns={[
                  { title: "#", dataIndex: "rang", width: 50, align: "center" },
                  { title: "Médicament", dataIndex: "libelle", render: (v) => <Text strong>{v}</Text> },
                  { title: "Ordonnances", dataIndex: "ordonnances", align: "right", sorter: (a, b) => a.ordonnances - b.ordonnances },
                  { title: "Quantité servie", dataIndex: "quantite", align: "right", sorter: (a, b) => a.quantite - b.quantite },
                  { title: "Valeur", dataIndex: "valeur", align: "right", sorter: (a, b) => a.valeur - b.valeur, defaultSortOrder: "descend", render: (v) => fcfa(v) },
                ]} />
              ),
            },
            {
              key: "attente", label: <span>Demande en attente <Tag color="warning">{kpi.enAttente}</Tag></span>,
              children: (
                <>
                  <Text type="secondary" style={{ display: "block", margin: "8px 0" }}>
                    Médicaments les plus présents dans les ordonnances non encore servies : utile pour anticiper les commandes.
                  </Text>
                  <Table {...tableProps} dataSource={attente} columns={[
                    { title: "#", dataIndex: "rang", width: 50, align: "center" },
                    { title: "Médicament", dataIndex: "libelle", render: (v) => <Text strong>{v}</Text> },
                    { title: "Ordonnances en attente", dataIndex: "ordonnances", align: "right" },
                    { title: "Quantité demandée", dataIndex: "quantite", align: "right" },
                  ]} />
                </>
              ),
            },
            {
              key: "atraiter", label: "Ordonnances à traiter",
              children: (
                <Table {...tableProps} dataSource={aTraiter} columns={[
                  { title: "N° ordonnance", dataIndex: "numpresc", render: (v) => <Text strong>{v}</Text> },
                  { title: "Date", dataIndex: "datepresc", render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm") },
                  { title: "Patient", dataIndex: "patient" },
                  { title: "Prescripteur", dataIndex: "prescripteur" },
                  { title: "Lignes", dataIndex: "lignes", align: "center" },
                  {
                    title: "Ancienneté", dataIndex: "age", align: "right",
                    render: (v) => <Tag color={v > 7 ? "error" : v > 2 ? "warning" : "default"}>{v === 0 ? "aujourd'hui" : `${v} j`}</Tag>,
                  },
                ]} />
              ),
            },
            {
              key: "dispensateurs", label: "Par dispensateur",
              children: (
                <Table {...tableProps} dataSource={dispensateurs} columns={[
                  { title: "Dispensateur", dataIndex: "dispensateur", render: (v) => <Text strong>{v}</Text> },
                  { title: "Ordonnances servies", dataIndex: "ordonnances", align: "right" },
                  { title: "Part", dataIndex: "part", width: 180, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                  { title: "Valeur", dataIndex: "valeur", align: "right", render: (v) => fcfa(v) },
                  { title: "Délai médian", dataIndex: "delaiMedian", align: "right", render: (v) => formatDuree(v) },
                ]} />
              ),
            },
            {
              key: "prescripteurs", label: "Par prescripteur",
              children: (
                <Table {...tableProps} dataSource={prescripteurs} columns={[
                  { title: "Prescripteur", dataIndex: "prescripteur", render: (v) => <Text strong>{v}</Text> },
                  { title: "Ordonnances", dataIndex: "ordonnances", align: "right" },
                  { title: "Servies", dataIndex: "servies", align: "right" },
                  { title: "Taux de service", dataIndex: "tauxService", width: 200, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                ]} />
              ),
            },
            {
              key: "fournisseurs", label: "Approvisionnement",
              children: (
                <Row gutter={16}>
                  <Col xs={24} lg={14}>
                    <Title level={5} style={{ marginTop: 8 }}>Commandes par fournisseur</Title>
                    <Table {...tableProps} dataSource={fournisseurs} locale={{ emptyText: "Aucune commande sur la période" }} columns={[
                      { title: "Fournisseur", dataIndex: "fournisseur", render: (v) => <Text strong>{v}</Text> },
                      { title: "Commandes", dataIndex: "commandes", align: "right" },
                      { title: "Montant", dataIndex: "montant", align: "right", render: (v) => fcfa(v) },
                      { title: "Part", dataIndex: "part", width: 150, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                    ]} />
                  </Col>
                  <Col xs={24} lg={10}>
                    <Title level={5} style={{ marginTop: 8 }}>Sorties de stock par motif</Title>
                    <Table {...tableProps} dataSource={sortiesMotif} locale={{ emptyText: "Aucune sortie sur la période" }} columns={[
                      { title: "Motif", dataIndex: "name", render: (v) => <Text strong>{v}</Text> },
                      { title: "Sorties", dataIndex: "value", align: "right" },
                    ]} />
                    <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                      Réceptions sur la période : <Text strong>{kpi.receptions}</Text> pour <Text strong>{fcfa(kpi.montantReceptions)}</Text>.
                    </Text>
                  </Col>
                </Row>
              ),
            },
            {
              key: "peremptions", label: <span>Péremptions {lotsAlertes.length > 0 && <Tag color="error">{lotsAlertes.length}</Tag>}</span>,
              children: (
                <>
                  <Text type="secondary" style={{ display: "block", margin: "8px 0" }}>
                    Lots reçus (toutes réceptions) classés par date de péremption. La quantité est celle reçue : le stock restant n'est pas suivi par lot.
                  </Text>
                  <Table {...tableProps} pagination={{ pageSize: 15, hideOnSinglePage: true }} dataSource={lots} columns={[
                    { title: "Produit", dataIndex: "produit", render: (v) => <Text strong>{v}</Text> },
                    { title: "Lot", dataIndex: "lot" },
                    { title: "Péremption", dataIndex: "peremption", render: (v) => dayjs(v).format("DD/MM/YYYY") },
                    { title: "Jours restants", dataIndex: "jours", align: "right", render: (v) => (v < 0 ? <Text type="danger">{v}</Text> : v) },
                    { title: "Statut", dataIndex: "statut", render: (v) => <Tag color={STATUT_PEREMPTION[v]}>{v}</Tag> },
                    { title: "Qté reçue", dataIndex: "quantite", align: "right" },
                    { title: "Fournisseur", dataIndex: "fournisseur" },
                  ]} />
                </>
              ),
            },
            {
              key: "qualite", label: <span>Qualité du référentiel {referentielIncomplet.length > 0 && <Tag color="warning">{referentielIncomplet.length}</Tag>}</span>,
              children: (
                <Table {...tableProps} dataSource={qualite} columns={[
                  { title: "Champ des fiches produits", dataIndex: "champ", render: (v) => <Text strong>{v}</Text> },
                  {
                    title: `Taux de remplissage (${donnees.produits.length} produits)`, dataIndex: "taux", width: 340,
                    render: (v) => (
                      <Progress percent={v} size="small" format={(p) => `${p} %`}
                        strokeColor={v < 50 ? token.colorError : v < 80 ? token.colorWarning : token.colorSuccess} />
                    ),
                  },
                ]} />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default StatistiquesPharmacie;

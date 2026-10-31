import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Button, Card, Col, DatePicker, Flex, Progress, Row, Select, Skeleton, Space, Table, Tabs, Tag, Tooltip, Typography, theme,
} from "antd";
import {
  ArrowDownOutlined, ArrowUpOutlined, BarChartOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExperimentOutlined, FieldTimeOutlined, FileDoneOutlined, FileExcelOutlined, FilePdfOutlined, FileSearchOutlined, ReloadOutlined, TeamOutlined, WarningOutlined,
} from "@ant-design/icons";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis,
} from "recharts";
import dayjs from "dayjs";
import { getActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions, LOGO_BROWN } from "../../../constants/app.constants";
import { exportWorkbookToExcel } from "../../../utils/helpers";
import { KpiCard } from "../../common/KpiCard/KpiCard";
import { PERIODES, evolution, inRange, periodePrecedente } from "../StatistiquesMedicales/statsUtils";
import { formatDuree } from "../StatistiquesPharmacie/pharmaStatsUtils";
import {
  affluenceHoraire, affluenceJours, calculerKpisExamens, demandesEnAttente, parCategorie, parPrescripteur, parTechnicien, parTypePatient,
  qualiteDemandes, realiseesSansResultat, repartitionOrigine, serieExamens, topExamens,
} from "./examensStatsUtils";
import RapportExamens from "./RapportExamens";
import { useImpressionPdf } from "../../common/RapportPdf/RapportPdf";
import { getUserConnected } from "../../../utils/profils";
import "./StatistiquesExamens.scss";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COULEURS = ["#31bae8", "#9f5822", "#52c41a", "#722ed1", "#fa8c16", "#eb2f96", "#13c2c2", "#faad14", "#2f54eb", "#a0d911"];

// Paramètres propres à chaque type d'examen
export const TYPES_EXAMEN = {
  analyse: {
    codepresc: codesPrescriptions.ANA,
    titre: "Statistiques du laboratoire",
    surtitre: "Pilotage des analyses biologiques",
    demande: "demande d'analyses", demandes: "Demandes d'analyses", examen: "Analyse", examens: "Analyses",
    technicien: "Technicien", icon: <ExperimentOutlined />, fichier: "Statistiques_laboratoire",
  },
  imagerie: {
    codepresc: codesPrescriptions.IMG,
    titre: "Statistiques de radiologie",
    surtitre: "Pilotage de l'imagerie médicale",
    demande: "demande d'imagerie", demandes: "Demandes d'imagerie", examen: "Examen d'imagerie", examens: "Examens d'imagerie",
    technicien: "Manipulateur", icon: <FileSearchOutlined />, fichier: "Statistiques_radiologie",
  },
};

const Variation = ({ courant, precedent, inverse = false }) => {
  const { token } = theme.useToken();
  const ev = evolution(courant, precedent);
  if (ev === null) return <Text type="secondary">Pas de comparaison possible</Text>;
  const favorable = inverse ? ev <= 0 : ev >= 0;
  return (
    <Text type="secondary">
      <span style={{ color: ev === 0 ? token.colorTextSecondary : favorable ? token.colorSuccess : token.colorError, fontWeight: 600 }}>
        {ev > 0 ? <ArrowUpOutlined /> : ev < 0 ? <ArrowDownOutlined /> : null} {Math.abs(ev)} %
      </span>{" "}
      vs période précédente ({precedent})
    </Text>
  );
};

const EvolutionTag = ({ value }) => {
  if (value === null || value === undefined) return <Tag>Nouveau</Tag>;
  if (value === 0) return <Tag>=</Tag>;
  return <Tag color={value > 0 ? "blue" : "default"} style={{ marginInlineEnd: 0 }}>{value > 0 ? "+" : ""}{value} %</Tag>;
};

const ChartCard = ({ title, icon, extra, children, height = 260 }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Card size="small" title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>} extra={extra} style={{ height: "100%" }}>
      <div style={{ width: "100%", height }}>{children}</div>
    </Card>
  );
};

const ageTag = (jours) => <Tag color={jours > 7 ? "error" : jours >= 1 ? "warning" : "default"}>{jours === 0 ? "aujourd'hui" : `${jours} j`}</Tag>;

function StatistiquesExamens({ type = "analyse" }) {
  const config = TYPES_EXAMEN[type];
  const { token } = theme.useToken();
  const [periode, setPeriode] = useState("mois");
  const [rangePerso, setRangePerso] = useState(null);
  const [origineFiltre, setOrigineFiltre] = useState("ALL");
  const [refetch, setRefetch] = useState(0);
  // Ligne mise en évidence dans les tableaux (clé de la ligne cliquée)
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);

  const range = useMemo(
    () => (periode === "perso" && rangePerso ? [rangePerso[0].startOf("day"), rangePerso[1].endOf("day")] : PERIODES[periode === "perso" ? "mois" : periode].range()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periode, rangePerso, refetch]
  );
  const rangePrecedent = useMemo(() => periodePrecedente(range), [range]);
  const { impression, imprimer } = useImpressionPdf(
    `${config.titre} ${range[0].format("DD-MM-YYYY")} au ${range[1].format("DD-MM-YYYY")}`
  );

  const [donnees, setDonnees] = useState({ demandes: [], catalogue: [] });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const debut = rangePrecedent[0].format("YYYY-MM-DD");
    const fin = range[1].format("YYYY-MM-DD");
    setLoading(true);
    setErreur(null);
    Promise.all([
      // Réalisées : l'API filtre sur la date de clôture -> chargées jusqu'à aujourd'hui, puis filtrées sur la date de prescription
      getActions(endpoints.prescriptions.LIST_BY_DATE(debut, dayjs().format("YYYY-MM-DD"), "Oui")),
      getActions(endpoints.prescriptions.LIST_BY_DATE(debut, fin, "Non")),
      getActions(`${endpoints.actes.LIST}?codeacte=${config.codepresc}`).catch(() => ({ data: [] })),
    ])
      .then(([realisees, enAttente, catalogue]) => {
        const demandes = [...(realisees?.data || []), ...(enAttente?.data || [])]
          .filter((p) => p.codepresc === config.codepresc)
          .filter((p) => inRange(p.datepresc, [rangePrecedent[0], range[1]]));
        setDonnees({
          demandes: Object.values(Object.fromEntries(demandes.map((d) => [d.numpresc, d]))),
          catalogue: catalogue?.data || [],
        });
      })
      .catch(() => setErreur("Impossible de charger les données."))
      .finally(() => setLoading(false));
  }, [range, rangePrecedent, config.codepresc]);

  const filtrer = (r) => donnees.demandes.filter((d) =>
    inRange(d.datepresc, r) &&
    (origineFiltre === "ALL" || (origineFiltre === "Externe" ? d.type_prescription === "Externe" : d.type_prescription !== "Externe"))
  );
  const courant = useMemo(() => filtrer(range), [donnees, range, origineFiltre]); // eslint-disable-line react-hooks/exhaustive-deps
  const precedent = useMemo(() => filtrer(rangePrecedent), [donnees, rangePrecedent, origineFiltre]); // eslint-disable-line react-hooks/exhaustive-deps

  const kpi = useMemo(() => calculerKpisExamens(courant), [courant]);
  const kpiPrec = useMemo(() => calculerKpisExamens(precedent), [precedent]);
  const serie = useMemo(() => serieExamens({ demandes: courant, range }), [courant, range]);
  const horaires = useMemo(() => affluenceHoraire(courant), [courant]);
  const jours = useMemo(() => affluenceJours(courant), [courant]);
  const origine = useMemo(() => repartitionOrigine(courant), [courant]);
  const typesPatient = useMemo(() => parTypePatient({ courant, precedent }), [courant, precedent]);
  const examens = useMemo(() => topExamens({ courant, precedent, catalogue: donnees.catalogue }), [courant, precedent, donnees.catalogue]);
  const categories = useMemo(() => parCategorie(courant, donnees.catalogue), [courant, donnees.catalogue]);
  const prescripteurs = useMemo(() => parPrescripteur(courant), [courant]);
  const techniciens = useMemo(() => parTechnicien(courant), [courant]);
  const enAttente = useMemo(() => demandesEnAttente(courant), [courant]);
  const sansResultat = useMemo(() => realiseesSansResultat(courant), [courant]);
  const qualite = useMemo(() => qualiteDemandes(courant), [courant]);

  const libellePeriode = `du ${range[0].format("DD/MM/YYYY")} au ${range[1].format("DD/MM/YYYY")}`;
  const libellePrecedent = `${rangePrecedent[0].format("DD/MM/YYYY")} – ${rangePrecedent[1].format("DD/MM/YYYY")}`;
  const champsFaibles = qualite.filter((q) => q.taux < 50);

  /* ---------------- Export Excel ---------------- */
  const exporter = () => {
    const ligne = (indicateur, cle, unite = "") => ({
      Indicateur: indicateur, "Période": `${kpi[cle] ?? ""}${unite}`, "Période précédente": `${kpiPrec[cle] ?? ""}${unite}`,
      "Évolution (%)": evolution(kpi[cle], kpiPrec[cle]) ?? "",
    });
    const demandeRows = (rows) => rows.map((r) => ({
      "N° demande": r.numpresc, "Date": dayjs(r.datepresc).format("DD/MM/YYYY HH:mm"),
      "Réalisée le": r.date_effet ? dayjs(r.date_effet).format("DD/MM/YYYY HH:mm") : "", Patient: r.patient,
      Prescripteur: r.prescripteur || "", Origine: r.origine, Examens: r.examens, "Ancienneté (jours)": r.age ?? "",
    }));
    exportWorkbookToExcel([
      {
        name: "Synthèse", synthese: true,
        rows: [
          { Indicateur: "Période", "Période": libellePeriode, "Période précédente": libellePrecedent, "Évolution (%)": "" },
          { Indicateur: "Origine", "Période": origineFiltre === "ALL" ? "Toutes" : origineFiltre, "Période précédente": "", "Évolution (%)": "" },
          ligne("Demandes reçues", "demandes"),
          ligne("Demandes réalisées", "realisees"),
          ligne("Demandes en attente", "enAttente"),
          ligne("Taux de réalisation", "tauxRealisation", " %"),
          { Indicateur: "Délai médian de réalisation", "Période": formatDuree(kpi.delaiMedian), "Période précédente": formatDuree(kpiPrec.delaiMedian), "Évolution (%)": "" },
          { Indicateur: "Délai de réalisation (90 % des demandes)", "Période": formatDuree(kpi.delaiP90), "Période précédente": formatDuree(kpiPrec.delaiP90), "Évolution (%)": "" },
          ligne("Demandes réalisées en plus de 24 h", "tauxRetard", " %"),
          ligne("Résultats déposés", "avecResultat"),
          ligne("Taux de dépôt des résultats", "tauxResultat", " %"),
          ligne("Examens demandés", "examens"),
          ligne("Examens par demande", "examensParDemande"),
          ligne("Part des demandes externes", "tauxExternes", " %"),
          ligne("Patients distincts", "patients"),
          ligne("Demandes en attente depuis plus de 24 h", "attenteAncienne"),
        ],
      },
      { name: "Évolution", rows: serie.data.map((r) => ({ "Période": r.periode, "Reçues": r["Reçues"], "Réalisées": r["Réalisées"] })) },
      { name: config.examens, rows: examens.map((r) => ({ Rang: r.rang, [config.examen]: r.libelle, "Catégorie": r.categorie, Nombre: r.nombre, "Réalisés": r.realises, "Part (%)": r.part, "Période précédente": r.precedent, "Évolution (%)": r.evolution ?? "" })) },
      { name: "Types de patients", rows: typesPatient.map((r) => ({ "Type de patient": r.type, Demandes: r.demandes, "Part (%)": r.part, Examens: r.examens, "Réalisées": r.realisees, "Période précédente": r.precedent, "Évolution (%)": evolution(r.demandes, r.precedent) ?? "" })) },
      { name: "Catégories", rows: categories.map((r) => ({ "Catégorie": r.categorie, Examens: r.nombre, "Part (%)": r.part })) },
      { name: "Prescripteurs", rows: prescripteurs.map((r) => ({ Prescripteur: r.prescripteur, Demandes: r.demandes, "Part (%)": r.part, Examens: r.examens, "Réalisées": r.realisees, "Taux de réalisation (%)": r.tauxRealisation })) },
      { name: `${config.technicien}s`, rows: techniciens.map((r) => ({ [config.technicien]: r.technicien, "Demandes réalisées": r.demandes, Examens: r.examens, "Résultats déposés": r.resultats, "Taux de dépôt (%)": r.tauxResultat, "Délai médian": formatDuree(r.delaiMedian) })) },
      { name: "En attente", rows: demandeRows(enAttente) },
      { name: "Sans résultat", rows: demandeRows(sansResultat) },
      { name: "Affluence", rows: [...horaires.map((h) => ({ "Créneau": h.heure, "Reçues": h["Reçues"], "Réalisées": h["Réalisées"] })), ...jours.map((j) => ({ "Créneau": j.jour, "Reçues": j.Demandes, "Réalisées": "" }))] },
      { name: "Qualité des données", rows: qualite.map((q) => ({ Champ: q.champ, "Taux de remplissage (%)": q.taux })) },
    ], `${config.fichier}_${range[0].format("YYYYMMDD")}_${range[1].format("YYYYMMDD")}`, {
      titre: config.titre,
      sousTitre: `${libellePeriode} · ${origineFiltre === "ALL" ? "toutes origines" : `demandes ${origineFiltre.toLowerCase()}s`}`,
      details: `Comparé à la période précédente (${libellePrecedent})`,
      indicateurs: [
        { label: `${config.demandes} reçues`, valeur: kpi.demandes, pied: `${kpiPrec.demandes} sur la période précédente`, couleur: token.colorPrimary },
        { label: "Taux de réalisation", valeur: `${kpi.tauxRealisation} %`, pied: `${kpi.realisees} réalisées · ${kpi.enAttente} en attente`, couleur: token.colorSuccess },
        { label: "Délai médian de réalisation", valeur: formatDuree(kpi.delaiMedian), pied: `90 % en moins de ${formatDuree(kpi.delaiP90)}`, couleur: "#722ed1" },
        { label: "Résultats déposés", valeur: `${kpi.tauxResultat} %`, pied: `${kpi.avecResultat} / ${kpi.realisees} réalisées`, couleur: kpi.tauxResultat < 50 ? token.colorError : token.colorSuccess },
        { label: `${config.examens} demandés`, valeur: kpi.examens, pied: `${kpi.examensParDemande} par demande`, couleur: "#fa8c16" },
        { label: "Patients distincts", valeur: kpi.patients, pied: `${kpi.tauxExternes} % de demandes externes`, couleur: LOGO_BROWN },
        { label: "En attente depuis plus de 24 h", valeur: kpi.attenteAncienne, pied: `${kpiPrec.attenteAncienne} sur la période précédente`, couleur: token.colorError },
        { label: "Réalisées sans résultat", valeur: kpi.sansResultat, pied: "résultats à déposer", couleur: "#13c2c2" },
      ],
      graphiques: [
        { titre: "Demandes reçues et réalisées", type: "aire", data: serie.data, x: "periode", series: [{ cle: "Reçues", couleur: token.colorPrimary }, { cle: "Réalisées", couleur: token.colorSuccess }] },
        { titre: "Origine des demandes", type: "donut", data: origine, x: "name", series: [{ cle: "value" }], demi: true },
        { titre: `${config.demandes} par type de patient`, type: "donut", data: typesPatient, x: "type", series: [{ cle: "demandes" }], demi: true },
        { titre: "Affluence horaire", type: "barres", data: horaires, x: "heure", series: [{ cle: "Reçues", couleur: token.colorPrimary }, { cle: "Réalisées", couleur: token.colorSuccess }] },
        { titre: "Jours de la semaine", type: "barres", data: jours.map((j) => ({ ...j, jour: j.jour.slice(0, 3) })), x: "jour", series: [{ cle: "Demandes", couleur: "#fa8c16" }], demi: true },
        { titre: "Répartition par catégorie", type: "barresH", data: categories.slice(0, 12), x: "categorie", series: [{ cle: "nombre", couleur: token.colorPrimary }], demi: true },
        { titre: `${config.examens} les plus demandés`, type: "barresH", data: examens.slice(0, 12), x: "libelle", series: [{ cle: "nombre", couleur: LOGO_BROWN }] },
      ],
    });
  };

  const pieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)} %`;
  // Survol bien visible + ligne cliquée conservée en surbrillance (un second clic la désélectionne)
  const tableProps = {
    size: "small",
    className: "compact-table stats-table",
    pagination: false,
    loading,
    style: {
      "--stats-ligne-survol": token.colorPrimaryBgHover,
      "--stats-ligne-selection": token.colorPrimaryBorder,
      "--stats-ligne-liseret": token.colorPrimary,
    },
    rowClassName: (record) => (record.key === ligneSelectionnee ? "stats-ligne-selectionnee" : ""),
    onRow: (record) => ({
      onClick: () => setLigneSelectionnee((actuelle) => (actuelle === record.key ? null : record.key)),
    }),
  };
  const colonnesDemande = [
    { title: "N° demande", dataIndex: "numpresc", render: (v) => <Text strong>{v}</Text> },
    { title: "Date", dataIndex: "datepresc", render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm") },
    { title: "Patient", dataIndex: "patient" },
    { title: "Prescripteur", dataIndex: "prescripteur", render: (v, r) => v || <Text type="secondary">{r.origine === "Externe" ? "Externe" : "-"}</Text> },
    { title: config.examens, dataIndex: "examens", render: (v) => <Text ellipsis={{ tooltip: v }} style={{ maxWidth: 280 }}>{v}</Text> },
  ];

  return (
    <div>
      {impression && (
        <RapportExamens
          config={config} libellePeriode={libellePeriode} libellePrecedent={libellePrecedent} origineFiltre={origineFiltre}
          user={getUserConnected()} kpi={kpi} kpiPrec={kpiPrec} serie={serie} horaires={horaires} jours={jours}
          origine={origine} typesPatient={typesPatient} examens={examens} categories={categories} prescripteurs={prescripteurs}
          techniciens={techniciens} enAttente={enAttente} sansResultat={sansResultat} qualite={qualite}
        />
      )}
      {/* En-tête et filtres */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <div>
            <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: token.colorPrimary }}>
              {config.icon} {config.surtitre}
            </Text>
            <Title level={3} style={{ margin: 0, color: LOGO_BROWN }}>{config.titre}</Title>
            <Text type="secondary">{libellePeriode} · comparé à la période précédente ({libellePrecedent})</Text>
          </div>
          <Space wrap>
            <Select
              value={periode} onChange={setPeriode} style={{ minWidth: 180 }} suffixIcon={<CalendarOutlined />}
              options={[...Object.entries(PERIODES).map(([value, { label }]) => ({ value, label })), { value: "perso", label: "Période personnalisée" }]}
            />
            {periode === "perso" && <RangePicker format="DD/MM/YYYY" value={rangePerso} onChange={setRangePerso} allowClear={false} />}
            <Select
              value={origineFiltre} onChange={setOrigineFiltre} style={{ minWidth: 170 }}
              options={[{ value: "ALL", label: "Toutes origines" }, { value: "Interne", label: "Internes" }, { value: "Externe", label: "Externes" }]}
            />
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
      {!loading && kpi.realisees > 0 && kpi.tauxResultat < 50 && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message={`Seulement ${kpi.tauxResultat} % des demandes réalisées ont un résultat déposé`}
          description={`${kpi.sansResultat} demande(s) réalisée(s) sans résultat dans le dossier patient : voir l'onglet « Réalisées sans résultat ».`}
        />
      )}

      {/* Indicateurs clés */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={config.icon} color={token.colorPrimary} label={`${config.demandes} reçues`} value={kpi.demandes} loading={loading}
            footer={<Variation courant={kpi.demandes} precedent={kpiPrec.demandes} />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<CheckCircleOutlined />} color={token.colorSuccess} label="Taux de réalisation" value={`${kpi.tauxRealisation} %`} loading={loading}
            footer={<Text type="secondary"><Text strong>{kpi.realisees}</Text> réalisées · <Text strong type="warning">{kpi.enAttente}</Text> en attente</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<FieldTimeOutlined />} color="#722ed1" label="Délai médian de réalisation" value={formatDuree(kpi.delaiMedian)} loading={loading}
            footer={<Text type="secondary">90 % en moins de <Text strong>{formatDuree(kpi.delaiP90)}</Text> · <Text strong>{kpi.tauxRetard} %</Text> &gt; 24 h</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<FileDoneOutlined />} color={kpi.tauxResultat < 50 ? token.colorError : token.colorSuccess} label="Résultats déposés" value={`${kpi.tauxResultat} %`} loading={loading}
            footer={<Text type="secondary"><Text strong>{kpi.avecResultat}</Text> / {kpi.realisees} demandes réalisées</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={config.icon} color="#fa8c16" label={`${config.examens} demandés`} value={kpi.examens} loading={loading}
            footer={<Text type="secondary"><Text strong>{kpi.examensParDemande}</Text> par demande · {kpi.examensRealises} réalisés</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<TeamOutlined />} color={LOGO_BROWN} label="Patients distincts" value={kpi.patients} loading={loading}
            footer={<Text type="secondary"><Text strong>{kpi.tauxExternes} %</Text> de demandes externes</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<WarningOutlined />} color={token.colorError} label="En attente depuis plus de 24 h" value={kpi.attenteAncienne} loading={loading}
            footer={<Variation courant={kpi.attenteAncienne} precedent={kpiPrec.attenteAncienne} inverse />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<ClockCircleOutlined />} color="#13c2c2" label="Réalisées sans résultat" value={kpi.sansResultat} loading={loading}
            footer={<Text type="secondary">résultats à déposer dans le dossier patient</Text>} />
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={16}>
          <ChartCard title="Demandes reçues et réalisées" icon={<BarChartOutlined />} extra={<Text type="secondary">par {serie.unite}</Text>}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <AreaChart data={serie.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Reçues" stroke={token.colorPrimary} fill={token.colorPrimary} fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="Réalisées" stroke={token.colorSuccess} fill={token.colorSuccess} fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <ChartCard title="Origine des demandes" icon={<TeamOutlined />}>
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
          <ChartCard title="Répartition par catégorie" icon={config.icon} height={Math.max(220, categories.length * 30)}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={token.colorBorderSecondary} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="categorie" width={210} tick={{ fontSize: 11 }} />
                  <ChartTooltip />
                  <Bar dataKey="nombre" name="Examens" fill={token.colorPrimary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <ChartCard title="Jours de la semaine" icon={<CalendarOutlined />}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <BarChart data={jours} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="jour" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip />
                  <Bar dataKey="Demandes" fill="#fa8c16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} xl={16}>
          <ChartCard title="Affluence horaire : réception et réalisation" icon={<ClockCircleOutlined />}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <BarChart data={horaires} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="heure" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="Reçues" fill={token.colorPrimary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Réalisées" fill={token.colorSuccess} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} xl={8}>
          <ChartCard title={`${config.demandes} par type de patient`} icon={<TeamOutlined />}>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={typesPatient} dataKey="demandes" nameKey="type" innerRadius="50%" outerRadius="80%" label={pieLabel}>
                    {typesPatient.map((t, i) => <Cell key={t.key} fill={COULEURS[i % COULEURS.length]} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
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
              key: "examens", label: `${config.examens} les plus demandés`,
              children: (
                <Table {...tableProps} dataSource={examens} columns={[
                  { title: "#", dataIndex: "rang", width: 50, align: "center" },
                  { title: config.examen, dataIndex: "libelle", render: (v) => <Text strong>{v}</Text> },
                  { title: "Catégorie", dataIndex: "categorie", render: (v) => <Tag>{v}</Tag> },
                  { title: "Nombre", dataIndex: "nombre", align: "right" },
                  { title: "Réalisés", dataIndex: "realises", align: "right" },
                  { title: "Part", dataIndex: "part", width: 160, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                  { title: "Période préc.", dataIndex: "precedent", align: "right" },
                  { title: "Évolution", dataIndex: "evolution", align: "center", render: (v) => <EvolutionTag value={v} /> },
                ]} />
              ),
            },
            {
              key: "prescripteurs", label: "Par prescripteur",
              children: (
                <Table {...tableProps} dataSource={prescripteurs} columns={[
                  { title: "Prescripteur", dataIndex: "prescripteur", render: (v) => <Text strong>{v}</Text> },
                  { title: "Demandes", dataIndex: "demandes", align: "right" },
                  { title: "Part", dataIndex: "part", width: 160, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                  { title: config.examens, dataIndex: "examens", align: "right" },
                  { title: "Taux de réalisation", dataIndex: "tauxRealisation", width: 180, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                ]} />
              ),
            },
            {
              key: "techniciens", label: `Par ${config.technicien.toLowerCase()}`,
              children: (
                <Table {...tableProps} dataSource={techniciens} columns={[
                  { title: config.technicien, dataIndex: "technicien", render: (v) => <Text strong>{v}</Text> },
                  { title: "Demandes réalisées", dataIndex: "demandes", align: "right" },
                  { title: config.examens, dataIndex: "examens", align: "right" },
                  { title: "Résultats déposés", dataIndex: "tauxResultat", width: 200, render: (v, r) => <Progress percent={v} size="small" format={() => `${r.resultats} (${v} %)`} /> },
                  { title: "Délai médian", dataIndex: "delaiMedian", align: "right", render: (v) => formatDuree(v) },
                ]} />
              ),
            },
            {
              key: "attente", label: <span>En attente <Tag color="warning">{kpi.enAttente}</Tag></span>,
              children: (
                <Table {...tableProps} dataSource={enAttente} columns={[
                  ...colonnesDemande,
                  { title: "Ancienneté", dataIndex: "age", align: "right", render: (v) => ageTag(v) },
                ]} />
              ),
            },
            {
              key: "sansresultat", label: <span>Réalisées sans résultat {kpi.sansResultat > 0 && <Tag color="error">{kpi.sansResultat}</Tag>}</span>,
              children: (
                <Table {...tableProps} dataSource={sansResultat} columns={[
                  ...colonnesDemande,
                  { title: "Réalisée le", dataIndex: "date_effet", render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-") },
                ]} />
              ),
            },
            {
              key: "qualite", label: <span>Qualité des données {champsFaibles.length > 0 && <Tag color="warning">{champsFaibles.length}</Tag>}</span>,
              children: (
                <Table {...tableProps} dataSource={qualite} columns={[
                  { title: "Information", dataIndex: "champ", render: (v) => <Text strong>{v}</Text> },
                  {
                    title: "Taux de remplissage", dataIndex: "taux", width: 340,
                    render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} strokeColor={v < 50 ? token.colorError : v < 80 ? token.colorWarning : token.colorSuccess} />,
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

export default StatistiquesExamens;

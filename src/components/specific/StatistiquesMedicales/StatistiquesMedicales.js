import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Button, Card, Col, DatePicker, Empty, Flex, Progress, Row, Select, Skeleton, Space, Table, Tabs, Tag, Tooltip, Typography, theme,
} from "antd";
import {
  AlertOutlined, ArrowDownOutlined, SafetyOutlined, ArrowUpOutlined, BarChartOutlined, CalendarOutlined, CheckCircleOutlined,
  CoffeeOutlined, FileExcelOutlined, FireOutlined, HeartOutlined, LineChartOutlined, ReloadOutlined, SolutionOutlined, TeamOutlined,
} from "@ant-design/icons";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis,
} from "recharts";
import dayjs from "dayjs";
import { getActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions, LOGO_BROWN } from "../../../constants/app.constants";
import useFetch from "../../../utils/hooks/useFetch";
import { exportWorkbookToExcel } from "../../../utils/helpers";
import { KpiCard } from "../../common/KpiCard/KpiCard";
import {
  PERIODES, activiteParMedecin, calculerKpis, classement, evolution, inRange, normaliserTexte, periodePrecedente,
  qualiteDonnees, repartitionAge, repartitionHeures, repartitionJours, repartitionSexe, repartitionType, serieEvolution, statistiquesAT, topActes,
} from "./statsUtils";
import BodyMap, { ZONES_LESIONS } from "../../common/BodyMap/BodyMap";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COULEURS = ["#31bae8", "#fa8c16", "#52c41a", "#722ed1", "#eb2f96", "#9f5822", "#13c2c2", "#faad14", "#2f54eb", "#a0d911"];

const SERVICES = [
  { value: "ALL", label: "Tous les services" },
  { value: "MED", label: "Médical" },
  { value: "INF", label: "Infirmerie" },
  { value: "BIO", label: "Analyses bio-médicales" },
  { value: "RAD", label: "Radiologie" },
  { value: "DEN", label: "Dentaire" },
  { value: "GYN", label: "Gynécologie" },
  { value: "HOS", label: "Hospitalisation" },
];

// Variation par rapport à la période précédente ; "inverse" : une hausse est défavorable (fièvres, HTA...)
const Variation = ({ courant, precedent, inverse = false, suffixe = "" }) => {
  const { token } = theme.useToken();
  const ev = evolution(courant, precedent);
  if (ev === null) return <Text type="secondary">Pas de comparaison possible</Text>;
  const favorable = inverse ? ev <= 0 : ev >= 0;
  return (
    <Text type="secondary">
      <span style={{ color: ev === 0 ? token.colorTextSecondary : favorable ? token.colorSuccess : token.colorError, fontWeight: 600 }}>
        {ev > 0 ? <ArrowUpOutlined /> : ev < 0 ? <ArrowDownOutlined /> : null} {Math.abs(ev)} %
      </span>{" "}
      vs période précédente ({precedent}{suffixe})
    </Text>
  );
};

const EvolutionTag = ({ value, inverse = false }) => {
  if (value === null || value === undefined) return <Tag>Nouveau</Tag>;
  if (value === 0) return <Tag>=</Tag>;
  const hausse = value > 0;
  return (
    <Tag color={(inverse ? !hausse : hausse) ? "green" : "red"} style={{ marginInlineEnd: 0 }}>
      {hausse ? "+" : ""}{value} %
    </Tag>
  );
};

const ChartCard = ({ title, icon, extra, children, height = 280 }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Card
      size="small"
      title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>}
      extra={extra}
      style={{ height: "100%" }}
    >
      <div style={{ width: "100%", height }}>{children}</div>
    </Card>
  );
};

// Colonnes communes des classements (rang, libellé, nombre, part, évolution)
const colonnesClassement = (titre, { inverse = false } = {}) => [
  { title: "#", dataIndex: "rang", key: "rang", width: 50, align: "center" },
  { title: titre, dataIndex: "libelle", key: "libelle", render: (v) => <Text strong>{v}</Text> },
  { title: "Nombre", dataIndex: "nombre", key: "nombre", align: "right", sorter: (a, b) => a.nombre - b.nombre },
  {
    title: "Part", dataIndex: "part", key: "part", width: 180,
    render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} />,
  },
  { title: "Période préc.", dataIndex: "precedent", key: "precedent", align: "right" },
  { title: "Évolution", dataIndex: "evolution", key: "evolution", align: "center", render: (v) => <EvolutionTag value={v} inverse={inverse} /> },
];

function StatistiquesMedicales() {
  const { token } = theme.useToken();
  const [periode, setPeriode] = useState("mois");
  const [rangePerso, setRangePerso] = useState(null);
  const [service, setService] = useState("MED");
  const [medecins, setMedecins] = useState([]);
  const [refetch, setRefetch] = useState(0);

  const range = useMemo(
    () => (periode === "perso" && rangePerso ? [rangePerso[0].startOf("day"), rangePerso[1].endOf("day")] : PERIODES[periode === "perso" ? "mois" : periode].range()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periode, rangePerso, refetch]
  );
  const rangePrecedent = useMemo(() => periodePrecedente(range), [range]);

  // Données brutes : période courante + période précédente (pour les comparaisons)
  const [donnees, setDonnees] = useState({ consultations: [], rendezVous: [], prescriptions: [], accidents: [] });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const debut = rangePrecedent[0].format("YYYY-MM-DD");
    const fin = range[1].format("YYYY-MM-DD");
    // Prescriptions par dates : l'API filtre les clôturées ("Oui") sur leur date d'effet et celles en attente
    // ("Non") sur leur date de prescription. Les clôturées sont donc chargées jusqu'à aujourd'hui, pour inclure
    // celles prescrites dans la période mais servies après ; le filtre final se fait sur la date de prescription.
    const aujourdhui = dayjs().format("YYYY-MM-DD");
    setLoading(true);
    setErreur(null);
    Promise.all([
      getActions(endpoints.consultations.LIST_BY_DATE(debut, fin)),
      getActions(endpoints.rendezVous.LIST_BY_DATE(debut, fin)),
      // Accidents du travail : la liste complète est filtrée par date côté client
      getActions(endpoints.AT.LIST).catch(() => ({ data: [] })),
      getActions(endpoints.prescriptions.LIST_BY_DATE(debut, aujourdhui, "Oui")),
      getActions(endpoints.prescriptions.LIST_BY_DATE(debut, fin, "Non")),
    ])
      .then(([cons, rv, at, ...prescriptions]) => {
        const toutes = prescriptions.flatMap((r) => r?.data || []);
        const uniques = Object.values(Object.fromEntries(toutes.map((p) => [p.numpresc, p])));
        setDonnees({
          consultations: cons?.data || [],
          rendezVous: rv?.data || [],
          prescriptions: uniques.filter((p) => inRange(p.datepresc, [rangePrecedent[0], range[1]])),
          accidents: (at?.data || []).filter((a) => inRange(a.date_at, [rangePrecedent[0], range[1]])),
        });
      })
      .catch(() => setErreur("Impossible de charger les données statistiques."))
      .finally(() => setLoading(false));
  }, [range, rangePrecedent]);

  // Référentiels pour les libellés
  const { data: pathologies } = useFetch(endpoints.pathologie.LIST);
  const { data: regions } = useFetch(endpoints.regions.LIST);
  const { data: motifs } = useFetch(endpoints.motifs.LIST);
  const libellePatho = (code) => (pathologies || []).find((p) => p.code_patho === code)?.libelle_patho || code;
  const libelleRegion = (code) => (regions || []).find((r) => r.code_region === code)?.libelle_region || code;
  const libelleMotif = (code) => (motifs || []).find((m) => m.code_motifcons === code)?.libelle_motifcons || code;

  // Filtres service / médecin, puis découpage période courante / précédente
  const filtres = useMemo(() => {
    const rvService = donnees.rendezVous.filter((rv) => service === "ALL" || rv.code_serv === service);
    const rvDuService = new Set(rvService.map((rv) => rv.num_ordre));
    let consultations = donnees.consultations.filter((c) => service === "ALL" || rvDuService.has(c.numrv));
    let rendezVous = rvService;
    if (medecins.length) {
      consultations = consultations.filter((c) => medecins.includes(c.medecin));
      rendezVous = rendezVous.filter((rv) => medecins.includes(rv.medecin_traitant));
    }
    const consFiltrees = new Set(consultations.map((c) => c.numcons));
    const prescriptions = service === "ALL" && !medecins.length
      ? donnees.prescriptions
      : donnees.prescriptions.filter((p) => consFiltrees.has(p.numcons));
    const decouper = (r) => ({
      consultations: consultations.filter((c) => inRange(c.datecons, r)),
      rendezVous: rendezVous.filter((rv) => inRange(rv.date_rv, r)),
      prescriptions: prescriptions.filter((p) => inRange(p.datepresc, r)),
      // Les AT ne sont rattachés ni à un service médical ni à un médecin : seul le filtre de période s'applique
      accidents: donnees.accidents.filter((a) => inRange(a.date_at, r)),
    });
    return { courant: decouper(range), precedent: decouper(rangePrecedent) };
  }, [donnees, service, medecins, range, rangePrecedent]);

  const { courant, precedent } = filtres;
  const kpi = useMemo(() => calculerKpis(courant), [courant]);
  const kpiPrec = useMemo(() => calculerKpis(precedent), [precedent]);

  const listeMedecins = useMemo(
    () => [...new Set(donnees.consultations.map((c) => c.medecin).filter(Boolean))].sort().map((m) => ({ value: m, label: m })),
    [donnees.consultations]
  );

  // Séries et tableaux
  const evolutionSerie = useMemo(() => serieEvolution({ ...courant, range }), [courant, range]);
  const sexe = useMemo(() => repartitionSexe(courant.consultations), [courant]);
  const ages = useMemo(() => repartitionAge(courant.consultations), [courant]);
  const types = useMemo(() => repartitionType(courant.consultations), [courant]);
  const heures = useMemo(() => repartitionHeures(courant.consultations), [courant]);
  const joursSemaine = useMemo(() => repartitionJours(courant.consultations), [courant]);

  const diagnostics = useMemo(() => classement({
    courant: courant.consultations, precedent: precedent.consultations,
    keyFn: (c) => normaliserTexte(c.diagnostic) || null,
  }), [courant, precedent]);
  const parPathologie = useMemo(() => classement({
    courant: courant.consultations, precedent: precedent.consultations, keyFn: (c) => c.code_patho, labelFn: libellePatho,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [courant, precedent, pathologies]);
  const parMotif = useMemo(() => classement({
    courant: courant.consultations, precedent: precedent.consultations, keyFn: (c) => c.code_motifcons, labelFn: libelleMotif,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [courant, precedent, motifs]);
  const parRegion = useMemo(() => classement({
    courant: courant.consultations, precedent: precedent.consultations, keyFn: (c) => c.code_region, labelFn: libelleRegion,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [courant, precedent, regions]);
  const parMedecin = useMemo(() => activiteParMedecin(courant), [courant]);
  const medicaments = useMemo(() => topActes(courant.prescriptions, codesPrescriptions.ORD), [courant]);
  const analyses = useMemo(() => topActes(courant.prescriptions, codesPrescriptions.ANA), [courant]);
  const imageries = useMemo(() => topActes(courant.prescriptions, codesPrescriptions.IMG), [courant]);
  const qualite = useMemo(() => qualiteDonnees(courant.consultations), [courant]);
  const at = useMemo(() => statistiquesAT(courant.accidents), [courant]);
  const atPrec = useMemo(() => statistiquesAT(precedent.accidents), [precedent]);

  const libellePeriode = `du ${range[0].format("DD/MM/YYYY")} au ${range[1].format("DD/MM/YYYY")}`;
  const libellePrecedent = `${rangePrecedent[0].format("DD/MM/YYYY")} – ${rangePrecedent[1].format("DD/MM/YYYY")}`;
  const libelleService = SERVICES.find((s) => s.value === service)?.label;

  /* ---------------- Export Excel ---------------- */
  const exporter = () => {
    const ligneKpi = (indicateur, cle, unite = "") => ({
      Indicateur: indicateur, "Période": `${kpi[cle]}${unite}`, "Période précédente": `${kpiPrec[cle]}${unite}`,
      "Évolution (%)": evolution(kpi[cle], kpiPrec[cle]) ?? "",
    });
    const classementRows = (rows, titre) => rows.map((r) => ({
      Rang: r.rang, [titre]: r.libelle, Nombre: r.nombre, "Part (%)": r.part, "Période précédente": r.precedent, "Évolution (%)": r.evolution ?? "",
    }));
    const actesRows = (rows, titre) => rows.map((r) => ({ Rang: r.rang, [titre]: r.libelle, Prescriptions: r.prescriptions, "Quantité": r.quantite }));
    exportWorkbookToExcel([
      {
        name: "Synthèse",
        rows: [
          { Indicateur: "Période", "Période": libellePeriode, "Période précédente": libellePrecedent, "Évolution (%)": "" },
          { Indicateur: "Service", "Période": libelleService, "Période précédente": "", "Évolution (%)": "" },
          { Indicateur: "Médecins", "Période": medecins.length ? medecins.join(", ") : "Tous", "Période précédente": "", "Évolution (%)": "" },
          ligneKpi("Consultations", "consultations"),
          ligneKpi("Patients vus", "patients"),
          ligneKpi("Consultations d'enfants de 5 ans ou moins", "enfants5"),
          ligneKpi("Part des enfants de 5 ans ou moins", "tauxEnfants5", " %"),
          ligneKpi("Consultations par patient", "consultationsParPatient"),
          ligneKpi("Consultations par jour d'activité", "moyenneParJour"),
          ligneKpi("Taux de validation", "tauxValidation", " %"),
          ligneKpi("Rendez-vous", "rendezVous"),
          ligneKpi("Taux d'honoration des rendez-vous", "tauxHonoration", " %"),
          ligneKpi("Repos médicaux prescrits", "repos"),
          ligneKpi("Jours de repos médical", "joursRepos"),
          ligneKpi("Durée moyenne de repos (jours)", "dureeMoyenneRepos"),
          ligneKpi("Tensions élevées (≥ 140/90)", "hta"),
          ligneKpi("Taux de tension élevée", "tauxHta", " %"),
          ligneKpi("Fièvres (> 37,5 °C)", "fievres"),
          ligneKpi("TDR positifs", "tdrPositifs"),
          ligneKpi("Consultations avec prescription", "tauxPrescription", " %"),
          ligneKpi("Ordonnances", "ordonnances"),
          ligneKpi("Analyses", "analyses"),
          ligneKpi("Imageries", "imageries"),
        ],
      },
      { name: "Évolution", rows: evolutionSerie.data.map((r) => ({ "Période": r.periode, Consultations: r.Consultations, "Rendez-vous": r["Rendez-vous"] })) },
      { name: "Diagnostics", rows: classementRows(diagnostics, "Diagnostic") },
      { name: "Pathologies", rows: classementRows(parPathologie, "Pathologie") },
      { name: "Motifs", rows: classementRows(parMotif, "Motif") },
      { name: "Régions", rows: classementRows(parRegion, "Région concernée") },
      {
        name: "Médecins",
        rows: parMedecin.map((m) => ({
          "Médecin": m.medecin, Consultations: m.consultations, "Part (%)": m.part, Patients: m.patients, Ordonnances: m.ordonnances,
          Analyses: m.analyses, Imageries: m.imageries, "Repos prescrits": m.repos, "Jours de repos": m.joursRepos, "Fièvres": m.fievres,
        })),
      },
      { name: "Médicaments", rows: actesRows(medicaments, "Médicament") },
      { name: "Analyses", rows: actesRows(analyses, "Analyse") },
      { name: "Imageries", rows: actesRows(imageries, "Imagerie") },
      {
        name: "Démographie",
        rows: [
          ...sexe.map((s) => ({ Dimension: "Sexe", Valeur: s.name, Consultations: s.value })),
          ...ages.map((a) => ({ Dimension: "Âge", Valeur: a.tranche, Consultations: a.Patients })),
          ...types.map((t) => ({ Dimension: "Type de patient", Valeur: t.name, Consultations: t.value })),
        ],
      },
      { name: "Affluence", rows: [...heures.map((h) => ({ "Créneau": h.heure, Consultations: h.Consultations })), ...joursSemaine.map((j) => ({ "Créneau": j.jour, Consultations: j.Consultations }))] },
      { name: "Qualité des données", rows: qualite.map((q) => ({ Champ: q.champ, "Taux de remplissage (%)": q.taux })) },
      {
        name: "Accidents du travail",
        rows: [
          { Indicateur: "Accidents du travail", "Période": at.total, "Période précédente": atPrec.total, "Évolution (%)": evolution(at.total, atPrec.total) ?? "" },
          { Indicateur: "Accidents avec arrêt (ITT)", "Période": at.avecArret, "Période précédente": atPrec.avecArret, "Évolution (%)": evolution(at.avecArret, atPrec.avecArret) ?? "" },
          { Indicateur: "Jours d'ITT", "Période": at.joursItt, "Période précédente": atPrec.joursItt, "Évolution (%)": evolution(at.joursItt, atPrec.joursItt) ?? "" },
          { Indicateur: "ITT moyenne (jours)", "Période": at.ittMoyen, "Période précédente": atPrec.ittMoyen, "Évolution (%)": "" },
          ...at.parLieu.map((l) => ({ Indicateur: `Lieu : ${l.name}`, "Période": l.value, "Période précédente": "", "Évolution (%)": "" })),
          ...at.parZone.map((z) => ({ Indicateur: `Zone : ${ZONES_LESIONS[z.zone] || z.zone}`, "Période": z.value, "Période précédente": "", "Évolution (%)": "" })),
          ...at.parTypeLesion.map((t) => ({ Indicateur: `Type de lésion : ${t.name}`, "Période": t.value, "Période précédente": "", "Évolution (%)": "" })),
        ],
      },
      {
        name: "Détail AT",
        rows: courant.accidents.map((a) => ({
          "N° AT": a.num_at, Date: a.date_at ? dayjs(a.date_at).format("DD/MM/YYYY HH:mm") : "", Matricule: a.matricule,
          Victime: `${a.prenoms || ""} ${a.nom || ""}`.trim(), Service: a.service, Emploi: a.emploi, Lieu: a.lieu_at,
          "Lésions": a.nature_lesions, "ITT (jours)": a.itt, "Certificat médical": a.certicat_medical,
        })),
      },
      {
        name: "Détail consultations",
        rows: courant.consultations.map((c) => ({
          "N° consultation": c.numcons, Date: dayjs(c.datecons).format("DD/MM/YYYY HH:mm"), "N° patient": c.numpat,
          Patient: `${c.prenom_patient || ""} ${c.nom_patient || ""}`.trim(), Sexe: c.sexe_patient, "Âge": c.age_patient, Type: c.type_patient,
          "Médecin": c.medecin, Motif: libelleMotif(c.code_motifcons) || "", Pathologie: libellePatho(c.code_patho) || "", Diagnostic: c.diagnostic,
          Tension: c.tension, "Température": c.temp, "Repos (jours)": c.nb_jours_rm,
        })),
      },
    ], `Statistiques_medicales_${range[0].format("YYYYMMDD")}_${range[1].format("YYYYMMDD")}`);
  };

  const pieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)} %`;
  const pasDeDonnees = !loading && courant.consultations.length === 0;
  const champsFaibles = qualite.filter((q) => q.taux < 50);

  return (
    <div>
      {/* En-tête et filtres */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <div>
            <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: token.colorPrimary }}>
              <BarChartOutlined /> Pilotage de l'activité médicale
            </Text>
            <Title level={3} style={{ margin: 0, color: LOGO_BROWN }}>Statistiques médicales</Title>
            <Text type="secondary">
              {libelleService} · {libellePeriode} · comparé à la période précédente ({libellePrecedent})
            </Text>
          </div>
          <Space wrap>
            <Tooltip title="Actualiser">
              <Button icon={<ReloadOutlined />} onClick={() => setRefetch(Date.now())} />
            </Tooltip>
            <Button
              icon={<FileExcelOutlined />}
              onClick={exporter}
              disabled={loading || pasDeDonnees}
              style={{ color: "#1d6f42", borderColor: "#1d6f42" }}
            >
              Export Excel
            </Button>
          </Space>
        </Flex>

        <Flex wrap gap={12} style={{ marginTop: 16 }}>
          <Select
            value={periode}
            onChange={setPeriode}
            style={{ minWidth: 180 }}
            options={[
              ...Object.entries(PERIODES).map(([value, { label }]) => ({ value, label })),
              { value: "perso", label: "Période personnalisée" },
            ]}
            suffixIcon={<CalendarOutlined />}
          />
          {periode === "perso" && (
            <RangePicker format="DD/MM/YYYY" value={rangePerso} onChange={setRangePerso} allowClear={false} />
          )}
          <Select value={service} onChange={setService} style={{ minWidth: 200 }} options={SERVICES} />
          <Select
            mode="multiple"
            allowClear
            placeholder="Tous les médecins"
            value={medecins}
            onChange={setMedecins}
            options={listeMedecins}
            style={{ minWidth: 260 }}
            maxTagCount="responsive"
          />
        </Flex>
      </Card>

      {erreur && <Alert type="error" showIcon message={erreur} style={{ marginBottom: 16 }} />}

      {/* Indicateurs clés */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<SolutionOutlined />} color={token.colorPrimary} label="Consultations" value={kpi.consultations}
            loading={loading} footer={<Variation courant={kpi.consultations} precedent={kpiPrec.consultations} />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<TeamOutlined />} color="#722ed1" label="Patients vus" value={kpi.patients}
            loading={loading} footer={<Text type="secondary"><Text strong>{kpi.consultationsParPatient}</Text> consultation(s) par patient · <Text strong>{kpi.moyenneParJour}</Text> / jour</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<CalendarOutlined />} color={token.colorSuccess} label="Rendez-vous honorés" value={`${kpi.tauxHonoration} %`}
            loading={loading} footer={<Text type="secondary"><Text strong>{kpi.rendezVous}</Text> rendez-vous · <Text strong type="danger">{kpi.rvNonHonores}</Text> non honorés</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<CheckCircleOutlined />} color={token.colorSuccess} label="Consultations validées" value={`${kpi.tauxValidation} %`}
            loading={loading} footer={<Text type="secondary"><Text strong>{kpi.tauxPrescription} %</Text> avec au moins une prescription</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<CoffeeOutlined />} color="#13c2c2" label="Jours de repos médical" value={kpi.joursRepos}
            loading={loading} footer={<Variation courant={kpi.joursRepos} precedent={kpiPrec.joursRepos} inverse suffixe=" j" />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<HeartOutlined />} color={token.colorError} label="Tensions élevées (≥ 140/90)" value={kpi.hta}
            loading={loading} footer={<Text type="secondary"><Text strong>{kpi.tauxHta} %</Text> des {kpi.tensionsMesurees} tensions mesurées</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<FireOutlined />} color="#fa541c" label="Fièvres (> 37,5 °C)" value={kpi.fievres}
            loading={loading} footer={<Text type="secondary"><Text strong>{kpi.tauxFievre} %</Text> des consultations · {kpi.tdrPositifs} TDR positif(s) / {kpi.tdrRealises}</Text>} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard icon={<AlertOutlined />} color={LOGO_BROWN} label="Prescriptions" value={kpi.prescriptions}
            loading={loading} footer={<Text type="secondary">{kpi.ordonnances} ordonnances · {kpi.analyses} analyses · {kpi.imageries} imageries</Text>} />
        </Col>
      </Row>

      {pasDeDonnees ? (
        <Card><Empty description="Aucune consultation sur cette période avec ces filtres" /></Card>
      ) : (
        <>
          {/* Graphiques */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} xl={16}>
              <ChartCard title="Évolution de l'activité" icon={<LineChartOutlined />}
                extra={<Text type="secondary">par {evolutionSerie.unite}</Text>}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <AreaChart data={evolutionSerie.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                      <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Rendez-vous" stroke={token.colorPrimary} fill={token.colorPrimary} fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="Consultations" stroke="#fa8c16" fill="#fa8c16" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <ChartCard title="Répartition par sexe" icon={<TeamOutlined />}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sexe} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" label={pieLabel}>
                        {sexe.map((entry) => (
                          <Cell key={entry.name} fill={entry.name === "Femmes" ? "#eb2f96" : entry.name === "Hommes" ? token.colorPrimary : "#d9d9d9"} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <ChartCard title="Tranches d'âge" icon={<BarChartOutlined />}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <BarChart data={ages} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                      <XAxis dataKey="tranche" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Bar dataKey="Patients" fill="#722ed1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <ChartCard title="Type de patient" icon={<TeamOutlined />}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={types} dataKey="value" nameKey="name" outerRadius="80%" label={pieLabel}>
                        {types.map((entry, index) => <Cell key={entry.name} fill={COULEURS[index % COULEURS.length]} />)}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <ChartCard title="Heures d'affluence" icon={<BarChartOutlined />}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <BarChart data={heures} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                      <XAxis dataKey="heure" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Bar dataKey="Consultations" fill="#fa8c16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
            <Col xs={24} xl={16}>
              <ChartCard title="Diagnostics les plus fréquents" icon={<BarChartOutlined />} height={300}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <BarChart data={diagnostics.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={token.colorBorderSecondary} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="libelle" width={170} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Bar dataKey="nombre" name="Consultations" fill={token.colorPrimary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <ChartCard title="Jours de la semaine" icon={<CalendarOutlined />} height={300}>
                {loading ? <Skeleton active /> : (
                  <ResponsiveContainer>
                    <BarChart data={joursSemaine} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                      <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <ChartTooltip />
                      <Bar dataKey="Consultations" fill={token.colorSuccess} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Col>
          </Row>

          {/* Accidents du travail */}
          <Card
            size="small"
            title={<Space style={{ color: token.colorPrimary }}><SafetyOutlined /><span>Accidents du travail</span></Space>}
            extra={<Text type="secondary">tous services · filtre de période uniquement</Text>}
            style={{ marginBottom: 16 }}
          >
            {loading ? <Skeleton active /> : at.total === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun accident du travail sur cette période" />
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <KpiCard icon={<SafetyOutlined />} color="#fa541c" label="Accidents du travail" value={at.total}
                      footer={<Variation courant={at.total} precedent={atPrec.total} inverse />} />
                    <KpiCard icon={<CoffeeOutlined />} color="#13c2c2" label="Jours d'ITT" value={at.joursItt}
                      footer={<Text type="secondary"><Text strong>{at.avecArret}</Text> avec arrêt ({at.tauxArret} %) · ITT moyenne <Text strong>{at.ittMoyen} j</Text></Text>} />
                  </Space>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Text strong>Lieu de l'accident</Text>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={at.parLieu} dataKey="value" nameKey="name" outerRadius="75%" label={pieLabel}>
                          {at.parLieu.map((entry, index) => <Cell key={entry.name} fill={COULEURS[index % COULEURS.length]} />)}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Text strong>Jour de la semaine</Text>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={at.parJour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                        <XAxis dataKey="jour" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <ChartTooltip />
                        <Bar dataKey="Accidents" fill="#fa541c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
                <Col xs={24} lg={14}>
                  <Text strong>Zones du corps touchées</Text>
                  <div style={{ marginTop: 8 }}>
                    {at.zonesCroquis.length === 0 ? (
                      <Text type="secondary">Aucune zone marquée sur le croquis des accidents de cette période.</Text>
                    ) : (
                      <BodyMap value={at.zonesCroquis} readOnly size={120} />
                    )}
                  </div>
                </Col>
                <Col xs={24} lg={10}>
                  <Table
                    size="small" className="compact-table" pagination={false}
                    dataSource={at.parZone}
                    locale={{ emptyText: "Aucune zone renseignée" }}
                    columns={[
                      { title: "Zone", dataIndex: "zone", key: "zone", render: (v) => <Text strong>{ZONES_LESIONS[v] || v}</Text> },
                      { title: "Accidents", dataIndex: "value", key: "value", align: "right" },
                      { title: "Part", dataIndex: "part", key: "part", width: 140, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                    ]}
                  />
                  {at.avecCroquis < at.total && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {at.total - at.avecCroquis} accident(s) sans zone marquée sur le croquis.
                    </Text>
                  )}
                </Col>
              </Row>
            )}
          </Card>

          {/* Tableaux détaillés */}
          <Card size="small" styles={{ body: { paddingTop: 0 } }}>
            <Tabs
              items={[
                {
                  key: "diagnostics", label: `Diagnostics (${diagnostics.length})`,
                  children: <Table size="small" className="compact-table" pagination={false} dataSource={diagnostics} columns={colonnesClassement("Diagnostic", { inverse: true })} loading={loading} />,
                },
                {
                  key: "pathologies", label: "Pathologies",
                  children: <Table size="small" className="compact-table" pagination={false} dataSource={parPathologie} columns={colonnesClassement("Pathologie", { inverse: true })} loading={loading} />,
                },
                {
                  key: "motifs", label: "Motifs",
                  children: <Table size="small" className="compact-table" pagination={false} dataSource={parMotif} columns={colonnesClassement("Motif")} loading={loading} />,
                },
                {
                  key: "regions", label: "Régions concernées",
                  children: <Table size="small" className="compact-table" pagination={false} dataSource={parRegion} columns={colonnesClassement("Région", { inverse: true })} loading={loading} />,
                },
                {
                  key: "medecins", label: `Activité par médecin (${parMedecin.length})`,
                  children: (
                    <Table
                      size="small" className="compact-table" pagination={false} dataSource={parMedecin} loading={loading} scroll={{ x: "max-content" }}
                      columns={[
                        { title: "Médecin", dataIndex: "medecin", key: "medecin", render: (v) => <Text strong>{v}</Text> },
                        { title: "Consultations", dataIndex: "consultations", key: "consultations", align: "right", sorter: (a, b) => a.consultations - b.consultations, defaultSortOrder: "descend" },
                        { title: "Part", dataIndex: "part", key: "part", width: 160, render: (v) => <Progress percent={v} size="small" format={(p) => `${p} %`} /> },
                        { title: "Patients", dataIndex: "patients", key: "patients", align: "right", sorter: (a, b) => a.patients - b.patients },
                        { title: "Ordonnances", dataIndex: "ordonnances", key: "ordonnances", align: "right", sorter: (a, b) => a.ordonnances - b.ordonnances },
                        { title: "Analyses", dataIndex: "analyses", key: "analyses", align: "right", sorter: (a, b) => a.analyses - b.analyses },
                        { title: "Imageries", dataIndex: "imageries", key: "imageries", align: "right", sorter: (a, b) => a.imageries - b.imageries },
                        { title: "Repos prescrits", key: "repos", align: "right", sorter: (a, b) => a.joursRepos - b.joursRepos, render: (r) => `${r.repos} (${r.joursRepos} j)` },
                        { title: "Fièvres", dataIndex: "fievres", key: "fievres", align: "right" },
                      ]}
                    />
                  ),
                },
                ...[
                  { key: "medicaments", label: "Médicaments", rows: medicaments, titre: "Médicament" },
                  { key: "analyses", label: "Analyses prescrites", rows: analyses, titre: "Analyse" },
                  { key: "imageries", label: "Imageries prescrites", rows: imageries, titre: "Imagerie" },
                ].map(({ key, label, rows, titre }) => ({
                  key, label,
                  children: (
                    <Table
                      size="small" className="compact-table" pagination={false} dataSource={rows} loading={loading}
                      columns={[
                        { title: "#", dataIndex: "rang", key: "rang", width: 50, align: "center" },
                        { title: titre, dataIndex: "libelle", key: "libelle", render: (v) => <Text strong>{v}</Text> },
                        { title: "Prescriptions", dataIndex: "prescriptions", key: "prescriptions", align: "right" },
                        { title: "Quantité prescrite", dataIndex: "quantite", key: "quantite", align: "right" },
                      ]}
                    />
                  ),
                })),
                {
                  key: "accidents", label: `Accidents du travail (${courant.accidents.length})`,
                  children: (
                    <Table
                      size="small" className="compact-table" pagination={{ pageSize: 20, hideOnSinglePage: true }} loading={loading}
                      dataSource={courant.accidents} rowKey="num_at" scroll={{ x: "max-content" }}
                      locale={{ emptyText: "Aucun accident du travail sur cette période" }}
                      columns={[
                        { title: "N° AT", dataIndex: "num_at", key: "num_at" },
                        { title: "Date", dataIndex: "date_at", key: "date_at", render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-"), sorter: (a, b) => dayjs(a.date_at).valueOf() - dayjs(b.date_at).valueOf(), defaultSortOrder: "descend" },
                        { title: "Victime", key: "victime", render: (r) => <Text strong>{`${r.prenoms || ""} ${r.nom || ""}`.trim()}</Text> },
                        { title: "Service", dataIndex: "service", key: "service" },
                        { title: "Lieu", dataIndex: "lieu_at", key: "lieu_at", render: (v) => (v ? <Tag>{v}</Tag> : "-") },
                        { title: "ITT", dataIndex: "itt", key: "itt", align: "right", render: (v) => (v ? `${v} j` : "-") },
                        { title: "Lésions", dataIndex: "nature_lesions", key: "nature_lesions", render: (v) => <Text ellipsis={{ tooltip: v }} style={{ maxWidth: 260 }}>{v || "-"}</Text> },
                      ]}
                    />
                  ),
                },
                {
                  key: "qualite", label: <span>Qualité des données {champsFaibles.length > 0 && <Tag color="warning">{champsFaibles.length}</Tag>}</span>,
                  children: (
                    <>
                      <Alert
                        type="info" showIcon style={{ marginBottom: 12 }}
                        message="Fiabilité des statistiques"
                        description="Les classements par motif, pathologie ou région ne portent que sur les consultations où ces champs sont renseignés. Un taux de remplissage faible rend ces statistiques peu représentatives."
                      />
                      <Table
                        size="small" className="compact-table" pagination={false} dataSource={qualite}
                        columns={[
                          { title: "Champ de la consultation", dataIndex: "champ", key: "champ", render: (v) => <Text strong>{v}</Text> },
                          {
                            title: "Taux de remplissage", dataIndex: "taux", key: "taux", width: 320,
                            render: (v) => (
                              <Progress percent={v} size="small" format={(p) => `${p} %`}
                                status={v < 50 ? "exception" : v < 80 ? "normal" : "success"}
                                strokeColor={v < 50 ? token.colorError : v < 80 ? token.colorWarning : token.colorSuccess} />
                            ),
                          },
                        ]}
                      />
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default StatistiquesMedicales;

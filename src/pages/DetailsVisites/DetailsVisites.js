import React, { useMemo, useState } from "react";
import { Button, Card, DatePicker, Flex, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import { ArrowLeftOutlined, EyeOutlined, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { LOGO_BROWN } from "../../constants/app.constants";
import { exportWorkbookToExcel } from "../../utils/helpers";
import { couleurResultat, estVisite, graphiquesExportVisites, lignesExportVisites, resultatVisite, statistiquesVisites, typeVisite } from "../../utils/visites";
import { getTypeColor } from "../../utils/typePatient";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import PeriodeSelect from "../../components/common/PeriodeSelect/PeriodeSelect";
import SyntheseVisites from "../../components/specific/SyntheseVisites/SyntheseVisites";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PERIODE_MOIS = 5;
const PERIODE_PERSONNALISEE = 9;

const filtresDe = (lignes, cle) => [...new Set(lignes.map((l) => l[cle]).filter(Boolean))].sort().map((v) => ({ text: v, value: v }));

const Deduit = ({ deduit, children }) => (deduit
  ? <Tooltip title="Déduit du motif ou du diagnostic saisi en texte libre"><span>{children} <Text type="secondary">*</Text></span></Tooltip>
  : children);

// Détail des consultations dont le motif est une visite (depuis la liste des consultations ou les statistiques)
function DetailsVisites() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [periode, setPeriode] = useState(state?.periode ?? PERIODE_MOIS);
  const [dateRange, setDateRange] = useState(state?.dateRange ? state.dateRange.map((d) => dayjs(d)) : null);
  const [recherche, setRecherche] = useState("");

  const listUrl = periode === PERIODE_PERSONNALISEE
    ? (dateRange && dateRange[0] && dateRange[1]
      ? endpoints.consultations.LIST_BY_DATE(dateRange[0].format("YYYY-MM-DD"), dateRange[1].format("YYYY-MM-DD"))
      : null)
    : endpoints.consultations.LIST(periode);

  const { data: consultations, isLoading, onRefresh } = useFetch(listUrl);
  const { data: motifs } = useFetch(endpoints.motifs.LIST);

  // La liste par dates ne renvoie que le code du motif : le libellé est repris du référentiel
  const visites = useMemo(() => {
    const libelles = Object.fromEntries((motifs || []).map((m) => [m.code_motifcons, m.libelle_motifcons]));
    return (consultations || [])
      .map((c) => ({ ...c, libelle_motifcons: c.libelle_motifcons || libelles[c.code_motifcons] }))
      .filter(estVisite);
  }, [consultations, motifs]);

  const stats = useMemo(() => statistiquesVisites(visites), [visites]);

  const lignes = useMemo(() => visites.map((c) => {
    const type = typeVisite(c);
    const resultat = resultatVisite(c);
    return {
      ...c,
      key: c.numcons,
      patient: `${c.prenom_patient || ""} ${c.nom_patient || ""}`.trim() || c.numpat,
      type: type.label, typeDeduit: type.deduit,
      resultatLabel: resultat.label, resultatDeduit: resultat.deduit,
    };
  }), [visites]);

  const terme = recherche.trim().toLowerCase();
  const affichees = terme
    ? lignes.filter((l) => [l.patient, l.numpat, l.numcons, l.medecin, l.diagnostic].some((v) => (v || "").toLowerCase().includes(terme)))
    : lignes;

  const exporter = () => {
    exportWorkbookToExcel([
      { name: "Synthèse", rows: lignesExportVisites(stats) },
      {
        name: "Visites",
        rows: affichees.map((l) => ({
          "N° consultation": l.numcons, Date: dayjs(l.datecons).format("DD/MM/YYYY HH:mm"), Patient: l.patient, "N° patient": l.numpat,
          "Type de patient": l.type_patient || "", "Type de visite": l.type, "Résultat": l.resultatLabel,
          "Déduit du texte libre": l.typeDeduit || l.resultatDeduit ? "Oui" : "Non", "Médecin": l.medecin || "", Diagnostic: l.diagnostic || "",
        })),
      },
    ], `Visites_${dayjs().format("YYYYMMDD_HHmm")}`, {
      titre: "Visites médicales",
      sousTitre: `Édité le ${dayjs().format("DD/MM/YYYY à HH:mm")}`,
      indicateurs: [
        { label: "Visites réalisées", valeur: stats.total, pied: `${stats.patients} patient(s) distinct(s)` },
        { label: "Taux d'aptitude", valeur: `${stats.tauxAptitude} %`, pied: `${stats.aptes} apte(s)`, couleur: "#52c41a" },
        { label: "Inaptes", valeur: stats.inaptes, pied: "temporaires ou définitifs", couleur: "#ff4d4f" },
        { label: "Résultat non renseigné", valeur: stats.nonRenseignes, pied: `${stats.deduits} valeur(s) déduite(s)`, couleur: "#8c8c8c" },
      ],
      graphiques: graphiquesExportVisites(stats),
    });
  };

  const colonnes = [
    {
      title: "Date", dataIndex: "datecons", width: 140, defaultSortOrder: "descend",
      sorter: (a, b) => dayjs(a.datecons).valueOf() - dayjs(b.datecons).valueOf(),
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Patient", dataIndex: "patient",
      render: (v, r) => <div><Text strong>{v}</Text><div><Text style={{ color: LOGO_BROWN, fontSize: 12 }}>{r.numpat}</Text></div></div>,
    },
    {
      title: "Type de patient", dataIndex: "type_patient", filters: filtresDe(lignes, "type_patient"), onFilter: (v, r) => r.type_patient === v,
      render: (v) => (v ? <Tag color={getTypeColor(v)}>{v}</Tag> : "-"),
    },
    {
      title: "Type de visite", dataIndex: "type", filters: filtresDe(lignes, "type"), onFilter: (v, r) => r.type === v,
      render: (v, r) => <Deduit deduit={r.typeDeduit}>{v}</Deduit>,
    },
    {
      title: "Résultat", dataIndex: "resultatLabel", filters: filtresDe(lignes, "resultatLabel"), onFilter: (v, r) => r.resultatLabel === v,
      render: (v, r) => <Deduit deduit={r.resultatDeduit}><Tag color={couleurResultat(v)} style={{ fontWeight: 600 }}>{v}</Tag></Deduit>,
    },
    { title: "Médecin", dataIndex: "medecin", filters: filtresDe(lignes, "medecin"), onFilter: (v, r) => r.medecin === v },
    { title: "Diagnostic", dataIndex: "diagnostic", render: (v) => <Text ellipsis={{ tooltip: v }} style={{ maxWidth: 220 }}>{v}</Text> },
    {
      title: "", key: "action", width: 50, align: "center",
      render: (_, r) => (
        <Tooltip title="Voir la consultation">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate("/espace-medical/consultations/details-consultation", { state: { currentConsultation: r } })} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Flex justify="space-between" align="flex-start" wrap gap={12}>
          <div>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ padding: 0 }}>Retour</Button>
            <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>Détails des visites</Title>
            <Text type="secondary">Consultations dont le motif est une visite : types de visites et résultats d'aptitude.</Text>
          </div>
          <Space wrap>
            <ReloadButton onRefresh={onRefresh} />
            <PeriodeSelect value={periode} onChange={setPeriode} />
            {periode === PERIODE_PERSONNALISEE && (
              <RangePicker format="DD/MM/YYYY" value={dateRange} onChange={setDateRange} />
            )}
            <Button
              icon={<FileExcelOutlined />} onClick={exporter} disabled={!affichees.length}
              style={affichees.length ? { color: "#1d6f42", borderColor: "#1d6f42" } : undefined}
            >
              Export Excel
            </Button>
          </Space>
        </Flex>
      </Card>

      <div style={{ marginBottom: 16 }}>
        <SyntheseVisites stats={stats} loading={isLoading} />
      </div>

      <Card>
        <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 12 }}>
          <Input
            allowClear prefix={<SearchOutlined />} placeholder="Patient, N° patient, médecin, diagnostic..."
            value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ maxWidth: 360 }}
          />
          <Text type="secondary">{affichees.length} visite(s) · * : valeur déduite du texte libre</Text>
        </Flex>
        <Table
          size="small" className="compact-table" loading={isLoading} dataSource={affichees} columns={colonnes}
          scroll={{ x: "max-content" }} pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}

export default DetailsVisites;

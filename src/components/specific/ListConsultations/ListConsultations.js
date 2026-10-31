import React, { useState } from 'react'
import { Avatar, Button, Card, Col, DatePicker, Flex, Row, Segmented, Space, Tag, Tooltip, Typography, theme } from "antd"
import dayjs from 'dayjs';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import DataTable from '../../common/DataTable/DataTable';
import { exportToExcel } from '../../../utils/helpers';
import {
    AuditOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, FileExcelOutlined, FolderOpenOutlined,
    ProfileOutlined, TeamOutlined,
} from '@ant-design/icons';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import PeriodeSelect from '../../common/PeriodeSelect/PeriodeSelect';
import SearchBar from '../../common/SearchBar/SearchBar';
import useSearch from '../../../utils/hooks/useSearch';
import { ServiceType } from '../../../utils/types/types.ts';
import { LOGO_BROWN } from '../../../constants/app.constants.js';
import { useNavigate } from 'react-router';
import { RESULTATS_TDR, getResultatTdr, isTdrRealise } from '../../../utils/tdr';
import { getTypeColor } from '../../../utils/typePatient';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const isValidee = (record) => record?.medecin !== null && record?.medecin !== undefined;

// Carte de synthèse cliquable (sert aussi de filtre rapide sur le statut)
const StatCard = ({ icon, label, value, color, active, onClick, sousTitre }) => {
    const { token } = theme.useToken();
    return (
        <div
            onClick={onClick}
            style={{
                cursor: onClick ? "pointer" : "default",
                padding: "14px 16px",
                borderRadius: 10,
                background: active ? token.colorPrimaryBg : token.colorFillAlter,
                border: `1px solid ${active ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                transition: "all 0.2s",
            }}
        >
            <Flex align="center" gap={12}>
                <Avatar size={40} icon={icon} style={{ backgroundColor: color }} />
                <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
                    {sousTitre && <div style={{ fontSize: 12, marginTop: 2 }}>{sousTitre}</div>}
                </div>
            </Flex>
        </div>
    );
};

function ListConsultations({ serviceType }) {
    const navigate = useNavigate()
    const { token: { colorPrimary, colorSuccess, colorWarning } } = theme.useToken();

    const [periode, setPeriode] = useState(1);
    const [dateRange, setDateRange] = useState(null);
    // Filtre rapide sur le statut : "all" | "validees" | "attente"
    const [statut, setStatut] = useState("all");
    // Filtre "patients consultés plusieurs fois sur la période", éventuellement restreint à un patient
    const [multiples, setMultiples] = useState(false);
    const [patientFiltre, setPatientFiltre] = useState(null);

    const listUrl = periode === 9
        ? (dateRange && dateRange[0] && dateRange[1]
            ? endpoints.consultations.LIST_BY_DATE(
                dateRange[0].format("YYYY-MM-DD"),
                dateRange[1].format("YYYY-MM-DD"),
            )
            : null)
        : endpoints.consultations.LIST(periode);

    const { data: listConsultations, dataCopy: listConsultationsCopy, setDataCopy: setListConsultationsCopy, isLoading: listConsultationsLoading, onRefresh: refreshListConsultations } = useFetch(listUrl);

    const { getColumnFilterProps, getColumnRangeSearchProps } = useSearch();

    // L'API ne renvoie que le code de la pathologie : le libellé est repris du référentiel
    const { data: pathologies } = useFetch(endpoints.pathologie.LIST);
    const libellesPatho = Object.fromEntries((pathologies || []).map((p) => [p.code_patho, p.libelle_patho]));
    const avecPathologie = (record) => ({
        ...record,
        pathologie: record.pathologie || libellesPatho[record.code_patho] || null,
    });

    // Lignes affichées : résultat de la recherche, puis du filtre rapide de statut
    const searched = (listConsultationsCopy || []).map(avecPathologie);

    // Nombre de consultations de chaque patient sur la période (après recherche)
    const nbParPatient = searched.reduce((acc, record) => {
        acc[record.numpat] = (acc[record.numpat] || 0) + 1;
        return acc;
    }, {});
    // Patients consultés plus d'une fois, du plus consulté au moins consulté
    const patientsMultiples = Object.entries(nbParPatient)
        .filter(([, nb]) => nb > 1)
        .map(([numpat, nb]) => {
            const record = searched.find((r) => r.numpat === numpat);
            return { numpat, nb, nom: `${record?.prenom_patient || ""} ${record?.nom_patient || ""}`.trim() || numpat };
        })
        .sort((a, b) => b.nb - a.nb || a.nom.localeCompare(b.nom, "fr"));
    const nbConsultationsMultiples = patientsMultiples.reduce((acc, p) => acc + p.nb, 0);

    const displayed = searched.filter((record) =>
        (statut === "all" || (statut === "validees" ? isValidee(record) : !isValidee(record)))
        && (!multiples || nbParPatient[record.numpat] > 1)
        && (!patientFiltre || record.numpat === patientFiltre)
    );
    const nbValidees = searched.filter(isValidee).length;
    const nbPatients = Object.keys(nbParPatient).length;

    const toggleMultiples = () => {
        setMultiples(!multiples);
        setPatientFiltre(null);
    };

    const openConsultation = (record) => {
        navigate("/espace-medical/consultations/details-consultation", { state: { currentConsultation: record } });
    }

    const onOpenMedicalFolder = (record) => {
        switch (serviceType) {
            case ServiceType.DENTAIRE:
                navigate(`/espace-dentist/patients/${record?.numpat}`);
                break;
            case ServiceType.GYNECOLOGIE:
                navigate(`/espace-gynecologie/patients/${record?.numpat}`);
                break;
            case ServiceType.ANALYSE:
                navigate(`/espace-analyse/patients/${record?.numpat}`);
                break;
            case ServiceType.RADIOLOGIE:
                navigate(`/espace-radiologie/patients/${record?.numpat}`);
                break;
            case ServiceType.HOSPITALISATION:
                navigate(`/espace-hospitalisation/patients/${record?.numpat}`);
                break;
            case ServiceType.INFIRMERIE:
                navigate(`/espace-infirmerie/patients/${record?.numpat}`);
                break;
            case ServiceType.MEDICAL:
            default:
                navigate(`/espace-medical/patients/${record?.numpat}`);
                break;
        }
        sessionStorage.setItem("currentPatient", JSON.stringify({
            num_patient: record?.numpat,
            nom_patient: record?.nom_patient,
            prenom_patient: record?.prenom_patient,
            sexe_patient: record?.sexe_patient,
            type_patient: record?.type_patient,
        }));
    }

    const handleExport = () => {
        const rows = displayed.map((item) => ({
            ...item,
            datecons: item.datecons ? dayjs(item.datecons).format("DD/MM/YYYY HH:mm") : item.datecons,
        }));
        exportToExcel(rows, `Consultations_${dayjs().format("YYYYMMDD_HHmm")}`);
    }

    const toggleStatut = (value) => setStatut(statut === value ? "all" : value);

    return (
        <Card>
            {/* En-tête */}
            <Flex justify="space-between" align="flex-start" wrap gap={12}>
                <div>
                    <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>Liste des consultations</Title>
                    <Text type="secondary">Suivi des consultations réalisées sur la période sélectionnée.</Text>
                </div>
                <Space wrap>
                    <ReloadButton onRefresh={refreshListConsultations} />
                    {(!serviceType || serviceType === ServiceType.MEDICAL) && (
                        <Button
                            icon={<AuditOutlined />}
                            onClick={() => navigate("/espace-medical/consultations/visites", {
                                state: { periode, dateRange: dateRange ? dateRange.map((d) => d.toISOString()) : null },
                            })}
                        >
                            Détails des visites
                        </Button>
                    )}
                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={handleExport}
                        disabled={!displayed.length}
                        style={displayed.length ? { color: "#1d6f42", borderColor: "#1d6f42" } : undefined}
                    >
                        Export Excel
                    </Button>
                </Space>
            </Flex>

            {/* Synthèse */}
            <Row gutter={[12, 12]} style={{ margin: "16px 0" }}>
                <Col xs={12} lg={6}>
                    <StatCard icon={<ProfileOutlined />} label="Consultations" value={searched.length} color={colorPrimary}
                        active={statut === "all" && !multiples}
                        onClick={() => { setStatut("all"); setMultiples(false); setPatientFiltre(null); }} />
                </Col>
                <Col xs={12} lg={6}>
                    <StatCard icon={<CheckCircleOutlined />} label="Validées" value={nbValidees} color={colorSuccess}
                        active={statut === "validees"} onClick={() => toggleStatut("validees")} />
                </Col>
                <Col xs={12} lg={6}>
                    <StatCard icon={<ClockCircleOutlined />} label="En attente" value={searched.length - nbValidees} color={colorWarning}
                        active={statut === "attente"} onClick={() => toggleStatut("attente")} />
                </Col>
                <Col xs={12} lg={6}>
                    {/* Cliquable s'il y a des patients consultés plusieurs fois : filtre la liste sur eux */}
                    <Tooltip title={patientsMultiples.length ? (multiples ? "Afficher toutes les consultations" : "Afficher les patients consultés plusieurs fois") : ""}>
                        <div>
                            <StatCard
                                icon={<TeamOutlined />}
                                label="Patients distincts"
                                value={nbPatients}
                                color={LOGO_BROWN}
                                active={multiples}
                                onClick={patientsMultiples.length ? toggleMultiples : undefined}
                                sousTitre={patientsMultiples.length > 0 && (
                                    <Text style={{ color: LOGO_BROWN }}>
                                        dont <Text strong style={{ color: LOGO_BROWN }}>{patientsMultiples.length}</Text> consulté{patientsMultiples.length > 1 ? "s" : ""} plusieurs fois
                                    </Text>
                                )}
                            />
                        </div>
                    </Tooltip>
                </Col>
            </Row>

            {/* Patients ayant eu plusieurs consultations sur la période */}
            {multiples && patientsMultiples.length > 0 && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: `${LOGO_BROWN}0f`, border: `1px solid ${LOGO_BROWN}33` }}>
                    <Flex justify="space-between" align="center" wrap gap={8} style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: LOGO_BROWN }}>
                            <TeamOutlined /> {patientsMultiples.length} patient{patientsMultiples.length > 1 ? "s" : ""} consulté{patientsMultiples.length > 1 ? "s" : ""} plusieurs fois
                            <Text type="secondary" style={{ fontWeight: 400 }}> · {nbConsultationsMultiples} consultations · cliquer sur un patient pour isoler ses consultations</Text>
                        </Text>
                        <Button size="small" type="link" onClick={toggleMultiples}>Afficher toutes les consultations</Button>
                    </Flex>
                    <Flex wrap gap={6}>
                        {patientsMultiples.map((p) => (
                            <Tag.CheckableTag
                                key={p.numpat}
                                checked={patientFiltre === p.numpat}
                                onChange={(checked) => setPatientFiltre(checked ? p.numpat : null)}
                                style={{ border: `1px solid ${LOGO_BROWN}55`, marginInlineEnd: 0 }}
                            >
                                {p.nom} <Text strong style={{ color: "inherit" }}>×{p.nb}</Text>
                            </Tag.CheckableTag>
                        ))}
                    </Flex>
                </div>
            )}

            {/* Barre de filtres */}
            <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 12 }}>
                <SearchBar
                    data={(listConsultations || []).map(avecPathologie)}
                    setDataCopy={setListConsultationsCopy}
                    listKeys={["numcons", "numpat", "nom_patient", "prenom_patient", "libelle_motifcons", "pathologie", "diagnostic"]}
                />
                <Space wrap>
                    <Segmented
                        value={statut}
                        onChange={setStatut}
                        options={[
                            { label: "Toutes", value: "all" },
                            { label: "Validées", value: "validees" },
                            { label: "En attente", value: "attente" },
                        ]}
                    />
                    <PeriodeSelect
                        value={periode}
                        onChange={(value) => {
                            setPeriode(value);
                            // Les patients "consultés plusieurs fois" dépendent de la période
                            setMultiples(false);
                            setPatientFiltre(null);
                        }}
                    />
                    {periode === 9 && (
                        <RangePicker
                            variant="filled"
                            format="DD/MM/YYYY"
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                        />
                    )}
                </Space>
            </Flex>

            <DataTable
                compact
                hideTotal
                dataSource={listConsultations}
                dataSourceCopy={displayed}
                setDataSourceCopy={setListConsultationsCopy}
                tableLoading={listConsultationsLoading}
                rowKey={(record) => record.numcons}
                columns={[
                    {
                        title: 'Date',
                        dataIndex: 'datecons',
                        key: 'datecons',
                        sorter: (a, b) => dayjs(a.datecons).valueOf() - dayjs(b.datecons).valueOf(),
                        defaultSortOrder: "descend",
                        render: (value) => value ? (
                            <div style={{ lineHeight: 1.3 }}>
                                <Text strong>{dayjs(value).format("DD/MM/YYYY")}</Text>
                                <div><Text type="secondary" style={{ fontSize: 12 }}>{dayjs(value).format("HH:mm")}</Text></div>
                            </div>
                        ) : "-",
                    },
                    {
                        title: 'Patient',
                        key: 'patient',
                        sorter: (a, b) => `${a.nom_patient} ${a.prenom_patient}`.localeCompare(`${b.nom_patient} ${b.prenom_patient}`),
                        render: (record) => (
                            <Flex align="center" gap={10}>
                                <Avatar size={32} style={{ backgroundColor: record.sexe_patient === "FE" ? "#eb2f96" : colorPrimary, flexShrink: 0 }}>
                                    {`${record.prenom_patient?.[0] || ""}${record.nom_patient?.[0] || ""}`.toUpperCase()}
                                </Avatar>
                                <div style={{ lineHeight: 1.3 }}>
                                    <Text strong>{record.prenom_patient} {record.nom_patient}</Text>
                                    {nbParPatient[record.numpat] > 1 && (
                                        <Tooltip title={`${nbParPatient[record.numpat]} consultations sur la période : cliquer pour les isoler`}>
                                            <Tag
                                                color="orange"
                                                style={{ marginInlineStart: 6, cursor: "pointer", fontWeight: 600 }}
                                                onClick={() => { setMultiples(true); setPatientFiltre(record.numpat); }}
                                            >
                                                ×{nbParPatient[record.numpat]}
                                            </Tag>
                                        </Tooltip>
                                    )}
                                    <div><Text type="secondary" style={{ fontSize: 12 }}>{record.numpat}</Text></div>
                                </div>
                            </Flex>
                        ),
                    },
                    {
                        title: 'Sexe',
                        dataIndex: 'sexe_patient',
                        key: 'sexe_patient',
                        align: 'center',
                        ...getColumnFilterProps("sexe_patient", listConsultationsCopy),
                        render: (value) => value ? <Tag color={value === "FE" ? "magenta" : "blue"} style={{ marginInlineEnd: 0 }}>{value === "FE" ? "F" : "M"}</Tag> : "-",
                    },
                    {
                        title: 'Âge',
                        dataIndex: 'age_patient',
                        key: 'age_patient',
                        align: 'center',
                        ...getColumnRangeSearchProps("age_patient"),
                        render: (value) => (value !== null && value !== undefined ? `${value} ans` : "-"),
                    },
                    {
                        title: 'Type',
                        dataIndex: 'type_patient',
                        key: 'type_patient',
                        ...getColumnFilterProps("type_patient", listConsultationsCopy),
                        // Même couleur par type que dans la liste des patients
                        render: (value) => value ? <Tag color={getTypeColor(value)}>{value}</Tag> : "-",
                    },
                    {
                        title: 'Motif',
                        dataIndex: 'libelle_motifcons',
                        key: 'libelle_motifcons',
                        ...getColumnFilterProps("libelle_motifcons", listConsultationsCopy),
                        render: (value) => value
                            ? <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 200, display: "inline-block" }}>{value}</Text>
                            : <Text type="secondary">-</Text>,
                    },
                    {
                        title: 'Pathologie',
                        dataIndex: 'pathologie',
                        key: 'pathologie',
                        ...getColumnFilterProps("pathologie", searched),
                        render: (value) => value
                            ? <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 200, display: "inline-block" }}>{value}</Text>
                            : <Text type="secondary">-</Text>,
                    },
                    {
                        title: 'TDR effectué',
                        dataIndex: 'test_tdr',
                        key: 'test_tdr',
                        align: 'center',
                        filters: [
                            { text: "Oui", value: "Oui" },
                            { text: "Non", value: "Non" },
                        ],
                        // isTdrRealise couvre aussi l'ancien format où test_tdr contenait directement le résultat
                        onFilter: (value, record) => (isTdrRealise(record) ? "Oui" : "Non") === value,
                        render: (_, record) => isTdrRealise(record)
                            ? <Tag color="processing" style={{ marginInlineEnd: 0 }}>Oui</Tag>
                            : <Text type="secondary">Non</Text>,
                    },
                    {
                        title: 'Résultat TDR',
                        dataIndex: 'resultat_test_tdr',
                        key: 'resultat_test_tdr',
                        align: 'center',
                        filters: [
                            ...RESULTATS_TDR.map(({ value, label }) => ({ text: label, value })),
                            { text: "Non réalisé", value: "non_realise" },
                        ],
                        onFilter: (value, record) => (getResultatTdr(record) || "non_realise") === value,
                        render: (_, record) => {
                            const resultat = RESULTATS_TDR.find((r) => r.value === getResultatTdr(record));
                            if (resultat) return <Tag color={resultat.color} style={{ marginInlineEnd: 0 }}>{resultat.label}</Tag>;
                            // TDR réalisé (test_tdr = "Oui") mais résultat absent de la réponse de l'API
                            return isTdrRealise(record)
                                ? (
                                    <Tooltip title="Le TDR a été réalisé mais son résultat n'est pas enregistré">
                                        <Tag style={{ marginInlineEnd: 0 }}>Réalisé, sans résultat</Tag>
                                    </Tooltip>
                                )
                                : <Text type="secondary">-</Text>;
                        },
                    },
                    {
                        title: 'Diagnostic',
                        dataIndex: 'diagnostic',
                        key: 'diagnostic',
                        render: (value) => value
                            ? <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 220, display: "inline-block" }}>{value}</Text>
                            : <Text type="secondary">-</Text>,
                    },
                    {
                        title: 'Médecin',
                        dataIndex: 'medecin',
                        key: 'medecin',
                        ...getColumnFilterProps("medecin", listConsultationsCopy),
                        render: (value) => value || <Text type="secondary">-</Text>,
                    },
                    {
                        title: 'Statut',
                        key: 'statut',
                        align: 'center',
                        render: (record) => isValidee(record)
                            ? <Tag icon={<CheckCircleOutlined />} color="success">Validée</Tag>
                            : <Tag icon={<ClockCircleOutlined />} color="warning">En attente</Tag>,
                    },
                    {
                        fixed: "right",
                        render: (record) => (
                            <Space size={0}>
                                <Tooltip title="Détails de la consultation">
                                    <Button type="text" icon={<EyeOutlined />} onClick={() => openConsultation(record)} />
                                </Tooltip>
                                <Tooltip title="Ouvrir le dossier médical">
                                    <Button type="text" icon={<FolderOpenOutlined />} onClick={() => onOpenMedicalFolder(record)} />
                                </Tooltip>
                            </Space>
                        )
                    }
                ]}
            />
        </Card>
    )
}

export default ListConsultations

import React, { useState } from 'react'
import { Avatar, Button, Card, Col, DatePicker, Flex, Row, Segmented, Space, Tag, Tooltip, Typography, theme } from "antd"
import dayjs from 'dayjs';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import DataTable from '../../common/DataTable/DataTable';
import { exportToExcel } from '../../../utils/helpers';
import {
    CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, FileExcelOutlined, FolderOpenOutlined,
    ProfileOutlined, TeamOutlined,
} from '@ant-design/icons';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import PeriodeSelect from '../../common/PeriodeSelect/PeriodeSelect';
import SearchBar from '../../common/SearchBar/SearchBar';
import useSearch from '../../../utils/hooks/useSearch';
import { ServiceType } from '../../../utils/types/types.ts';
import { LOGO_BROWN } from '../../../constants/app.constants.js';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const isValidee = (record) => record?.medecin !== null && record?.medecin !== undefined;

// Carte de synthèse cliquable (sert aussi de filtre rapide sur le statut)
const StatCard = ({ icon, label, value, color, active, onClick }) => {
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

    // Lignes affichées : résultat de la recherche, puis du filtre rapide de statut
    const searched = listConsultationsCopy || [];
    const displayed = searched.filter((record) =>
        statut === "all" || (statut === "validees" ? isValidee(record) : !isValidee(record))
    );
    const nbValidees = searched.filter(isValidee).length;
    const nbPatients = new Set(searched.map((record) => record.numpat)).size;

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
                        active={statut === "all"} onClick={() => setStatut("all")} />
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
                    <StatCard icon={<TeamOutlined />} label="Patients distincts" value={nbPatients} color={LOGO_BROWN} />
                </Col>
            </Row>

            {/* Barre de filtres */}
            <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 12 }}>
                <SearchBar
                    data={listConsultations}
                    setDataCopy={setListConsultationsCopy}
                    listKeys={["numcons", "numpat", "nom_patient", "prenom_patient", "motif", "pathologie", "diagnostic"]}
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
                        onChange={(value) => setPeriode(value)}
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
                        render: (value) => value ? <Tag>{value}</Tag> : "-",
                    },
                    {
                        title: 'Motif / Pathologie',
                        key: 'motif',
                        render: (record) => (
                            <div style={{ lineHeight: 1.3, maxWidth: 240 }}>
                                <Text ellipsis={{ tooltip: record.motif }}>{record.motif || "-"}</Text>
                                {record.pathologie && (
                                    <div><Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: record.pathologie }}>{record.pathologie}</Text></div>
                                )}
                            </div>
                        ),
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

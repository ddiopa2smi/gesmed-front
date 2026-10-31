import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Flex, Input, Modal, Row, Space, Tag, Tooltip, Typography, message } from "antd"
import { useNavigate } from 'react-router';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, ExportOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { deleteActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import { LOGO_BROWN } from '../../constants/app.constants';
import useFetch from '../../utils/hooks/useFetch';
import { deletePopup, exportWorkbookToExcel, formatDate } from '../../utils/helpers';
import DataTable from '../../components/common/DataTable/DataTable';
import KpiCard from '../../components/common/KpiCard/KpiCard';
import AddVisite, { NATURES_VISITE, dureeVisite, formatHeure, listeIntervenants } from '../../components/specific/AddVisite/AddVisite';

const { Title, Text, Paragraph } = Typography;

// "Néant" ou vide : aucune information saisie
const estRenseigne = (valeur) => !!valeur && valeur.trim().toLowerCase() !== "néant";

const NatureTag = ({ nature }) => {
    const config = NATURES_VISITE[nature];
    return <Tag color={config?.color} style={{ marginInlineEnd: 0 }}>{config?.label || nature || "-"}</Tag>;
};

const ApercuTexte = ({ valeur }) => (
    estRenseigne(valeur)
        ? <Paragraph ellipsis={{ rows: 1, tooltip: valeur }} style={{ marginBottom: 0, maxWidth: 260 }}>{valeur}</Paragraph>
        : <Text type="secondary">Néant</Text>
);

function Visites() {
    const navigate = useNavigate();
    const { data, dataCopy, setDataCopy, isLoading, onRefresh } = useFetch(endpoints.visitesLieux.LIST);
    const [operationType, setOperationType] = useState(null);
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState({});
    const [recherche, setRecherche] = useState("");

    const visites = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    // Recherche plein texte sur le lieu, la nature et les observations
    useEffect(() => {
        const terme = recherche.trim().toLowerCase();
        if (!terme) {
            setDataCopy(visites);
            return;
        }
        setDataCopy(visites.filter((visite) =>
            [visite.lieu_visite, NATURES_VISITE[visite.nature_visite]?.label, visite.nature_visite, visite.intervenants, visite.risques, visite.problemes, visite.mesures_ind, visite.mesures_col, formatDate(visite.date_visite)]
                .some((champ) => (champ || "").toString().toLowerCase().includes(terme))
        ));
    }, [recherche, visites, setDataCopy]);

    const indicateurs = useMemo(() => {
        const anneeCourante = new Date().getFullYear();
        const derniere = visites.reduce((max, visite) => (
            visite.date_visite && (!max || new Date(visite.date_visite) > new Date(max)) ? visite.date_visite : max
        ), null);
        return {
            total: visites.length,
            annee: visites.filter((visite) => visite.date_visite && new Date(visite.date_visite).getFullYear() === anneeCourante).length,
            avecRisques: visites.filter((visite) => estRenseigne(visite.risques)).length,
            derniere,
        };
    }, [visites]);

    const onAdd = () => {
        setCurrentRecord(null);
        setOperationType("add");
        setOpen(true);
    }

    const onView = (record) => {
        navigate("/espace-medical/visites/details", { state: { visite: record } })
    }

    const onEdit = (record) => {
        setCurrentRecord({ ...record });
        setOperationType("update");
        setOpen(true);
    }

    const onDelete = (record) => {
        deletePopup()
            .then((result) => {
                if (result.isConfirmed) {
                    deleteActions(`${endpoints.visitesLieux.DELETE}/${record?.num_visite}`)
                        .then((response) => {
                            if (response?.data?.Deleted === true) {
                                message.success("Visite supprimée avec succès");
                                onRefresh();
                            } else {
                                message.error("La suppression n'a pas pu être effectuée");
                            }
                        })
                }
            })
    }

    const onExport = () => {
        exportWorkbookToExcel([{
            name: "Visites des lieux",
            rows: (dataCopy || []).map((visite) => ({
                "Date": formatDate(visite.date_visite),
                "Lieu": visite.lieu_visite,
                "Nature": NATURES_VISITE[visite.nature_visite]?.label || visite.nature_visite,
                "Heure de début": formatHeure(visite.heure_debut) || "",
                "Heure de fin": formatHeure(visite.heure_fin) || "",
                "Durée": dureeVisite(visite.heure_debut, visite.heure_fin) || "",
                "Intervenants": visite.intervenants || "",
                "Risques identifiés": visite.risques,
                "Problèmes liés": visite.problemes,
                "Mesures individuelles": visite.mesures_ind,
                "Mesures collectives": visite.mesures_col,
            })),
        }], `visites_lieux_${new Date().toISOString().slice(0, 10)}`);
    }

    return (
        <Card>
            <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                <div>
                    <Title level={3} style={{ color: LOGO_BROWN, marginBottom: 0 }}>Visite des lieux</Title>
                    <Text type="secondary">Visites des postes de travail : risques identifiés et mesures de prévention</Text>
                </div>
                <Space wrap>
                    <Tooltip title="Exporter (Excel)">
                        <Button type='text' shape="circle" icon={<ExportOutlined />} onClick={onExport} disabled={!dataCopy?.length} />
                    </Tooltip>
                    <Tooltip title="Actualiser">
                        <Button type='text' shape="circle" icon={<ReloadOutlined />} onClick={onRefresh} />
                    </Tooltip>
                    <Button type='primary' icon={<PlusOutlined />} onClick={onAdd}>Nouvelle visite</Button>
                </Space>
            </Flex>

            <Row gutter={[16, 16]} style={{ margin: "16px 0" }}>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard loading={isLoading} icon={<EnvironmentOutlined />} color="#1677ff" label="Visites enregistrées" value={indicateurs.total} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard loading={isLoading} icon={<CalendarOutlined />} color="#52c41a" label={`Visites en ${new Date().getFullYear()}`} value={indicateurs.annee} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard
                        loading={isLoading}
                        icon={<WarningOutlined />}
                        color="#fa8c16"
                        label="Avec risques identifiés"
                        value={indicateurs.avecRisques}
                        footer={indicateurs.total ? <Text type="secondary">{Math.round((indicateurs.avecRisques / indicateurs.total) * 100)} % des visites</Text> : null}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard
                        loading={isLoading}
                        icon={<CalendarOutlined />}
                        color={LOGO_BROWN}
                        label="Dernière visite"
                        value={<span style={{ fontSize: 22 }}>{indicateurs.derniere ? formatDate(indicateurs.derniere) : "-"}</span>}
                    />
                </Col>
            </Row>

            <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Rechercher (lieu, nature, risques...)"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    style={{ maxWidth: 320 }}
                />
            </Flex>

            <DataTable compact
                dataSource={data}
                dataSourceCopy={dataCopy}
                setDataSourceCopy={setDataCopy}
                tableLoading={isLoading}
                columns={[
                    {
                        title: 'Date',
                        dataIndex: 'date_visite',
                        key: 'date_visite',
                        width: 110,
                        sorter: (a, b) => new Date(a.date_visite || 0) - new Date(b.date_visite || 0),
                        render: (value) => <div className='table-data'>{value ? formatDate(value) : "-"}</div>,
                    },
                    {
                        title: 'Lieu',
                        dataIndex: 'lieu_visite',
                        key: 'lieu_visite',
                        sorter: (a, b) => (a.lieu_visite || "").localeCompare(b.lieu_visite || "", "fr"),
                        render: (value) => <Text strong>{value}</Text>,
                    },
                    {
                        title: 'Nature',
                        dataIndex: 'nature_visite',
                        key: 'nature_visite',
                        filters: Object.entries(NATURES_VISITE).map(([value, { label }]) => ({ text: label, value })),
                        onFilter: (value, record) => record.nature_visite === value,
                        render: (value) => <NatureTag nature={value} />,
                    },
                    {
                        title: 'Déroulement',
                        key: 'deroulement',
                        render: (record) => {
                            const intervenants = listeIntervenants(record.intervenants);
                            const debut = formatHeure(record.heure_debut);
                            const fin = formatHeure(record.heure_fin);
                            if (!debut && !fin && !intervenants.length) return <Text type="secondary">-</Text>;
                            return (
                                <div style={{ lineHeight: 1.35 }}>
                                    {(debut || fin) && (
                                        <Text>
                                            <ClockCircleOutlined style={{ marginRight: 6, color: "#1677ff" }} />
                                            {debut || "?"} – {fin || "?"}
                                            {dureeVisite(record.heure_debut, record.heure_fin) && (
                                                <Text type="secondary" style={{ fontSize: 12 }}> ({dureeVisite(record.heure_debut, record.heure_fin)})</Text>
                                            )}
                                        </Text>
                                    )}
                                    {intervenants.length > 0 && (
                                        <div>
                                            <Tooltip title={intervenants.join(", ")}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    <TeamOutlined style={{ marginRight: 6 }} />
                                                    {intervenants[0]}{intervenants.length > 1 ? ` +${intervenants.length - 1}` : ""}
                                                </Text>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            );
                        },
                    },
                    {
                        title: 'Risques identifiés',
                        dataIndex: 'risques',
                        key: 'risques',
                        responsive: ["md"],
                        render: (value) => <ApercuTexte valeur={value} />,
                    },
                    {
                        title: 'Mesures',
                        key: 'mesures',
                        responsive: ["lg"],
                        render: (record) => (
                            <Space size={4}>
                                <Tag color={estRenseigne(record.mesures_ind) ? "cyan" : "default"} style={{ marginInlineEnd: 0 }}>Individuelles</Tag>
                                <Tag color={estRenseigne(record.mesures_col) ? "geekblue" : "default"} style={{ marginInlineEnd: 0 }}>Collectives</Tag>
                            </Space>
                        ),
                    },
                    {
                        key: 'actions',
                        width: 130,
                        render: (record) => (
                            <Flex justify="center" align="center">
                                <Space size={0}>
                                    <Tooltip title="Consulter">
                                        <Button type='link' icon={<EyeOutlined />} onClick={() => { onView(record) }} />
                                    </Tooltip>
                                    <Tooltip title="Modifier">
                                        <Button type='link' icon={<EditOutlined />} onClick={() => { onEdit(record) }} />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button type='link' danger icon={<DeleteOutlined />} onClick={() => { onDelete(record) }} />
                                    </Tooltip>
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />

            <Modal
                title={
                    (operationType === "add" && "Nouvelle visite des lieux") ||
                    (operationType === "update" && "Modifier la visite")
                }
                width={900}
                open={open}
                onCancel={() => {
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                <AddVisite
                    setOpen={setOpen}
                    operationType={operationType}
                    onRefresh={onRefresh}
                    currentRecord={currentRecord}
                />
            </Modal>
        </Card>
    )
}

export default Visites

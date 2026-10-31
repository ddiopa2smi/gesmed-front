import React from 'react'
import { Avatar, Button, Col, Dropdown, Empty, Flex, Row, Space, Table, Tag, Typography, theme } from 'antd'
import {
    CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExperimentOutlined, FilePdfOutlined, FileSearchOutlined,
    MedicineBoxOutlined, PrinterOutlined, SolutionOutlined, UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { endpoints } from '../../../constants/endpoints.constants';
import { codesPrescriptions } from '../../../constants/app.constants';
import { printPDF } from '../../../utils/helpers';

const { Text } = Typography;

// Colonnes des lignes de prescription, selon le type
const colonneLibelle = (titre) => ({
    title: titre,
    dataIndex: 'libacte',
    key: 'libacte',
    render: (value, ligne) => (
        <div style={{ lineHeight: 1.3 }}>
            <Text strong={!ligne.exclus} delete={ligne.exclus}>{value}</Text>
            {ligne.exclus && <Tag color="default" style={{ marginInlineStart: 6 }}>Exclu</Tag>}
            {ligne.dispo === "Non" && <Tag color="error" style={{ marginInlineStart: 6 }}>Indisponible</Tag>}
        </div>
    ),
});

const colonneTexte = (titre, dataIndex) => ({
    title: titre,
    dataIndex,
    key: dataIndex,
    render: (value) => value ? <Text style={{ whiteSpace: "pre-wrap" }}>{value}</Text> : <Text type="secondary">-</Text>,
});

const COLONNES_ORDONNANCE = [
    colonneLibelle("Médicament"),
    colonneTexte("Posologie", "posologie"),
    { title: "Qté prescrite", dataIndex: "qte", key: "qte", align: "center", width: 110, render: (value, ligne) => <>{value ?? "-"} {ligne.cond && <Text type="secondary" style={{ fontSize: 12 }}>{ligne.cond}</Text>}</> },
    {
        title: "Qté servie", dataIndex: "qte_servie", key: "qte_servie", align: "center", width: 100,
        render: (value, ligne) => {
            if (!value) return <Text type="secondary">0</Text>;
            return <Tag color={value >= ligne.qte ? "success" : "warning"} style={{ marginInlineEnd: 0 }}>{value}</Tag>;
        },
    },
];

const COLONNES_ANALYSE = [
    colonneLibelle("Analyse"),
    colonneTexte("Résultat", "resultat"),
    {
        title: "Valeurs de référence", key: "reference", width: 160,
        render: (ligne) => (ligne.val_min || ligne.val_max)
            ? <Text type="secondary">{ligne.val_min ?? "?"} – {ligne.val_max ?? "?"}</Text>
            : <Text type="secondary">-</Text>,
    },
    colonneTexte("Observation", "observation"),
];

const COLONNES_ACTE = [
    colonneLibelle("Examen / acte"),
    colonneTexte("Résultat", "resultat"),
    colonneTexte("Observation", "observation"),
];

// Types de prescriptions : libellé, icône, document imprimable, colonnes, résultat en PDF joint
export const TYPES_PRESCRIPTION = [
    { code: codesPrescriptions.ORD, prefixe: "ORD", label: "Ordonnances", libelle: "Ordonnance", icon: <MedicineBoxOutlined />, print: "ordonnance", colonnes: COLONNES_ORDONNANCE, statuts: ["Servie", "Non servie"] },
    { code: codesPrescriptions.ANA, prefixe: "ANA", label: "Analyses", libelle: "Analyse", icon: <ExperimentOutlined />, print: "analyse", colonnes: COLONNES_ANALYSE, statuts: ["Réalisée", "En attente"], avecResultat: true },
    { code: codesPrescriptions.IMG, prefixe: "IMG", label: "Imageries", libelle: "Imagerie", icon: <FileSearchOutlined />, print: "imagerie", colonnes: COLONNES_ACTE, statuts: ["Réalisée", "En attente"], avecResultat: true },
    { code: codesPrescriptions.INF, prefixe: "INF", label: "Soins infirmiers", libelle: "Soins infirmiers", icon: <SolutionOutlined />, colonnes: COLONNES_ACTE, statuts: ["Réalisé", "En attente"] },
];

export const getTypePrescription = (prescription) =>
    TYPES_PRESCRIPTION.find((type) => type.code === prescription?.codepresc) ||
    TYPES_PRESCRIPTION.find((type) => type.prefixe === (prescription?.code || prescription?.numpresc?.slice(0, 3)));

export const isPrescriptionRealisee = (prescription) => prescription?.isdone === "Oui";

// Statut de la prescription, avec qui / quand au survol
export const StatutPrescription = ({ prescription, type = getTypePrescription(prescription) }) => {
    const statuts = type?.statuts || ["Réalisée", "En attente"];
    if (!isPrescriptionRealisee(prescription)) {
        return <Tag icon={<ClockCircleOutlined />} color="warning" style={{ marginInlineEnd: 0 }}>{statuts[1]}</Tag>;
    }
    return <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginInlineEnd: 0 }}>{statuts[0]}</Tag>;
};

// Tuile d'un acte (analyse, imagerie, soin) : le résultat, les valeurs de référence
// et l'observation ne sont affichés que s'ils sont renseignés
const TuileActe = ({ ligne, index, icon }) => {
    const { token } = theme.useToken();
    const inactif = ligne.exclus || ligne.dispo === "Non";
    const aReference = ligne.val_min || ligne.val_max;
    return (
        <div
            style={{
                height: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderLeft: `3px solid ${inactif ? token.colorTextQuaternary : ligne.resultat ? token.colorSuccess : token.colorPrimary}`,
                background: inactif ? token.colorFillAlter : token.colorBgContainer,
            }}
        >
            <Flex align="flex-start" gap={10}>
                <Avatar size={26} style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary, flexShrink: 0, fontSize: 12 }}>
                    {index + 1}
                </Avatar>
                <div style={{ minWidth: 0, flex: 1, lineHeight: 1.4 }}>
                    <Flex align="center" gap={6} wrap>
                        <Text strong={!inactif} delete={!!ligne.exclus} type={inactif ? "secondary" : undefined}>{ligne.libacte}</Text>
                        {ligne.exclus && <Tag style={{ marginInlineEnd: 0 }}>Exclu</Tag>}
                        {ligne.dispo === "Non" && <Tag color="error" style={{ marginInlineEnd: 0 }}>Indisponible</Tag>}
                    </Flex>
                    {ligne.resultat && (
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Résultat : </Text>
                            <Text strong style={{ color: token.colorSuccess }}>{ligne.resultat}</Text>
                            {aReference && <Text type="secondary" style={{ fontSize: 12 }}> (réf. {ligne.val_min ?? "?"} – {ligne.val_max ?? "?"})</Text>}
                        </div>
                    )}
                    {!ligne.resultat && aReference && (
                        <Text type="secondary" style={{ fontSize: 12 }}>Valeurs de référence : {ligne.val_min ?? "?"} – {ligne.val_max ?? "?"}</Text>
                    )}
                    {ligne.observation && (
                        <div><Text type="secondary" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{icon} {ligne.observation}</Text></div>
                    )}
                </div>
            </Flex>
        </div>
    );
};

// Lignes d'une prescription : tableau pour les médicaments, tuiles pour les actes
export const LignesPrescription = ({ prescription, type = getTypePrescription(prescription) }) => {
    const lignes = prescription?.listActes || [];
    if (!lignes.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune ligne enregistrée" style={{ margin: 8 }} />;
    if (type?.prefixe !== "ORD") {
        return (
            <Row gutter={[8, 8]}>
                {lignes.map((ligne, index) => (
                    <Col key={`${ligne.codeacte}-${index}`} xs={24} sm={12} lg={lignes.length > 4 ? 8 : 12}>
                        <TuileActe ligne={ligne} index={index} icon={<SolutionOutlined />} />
                    </Col>
                ))}
            </Row>
        );
    }
    return (
        <Table
            size="small"
            pagination={false}
            rowKey={(ligne, index) => `${ligne.codeacte}-${index}`}
            dataSource={lignes}
            columns={type?.colonnes || COLONNES_ACTE}
            scroll={{ x: "max-content" }}
        />
    );
};

// Boutons d'impression et de consultation du résultat joint
export const ActionsPrescription = ({ prescription, type = getTypePrescription(prescription), size }) => {
    const { token } = theme.useToken();
    return (
        <Space size={8} wrap>
            {type?.avecResultat && prescription?.resultat && (
                <Button size={size} icon={<FilePdfOutlined style={{ color: token.colorError }} />}
                    onClick={() => printPDF(endpoints.files.GET_RESULTAT(prescription.numpresc))}>
                    Résultat
                </Button>
            )}
            {/* Une prescription déjà servie / réalisée ne se réimprime pas */}
            {type?.print && !isPrescriptionRealisee(prescription) && (
                <Dropdown
                    trigger={["click"]}
                    menu={{
                        items: [
                            { key: "a4", label: `Imprimer (${type.libelle.toLowerCase()})`, onClick: () => printPDF(`/api/Print/smed/Prescription/${prescription.numpresc}/${type.print}`) },
                            { key: "ticket", label: "Format ticket", onClick: () => printPDF(`/api/Print/smed/Prescription/${prescription.numpresc}/${type.print}_Ticket`) },
                        ],
                    }}
                >
                    <Button size={size} icon={<PrinterOutlined />}>Imprimer</Button>
                </Dropdown>
            )}
        </Space>
    );
};

const InfoBlock = ({ icon, label, value }) => {
    const { token } = theme.useToken();
    return (
        <Flex align="center" gap={10} style={{ minWidth: 170 }}>
            <Avatar size={34} icon={icon} style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary, flexShrink: 0 }} />
            <div style={{ lineHeight: 1.3 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
                <div><Text strong>{value || "—"}</Text></div>
            </div>
        </Flex>
    );
};

// Aperçu complet d'une prescription (contenu de modale), en lecture seule
function PrescriptionApercu({ prescription, onClose }) {
    const { token } = theme.useToken();
    const type = getTypePrescription(prescription);
    const realisee = isPrescriptionRealisee(prescription);
    const nbLignes = prescription?.listActes?.length || 0;

    return (
        <div>
            {/* Bandeau d'informations */}
            <Flex
                justify="space-between"
                align="center"
                wrap
                gap={16}
                style={{ padding: "12px 16px", borderRadius: 10, background: token.colorFillAlter, marginBottom: 16 }}
            >
                <InfoBlock icon={<UserOutlined />} label="Patient" value={prescription?.patient} />
                <InfoBlock icon={<SolutionOutlined />} label="Prescripteur" value={prescription?.prescripteur} />
                <InfoBlock
                    icon={<CalendarOutlined />}
                    label="Prescrite le"
                    value={prescription?.datepresc ? dayjs(prescription.datepresc).format("DD/MM/YYYY à HH:mm") : null}
                />
                <Space direction="vertical" size={4} align="end">
                    <Space size={6}>
                        {prescription?.type_prescription && (
                            <Tag color={prescription.type_prescription === "Externe" ? "purple" : "blue"} style={{ marginInlineEnd: 0 }}>
                                {prescription.type_prescription}
                            </Tag>
                        )}
                        <StatutPrescription prescription={prescription} type={type} />
                    </Space>
                    {prescription?.numcons && <Text type="secondary" style={{ fontSize: 12 }}>Consultation {prescription.numcons}</Text>}
                </Space>
            </Flex>

            {realisee && (prescription?.effectue_par || prescription?.date_effet) && (
                <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                    <Text type="secondary">
                        {type?.statuts?.[0] || "Réalisée"}
                        {prescription.date_effet ? ` le ${dayjs(prescription.date_effet).format("DD/MM/YYYY à HH:mm")}` : ""}
                        {prescription.effectue_par ? ` par ${prescription.effectue_par}` : ""}
                    </Text>
                </Flex>
            )}

            {prescription?.diagnostic && (
                <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">Diagnostic / renseignements cliniques : </Text>
                    <Text>{prescription.diagnostic}</Text>
                </div>
            )}

            <Flex align="center" gap={8} style={{ marginBottom: 8, color: token.colorPrimary, fontWeight: 600 }}>
                {type?.icon}
                <span>{type?.prefixe === "ORD" ? "Médicaments" : "Actes prescrits"}</span>
                <Tag style={{ marginInlineEnd: 0 }}>{nbLignes}</Tag>
            </Flex>

            <LignesPrescription prescription={prescription} type={type} />

            {/* Barre d'actions */}
            <Flex
                justify="space-between"
                align="center"
                wrap
                gap={8}
                style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${token.colorBorderSecondary}` }}
            >
                <ActionsPrescription prescription={prescription} type={type} />
                {onClose && <Button type="primary" onClick={onClose}>Fermer</Button>}
            </Flex>
        </div>
    );
}

export default PrescriptionApercu

import React from 'react'
import { Alert, Badge, Button, Card, Empty, Flex, Skeleton, Space, Tabs, Tag, Tooltip, Typography, theme } from 'antd'
import { MedicineBoxOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import {
    ActionsPrescription, LignesPrescription, StatutPrescription, TYPES_PRESCRIPTION, getTypePrescription, isPrescriptionRealisee,
} from '../PrescriptionApercu/PrescriptionApercu';

const { Text } = Typography;

const PrescriptionCard = ({ prescription, type }) => {
    const { token } = theme.useToken();
    const realisee = isPrescriptionRealisee(prescription);
    const infosRealisation = [
        prescription.date_effet && `Le ${dayjs(prescription.date_effet).format("DD/MM/YYYY à HH:mm")}`,
        prescription.effectue_par && `par ${prescription.effectue_par}`,
    ].filter(Boolean).join(" ");

    return (
        <Card
            size="small"
            style={{ marginBottom: 12, borderLeft: `3px solid ${realisee ? token.colorSuccess : token.colorWarning}` }}
            title={
                <Flex align="center" gap={8} wrap>
                    <Text strong>{prescription.numpresc}</Text>
                    <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                        {prescription.datepresc ? dayjs(prescription.datepresc).format("DD/MM/YYYY HH:mm") : ""}
                        {prescription.prescripteur ? ` · ${prescription.prescripteur}` : ""}
                    </Text>
                    {prescription.type_prescription && (
                        <Tag color={prescription.type_prescription === "Externe" ? "purple" : "blue"} style={{ marginInlineEnd: 0 }}>
                            {prescription.type_prescription}
                        </Tag>
                    )}
                </Flex>
            }
            extra={
                <Space size={8}>
                    <Tooltip title={realisee ? infosRealisation : ""}>
                        <span><StatutPrescription prescription={prescription} type={type} /></span>
                    </Tooltip>
                    <ActionsPrescription prescription={prescription} type={type} size="small" />
                </Space>
            }
            // Le tableau des médicaments occupe toute la carte, les tuiles d'actes gardent une marge
            styles={{ body: { padding: type?.prefixe === "ORD" && prescription.listActes?.length ? 0 : 12 } }}
        >
            <LignesPrescription prescription={prescription} type={type} />
        </Card>
    );
};

// Prescriptions (ordonnances, analyses, imageries, soins) émises lors d'une consultation
function PrescriptionsConsultation({ numCons }) {
    const { token: { colorPrimary } } = theme.useToken();
    const { data, isLoading, error, onRefresh } = useFetch(numCons ? endpoints.prescriptions.LIST_BY_CONSULTATION(numCons) : null);
    const prescriptions = Array.isArray(data) ? data : [];

    const groupes = TYPES_PRESCRIPTION
        .map((type) => ({ type, liste: prescriptions.filter((p) => getTypePrescription(p) === type) }))
        .filter(({ liste }) => liste.length);

    const contenu = () => {
        if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
        if (error) {
            return (
                <Alert
                    type="warning"
                    showIcon
                    message="Impossible de charger les prescriptions de la consultation"
                    description="Vérifiez que l'API est à jour et démarrée, puis actualisez."
                />
            );
        }
        if (!groupes.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune prescription pour cette consultation" style={{ margin: 8 }} />;
        return (
            <Tabs
                size="small"
                items={groupes.map(({ type, liste }) => ({
                    key: type.prefixe,
                    label: (
                        <Space size={6}>
                            {type.icon}
                            <span>{type.label}</span>
                            <Badge count={liste.length} color="gray" size="small" />
                        </Space>
                    ),
                    children: liste.map((prescription) => (
                        <PrescriptionCard key={prescription.numpresc} prescription={prescription} type={type} />
                    )),
                }))}
            />
        );
    };

    return (
        <Card
            size="small"
            title={<Space style={{ color: colorPrimary }}><MedicineBoxOutlined /><span>Prescriptions de la consultation</span>{!isLoading && !error && <Text type="secondary" style={{ fontWeight: 400 }}>({prescriptions.length})</Text>}</Space>}
            extra={<Tooltip title="Actualiser"><Button type="text" size="small" icon={<ReloadOutlined />} onClick={onRefresh} /></Tooltip>}
        >
            {contenu()}
        </Card>
    );
}

export default PrescriptionsConsultation

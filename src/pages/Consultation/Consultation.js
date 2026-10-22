import { Modal, Card, Row, Col, Form, Input, InputNumber, Typography, Select, Button, DatePicker, message, Flex, Space, Dropdown, Tooltip, Avatar, Tag, Skeleton, theme } from 'antd'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { getActions, putActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import useFetch from '../../utils/hooks/useFetch';
import GestionPathologies from '../../components/specific/GestionPathologies/GestionPathologies';
import GestionMotifs from '../../components/specific/GestionMotifs/GestionMotifs';
import GestionRegions from '../../components/specific/GestionRegions/GestionRegions';
import {
    CalendarOutlined, CheckCircleOutlined, DashboardOutlined, EditOutlined, FileTextOutlined,
    HeartOutlined, MedicineBoxOutlined, PrinterOutlined, SaveOutlined, SendOutlined, SolutionOutlined,
} from '@ant-design/icons';
import BackButton from '../../components/common/BackButton/BackButton';
import ReloadButton from '../../components/common/ReloadButton/ReloadButton';
import { deletePopup, printPDF } from '../../utils/helpers';
import { codeServices, codesPrescriptions, typesVisiteMedicaleOptions, LOGO_BROWN } from '../../constants/app.constants';
const { Title, Text } = Typography;
const { TextArea } = Input;

dayjs.locale('fr')

const SEUIL_FIEVRE = 37.5;
const DATE_FORMAT = "dddd DD MMMM YYYY";

const toDayjs = (value, defaultValue = null) => (value ? dayjs(value) : defaultValue);

const getInitCons = (initCons) => ({
    ...initCons,
    datecons: toDayjs(initCons?.datecons),
    date_rv: toDayjs(initCons?.date_rv, dayjs()),
    debut_rm: toDayjs(initCons?.debut_rm, dayjs()),
    fin_rm: toDayjs(initCons?.fin_rm, dayjs()),
    date_ref: toDayjs(initCons?.date_ref),
});

// Interprétation de l'IMC (classification OMS)
const getImcCategory = (imc) => {
    if (imc < 18.5) return { label: "Insuffisance pondérale (maigreur)", type: "warning" };
    if (imc < 25) return { label: "Corpulence normale", type: "success" };
    if (imc < 30) return { label: "Surpoids", type: "warning" };
    if (imc < 35) return { label: "Obésité modérée", type: "error" };
    if (imc < 40) return { label: "Obésité sévère", type: "error" };
    return { label: "Obésité morbide ou massive", type: "error" };
};

const computeImc = (poids, taille) =>
    poids > 0 && taille > 0 ? Number((poids / Math.pow(taille / 100, 2)).toFixed(2)) : null;

const SectionCard = ({ icon, title, extra, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Card
            size="small"
            title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>}
            extra={extra}
            style={{ marginBottom: 16 }}
        >
            {children}
        </Card>
    );
};

// Select d'un référentiel avec bouton d'accès à sa gestion
const ReferentielSelect = ({ name, label, list, valueKey, labelKey, loading, onManage, manageTitle }) => (
    <Form.Item label={label}>
        <Flex gap={6}>
            <Form.Item name={name} noStyle>
                <Select
                    showSearch
                    allowClear
                    placeholder={label}
                    loading={loading}
                    optionFilterProp="label"
                    options={(list || []).map((item) => ({ value: item[valueKey], label: item[labelKey] }))}
                />
            </Form.Item>
            <Tooltip title={manageTitle}>
                <Button icon={<EditOutlined />} onClick={onManage} />
            </Tooltip>
        </Flex>
    </Form.Item>
);

function Consultation() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { state } = useLocation();
    const { token } = theme.useToken();
    const { colorPrimary, colorBgContainer, colorBorderSecondary, colorFillAlter } = token;
    // Couleurs de l'encart IMC selon la catégorie
    const imcColors = {
        success: { bg: token.colorSuccessBg, border: token.colorSuccessBorder, text: token.colorSuccessText },
        warning: { bg: token.colorWarningBg, border: token.colorWarningBorder, text: token.colorWarningText },
        error: { bg: token.colorErrorBg, border: token.colorErrorBorder, text: token.colorErrorText },
    };

    const currentPatient = state?.currentPatient;
    const numRV = state?.numRV;

    const [initConsultation, setInitConsultation] = useState(null);
    const [consultationDataLoading, setConsultationDataLoading] = useState(false)
    const [refetch, setRefetch] = useState(null)
    const [loading, setLoading] = useState(false);
    // Paramètre dont la fenêtre de gestion est ouverte : "MOTIF", "REGION", "PATHOLOGIE" ou null
    const [gestionOuverte, setGestionOuverte] = useState(null);

    const refreshConsultation = () => {
        setRefetch(Date.now())
    }

    useEffect(() => {
        setConsultationDataLoading(true)
        getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${numRV}`)
            .then((response) => {
                if (response?.data) {
                    const data = getInitCons(response.data);
                    setInitConsultation(data)
                    form.setFieldsValue(data)
                }
            })
            .finally(() => {
                setConsultationDataLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch])

    const { data: pathologiesList, isLoading: pathologiesLoading, onRefresh: pathologiesRefreshList } = useFetch(endpoints.pathologie.LIST);
    const pathologies = (pathologiesList || []).filter((pathologie) => pathologie.code_spe === codeServices.MEDICAL);

    const { data: motifsList, isLoading: motifsLoading, onRefresh: motifsRefreshList } = useFetch(endpoints.motifs.LIST);
    const motifs = (motifsList || []).filter((motif) => motif.code_spe === codeServices.MEDICAL);

    const { data: regions, isLoading: regionsLoading, onRefresh: regionsRefreshList } = useFetch(endpoints.regions.LIST);

    const { data: valeursVisiteMedicales, isLoading: valeursVisiteMedicalesLoading } = useFetch(endpoints.consultations.LIST_VALEURS_VISITES_MEDICALES);

    // Valeurs suivies en direct
    const codeMotif = Form.useWatch("code_motifcons", form);
    const temp = Form.useWatch("temp", form);
    const poids = Form.useWatch("poids", form);
    const taille = Form.useWatch("taille", form);

    const motifSelected = motifs.find((motif) => motif.code_motifcons === codeMotif);
    const isVisiteMedicale = motifSelected?.libelle_motifcons?.trim().toLowerCase().startsWith("visite");
    const imc = computeImc(poids, taille);
    const imcCategory = imc ? getImcCategory(imc) : null;
    const hasFievre = temp > SEUIL_FIEVRE;
    const isConsultationOuverte = initConsultation?.medecin !== null && initConsultation?.medecin !== undefined;

    useEffect(() => {
        form.setFieldValue("imc", imc);
    }, [imc, form]);

    const save = () => {
        setLoading(true);
        form
            .validateFields()
            .then((values) => {
                const payload = {
                    ...initConsultation,
                    ...values,
                    imc,
                    datecons: values.datecons ? dayjs(values.datecons).toISOString() : null,
                    date_rv: values.date_rv ? dayjs(values.date_rv).toISOString() : null,
                    debut_rm: values.debut_rm ? dayjs(values.debut_rm).toISOString() : null,
                    fin_rm: values.fin_rm ? dayjs(values.fin_rm).toISOString() : null,
                    date_ref: values.date_ref ? dayjs(values.date_ref).toISOString() : null,
                };
                putActions(endpoints.consultations.UPDATE, payload)
                    .then((response) => {
                        if (response?.data?.Updated) {
                            message.success("Consultation enregistrée avec succès");
                            refreshConsultation()
                        }
                        else {
                            message.error("Oups... quelque chose s'est mal passé, veuillez réessayer");
                        }
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            })
            .catch((info) => {
                setLoading(false);
                console.log('Validate Failed:', info);
            })
    }

    const validFinalConsultation = () => {
        deletePopup()
            .then((result) => {
                if (result.isConfirmed) {
                    console.log("final consult")
                }
            })
    }

    const prescrire = (codepresc, route, withDiagnostic) => {
        // nettoyer la prescription en mémoire
        sessionStorage.removeItem("editPrescription");
        sessionStorage.setItem("prescription", JSON.stringify({
            codepresc,
            numcons: initConsultation.numcons,
            medecin: initConsultation.medecin,
            ...(withDiagnostic ? { diagnostic: form.getFieldValue("diagnostic") || initConsultation.diagnostic } : {}),
        }));
        navigate(`/espace-medical/patients/dossier/prescriptions/${route}`);
    }

    // Recalcule une date de fin à partir d'une date de départ et d'un nombre de jours
    const onValuesChange = (changedValues, allValues) => {
        if ("nb_jours_rv" in changedValues || "datecons" in changedValues) {
            if (allValues.nb_jours_rv) {
                form.setFieldValue("date_rv", dayjs(allValues.datecons || undefined).add(allValues.nb_jours_rv, "day"));
            }
        }
        if ("nb_jours_rm" in changedValues || "debut_rm" in changedValues) {
            if (allValues.nb_jours_rm && allValues.debut_rm) {
                // Le premier jour de repos compte : n jours => fin = début + (n - 1)
                form.setFieldValue("fin_rm", dayjs(allValues.debut_rm).add(allValues.nb_jours_rm - 1, "day"));
            }
        }
        if (changedValues.code_motifcons) {
            form.setFieldValue("motif_ref", changedValues.code_motifcons)
        }
    }

    if (initConsultation === null) {
        return <Card><Skeleton active avatar paragraph={{ rows: 10 }} /></Card>;
    }

    return (
        <Form
            layout='vertical'
            form={form}
            name="consultation_form"
            initialValues={initConsultation}
            onValuesChange={onValuesChange}
            onFinish={save}
        >
            {/* En-tête : patient + actions */}
            <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }} loading={consultationDataLoading}>
                <Flex justify="space-between" align="center" wrap gap={16}>
                    <Flex align="center" gap={16} wrap>
                        <BackButton />
                        <Avatar size={56} style={{ backgroundColor: colorPrimary, fontSize: 20, fontWeight: 600 }}>
                            {`${currentPatient?.prenom_patient?.[0] || ""}${currentPatient?.nom_patient?.[0] || ""}`.toUpperCase()}
                        </Avatar>
                        <div>
                            <Space size={8} wrap>
                                <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: colorPrimary }}>
                                    <MedicineBoxOutlined /> Consultation médicale
                                </Text>
                                <Tag color="processing">{initConsultation.numcons}</Tag>
                                {!isConsultationOuverte && <Tag color="default">Non démarrée</Tag>}
                            </Space>
                            <Title level={4} style={{ margin: 0, color: LOGO_BROWN }}>
                                {currentPatient?.prenom_patient} {currentPatient?.nom_patient}
                            </Title>
                            <Space size={12} wrap>
                                <Text strong>N° {currentPatient?.num_patient}</Text>
                                {initConsultation.datecons && (
                                    <Text type="secondary"><CalendarOutlined /> {dayjs(initConsultation.datecons).format("DD/MM/YYYY HH:mm")}</Text>
                                )}
                                {initConsultation.medecin && <Text type="secondary">Dr {initConsultation.medecin.replace(/^Dr\.?\s*/i, "")}</Text>}
                            </Space>
                        </div>
                    </Flex>

                    <Space wrap>
                        <ReloadButton onRefresh={refreshConsultation} />
                        <Dropdown
                            disabled={!isConsultationOuverte}
                            trigger={['click']}
                            menu={{
                                items: [
                                    { key: '1', label: "Certificat médical", onClick: () => printPDF(`/api/Print/smed/Consultation/${initConsultation.numcons}/certificat`) },
                                    { key: '2', label: "Bulletin de visite", disabled: true },
                                    { key: '3', label: "Certificat d'aptitude", disabled: true },
                                ]
                            }}
                        >
                            <Button icon={<PrinterOutlined />}>Imprimer</Button>
                        </Dropdown>
                        <Dropdown
                            disabled={!isConsultationOuverte}
                            trigger={['click']}
                            menu={{
                                items: [
                                    { key: '0', label: "Ordonnance", onClick: () => prescrire(codesPrescriptions.ORD, "ordonnance") },
                                    { key: '1', label: "Analyse", onClick: () => prescrire(codesPrescriptions.ANA, "analyse", true) },
                                    { key: '2', label: "Imagerie", onClick: () => prescrire(codesPrescriptions.IMG, "imagerie", true) },
                                    { key: '4', label: "Infirmerie", onClick: () => prescrire(codesPrescriptions.INF, "infirmerie") },
                                ]
                            }}
                        >
                            <Button type="primary" icon={<FileTextOutlined />}>Prescrire</Button>
                        </Dropdown>
                        <Button danger icon={<CheckCircleOutlined />} onClick={validFinalConsultation} disabled={!isConsultationOuverte}>
                            Clôturer
                        </Button>
                    </Space>
                </Flex>
            </Card>

            <Row gutter={16}>
                {/* Colonne principale : démarche clinique */}
                <Col xs={24} xl={16}>
                    <SectionCard icon={<SolutionOutlined />} title="Motif et orientation">
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <ReferentielSelect
                                    name="code_motifcons" label="Motif de consultation" list={motifs}
                                    valueKey="code_motifcons" labelKey="libelle_motifcons" loading={motifsLoading}
                                    onManage={() => setGestionOuverte("MOTIF")} manageTitle="Gérer les motifs"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <ReferentielSelect
                                    name="code_region" label="Région concernée" list={regions}
                                    valueKey="code_region" labelKey="libelle_region" loading={regionsLoading}
                                    onManage={() => setGestionOuverte("REGION")} manageTitle="Gérer les régions"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <ReferentielSelect
                                    name="code_patho" label="Pathologie" list={pathologies}
                                    valueKey="code_patho" labelKey="libelle_patho" loading={pathologiesLoading}
                                    onManage={() => setGestionOuverte("PATHOLOGIE")} manageTitle="Gérer les pathologies"
                                />
                            </Col>
                        </Row>

                        {isVisiteMedicale && (
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Type de visite médicale" name="visite">
                                        <Select placeholder="Sélectionner" options={typesVisiteMedicaleOptions} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Résultat de la visite médicale" name="visite">
                                        <Select
                                            placeholder="Sélectionner"
                                            loading={valeursVisiteMedicalesLoading}
                                            options={(valeursVisiteMedicales || []).map((item) => ({ value: item.item, label: item.valeur }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </SectionCard>

                    <SectionCard icon={<FileTextOutlined />} title="Séance">
                        <Form.Item label="Interrogatoire" name="resultat">
                            <TextArea autoSize={{ minRows: 3, maxRows: 10 }} placeholder="Plaintes, histoire de la maladie, antécédents évoqués..." />
                        </Form.Item>
                        <Form.Item label="Examen physique" name="examen">
                            <TextArea autoSize={{ minRows: 3, maxRows: 10 }} placeholder="Constatations de l'examen clinique" />
                        </Form.Item>
                        <Form.Item label={<Text strong>Diagnostic</Text>} name="diagnostic" style={{ marginBottom: 0 }}>
                            <TextArea autoSize={{ minRows: 2, maxRows: 8 }} placeholder="Diagnostic retenu" />
                        </Form.Item>
                    </SectionCard>

                    <SectionCard icon={<SendOutlined />} title="Référencement">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="structure_ref" label="Structure médicale">
                                    <Input placeholder="Structure vers laquelle le patient est orienté" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="date_ref" label="Date">
                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Date du référencement" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="motif_ref" label="Motif" style={{ marginBottom: 0 }}>
                                    <Input placeholder="Motif du référencement" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="moyen_transport_ref" label="Moyen de transport" style={{ marginBottom: 0 }}>
                                    <Select
                                        allowClear
                                        placeholder="Choisir"
                                        options={[
                                            { value: "ambulance", label: "Ambulance" },
                                            { value: "personnel", label: "Personnel" },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </SectionCard>
                </Col>

                {/* Colonne latérale : constantes et suites */}
                <Col xs={24} xl={8}>
                    <SectionCard icon={<HeartOutlined />} title="Données cliniques">
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="Tension" name="tension">
                                    <Input placeholder="12/8" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Pouls" name="pouls" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="bpm" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={<Space size={6}>Température {hasFievre && <Tag color="error" style={{ marginInlineEnd: 0 }}>Fièvre</Tag>}</Space>}
                                    name="temp"
                                    rules={[{ required: true, message: 'Champ obligatoire' }]}
                                >
                                    <InputNumber min={0} step={0.1} style={{ width: "100%" }} addonAfter="°C" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Poids" name="poids" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="kg" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Taille" name="taille" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="cm" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* IMC calculé automatiquement à partir du poids et de la taille */}
                        <Form.Item name="imc" hidden><InputNumber /></Form.Item>
                        <Flex
                            align="center"
                            justify="space-between"
                            gap={12}
                            style={{
                                padding: "12px 16px",
                                borderRadius: 10,
                                background: imcCategory ? imcColors[imcCategory.type].bg : colorFillAlter,
                                border: `1px solid ${imcCategory ? imcColors[imcCategory.type].border : colorBorderSecondary}`,
                            }}
                        >
                            <div>
                                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
                                    IMC
                                </Text>
                                <div style={{ lineHeight: 1.1 }}>
                                    <span style={{ fontSize: 28, fontWeight: 700, color: imcCategory ? imcColors[imcCategory.type].text : undefined }}>
                                        {imc ?? "—"}
                                    </span>
                                    <Text type="secondary" style={{ marginLeft: 6 }}>kg/m²</Text>
                                </div>
                            </div>
                            <Text strong style={{ textAlign: "right", color: imcCategory ? imcColors[imcCategory.type].text : undefined }}>
                                {imcCategory ? imcCategory.label : "Saisir le poids et la taille"}
                            </Text>
                        </Flex>
                    </SectionCard>

                    <SectionCard icon={<CalendarOutlined />} title="Prochain rendez-vous">
                        <Row gutter={12}>
                            <Col span={10}>
                                <Form.Item name="nb_jours_rv" label="Dans">
                                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="j" />
                                </Form.Item>
                            </Col>
                            <Col span={14}>
                                <Form.Item name="date_rv" label="Date du rendez-vous">
                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" allowClear={false} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.date_rv !== cur.date_rv}>
                            {({ getFieldValue }) => getFieldValue("date_rv") && (
                                <Text type="secondary" style={{ textTransform: "capitalize" }}>
                                    {dayjs(getFieldValue("date_rv")).format(DATE_FORMAT)}
                                </Text>
                            )}
                        </Form.Item>
                        {/* Date de consultation conservée pour le calcul du rendez-vous */}
                        <Form.Item name="datecons" hidden><DatePicker /></Form.Item>
                    </SectionCard>

                    <SectionCard icon={<DashboardOutlined />} title="Repos médical">
                        <Row gutter={12}>
                            <Col span={10}>
                                <Form.Item name="nb_jours_rm" label="Durée">
                                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="j" />
                                </Form.Item>
                            </Col>
                            <Col span={14}>
                                <Form.Item name="debut_rm" label="Début">
                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" allowClear={false} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="fin_rm" label="Fin" style={{ marginBottom: 0 }}>
                                    <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                    </SectionCard>
                </Col>
            </Row>

            {/* Barre d'actions toujours visible */}
            <Flex
                justify="flex-end"
                gap={8}
                style={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 10,
                    padding: "12px 16px",
                    background: colorBgContainer,
                    borderTop: `1px solid ${colorBorderSecondary}`,
                    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.06)",
                    borderRadius: 8,
                }}
            >
                <Button onClick={() => navigate(-1)}>Annuler</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                    Enregistrer la consultation
                </Button>
            </Flex>

            <Modal
                title={(gestionOuverte === "MOTIF" && "Motifs de consultation") || (gestionOuverte === "REGION" && "Régions concernées") || (gestionOuverte === "PATHOLOGIE" && "Pathologies")}
                open={gestionOuverte !== null}
                width={900}
                onCancel={() => setGestionOuverte(null)}
                footer={null}
                destroyOnClose
            >
                {gestionOuverte === "MOTIF" && <GestionMotifs data={motifs} isLoading={motifsLoading} onRefresh={motifsRefreshList} />}

                {gestionOuverte === "REGION" && <GestionRegions data={regions} isLoading={regionsLoading} onRefresh={regionsRefreshList} />}

                {gestionOuverte === "PATHOLOGIE" && <GestionPathologies data={pathologies} isLoading={pathologiesLoading} onRefresh={pathologiesRefreshList} />}
            </Modal>
        </Form>
    )
}


export default Consultation

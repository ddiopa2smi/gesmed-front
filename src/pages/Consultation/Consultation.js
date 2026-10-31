import { Alert, ConfigProvider, Modal, Card, Row, Col, Form, Input, InputNumber, Typography, Select, Button, DatePicker, message, Flex, Space, Dropdown, Tooltip, Avatar, Tag, Skeleton, theme } from 'antd'
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
    HeartOutlined, LockOutlined, MedicineBoxOutlined, PrinterOutlined, SaveOutlined, SendOutlined, SolutionOutlined,
} from '@ant-design/icons';
import BackButton from '../../components/common/BackButton/BackButton';
import ReloadButton from '../../components/common/ReloadButton/ReloadButton';
import { DELAI_CLOTURE_AUTO_HEURES, estClotureAuto, estConsultationCloturee, heuresAvantClotureAuto } from '../../utils/clotureConsultation';
import { codeServices, codesPrescriptions, typesVisiteMedicaleOptions, RESULTATS_VISITE_MEDICALE, LOGO_BROWN } from '../../constants/app.constants';
import { ouvrirCertificatMedical } from '../../components/specific/CertificatMedical/CertificatMedical';
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
    // Repos saisi sur le certificat : repris par le formulaire, pour ne pas être écrasé au prochain enregistrement
    const appliquerRepos = (repos) => form.setFieldsValue(repos);
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

    // Valeurs suivies en direct
    const codeMotif = Form.useWatch("code_motifcons", form);
    const temp = Form.useWatch("temp", form);
    const poids = Form.useWatch("poids", form);
    const taille = Form.useWatch("taille", form);

    const motifSelected = motifs.find((motif) => motif.code_motifcons === codeMotif);
    const isVisiteMedicale = motifSelected?.libelle_motifcons?.trim().toLowerCase().startsWith("visite");
    const isVisiteEmbauche = isVisiteMedicale && /embauche/i.test(motifSelected?.libelle_motifcons);
    const imc = computeImc(poids, taille);
    const imcCategory = imc ? getImcCategory(imc) : null;
    const hasFievre = temp > SEUIL_FIEVRE;
    const isConsultationOuverte = initConsultation?.medecin !== null && initConsultation?.medecin !== undefined;
    // Clôturée (par le médecin, ou automatiquement 24 h après) : lecture seule (contrôlé aussi par l'API)
    const estCloturee = estConsultationCloturee(initConsultation);
    const clotureAuto = estClotureAuto(initConsultation);
    const heuresRestantes = heuresAvantClotureAuto(initConsultation);

    useEffect(() => {
        form.setFieldValue("imc", imc);
    }, [imc, form]);

    // Motif "visite d'embauche" : le type de visite est connu, le médecin n'a plus qu'à saisir le résultat
    useEffect(() => {
        if (isVisiteEmbauche && !estCloturee && !form.getFieldValue("type_visite")) {
            form.setFieldValue("type_visite", "VISITE_EMBAUCHE");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisiteEmbauche]);

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
                    // Type et résultat de visite n'ont de sens que pour un motif "visite"
                    type_visite: isVisiteMedicale ? values.type_visite || null : null,
                    resultat_visite: isVisiteMedicale ? values.resultat_visite || null : null,
                };
                putActions(endpoints.consultations.UPDATE, payload)
                    .then((response) => {
                        if (response?.data?.Updated) {
                            message.success("Consultation enregistrée avec succès");
                            refreshConsultation()
                        }
                        else if (response?.data?.Cloturee) {
                            message.warning("Cette consultation est clôturée : elle ne peut plus être modifiée");
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

    // Clôture définitive : la consultation passe en lecture seule
    const validFinalConsultation = () => {
        // Une visite ne se clôture qu'avec son type et son résultat enregistrés
        if (isVisiteMedicale && !(initConsultation.type_visite && initConsultation.resultat_visite)) {
            form.validateFields(["type_visite", "resultat_visite"]).catch(() => {});
            message.warning("Renseignez et enregistrez le type et le résultat de la visite avant de clôturer");
            return;
        }
        Modal.confirm({
            title: "Clôturer la consultation ?",
            icon: <LockOutlined style={{ color: token.colorError }} />,
            content: "Une fois clôturée, la consultation ne pourra plus être modifiée. Pensez à enregistrer vos dernières saisies avant de clôturer.",
            okText: "Clôturer",
            okButtonProps: { danger: true },
            cancelText: "Annuler",
            onOk: () => putActions(endpoints.consultations.CLOTURER(initConsultation.numcons))
                .then((response) => {
                    if (response?.data?.Cloturee) {
                        message.success("Consultation clôturée");
                        refreshConsultation();
                    } else {
                        message.error("La consultation n'a pas pu être clôturée");
                    }
                }),
        });
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
            // Le type de visite dépend du motif : à ressaisir (ou présélectionné pour une embauche)
            form.setFieldValue("type_visite", undefined)
        }
    }

    // Double-clic sur une ligne de la fenêtre de gestion : remplit le champ et ferme la fenêtre.
    // setFieldValue ne déclenche pas onValuesChange : on l'appelle pour garder les mêmes effets qu'une saisie.
    const choisirDepuisGestion = (champ, valeur, libelle) => {
        form.setFieldValue(champ, valeur);
        onValuesChange({ [champ]: valeur }, form.getFieldsValue());
        setGestionOuverte(null);
        message.success(`« ${libelle} » sélectionné`);
    };

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
                                {estCloturee && <Tag icon={<LockOutlined />} color="success">{clotureAuto ? "Clôturée (auto)" : "Clôturée"}</Tag>}
                                {heuresRestantes !== null && (
                                    <Tooltip title={`Sans clôture de votre part, la consultation sera clôturée automatiquement ${DELAI_CLOTURE_AUTO_HEURES} h après sa date`}>
                                        <Tag color={heuresRestantes <= 2 ? "warning" : "default"}>Clôture auto dans {heuresRestantes} h</Tag>
                                    </Tooltip>
                                )}
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
                                    { key: '1', label: "Certificat médical", onClick: () => ouvrirCertificatMedical(initConsultation.numcons, appliquerRepos) },
                                    { key: '2', label: "Bulletin de visite", disabled: true },
                                    { key: '3', label: "Certificat d'aptitude", disabled: true },
                                ]
                            }}
                        >
                            <Button icon={<PrinterOutlined />}>Imprimer</Button>
                        </Dropdown>
                        <Dropdown
                            disabled={!isConsultationOuverte || estCloturee}
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
                        {!estCloturee && (
                            <Tooltip title={!isConsultationOuverte ? "Enregistrez d'abord la consultation" : "Clôture définitive : plus aucune modification possible"}>
                                <Button danger icon={<CheckCircleOutlined />} onClick={validFinalConsultation} disabled={!isConsultationOuverte}>
                                    Clôturer
                                </Button>
                            </Tooltip>
                        )}
                    </Space>
                </Flex>
                {estCloturee && (
                    <Alert
                        style={{ marginTop: 16 }}
                        type="success"
                        showIcon
                        icon={<LockOutlined />}
                        message={clotureAuto
                            ? `Consultation clôturée automatiquement (${DELAI_CLOTURE_AUTO_HEURES} h après la consultation) : elle est en lecture seule.`
                            : `Consultation clôturée${initConsultation.date_cloture ? ` le ${dayjs(initConsultation.date_cloture).format("DD/MM/YYYY à HH:mm")}` : ""} : elle est en lecture seule.`}
                    />
                )}
            </Card>

            {/* Consultation clôturée : champs de saisie désactivés (les boutons d'en-tête restent actifs) */}
            <ConfigProvider componentDisabled={estCloturee}>
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
                                    <Form.Item label="Type de visite médicale" name="type_visite" rules={[{ required: true, message: "Champ obligatoire" }]}>
                                        <Select placeholder="Sélectionner" options={typesVisiteMedicaleOptions} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    {/* Avis d'aptitude : liste fermée (contrôlée aussi côté API et en base) */}
                                    <Form.Item label="Résultat de la visite médicale" name="resultat_visite" rules={[{ required: true, message: "Champ obligatoire" }]}>
                                        <Select
                                            allowClear
                                            placeholder="Avis d'aptitude"
                                            optionLabelProp="label"
                                            popupMatchSelectWidth={false}
                                            options={RESULTATS_VISITE_MEDICALE.map((resultat) => ({
                                                value: resultat.value,
                                                // Valeur sélectionnée : pastille colorée bien lisible
                                                label: <Tag color={resultat.color} style={{ fontWeight: 600, marginInlineEnd: 0 }}>{resultat.label}</Tag>,
                                                description: resultat.description,
                                            }))}
                                            optionRender={(option) => (
                                                <div style={{ lineHeight: 1.35, padding: "2px 0" }}>
                                                    {option.data.label}
                                                    {/* Sous-titre en noir gras (couleur de texte du thème) pour une meilleure lisibilité */}
                                                    <div><Text strong style={{ fontSize: 12, color: token.colorText }}>{option.data.description}</Text></div>
                                                </div>
                                            )}
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
            </ConfigProvider>

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
                <Button onClick={() => navigate(-1)}>{estCloturee ? "Retour" : "Annuler"}</Button>
                <Button type="primary" htmlType="submit" icon={estCloturee ? <LockOutlined /> : <SaveOutlined />} loading={loading} disabled={estCloturee}>
                    {estCloturee ? "Consultation clôturée" : "Enregistrer la consultation"}
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
                {gestionOuverte === "MOTIF" && (
                    <GestionMotifs
                        data={motifs} isLoading={motifsLoading} onRefresh={motifsRefreshList} codeSpe={codeServices.MEDICAL}
                        onSelect={(record) => choisirDepuisGestion("code_motifcons", record.code_motifcons, record.libelle_motifcons)}
                    />
                )}

                {gestionOuverte === "REGION" && (
                    <GestionRegions
                        data={regions} isLoading={regionsLoading} onRefresh={regionsRefreshList}
                        onSelect={(record) => choisirDepuisGestion("code_region", record.code_region, record.libelle_region)}
                    />
                )}

                {gestionOuverte === "PATHOLOGIE" && (
                    <GestionPathologies
                        data={pathologies} isLoading={pathologiesLoading} onRefresh={pathologiesRefreshList} codeSpe={codeServices.MEDICAL}
                        onSelect={(record) => choisirDepuisGestion("code_patho", record.code_patho, record.libelle_patho)}
                    />
                )}
            </Modal>
        </Form>
    )
}


export default Consultation

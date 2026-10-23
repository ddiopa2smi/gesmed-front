import { useState } from "react";
import {
    Alert,
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Empty,
    Flex,
    Form,
    Input,
    Modal,
    Row,
    Space,
    Tag,
    Tooltip,
    Typography,
    message,
    theme,
} from "antd";
import {
    CloseOutlined,
    ExperimentOutlined,
    FileSearchOutlined,
    MedicineBoxOutlined,
    SaveOutlined,
    SearchOutlined,
    SettingOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import useFetch from "../../../utils/hooks/useFetch";
import { codesPrescriptions, LOGO_BROWN } from "../../../constants/app.constants";
import BackButton from "../../common/BackButton/BackButton";
import GestionActes from "../GestionActes/GestionActes";
import { TypePrescription } from "../../../utils/types/types.ts";

const { Title, Text } = Typography;

// Paramètres propres à chaque type de prescription
const CONFIG_PAR_TYPE = {
    [TypePrescription.ANALYSE]: {
        codepresc: codesPrescriptions.ANA,
        catalogueUrl: `${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ANA}`,
        singulier: "analyse", pluriel: "analyses", titre: "Prescription d'analyses",
        selectionTitre: "Analyses sélectionnées", categorieParDefaut: "Autres",
        icon: <ExperimentOutlined />, gestionActes: true, feminin: true,
    },
    [TypePrescription.IMAGERIE]: {
        codepresc: codesPrescriptions.IMG,
        catalogueUrl: `${endpoints.actes.LIST}?codeacte=${codesPrescriptions.IMG}`,
        singulier: "imagerie", pluriel: "imageries", titre: "Prescription d'imagerie",
        selectionTitre: "Imageries sélectionnées", categorieParDefaut: "Autres",
        icon: <FileSearchOutlined />, gestionActes: true, feminin: true,
    },
    [TypePrescription.INFIRMERIE]: {
        codepresc: codesPrescriptions.INF,
        catalogueUrl: endpoints.prescriptionsActes.LIST,
        singulier: "soin", pluriel: "soins", titre: "Prescription de soins infirmiers",
        selectionTitre: "Soins sélectionnés", categorieParDefaut: "Soins infirmiers",
        icon: <MedicineBoxOutlined />, gestionActes: false, feminin: false,
    },
};

const normalize = (value) =>
    String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Prescription({
    typePrescription
}) {
    const navigate = useNavigate();
    const { token: { colorPrimary, colorPrimaryBg, colorPrimaryBorder, colorFillAlter, colorBgContainer, colorBorderSecondary } } = theme.useToken();
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const prescription = JSON.parse(sessionStorage.getItem("prescription"));
    const editPrescription = JSON.parse(
        sessionStorage.getItem("editPrescription")
    );
    const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));
    const config = CONFIG_PAR_TYPE[typePrescription] || CONFIG_PAR_TYPE[TypePrescription.ANALYSE];
    const libelle = config;

    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [recherche, setRecherche] = useState("");
    const [categorieActive, setCategorieActive] = useState(null);
    const [isGestionActesModalOpen, setIsGestionActesModalOpen] = useState(false);

    const [actesPrescrites, setActesPrescrites] = useState(
        editPrescription?.listActes || []
    );
    const checkKeys = actesPrescrites.map((item) => item?.codeacte);

    const { data, onRefresh: refreshCatalogue } = useFetch(config.catalogueUrl);

    const save = () => {
        form
            .validateFields()
            .then((values) => {
                if (actesPrescrites.length === 0) {
                    message.warning(`Veuillez sélectionner les ${libelle.pluriel} à prescrire`);
                    return;
                }
                const payload = {
                    codepresc: editPrescription?.codepresc || config.codepresc,
                    datepresc:
                        editPrescription?.datepresc ||
                        new Date(values.datepresc).toISOString(),
                    listActes: actesPrescrites,
                    diagnostic: editPrescription?.diagnostic || values.diagnostic,
                    num_patient:
                        editPrescription?.num_patient || currentPatient.num_patient,
                    code_prescripteur: userConnected?.code_ipm,
                    numcons: editPrescription?.numcons || prescription?.numcons,
                    numpresc: editPrescription?.numpresc || null,
                };
                setLoading(true);
                postActions(endpoints.prescriptions.ADD, payload)
                    .then(() => {
                        message.success("Prescription enregistrée avec succès");
                        setActesPrescrites([]);
                        form.resetFields();
                        navigate(-1);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    // Catalogue regroupé par catégorie, filtré par la recherche et la catégorie choisie
    const catalogue = (data || []).filter((item) =>
        !recherche || normalize(`${item.libacte} ${item.codeacte} ${item.categorie || ""} ${item.description || ""}`).includes(normalize(recherche))
    );
    const categories = Object.entries(
        (data || []).reduce((acc, item) => {
            const categorie = item?.categorie || config.categorieParDefaut;
            acc[categorie] = (acc[categorie] || 0) + 1;
            return acc;
        }, {})
    ).sort(([a], [b]) => (a.toUpperCase() === "AUTRES" ? 1 : b.toUpperCase() === "AUTRES" ? -1 : a.localeCompare(b)));

    const groupes = Object.entries(
        catalogue.reduce((acc, item) => {
            const categorie = item?.categorie || config.categorieParDefaut;
            if (!categorieActive || categorie === categorieActive) {
                (acc[categorie] = acc[categorie] || []).push(item);
            }
            return acc;
        }, {})
    ).sort(([a], [b]) => (a.toUpperCase() === "AUTRES" ? 1 : b.toUpperCase() === "AUTRES" ? -1 : a.localeCompare(b)));

    const toggleActe = (acte, checked) => {
        setActesPrescrites((prev) =>
            checked
                ? (prev.some((item) => item.codeacte === acte.codeacte) ? prev : [...prev, acte])
                : prev.filter((item) => item.codeacte !== acte.codeacte)
        );
    };

    const nbSelectionnesDans = (items) => items.filter((item) => checkKeys.includes(item.codeacte)).length;

    const initials = `${currentPatient?.prenom_patient?.[0] || ""}${currentPatient?.nom_patient?.[0] || ""}`.toUpperCase();
    const isFemme = currentPatient?.sexe_patient === "FE";
    const diagnostic = editPrescription?.diagnostic || prescription?.diagnostic;

    return (
        <>
        <Form form={form} layout="vertical" onFinish={save}>
            {/* En-tête : patient + diagnostic */}
            <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
                <Flex justify="space-between" align="center" wrap gap={16}>
                    <Flex align="center" gap={16} wrap>
                        <BackButton />
                        <Avatar size={56} style={{ backgroundColor: isFemme ? "#eb2f96" : colorPrimary, fontSize: 20, fontWeight: 600 }}>
                            {initials}
                        </Avatar>
                        <div>
                            <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: colorPrimary }}>
                                {libelle.icon} {libelle.titre}
                            </Text>
                            <Title level={4} style={{ margin: 0, color: LOGO_BROWN }}>
                                {currentPatient?.prenom_patient} {currentPatient?.nom_patient}
                            </Title>
                            <Space size={8} wrap>
                                <Text strong>N° {currentPatient?.num_patient}</Text>
                                {currentPatient?.sexe_patient && (
                                    <Tag color={isFemme ? "magenta" : "blue"}>{isFemme ? "Féminin" : "Masculin"}</Tag>
                                )}
                                {currentPatient?.age_patient !== undefined && currentPatient?.age_patient !== null && (
                                    <Tag>{currentPatient.age_patient} ans</Tag>
                                )}
                                {currentPatient?.group_sanguin && <Tag color="red">Groupe {currentPatient.group_sanguin}</Tag>}
                                {(editPrescription?.numcons || prescription?.numcons) && (
                                    <Tag color="processing">Consultation {editPrescription?.numcons || prescription?.numcons}</Tag>
                                )}
                            </Space>
                        </div>
                    </Flex>
                    {/* Date de prescription : renseignée automatiquement */}
                    <Form.Item
                        name="datepresc"
                        rules={[{ required: true, message: "Champ obligatoire" }]}
                        initialValue={dayjs(new Date())}
                        hidden
                    >
                        <DatePicker />
                    </Form.Item>
                </Flex>
                <Alert
                    style={{ marginTop: 16 }}
                    type={diagnostic ? "info" : "warning"}
                    showIcon
                    message={
                        diagnostic
                            ? <span>Diagnostic : <Text strong>{diagnostic}</Text></span>
                            : "Aucun diagnostic renseigné pour cette consultation"
                    }
                />
            </Card>

            <Row gutter={16}>
                {/* Catalogue des actes */}
                <Col xs={24} xl={16}>
                    <Card
                        size="small"
                        title={<Space style={{ color: colorPrimary }}>{libelle.icon}<span>Choisir les {libelle.pluriel}</span></Space>}
                        extra={config.gestionActes && (
                            <Tooltip title="Gérer le catalogue des actes">
                                <Button icon={<SettingOutlined />} onClick={() => setIsGestionActesModalOpen(true)}>
                                    Gérer
                                </Button>
                            </Tooltip>
                        )}
                        style={{ marginBottom: 16 }}
                    >
                        <Input
                            size="large"
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder={`Rechercher ${libelle.feminin ? "une" : "un"} ${libelle.singulier} (nom, code${categories.length > 1 ? ", catégorie" : ""})`}
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            style={{ marginBottom: 12 }}
                        />

                        {/* Filtre rapide par catégorie (inutile s'il n'y a qu'une catégorie) */}
                        {categories.length > 1 && <Flex wrap gap={6} style={{ marginBottom: 16 }}>
                            <Tag.CheckableTag checked={!categorieActive} onChange={() => setCategorieActive(null)}>
                                Toutes ({(data || []).length})
                            </Tag.CheckableTag>
                            {categories.map(([categorie, count]) => (
                                <Tag.CheckableTag
                                    key={categorie}
                                    checked={categorieActive === categorie}
                                    onChange={(checked) => setCategorieActive(checked ? categorie : null)}
                                >
                                    {categorie} ({count})
                                </Tag.CheckableTag>
                            ))}
                        </Flex>}

                        {groupes.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun acte ne correspond à la recherche" />
                        ) : (
                            <Row gutter={[16, 16]}>
                                {groupes.map(([categorie, items]) => {
                                    const nbSelection = nbSelectionnesDans(items);
                                    return (
                                        <Col xs={24} md={groupes.length === 1 ? 24 : 12} xxl={groupes.length === 1 ? 24 : 8} key={categorie}>
                                            <div style={{ border: `1px solid ${colorBorderSecondary}`, borderRadius: 8, height: "100%" }}>
                                                <Flex
                                                    justify="space-between"
                                                    align="center"
                                                    style={{ padding: "8px 12px", background: colorFillAlter, borderRadius: "8px 8px 0 0" }}
                                                >
                                                    <Text strong style={{ fontSize: 12, letterSpacing: 0.3 }}>{categorie}</Text>
                                                    {nbSelection > 0 && <Tag color="processing" style={{ marginInlineEnd: 0 }}>{nbSelection}</Tag>}
                                                </Flex>
                                                <Flex vertical gap={2} style={{ padding: 8 }}>
                                                    {items.map((item) => {
                                                        const checked = checkKeys.includes(item.codeacte);
                                                        return (
                                                            <Checkbox
                                                                key={item.codeacte}
                                                                checked={checked}
                                                                onChange={(e) => toggleActe(item, e.target.checked)}
                                                                style={{
                                                                    padding: "4px 6px",
                                                                    borderRadius: 6,
                                                                    background: checked ? colorPrimaryBg : undefined,
                                                                    marginInlineStart: 0,
                                                                }}
                                                            >
                                                                <span style={{ fontWeight: checked ? 600 : 400 }}>{item.libacte}</span>
                                                                {item.description && !item.libacte?.includes(item.description) && (
                                                                    <div><Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text></div>
                                                                )}
                                                            </Checkbox>
                                                        );
                                                    })}
                                                </Flex>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Card>
                </Col>

                {/* Sélection en cours */}
                <Col xs={24} xl={8}>
                    <Card
                        size="small"
                        title={
                            <Space style={{ color: colorPrimary }}>
                                <span>{config.selectionTitre}</span>
                                <Tag color={actesPrescrites.length ? "processing" : "default"} style={{ marginInlineEnd: 0 }}>
                                    {actesPrescrites.length}
                                </Tag>
                            </Space>
                        }
                        extra={
                            <Button
                                size="small"
                                type="text"
                                danger
                                icon={<UndoOutlined />}
                                disabled={actesPrescrites.length === 0}
                                onClick={() => setActesPrescrites([])}
                            >
                                Tout retirer
                            </Button>
                        }
                        style={{ position: "sticky", top: 16, marginBottom: 16, borderColor: actesPrescrites.length ? colorPrimaryBorder : undefined }}
                    >
                        {actesPrescrites.length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={`Cochez les ${libelle.pluriel} dans le catalogue`}
                            />
                        ) : (
                            <Flex vertical gap={6}>
                                {actesPrescrites.map((acte) => (
                                    <Flex
                                        key={acte.codeacte}
                                        justify="space-between"
                                        align="center"
                                        style={{ padding: "6px 10px", borderRadius: 6, background: colorFillAlter }}
                                    >
                                        <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                                            <Text strong ellipsis={{ tooltip: acte.libacte }}>{acte.libacte}</Text>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {acte.codeacte}
                                                    {(acte.observation || acte.motifImagerie) && ` · ${acte.observation || acte.motifImagerie}`}
                                                </Text>
                                            </div>
                                        </div>
                                        <Tooltip title="Retirer">
                                            <Button size="small" type="text" danger icon={<CloseOutlined />} onClick={() => toggleActe(acte, false)} />
                                        </Tooltip>
                                    </Flex>
                                ))}
                            </Flex>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Barre d'actions */}
            <Flex
                justify="space-between"
                align="center"
                wrap
                gap={12}
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
                <Text>
                    <Text strong style={{ fontSize: 16 }}>{actesPrescrites.length}</Text>{" "}
                    {actesPrescrites.length > 1 ? libelle.pluriel : libelle.singulier}{" "}
                    {libelle.feminin ? "sélectionnée" : "sélectionné"}{actesPrescrites.length > 1 ? "s" : ""}
                </Text>
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        disabled={actesPrescrites.length === 0}
                    >
                        Enregistrer la prescription
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                        Annuler
                    </Button>
                </Space>
            </Flex>
        </Form>

            {/* Hors du formulaire principal pour ne pas déclencher l'enregistrement de la prescription */}
            <Modal
                title="Gestion des actes"
                style={{ top: 20 }}
                styles={{
                    body: {
                        overflow: "auto",
                        maxHeight: "80vh",
                    },
                }}
                width={1000}
                footer={null}
                open={isGestionActesModalOpen}
                onCancel={() => {
                    setIsGestionActesModalOpen(false);
                    // Le catalogue a pu changer (ajout, modification, suppression d'actes)
                    refreshCatalogue();
                }}
                destroyOnClose
            >
                <GestionActes
                    typePrescription={typePrescription}
                />
            </Modal>
        </>
    );
}

export default Prescription;

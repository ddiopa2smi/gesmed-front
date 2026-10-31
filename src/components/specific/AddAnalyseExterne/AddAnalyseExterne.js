import { useEffect, useState } from "react";
import {
    Avatar, Button, Card, Checkbox, Col, DatePicker, Empty, Flex, Form, Input, Modal, Row, Select,
    Space, Tag, Tooltip, Typography, message, theme,
} from "antd";
import {
    CloseOutlined, ExperimentOutlined, IdcardOutlined, SaveOutlined, SearchOutlined, SolutionOutlined, UndoOutlined, UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import useFetch from "../../../utils/hooks/useFetch";
import { getActions, postActions, putActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions } from "../../../constants/app.constants";
import AddPatient from "../AddPatient/AddPatient";

const { Text } = Typography;

// Codes spécialité (codespe) exclus pour les prescripteurs externes
const CODES_SPE_EXCLUS_PRESCRIPTEURS_EXT = ["06", "01", "04"];

const CATEGORIE_PAR_DEFAUT = "Autres";

const normalize = (value) =>
    String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const trierCategories = ([a], [b]) =>
    (a.toUpperCase() === "AUTRES" ? 1 : b.toUpperCase() === "AUTRES" ? -1 : a.localeCompare(b));

const SectionTitle = ({ icon, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return <Space style={{ color: colorPrimary }}>{icon}<span>{children}</span></Space>;
};

const AddAnalyseExterne = ({ setIsModalVisible, onRefresh, initialPatient }) => {
    const [form] = Form.useForm();
    const { token: { colorPrimary, colorPrimaryBg, colorPrimaryBorder, colorFillAlter, colorBorderSecondary } } = theme.useToken();
    const [formLoading, setFormLoading] = useState(false);
    const numPatient = Form.useWatch("patient", form);

    const { data: prescripteursExternes, isLoading: prescripteursLoading } = useFetch(endpoints.prescriptions.LIST_PRESCRIPTEURS_EXT);
    const { data: listAnalyses, isLoading: analysesLoading } = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ANA}`);

    const prescripteursFiltres = (prescripteursExternes || []).filter((item) => !CODES_SPE_EXCLUS_PRESCRIPTEURS_EXT.includes(item.codespe));

    // Analyses prescrites : { codeacte, libacte, qte, observation, tarif }
    const [analysesPrescrites, setAnalysesPrescrites] = useState([]);
    const codesSelectionnes = analysesPrescrites.map((item) => item.codeacte);

    const [recherche, setRecherche] = useState("");
    const [categorieActive, setCategorieActive] = useState(null);

    const [matriculeToSearch, setMatriculeToSearch] = useState(null);
    // Permet de relancer la recherche avec le même matricule
    const [rechercheMatriculeTick, setRechercheMatriculeTick] = useState(0);
    const [listBeneficiaires, setListBeneficiaires] = useState([]);
    const [listBeneficiairesLoading, setListBeneficiairesLoading] = useState(false);
    const [isAddPatientModalVisible, setIsAddPatientModalVisible] = useState(false);

    const lancerRechercheMatricule = (value) => {
        setMatriculeToSearch(value?.trim() || null);
        setRechercheMatriculeTick(Date.now());
    };

    // Appelé après création du patient depuis la modale AddPatient (cas participant IPM
    // sans patient GESMED correspondant) : on relit le patient créé et on l'affecte au champ.
    const applyCreatedPatient = (numPatient) => {
        getActions(endpoints.patients.GET_PATIENT(numPatient))
            .then((response) => {
                if (response?.data) {
                    const patient = response.data;
                    setListBeneficiaires([{
                        matribenef: numPatient,
                        nom: patient.nom_patient,
                        prenoms: patient.prenom_patient,
                    }]);
                    form.setFieldValue("patient", numPatient);
                }
            })
            .finally(() => {
                setIsAddPatientModalVisible(false);
            });
    };

    // Pré-remplissage direct du patient (ex: depuis la liste des rendez-vous, où le patient
    // est déjà connu/enregistré dans GESMED) : pas besoin de repasser par la recherche IPM.
    useEffect(() => {
        if (initialPatient?.num_patient) {
            setListBeneficiaires([{
                matribenef: initialPatient.num_patient,
                nom: initialPatient.nom_patient,
                prenoms: initialPatient.prenom_patient,
            }]);
            form.setFieldValue("patient", initialPatient.num_patient);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPatient]);

    useEffect(() => {
        const searchPatientByMatricule = (value) => {
            if (!value) {
                return;
            }
            setListBeneficiairesLoading(true);

            // Patient externe déjà enregistré dans GESMED (matricule préfixé "PAT") : recherche
            // directe par matricule via le service Patient, le matricule devient le num_patient.
            if (value.toUpperCase().startsWith("PAT")) {
                getActions(endpoints.patients.GET_PATIENT(value))
                    .then((response) => {
                        if (response?.data) {
                            const patient = response.data;
                            setListBeneficiaires([{
                                matribenef: value,
                                nom: patient.nom_patient,
                                prenoms: patient.prenom_patient,
                            }]);
                            form.setFieldValue("patient", value);
                        } else {
                            Swal.fire("Avertissement", "Patient introuvable");
                            setListBeneficiaires([]);
                            form.setFieldValue("patient", null);
                        }
                    })
                    .catch(() => {
                        Swal.fire("Avertissement", "Patient introuvable");
                        setListBeneficiaires([]);
                        form.setFieldValue("patient", null);
                    })
                    .finally(() => {
                        setListBeneficiairesLoading(false);
                    });
                return;
            }

            getActions(`/api/Participant/Patient/${value}`)
                .then((response) => {
                    if (response?.data?.numcont === "None") {
                        Swal.fire("Avertissement", "Participant introuvable");
                        setListBeneficiaires([]);
                    } else {
                        getActions(`/api/Benef/Gesmed/list/${response.data.numcont}`).then((res) => {
                            const data = res.data;

                            if (data.length === 0) {
                                Swal.fire("Avertissement", "Aucun bénéficiaire trouvé pour ce participant");
                                setListBeneficiaires([]);
                                form.setFieldValue("patient", null);
                                return;
                            }

                            setListBeneficiaires(data);
                            const firstBenef = data[0];

                            // Le bénéficiaire existe dans IPM, mais pas forcément encore comme
                            // patient GESMED (première visite) : vérifier via le service Patient.
                            getActions(endpoints.patients.GET_PATIENT(firstBenef.matribenef))
                                .then((patientResponse) => {
                                    if (patientResponse?.data) {
                                        form.setFieldValue("patient", firstBenef.matribenef);
                                    } else {
                                        form.setFieldValue("patient", null);
                                        Swal.fire({
                                            title: "Patient introuvable dans GESMED",
                                            text: `${firstBenef.prenoms} ${firstBenef.nom} existe dans IPM mais n'est pas encore enregistré comme patient. Voulez-vous l'enregistrer maintenant ?`,
                                            icon: "question",
                                            showCancelButton: true,
                                            confirmButtonText: "Enregistrer le patient",
                                            cancelButtonText: "Annuler",
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                setIsAddPatientModalVisible(true);
                                            }
                                        });
                                    }
                                });
                        });
                    }
                })
                .finally(() => {
                    setListBeneficiairesLoading(false);
                });
        };
        searchPatientByMatricule(matriculeToSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matriculeToSearch, rechercheMatriculeTick]);

    /* ---------------- Sélection des analyses ---------------- */

    const toggleAnalyse = (analyse, checked) => {
        setAnalysesPrescrites((prev) =>
            checked
                ? (prev.some((item) => item.codeacte === analyse.codeacte)
                    ? prev
                    : [...prev, { codeacte: analyse.codeacte, libacte: analyse.libacte, qte: 1, observation: null, tarif: analyse.tarif }])
                : prev.filter((item) => item.codeacte !== analyse.codeacte)
        );
    };

    // Catalogue regroupé par catégorie, filtré par la recherche et la catégorie choisie
    const catalogue = (listAnalyses || []).filter((item) =>
        !recherche || normalize(`${item.libacte} ${item.codeacte} ${item.categorie || ""}`).includes(normalize(recherche))
    );
    const categories = Object.entries(
        (listAnalyses || []).reduce((acc, item) => {
            const categorie = item?.categorie || CATEGORIE_PAR_DEFAUT;
            acc[categorie] = (acc[categorie] || 0) + 1;
            return acc;
        }, {})
    ).sort(trierCategories);
    const groupes = Object.entries(
        catalogue.reduce((acc, item) => {
            const categorie = item?.categorie || CATEGORIE_PAR_DEFAUT;
            if (!categorieActive || categorie === categorieActive) {
                (acc[categorie] = acc[categorie] || []).push(item);
            }
            return acc;
        }, {})
    ).sort(trierCategories);

    /* ---------------- Enregistrement ---------------- */

    const onFinish = () => {
        if (analysesPrescrites.length === 0) {
            Modal.warning({
                title: "Avertissement",
                content: "Veuillez svp ajouter au moins une analyse à la liste",
            });
            return;
        }

        const values = form.getFieldsValue();
        const prescripteur = prescripteursFiltres.find(
            (item) => item.numFourn === values.prescripteur_externe,
        );
        const payload = {
            datepresc: new Date(values.datepresc).toISOString(),
            num_patient: values.patient,
            code_prescripteur: values.prescripteur_externe,
            prescripteur: prescripteur?.raisoc,
            type_prescription: "Externe",
            codepresc: codesPrescriptions.ANA,
            listActes: analysesPrescrites,
            numcons: null,
            numpresc: null,
        };

        setFormLoading(true);
        postActions(endpoints.prescriptions.ADD, payload)
            .then((response) => {
                if (response?.data?.Saved) {
                    message.success("Prescription d'analyse externe ajoutée avec succès");
                    setIsModalVisible(false);
                    form.resetFields();

                    // Prescription lancée depuis la liste des RV : marquer le RV comme effectué.
                    if (initialPatient?.num_ordre) {
                        putActions(endpoints.rendezVous.UPDATE_ETAT(initialPatient.num_ordre))
                            .finally(() => {
                                if (onRefresh) {
                                    onRefresh();
                                }
                            });
                    } else if (onRefresh) {
                        onRefresh();
                    }
                }
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    const beneficiaire = listBeneficiaires.find((item) => item.matribenef === numPatient);
    // Patient transmis par l'appelant (liste des RV) : la recherche par matricule est inutile
    const patientConnu = !!initialPatient?.num_patient;

    const bandeauPatient = beneficiaire && (
        <Flex align="center" gap={10} style={{ padding: "4px 12px", borderRadius: 8, background: colorPrimaryBg, minHeight: 32 }}>
            <Avatar size="small" style={{ backgroundColor: colorPrimary, flexShrink: 0 }}>
                {`${beneficiaire.prenoms?.[0] || ""}${beneficiaire.nom?.[0] || ""}`.toUpperCase()}
            </Avatar>
            <Text strong>{beneficiaire.prenoms} {beneficiaire.nom}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>N° {beneficiaire.matribenef}</Text>
        </Flex>
    );

    return (
        <>
        <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* Patient et prescripteur */}
            <Card size="small" title={<SectionTitle icon={<UserOutlined />}>Patient et prescripteur</SectionTitle>} style={{ marginBottom: 16 }}>
                <Row gutter={12}>
                    <Col xs={24} md={6}>
                        <Form.Item label="Date de prescription" name="datepresc" initialValue={dayjs(new Date())}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} allowClear={false} />
                        </Form.Item>
                    </Col>
                    {patientConnu ? (
                        // Prescription lancée depuis la liste des RV : patient déjà connu, pas de recherche
                        <Col xs={24} md={18}>
                            <Form.Item name="patient" hidden rules={[{ required: true, message: "Sélectionner le patient" }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Patient">
                                {bandeauPatient}
                            </Form.Item>
                        </Col>
                    ) : (
                        <>
                            <Col xs={24} md={7}>
                                <Form.Item label="Matricule" name="matricule" tooltip="Matricule IPM du participant, ou numéro patient (PAT...) pour un patient externe">
                                    <Input.Search
                                        placeholder="Matricule ou n° PAT"
                                        prefix={<IdcardOutlined />}
                                        enterButton
                                        loading={listBeneficiairesLoading}
                                        onSearch={lancerRechercheMatricule}
                                        onBlur={(e) => e.target.value?.trim() && e.target.value.trim() !== matriculeToSearch && lancerRechercheMatricule(e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={11}>
                                <Form.Item label="Patient" name="patient" rules={[{ required: true, message: "Sélectionner le patient" }]}>
                                    <Select
                                        showSearch
                                        placeholder={listBeneficiaires.length ? "Choisir le bénéficiaire" : "Rechercher d'abord par matricule"}
                                        optionFilterProp="label"
                                        loading={listBeneficiairesLoading}
                                        notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Saisir un matricule puis lancer la recherche" />}
                                        options={listBeneficiaires.map((item) => ({
                                            value: item?.matribenef,
                                            label: `${item?.matribenef} - ${item?.prenoms} ${item?.nom}`,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                    <Col xs={24}>
                        <Form.Item
                            label="Prescripteur externe"
                            name="prescripteur_externe"
                            rules={[{ required: true, message: "Sélectionner le prescripteur externe" }]}
                            style={{ marginBottom: 0 }}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Médecin ou structure ayant prescrit les analyses"
                                optionFilterProp="label"
                                loading={prescripteursLoading}
                                suffixIcon={<SolutionOutlined />}
                                options={prescripteursFiltres.map((item) => ({
                                    value: item.numFourn,
                                    label: `${item.raisoc}${item.intitule ? ` - ${item.intitule}` : ""}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                {!patientConnu && bandeauPatient && <div style={{ marginTop: 12 }}>{bandeauPatient}</div>}
            </Card>

            <Row gutter={16}>
                {/* Catalogue des analyses */}
                <Col xs={24} lg={14}>
                    <Card
                        size="small"
                        loading={analysesLoading}
                        title={<SectionTitle icon={<ExperimentOutlined />}>Choisir les analyses</SectionTitle>}
                        style={{ marginBottom: 16 }}
                    >
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder={`Rechercher une analyse (nom, code${categories.length > 1 ? ", catégorie" : ""})`}
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            style={{ marginBottom: 12 }}
                        />

                        {/* Filtre rapide par catégorie (inutile s'il n'y a qu'une catégorie) */}
                        {categories.length > 1 && (
                            <Flex wrap gap={6} style={{ marginBottom: 12 }}>
                                <Tag.CheckableTag checked={!categorieActive} onChange={() => setCategorieActive(null)}>
                                    Toutes ({(listAnalyses || []).length})
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
                            </Flex>
                        )}

                        {groupes.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune analyse ne correspond à la recherche" />
                        ) : (
                            <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
                                <Row gutter={[12, 12]}>
                                    {groupes.map(([categorie, items]) => {
                                        const nbSelection = items.filter((item) => codesSelectionnes.includes(item.codeacte)).length;
                                        return (
                                            <Col xs={24} md={groupes.length === 1 ? 24 : 12} key={categorie}>
                                                <div style={{ border: `1px solid ${colorBorderSecondary}`, borderRadius: 8, height: "100%" }}>
                                                    <Flex
                                                        justify="space-between"
                                                        align="center"
                                                        style={{ padding: "6px 10px", background: colorFillAlter, borderRadius: "8px 8px 0 0" }}
                                                    >
                                                        <Text strong style={{ fontSize: 12, letterSpacing: 0.3 }}>{categorie}</Text>
                                                        {nbSelection > 0 && <Tag color="processing" style={{ marginInlineEnd: 0 }}>{nbSelection}</Tag>}
                                                    </Flex>
                                                    <Flex vertical gap={2} style={{ padding: 6 }}>
                                                        {items.map((item) => {
                                                            const checked = codesSelectionnes.includes(item.codeacte);
                                                            return (
                                                                <Checkbox
                                                                    key={item.codeacte}
                                                                    checked={checked}
                                                                    onChange={(e) => toggleAnalyse(item, e.target.checked)}
                                                                    style={{
                                                                        padding: "3px 6px",
                                                                        borderRadius: 6,
                                                                        background: checked ? colorPrimaryBg : undefined,
                                                                        marginInlineStart: 0,
                                                                    }}
                                                                >
                                                                    <span style={{ fontWeight: checked ? 600 : 400 }}>{item.libacte}</span>
                                                                </Checkbox>
                                                            );
                                                        })}
                                                    </Flex>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Analyses sélectionnées : quantité et motif par analyse */}
                <Col xs={24} lg={10}>
                    <Card
                        size="small"
                        title={
                            <Space style={{ color: colorPrimary }}>
                                <span>Analyses sélectionnées</span>
                                <Tag color={analysesPrescrites.length ? "processing" : "default"} style={{ marginInlineEnd: 0 }}>
                                    {analysesPrescrites.length}
                                </Tag>
                            </Space>
                        }
                        extra={
                            <Button
                                size="small"
                                type="text"
                                danger
                                icon={<UndoOutlined />}
                                disabled={analysesPrescrites.length === 0}
                                onClick={() => setAnalysesPrescrites([])}
                            >
                                Tout retirer
                            </Button>
                        }
                        style={{ marginBottom: 16, borderColor: analysesPrescrites.length ? colorPrimaryBorder : undefined }}
                    >
                        {analysesPrescrites.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Cochez les analyses dans le catalogue" />
                        ) : (
                            <Flex vertical gap={6} style={{ maxHeight: 380, overflowY: "auto" }}>
                                {analysesPrescrites.map((acte) => (
                                    <div key={acte.codeacte} style={{ padding: "6px 10px", borderRadius: 6, background: colorFillAlter }}>
                                        <Flex justify="space-between" align="center" gap={8}>
                                            <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                                                <Text strong ellipsis={{ tooltip: acte.libacte }}>{acte.libacte}</Text>
                                            </div>
                                            <Tooltip title="Retirer">
                                                <Button size="small" type="text" danger icon={<CloseOutlined />} onClick={() => toggleAnalyse(acte, false)} />
                                            </Tooltip>
                                        </Flex>
                                    </div>
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
                style={{ paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
            >
                <Text>
                    <Text strong style={{ fontSize: 16 }}>{analysesPrescrites.length}</Text>{" "}
                    analyse{analysesPrescrites.length > 1 ? "s" : ""} sélectionnée{analysesPrescrites.length > 1 ? "s" : ""}
                </Text>
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={formLoading}
                        disabled={analysesPrescrites.length === 0 || !numPatient}
                    >
                        Enregistrer la prescription
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => setIsModalVisible(false)}>
                        Annuler
                    </Button>
                </Space>
            </Flex>
        </Form>

            {/* Hors du formulaire principal : l'enregistrement du patient ne doit pas soumettre la prescription */}
            <Modal
                style={{ top: 20 }}
                title="Enregistrer le patient"
                open={isAddPatientModalVisible}
                onCancel={() => setIsAddPatientModalVisible(false)}
                footer={null}
                width={900}
                destroyOnClose
            >
                <AddPatient
                    setOpen={setIsAddPatientModalVisible}
                    operationType="add"
                    currentRecord={null}
                    initialMatricule={matriculeToSearch}
                    onCreated={applyCreatedPatient}
                />
            </Modal>
        </>
    );
};

export default AddAnalyseExterne;

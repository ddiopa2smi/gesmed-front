import { useEffect, useState } from "react";
import { Form, Select, InputNumber, Input, DatePicker, Row, Col, Button, Modal, Space, Tooltip, Typography, Table, message } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import useFetch from "../../../utils/hooks/useFetch";
import { getActions, postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { deletePopup, formatMontant } from "../../../utils/helpers";
import FormFooter from "../../common/FormFooter/FormFooter";
import DataTable from "../../common/DataTable/DataTable";
import DeleteButton from "../../common/DeleteButton/DeleteButton";
import Posologie from "../Posologie/Posologie";
import AddPatient from "../AddPatient/AddPatient";

const { Option } = Select;
const { Title, Text } = Typography;

// Codes spécialité (codespe) exclus pour les prescripteurs externes
const CODES_SPE_EXCLUS_PRESCRIPTEURS_EXT = ["06", "01", "04"];

const AddPrescriptionExterne = ({ setIsModalVisible, onRefresh }) => {
    const [form] = Form.useForm();
    const [formLoading, setFormLoading] = useState(false);
    const numPatient = Form.useWatch("patient", form);

    const { data: prescripteursExternes, isLoading: prescripteursLoading } = useFetch(endpoints.prescriptions.LIST_PRESCRIPTEURS_EXT);
    const { data: listMedicaments, isLoading: medicamentsLoading } = useFetch(endpoints.fiche_produit.LIST);

    const prescripteursFiltres = (prescripteursExternes || []).filter((item) => !CODES_SPE_EXCLUS_PRESCRIPTEURS_EXT.includes(item.codespe));

    const [medicamentSelected, setMedicamentSelected] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [conditionnement] = useState("boite");
    const [posologieButtonStatus, setPosologieButtonStatus] = useState(true);
    const [isPosologieModalVisible, setIsPosologieModalVisible] = useState(false);
    const [medicamentsPrescrits, setMedicamentsPrescrits] = useState([]);

    const totalTarif = medicamentsPrescrits.reduce((acc, acte) => {
        const produit = (listMedicaments || []).find(
            (item) => item.code_produit === acte.codeacte,
        );
        return acc + (produit?.prix_vente || 0) * (acte.qte || 0);
    }, 0);

    const [matriculeToSearch, setMatriculeToSearch] = useState(null);
    const [listBeneficiaires, setListBeneficiaires] = useState([]);
    const [listBeneficiairesLoading, setListBeneficiairesLoading] = useState(false);
    const [isAddPatientModalVisible, setIsAddPatientModalVisible] = useState(false);

    const handleMatricule = (e) => {
        setMatriculeToSearch(e.target.value);
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
                            // Setter par defaut le premier element du tableau
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
    }, [matriculeToSearch]);

    const onFinish = () => {
        if (medicamentsPrescrits.length === 0) {
            Modal.warning({
                title: "Avertissement",
                content: "Veuillez svp renseigner la posologie de ce médicament, cliquer le bouton posologie ci-dessous pour l'ajouter",
            });
            return;
        }

        const values = form.getFieldsValue();
        const listActes = medicamentsPrescrits.map((acte) => {
            const produit = (listMedicaments || []).find(
                (item) => item.code_produit === acte.codeacte,
            );
            return {
                ...acte,
                tarif: produit?.prix_vente,
            };
        });
        const prescripteur = prescripteursFiltres.find(
            (item) => item.numFourn === values.prescripteur_externe,
        );
        const payload = {
            datepresc: new Date(values.datepresc).toISOString(),
            num_patient: values.patient,
            code_prescripteur: values.prescripteur_externe,
            prescripteur: prescripteur?.raisoc,
            type_prescription: "Externe",
            qte_presc: 1,
            codepresc: "06",
            listActes: listActes,
            numcons: null,
            numpresc: null,
        };

        setFormLoading(true);
        postActions(endpoints.prescriptions.ADD, payload)
            .then((response) => {
                if (response?.data?.Saved) {
                    message.success("Prescription externe ajoutée avec succès");
                    setIsModalVisible(false);
                    form.resetFields();
                    if (onRefresh) {
                        onRefresh();
                    }
                }
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            size="small"
            onFinish={onFinish}
            onValuesChange={(changedValues, values) => {
                const requiredFieldsFilled =
                    !!values.medicament &&
                    values.qte_presc !== undefined &&
                    values.qte_presc !== null &&
                    values.qte_presc > 0;
                setPosologieButtonStatus(!requiredFieldsFilled);

                if (changedValues.medicament) {
                    const medicamentCode = changedValues.medicament;
                    listMedicaments.forEach((element) => {
                        if (element.code_produit === medicamentCode) {
                            setMedicamentSelected(element);
                        }
                    });
                }

                if (changedValues.qte_presc) {
                    setQuantity(changedValues.qte_presc);
                }
            }}
        >
            <Row gutter={[12, 0]} align={"middle"}>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Item
                        label="Date de prescription"
                        name="datepresc"
                        initialValue={dayjs(new Date())}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                    <Form.Item label="Matricule" name="matricule">
                        <Input placeholder="Matricule" onBlur={handleMatricule} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={16} md={10} lg={10} xl={10}>
                    <Form.Item
                        label="Patient"
                        name="patient"
                    >
                        <Select
                            style={{ width: "100%", background: "transparent" }}
                            showSearch
                            placeholder="Patient"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={listBeneficiairesLoading}
                        >
                            {listBeneficiaires?.map((item, key) => (
                                <Option key={key} value={item?.matribenef}>
                                    {" "}{item?.matribenef} - {item?.prenoms}{" "}{item?.nom}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label="Prescripteur externe"
                name="prescripteur_externe"
            >
                <Select
                    style={{ width: "100%", background: "transparent" }}
                    showSearch
                    placeholder="Prescripteur externe"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        `${option.children[0]} ${option.children[2]}`.toLowerCase().includes(input.toLowerCase())
                    }
                    loading={prescripteursLoading}
                >
                    {prescripteursFiltres.map((item) => (
                        <Option key={item.numFourn} value={item.numFourn}>
                            {item.raisoc} - {item.intitule}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Row gutter={[12, 0]} align={"middle"}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                        label="Médicament"
                        name="medicament"
                    >
                        <Select
                            style={{ width: "100%", background: "transparent" }}
                            showSearch
                            placeholder="Médicament"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            loading={medicamentsLoading}
                        >
                            {(listMedicaments || []).map((item) => (
                                <Option key={item.code_produit} value={item.code_produit}>
                                    {item.libelle_produit}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={7} lg={7} xl={7}>
                    <Form.Item
                        label="Qté prescrite"
                        name="qte_presc"
                        initialValue={1}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={5} lg={5} xl={5}>
                    <Button
                        type="primary"
                        disabled={posologieButtonStatus}
                        onClick={() => setIsPosologieModalVisible(true)}
                    >
                        Posologie
                    </Button>
                </Col>
            </Row>

            <Title level={5} style={{ marginTop: 8 }}>Liste des médicaments</Title>
            <DataTable compact
                dataSourceCopy={medicamentsPrescrits}
                rowKey={(record) => record.codeacte}
                scroll={null}
                columns={[
                    {
                        title: "Code",
                        dataIndex: "codeacte",
                        key: "codeacte",
                        width: 100,
                    },
                    {
                        title: "Médicament",
                        dataIndex: "libacte",
                        key: "libacte",
                    },
                    {
                        title: "Quantité",
                        dataIndex: "qte",
                        key: "qte",
                        align: "center",
                        width: 100,
                        render: (value, record) => (
                            <InputNumber
                                min={1}
                                size="small"
                                value={value}
                                style={{ width: "100%" }}
                                onChange={(newValue) => {
                                    if (newValue === null) {
                                        return;
                                    }
                                    const newData = medicamentsPrescrits.map((item) =>
                                        item.codeacte === record.codeacte
                                            ? { ...item, qte: newValue }
                                            : item,
                                    );
                                    setMedicamentsPrescrits(newData);
                                }}
                            />
                        ),
                    },
                    {
                        title: "Posologie",
                        dataIndex: "posologie",
                        key: "posologie",
                        ellipsis: true,
                        width: 200,
                    },
                    {
                        title: "Tarif",
                        dataIndex: "codeacte",
                        key: "tarif",
                        width: 100,
                        align: "right",
                        render: (codeacte) => {
                            const produit = (listMedicaments || []).find(
                                (item) => item.code_produit === codeacte,
                            );
                            return formatMontant(produit?.prix_vente);
                        },
                    },
                    {
                        width: 50,
                        render: (record) => (
                            <Space>
                                <Tooltip title="Supprimer">
                                    <DeleteButton
                                        onDelete={() => {
                                            deletePopup().then((response) => {
                                                if (response?.isConfirmed) {
                                                    const temp = medicamentsPrescrits.filter(
                                                        (element) => element.codeacte !== record.codeacte,
                                                    );
                                                    setMedicamentsPrescrits(temp);
                                                }
                                            });
                                        }}
                                    />
                                </Tooltip>
                            </Space>
                        ),
                    },
                ]}
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}>
                                <Text strong>Total</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align="right">
                                <Text strong>{formatMontant(totalTarif)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} />
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            <div style={{ marginTop: 16 }}>
                <FormFooter
                    onCancel={() => setIsModalVisible(false)}
                    htmlType="submit"
                    validLabel="Ajouter"
                    loading={formLoading}
                    disabled={medicamentsPrescrits.length === 0 || !numPatient}
                />
            </div>

            <Modal
                style={{ top: 20 }}
                title="Ajouter la posologie"
                footer={null}
                open={isPosologieModalVisible}
                onCancel={() => setIsPosologieModalVisible(false)}
                width={700}
                destroyOnClose
            >
                <Posologie
                    medicamentsPrescrites={medicamentsPrescrits}
                    setMedicamentsPrescrites={setMedicamentsPrescrits}
                    medicamentSelected={medicamentSelected}
                    quantity={quantity}
                    conditionnement={conditionnement}
                    setIsModalVisible={setIsPosologieModalVisible}
                    onValidate={() => {
                        form.resetFields(["medicament", "qte_presc"]);
                        setMedicamentSelected(null);
                        setQuantity(1);
                        setPosologieButtonStatus(true);
                    }}
                />
            </Modal>

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
        </Form>
    );
};

export default AddPrescriptionExterne;

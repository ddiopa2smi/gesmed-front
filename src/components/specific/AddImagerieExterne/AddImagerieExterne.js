import { useEffect, useState } from "react";
import { Form, Select, InputNumber, Input, DatePicker, Row, Col, Button, Modal, Space, Tooltip, Typography, Table, message } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import useFetch from "../../../utils/hooks/useFetch";
import { getActions, postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions } from "../../../constants/app.constants";
import { deletePopup, formatMontant } from "../../../utils/helpers";
import FormFooter from "../../common/FormFooter/FormFooter";
import DataTable from "../../common/DataTable/DataTable";
import DeleteButton from "../../common/DeleteButton/DeleteButton";
import AddPatient from "../AddPatient/AddPatient";

const { Option } = Select;
const { Title, Text } = Typography;

// Codes spécialité (codespe) exclus pour les prescripteurs externes
const CODES_SPE_EXCLUS_PRESCRIPTEURS_EXT = ["06", "01", "04"];

const AddImagerieExterne = ({ setIsModalVisible, onRefresh }) => {
    const [form] = Form.useForm();
    const [formLoading, setFormLoading] = useState(false);
    const numPatient = Form.useWatch("patient", form);

    const { data: prescripteursExternes, isLoading: prescripteursLoading } = useFetch(endpoints.prescriptions.LIST_PRESCRIPTEURS_EXT);
    const { data: listImageries, isLoading: imageriesLoading } = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.IMG}`);

    const prescripteursFiltres = (prescripteursExternes || []).filter((item) => !CODES_SPE_EXCLUS_PRESCRIPTEURS_EXT.includes(item.codespe));

    const [imagerieButtonStatus, setImagerieButtonStatus] = useState(true);
    const [imageriesPrescrites, setImageriesPrescrites] = useState([]);

    const totalTarif = imageriesPrescrites.reduce((acc, acte) => acc + (acte.tarif || 0) * (acte.qte || 0), 0);

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

    const addImagerieToList = () => {
        form
            .validateFields(["imagerie", "qte", "motifImagerie"])
            .then((values) => {
                const imagerie = (listImageries || []).find((item) => item.codeacte === values.imagerie);
                if (!imagerie) {
                    return;
                }

                const payload = {
                    codeacte: imagerie.codeacte,
                    libacte: imagerie.libacte,
                    qte: values.qte,
                    motifImagerie: values.motifImagerie,
                    tarif: imagerie.tarif,
                };

                const index = imageriesPrescrites.findIndex((item) => item.codeacte === payload.codeacte);
                if (index > -1) {
                    const newData = [...imageriesPrescrites];
                    newData[index] = payload;
                    setImageriesPrescrites(newData);
                } else {
                    setImageriesPrescrites([...imageriesPrescrites, payload]);
                }

                form.resetFields(["imagerie", "qte", "motifImagerie"]);
                setImagerieButtonStatus(true);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const onFinish = () => {
        if (imageriesPrescrites.length === 0) {
            Modal.warning({
                title: "Avertissement",
                content: "Veuillez svp ajouter au moins une imagerie à la liste",
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
            codepresc: codesPrescriptions.IMG,
            listActes: imageriesPrescrites,
            numcons: null,
            numpresc: null,
        };

        setFormLoading(true);
        postActions(endpoints.prescriptions.ADD, payload)
            .then((response) => {
                if (response?.data?.Saved) {
                    message.success("Prescription d'imagerie externe ajoutée avec succès");
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
                const requiredFieldsFilled = !!values.imagerie && values.qte !== undefined && values.qte !== null && values.qte > 0;
                setImagerieButtonStatus(!requiredFieldsFilled);
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
                    <Form.Item label="Patient" name="patient">
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

            <Form.Item label="Prescripteur externe" name="prescripteur_externe">
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
                <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                    <Form.Item label="Imagerie" name="imagerie">
                        <Select
                            style={{ width: "100%", background: "transparent" }}
                            showSearch
                            placeholder="Imagerie"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            loading={imageriesLoading}
                        >
                            {(listImageries || []).map((item) => (
                                <Option key={item.codeacte} value={item.codeacte}>
                                    {item.libacte}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                    <Form.Item label="Qté" name="qte" initialValue={1}>
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={7} lg={7} xl={7}>
                    <Form.Item label="Motif" name="motifImagerie">
                        <Input placeholder="Motif" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={6} md={3} lg={3} xl={3}>
                    <Button
                        type="primary"
                        disabled={imagerieButtonStatus}
                        onClick={addImagerieToList}
                    >
                        Ajouter
                    </Button>
                </Col>
            </Row>

            <Title level={5} style={{ marginTop: 8 }}>Liste des imageries</Title>
            <DataTable
                dataSourceCopy={imageriesPrescrites}
                rowKey={(record) => record.codeacte}
                compact
                scroll={null}
                columns={[
                    {
                        title: "Code",
                        dataIndex: "codeacte",
                        key: "codeacte",
                        width: 100,
                    },
                    {
                        title: "Imagerie",
                        dataIndex: "libacte",
                        key: "libacte",
                    },
                    {
                        title: "Quantité",
                        dataIndex: "qte",
                        key: "qte",
                        align: "center",
                        width: 90,
                    },
                    {
                        title: "Motif",
                        dataIndex: "motifImagerie",
                        key: "motifImagerie",
                    },
                    {
                        title: "Tarif",
                        dataIndex: "tarif",
                        key: "tarif",
                        width: 100,
                        align: "right",
                        render: (tarif) => formatMontant(tarif),
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
                                                    const temp = imageriesPrescrites.filter(
                                                        (element) => element.codeacte !== record.codeacte,
                                                    );
                                                    setImageriesPrescrites(temp);
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
                    disabled={imageriesPrescrites.length === 0 || !numPatient}
                />
            </div>

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

export default AddImagerieExterne;

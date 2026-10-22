import { useState } from "react";
import {
    Modal,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Row,
    Typography,
    message,
    Space,
    Tooltip,
    Spin,
    Flex,
    Tree,
    Checkbox,
    Descriptions,
    Collapse,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import useFetch from "../../../utils/hooks/useFetch";
import { codesPrescriptions } from "../../../constants/app.constants";
import FormFooter from "../../common/FormFooter/FormFooter";
import { deletePopup } from "../../../utils/helpers";
import { DeleteOutlined } from "@ant-design/icons";
import DataTable from "../../common/DataTable/DataTable";
import AddAnalyse from "../AddAnalyse/AddAnalyse";
import BackButton from "../../common/BackButton/BackButton";
import SearchBar from "../../common/SearchBar/SearchBar";
import NotSpecified from "../../common/NotSpecified/NotSpecified";
import GestionActes from "../GestionActes/GestionActes";
import { TypePrescription } from "../../../utils/types/types.ts";
import AddImagerie from "../AddImagerie/AddImagerie";

const { Title, Text } = Typography;

function Prescription({
    typePrescription
}) {
    const navigate = useNavigate();
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const prescription = JSON.parse(sessionStorage.getItem("prescription"));
    const editPrescription = JSON.parse(
        sessionStorage.getItem("editPrescription")
    );
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [operationType, setOperationType] = useState("add");

    const [checkKeys, setCheckKeys] = useState(
        (editPrescription?.listActes || []).map((item) => item?.codeacte)
    );

    const [actesPrescrites, setActesPrescrites] = useState(
        editPrescription?.listActes || []
    );
    const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));

    const [isGestionActesModalOpen, setIsGestionActesModalOpen] = useState(false);


    const save = () => {
        form
            .validateFields()
            .then((values) => {
                const payload = {
                    codepresc: editPrescription?.codepresc || (typePrescription === TypePrescription.ANALYSE ? codesPrescriptions.ANA : codesPrescriptions.IMG),
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
                if (actesPrescrites.length !== 0) {
                    postActions(endpoints.prescriptions.ADD, payload).then(() => {
                        setLoading(false);
                        message.success("Opération effectuée avec succès");
                        setActesPrescrites([]);
                    });
                } else {
                    message.warning(
                        "Veuillez  sélectionner les actes à prescrire"
                    );
                }
                form.resetFields();
                navigate(-1);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const { data, dataCopy, setDataCopy, isLoading, onRefresh } = useFetch(
        `${endpoints.actes.LIST}?codeacte=${typePrescription === TypePrescription.ANALYSE ? codesPrescriptions.ANA : codesPrescriptions.IMG}`
    );

    const prescriptionsParCategorie = (dataCopy || []).reduce((acc, item) => {
        const categorie = item?.categorie || "Autres";
        if (!acc[categorie]) {
            acc[categorie] = [];
        }
        acc[categorie].push(item);
        return acc;
    }, {});

    const infosPatient = [
        {
            key: "1",
            label: "Infos patient",
            children: (
                <div>
                    <Descriptions
                        column={3}
                        layout="horizontal"
                    >
                        <Descriptions.Item label="Matricule">
                            {currentPatient?.num_patient || <NotSpecified />}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nom">
                            {currentPatient?.nom_patient || <NotSpecified />}
                        </Descriptions.Item>
                        <Descriptions.Item label="Prénom">
                            {currentPatient?.prenom_patient || <NotSpecified />}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sexe">
                            {currentPatient?.sexe_patient || <NotSpecified />}
                        </Descriptions.Item>
                        <Descriptions.Item label="Age">
                            {`${currentPatient?.age_patient} an(s)` || <NotSpecified />}
                        </Descriptions.Item>
                        <Descriptions.Item label="Groupe sanguin">
                            {currentPatient?.group_sanguin || <NotSpecified />}
                        </Descriptions.Item>
                        <Descriptions.Item label="Diagnostic">
                            {prescription?.diagnostic || <NotSpecified />}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            ),
        },
    ];

    const analysesColumns = [
        {
            title: "Code",
            dataIndex: "codeacte",
            key: "codeacte",
        },
        {
            title: "Analyse",
            dataIndex: "libacte",
            key: "libacte",
        },
        {
            title: "Quantité",
            dataIndex: "qte",
            key: "qte",
        },
        {
            title: "Motif",
            dataIndex: "observation",
            key: "observation",
        },
        {
            width: "auto",
            render: (record) => (
                <Space>
                    <Tooltip title="Supprimer">
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                deletePopup().then((response) => {
                                    if (response.isConfirmed) {
                                        const temp = actesPrescrites.filter(
                                            (element) => element.codeacte !== record.codeacte
                                        );
                                        setActesPrescrites(temp);
                                        setCheckKeys((prev) => prev.filter((key) => key !== record.codeacte));
                                    }
                                });
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const imageriesColumns = [
        {
            title: "Code",
            dataIndex: "codeacte",
            key: "codeacte",
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
        },
        {
            title: "Motif",
            dataIndex: "motifImagerie",
            key: "motifImagerie",
        },
        {
            width: "auto",
            render: (record) => (
                <Space>
                    <Tooltip title="Supprimer">
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                deletePopup().then((response) => {
                                    if (response.isConfirmed) {
                                        const temp = actesPrescrites.filter(
                                            (element) => element.codeacte !== record.codeacte
                                        );
                                        setActesPrescrites(temp);
                                        setCheckKeys((prev) => prev.filter((key) => key !== record.codeacte));
                                    }
                                });
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card >
            <Flex align="flex-start" justify="space-between">
                <BackButton />
            </Flex>
            <br />

            <Title level={4}>
                Prescription {typePrescription === TypePrescription.ANALYSE ? "Analyse" : "Imagerie"}
            </Title>

            <Collapse items={infosPatient} defaultActiveKey={["1"]} />


            <Form form={form} layout="vertical" onFinish={save}>
                <Row gutter={[24, 24]} align={"stretch"} style={{ display: "none" }} >
                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                        <Form.Item
                            label={typePrescription === TypePrescription.ANALYSE ? "Date Analyse" : "Date Imagerie"}
                            name="datepresc"
                            rules={[
                                {
                                    required: true,
                                    message: "Champ obligatoire",
                                },
                            ]}
                            initialValue={dayjs(new Date())}
                        >
                            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                <br />
                <Card title="Sélectionner les actes à prescrire"
                    extra={
                        <Space>
                            <SearchBar
                                data={data}
                                setDataCopy={setDataCopy}
                                listKeys={["codeacte", "libacte", "categorie"]}
                            />
                            <Button
                                type="primary"
                                onClick={() => {
                                    setIsGestionActesModalOpen(true);
                                }}
                            >
                                Gérer
                            </Button>
                        </Space>
                    }
                    actions={[
                        <Flex style={{ width: "100%", padding: "0 16px" }} justify="flex-end" >
                            <Space>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={() => {
                                        setCheckKeys([]);
                                        setActesPrescrites([]);
                                    }}
                                    disabled={checkKeys.length === 0}
                                >
                                    Réinitialiser
                                </Button>
                            </Space>
                        </Flex>
                    ]}
                >

                    <Row gutter={[24, 24]} align={"stretch"}>
                        {Object.entries(prescriptionsParCategorie)
                            .sort(([a], [b]) => {
                                if (a === "Autres") return 1;
                                if (b === "Autres") return -1;
                                return 0;
                            })
                            .map(([categorie, items]) => {
                                const codesCategorie = items.map((item) => item?.codeacte);
                                return (
                                    <Col xs={24} sm={12} md={6} lg={6} xl={6} key={categorie}>
                                        <Text strong>{categorie}</Text>
                                        <br />
                                        <br />
                                        <Checkbox.Group
                                            style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}
                                            value={checkKeys.filter((key) => codesCategorie.includes(key))}
                                            options={items.map((item) => {
                                                return {
                                                    value: item?.codeacte,
                                                    label: item?.libacte,
                                                };
                                            })}
                                            onChange={(values) => {
                                                const previousInCategorie = checkKeys.filter((key) => codesCategorie.includes(key));
                                                const added = values.filter((key) => !previousInCategorie.includes(key));
                                                const removed = previousInCategorie.filter((key) => !values.includes(key));

                                                setCheckKeys((prev) => [
                                                    ...prev.filter((key) => !codesCategorie.includes(key)),
                                                    ...values,
                                                ]);

                                                setActesPrescrites((prev) => {
                                                    const updated = prev.filter((item) => !removed.includes(item.codeacte));
                                                    added.forEach((code) => {
                                                        const acte = items.find((item) => item.codeacte === code);
                                                        if (acte && !updated.some((item) => item.codeacte === code)) {
                                                            updated.push(acte);
                                                        }
                                                    });
                                                    return updated;
                                                });
                                            }}
                                        />
                                    </Col>
                                );
                            })}
                    </Row>

                </Card>
                <br />
                <Title level={5}>Liste des {typePrescription === TypePrescription.ANALYSE ? "analyses" : "imageries"}</Title>
                <DataTable compact
                    dataSourceCopy={actesPrescrites}
                    columns={typePrescription === TypePrescription.ANALYSE ? analysesColumns : imageriesColumns}
                />

                <FormFooter
                    loading={loading}
                    onCancel={() => {
                        navigate(-1);
                    }}
                    htmlType="submit"
                />
            </Form>

            <Modal
                title={"Ajouter une nouvelle prescription"}
                footer={null}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                }}
                destroyOnClose
            >
                {typePrescription === TypePrescription.ANALYSE ?
                    <AddAnalyse
                        setIsModalVisible={setIsModalVisible}
                        analysesPrescrites={actesPrescrites}
                        setAnalysesPrescrites={setActesPrescrites}
                        listAnalyses={dataCopy}
                    /> :
                    <AddImagerie
                        setIsModalVisible={setIsModalVisible}
                        imageriesPrescrites={actesPrescrites}
                        setImageriesPrescrites={setActesPrescrites}
                        listImageries={dataCopy}
                    />}
            </Modal>


            <Modal
                title="Gestion des actes"

                style={{ top: 20 }}
                styles={{
                    header: { padding: "12px 24px", },
                    footer: { padding: "12px 24px" },
                    content: {
                        margin: 0,
                        padding: 0,
                        borderRadius: "8px 8px 8px 8px",
                        overflow: "hidden"
                    },
                    body: {
                        overflow: "auto",
                        minHeight: "50vh",
                        maxHeight: "80vh",
                        padding: "12px 24px",
                    },
                }}
                width={1000}
                footer={null}
                open={isGestionActesModalOpen}
                onCancel={() => {
                    setIsGestionActesModalOpen(false);
                }}
                destroyOnClose
            >
                <GestionActes
                    typePrescription={typePrescription}
                />
            </Modal>


        </Card>
    );
}

export default Prescription;
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  Radio,
  Flex,
  Tooltip,
  Row,
  Select,
  Typography,
  Upload,
  Space,
  DatePicker,
  Card,
  Calendar,
  InputNumber,
  Checkbox,
  message,
  Divider,
  Modal,
  TreeSelect,
  Tag,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { HomeOutlined } from "@ant-design/icons";
import { getActions, postActions } from "../../actions/actions";
import { endpoints } from "../../constants/endpoints.constants";
import {
  codesPrescriptions,
  operationTypes,
} from "../../constants/app.constants";
import { Link } from "react-router-dom";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import Posologie from "../../components/specific/Posologie/Posologie";
import { deletePopup, printPDF } from "../../utils/helpers";
import BackButton from "../../components/common/BackButton/BackButton";
import PrintButton from "../../components/common/PrintButton/PrintButton";
import DeleteButton from "../../components/common/DeleteButton/DeleteButton";
import Swal from "sweetalert2";
import { render } from "@testing-library/react";
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

const Ordonnance = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  //const initConsultation  = JSON.parse(sessionStorage.getItem("initConsultation"));
  const prescription = JSON.parse(sessionStorage.getItem("prescription"));
  const editPrescription = JSON.parse(
    sessionStorage.getItem("editPrescription")
  );
  // console.log(prescription)
  // console.log(editPrescription)
  const [formLoading, setFormLoading] = useState(false);
  const [operationType, setOperationType] = useState("add");
  //const [listMedicaments , setListMedicaments] = useState([]);
  const [medicamentSelected, setMedicamentSelected] = useState(null);
  const [medicamentsPrescrites, setMedicamentsPrescrites] = useState(
    editPrescription?.listActes || []
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [posologieButtonStatus, setPosologieButtonStatus] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [conditionnement, setConditionnement] = useState("boite");
  const [isPrintDisabled, setIsPrintDisabled] = useState(true);
  const [numCons, setNumCons] = useState(null);
  //const [selectMedicamentsListLoading , setSelectMedicamentsListLoading ] = useState(false);

  const conditionnements = [
    {
      value: "boite",
      libelle: "Boîte(s)",
    },
    {
      value: "plaquette",
      libelle: "Plaquette(s)",
    },
    {
      value: "comprime",
      libelle: "Comprimé(s)",
    },
  ];
  const [qteStock, setQteStock] = useState(0);
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        switch (operationType) {
          case "add":
            const payload = {
              datepresc:
                editPrescription?.datepresc ||
                new Date(values.datepresc).toISOString(),
              num_patient:
                editPrescription?.num_patient || currentPatient.num_patient,
              qte_presc: values.qte_presc,
              cond: values.cond,
              codepresc: editPrescription?.codepresc || "06",
              listActes: medicamentsPrescrites,
              numcons: editPrescription?.numcons || prescription?.numcons,
              numpresc: editPrescription?.numpresc || null,
            };

            if (medicamentsPrescrites.length !== 0) {
              setFormLoading(true);
              postActions(endpoints.prescriptions.ADD, payload)
                .then((response) => {
                  if (response?.data?.Saved) {
                    message.success("Nouvelle ordonnance ajoutée avec succès");
                    setIsPrintDisabled(false);
                    setNumCons(response?.data?.Saved);
                  }
                })
                .finally(() => {
                  setFormLoading(false);
                });
              //setMedicamentsPrescrites([]);
            } else {
              message.warning(
                "Veuillez  sélectionner le ou les médicament(s) à prescrire"
              );
            }

            break;
          case "update":
            break;
          default:
            break;
        }
        form.resetFields();
        navigate(-1);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // const getListMedicaments = () => {
  //     setSelectMedicamentsListLoading(true);
  //     getActions(`${endpoints.actes.list}?codeacte=06`)
  //     .then((response)=>{
  //         setListMedicaments(response.data);
  //         setSelectMedicamentsListLoading(false);
  //     })
  // }

  //const medicamentsFetched = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ORD}`);
  const medicamentsFetched = useFetch(endpoints.fiche_produit.LIST);
  const listMedicaments = medicamentsFetched.data;
  const selectMedicamentsListLoading = medicamentsFetched.isLoading;


  useEffect(() => {
    if (editPrescription === null) {
      setIsPrintDisabled(true);
    } else if (editPrescription?.listActes?.length !== 0) {
      setIsPrintDisabled(false);
    }
  }, [editPrescription]);

  const getQteStock = async (id) => {
    const response = await getActions(
      `${endpoints.saisie_inventaire.STOCK}/${id}`
    );
    return response;
  };

  useEffect(() => {
    form.setFieldValue("qte_pres", qteStock);
  }, [qteStock]);
  return (
    <Card>
      <Flex align="flex-start" justify="space-between">
        <BackButton />
      </Flex>
      <br />

      <Flex align="center" justify="space-between">
        <Title level={4}>
          Prescription ordonnance du patient N° {currentPatient.num_patient} /{" "}
          {currentPatient.prenom_patient} {currentPatient.nom_patient}{" "}
        </Title>
        <Button
          type="primary"
          onClick={() => {
            printPDF(`/api/Print/smed/Prescription/${numCons}/ordonnance`);
          }}
          disabled={isPrintDisabled}
        >
          {" "}
          Imprimer{" "}
        </Button>
      </Flex>

      <br />

      <Form
        form={form}
        layout="vertical"
        onFinish={save}
        onValuesChange={(changedValues, values) => {
          if (changedValues.medicament) {
            const medicamentCode = changedValues.medicament;
            medicamentCode !== null
              ? setPosologieButtonStatus(false)
              : setPosologieButtonStatus(true);
            listMedicaments.forEach((element) => {
              if (element.code_produit === medicamentCode) {
                setMedicamentSelected(element);
                getQteStock(medicamentCode).then((response) => {
                  setQteStock(response?.data);
                });
              }
            });
          }

          if (changedValues.medicament_suggere) {
            const medicamentCode = changedValues.medicament_suggere;
            form.setFieldValue("medicament", medicamentCode);
          }

          if (changedValues.qte_presc) {
            setQuantity(changedValues.qte_presc);
          }
        }}
      >
        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={8} lg={4} xl={4}>
            <Form.Item
              label="Date Ordonnance"
              name="datepresc"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={dayjs(new Date())}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Médicament"
              name="medicament"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Médicament"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                
                loading={selectMedicamentsListLoading}
              >
                {listMedicaments.map((item , index) => (
                  <Option key={index} value={item.code_produit}>
                    {item.libelle_produit}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {medicamentSelected && qteStock === 0 ? (
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Item
                label={`Suggestion famille des ${medicamentSelected.libelle_famille}`}
                name="medicament_suggere"
                rules={[
                  {
                    required: true,
                    message: "Champ obligatoire",
                  },
                ]}
              >
                <Select
                  style={{ width: "100%", background: "transparent" }}
                  showSearch
                  placeholder="Médicament"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {listMedicaments.filter((item) => {
                    return (
                      item.famille === medicamentSelected.famille &&
                      item.code_produit !== medicamentSelected.code_produit 
                      // && item.qte_stock_th > 0
                    );
                  })
                  .map((item) => (
                    <Option key={item.code_produit} value={item.code_produit} disabled={item.qte_stock_th === 0}>
                      {item.libelle_produit} <Tag color={item.qte_stock_th > 0 ? "success" : "error"} >{item.qte_stock_th}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          ) : null}

          {/* <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Form.Item
              label="Quantité en stock"
              name="qte_stock"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={1}
            >
              <InputNumber min={1} /> 
            </Form.Item>
          </Col> */}
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Form.Item
              label="Qte stock"
              name="qte_pres"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={0}
            >
              <InputNumber min={0} disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Conditionnement"
              name="cond"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Conditionnement"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  setConditionnement(value);
                }}
              >
                {conditionnements?.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.libelle}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Form.Item
              label="Qte à prescrire"
              name="qte_presc"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={editPrescription?.qte_presc || 1}
            >
              <InputNumber min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Button
              type="primary"
              ghost
              disabled={posologieButtonStatus}
              onClick={() => {
                //console.log(form.getFieldValue("qte_pres"));

                if (
                  form.getFieldValue("qte_presc") >
                    form.getFieldValue("qte_pres") ||
                  form.getFieldValue("qte_pres") === 0
                ) {
                  Swal.fire({
                    title: "Avertissement!",
                    text: "Quantité en stock insuffisante",
                    icon: "warning",
                    iconColor: "var(--app-color)",
                    showCancelButton: true,
                    cancelButtonColor: "#d33",
                    cancelButtonText: "Annuler",
                    confirmButtonColor: "var(--app-color)",
                    confirmButtonText: "Poursuivre",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setIsModalVisible(true);
                    }
                  });
                } else {
                  setIsModalVisible(true);
                }
              }}
            >
              Posologie
            </Button>
          </Col>
        </Row>
        <br />

        <Title level={5}>Liste des médicaments</Title>
        <DataTable
          dataSourceCopy={medicamentsPrescrites}
          rowKey={(record) => record.codeacte}
          columns={[
            {
              title: "Code",
              dataIndex: "codeacte",
              key: "codeacte",
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
            },
            {
              title: "Conditionnement",
              dataIndex: "cond",
              key: "cond",
              render: (text, record) => {
                return conditionnements.map((item) => {
                  if (item.value === record.cond) {
                    return item.libelle;
                  }
                });
              },
            },
            {
              title: "Posologie",
              dataIndex: "posologie",
              key: "posologie",
            },
            {
              title: "Observation",
              dataIndex: "observation",
              key: "observation",
            },
            {
              width: "auto",
              render: (record) => (
                <Space>
                  <Tooltip title="Supprimer">
                    <DeleteButton
                      onDelete={() => {
                        deletePopup().then((response) => {
                          if (response?.isConfirmed) {
                            const temp = medicamentsPrescrites.filter(
                              (element) => element.codeacte !== record.codeacte
                            );
                            setMedicamentsPrescrites(temp);
                          }
                        });
                      }}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />

        <br />

        <FormFooter
          onCancel={() => {
            navigate(-1);
          }}
          htmlType={"submit"}
          loading={formLoading}
        />
      </Form>

      <Modal
        title={"Posologie"}
        footer={null}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        destroyOnClose
      >
        <Posologie
          medicamentsPrescrites={medicamentsPrescrites}
          setMedicamentsPrescrites={setMedicamentsPrescrites}
          medicamentSelected={medicamentSelected}
          quantity={quantity}
          conditionnement={conditionnement}
          setIsModalVisible={setIsModalVisible}
        />
      </Modal>
    </Card>
  );
};

export default Ordonnance;

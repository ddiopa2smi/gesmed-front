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
  Dropdown,
  Table,
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
import { deletePopup, printPDF, formatMontant } from "../../utils/helpers";
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
    sessionStorage.getItem("editPrescription"),
  );
  // console.log(prescription)
  // console.log(editPrescription)
  const [formLoading, setFormLoading] = useState(false);
  const [operationType, setOperationType] = useState("add");
  //const [listMedicaments , setListMedicaments] = useState([]);
  const [medicamentSelected, setMedicamentSelected] = useState(null);
  const [medicamentsPrescrites, setMedicamentsPrescrites] = useState(
    editPrescription?.listActes || [],
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [posologieButtonStatus, setPosologieButtonStatus] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [conditionnement, setConditionnement] = useState(null);
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
    {
      value: "unite",
      libelle: "Unité(s)",
    },

  ];
  const [qteStock, setQteStock] = useState(0);
  const save = () => {
    form
      .validateFields(["datepresc"])
      .then(() => {
        const values = form.getFieldsValue();
        switch (operationType) {
          case "add":
            const listActes = medicamentsPrescrites.map((acte) => {
              const produit = listMedicaments.find(
                (item) => item.code_produit === acte.codeacte,
              );
              return {
                ...acte,
                tarif: getPrixUnitaire(produit),
              };
            });
            const payload = {
              datepresc:
                editPrescription?.datepresc ||
                new Date(values.datepresc).toISOString(),
              num_patient:
                editPrescription?.num_patient || currentPatient.num_patient,
              code_prescripteur: userConnected?.code_ipm,
              qte_presc: values.qte_presc,
              cond: values.cond,
              codepresc: editPrescription?.codepresc || "06",
              listActes: listActes,
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
                  form.resetFields();
                  //navigate(-1);
                });
              //setMedicamentsPrescrites([]);
            } else {
              message.warning(
                "Veuillez svp renseigner la posologie de ce médicament, cliquer le boutton posologie ci-dessous pour l'ajouter",
              );
            }

            break;
          case "update":
            break;
          default:
            break;
        }
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

  // Prix unitaire d'un produit : le prix de vente pour les produits distribués en boîtes,
  // sinon (prix de vente / quantité d'emballage) arrondi au franc supérieur.
  // Sans quantité d'emballage renseignée, on retombe sur le prix de vente.
  const getPrixUnitaire = (produit) => {
    const prixVente = produit?.prix_vente || 0;
    if (produit?.unite_distribution !== "Boîtes" && produit?.qte_emb > 0) {
      return Math.ceil(prixVente / produit.qte_emb);
    }
    return prixVente;
  };

  const getTarifLigne = (acte) => {
    const produit = listMedicaments.find(
      (item) => item.code_produit === acte.codeacte,
    );
    return getPrixUnitaire(produit) * (acte.qte || 0);
  };

  const totalTarif = medicamentsPrescrites.reduce(
    (acc, acte) => acc + getTarifLigne(acte),
    0,
  );

  useEffect(() => {
    if (editPrescription === null) {
      setIsPrintDisabled(true);
    } else if (editPrescription?.listActes?.length !== 0) {
      setIsPrintDisabled(false);
    }
  }, [editPrescription]);

  const getQteStock = async (id) => {
    const response = await getActions(
      `${endpoints.saisie_inventaire.STOCK}/${id}`,
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

        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: (
                  <span
                    onClick={() => {
                      printPDF(
                        `/api/Print/smed/Prescription/${numCons}/ordonnance`,
                      );
                    }}
                  >
                    Imprimer ordonnance
                  </span>
                ),
              },
              {
                key: "2",
                label: (
                  <span
                    onClick={() => {
                      printPDF(
                        `/api/Print/smed/Prescription/${numCons}/ordonnance_Ticket`,
                      );
                    }}
                  >
                    Format ticket
                  </span>
                ),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="primary" disabled={isPrintDisabled}>
            Imprimer
          </Button>
        </Dropdown>
      </Flex>

      <br />

      <Form
        form={form}
        layout="vertical"
        onFinish={save}
        onValuesChange={(changedValues, values) => {
          // L'unité de distribution est celle de la fiche du médicament sélectionné
          const uniteDistribution = (listMedicaments || []).find(
            (element) => element.code_produit === values.medicament,
          )?.unite_distribution;
          if ("medicament" in changedValues) {
            form.setFieldValue("cond", uniteDistribution);
            setConditionnement(uniteDistribution ?? null);
          }

          const requiredFieldsFilled =
            !!values.datepresc &&
            !!values.medicament &&
            !!uniteDistribution &&
            values.qte_presc !== undefined &&
            values.qte_presc !== null &&
            values.qte_presc > 0;
          setPosologieButtonStatus(!requiredFieldsFilled);

          if (changedValues.medicament) {
            const medicamentCode = changedValues.medicament;
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
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Médicament"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  return option.children
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
                loading={selectMedicamentsListLoading}
              >
                {listMedicaments.map((item, index) => (
                  <Option key={index} value={item.code_produit}>
                    {item.libelle_produit}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* {medicamentSelected && qteStock === 0 ? (
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
                  {listMedicaments
                    .filter((item) => {
                      return (
                        item.famille === medicamentSelected.famille &&
                        item.code_produit !== medicamentSelected.code_produit
                        // && item.qte_stock_th > 0
                      );
                    })
                    .map((item) => (
                      <Option
                        key={item.code_produit}
                        value={item.code_produit}
                        disabled={item.qte_stock_th === 0}
                      >
                        {item.libelle_produit}{" "}
                        <Tag
                          color={item.qte_stock_th > 0 ? "success" : "error"}
                        >
                          {item.qte_stock_th}
                        </Tag>
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          ) : null} */}

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
              initialValue={0}
            >
              <InputNumber min={0} disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Unité de Distribution  "
              name="cond"
            >
              <Input readOnly placeholder="Unité de Distribution" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Form.Item
              label="Qte à prescrire"
              name="qte_presc"
              initialValue={editPrescription?.qte_presc || 1}
            >
              <InputNumber min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Button
              type="primary"
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
        <DataTable compact
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
              align: "center",
            },
            {
              title: "Unité de distribution",
              dataIndex: "cond",
              key: "cond",
              render: (text, record) => {
                // Anciennes prescriptions : code de conditionnement ; nouvelles : unité de distribution du médicament
                return (
                  conditionnements.find((item) => item.value === record.cond)?.libelle ?? record.cond
                );
              },
            },
            {
              title: "Posologie",
              dataIndex: "posologie",
              key: "posologie",
            },
            {
              title: "Montant",
              key: "tarif",
              align: "right",
              render: (record) => formatMontant(getTarifLigne(record)),
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
                              (element) => element.codeacte !== record.codeacte,
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
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text strong>{formatMontant(totalTarif)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        <br />

        <FormFooter
          onCancel={() => {
            navigate(-1);
          }}
          htmlType={"submit"}
          loading={formLoading}
          disabled={medicamentsPrescrites.length === 0}
        />
      </Form>

      <Modal
        style={{ top: 20 }}
        title="Ajouter la posologie"
        footer={null}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        width={700}
        destroyOnClose
      >
        <Posologie
          medicamentsPrescrites={medicamentsPrescrites}
          setMedicamentsPrescrites={setMedicamentsPrescrites}
          medicamentSelected={medicamentSelected}
          quantity={quantity}
          conditionnement={conditionnement}
          setIsModalVisible={setIsModalVisible}
          onValidate={() => {
            form.resetFields(["medicament", "qte_pres", "cond", "qte_presc"]);
            setMedicamentSelected(null);
            setQteStock(0);
            setQuantity(1);
            setConditionnement(null);
            setPosologieButtonStatus(true);
          }}
        />
      </Modal>
    </Card>
  );
};

export default Ordonnance;

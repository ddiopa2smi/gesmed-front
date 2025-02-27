import { DeleteOutlined, EditOutlined, HomeOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  DatePicker,
  Card,
  Col,
  Form,
  Flex,
  Row,
  Select,
  Typography,
  Space,
  InputNumber,
  Button,
  Input,
  Divider,
  Tooltip,
  Descriptions,
  Table,
  Modal,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import CommandeProduitDetails from "../../components/specific/CommandeProduitDetails/CommandeProduitDetails";
import {
  deletePopup,
  formatAmount,
  formatDate,
  sortColumn,
} from "../../utils/helpers";
import EditButton from "../../components/common/EditButton/EditButton";
import EditableCell from "../../components/common/EditableCell/EditableCell";
import EditReceptionCommand from "./components/EditReceptionCommand";
import { postActions } from "../../actions/actions";
const { Option } = Select;
const { Title , Text } = Typography;

function ReceptionCommande() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);
  const {
    data: bonsCommandesList,
    dataCopy: bonsCommandesListCopy,
    setDataCopy: setBonsCommandesListCopy,
    onRefresh,
  } = useFetch(endpoints.commande_produit.LIST);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [listProduitsCommandes, setListProduitsCommandes] = useState(
    currentRecord?.listCom || []
  );

  const [editRecord , setEditRecord] = useState({});

  const calcTotal = () => {
    return listProduitsCommandes?.reduce((acc, item) => {
      return acc + item.prix_unit * item.qte_liv * (1 + item.tva / 100);
    }, 0)
  }
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        values.date_liv = new Date(values.date_liv).toISOString();
        values.date_br = new Date(values.date_br).toISOString();
        const payload = {
          ...values,
          listProd: listProduitsCommandes,
          montant_br: calcTotal(),
          code_fourn: currentRecord?.code_fourn
        };
        
        postActions(endpoints.entrees_produits.ADD, payload)
          .then((response) => {
            if (response?.data) {
              message.success("Commande enregistrée avec succès");
              setOpen(false);
              form.resetFields();
              navigate(-1);
              onRefresh();
            }
          })

          .finally(() => {
            setFormLoading(false);
          });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const edit = (record) => {
    setEditRecord(record);
    setOpenModal(true);
  };

  const onMultipleDelete = () => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        setListProduitsCommandes(
          listProduitsCommandes.filter(
            (item) => !selectedRowKeys.includes(item.code_prod)
          )
        );
      }
    });
  };

  useEffect(() => {
    //console.log(currentRecord);
    form.setFieldValue("code_fourn", currentRecord?.code_fourn);
    form.setFieldValue(
      "date_br",
      currentRecord ? dayjs(currentRecord.date_br) : dayjs(new Date())
    );

    console.log(currentRecord);
    
  }, [currentRecord]);

  return (
    <Card>
      <Title level={3}> Réception de commande </Title>
      <br />
      <Form layout="vertical" form={form} onFinish={save}>
        <Flex align="center" justify="flex-end">
          <Button type="primary" htmlType="submit" loading={formLoading}>
            Enregistrer
          </Button>
        </Flex>
        <Divider orientation="left">Référence du bon de commande</Divider>
        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Form.Item label="Commandes en instances" name="num_bc">
              <Select
                showSearch
                placeholder="choisir"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  setCurrentRecord(
                    bonsCommandesList.find((item) => item.num_bc === value)
                  );
                  setListProduitsCommandes(
                    bonsCommandesList.find((item) => item.num_bc === value)
                      ?.listCom
                  );
                }}
              >
                {bonsCommandesList.filter((item) => item.etat === "send") .map((item) => (
                  <Option key={1} value={item?.num_bc}>
                    {`${item?.num_bc}-${item?.fourn_raisoc}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {currentRecord && (
            <Col xs={24} sm={24} md={4} lg={4} xl={4}>
              <Button
                onClick={() => {
                  setOpen(!open);
                }}
              >
                {open ? "Masquer Détails" : "Voir détails"}
              </Button>
            </Col>
          )}

          {open && currentRecord && (
            <Descriptions
              layout="vertical"
              items={[
                {
                  key: "1",
                  label: "Date de commande",
                  span: 1,
                  children: formatDate(new Date(currentRecord?.date_bc)),
                },
                {
                  key: "2",
                  span: 1,
                  label: "Date de livraison souhaitée",
                  children: formatDate(
                    new Date(currentRecord?.date_liv_souhaitee)
                  ),
                },
                {
                  key: "3",
                  span: 1,
                  label: "Numéro bon de commande",
                  children: currentRecord?.num_bc,
                },
                {
                  key: "4",
                  label: "Numéro offre",
                  span: 1,
                  children: currentRecord?.num_offre,
                },
                {
                  key: "5",
                  label: "Fournisseur",
                  span: 1,
                  children: currentRecord?.fourn_raisoc,
                },
                {
                  key: "6",
                  label: "Montant total",
                  span: 1,
                  children: (
                    <p
                      style={{
                        color: "var(--app-color)",
                        fontWeight: "500",
                        fontSize: 18,
                      }}
                    >
                      {formatAmount(currentRecord?.montant_bc)}
                    </p>
                  ),
                },
              ]}
            />
          )}
        </Row>

        <Divider orientation="left">
          Référence du bon de livraison fournisseur
        </Divider>
        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Form.Item
              name="date_liv"
              label="Date BL"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
              initialValue={dayjs(new Date())}
            >
              <DatePicker placeholder="Choisir la date" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Form.Item
              name="num_bl"
              label="Numéro BL"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left">Bon de réception</Divider>

        <Row gutter={[24, 24]} align={"top"} >
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Row gutter={[24, 24]} align={"middle"}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item label="Date de réception" name="date_br">
                  <DatePicker
                    placeholder="Choisir la date"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[24, 24]} align={"middle"}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Title level={4} style={{color: "var(--app-color)"}} >
                  Total: {formatAmount(calcTotal())}
                </Title>
              </Col>
            </Row>
          </Col>
          <Col xs={24} sm={24} md={18} lg={18} xl={18}>
            <div>
              <Flex justify="space-between" align="center">
                <Text>Liste des produits</Text>
                {listProduitsCommandes.length !== 0 && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      onMultipleDelete();
                    }}
                    disabled={selectedRowKeys.length === 0}
                    danger
                  >
                    Supprimer
                  </Button>
                )}
              </Flex>

              <DataTable
                dataSource={[]}
                dataSourceCopy={listProduitsCommandes || []}
                setDataSourceCopy={setListProduitsCommandes}
                rowKey={(record) => record.code_prod}
                rowSelected
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                columns={[
                  {
                    title: "Référence",
                    dataIndex: "code_prod",
                    key: "code_prod",
                  },
                  {
                    title: "Désignation",
                    dataIndex: "libelle_produit",
                  },
                  {
                    title: "Quantité commandée",
                    dataIndex: "qte_com",
                    key: "qte_com",
                    sorter: (a, b) => sortColumn(a.qte_com, b.qte_com),
                    render: (record) => (
                      <div
                        className="table-data"
                        style={{ textAlign: "center" }}
                      >
                        {record}
                      </div>
                    ),
                  },
                  {
                    title: "Quantité livrée",
                    dataIndex: "qte_liv",
                    key: "qte_com",
                    sorter: (a, b) => sortColumn(a.qte_liv, b.qte_liv),
                    render: (record) => (
                      <div
                        className="table-data"
                        style={{ textAlign: "center" }}
                      >
                        {record}
                      </div>
                    ),
                  },
                  {
                    title: "P.U (HT)",
                    dataIndex: "prix_unit",
                    key: "prix_unit",
                    sorter: (a, b) => sortColumn(a.prix_unit, b.prix_unit),
                    render: (record) => (
                      <div
                        className="table-data"
                        style={{ textAlign: "right" }}
                      >
                        {formatAmount(record)}{" "}
                      </div>
                    ),
                  },
                  {
                    title: "Montant (HT)",
                    render: (record) => (
                      <div
                        className="table-data"
                        style={{ textAlign: "right" }}
                      >
                        {formatAmount(record.prix_unit * record.qte_liv)}
                      </div>
                    ),
                  },
                  {
                    title: "Montant TVA",
                    render: (record) => (
                      <div
                        className="table-data"
                        style={{ textAlign: "right" }}
                      >
                        {formatAmount(
                          record.prix_unit * record.qte_liv * (record.tva / 100)
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "Montant (TTC)",
                    render: (record) =>
                      formatAmount(
                        record.prix_unit *
                          record.qte_liv *
                          (1 + record.tva / 100)
                      ),
                  },
                  {
                    fixed: "right",
                    render: (record) => (
                      <Flex align="center">
                        <Space>
                          <Tooltip title="Modifier">
                            <EditButton
                              onEdit={() => {
                                edit(record);
                              }}
                            />
                          </Tooltip>
                        </Space>
                      </Flex>
                    ),
                  },
                ]}
              />
            </div>
          </Col>
        </Row>
      </Form>

      <Modal
        style={{ top: 20 }}
        styles={{
          header: { padding: "12px 24px" },
          footer: { padding: "12px 24px" },
          content: { margin: 0, padding: 0 },
          body: {
            overflow: "auto",
            //minHeight: "50vh",
            maxHeight: "80vh",
            padding: "12px 24px",
          },
        }}
        title={`${editRecord?.code_prod} - ${editRecord?.libelle_produit}`}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setCurrentRecord(null);
        }}
        footer={null}
        destroyOnClose
      >
        <EditReceptionCommand
          editRecord={editRecord}
          listProduitsCommandes={listProduitsCommandes}
          setListProduitsCommandes={setListProduitsCommandes}
          setOpen={setOpenModal}
        />
      </Modal>

      <Divider />
    </Card>
  );
}

export default ReceptionCommande;

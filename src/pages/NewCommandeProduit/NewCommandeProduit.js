import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import dayjs from "dayjs";
import { DeleteOutlined, EditOutlined, HomeOutlined } from "@ant-design/icons";
import DataTable from "../../components/common/DataTable/DataTable";
import DetailsCommande from "../../components/specific/DetailsCommande/DetailsCommande";
import { deletePopup, formatAmount, sortColumn } from "../../utils/helpers";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { getActions, postActions, putActions } from "../../actions/actions";

//import DataTable from '../../shared/DataTable/DataTable';

const { Option } = Select;
const { Title, Text } = Typography;

function NewCommandeProduit() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { state } = useLocation();
  const currentRecord = state?.currentRecord || null;
  const [montantTotal, setMontantTotal] = useState(0);

  const [formLoading, setFormLoading] = useState(false);

  const {
    data: listProduits,
    isLoading,
    error,
  } = useFetch(endpoints.fiche_produit.LIST);
  const [listProduitsCommandes, setListProduitsCommandes] = useState([]);
  const { data: listFournisseurs, isLoading: listFournisseursLoading } =
    useFetch(endpoints.fournisseurs.LIST);

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);

        if (currentRecord === null) {
          const payload = {
            ...values,
            date_liv_souhaitee: new Date(
              values.date_liv_souhaitee
            ).toISOString(),
            date_bc: new Date(values.date_bc).toISOString(),
            listCom: listProduitsCommandes,
            montant_bc: listProduitsCommandes?.reduce((acc, item) => {
              return acc + item.prix_unit * item.qte_com * (1 + item.tva / 100);
            }, 0),
          };

          postActions(endpoints.commande_produit.ADD, payload)
            .then((response) => {
              if (response?.data) {
                message.success(
                  "Nouvelle commande produit ajoutée avec succès"
                );
                form.resetFields();
                navigate(-1);
              }
            })
            .finally(() => {
              setFormLoading(false);
            });
        } else {
          const payload = {
            ...currentRecord,
            date_liv_souhaitee: new Date(
              values.date_liv_souhaitee
            ).toISOString(),
            date_bc: new Date(values.date_bc).toISOString(),
            listCom: listProduitsCommandes,
            montant_bc: listProduitsCommandes?.reduce((acc, item) => {
              return acc + item.prix_unit * item.qte_com * (1 + item.tva / 100);
            }, 0),
          };

          putActions(`${endpoints.commande_produit.UPDATE}`, payload)
            .then((response) => {
              if (response?.data) {
                message.success("Données de la commande modifiées avec succès");
                navigate(-1);
              }
            })
            .finally(() => {
              setFormLoading(false);
            });
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // useEffect(() => {
  //   getActions(
  //     `${endpoints.commande_produit.GET_DETAILS}/${currentRecord?.num_bc}`
  //   ).then((response) => {
  //     if (response?.data) {
  //       setListProduitsCommandes(response?.data);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    if (currentRecord !== null) {
      form.setFieldsValue({
        ...currentRecord,
        date_liv_souhaitee: dayjs(currentRecord.date_liv_souhaitee),
        date_bc: dayjs(currentRecord.date_bc),
      });
      setListProduitsCommandes(currentRecord.listCom);
    } else {
      form.setFieldsValue({
        date_liv_souhaitee: dayjs(new Date()),
        date_bc: dayjs(new Date()),
        ...currentRecord,
      });
    }
  }, [currentRecord]);

  // useEffect(() => {
  //   console.log(listProduitsCommandes);
  // }, [listProduitsCommandes]);

  return (
    <Card>
      <Form layout="vertical" form={form} onFinish={save}>
        <Title level={3}>
          {currentRecord?.num_bc
            ? `Modification de la commande produit ${currentRecord?.num_bc}`
            : `Nouvelle commande produit`}
        </Title>
        <Flex align="center" justify="flex-end">
          <Space>
            <Button type="primary" danger onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit">
              Enregistrer
            </Button>
          </Space>
        </Flex>
        <Divider orientation="left">En-tête Bon de commande</Divider>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item
              label="Date commande"
              name="date_bc"
              //initialValue={dayjs(new Date())}
            >
              <DatePicker
                placeholder="Choisir la date"
                disabled
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item label="Numéro Offre" name="num_offre">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item
              label="Date de livraison souhaitée"
              name="date_liv_souhaitee"
              //initialValue={dayjs(new Date())}
            >
              <DatePicker placeholder="Date de livraison" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item
              label="Fournisseur"
              name="code_fourn"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={"F001"}
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Choisir..."
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                loading={listFournisseursLoading}
              >
                {listFournisseurs.map((item, index) => (
                  <Option key={index} value={item?.fourn_code}>
                    {item?.fourn_raisoc}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* <DetailsCommande 
                    listProduitsCommandes={listProduitsCommandes}
                    setListProduitsCommandes={setListProduitsCommandes}
                />

                <br /> */}
      </Form>

      <DetailsCommande
        listProduitsCommandes={listProduitsCommandes}
        setListProduitsCommandes={setListProduitsCommandes}
        currentRecord={currentRecord}
      />

      <br />

      {/* <p>
        Total commande :{" "}
        {formatAmount(
          listProduitsCommandes?.reduce(
            (acc, item) => acc + item.montant_ttc,
            0
          )
        )}
      </p> */}
      <DataTable
        title={
          <p
            style={{
              color: "var(--app-color)",
              fontWeight: "500",
              fontSize: 24,
            }}
          >
            {`Total commande : ${formatAmount(
              listProduitsCommandes?.reduce((acc, item) => {
                console.log(item.qte_com);

                return (
                  acc + item.prix_unit * item.qte_com * (1 + item.tva / 100)
                );
              }, 0)
            )}`}
          </p>
        }
        dataSource={[]}
        dataSourceCopy={listProduitsCommandes || []}
        setDataSourceCopy={setListProduitsCommandes}
        rowKey={(record) => record.code_prod}
        columns={[
          {
            title: "Référence",
            dataIndex: "code_prod",
            key: "code_prod",
            // render: (record) => <div className='table-data'>
            //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
            // </div> ,
          },
          {
            title: "Désignation",
            // dataIndex: "libelle",
            // key: "libelle",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}>
                  {
                    listProduits?.find(
                      (item) => item.code_produit === record.code_prod
                    )?.libelle_produit
                  }
                </span>
              </div>
            ),
            //sorter: (a, b) => sortColumn(a.produit, b.produit),
          },
          {
            title: "Quantité commandée",
            dataIndex: "qte_com",
            key: "qte_com",
            render: (record) => (
              <div
                className="table-data"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
            sorter: (a, b) => sortColumn(a.qte_com, b.qte_com),
            //sortOrder: sortedInfo.columnKey === 'quantite' ? sortedInfo.order : null,
          },
          {
            title: "P.U (HT)",
            dataIndex: "prix_unit",
            key: "prix_unit",
            // render: (record) => <div className='table-data'>
            //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
            // </div> ,
            sorter: (a, b) => sortColumn(a.prix_unit, b.prix_unit),
            render: (record) => formatAmount(record),
            //sortOrder: sortedInfo.columnKey === 'pu' ? sortedInfo.order : null,
          },
          {
            // title: "Montant (HT)",
            // dataIndex: "montant_ht",
            // key: "montant_ht",
            // sorter: (a, b) => sortColumn(a.montant_ht, b.montant_ht),
            // render: (record) => formatAmount(record),
            title: "Montant (HT)",
            render: (record) => formatAmount(record.prix_unit * record.qte_com),
          },
          {
            // title: "Montant TVA",
            // dataIndex: "montant_tva",
            // key: "montant_tva",
            // sorter: (a, b) => sortColumn(a.montant_tva, b.montant_tva),
            // render: (record) => formatAmount(record),
            title: "Montant TVA",
            render: (record) =>
              formatAmount(
                record.prix_unit * record.qte_com * (record.tva / 100)
              ),
          },
          {
            // title: "Montant (TTC)",
            // dataIndex: "montant_ttc",
            // key: "montant_ttc",
            // sorter: (a, b) => sortColumn(a.montant_ttc, b.montant_ttc),
            // render: (record) => formatAmount(record),
            title: "Montant (TTC)",
            render: (record) =>
              formatAmount(
                record.prix_unit * record.qte_com * (1 + record.tva / 100)
              ),
          },
          {
            render: (record) => (
              <Flex align="center">
                <Space size="middle">
                  <Tooltip title="Supprimer">
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        deletePopup().then((response) => {
                          if (response.isConfirmed) {
                            const temp = listProduitsCommandes.filter(
                              (element) =>
                                element.code_prod !== record.code_prod
                            );
                            setListProduitsCommandes(temp);
                          }
                        });
                      }}
                    />
                  </Tooltip>
                </Space>
              </Flex>
            ),
          },
        ]}
      />
    </Card>
  );
}

export default NewCommandeProduit;

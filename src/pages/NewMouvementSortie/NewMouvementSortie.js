import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  HomeOutlined,
} from "@ant-design/icons";
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
  Radio,
  message,
  Modal,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import DataTable from "../../components/common/DataTable/DataTable";
import {
  deletePopup,
  formatDate,
  insertObjectIntoDataTableAfterIndex,
  sortColumn,
} from "../../utils/helpers";
import { useImportFile } from "../../utils/hooks/useImportFile.tsx";
import ExportFile from "../../components/common/ExportFile/ExportFile";
import ExcellExportButton from "../../components/common/ExcellExportButton/ExcellExportButton";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import BackButton from "../../components/common/BackButton/BackButton";
import { postActions } from "../../actions/actions";
const { Option } = Select;
const { Title, Text } = Typography;

function NewMouvementSortie() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { state } = useLocation();
  const currentRecord = state?.currentRecord;
  
  const [motif, setMotif] = useState("Comptoir");
  const [expectedHeaders, setExpectedHeaders] = useState([
    "reference",
    "designation",
    "qte",
  ]);
  const { file, setFile, data } = useImportFile(expectedHeaders);
  const [operationType, setOperationType] = useState("");
  const [open, setOpen] = useState(false);
  const [listProduits, setListProduits] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        const payload = {
          ...values,
          date_sortie: new Date(values.date_sortie).toISOString(),
          listProd: listProduits,
        };
        postActions(endpoints.sorties_produits.ADD, payload)
          .then((response) => {
            if (response?.data) {
              message.success("Opération effectuée avec succès");
              setOpen(false);
              form.resetFields();
              navigate(-1);
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

  const onExport = () => {
    setOpen(true);
    setOperationType("exp");
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Désignation",
      dataIndex: "designation",
      key: "designation",
      sorter: (a, b) => sortColumn(a.designation, b.designation),
    },
    {
      title: "Quantité",
      dataIndex: "qte",
      key: "qte",
      sorter: (a, b) => sortColumn(a.qte, b.qte),
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
                      const temp = listProduits.filter(
                        (element) => element.reference !== record.reference
                      );
                      setListProduits(temp);
                    }
                  });
                }}
              />
            </Tooltip>
          </Space>
        </Flex>
      ),
    },
  ];

  useEffect(() => {
    if (currentRecord !== undefined && currentRecord !== null) {
      form.setFieldsValue(currentRecord);
      form.setFieldValue("date_sortie", dayjs(currentRecord.date_sortie));
    }
  }, [currentRecord])
  

  useEffect(() => {
    setListProduits(data);
  }, [data]);

  useEffect(() => {
    if (motif === "Perime") {
      setExpectedHeaders([
        "reference",
        "designation",
        "qte",
        "date_peremption",
      ]);
    }
  }, [motif]);

  return (
    <Card>
      <Flex justify="flex-start" align="flex-start">
        <BackButton />
      </Flex>
      <br />

      <Form
        layout="vertical"
        form={form}
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.motif_sortie) {
            setMotif(changedValues.motif_sortie);
          }
        }}
        onFinish={save}
      >
        <Flex align="center" justify="space-between">
          <Title level={3}> {currentRecord ? `Modification sortie ${currentRecord?.num_sortie}` : "Mouvement de sortie"} </Title>
          <Space>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              Enregistrer
            </Button>
          </Space>
        </Flex>
        <br />
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              label="Motif de sortie"
              name="motif_sortie"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
              initialValue={"Comptoir"}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value={"Comptoir"}>Livraison comptoir</Radio>
                  <Radio value={"Perime"}>Produits périmés</Radio>
                  <Radio value={"Gratuit"}>Déstockage (gratuité)</Radio>
                  <Radio value={"Defaut"}>Défaut</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="date_sortie"
              label="Date"
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
        </Row>

        {/* <br/>
                <FormFooter onCancel={()=>{navigate(-1)}} /> */}
      </Form>

      <AddProduit
        listProduits={listProduits}
        setListProduits={setListProduits}
        motif={motif}
      />

      <Flex justify="flex-end">
        <Space>
          <Tooltip title="Importer">
            <Button
              type="primary"
              ghost
              icon={<DownloadOutlined style={{ fontSize: "20px" }} />}
            >
              Importer
              <input
                type="file"
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                }}
                onChange={(e) => setFile(e.target.files[0])}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
            </Button>
          </Tooltip>
          <ExcellExportButton onClick={onExport} />
        </Space>
      </Flex>

      <DataTable
        dataSource={listProduits}
        dataSourceCopy={listProduits}
        setDataSourceCopy={setListProduits}
        rowKey={(record) => record.reference}
        columns={
          motif === "Perime"
            ? insertObjectIntoDataTableAfterIndex(
                columns,
                {
                  title: "Date de péremption",
                  dataIndex: "date_peremption",
                  key: "date_peremption",
                  render: (record) => (
                    <div className="table-data">{formatDate(record)}</div>
                  ),
                },
                "qte"
              )
            : columns
        }
      />

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
        //width={1000}
        title="Exporter la liste"
        open={open}
        onCancel={() => {
          setOpen(false);
          //setOperationType("");
        }}
        footer={null}
        destroyOnClose
      >
        {operationType === "exp" &&
          (listProduits.length === 0 ? (
            <Flex align="center" justify="center" style={{ height: "20vh" }}>
              <Text>Pas de données à exporter</Text>
            </Flex>
          ) : (
            <ExportFile
              title="Liste des produits sortis"
              data={listProduits}
              setOpen={setOpen}
            />
          ))}
      </Modal>
    </Card>
  );
}

const AddProduit = ({ listProduits, setListProduits, motif }) => {
  const [form] = Form.useForm();
  const [produitSelected, setProduitSelected] = useState(null);
  const { data: produitsList } = useFetch(endpoints.fiche_produit.LIST);

  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        let inc = 0;
        let index = 0;
        let payload = {
          reference: values.code_produit,
          designation: produitSelected.libelle_produit,
          qte: values.qte,
        };

        if (values.date_peremption) {
          payload = {
            ...payload,
            date_peremption: new Date(values.date_peremption).toISOString(),
          };
        }

        // Tester l'existence du produit dans la table des produits si oui incrementer inc
        for (let i = 0; i < listProduits.length; i++) {
          if (listProduits[i].reference === payload.reference) {
            inc += 1;
            index = i;
          }
        }

        if (inc === 1) {
          message.info(
            "Produit existant déjà dans la table des produits , mais modifié avec succès"
          );
          const temp = [...listProduits];
          temp[index] = payload;
          setListProduits(temp);
        } else {
          const temp = [...listProduits];
          temp.push(payload);
          setListProduits(temp);
          form.resetFields();
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      onValuesChange={(changedValues, allValues) => {
        if (changedValues.code_produit) {
          const product = produitsList.find(
            (produit) => produit.code_produit === changedValues.code_produit
          );
          setProduitSelected(product);
          form.setFieldValue("qte", product.qte_stock_th);
        }
      }}
    >
      <Divider orientation="left">Liste des produits</Divider>
      <Row gutter={[24, 24]} align={"middle"}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Form.Item
            label="Produits"
            name="code_produit"
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
              placeholder="choisir"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children[1].toLowerCase().includes(input.toLowerCase())
              }
            >
              {produitsList?.map((produit, index) => (
                <Option key={index} value={produit?.code_produit}>
                  {produit?.libelle_produit}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
          <Form.Item
            label="Quantité"
            name="qte"
            rules={[
              {
                required: true,
                message: "Champ obligatoire",
              },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        {motif === "Perime" && (
          <Col xs={24} sm={24} md={8} lg={6} xl={6}>
            <Form.Item
              name="date_peremption"
              label="Date de péremption"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
            >
              <DatePicker
                placeholder="Choisir la date"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
          <Button type="primary" htmlType="submit">
            Ajouter
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default NewMouvementSortie;

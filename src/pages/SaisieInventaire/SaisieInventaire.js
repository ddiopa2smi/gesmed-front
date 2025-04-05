import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  HomeOutlined,
  UploadOutlined,
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
  Divider,
  Tooltip,
  Modal,
  Tag,
  Input,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import DataTable from "../../components/common/DataTable/DataTable";
import { deletePopup, formatDate } from "../../utils/helpers";
import AddSaisie from "../../components/specific/AddSaisie/AddSaisie";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import Swal from "sweetalert2";
import EditProduit from "./components/EditProduit";
import ExcellExportButton from "../../components/common/ExcellExportButton/ExcellExportButton";
import { deleteActions, postActions, putActions } from "../../actions/actions";
import ExportFile from "../../components/common/ExportFile/ExportFile";
import { useImportFile } from "../../utils/hooks/useImportFile.tsx";
const { Option } = Select;
const { Title } = Typography;

function SaisieInventaire() {
  const navigate = useNavigate();
  //const { file, setFile, data } = useImportFile(["code_prod","stk_th","stk_reel","ecart","libelle_produit"]);
  const { file, setFile, data } = useImportFile(["code_prod","stk_th","stk_reel","ecart","libelle_produit"]);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [dateSaisie, setDateSaisie] = useState(new Date());
  const [selectedInventaire, setSelectedInventaire] = useState(null);
  const [listInv, setListInv] = useState([]);
  const [operationType, setOperationType] = useState("");
  const [editRecord, setEditRecord] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const {
    data: listInventaires,
    dataCopy,
    setDataCopy,
    isLoading,
    onRefresh,
  } = useFetch(endpoints.saisie_inventaire.LIST);
  const onAdd = () => {
    setOperationType("add");
    let pendingCount = 0;
    listInventaires?.forEach((element) => {
      if (element?.inv_etat === "pending") {
        pendingCount += 1;
      }
    });
    if (pendingCount > 0) {
      Swal.fire("Attention", "Un inventaire en cours", "warning");
      return;
    }
    setOpen(true);
  };

  const onEdit = (record) => {
    setOpen(true);
    setOperationType("update");
    setEditRecord(record);
  };

  const onDelete = (id) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(`${endpoints.saisie_inventaire.DELETE}/${id}`).then(
          (response) => {
            if (response?.data) {
              message.success("Element retiré avec succès");
              onRefresh();
            }
          }
        );
      }
    });
  };

  const onExport = () => {
    setOpen(true);
    setOperationType("exp");
  };

  const onValid = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        //console.log(values);

        // values.date_liv = new Date(values.date_liv).toISOString();
        // values.date_br = new Date(values.date_br).toISOString();
        const payload = {
          ...values,
          listInv: listInv,
        };

        putActions(endpoints.saisie_inventaire.VALIDATE, payload)
          .then((response) => {
            if (response?.data) {
              message.success("Inventaire validé avec succès");
              setOpen(false);
              form.resetFields();
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

  useEffect(() => {
    form.setFieldValue(
      "inv_num",
      listInventaires[listInventaires.length - 1]?.inv_num
    );

    if (listInventaires) {
      setListInv(listInventaires[listInventaires.length - 1]?.listInv);
    }

    // Matcher directement le dernier inventaire de la liste
    setSelectedInventaire(listInventaires[listInventaires.length - 1]);
  }, [dateSaisie, listInventaires]);

  useEffect(() => {
    if (selectedInventaire) {
      setListInv(selectedInventaire?.listInv);
    }
  }, [selectedInventaire]);

  useEffect(() => {
    setListInv(data);
  }, [data]);

  
  return (
    <Card>
      <Title level={3}>
        Saisie inventaire pharmacie
        {selectedInventaire && ` au ${formatDate(selectedInventaire?.inv_date)}`}
      </Title>
      <br />
      <Form layout="vertical" form={form} onFinish={onValid}>
        <Flex justify="flex-end" align="center">
          <Space>
            <Button
              type="primary"
              onClick={() => onDelete(selectedInventaire?.inv_num)}
              disabled={
                listInv === undefined || listInv?.length === 0 ||
                selectedInventaire?.inv_etat === "valid" 
              }
              danger
            >
              Supprimer
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={
                listInv === undefined || listInv?.length === 0 ||
                selectedInventaire?.inv_etat === "valid"
              }
            >
              Valider
            </Button>
            <Button type="primary" ghost onClick={onAdd}>
              Nouveau
            </Button>
          </Space>
        </Flex>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="inv_num"
              label="Liste des inventaires"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
            >
              <Select
                onChange={(value) =>
                  setSelectedInventaire(
                    listInventaires.find((item) => item.inv_num === value)
                  )
                }
              >
                {listInventaires?.map((item, index) => (
                  <Option key={index} value={item.inv_num}>
                    {item.inv_num}-
                    {item.inv_etat === "pending" ? (
                      <span color="cyan"> En cours </span>
                    ) : item.inv_etat === "valid" ? (
                      <span color="green">Validée</span>
                    ) : null}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Flex>
              <Space>
                <Button
                  type="primary"
                  onClick={() => onDelete(selectedInventaire?.inv_num)}
                  danger
                >
                  Supprimer
                </Button>
              </Space>
            </Flex>
          </Col> */}
        </Row>

        <Divider orientation="left">Liste des produits</Divider>
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
              {/* <div
                style={{ position: "sticky", width: "40px", height: "40px" }}
              >
                <div style={{ position: "absolute" }}>
                  <Button type="text" icon={<UploadOutlined />} />
                </div>
                <input
                  type="file"
                  style={{ opacity: 0, width: "100%", height: "100%" }}
                  onChange={(e) => setFilePath(e.target.files[0])}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
              </div> */}
            </Tooltip>
            <ExcellExportButton onClick={onExport} />
          </Space>
        </Flex>
        <DataTable
          dataSource={listInv || []}
          dataSourceCopy={
            listInv?.map((item) => ({
              ...item,
              ecart: item.stk_reel - item.stk_th,
            })) || []
          }
          setDataSourceCopy={setListInv}
          columns={[
            {
              title: "Code",
              dataIndex: "code_prod",
              key: "code_prod",
            },
            {
              title: "Libellé",
              dataIndex: "libelle_produit",
              key: "libelle_produit",
              render: (record) => (
                <div className="table-data">
                  <span style={{ textOverflow: "ellipsis" }}> {record} </span>
                </div>
              ),
            },
            {
              title: "Stock théorique",
              dataIndex: "stk_th",
              key: "stk_th",
            },
            {
              title: "Stock réel",
              dataIndex: "stk_reel",
              key: "stk_reel",
            },
            {
              title: "Ecart",
              dataIndex: "ecart",
              key: "ecart",
            },
            // {
            //   title: "Ecart",
            //   render: (record) => (
            //     <div className="table-data">
            //       <span style={{ textOverflow: "ellipsis" }}>
            //         {record?.stk_reel - record?.stk_th}
            //       </span>
            //     </div>
            //   ),
            // },
            {
              render: (record) => (
                <Flex align="center">
                  <Space size="middle">
                    <Tooltip title="Editer">
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          onEdit(record);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <Button type="link" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Space>
                </Flex>
              ),
            },
          ]}
        />
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
        //width={1000}
        title={
          operationType === "update"
            ? "Modifier produit"
            : operationType === "exp"
            ? "Exporter la liste"
            : "Saisie de date d'inventaire"
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          //setOperationType("");
        }}
        footer={null}
        destroyOnClose
      >
        {operationType === "update" ? (
          <EditProduit
            editRecord={editRecord}
            setOpen={setOpen}
            listInv={listInv}
            setListInv={setListInv}
          />
        ) : operationType === "exp" ? (
          <ExportFile
            title="Liste des produits"
            data={listInv}
            setOpen={setOpen}
          />
        ) : (
          <AddSaisie
            setDate={setDateSaisie}
            date={dateSaisie}
            setOpen={setOpen}
            form={form}
            onRefresh={onRefresh}
          />
        )}
      </Modal>
    </Card>
  );
}

export default SaisieInventaire;

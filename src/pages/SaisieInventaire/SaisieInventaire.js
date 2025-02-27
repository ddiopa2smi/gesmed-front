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
  Divider,
  Tooltip,
  Modal,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import DataTable from "../../components/common/DataTable/DataTable";
import { formatDate } from "../../utils/helpers";
import AddSaisie from "../../components/specific/AddSaisie/AddSaisie";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
const { Option } = Select;
const { Title } = Typography;

function SaisieInventaire() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [dateSaisie, setDateSaisie] = useState(new Date());
  const { data : listInventaires, dataCopy, setDataCopy, isLoading, onRefresh } = useFetch(
    endpoints.saisie_inventaire.LIST
  );
  const onAdd = () => {
    setOpen(true);
  };

  useEffect(() => {
    console.log(dateSaisie);
  }, [dateSaisie]);

  return (
    <Card>
      <Flex justify="space-between" align="center">
        <Title level={3}> Saisie inventaire </Title>
        <Button type="primary" onClick={onAdd}>
          Nouveau
        </Button>
      </Flex>
      <br />
      <Form layout="vertical" form={form}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name="Liste des inventaires"
              label="inventaire"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
            >
              <Select>
                {
                    listInventaires?.map((inventaire , index) => (
                      <Option key={index} value={inventaire.inv_num}>
                        {inventaire.inv_num}
                      </Option>
                    ))
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={8} lg={12} xl={12}>
            <Form.Item label="Produits" name="code_produit">
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="choisir"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={1} value={"produit"}>
                  {" "}
                  produit{" "}
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Form.Item label="Quantité" name="qte">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8} lg={4} xl={4}>
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
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Button type="primary"> Ajouter </Button>
          </Col>
        </Row>

        <Divider orientation="left">Liste des produits</Divider>

        <DataTable
          dataSource={[]}
          dataSourceCopy={[]}
          setDataSourceCopy={null}
          columns={[
            {
              title: "Code",
              dataIndex: "code",
              key: "code",
            },
            {
              title: "Désignation",
              dataIndex: "designation",
              key: "designation",
            },
            {
              title: "Stock théorique",
              dataIndex: "stock_theorique",
              key: "stock_theorique",
              render: (record) => (
                <div className="table-data">
                  <span style={{ textOverflow: "ellipsis" }}> {record} </span>
                </div>
              ),
            },
            {
              title: "Stock réel",
              dataIndex: "stock_reel",
              key: "stock_reel",
              render: (record) => (
                <div className="table-data">
                  <span style={{ textOverflow: "ellipsis" }}>
                    {" "}
                    {formatDate(record)}{" "}
                  </span>
                </div>
              ),
            },
            {
              title: "Ecart",
              dataIndex: "ecart",
              key: "ecart",
              render: (record) => (
                <div className="table-data">
                  <span style={{ textOverflow: "ellipsis" }}>
                    {" "}
                    {formatDate(record)}{" "}
                  </span>
                </div>
              ),
            },
            {
              render: (record) => (
                <Flex align="center">
                  <Space size="middle">
                    <Tooltip title="Editer">
                      <Button type="link" icon={<EditOutlined />} />
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
        <br />
        <FormFooter
          onCancel={() => {
            navigate(-1);
          }}
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
        title={"Saisie de date d'inventaire"}
        open={open}
        onCancel={() => {
          setOpen(false);
          //setOperationType("");
        }}
        footer={null}
      >
        <AddSaisie
          setDate={setDateSaisie}
          date={dateSaisie}
          setOpen={setOpen}
        />
      </Modal>
    </Card>
  );
}

export default SaisieInventaire;

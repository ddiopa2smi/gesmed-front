import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Image,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useState } from "react";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import test_img from "./../../assets/test_img.jpg";
import { codesPrescriptions } from "../../constants/app.constants";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

function PrescriptionsGroupes() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useFetch(endpoints.patients.LIST);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const medicamentsFetched = useFetch(
    `${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ORD}`
  );
  const listMedicaments = medicamentsFetched.data;
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  return (
    <Card>
      PrescriptionsGroupes
      <Button type="primary">Prescrire</Button>
      <Button
        type="primary"
        onClick={() => {
          setOpen(true);
        }}
      >
        Sélectionner patient
      </Button>
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={24} md={6} lg={4} xl={4}>
          <Select
            style={{ width: "100%", background: "transparent" }}
            showSearch
            placeholder="Type de prescription"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children[1].toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={1} value={codesPrescriptions.ORD}>
              Ordonnance
            </Option>
            <Option key={2} value={codesPrescriptions.ANA}>
              Analyse
            </Option>
            <Option key={3} value={codesPrescriptions.IMG}>
              Imagerie
            </Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
          <Select
            mode="multiple"
            style={{
              width: "100%",
            }}
            loading={isLoading}
            placeholder="Sélectionner le ou les patients concernés"
            //defaultValue={["china"]}
            onChange={handleChange}
            options={data.map((item) => {
              return {
                label: `${item.prenom_patient} ${item.nom_patient}`,
                value: item.num_patient,
                ...item,
              };
            })}
            showSearch
            //filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
            optionRender={(option) => (
              <Space>
                <Image
                  src={test_img}
                  width={25}
                  height={25}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />

                {option.label}
              </Space>
            )}
            allowClear
          />
        </Col>
      </Row>
      <Row gutter={[24, 24]} align={"middle"}>
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
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
              loading={medicamentsFetched.isLoading}
            >
              {listMedicaments.map((item) => (
                <Option key={item.codeacte} value={item.codeacte}>
                  {" "}
                  {item.libacte}{" "}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
          <Form.Item
            label="Quantité en stock"
            rules={[
              {
                required: true,
                message: "Sélection obligatoire",
              },
            ]}
            initialValue={1}
          >
            <InputNumber disabled /> 
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
            initialValue={1}
          >
            <InputNumber min={1} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={4} lg={4} xl={4}>
          <Button
            type="primary"
            ghost
            //disabled={posologieButtonStatus}
            // onClick={() => {
            //   setIsModalVisible(true);
            // }}
          >
            Posologie
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

export default PrescriptionsGroupes;

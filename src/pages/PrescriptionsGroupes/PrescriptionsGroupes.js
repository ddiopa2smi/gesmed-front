import { Card, Col, Form, Image, Row, Select, Space, Typography } from "antd";
import React, { useState } from "react";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import test_img from "./../../assets/test_img.jpg";
import { codesPrescriptions } from "../../constants/app.constants";
import Ordonnance from "../Ordonnance/Ordonnance";
import Analyse from "../Analyse/Analyse";
import Imagerie from "../Imagerie/Imagerie";
import GroupOrdonnance from "../../components/specific/GroupOrdonnance/GroupOrdonnance";
import GroupAnalyse from "../../components/specific/GroupAnalyse/GroupAnalyse";
import GroupImagerie from "../../components/specific/GroupImagerie/GroupImagerie";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import { useNavigate } from "react-router";

const { Option } = Select;
const { Title } = Typography;

function PrescriptionsGroupes() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [formLoading , setFormLoading] = useState(false);
  const { data, isLoading } = useFetch(endpoints.patients.LIST);
  const [prescriptionType, setPrescriptionType] = useState(
    codesPrescriptions.ORD
  );
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const save = () => {};
  return (
    <Card>
      <Title level={3}>Prescriptions groupées</Title>
      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={6} lg={4} xl={4}>
            <Form.Item
              label="Type de prescription"
              name="prescription_type"
              initialValue={prescriptionType}
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
                placeholder="Type de prescription"
                onChange={(value) => setPrescriptionType(value)}
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
            </Form.Item>
          </Col>
        </Row>

        {prescriptionType === codesPrescriptions.ORD && <GroupOrdonnance />}
        {prescriptionType === codesPrescriptions.ANA && <GroupAnalyse />}
        {/*{prescriptionType === codesPrescriptions.IMG && <GroupImagerie />} */}

        <br />
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              label="Patients concernés"
              name="patients_list"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
            >
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
            </Form.Item>
          </Col>
        </Row>

        <FormFooter
          onCancel={() => {
            navigate(-1);
          }}
          htmlType={"submit"}
          loading={formLoading}
        />
      </Form>
    </Card>
  );
}

export default PrescriptionsGroupes;

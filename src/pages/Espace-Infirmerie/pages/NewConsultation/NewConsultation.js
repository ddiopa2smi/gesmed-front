import { Card, Col, DatePicker, Flex, Form, Row, Select } from "antd";
import React from "react";
import BackButton from "../../../../components/common/BackButton/BackButton";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;
function NewConsultation() {
  const [form] = Form.useForm();
  const save = () => {
    console.log("save");
  };
  return (
    <Card>
      <Flex justify="flex-start" align="center">
        <BackButton />
      </Flex>
      <br />
      <Form
        layout="vertical"
        form={form}
        name="consultation_form"
        initialValues={null}
        onFinish={save}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item name="date_consultation" label="Date de consultation">
              <DatePicker disabled format="dddd, DD MMMM YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              label="Infirmier responsable"
              name="infirmier"
              style={{ width: "100%" }}
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Sélectionner l'infirmier concerné"
                optionFilterProp="children"
                loading={false}
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
              >
                {[
                  { id: 1, name: "Dr Paki Chenzu" },
                  { id: 2, name: "Dr Pacome DURANT" },
                ].map((item, key) => (
                  <Option key={key} value={item.id}>
                    {" "}
                    {item.name}{" "}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item name="date_consultation" label="Date de consultation">
              <DatePicker disabled format="dddd, DD MMMM YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Symptômes relevés" name="symptomes">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Diagnostic posé" name="diagnostic">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Traitement prescrit" name="traitement">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default NewConsultation;

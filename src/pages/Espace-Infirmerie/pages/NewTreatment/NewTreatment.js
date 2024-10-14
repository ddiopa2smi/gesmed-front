import {
  Card,
  Col,
  Input,
  DatePicker,
  Flex,
  Form,
  Row,
  Select,
  InputNumber,
} from "antd";
import React from "react";
import BackButton from "../../../../components/common/BackButton/BackButton";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;
function NewTreatment() {
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
              <DatePicker format="dddd, DD MMMM YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item name="frequence" label="Fréquences d'administration">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item name="dose" label="Doses administrées">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              label="Infirmier/Soignant"
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
            <Form.Item name="duree" label="Durée de traitement">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Observations" name="observations">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default NewTreatment;

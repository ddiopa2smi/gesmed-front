import { Button, Card, Flex, Form, Row, Select, Typography } from "antd";
import React from "react";
import { useParams } from "react-router";

const { Title } = Typography;
const { Option } = Select;
function TraitementAnalyse() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const save = () => {
    alert("save");
  };
  return (
    <Card>
      <Flex justify="space-between" align="center">
        <Title level={3}> Traitement de l'analyse {id} </Title>
        <Button type="primary"> Valider le résultat </Button>
      </Flex>
      <Form
        layout="vertical"
        form={form}
        name="analyse_form"
        initialValues={null}
        onFinish={save}
      >
        <Row gutter={[24, 24]}>
          <Form.Item
            label="Nature analyse"
            name="nature_analyse"
          >
            <Select
              style={{ width: "100%", background: "transparent" }}
              showSearch
              placeholder="Nature analyse"
              optionFilterProp="children"
              ///loading={pathologiesLoading}
              filterOption={(input, option) =>
                option.children[1].toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option key={1} value="analyse1"> ANALYSE1 </Option>
            </Select>
          </Form.Item>
        </Row>
      </Form>
    </Card>
  );
}

export default TraitementAnalyse;

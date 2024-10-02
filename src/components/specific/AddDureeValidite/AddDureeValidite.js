import { Col, Form, Input, InputNumber, message, Row, Typography } from "antd";
import React, { useState } from "react";
import FormFooter from "../../common/FormFooter/FormFooter";
import { postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";

const { Text } = Typography;
function AddDureeValidite() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        postActions(endpoints.motifs.ADD, values).then((response) => {
          if (response.data) {
            setLoading(false);
            message.success("Enregistrement effectué avec succès");
            form.resetFields();
          }
        });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  return (
    <div>
      <Text type="secondary" >
        Toutes vos consultations expireront après le délai de 1h de temps, veuillez configurer votre délai
      </Text>
      <Form
        form={form}
        layout="vertical"
        initialValues={null}
        onFinish={save}
        preserve
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Form.Item
              name="libelle_motifcons"
              label="Durée"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                  min: 1,
                },
              ]}
              initialValue={1}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Entrer une durée en heure(s)"
              />
            </Form.Item>
            <FormFooter onCancel={() => {}} loading={loading} htmlType="submit" />

          </Col>
        </Row>

      </Form>
    </div>
  );
}

export default AddDureeValidite;

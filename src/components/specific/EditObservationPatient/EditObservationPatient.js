import { Button, Flex, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useState } from "react";
import FormFooter from "../../common/FormFooter/FormFooter";
import { EditOutlined } from "@ant-design/icons";

function EditObservationPatient({ observation }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  return editable ? (
    <Form form={form} layout="vertical" onFinish={save} preserve={false}>
      <Form.Item
        name="obs_pat"
        //label="Observation"
        rules={[
          {
            required: true,
            message: "Sélection obligatoire",
          },
        ]}
      >
        <TextArea rows={4} value={observation} placeholder="Ajouter des observations" />
      </Form.Item>
      <FormFooter
        htmlType="submit"
        onCancel={() => {
          setEditable(false);
        }}
      />
    </Form>
  ) : (
    <Flex align="center" gap={4}>
      <div>{observation ? observation : "Pas d'observations"}</div>
      <Button
        type="text"
        size="small"
        onClick={() => {
          setEditable(true);
        }}
        icon={<EditOutlined />}
      />
    </Flex>
  );
}

export default EditObservationPatient;

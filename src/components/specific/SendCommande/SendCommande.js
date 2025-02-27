import React, { useEffect, useState } from "react";
import { endpoints } from "../../../constants/endpoints.constants";
import { DatePicker, Form, message, Col, Row } from "antd";
import FormFooter from "../../common/FormFooter/FormFooter";
import { putActions } from "../../../actions/actions";
import dayjs from "dayjs";
import Title from "antd/es/skeleton/Title";

function SendCommande({ setOpen, onRefresh, currentRecord }) {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        const payload = {
          ...currentRecord,
          date_envoi: new Date(values.date_envoi).toISOString(),
        };
        //console.log(payload);

        putActions(endpoints.commande_produit.UPDATE_DATE_ENVOI, payload)
          .then((response) => {
            if (response?.data === "Updated") {
              message.success("Commande envoyée avec succès");
              onRefresh();
              setOpen(false);
            }
          })
          .finally(() => setFormLoading(false));
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  useEffect(() => {
    form.setFieldValue(
      "date_envoi",
      dayjs(
        currentRecord?.date_envoi === null
          ? new Date()
          : new Date(currentRecord.date_envoi)
      )
    );
  }, []);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={save}
      currentRecord={currentRecord}
    >
      <Title level={3} > Numéro : {currentRecord?.num_bc} </Title>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            label="Date d'envoi"
            name="date_envoi"
            rules={[
              {
                required: true,
                message: "Ce champ est obligatoire",
              },
            ]}
          >
            <DatePicker placeholder="Sélectionner" showTime />
          </Form.Item>
        </Col>
      </Row>

      <FormFooter
        loading={formLoading}
        onCancel={() => {
          setOpen(false);
        }}
        htmlType="submit"
      />
    </Form>
  );
}

export default SendCommande;

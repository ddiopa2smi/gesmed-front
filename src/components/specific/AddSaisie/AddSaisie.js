import { Col, DatePicker, Form, message, Row } from "antd";
import React, { useEffect, useState } from "react";
import FormFooter from "../../common/FormFooter/FormFooter";
import dayjs from "dayjs";
import { formatDate } from "../../../utils/helpers";
import { postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
function AddSaisie({ date, setDate, setOpen , onRefresh }) {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        const payload = {
          inv_num: "INV" + formatDate(values.date_saisie).split("/").join(""),
          inv_date: new Date(values.date_saisie).toISOString(),
        };
        //console.log(payload);

        postActions(endpoints.saisie_inventaire.ADD, payload)
          .then((response) => {
            if (response?.data) {
              message.success("Traitement éffectué avec succès");
              setDate(response?.data?.inv_date)
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
    form.setFieldValue("date_saisie", dayjs(date));
  }, []);
  return (
    <div>
      <Form form={form} layout="vertical" onFinish={save}>
        <Row>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item
              label="Date de saisie"
              name="date_saisie"
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
    </div>
  );
}

export default AddSaisie;

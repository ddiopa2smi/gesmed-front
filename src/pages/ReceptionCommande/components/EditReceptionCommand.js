import {
  Col,
  Form,
  Row,
  Calendar,
  message,
  Typography,
  Select,
  DatePicker,
  Input,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import { postActions, putActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import FormFooter from "../../../components/common/FormFooter/FormFooter.js";
import dayjs from "dayjs";
import useFetch from "../../../utils/hooks/useFetch";
import { ServiceType } from "../../../utils/types/types.ts";

function EditReceptionCommand({
  setOpen,
  listProduitsCommandes,
  setListProduitsCommandes,
  editRecord,
}) {
  const [form] = Form.useForm();
  //console.log(editRecord);
  

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        //console.log(values);
        setListProduitsCommandes(
            listProduitsCommandes.map((item) => {
              if (item.code_prod === editRecord.code_prod) {
                return {
                  ...item,
                  qte_liv: values.qte_liv,
                };
              }
              return item;
            })
        )
        setOpen(false);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={editRecord}
      onFinish={save}
    >
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="qte_com"
            label="Quantité Commandée"
            rules={[
              {
                required: true,
                message: "Ce champ est obligatoire",
              },
            ]}
          >
            <InputNumber disabled />
          </Form.Item>
          <Form.Item
            name="qte_liv"
            label="Entrer la quantité livrée"
            rules={[
              {
                required: true,
                message: "Ce champ est obligatoire",

              },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null) {
                    return Promise.reject("Ce champ est obligatoire");
                  }
                  if (isNaN(value)) {
                    return Promise.reject("La quantité livrée doit être un nombre");
                  }
                  if (value < 0) {
                    return Promise.reject("La quantité livrée doit être positive");
                  }
                  if (value > editRecord?.qte_com) {
                    return Promise.reject(
                      "La quantité livrée ne doit pas dépasser la quantité commandée"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={0} max={editRecord?.qte_com} />
          </Form.Item>
        </Col>
      </Row>

      <FormFooter
        onCancel={() => {
          setOpen(false);
        }}
        htmlType="submit"
      />
    </Form>
  );
}

export default EditReceptionCommand;

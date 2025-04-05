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

function EditProduit({
  setOpen,
  listInv,
  setListInv,
  editRecord,
}) {
  const [form] = Form.useForm();
  console.log(editRecord);

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        //console.log(values);
        setListInv(
          listInv.map((item) => {
            if (item.code_prod === editRecord.code_prod) {
              return {
                ...item,
                stk_reel: values.stk_reel,
              };
            }
            return item;
          })
        );
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
      preserve
    >
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="libelle_produit"
            label="Libellé"
            rules={[
              {
                required: true,
                message: "Ce champ est obligatoire",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Stock réel"
            name="stk_reel"
            rules={[
              {
                required: true,
                message: "Ce champ est obligatoire",
              },
            //   {
            //     validator: (_, value) => {
            //       if (value === undefined || value === null) {
            //         return Promise.reject("Ce champ est obligatoire");
            //       }
            //       if (isNaN(value)) {
            //         return Promise.reject(
            //           "La quantité livrée doit être un nombre"
            //         );
            //       }
            //       if (value < 0) {
            //         return Promise.reject(
            //           "La quantité livrée doit être positive"
            //         );
            //       }
            //       if (value > editRecord?.qte_com) {
            //         return Promise.reject(
            //           "La quantité livrée ne doit pas dépasser la quantité commandée"
            //         );
            //       }
            //       return Promise.resolve();
            //     },
            //   },
            ]}
          >
            <InputNumber min={0} /*max={editRecord?.stk_reel}*/ />
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

export default EditProduit;

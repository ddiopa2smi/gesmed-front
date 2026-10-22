import React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  Upload,
  message,
} from "antd";
import { useState } from "react";
import FormFooter from "../../common/FormFooter/FormFooter";
import { putActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";

const { Option } = Select;
const { Title } = Typography;

function UpdatePassword({ record, onClose }) {
  const [loading, setLoading] = useState(false);
  const regexCode =
    "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";

  const save = () => {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        const payload = {
          login : record.login,
          new_password : values.new_password,
        }
        putActions(endpoints.users.UPDATE_PASSWORD, payload).then((response) => {
          if (response.data.status === "OK") {
            message.success("Mots de passe mises à jour avec succès");
            onClose();
          }
        });
      })
      .catch((info) => {
        setLoading(false);
        console.log("Validate Failed:", info);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [form] = Form.useForm();
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={save}
        initialValues={record}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="new_password"
              label="Mot de passe"
              help="Le mot de passe doit contenir au moins 8 caractères qui doivent inclure une majuscule, une minuscule, un chiffre et un caractère spécial"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const regex = new RegExp(regexCode);
                    if (regex.test(value)) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject(
                        new Error("Ce mot de passe n'est pas valide")
                      );
                    }
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password minLength={8} placeholder="Votre mot de passe" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              name="password_confirm"
              label="Confirmation de mot de passe"
              dependencies={["new_password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "La confirmation ne correspond pas à votre mot de passe entré"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                minLength={8}
                placeholder="Confirmer votre mot de passe"
              />
            </Form.Item>
          </Col>
        </Row>
        <FormFooter
          onCancel={() => {
            onClose();
          }}
          htmlType={"submit"}
          loading={loading}
        />
      </Form>
    </div>
  );
}

export default UpdatePassword;

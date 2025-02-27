import {
  Button,
  Col,
  Divider,
  Form,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import React, { useEffect } from "react";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions } from "../../../constants/app.constants";

const { Option } = Select;
function DetailsCommande({ listProduitsCommandes, setListProduitsCommandes , currentRecord }) {
  const [form] = Form.useForm();
  const {
    data: listProduits,
    isLoading,
    error,
  } = useFetch(endpoints.fiche_produit.LIST);
  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        let inc = 0; // increment
        let index = 0;
        
        const payload = {
          ...values,
          code_prod: values.code_prod,
          // qte_liv: values.qte_com,
          libelle: listProduits.find(
            (item) => item.code_produit === values.code_prod
          ).libelle_produit,
          num_bc : currentRecord?.num_bc || null,
          // montant_ht: (values.prix_unit * values.qte_com).toFixed(2),
          // montant_tva: (values.prix_unit * values.qte_com * (values.tva / 100)).toFixed(2),
          // montant_ttc:
          //   (values.prix_unit * values.qte_com * (1 + values.tva / 100)).toFixed(2),
        };
        
        // Tester l'existence du produit dans la table des produits si oui incrementer inc
        for (let i = 0; i < listProduitsCommandes.length; i++) {
          if (listProduitsCommandes[i].code_prod === payload.code_prod) {
            inc += 1;
            index = i;
          }
        }

        if (inc === 1) {
          message.success(
            "Infos du produit existant modifié avec succès"
          );
          const temp = [...listProduitsCommandes];
          temp[index] = payload;
          // console.log(temp)
          setListProduitsCommandes(temp);
        } else {
          const temp = [...listProduitsCommandes];
          temp.push(payload);
          setListProduitsCommandes(temp);
          form.resetFields();
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        //preserve={false}
        onValuesChange={(changedValues, values) => {
          if (changedValues.code_prod) {
            form.setFieldValue(
              "prix_unit",
              listProduits.find(
                (item) => item.code_produit === changedValues.code_prod
              )?.prix_achat
            );
          }
        }}
      >
        <Divider orientation="left">Détails commande</Divider>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item
              label="Produit"
              name="code_prod"
              rules={[
                {
                  required: true,
                  message: "Sélection obligatoire",
                },
              ]}
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Choisir..."
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                loading={isLoading}
              >
                {listProduits.map((item) => (
                  <Option key={item.code_produit} value={item.codeacte}>
                    {item.libelle_produit}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} lg={4} xl={4}>
            <Form.Item
              label="Quantité"
              name="qte_com"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={1}
            >
              <InputNumber min={1} />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} lg={4} xl={4}>
            <Form.Item
              label="TVA"
              name="tva"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={18}
            >
              <InputNumber suffix="%" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={8} lg={4} xl={4}>
            <Form.Item
              label="P.U (HT)"
              name="prix_unit"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} xl={4}>
            <Button type="primary" htmlType="submit">
              Ajouter
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default DetailsCommande;

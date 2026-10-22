import { EditOutlined, OrderedListOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { codesPrescriptions } from "../../constants/app.constants";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import GestionFamillesMedoc from "../../components/specific/GestionFamillesMedoc/GestionFamillesMedoc";
import GestionConditionnements from "../../components/specific/GestionConditionnements/GestionConditionnements";
import GestionFormesGaleniques from "../../components/specific/GestionFormesGaleniques/GestionFormesGaleniques";
import { postActions, putActions } from "../../actions/actions";
import BackButton from "../../components/common/BackButton/BackButton";

const { Title } = Typography;
const { Option } = Select;

function FicheProduit() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const currentRecord = state?.currentRecord;
  const [form] = Form.useForm();
  const {
    data: listMedicaments,
    isLoading,
    error,
  } = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ORD}`);
  const {
    data: familleMedocsList,
    isLoading: familleMedocsListLoading,
    onRefresh: listFamilleMedocRefresh,
  } = useFetch(endpoints.familleMedoc.LIST);
  const {
    data: conditionnementsList,
    isLoading: conditionnementsListLoading,
    onRefresh: conditionnementsListRefresh,
  } = useFetch(endpoints.conditionnements.LIST);
  const {
    data: formesGaleniqueList,
    isLoading: formesGaleniqueListLoading,
    onRefresh: formesGaleniqueListRefresh,
  } = useFetch(endpoints.forme_galenique.LIST);

  const [open, setOpen] = useState(false);

  // Paramètre dont la fenêtre de gestion est ouverte : "FORME_GALENIQUE", "FAMILLE_MEDOC", "CONDITIONNEMENT" ou null
  const [gestionOuverte, setGestionOuverte] = useState(null);

  const [formLoading, setFormLoading] = useState(false);

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        if (currentRecord === null) {
          postActions(endpoints.fiche_produit.ADD, values)
            .then((response) => {
              if (response?.data) {
                message.success("Nouvelle fiche produit ajoutée avec succès");
                form.resetFields();
                navigate(-1);
              }
            })
            .finally(() => {
              setFormLoading(false);
            });
        } else {
          //console.log(values)
          putActions(`${endpoints.fiche_produit.UPDATE}`, values)
            .then((response) => {
              if (response?.data) {
                message.success(
                  "Informations du produit modifiées avec succès"
                );
              }
            })
            .finally(() => {
              setFormLoading(false);
            });
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const getMedocObjectByCodeActe = (id, list) => {
    let obj = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].codeacte === id) {
        obj = list[i];
      }
    }

    return obj;
  };

  return (
    <Card className="FicheProduitWrapper">
      <Flex justify="flex-start" align="center">
        <BackButton />
      </Flex>
      <Flex justify="flex-end" align="center">
        <Space>
          <Tooltip title="Actualiser">
            <Button
              type="primary"
              icon={<OrderedListOutlined />}
              onClick={() => {
                navigate("/espace-pharmacie/gestion-fiche-produits");
              }}
            >
              Liste des produits
            </Button>
          </Tooltip>
        </Space>
      </Flex>
      <Title level={3}>
        {" "}
        {currentRecord === null
          ? "Fiche Produit"
          : `Modification Fiche Produit ${currentRecord?.code_produit}`}{" "}
      </Title>
      <br />
      <Form
        layout="vertical"
        form={form}
        onFinish={save}
        initialValues={currentRecord}
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.code_produit) {
            const obj = getMedocObjectByCodeActe(
              changedValues.code_produit,
              listMedicaments
            );
            form.setFieldValue("code_cip", obj.codeacte);
            form.setFieldValue("libelle_produit", obj.libacte);
            // form.setFieldValue("reference",generateRandomCode())
          }
        }}
      >
        {currentRecord === null && (
          <Row gutter={[24, 24]}>
            {/* <Col xs={24} sm={12} md={8} lg={12} xl={12}>
              <Form.Item
                label="DCI (Dénomination commune internationale)"
                name="dci"
              >
                <Select
                  style={{ width: "100%", background: "transparent" }}
                  showSearch
                  placeholder="Choisir..."
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={isLoading}
                >
                  {listMedicaments.map((item) => (
                    <Option key={item.codeacte} value={item.codeacte}>
                      {" "}
                      {item.libacte}{" "}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
            <Col xs={24} sm={12} md={8} lg={12} xl={12}>
              <Form.Item label="DCI (Dénomination commune internationale)" name="code_produit">
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
                  {listMedicaments.map((item) => (
                    <Option key={item.codeacte} value={item.codeacte}>
                      {" "}
                      {item.libacte}{" "}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider orientation="left">Identification</Divider>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              label="Désignation"
              name="libelle_produit"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              label="Code CIP"
              name="code_cip"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              label="Référence interne"
              name="code_produit"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              style={{
                display: "none",
              }}
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Flex align="center">
              <Form.Item
                label="Forme galénique"
                name="forme"
                style={{ width: "90%" }}
              >
                <Select
                  style={{ width: "100%", background: "transparent" }}
                  showSearch
                  placeholder="Choisir..."
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={formesGaleniqueListLoading}
                  allowClear
                >
                  {formesGaleniqueList
                    .filter((item) => item?.type === "UNITE_PRISE")
                    .map((item, key) => (
                      <Option key={key} value={item?.code_forme}>
                        {" "}
                        {item?.libelle_forme}{" "}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Tooltip title="Gérer les formes galéniques">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setGestionOuverte("FORME_GALENIQUE")}
                />
              </Tooltip>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Flex align="center" justify="flex-start">
              <Form.Item
                label="Famille"
                name="famille"
                style={{ width: "90%" }}
              >
                <Select
                  style={{ width: "100%", background: "transparent" }}
                  showSearch
                  placeholder="Choisir..."
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  isLoading={familleMedocsListLoading}
                  allowClear
                >
                  {familleMedocsList.map((item, key) => (
                    <Option key={key} value={item?.code_famille}>
                      {" "}
                      {item?.libelle_famille}{" "}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Tooltip title="Gérer les familles">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setGestionOuverte("FAMILLE_MEDOC")}
                />
              </Tooltip>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Flex align="center">
              <Form.Item
                label="Conditionnement"
                name="cond"
                style={{ width: "90%" }}
              >
                <Select
                  style={{ width: "100%", background: "transparent" }}
                  showSearch
                  placeholder="Choisir..."
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  allowClear
                  isLoading={conditionnementsListLoading}
                >
                  {conditionnementsList.map((item, index) => (
                    <Option key={index} value={item?.cond_code}>
                      {" "}
                      {item?.cond_lib}{" "}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Tooltip title="Gérer les conditionnements">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setGestionOuverte("CONDITIONNEMENT")}
                />
              </Tooltip>
            </Flex>
          </Col>
        </Row>

        <Row gutter={30}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Descriptif" name="descriptif" initialValue="spec">
              <Radio.Group>
                <Radio value="spec">Spécialité</Radio>
                <Radio value="gen">Générique</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Statut" name="statut" initialValue="payant">
              <Radio.Group>
                <Radio value="payant">Payant</Radio>
                <Radio value="gratuit">Gratuit</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Unité de Distribution" name="unite_distribution">
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Choisir..."
                optionFilterProp="label"
                allowClear
                options={[
                  { value: "Ampoules buvables", label: "Ampoules buvables" },
                  { value: "Ampoules injectables", label: "Ampoules injectables" },
                  { value: "Boîtes", label: "Boîtes" },
                  { value: "Comprimés", label: "Comprimés" },
                  { value: "Gélules", label: "Gélules" },
                  { value: "Matériel", label: "Matériel" },
                  { value: "Ovules", label: "Ovules" },
                  { value: "Pommade", label: "Pommade" },
                  { value: "Sachets", label: "Sachets" },
                  { value: "Unités", label: "Unités" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Tarif</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Prix d'achat" name="prix_achat">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Prix de vente" name="prix_vente">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item label="Unité de vente" name="unite_vente">
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Choisir..."
                optionFilterProp="children"
              //filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
              >
                {/* {
                                    pathologiesList.map((item , key)=>(
                                        <Option key={key}  value={item.code_patho} > {item.libelle_patho} </Option>
                                    ))
                                } */}
                <Option key={"1"} value="Boite">
                  {" "}
                  Boite{" "}
                </Option>
                <Option key={"2"} value="Comprime">
                  {" "}
                  Comprimés{" "}
                </Option>
                <Option key={"3"} value="Plaquette">
                  {" "}
                  Plaquettes{" "}
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left">Autres</Divider>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item label="Emplacement" name="emplacement">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item label="Refrigéré?" name="refrigere" initialValue={false}>
              <Radio.Group>
                <Radio value={true}>Oui</Radio>
                <Radio value={false}>Non</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item
              label="Quantité stock mini"
              name="qte_stock_mini"
              initialValue={10}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
            <Form.Item
              label="Délai péremption (jours)"
              name="delai_peremtion"
              initialValue={10}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <br />
        <FormFooter loading={formLoading} htmlType="submit" />
      </Form>

      {/* <Modal 
                // styles={{
                //     header : {
                //         background : "red"
                //     }
                // }}
                width={1000}
                title="Liste des produits" 
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    //setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                <ListProduits />
            </Modal> */}

      <Modal
        title="Formes galéniques (unités de prise)"
        width={900}
        open={gestionOuverte === "FORME_GALENIQUE"}
        onCancel={() => setGestionOuverte(null)}
        footer={null}
        destroyOnClose
      >
        <GestionFormesGaleniques
          formesGaleniqueList={formesGaleniqueList}
          isLoading={formesGaleniqueListLoading}
          onRefresh={formesGaleniqueListRefresh}
        />
      </Modal>

      <Modal
        title="Familles de médicaments"
        width={900}
        open={gestionOuverte === "FAMILLE_MEDOC"}
        onCancel={() => setGestionOuverte(null)}
        footer={null}
        destroyOnClose
      >
        <GestionFamillesMedoc
          familleMedocsList={familleMedocsList}
          isLoading={familleMedocsListLoading}
          onRefresh={listFamilleMedocRefresh}
        />
      </Modal>

      <Modal
        title="Conditionnements"
        width={900}
        open={gestionOuverte === "CONDITIONNEMENT"}
        onCancel={() => setGestionOuverte(null)}
        footer={null}
        destroyOnClose
      >
        <GestionConditionnements
          conditionnementsList={conditionnementsList}
          isLoading={conditionnementsListLoading}
          onRefresh={conditionnementsListRefresh}
        />
      </Modal>
    </Card>
  );
}

export default FicheProduit;

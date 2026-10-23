import {
  AppstoreOutlined,
  CloseOutlined,
  DollarOutlined,
  EditOutlined,
  InboxOutlined,
  MedicineBoxOutlined,
  OrderedListOutlined,
  SaveOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { codesPrescriptions, LOGO_BROWN } from "../../constants/app.constants";
import GestionFamillesMedoc from "../../components/specific/GestionFamillesMedoc/GestionFamillesMedoc";
import GestionConditionnements from "../../components/specific/GestionConditionnements/GestionConditionnements";
import GestionFormesGaleniques from "../../components/specific/GestionFormesGaleniques/GestionFormesGaleniques";
import { postActions, putActions } from "../../actions/actions";
import BackButton from "../../components/common/BackButton/BackButton";
import { formatMontant } from "../../utils/helpers";
import { getPrixUnitaire } from "../../utils/tarifProduit";

const { Title, Text } = Typography;

const UNITES_DISTRIBUTION = [
  "Ampoules buvables", "Ampoules injectables", "Boîtes", "Comprimés", "Gélules",
  "Matériel", "Ovules", "Pommade", "Sachets", "Unités",
].map((value) => ({ value, label: value }));

const UNITES_VENTE = [
  { value: "Boite", label: "Boîte" },
  { value: "Comprime", label: "Comprimés" },
  { value: "Plaquette", label: "Plaquettes" },
];

// Section de la fiche : carte avec titre et icône
const Section = ({ icon, title, children }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Card
      size="small"
      title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>}
      style={{ marginBottom: 16, height: "calc(100% - 16px)" }}
    >
      {children}
    </Card>
  );
};

// Select d'un référentiel avec accès à sa fenêtre de gestion
const ReferentielSelect = ({ label, name, options, loading, onManage, manageTitle }) => (
  <Form.Item label={label}>
    <Flex gap={6}>
      <Form.Item name={name} noStyle>
        <Select
          showSearch
          allowClear
          placeholder="Choisir..."
          optionFilterProp="label"
          loading={loading}
          options={options}
        />
      </Form.Item>
      <Tooltip title={manageTitle}>
        <Button icon={<EditOutlined />} onClick={onManage} />
      </Tooltip>
    </Flex>
  </Form.Item>
);

function FicheProduit() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { token: { colorPrimary, colorFillAlter, colorBgContainer, colorBorderSecondary } } = theme.useToken();
  const currentRecord = state?.currentRecord;
  // Création si la page est ouverte sans produit (state absent ou currentRecord null)
  const isNouveau = !currentRecord;
  const [form] = Form.useForm();
  const {
    data: listMedicaments,
    isLoading,
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

  // Paramètre dont la fenêtre de gestion est ouverte : "FORME_GALENIQUE", "FAMILLE_MEDOC", "CONDITIONNEMENT" ou null
  const [gestionOuverte, setGestionOuverte] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Valeurs suivies pour l'aperçu des prix
  const libelle = Form.useWatch("libelle_produit", form);
  const prixAchat = Form.useWatch("prix_achat", form);
  const prixVente = Form.useWatch("prix_vente", form);
  const qteEmb = Form.useWatch("qte_emb", form);
  const uniteDistribution = Form.useWatch("unite_distribution", form);
  const prixUnitaire = getPrixUnitaire({ prix_vente: prixVente, qte_emb: qteEmb, unite_distribution: uniteDistribution });
  const vendueAuDetail = uniteDistribution && uniteDistribution !== "Boîtes";
  const marge = prixAchat > 0 && prixVente > 0 ? Math.round(((prixVente - prixAchat) / prixAchat) * 100) : null;

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        if (isNouveau) {
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
          putActions(`${endpoints.fiche_produit.UPDATE}`, values)
            .then((response) => {
              if (response?.data) {
                message.success("Informations du produit modifiées avec succès");
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

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        onFinish={save}
        initialValues={currentRecord}
        onValuesChange={(changedValues) => {
          if (changedValues.code_produit) {
            const obj = (listMedicaments || []).find((item) => item.codeacte === changedValues.code_produit);
            if (obj) {
              form.setFieldValue("code_cip", obj.codeacte);
              form.setFieldValue("libelle_produit", obj.libacte);
            }
          }
        }}
      >
        {/* En-tête */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
          <Flex justify="space-between" align="center" wrap gap={16}>
            <Flex align="center" gap={16} wrap>
              <BackButton />
              <div>
                <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: colorPrimary }}>
                  <MedicineBoxOutlined /> {isNouveau ? "Nouvelle fiche produit" : "Modification de la fiche produit"}
                </Text>
                <Title level={3} style={{ margin: 0, color: LOGO_BROWN }}>
                  {libelle || (isNouveau ? "Nouveau produit" : currentRecord?.libelle_produit)}
                </Title>
                {!isNouveau && <Tag color="processing">{currentRecord?.code_produit}</Tag>}
              </div>
            </Flex>
            <Button
              icon={<OrderedListOutlined />}
              onClick={() => navigate("/espace-pharmacie/gestion-fiche-produits")}
            >
              Liste des produits
            </Button>
          </Flex>
        </Card>

        <Row gutter={16}>
          {/* Identification */}
          <Col xs={24} xl={12}>
            <Section icon={<TagsOutlined />} title="Identification">
              {isNouveau && (
                <Form.Item
                  label="DCI (Dénomination commune internationale)"
                  name="code_produit"
                  rules={[{ required: true, message: "Choisir le médicament" }]}
                  extra="La désignation et le code CIP sont repris automatiquement."
                >
                  <Select
                    size="large"
                    showSearch
                    placeholder="Rechercher un médicament"
                    optionFilterProp="label"
                    loading={isLoading}
                    options={(listMedicaments || []).map((item) => ({ value: item.codeacte, label: item.libacte }))}
                  />
                </Form.Item>
              )}
              <Row gutter={16}>
                <Col xs={24} md={14}>
                  <Form.Item label="Désignation" name="libelle_produit" rules={[{ required: true, message: "Champ obligatoire" }]}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item label="Code CIP" name="code_cip" rules={[{ required: true, message: "Champ obligatoire" }]}>
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              {/* Référence interne, renseignée par le choix de la DCI */}
              {!isNouveau && (
                <Form.Item name="code_produit" hidden rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              )}
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Descriptif" name="descriptif" initialValue="spec" style={{ marginBottom: 0 }}>
                    <Radio.Group optionType="button" buttonStyle="solid">
                      <Radio value="spec">Spécialité</Radio>
                      <Radio value="gen">Générique</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Statut" name="statut" initialValue="payant" style={{ marginBottom: 0 }}>
                    <Radio.Group optionType="button" buttonStyle="solid">
                      <Radio value="payant">Payant</Radio>
                      <Radio value="gratuit">Gratuit</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Section>
          </Col>

          {/* Classification */}
          <Col xs={24} xl={12}>
            <Section icon={<AppstoreOutlined />} title="Classification">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <ReferentielSelect
                    label="Forme galénique"
                    name="forme"
                    loading={formesGaleniqueListLoading}
                    options={(formesGaleniqueList || [])
                      .filter((item) => item?.type === "UNITE_PRISE")
                      .map((item) => ({ value: item.code_forme, label: item.libelle_forme }))}
                    onManage={() => setGestionOuverte("FORME_GALENIQUE")}
                    manageTitle="Gérer les formes galéniques"
                  />
                </Col>
                <Col xs={24} md={12}>
                  <ReferentielSelect
                    label="Famille"
                    name="famille"
                    loading={familleMedocsListLoading}
                    options={(familleMedocsList || []).map((item) => ({ value: item.code_famille, label: item.libelle_famille }))}
                    onManage={() => setGestionOuverte("FAMILLE_MEDOC")}
                    manageTitle="Gérer les familles"
                  />
                </Col>
                <Col xs={24} md={12}>
                  <ReferentielSelect
                    label="Conditionnement"
                    name="cond"
                    loading={conditionnementsListLoading}
                    options={(conditionnementsList || []).map((item) => ({ value: item.cond_code, label: item.cond_lib }))}
                    onManage={() => setGestionOuverte("CONDITIONNEMENT")}
                    manageTitle="Gérer les conditionnements"
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Unité de distribution"
                    name="unite_distribution"
                    tooltip="Unité dans laquelle le produit est servi au patient (utilisée dans les ordonnances)"
                  >
                    <Select showSearch allowClear placeholder="Choisir..." optionFilterProp="label" options={UNITES_DISTRIBUTION} />
                  </Form.Item>
                </Col>
              </Row>
            </Section>
          </Col>

          {/* Tarif */}
          <Col xs={24} xl={12}>
            <Section icon={<DollarOutlined />} title="Tarif">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Prix d'achat" name="prix_achat">
                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="FCFA" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Prix de vente" name="prix_vente">
                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="FCFA" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Unité de vente" name="unite_vente">
                    <Select allowClear placeholder="Choisir..." options={UNITES_VENTE} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Quantité par emballage"
                    name="qte_emb"
                    tooltip="Nombre d'unités dans un emballage (ex : 30 comprimés par boîte). Sert au calcul du prix à l'unité."
                  >
                    <InputNumber min={0} style={{ width: "100%" }} addonAfter={uniteDistribution || "unités"} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Aperçu des prix appliqués dans les ordonnances */}
              <Flex wrap gap={16} style={{ padding: "10px 12px", borderRadius: 8, background: colorFillAlter }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Prix appliqué en ordonnance</Text>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {prixVente ? `${formatMontant(Math.round(prixUnitaire * 100) / 100)} FCFA` : "—"}
                    </Text>
                    <Text type="secondary"> / {vendueAuDetail ? (uniteDistribution || "unité").toLowerCase().replace(/s$/, "") : "boîte"}</Text>
                  </div>
                </div>
                {marge !== null && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Marge</Text>
                    <div><Text strong style={{ fontSize: 16 }} type={marge < 0 ? "danger" : undefined}>{marge} %</Text></div>
                  </div>
                )}
              </Flex>
              {vendueAuDetail && !(qteEmb > 0) && (
                <Alert
                  style={{ marginTop: 8 }}
                  type="warning"
                  showIcon
                  message="Renseigner la quantité par emballage pour que les ordonnances facturent le prix à l'unité."
                />
              )}
            </Section>
          </Col>

          {/* Stock et conservation */}
          <Col xs={24} xl={12}>
            <Section icon={<InboxOutlined />} title="Stock et conservation">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Emplacement" name="emplacement">
                    <Input placeholder="Ex : Étagère A3" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Réfrigéré" name="refrigere" initialValue={false} valuePropName="checked">
                    <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Quantité de stock minimum" name="qte_stock_mini" initialValue={10} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Délai de péremption" name="delai_peremtion" initialValue={10} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} style={{ width: "100%" }} addonAfter="jours" />
                  </Form.Item>
                </Col>
              </Row>
            </Section>
          </Col>
        </Row>

        {/* Barre d'actions */}
        <Flex
          justify="flex-end"
          gap={8}
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            padding: "12px 16px",
            background: colorBgContainer,
            borderTop: `1px solid ${colorBorderSecondary}`,
            boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.06)",
            borderRadius: 8,
          }}
        >
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={formLoading}>
            {isNouveau ? "Créer la fiche produit" : "Enregistrer les modifications"}
          </Button>
          <Button danger icon={<CloseOutlined />} onClick={() => navigate(-1)}>
            Annuler
          </Button>
        </Flex>
      </Form>

      {/* Fenêtres de gestion des référentiels (hors du formulaire) */}
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
    </>
  );
}

export default FicheProduit;

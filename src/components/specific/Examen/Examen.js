import {
  Alert,
  Avatar,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import {
  DashboardOutlined,
  EyeOutlined,
  ExperimentOutlined,
  HeartOutlined,
  ManOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import FormFooter from "../../common/FormFooter/FormFooter";
import { aspectsUrinesOptions } from "../../../constants/app.constants";

const { Text } = Typography;

// Options "connues" (hors "Autres") pour chaque champ à choix multiple
const MUQUEUSE_KNOWN_OPTIONS = ["Colorés", "Pâles"];
const ZONE_OEDEMES_KNOWN_OPTIONS = ["Visage", "Membres inf."];
const SEUIL_FIEVRE = 37.5;

// Interprétation de l'IMC (classification OMS)
const getImcCategory = (imc) => {
  if (imc < 18.5) return { label: "Insuffisance pondérale (maigreur)", color: "warning" };
  if (imc < 25) return { label: "Corpulence normale", color: "success" };
  if (imc < 30) return { label: "Surpoids", color: "warning" };
  if (imc < 35) return { label: "Obésité modérée", color: "error" };
  if (imc < 40) return { label: "Obésité sévère", color: "error" };
  return { label: "Obésité morbide ou massive", color: "error" };
};

const computeImc = (poids, taille) =>
  poids > 0 && taille > 0 ? Number((poids / Math.pow(taille / 100, 2)).toFixed(2)) : null;

// "Colorés-Texte libre" -> { values: ["Colorés", "Autres"], autre: "Texte libre" }
const parseMultiChoice = (value, knownOptions) => {
  if (value === null || value === undefined || value === "") return { values: undefined, autre: undefined };
  let autre;
  const values = String(value)
    .split("-")
    .filter(Boolean)
    .map((item) => {
      if (!knownOptions.includes(item)) {
        autre = item.replace(/^Autres:?/, "").trim() || autre;
        return "Autres";
      }
      return item;
    });
  return { values: [...new Set(values)], autre };
};

// ["Colorés", "Autres"] + "Texte" -> "Colorés-Texte"
const serializeMultiChoice = (values, autre) =>
  Array.isArray(values) && values.length
    ? values.map((item) => (item === "Autres" ? autre || "" : item)).join("-")
    : null;

// Carte de saisie d'une constante, avec un indicateur d'état éventuel
const VitalField = ({ name, label, icon, unit, placeholder, status, children }) => (
  <Col xs={12} md={8} lg={6}>
    <Form.Item
      name={name}
      label={
        <Space size={6}>
          {icon}
          <span>{label}</span>
          {status && <Tag color={status.color} style={{ marginInlineEnd: 0 }}>{status.label}</Tag>}
        </Space>
      }
    >
      {children || <InputNumber min={0} style={{ width: "100%" }} addonAfter={unit} placeholder={placeholder} />}
    </Form.Item>
  </Col>
);

const OuiNonSwitch = ({ name, label }) => (
  <Col xs={12} md={8}>
    <Form.Item name={name} label={label} valuePropName="checked">
      <Switch checkedChildren="Oui" unCheckedChildren="Non" />
    </Form.Item>
  </Col>
);

const Section = ({ icon, title, extra, children }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Card
      size="small"
      title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>}
      extra={extra}
      style={{ marginBottom: 16 }}
    >
      {children}
    </Card>
  );
};

function Examen({ setOpen, currentRecord, defaultExamPayload, onRefresh }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token: { colorPrimary, colorFillAlter } } = theme.useToken();
  const isFemme = currentRecord && currentRecord.sexe_patient !== "MA";

  const initialValues = useMemo(() => {
    const payload = defaultExamPayload || {};
    const muqueuse = parseMultiChoice(payload.muqueuse, MUQUEUSE_KNOWN_OPTIONS);
    const zones = parseMultiChoice(payload.zone_oedemes, ZONE_OEDEMES_KNOWN_OPTIONS);
    return {
      ...payload,
      muqueuse: muqueuse.values,
      muqueuse_autre: muqueuse.autre,
      zone_oedemes: zones.values,
      zone_oedemes_autre: zones.autre,
      date_regle: payload.date_regle ? dayjs(payload.date_regle) : undefined,
      test_tdr: payload.test_tdr || "negatif",
    };
  }, [defaultExamPayload]);

  // Valeurs suivies en direct pour l'affichage conditionnel et les indicateurs
  const temp = Form.useWatch("temp", form);
  const poids = Form.useWatch("poids", form);
  const taille = Form.useWatch("taille", form);
  const saturation = Form.useWatch("saturation_resp", form);
  const muqueuse = Form.useWatch("muqueuse", form);
  const oedemes = Form.useWatch("oedemes", form);
  const zonesOedemes = Form.useWatch("zone_oedemes", form);
  const regles = Form.useWatch("regles", form);
  const reglesDouloureuses = Form.useWatch("regles_douloureuses", form);
  const obesite = Form.useWatch("obesite", form);

  const imc = computeImc(poids, taille);
  const imcCategory = imc ? getImcCategory(imc) : null;
  const hasFievre = temp > SEUIL_FIEVRE;

  useEffect(() => {
    form.setFieldValue("imc", imc);
  }, [imc, form]);

  const saveExamen = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        const { muqueuse_autre, zone_oedemes_autre, ...rest } = values;
        const payload = {
          ...defaultExamPayload,
          ...rest,
          imc,
          numpat: currentRecord.num_patient,
          numrv: currentRecord.num_ordre,
          muqueuse: serializeMultiChoice(values.muqueuse, muqueuse_autre),
          zone_oedemes: values.oedemes === true ? serializeMultiChoice(values.zone_oedemes, zone_oedemes_autre) : null,
          date_regle: values.date_regle ? dayjs(values.date_regle).toISOString() : null,
        };

        postActions(endpoints.consultations.SAVE, payload)
          .then((response) => {
            if (response?.data?.Saved === true) {
              message.success("Données cliniques enregistrées avec succès");
              setOpen(false);
              form.resetFields();
              onRefresh();
            } else {
              message.error("Une erreur s'est produite, veuillez réessayer!");
            }
          })
          .catch((error) => {
            message.error(error?.message);
            console.log(error);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={saveExamen}
      initialValues={initialValues}
      preserve={false}
    >
      {currentRecord && (
        <Flex
          align="center"
          gap={12}
          style={{ padding: "10px 14px", marginBottom: 16, borderRadius: 8, background: colorFillAlter }}
        >
          <Avatar size={44} icon={<UserOutlined />} style={{ backgroundColor: colorPrimary }} />
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: 15 }}>
              {currentRecord.prenom_patient} {currentRecord.nom_patient}
            </Text>
            <div>
              <Text>N° {currentRecord.num_patient}</Text>
            </div>
          </div>
          <Space wrap>
            {currentRecord.sexe_patient && (
              <Tag icon={isFemme ? <WomanOutlined /> : <ManOutlined />} color={isFemme ? "magenta" : "blue"}>
                {isFemme ? "Féminin" : "Masculin"}
              </Tag>
            )}
            {currentRecord.age_patient !== undefined && currentRecord.age_patient !== null && (
              <Tag>{currentRecord.age_patient} ans</Tag>
            )}
          </Space>
        </Flex>
      )}

      <Section icon={<HeartOutlined />} title="Constantes">
        <Row gutter={[16, 0]}>
          <VitalField name="tension" label="Tension" icon={<HeartOutlined />}>
            <Input placeholder="Ex : 12/8" addonAfter="cmHg" />
          </VitalField>
          <VitalField name="pouls" label="Pouls" icon={<DashboardOutlined />} unit="bpm" />
          <VitalField
            name="temp"
            label="Température"
            unit="°C"
            status={hasFievre ? { label: "Fièvre", color: "error" } : null}
          >
            <InputNumber min={0} max={45} step={0.1} style={{ width: "100%" }} addonAfter="°C" />
          </VitalField>
          <VitalField name="glucose_capi" label="Glycémie" unit="g/L">
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} addonAfter="g/L" />
          </VitalField>
          <VitalField name="taille" label="Taille" unit="cm" />
          <VitalField name="poids" label="Poids" unit="kg" />
          <VitalField name="frequence_resp" label="Fréq. respiratoire" unit="/min" />
          <VitalField
            name="saturation_resp"
            label="SpO2"
            status={saturation && saturation < 95 ? { label: "Basse", color: "warning" } : null}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} addonAfter="%" />
          </VitalField>
        </Row>

        {/* IMC calculé automatiquement à partir du poids et de la taille */}
        <Form.Item name="imc" hidden>
          <InputNumber />
        </Form.Item>
        {imcCategory && (
          <Alert
            type={imcCategory.color === "success" ? "success" : imcCategory.color === "error" ? "error" : "warning"}
            showIcon
            style={{ marginBottom: hasFievre ? 12 : 0 }}
            message={<span>IMC : <Text strong>{imc} kg/m²</Text> — {imcCategory.label}</span>}
          />
        )}

        {hasFievre && (
          <Alert
            type="error"
            showIcon
            message={`Température ${temp} °C supérieure à ${SEUIL_FIEVRE} °C : un TDR est à réaliser`}
            description={
              <Form.Item
                label="Résultat du TDR"
                name="test_tdr"
                rules={[{ required: true, message: "Veuillez choisir un résultat" }]}
                style={{ marginTop: 8, marginBottom: 0 }}
              >
                <Radio.Group optionType="button" buttonStyle="solid">
                  <Radio value="positif">Positif</Radio>
                  <Radio value="negatif">Négatif</Radio>
                  <Radio value="invalide">Invalide (à refaire)</Radio>
                </Radio.Group>
              </Form.Item>
            }
          />
        )}
      </Section>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Section icon={<MedicineBoxOutlined />} title="Examen physique">
            <Form.Item label="Muqueuses" name="muqueuse">
              <Checkbox.Group options={[...MUQUEUSE_KNOWN_OPTIONS, "Autres"]} />
            </Form.Item>
            {muqueuse?.includes("Autres") && (
              <Form.Item name="muqueuse_autre" rules={[{ required: true, message: "Préciser la muqueuse" }]}>
                <Input placeholder="Préciser la muqueuse" />
              </Form.Item>
            )}

            <Form.Item label="Oedèmes" name="oedemes" valuePropName="checked">
              <Switch checkedChildren="Oui" unCheckedChildren="Non" />
            </Form.Item>
            {oedemes === true && (
              <>
                <Form.Item label="Zones" name="zone_oedemes">
                  <Checkbox.Group options={[...ZONE_OEDEMES_KNOWN_OPTIONS, "Autres"]} />
                </Form.Item>
                {zonesOedemes?.includes("Autres") && (
                  <Form.Item name="zone_oedemes_autre" rules={[{ required: true, message: "Préciser la zone" }]}>
                    <Input placeholder="Préciser la zone" />
                  </Form.Item>
                )}
              </>
            )}
          </Section>
        </Col>

        <Col xs={24} lg={12}>
          <Section icon={<DashboardOutlined />} title="État général">
            <Row gutter={16}>
              <OuiNonSwitch name="deshydratation" label="Déshydratation" />
              <OuiNonSwitch name="denutrition" label="Dénutrition" />
              <OuiNonSwitch name="obesite" label="Obésité" />
            </Row>
            {imc >= 30 && !obesite && (
              <Text type="warning">L'IMC calculé indique une obésité.</Text>
            )}
          </Section>

          <Section icon={<EyeOutlined />} title="Vision">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Vision de loin (VL)" name="vision_l">
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="VL" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Vision de près (VP)" name="vision_p">
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="VP" />
                </Form.Item>
              </Col>
            </Row>
          </Section>
        </Col>
      </Row>

      <Section icon={<ExperimentOutlined />} title="Urines">
        <Row gutter={16}>
          <Col xs={8} md={4}>
            <Form.Item label="G" name="urine_gl">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={8} md={4}>
            <Form.Item label="CC" name="urine_cc">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={8} md={4}>
            <Form.Item label="ALB" name="urine_alb">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Aspect" name="coloration_urine">
              <Radio.Group optionType="button" options={aspectsUrinesOptions} />
            </Form.Item>
          </Col>
        </Row>
      </Section>

      {isFemme && (
        <Section icon={<WomanOutlined />} title="Règles">
          <Row gutter={16} align="top">
            <Col xs={12} md={6}>
              <Form.Item label="Règles" name="regles" valuePropName="checked">
                <Switch checkedChildren="Oui" unCheckedChildren="Non" />
              </Form.Item>
            </Col>
            {regles && (
              <>
                <Col xs={12} md={6}>
                  <Form.Item label="Douloureuses" name="regles_douloureuses" valuePropName="checked">
                    <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item label="Date des dernières règles" name="date_regle">
                    <DatePicker placeholder="Date" format="DD/MM/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                {reglesDouloureuses && (
                  <Col xs={24} md={6}>
                    <Form.Item label="Écoulement" name="ecoulement">
                      <Radio.Group optionType="button">
                        <Radio value="1">Faible</Radio>
                        <Radio value="2">Moyen</Radio>
                        <Radio value="3">Abondant</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                )}
              </>
            )}
          </Row>
        </Section>
      )}

      <FormFooter
        loading={loading}
        onCancel={() => {
          setOpen(false);
        }}
        htmlType="submit"
      />
    </Form>
  );
}

export default Examen;

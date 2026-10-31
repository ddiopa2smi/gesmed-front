import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { postActions, putActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import dayjs from "dayjs";
import useFetch from "../../../utils/hooks/useFetch";
import { ServiceType } from "../../../utils/types/types.ts";
import { codeServices } from "../../../constants/app.constants.js";
import { getTypeColor } from "../../../utils/typePatient";
import { isAssistantDunEspace, isAssistantEspace } from "../../../utils/profils.js";

const { Text } = Typography;

const typesRV = [
  {
    id: "rv_defaut",
    label: "Par défaut",
  },
  {
    id: "rv_convocation",
    label: "Sur convocation",
  },
  {
    id: "rv_update",
    label: "Mise à jour",
  },
];

// Raccourcis de date proposés dans le calendrier
const PRESETS_DATE = [
  { label: "Maintenant", value: () => dayjs() },
  { label: "Dans 1 heure", value: () => dayjs().add(1, "hour") },
  { label: "Demain 8h", value: () => dayjs().add(1, "day").hour(8).minute(0).second(0) },
  { label: "Dans 7 jours", value: () => dayjs().add(7, "day") },
];

const SectionTitle = ({ icon, children }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Flex align="center" gap={8} style={{ margin: "4px 0 12px", color: colorPrimary, fontWeight: 600 }}>
      {icon}
      <span>{children}</span>
    </Flex>
  );
};

function AddRv({ setOpen, onRefresh, currentRecord, operationType }) {
  const serviceType = JSON.parse(sessionStorage.getItem("serviceType"));
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const { token: { colorPrimary, colorFillAlter, colorBorderSecondary } } = theme.useToken();

  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const { data: servicesMedicaux, loading: servicesMedicauxLoading } = useFetch(
    endpoints.services_medicaux.LIST
  );
  const { data: users, isLoading: usersLoading } = useFetch(
    endpoints.users.LIST
  );
  const [medecins, setMedecins] = useState([]);
  const [medecinsCopy, setMedecinsCopy] = useState([]);

  // Hors espace Accueil, le service et le médecin sont ceux de l'utilisateur connecté
  const choixVerrouille = serviceType !== ServiceType.ACCUEIL;
  // L'assistant(e) de l'espace fixe le RV pour le compte d'un médecin du service
  const medecinVerrouille = choixVerrouille && !isAssistantEspace(serviceType, userConnected);
  const isUpdate = operationType === "update";

  const createRV = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        values.num_patient = currentRecord?.num_patient;
        values.date_rv = new Date(values.date_rv).toISOString();
        values.num_ordre = currentRecord?.num_ordre;
        if (isUpdate) {
          putActions(endpoints.rendezVous.UPDATE, values)
            .then((response) => {
              message.success("Rendez-vous mis à jour avec succès");
              onRefresh();
              setOpen(false);
            })
            .finally(() => setFormLoading(false));
        } else {
          postActions(endpoints.rendezVous.ADD, values)
            .then((response) => {
              if (response.data.Created === true) {
                message.success("Rendez-vous fixé avec succès");
                onRefresh();
              }
              setOpen(false);
            })
            .finally(() => setFormLoading(false));
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const getCodeByLabel = (listServices, label) => {
    return listServices?.find((item) => item.lib_service === label)
      ?.code_service;
  };

  useEffect(() => {
    const praticiens = (users || []).filter((item) => !isAssistantDunEspace(item));
    setMedecins(praticiens);
    setMedecinsCopy(praticiens);

    form.setFieldValue("date_rv", dayjs(new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  useEffect(() => {
    if (servicesMedicaux) {
      if (choixVerrouille) {
        const codeServ = getCodeByLabel(servicesMedicaux, serviceType);
        form.setFieldValue("code_serv", codeServ);
        if (medecinVerrouille) {
          form.setFieldValue("id_medecin", userConnected?.login);
        } else {
          setMedecinsCopy((medecins || []).filter((item) => item.code_serv === codeServ));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicesMedicaux, medecins]);

  useEffect(() => {
    if (isUpdate && currentRecord) {
      // currentRecord.service_medical est un libellé (ex: "MEDICAL"), il faut le résoudre
      // en code_service court (ex: "MED") comme pour le flux d'ajout, sinon le payload
      // envoyé au backend contient le libellé et l'update échoue (422).
      const resolvedCodeServ = getCodeByLabel(servicesMedicaux, currentRecord.service_medical);
      form.setFieldValue("code_serv", resolvedCodeServ);

      // Charger par defaut les medecins du service selectionné
      const temp = (medecins || []).filter(
        (item) => item.code_serv === resolvedCodeServ
      );
      setMedecinsCopy(temp);

      // Appliquer le médécin traitant choisi par défaut
      form.setFieldValue("id_medecin", currentRecord.id_medecin);

      form.setFieldValue("date_rv", dayjs(new Date(currentRecord.date_rv)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationType, servicesMedicaux, medecins]);

  const isFemme = currentRecord?.sexe_patient === "FE";
  const initiales = `${currentRecord?.prenom_patient?.[0] || ""}${currentRecord?.nom_patient?.[0] || ""}`.toUpperCase();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={createRV}
      requiredMark="optional"
      onValuesChange={(changedValues) => {
        if (changedValues.code_serv) {
          const temp = (medecins || []).filter(
            (item) => item.code_serv === changedValues.code_serv
          );
          setMedecinsCopy(temp);
          // Le médecin choisi n'appartient plus forcément au nouveau service
          if (!temp.some((item) => item.login === form.getFieldValue("id_medecin"))) {
            form.setFieldValue("id_medecin", undefined);
          }
        }
      }}
    >
      {/* Patient concerné */}
      <Flex
        align="center"
        gap={12}
        style={{ padding: "10px 14px", borderRadius: 10, background: colorFillAlter, marginBottom: 16 }}
      >
        <Avatar size={44} style={{ backgroundColor: isFemme ? "#eb2f96" : colorPrimary, fontWeight: 600, flexShrink: 0 }}>
          {initiales || <UserOutlined />}
        </Avatar>
        <div style={{ lineHeight: 1.35, minWidth: 0 }}>
          <Text strong style={{ fontSize: 15 }}>
            {currentRecord?.prenom_patient} {currentRecord?.nom_patient}
          </Text>
          <Space size={6} wrap style={{ display: "flex", marginTop: 2 }}>
            <Text strong style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", letterSpacing: 0.4 }}>
              N° {currentRecord?.num_patient}
            </Text>
            {currentRecord?.sexe_patient && (
              <Tag color={isFemme ? "magenta" : "blue"} style={{ marginInlineEnd: 0 }}>{isFemme ? "Féminin" : "Masculin"}</Tag>
            )}
            {currentRecord?.age_patient !== undefined && currentRecord?.age_patient !== null && (
              <Tag style={{ marginInlineEnd: 0 }}>{currentRecord.age_patient} ans</Tag>
            )}
            {currentRecord?.type_patient && (
              <Tag color={getTypeColor(currentRecord.type_patient)} style={{ marginInlineEnd: 0 }}>{currentRecord.type_patient}</Tag>
            )}
          </Space>
        </div>
      </Flex>

      <SectionTitle icon={<MedicineBoxOutlined />}>Service et médecin</SectionTitle>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="code_serv"
            label="Service"
            rules={[{ required: true, message: "Veuillez sélectionner le service" }]}
            tooltip={choixVerrouille ? "Service de l'espace courant" : undefined}
          >
            <Select
              disabled={choixVerrouille}
              showSearch
              placeholder="Choisir le service"
              optionFilterProp="label"
              loading={servicesMedicauxLoading}
              options={(servicesMedicaux || [])
                .filter((item) => item.code_service !== codeServices.ACCUEIL && item.code_service !== codeServices.ADMINISTRATION)
                .map((item) => ({ value: item.code_service, label: item.lib_service }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="id_medecin"
            label="Médecin traitant"
            rules={[{ required: true, message: "Veuillez sélectionner le médecin traitant" }]}
          >
            <Select
              disabled={medecinVerrouille}
              showSearch
              placeholder="Choisir le médecin"
              optionFilterProp="label"
              loading={usersLoading}
              notFoundContent={<Text type="secondary">Aucun médecin pour ce service</Text>}
              options={(medecinsCopy || []).map((item) => ({ value: item.login, label: item.username }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <SectionTitle icon={<CalendarOutlined />}>Rendez-vous</SectionTitle>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Date et heure"
            name="date_rv"
            rules={[{ required: true, message: "Ce champ est obligatoire" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm", minuteStep: 5 }}
              format="DD/MM/YYYY à HH:mm"
              placeholder="Sélectionner"
              style={{ width: "100%" }}
              presets={PRESETS_DATE.map((preset) => ({ label: preset.label, value: preset.value() }))}
              // Pas de rendez-vous dans le passé (sauf la date déjà fixée lors d'une modification)
              disabledDate={(date) => !isUpdate && date && date.isBefore(dayjs(), "day")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="type_rv" label="Type de rendez-vous" initialValue="rv_defaut">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              style={{ display: "flex" }}
              options={typesRV.map((item) => ({ value: item.id, label: item.label, style: { flex: 1, textAlign: "center" } }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Flex
        justify="flex-end"
        style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
      >
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={formLoading}>
            {isUpdate ? "Mettre à jour le rendez-vous" : "Fixer le rendez-vous"}
          </Button>
          <Button danger icon={<CloseOutlined />} onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </Space>
      </Flex>
    </Form>
  );
}

export default AddRv;

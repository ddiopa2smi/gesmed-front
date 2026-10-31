import {
  Button, Col, DatePicker, Flex, Form, Input, Radio, Row, Select, Space, Tag, Typography, message, theme,
} from "antd";
import {
  CloseOutlined, ContactsOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, ApartmentOutlined,
  SaveOutlined, SolutionOutlined, UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  getActions,
  postActions,
  putActions,
} from "./../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import useFetch from "../../../utils/hooks/useFetch";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { TypePatient } from "../../../utils/types/types.ts";

const { Text } = Typography;

const GROUPES_SANGUINS = ["A", "A+", "A-", "B", "B+", "B-", "AB", "AB+", "AB-", "O", "O+", "O-"];

// Listes provisoires (pas encore de référentiel côté API)
const DIRECTIONS = [
  { id: 1, name: "Direction1" },
  { id: 2, name: "Direction2" },
  { id: 3, name: "Direction3" },
];
const SERVICES = [
  { id: 1, name: "Service1" },
  { id: 2, name: "Service2" },
  { id: 3, name: "Service3" },
];

const SectionTitle = ({ icon, children, extra }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Flex justify="space-between" align="center" style={{ margin: "4px 0 12px" }}>
      <Flex align="center" gap={8} style={{ color: colorPrimary, fontWeight: 600 }}>
        {icon}
        <span>{children}</span>
      </Flex>
      {extra}
    </Flex>
  );
};

function AddPatient({ setOpen, operationType, onRefresh, currentRecord, initialMatricule, onCreated }) {
  const [form] = Form.useForm();
  const { token: { colorBorderSecondary, colorFillAlter } } = theme.useToken();
  const [formLoading, setFormLoading] = useState(false);
  const [typePatient, setTypePatient] = useState(null);
  const [matriculeToSearch, setMatriculeToSearch] = useState(null);
  // Permet de relancer la recherche avec le même matricule
  const [rechercheTick, setRechercheTick] = useState(0);
  const [listBeneficiaires, setListBeneficiaires] = useState([]);
  const [listBeneficiairesLoading, setListBeneficiairesLoading] =
    useState(false);
  const [benefLuiMeme, setBenefLuiMeme] = useState(null);
  const { data: listTypePatients, isLoading: listTypePatientsLoading } =
    useFetch(endpoints.patients.LIST_TYPE);

  const { data: listDepartements } = useFetch(endpoints.departements.LIST);

  const dateNaissance = Form.useWatch("datenaiss_patient", form);
  const age = dateNaissance ? dayjs().diff(dateNaissance, "year") : null;

  const isUpdate = operationType === "update";
  // Recherche IPM (matricule -> bénéficiaire) : uniquement à la création, car c'est elle qui fournit
  // le num_patient. En modification, le numéro est déjà fixé (currentRecord.num_patient) et relancer
  // la recherche écraserait l'identité du membre de famille par celle du premier bénéficiaire.
  const avecRechercheIpm = !isUpdate && (typePatient === TypePatient.PERMANENT || typePatient === TypePatient.SAISONNIER);
  const isExterne = typePatient === TypePatient.EXTERNE;

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        switch (operationType) {
          case "add":
            values.num_patient = values.benef;
            values.datenaiss_patient = new Date(
              values.datenaiss_patient
            ).toISOString();
            postActions(endpoints.patients.ADD, values)
              .then((response) => {
                if (response.data.Added) {
                  message.success("Nouveau patient ajouté avec succès");

                  setOpen(false);
                  form.resetFields();
                  onRefresh?.();
                  onCreated?.(values.num_patient);
                } else {
                  message.warning("Patient déja ajouté");
                }
              })

              .finally(() => {
                setFormLoading(false);
              });

            break;
          case "update":
            values.datenaiss_patient = new Date(
              values.datenaiss_patient
            ).toISOString();
            values.num_patient = currentRecord
              ? currentRecord.num_patient
              : null;
            putActions(endpoints.patients.UPDATE, values).then((response) => {

              message.success("Opération effectuée avec succès");
              setOpen(false);
              form.resetFields();
              onRefresh();
            })
              .finally(() => {
                setFormLoading(false);
              })
            break;
          default:
            break;
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      })
  };

  const lancerRecherche = (value) => {
    setMatriculeToSearch(value?.trim() || null);
    setRechercheTick(Date.now());
  };

  useEffect(() => {
    const searchPatientByMatricule = (value) => {
      if (value && value !== null) {
        setListBeneficiairesLoading(true);
        getActions(`/api/Participant/Patient/${value}`)
          .then((response) => {
            if (response?.data?.numcont === "None") {
              Swal.fire("Avertissement", "Participant introuvable");
            } else {
              setBenefLuiMeme(response.data);
              getActions(`/api/Benef/Gesmed/list/${response.data.numcont}`).then(
                (res) => {
                  const data = res.data;

                  setListBeneficiaires(data);

                  // Setter par defaut le premier element du tableau
                  let firstBenef = data[0];
                  form.setFieldValue(
                    "benef",
                    data.length > 0 ? firstBenef.matribenef : null
                  );

                  form.setFieldValue("nom_patient", firstBenef?.nom);
                  form.setFieldValue("prenom_patient", firstBenef?.prenoms);
                  form.setFieldValue("sexe_patient", firstBenef?.sexe);
                  if (firstBenef?.datenaiss) {
                    form.setFieldValue("datenaiss_patient", dayjs(new Date(firstBenef.datenaiss)));
                  }
                }
              );
            }
          })
          .finally(() => {
            setListBeneficiairesLoading(false);
          });
      }
    };
    searchPatientByMatricule(matriculeToSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matriculeToSearch, rechercheTick]);

  useEffect(() => {
    // Ouverture depuis un formulaire de prescription externe : le matricule saisi là-bas a
    // déjà été identifié comme un participant IPM sans patient GESMED correspondant. On
    // présélectionne "Permanent" (cas le plus courant, ajustable par l'utilisateur) pour
    // révéler les champs matricule/patient IPM et déclencher directement la recherche.
    if (initialMatricule) {
      setTypePatient(TypePatient.PERMANENT);
      form.setFieldValue("code_patient", TypePatient.PERMANENT);
      form.setFieldValue("matricule", initialMatricule);
      setMatriculeToSearch(initialMatricule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMatricule]);

  useEffect(() => {
    if (currentRecord !== null && currentRecord !== undefined) {
      form.setFieldsValue(currentRecord);

      // Épouse / enfant : rattachés au type "Permanent"
      const codeType = currentRecord.code_patient === 2 || currentRecord.code_patient === 3 ? 1 : currentRecord.code_patient;
      form.setFieldValue("code_patient", codeType);
      // Affiche les blocs propres au type du patient modifié
      setTypePatient(codeType);
      if (currentRecord.datenaiss_patient) {
        form.setFieldValue("datenaiss_patient", dayjs(new Date(currentRecord.datenaiss_patient)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRecord])

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={save}
      preserve={false}
      requiredMark="optional"
      onValuesChange={(changedValues) => {
        if (changedValues.benef) {
          const benefSelected = listBeneficiaires.find((element) => element.matribenef === changedValues.benef);

          if (benefLuiMeme && changedValues.benef === benefLuiMeme.matipm) {
            form.setFieldValue("nom_patient", benefLuiMeme?.nom);
            form.setFieldValue("prenom_patient", benefLuiMeme?.prenom);
          } else {
            form.setFieldValue("nom_patient", benefSelected?.nom);
            form.setFieldValue("prenom_patient", benefSelected?.prenoms);
          }
          form.setFieldValue("sexe_patient", benefSelected?.sexe);
          if (benefSelected?.datenaiss) {
            form.setFieldValue("datenaiss_patient", dayjs(new Date(benefSelected.datenaiss)));
          }
        }
      }}
    >
      {/* Type de patient et rattachement IPM */}
      <SectionTitle icon={<IdcardOutlined />}>Type et rattachement</SectionTitle>
      <Row gutter={16}>
        <Col xs={24} md={avecRechercheIpm || isUpdate ? 8 : 16}>
          <Form.Item
            name="code_patient"
            label="Type de patient"
            rules={[{ required: true, message: "Sélection obligatoire" }]}
          >
            <Select
              showSearch
              placeholder="Choisir le type de patient"
              optionFilterProp="label"
              onChange={(value) => setTypePatient(value)}
              loading={listTypePatientsLoading}
              options={(listTypePatients || [])
                .filter((item) => item?.code_patient !== 2 && item?.code_patient !== 3)
                .map((item) => ({ value: item.code_patient, label: item.type_patient }))}
            />
          </Form.Item>
        </Col>
        {isUpdate && (
          <Col xs={24} md={8}>
            <Form.Item label="N° patient" tooltip="Le numéro du patient ne peut pas être modifié">
              <Input value={currentRecord?.num_patient} prefix={<IdcardOutlined />} disabled />
            </Form.Item>
          </Col>
        )}
        {avecRechercheIpm && (
          <>
            <Col xs={24} md={6}>
              <Form.Item
                name="matricule"
                label="Matricule IPM"
                tooltip="Saisir le matricule du participant puis lancer la recherche pour retrouver ses bénéficiaires"
                initialValue={(currentRecord && currentRecord.num_patient) || null}
              >
                <Input.Search
                  placeholder="Matricule"
                  enterButton
                  loading={listBeneficiairesLoading}
                  onSearch={lancerRecherche}
                  onBlur={(e) => e.target.value?.trim() && e.target.value.trim() !== matriculeToSearch && lancerRecherche(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                name="benef"
                label="Bénéficiaire"
                rules={[{ required: true, message: "Sélection obligatoire" }]}
              >
                <Select
                  showSearch
                  placeholder={listBeneficiaires.length ? "Choisir le bénéficiaire" : "Rechercher d'abord le matricule"}
                  optionFilterProp="label"
                  loading={listBeneficiairesLoading}
                  options={(listBeneficiaires || []).map((item) => ({
                    value: item?.matribenef,
                    label: `${item?.matribenef} - ${item?.prenoms} ${item?.nom}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </>
        )}
        <Col xs={24} md={8}>
          <Form.Item
            name="suspension"
            label="État"
            initialValue={(currentRecord && currentRecord.suspension) || "A"}
            rules={[{ required: true, message: "Champ obligatoire" }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              style={{ display: "flex" }}
              options={[
                { label: "Actif", value: "A", style: { flex: 1, textAlign: "center" } },
                { label: "Suspendu", value: "S", style: { flex: 1, textAlign: "center" } },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Identité */}
      <SectionTitle
        icon={<UserOutlined />}
        extra={age !== null && age >= 0 && <Tag color="blue" style={{ marginInlineEnd: 0 }}>{age} an{age > 1 ? "s" : ""}</Tag>}
      >
        Identité
      </SectionTitle>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="prenom_patient"
            label="Prénom(s)"
            rules={[{ required: true, message: "Champ obligatoire" }]}
            initialValue={currentRecord?.prenom_patient}
          >
            <Input placeholder="Prénom(s)" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="nom_patient"
            label="Nom"
            rules={typePatient === TypePatient.SAISONNIER ? [] : [{ required: true, message: "Champ obligatoire" }]}
            initialValue={currentRecord?.nom_patient}
          >
            <Input placeholder="Nom" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="datenaiss_patient"
            label="Date de naissance"
            rules={[{ required: true, message: "Champ obligatoire" }]}
          >
            <DatePicker
              placeholder="JJ/MM/AAAA"
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(date) => date && date.isAfter(dayjs(), "day")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="sexe_patient"
            label="Sexe"
            rules={[{ required: true, message: "Sélection obligatoire" }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              style={{ display: "flex" }}
              options={[
                { label: "Masculin", value: "MA", style: { flex: 1, textAlign: "center" } },
                { label: "Féminin", value: "FE", style: { flex: 1, textAlign: "center" } },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            name="group_sanguin"
            label="Groupe sanguin"
            initialValue={currentRecord?.group_sanguin}
          >
            <Select
              allowClear
              placeholder="Non renseigné"
              options={GROUPES_SANGUINS.map((groupe) => ({ value: groupe, label: groupe }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={10}>
          {/* Repris automatiquement dans la fiche d'accident de travail */}
          <Form.Item
            name="emploi_patient"
            label="Emploi"
            initialValue={currentRecord?.emploi_patient}
          >
            <Input prefix={<SolutionOutlined />} placeholder="Emploi occupé (ex : Électricien, Agent de saisie...)" maxLength={150} />
          </Form.Item>
        </Col>
      </Row>

      {/* Coordonnées */}
      <SectionTitle icon={<ContactsOutlined />}>Coordonnées</SectionTitle>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="tel_patient" label="Téléphone" initialValue={currentRecord?.tel_patient}>
            <Input prefix={<PhoneOutlined />} placeholder="77 000 00 00" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="email_patient"
            label="Email"
            rules={[{ type: "email", message: "Entrer un email valide" }]}
            initialValue={currentRecord?.email_patient}
          >
            <Input prefix={<MailOutlined />} placeholder="nom@exemple.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="contact"
            label="Personne à contacter"
            initialValue={currentRecord?.contact}
          >
            <Input placeholder="Nom et téléphone" />
          </Form.Item>
        </Col>
        {typePatient === TypePatient.JOURNALIER && (
          <>
            <Col xs={24} md={12}>
              <Form.Item name="ville" label="Ville" initialValue={currentRecord?.ville}>
                <Input placeholder="Ville" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="quartier" label="Quartier" initialValue={currentRecord?.quartier}>
                <Input placeholder="Quartier" />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      {/* Affectation (personnel) ou informations complémentaires (patient externe) */}
      {!isExterne && (
        <>
          <SectionTitle icon={<ApartmentOutlined />}>Affectation</SectionTitle>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="direction" label="Direction">
                <Select
                  allowClear
                  showSearch
                  placeholder="Direction"
                  optionFilterProp="label"
                  options={DIRECTIONS.map((item) => ({ value: item.id, label: item.name }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="code_dept" label="Département">
                <Select
                  allowClear
                  showSearch
                  placeholder="Département"
                  optionFilterProp="label"
                  options={(listDepartements || []).map((item) => ({ value: item?.code_dept, label: item?.lib_dept }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="service" label="Service">
                <Select
                  allowClear
                  showSearch
                  placeholder="Service"
                  optionFilterProp="label"
                  options={SERVICES.map((item) => ({ value: item.id, label: item.name }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {isExterne && (
        <>
          <SectionTitle icon={<SolutionOutlined />}>Informations complémentaires</SectionTitle>
          <div style={{ padding: "12px 12px 0", borderRadius: 8, background: colorFillAlter, marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                {/* Obligatoires à la création seulement : l'API ne stocke pas ces champs (absents du modèle Patient),
                    ils reviennent donc vides en modification et bloqueraient l'enregistrement */}
                <Form.Item name="phone" label="Téléphone" rules={[{ required: !isUpdate, message: "Champ obligatoire" }]}>
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="num_piece" label="Numéro de la pièce d'identité" rules={[{ required: !isUpdate, message: "Champ obligatoire" }]}>
                  <Input prefix={<IdcardOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="nom_pere" label="Nom du père">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="nom_mere" label="Nom de la mère">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="profession_patient" label="Profession du patient">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="profession_conjoint" label="Profession du conjoint">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>
      )}

      <Flex
        justify="space-between"
        align="center"
        wrap
        gap={8}
        style={{ paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>Les champs marqués « (optionnel) » peuvent rester vides.</Text>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={formLoading}>
            {operationType === "update" ? "Enregistrer les modifications" : "Enregistrer le patient"}
          </Button>
          <Button danger icon={<CloseOutlined />} onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </Space>
      </Flex>
    </Form>
  );
}

export default AddPatient;

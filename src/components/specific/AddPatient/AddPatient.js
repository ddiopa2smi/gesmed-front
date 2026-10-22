import { Col, Form, Input, Row, Select, DatePicker, message } from "antd";
import { useEffect, useState } from "react";
import {
  getActions,
  postActions,
  putActions,
} from "./../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import FormFooter from "../../common/FormFooter/FormFooter";
import useFetch from "../../../utils/hooks/useFetch";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { TypePatient } from "../../../utils/types/types.ts";

const { TextArea } = Input;
const { Option } = Select;

function AddPatient({ setOpen, operationType, onRefresh, currentRecord, initialMatricule, onCreated }) {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const [typePatient, setTypePatient] = useState(null);
  const [matriculeToSearch, setMatriculeToSearch] = useState(null);
  const [listBeneficiaires, setListBeneficiaires] = useState([]);
  const [listBeneficiairesLoading, setListBeneficiairesLoading] =
    useState(false);
  const [benefLuiMeme, setBenefLuiMeme] = useState(null);
  const { data: listTypePatients, isLoading: listTypePatientsLoading } =
    useFetch(endpoints.patients.LIST_TYPE);

  const { data: listDepartements } = useFetch(endpoints.departements.LIST);

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
            console.log(values);
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

              message.success("Opération éffectuée avec succès");
              setOpen(false);
              form.resetFields();
              onRefresh();
            })
              .finally(() => {
                setFormLoading(false);
              })
            setOpen(false);
            break;
          default:
            break;
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      })
  };

  const handleMatricule = (e) => {
    setMatriculeToSearch(e.target.value);
  };

  useEffect(() => {
    const searchPatientByMatricule = (value) => {
      if (value && value !== null) {
        setListBeneficiairesLoading(true);
        getActions(`/api/Participant/Patient/${value}`)
          .then((response) => {
            //console.log(response.data);

            if (response?.data?.numcont === "None") {
              Swal.fire("Avertissement", "Participant introuvable");
            } else {
              // Swal.fire("Succès", "Ouvrir la liste Patient pour sélectionner un participant")
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
                  form.setFieldValue(
                    "datenaiss_patient",
                    dayjs(new Date(firstBenef.datenaiss))
                  );
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
  }, [matriculeToSearch]);

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
  }, [initialMatricule]);

  useEffect(() => {
    if (currentRecord !== null) {
      form.setFieldsValue(currentRecord);

      if (currentRecord.code_patient === 2 || currentRecord.code_patient === 3) {
        form.setFieldValue("code_patient", 1);
      }
      form.setFieldValue("datenaiss_patient", dayjs(new Date(currentRecord.datenaiss_patient)))

    }
  }, [currentRecord])



  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={save}
      preserve={false}
      //initialValues={currentRecord}
      onValuesChange={(changedValues, values) => {
        if (changedValues.benef) {
          //console.log(changedValues)
          let benefSelected = null;
          for (let i = 0; i < listBeneficiaires.length; i++) {
            const element = listBeneficiaires[i];
            if (element.matribenef === changedValues.benef) {
              benefSelected = element;
              break;
            }
          }

          //console.log(benefSelected)
          //console.log(benefLuiMeme)
          if (changedValues.benef === benefLuiMeme.matipm) {
            form.setFieldValue("nom_patient", benefLuiMeme?.nom);
            form.setFieldValue("prenom_patient", benefLuiMeme?.prenom);
          } else {
            form.setFieldValue("nom_patient", benefSelected?.nom);
            form.setFieldValue("prenom_patient", benefSelected?.prenoms);
          }
          form.setFieldValue("sexe_patient", benefSelected?.sexe);
          form.setFieldValue(
            "datenaiss_patient",
            dayjs(new Date(benefSelected.datenaiss))
          );
        }
      }}
    >
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
          <Form.Item
            name="code_patient"
            label="Type patient"
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
              placeholder="Type de patient"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children[1].toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                setTypePatient(value);
              }}
              loading={listTypePatientsLoading}
            >
              {listTypePatients
                .filter((item) => item?.code_patient !== 2 && item?.code_patient !== 3)
                .map(
                  (
                    item,
                    key //item.code_pat !== 1 &&
                  ) => (
                    <Option key={key} value={item.code_patient}>
                      {" "}
                      {item.type_patient}{" "}
                    </Option>
                  )
                )}
            </Select>
          </Form.Item>
        </Col>
        {
          // Must fixed the search of patients when enter the matricule later
          //Fixed
          (typePatient === TypePatient.PERMANENT || typePatient === TypePatient.SAISONNIER) && (
            <>
              <Col xs={24} sm={4} md={4} lg={4} xl={4}>
                <Form.Item
                  name="matricule"
                  label="Matricule"
                  initialValue={
                    (currentRecord && currentRecord.num_patient) || null
                  }
                >
                  <Input
                    value={matriculeToSearch}
                    onBlur={(e) => handleMatricule(e)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                <Form.Item
                  name="benef"
                  label="Patient"
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
                    placeholder="Patient"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children[1]
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    loading={listBeneficiairesLoading}
                  >
                    {listBeneficiaires?.map((item, key) => (
                      <Option key={key} value={item?.matribenef}>
                        {" "}
                        {item?.matribenef} - {item?.prenoms}{" "} {item?.nom}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </>
          )
        }
        <Col xs={24} sm={4} md={4} lg={4} xl={4}>
          <Form.Item
            name="suspension"
            label="Etat"
            initialValue={
              (currentRecord && currentRecord.suspension) || "A"
            }
            rules={[
              {
                required: true,
                message: "Champ obligatoire",
              },
            ]}
          >
            <Select
              style={{ width: "100%", background: "transparent" }}
              showSearch
              placeholder="Etat suspension"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { label: "Actif", value: "A" },
                { label: "Suspendu", value: "S" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
      {typePatient !== TypePatient.EXTERNE && (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              name="direction"
              label="Direction"
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Direction"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                loading={false}
              >
                {[
                  {
                    id: 1,
                    name: "Direction1",
                  },
                  {
                    id: 2,
                    name: "Direction2",
                  },
                  {
                    id: 3,
                    name: "Direction3",
                  },
                ]?.map((item, index) => (
                  <Option key={index} value={item?.id}>
                    {" "}
                    {item?.name}{" "}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              name="code_dept"
              label="Département"
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Département"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                loading={false}
              >
                {listDepartements?.map((item, index) => (
                  <Option key={index} value={item?.code_dept}>
                    {item?.lib_dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <Form.Item
              name="service"
              label="Service"
            >
              <Select
                style={{ width: "100%", background: "transparent" }}
                showSearch
                placeholder="Service"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
                loading={false}
              >
                {[
                  {
                    id: 1,
                    name: "Service1",
                  },
                  {
                    id: 2,
                    name: "Service2",
                  },
                  {
                    id: 3,
                    name: "Service3",
                  },
                ]?.map((item, index) => (
                  <Option key={index} value={item?.id}>
                    {" "}
                    {item?.name}{" "}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )}

      {typePatient === TypePatient.EXTERNE && (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                name="phone"
                label="Téléphone"
                rules={[
                  {
                    required: true,
                    message: "Champ obligatoire",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                name="num_piece"
                label="Numéro de la pièce "
                rules={[
                  {
                    required: true,
                    message: "Champ obligatoire",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                name="nom_pere"
                label="Nom du père"
                rules={[
                  {
                    required: false,
                    message: "Champ obligatoire",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                name="nom_mere"
                label="Nom de la mère"
                rules={[
                  {
                    required: false,
                    message: "Champ obligatoire",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                name="profession_patient"
                label="Profession du patient"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                name="profession_conjoint"
                label="Profession du conjoint"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="sexe_patient"
            label="Sexe"
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
              placeholder="Sexe"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value={"MA"}> Masculin </Option>
              <Option value={"FE"}> Féminin </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Form.Item
            name="group_sanguin"
            label="Groupe sanguin"
            rules={
              []
            }
            initialValue={currentRecord?.group_sanguin}
          >
            <Select
              style={{ width: "100%", background: "transparent" }}
              showSearch
              placeholder="Groupe Sanguin"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value={"A"}> A </Option>
              <Option value={"A+"}> A+ </Option>
              <Option value={"A-"}> A- </Option>
              <Option value={"B"}> B </Option>
              <Option value={"B+"}> B+ </Option>
              <Option value={"B-"}> B- </Option>
              <Option value={"AB"}> AB </Option>
              <Option value={"AB+"}> AB+ </Option>
              <Option value={"AB-"}> AB- </Option>
              <Option value={"O"}> O </Option>
              <Option value={"O+"}> O+ </Option>
              <Option value={"O-"}> O- </Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="prenom_patient"
            label="Prénom(s)"
            rules={[
              {
                required: true,
                message: "Champ obligatoire",
              },
            ]}
            initialValue={currentRecord?.prenom_patient}
          >
            <Input placeholder="Prénom(s)" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="nom_patient"
            label="Nom"
            rules={typePatient === TypePatient.SAISONNIER ? [] : [
              {
                required: true,
                message: "Champ obligatoire",
              },
            ]}
            initialValue={currentRecord?.nom_patient}
          >
            <Input placeholder="Nom" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="datenaiss_patient"
            label="Date de naissance"
            rules={[
              {
                required: true,
                message: "Champ obligatoire",
              },
            ]}
          >
            <DatePicker placeholder="choisir la date" format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="tel_patient"
            label="Téléphone"
            initialValue={currentRecord?.tel_patient}
          >
            <Input placeholder="Téléphone" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="email_patient"
            label="Email"
            rules={[
              {
                type: "email",
                message: "Entrer un email svp",
              },
            ]}
            initialValue={currentRecord?.email_patient}
          >
            <Input placeholder="ama@gmail.com" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
          <Form.Item
            name="contact"
            label="Contact"
            initialValue={currentRecord?.contact}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {typePatient === 4 && (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="ville"
              label="Ville"
              initialValue={currentRecord?.ville}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              name="quartier"
              label="Quartier"
              initialValue={currentRecord?.quartier}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      )}
      <FormFooter
        loading={formLoading}
        onCancel={() => {
          setOpen(false);
        }}
        htmlType="submit"
      />
    </Form>
  );
}

export default AddPatient;

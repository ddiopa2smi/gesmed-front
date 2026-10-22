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
} from "antd";
import { useEffect, useState } from "react";
import { postActions, putActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import FormFooter from "../../common/FormFooter/FormFooter";
import dayjs from "dayjs";
import useFetch from "../../../utils/hooks/useFetch";
import { ServiceType } from "../../../utils/types/types.ts";
import { codeServices } from "../../../constants/app.constants.js";

const { Title } = Typography;
const { Option } = Select;

const typesRV = [
  {
    id: "rv_defaut",
    label: "RV par défaut",
  },
  {
    id: "rv_convocation",
    label: "RV sur convocation",
  },
  {
    id: "rv_update",
    label: "RV de mise à jour",
  },
];
function AddRv({ setOpen, onRefresh, currentRecord, operationType }) {
  const serviceType = JSON.parse(sessionStorage.getItem("serviceType"));
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));

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



  const createRV = () => {
    form
      .validateFields()
      .then((values) => {
        setFormLoading(true);
        values.num_patient = currentRecord?.num_patient;
        values.date_rv = new Date(values.date_rv).toISOString();
        values.num_ordre = currentRecord?.num_ordre;
        if (operationType === "update") {
          putActions(endpoints.rendezVous.UPDATE, values)
            .then((response) => {
              //   if (response.data.Created === true) {
              //   }
              message.success("Rendez-vous mise à jour avec succès");
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
    setMedecins(users);
    setMedecinsCopy(users);

    form.setFieldValue("date_rv", dayjs(new Date()));
  }, [users]);

  useEffect(() => {
    if (servicesMedicaux) {
      if (serviceType !== ServiceType.ACCUEIL) {
        form.setFieldValue("code_serv", getCodeByLabel(servicesMedicaux, serviceType));
        form.setFieldValue("id_medecin", userConnected?.login);
      }
    }
  }, [servicesMedicaux]);

  useEffect(() => {

    if (operationType === "update" && currentRecord) {
      // currentRecord.service_medical est un libellé (ex: "MEDICAL"), il faut le résoudre
      // en code_service court (ex: "MED") comme pour le flux d'ajout, sinon le payload
      // envoyé au backend contient le libellé et l'update échoue (422).
      const resolvedCodeServ = getCodeByLabel(servicesMedicaux, currentRecord.service_medical);
      form.setFieldValue("code_serv", resolvedCodeServ);


      // Charger par defaut les medecins du service selectionné
      const temp = medecins.filter(
        (item) => item.code_serv === resolvedCodeServ
      );
      setMedecinsCopy(temp);


      // Appliquer le médécin traitant choisi par défaut
      form.setFieldValue("id_medecin", currentRecord.id_medecin);


      form.setFieldValue("date_rv", dayjs(new Date(currentRecord.date_rv)));
    }
  }, [operationType, servicesMedicaux, medecins]);


  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={createRV}
      onValuesChange={(changedValues, values) => {
        if (changedValues.code_serv) {
          const temp = medecins.filter(
            (item) => item.code_serv === changedValues.code_serv
          );
          setMedecinsCopy(temp);
        }
      }}
    >
      <Title level={4}>
        {" "}
        Patient {currentRecord?.num_patient} / {currentRecord?.prenom_patient}{" "}
        {currentRecord?.nom_patient}{" "}
      </Title>

      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="code_serv"
            label="Service"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner le service",
              },
            ]}
          >
            <Select
              disabled={serviceType !== ServiceType.ACCUEIL}
              style={{ width: "100%", background: "transparent" }}
              showSearch
              placeholder="Service"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children[1].toLowerCase().includes(input.toLowerCase())
              }
              loading={servicesMedicauxLoading}
            >
              {servicesMedicaux.filter((item) => item.code_service !== codeServices.ACCUEIL && item.code_service !== codeServices.ADMINISTRATION).map((item, index) => (
                <Option key={index} value={item.code_service}>
                  {" "}
                  {item.lib_service}{" "}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item
            name="id_medecin"
            label="Médécin traitant"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner le service",
              },
            ]}
          >
            <Select
              disabled={serviceType !== ServiceType.ACCUEIL}
              style={{ width: "100%", background: "transparent" }}
              showSearch
              placeholder="Médécin traitant"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children[1].toLowerCase().includes(input.toLowerCase())
              }
              loading={false}
            >
              {medecinsCopy.map((item, index) => (
                <Option key={index} value={item.login}>
                  {" "}
                  {item.username}{" "}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            label="Date du rendez-vous"
            name="date_rv"
            rules={[
              {
                required: true,
                message: "Ce champ est obligatoire",
              },
            ]}
          >
            <DatePicker placeholder="Sélectionner" showTime />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Form.Item
            name="type_rv"
            label="Type de rendez-vous"
            rules={[
              {
                required: false,
                message: "Veuillez sélectionner le type de rendez-vous",
              },
            ]}
            initialValue="rv_defaut"
          >
            <Select
              style={{ width: "100%", background: "transparent" }}
              showSearch
              placeholder="Type de rendez-vous médical"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children[1].toLowerCase().includes(input.toLowerCase())
              }
              loading={false}
            >
              {typesRV.map((item) => (
                <Option key={item.id} value={item.id}>
                  {" "}
                  {item.label}{" "}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* <Row>
                <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="date_rv" 
                        rules={[
                            {
                                required: true,
                                message: 'Veuillez sélectionner la date du rendez-vous',
                            },
                        ]}
                        initialValue={dayjs(new Date())}
                    >
                        <Calendar fullscreen={false} />
                    </Form.Item>
                </Col>
            </Row> */}

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

export default AddRv;

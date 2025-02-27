import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Typography,
  message,
  Space,
  Tooltip,
  Spin,
  Flex,
  Tree,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import TextArea from "antd/es/input/TextArea";
import { postActions } from "../../actions/actions";
import { endpoints } from "../../constants/endpoints.constants";
import useFetch from "../../utils/hooks/useFetch";
import { codesPrescriptions } from "../../constants/app.constants";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import { deletePopup } from "../../utils/helpers";
import { DeleteOutlined } from "@ant-design/icons";
import DataTable from "../../components/common/DataTable/DataTable";
import AddAnalyse from "../../components/specific/AddAnalyse/AddAnalyse";
import BackButton from "../../components/common/BackButton/BackButton";

const { Title, Text } = Typography;
  
const options = [
  {
    label: "Registre d'accueil",
    value: "registre_accueil",
  },
  {
    label: "Résultats NFS",
    value: "resultat_nfs",
  },
  {
    label: "Résultats SKAO",
    value: "resultat_skao",
  },
  {
    label: "Résultats ECBU",
    value: "resultat_ecbu",
  },
  {
    label: "Résultats SRV",
    value: "resultat_srv",
  },
  {
    label: "Résultats TB",
    value: "resultat_tb",
  },
  {
    label: "Résultats divers",
    value: "resultat_divers",
  },
  {
    label: "Résultats Biochimie (référence bulletin analyse)",
    value: "resultat_biochimie",
  },
  {
    label: "Résultats glycémie",
    value: "resultat_glycemie",
  },
  {
    label: "PV VIH (référence bulletin PCR,CV)",
    value: "pv_vih",
  },
  {
    label: "Palu (GE,TDR,codification)",
    value: "palu",
  },
  {
    label: "Bulletin d'analyse",
    value: "bulletin_analyse",
  },
  {
    label: "Bulletin de demande de sang",
    value: "bulletin_demande_sang",
  },
  {
    label: "Régistre bio-Ndar",
    value: "registre_bio_ndar",
  },
  {
    label: "Régistre Gen Expert et IDRt",
    value: "registre_gen_expert",
  },
];

function Infirmerie() {
  const navigate = useNavigate();
  const prescription = JSON.parse(sessionStorage.getItem("prescription"));
  const editPrescription = JSON.parse(
    sessionStorage.getItem("editPrescription")
  );
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [operationType, setOperationType] = useState("add");

  const [checkKeys, setCheckKeys] = useState([]);

  const [infirmeriePrescritions, setInfirmeriePrescritions] = useState(
    editPrescription?.listActes || []
  );
  const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));

  const save = () => {
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        switch (operationType) {
          case "add":
            const payload = {
              codepresc: editPrescription?.codepresc || codesPrescriptions.INF,
              datepresc:
                editPrescription?.datepresc ||
                new Date(values.datepresc).toISOString(),
              listActes: infirmeriePrescritions,
              diagnostic: editPrescription?.diagnostic || values.diagnostic,
              num_patient:
                editPrescription?.num_patient || currentPatient.num_patient,
              numcons: editPrescription?.numcons || prescription?.numcons,
              numpresc: editPrescription?.numpresc || null,
            };
            if (infirmeriePrescritions.length !== 0) {
              postActions(endpoints.prescriptions.ADD, payload).then(() => {
                setLoading(false);
                message.success("Actes enregistrés avec succès");
                setInfirmeriePrescritions([]);
              });
            } else {
              setLoading(false);
              message.warning(
                "Veuillez  sélectionner les analyses à prescrire"
              );
            }

            break;
          case "update":
            break;
          default:
            break;
        }
        form.resetFields();
        navigate(-1);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const { data, dataCopy, isLoading, onRefresh } = useFetch(
    endpoints.prescriptionsActes.LIST
  );

  // useEffect(() => {
  //       if (prescription.medecin !== userConnected.username) {
  //         navigate(-1);
  //       }
  // }, []);

  return (
    <Card>
      <Flex align="flex-start" justify="space-between">
        <BackButton />
      </Flex>
      <br />
      <Title level={4}>
        Prescription Infirmerie du patient N° {currentPatient.num_patient} /{" "}
        {currentPatient.prenom_patient} {currentPatient.nom_patient}{" "}
      </Title>

      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={[24, 24]} align={"stretch"}>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Form.Item
              label="Date Analyse"
              name="datepresc"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={dayjs(new Date())}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <br />
        <Title level={5}>Infirmerie (soins médicaux) </Title>
        <br />
        <Row gutter={[24, 24]} align={"stretch"}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Checkbox.Group
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
              }}
              value={checkKeys}
              options={dataCopy?.map((item) => {
                return {
                  value: item?.codeacte,
                  label: item?.libacte,
                };
              })}
              onChange={(value) => {
                setCheckKeys(value);
              }}
            />
          </Col>
          <Flex style={{width:"100%"}} justify="flex-end" >
            <Space>
              <Button
                type="primary"
                danger
                onClick={() => {
                  setCheckKeys([]);
                }}
                disabled={checkKeys.length === 0}
              >
                Réinitialiser
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  let tmp = [];
                  checkKeys.forEach((element) => {
                    let res = dataCopy?.find(
                      (item) => item.codeacte === element
                    );
                    tmp.push(res);
                  });
                  setInfirmeriePrescritions(tmp);
                  //setCheckKeys([]);
                }}
                disabled={checkKeys.length === 0}
              >
                Ajouter
              </Button>
            </Space>
          </Flex>
        </Row>
        <br />
        <Title level={5}>Liste des soins à faire</Title>
        <DataTable
          dataSourceCopy={infirmeriePrescritions}
          columns={[
            {
              title: "Code",
              dataIndex: "codeacte",
              key: "codeacte",
            },
            {
              title: "Acte",
              dataIndex: "libacte",
              key: "libacte",
            },

            {
              width: "auto",
              render: (record) => (
                <Space>
                  <Tooltip title="Supprimer">
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        deletePopup().then((response) => {
                          if (response.isConfirmed) {
                            const temp = infirmeriePrescritions.filter(
                              (element) => element.codeacte !== record.codeacte
                            );
                            setInfirmeriePrescritions(temp);
                          }
                        });
                      }}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />

        <FormFooter
          loading={loading}
          onCancel={() => {
            navigate(-1);
          }}
          htmlType="submit"
        />
      </Form>
    </Card>
  );
}

export default Infirmerie;

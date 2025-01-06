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
import AddImagerie from "../../components/specific/AddImagerie/AddImagerie";
import BackButton from "../../components/common/BackButton/BackButton";

const { Title } = Typography;

function Imagerie() {
  const navigate = useNavigate();
  const [checkKeys, setCheckKeys] = useState([]);

  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const prescription = JSON.parse(sessionStorage.getItem("prescription"));
  const editPrescription = JSON.parse(
    sessionStorage.getItem("editPrescription")
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [operationType, setOperationType] = useState("add");

  const [imageriesPrescrites, setImageriesPrescriptes] = useState(
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
              codepresc: editPrescription?.codepresc || codesPrescriptions.IMG,
              datepresc:
                editPrescription?.datepresc ||
                new Date(values.datepresc).toISOString(),
              listActes: imageriesPrescrites,
              num_patient:
                editPrescription?.num_patient || currentPatient.num_patient,
              numcons: editPrescription?.numcons || prescription?.numcons,
              numpresc: editPrescription?.numpresc || null,
            };
            if (imageriesPrescrites.length !== 0) {
              postActions(endpoints.prescriptions.ADD, payload).then(() => {
                setLoading(false);
                message.success("Imagerie prescrite avec succès");
                setImageriesPrescriptes([]);
              });
            } else {
              setLoading(false);
              message.warning(
                "Veuillez  sélectionner le ou les imageries(s) à prescrire"
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
    `${endpoints.actes.LIST}?codeacte=${codesPrescriptions.IMG}`
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
        Prescription Imagerie du patient N° {currentPatient.num_patient} /{" "}
        {currentPatient.prenom_patient} {currentPatient.nom_patient}{" "}
      </Title>

      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={[24, 24]} align={"middle"}>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Form.Item
              label="Date de prescription"
              name="datepresc"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
              initialValue={dayjs(new Date())}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            {/* <Form.Item 
                      label="Diagnostic"
                      name="diagnostic" 
                      rules={[
                          {
                              required: true,
                              message: 'Champ obligatoire',
                          },
                      ]}
                  >
                      <TextArea  rows={4} />
                  </Form.Item> */}
          </Col>
          {/* <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                <Button type="primary" onClick={()=>{setIsModalVisible(true);}} > Ajouter prescription(s) </Button>
              </Col> */}
          
        </Row>
        
        <Row>
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
        </Row>
        
        <br />
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
                          setImageriesPrescriptes(tmp);
                          //setCheckKeys([]);
                        }}
                        disabled={checkKeys.length === 0}
                      >
                        Ajouter
                      </Button>
                    </Space>
                  </Flex>
        {/* <Button
            type="primary"
            onClick={() => {
              let tmp = [];
              checkKeys.forEach((element) => {
                let res = dataCopy?.find((item) => item.codeacte === element);
                tmp.push(res);
              });
              setImageriesPrescriptes(tmp);
            }}
            disabled={checkKeys.length === 0}
          >
            Ajouter
          </Button> */}
          <br />
          <br />
        <Title level={5}>Liste des imageries</Title>
        <DataTable
          dataSourceCopy={imageriesPrescrites}
          columns={[
            {
              title: "Code",
              dataIndex: "codeacte",
              key: "codeacte",
            },
            {
              title: "Imagerie",
              dataIndex: "libacte",
              key: "libacte",
            },
            {
              title: "Quantité",
              dataIndex: "qte",
              key: "qte",
            },
            {
              title: "Motif",
              dataIndex: "motifImagerie",
              key: "motifImagerie",
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
                            const temp = imageriesPrescrites.filter(
                              (element) => element.codeacte !== record.codeacte
                            );
                            setImageriesPrescriptes(temp);
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

        <br />

        <FormFooter
          loading={loading}
          onCancel={() => {
            navigate(-1);
          }}
          htmlType="submit"
        />
      </Form>

      <Modal
        title={"Nouvelle prescription imagerie"}
        footer={null}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        destroyOnClose
      >
        <AddImagerie
          setIsModalVisible={setIsModalVisible}
          imageriesPrescrites={imageriesPrescrites}
          setImageriesPrescriptes={setImageriesPrescriptes}
          listImageries={dataCopy}
        />
      </Modal>
    </Card>
  );
}

export default Imagerie;

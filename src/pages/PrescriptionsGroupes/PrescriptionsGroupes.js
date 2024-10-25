import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Image,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useState } from "react";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import test_img from "./../../assets/test_img.jpg";
import { codesPrescriptions } from "../../constants/app.constants";
import Ordonnance from "../Ordonnance/Ordonnance";
import Analyse from "../Analyse/Analyse";
import Imagerie from "../Imagerie/Imagerie";
import GroupOrdonnance from "../../components/specific/GroupOrdonnance/GroupOrdonnance";
import GroupAnalyse from "../../components/specific/GroupAnalyse/GroupAnalyse";
import GroupImagerie from "../../components/specific/GroupImagerie/GroupImagerie";
import FormFooter from "../../components/common/FormFooter/FormFooter";
import { useNavigate } from "react-router";
import DataTable from "../../components/common/DataTable/DataTable";
import useSearch from "../../utils/hooks/useSearch";
import { useEffect } from "react";

const { Option } = Select;
const { Title , Text } = Typography;

function PrescriptionsGroupes() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);
  const { getColumnSearchProps } = useSearch();
  const {
    data: patientsList,
    dataCopy: patientsListCopy,
    setDataCopy: setPatientsListCopy,
    isLoading,
  } = useFetch(endpoints.patients.LIST);
  const [open, setOpen] = useState(false);
  const [prescriptionType, setPrescriptionType] = useState(
    codesPrescriptions.ORD
  );
  const [selectedPatients , setSelectedPatients] = useState([]);
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const openModal = () => {
    setOpen(true);
  };

  const save = () => {};

  useEffect(() => {
    console.log(selectedPatients)
  
    return () => {
      
    }
  }, [selectedPatients])
  
  return (
    <Card>
      <Title level={3}>Prescriptions groupées</Title>
      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={6} lg={4} xl={4}>
            <Form.Item
              label="Type de prescription"
              name="prescription_type"
              initialValue={prescriptionType}
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
                placeholder="Type de prescription"
                onChange={(value) => setPrescriptionType(value)}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children[1].toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={1} value={codesPrescriptions.ORD}>
                  Ordonnance
                </Option>
                <Option key={2} value={codesPrescriptions.ANA}>
                  Analyse
                </Option>
                <Option key={3} value={codesPrescriptions.IMG}>
                  Imagerie
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {prescriptionType === codesPrescriptions.ORD && <GroupOrdonnance />}
        {prescriptionType === codesPrescriptions.ANA && <GroupAnalyse />}
        {/*{prescriptionType === codesPrescriptions.IMG && <GroupImagerie />} */}

        <br />
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item
              label="Patients concernés"
              name="patients_list"
              rules={[
                {
                  required: true,
                  message: "Champ obligatoire",
                },
              ]}
            >
              <Select
                mode="multiple"
                style={{
                  width: "100%",
                }}
                loading={isLoading}
                placeholder="Sélectionner le ou les patients concernés"
                //defaultValue={["china"]}
                onChange={handleChange}
                options={patientsList.map((item) => {
                  return {
                    label: `${item.prenom_patient} ${item.nom_patient}`,
                    value: item.num_patient,
                    ...item,
                  };
                })}
                showSearch
                //filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                optionRender={(option) => (
                  <Space>
                    <Image
                      src={test_img}
                      width={25}
                      height={25}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />

                    {option.label}
                  </Space>
                )}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <br />
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Button
              type="primary" ghost
              onClick={() => {
                openModal();
              }}
            >
              Ajouter des patients{" "}
            </Button>
            <br/>
          </Col>
        </Row>

        <Modal
          title="Liste des patients"
          open={open}
          onCancel={() => {
            setOpen(false);
          }}
          footer={null}
          width={1000}
        >
          <Text>Sélectionner les patients concernés parmi la liste des patients</Text>
          <DataTable
            dataSource={patientsList}
            dataSourceCopy={patientsListCopy}
            setDataSourceCopy={setPatientsListCopy}
            tableLoading={isLoading}
            rowKey={(record) => record.num_patient}
            selectedRowKeys={selectedPatients}
            setSelectedRowKeys={setSelectedPatients}
            rowSelected
            columns={[
              {
                title: "",
                dataIndex: "image_patient",
                render: (record) => (
                  <Flex justify="center" align="center" className="table-data">
                    <Image
                      src={test_img}
                      width={35}
                      height={35}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  </Flex>
                ),
              },
              {
                title: "N°",
                dataIndex: "num_patient",
                key: "num_patient",
                ...getColumnSearchProps("num_patient"),
              },
              {
                title: "Nom",
                dataIndex: "nom_patient",
                key: "nom_patient",
                sorter: (a, b) =>
                  a.nom_patient.charCodeAt(0) - b.nom_patient.charCodeAt(0),
                ...getColumnSearchProps("nom_patient"),
              },
              {
                title: "Prénom",
                dataIndex: "prenom_patient",
                key: "prenom_patient",
                ...getColumnSearchProps("prenom_patient"),
              },
              {
                title: "Direction",
                dataIndex: "direction",
                key: "direction",
                filters: [
                  {
                    text: 'Direction1',
                    value: 'direction1',
                  },
                  {
                    text: 'Direction2',
                    value: 'direction2',
                  },
                ],
                onFilter: (value, record) => record.address.indexOf(value) === 0,
              },
              {
                title: "Département",
                dataIndex: "departement",
                key: "departement",
                filters: [
                  {
                    text: 'Département1',
                    value: 'departement1',
                  },
                  {
                    text: 'Département2',
                    value: 'departement2',
                  },
                ],
                onFilter: (value, record) => record.address.indexOf(value) === 0,
              },
              {
                title: "Service",
                dataIndex: "service",
                key: "service",
                filters: [
                  {
                    text: 'Service1',
                    value: 'service1',
                  },
                  {
                    text: 'Service2',
                    value: 'service2',
                  },
                ],
                onFilter: (value, record) => record.address.indexOf(value) === 0,
              },
              {
                title: "Bureau",
                dataIndex: "bureau",
                key: "bureau",
                filters: [
                  {
                    text: 'Bureau1',
                    value: 'bureau1',
                  },
                  {
                    text: 'Bureau2',
                    value: 'bureau2',
                  },
                ],
                onFilter: (value, record) => record.address.indexOf(value) === 0,
              },
            ]}
          />
          <br/>
          <Flex align="center" justify="center" >
            <Space>
              <Button type="primary" onClick={()=>{setOpen(false)}} ghost >Annuler</Button>
              <Button type="primary" onClick={()=>{setOpen(false)}} >Ajouter</Button>
            </Space>
          </Flex>
        </Modal>

        <FormFooter
          onCancel={() => {
            navigate(-1);
          }}
          htmlType={"submit"}
          loading={formLoading}
        />
      </Form>
    </Card>
  );
}

export default PrescriptionsGroupes;

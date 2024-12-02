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
  Tag,
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
const { Title, Text } = Typography;

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
  const [selectedPatients, setSelectedPatients] = useState([]);


  const openModal = () => {
    setOpen(true);
  };

  const save = () => {
    setOpen(false);
  };

  const filterListBySelectedPatients = (list1 , list2) => {
    const result = [];
    if (list2.length > 0) {
      list1.forEach((element) => {
        list2.forEach((id) => {
          if (element.num_patient === id) {
            result.push(element);
          }
        });
      });
    }
    return result;
  };

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
        
        <br />
        <Row gutter={[8, 8]} align="middle" >
          
          <Col xs={24} sm={24} md={20} lg={20} xl={20}>
            <Card size="small" bordered>
              {
                selectedPatients?.length === 0 ?
                <Text type="secondary"  > Aucun patient sélectionné (cliquer sur Ajouter des patients) </Text> :
              filterListBySelectedPatients(patientsListCopy, selectedPatients)?.map((item) => (
                <Tag onClose={() => { setSelectedPatients(selectedPatients.filter((elt) => elt !== item.num_patient)) }} key={item.num_patient} closable>
                  {" "}
                  {`${item.prenom_patient} ${item.nom_patient}`}{" "}
                </Tag>
              ))}
            </Card>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Button
              type="primary"
              ghost
              onClick={() => {
                openModal();
              }}
            >
              Ajouter des patients{" "}
            </Button>
            <br />
          </Col>
        </Row>

        <Modal
          title="Liste des patients"
          style={{ top: 20 }}
          styles={{
            header : {padding : "12px 24px"},
            footer : {padding : "12px 24px"},
            content : {margin : 0 , padding : 0} ,
            body: { overflow: "auto",minHeight: "50vh", maxHeight : "70vh", padding : "12px 24px"},
          }}
          width={1000}
          open={open}
          onCancel={() => {
            setOpen(false);
          }}
          destroyOnClose
        >
          <Text type='secondary' >
            Sélectionner les patients concernés parmi la liste des patients 
          </Text>
          <br />
          <br />
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
                    text: "Direction générale",
                    value: "direction1",
                  },
                  {
                    text: "Direction interne",
                    value: "direction2",
                  },
                ],
                onFilter: (value, record) =>
                  record.address.indexOf(value) === 0,
              },
              {
                title: "Département",
                dataIndex: "departement",
                key: "departement",
                filters: [
                  {
                    text: "Département de la chirurgie",
                    value: "departement1",
                  },
                  {
                    text: "Département des soins infirmiers",
                    value: "departement2",
                  },
                  {
                    text: "Département Informatique et systèmes d'informations",
                    value: "departement3",
                  },
                ],
                onFilter: (value, record) =>
                  record.address.indexOf(value) === 0,
              },
              {
                title: "Service",
                dataIndex: "service",
                key: "service",
                filters: [
                  {
                    text: "Service des urgences",
                    value: "service1",
                  },
                  {
                    text: "Service de la radiologie",
                    value: "service2",
                  },
                  {
                    text: "Service Analyse",
                    value: "service3",
                  },
                  {
                    text: "Service dentiste",
                    value: "service4",
                  },
                  {
                    text: "Service hospitalisation",
                    value: "service5",
                  },
                  {
                    text: "Pharmacie",
                    value: "service6",
                  },
                ],
                onFilter: (value, record) =>
                  record.address.indexOf(value) === 0,
              },
            ]}
          />
        </Modal>

        <br />
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

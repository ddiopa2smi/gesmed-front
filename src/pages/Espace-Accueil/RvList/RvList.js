import { ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Modal,
  Segmented,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DataTable from "../../../components/common/DataTable/DataTable";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
import { RiStethoscopeLine } from "react-icons/ri";
import { AiOutlineFolder } from "react-icons/ai";
import Examen from "../../../components/specific/Examen/Examen";
import { getActions } from "../../../actions/actions";
import useSearch from "../../../utils/hooks/useSearch";
import ReloadButton from "../../../components/common/ReloadButton/ReloadButton";
import { formatDate } from "../../../utils/helpers";

const { Title } = Typography;

function RvList() {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, isLoading, error, onRefresh } = useFetch(
    endpoints.rendezVous.LIST
  );
  const {data : services_medicaux} = useFetch(endpoints.services_medicaux.LIST)
  const { getColumnSearchProps } = useSearch();
  const [open, setOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [defaultExamPayload, setDefaultExamPayload] = useState(null);
  const [examActionLoading, setExamActionLoading] = useState(false);
  
  const [segmentedValue, setSegmentedValue] = useState("attente");

  const handleExamenClinique = (record) => {
    setOpen(true);
    setExamActionLoading(true);
    getActions(
      `${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${record.num_ordre}`
    )
      .then((response) => {
        // const resp = response.data;
        // console.log(resp);
        // sessionStorage.setItem("currentObject", JSON.stringify(record));
        // sessionStorage.setItem("initExamPayload", JSON.stringify(resp));
        setCurrentRecord(record);
        setDefaultExamPayload(response.data);
        //setExamActionLoading(false);
        // setOpen(true);
      })
      .catch((error) => {
        //setExamActionLoading(false);
        console.log(error);
        message.error("Une erreur est survenue, veuillez réessayer!");
      })
      .finally(() => {
        setExamActionLoading(false);
      });
  };

  const openMedicalFile = (record) => {
    navigate("/myspace/patients/dossier");
    sessionStorage.setItem("currentPatient", JSON.stringify(record));
  };

  useEffect(() => {}, [segmentedValue]);

  return (
    <Card loading={isLoading}>
      <Title level={3}>Liste des rendez-vous</Title>

      {/* <Flex justify="flex-end" align="center">
        <Space>
          <ReloadButton onRefresh={onRefresh} />
          <Segmented
            defaultValue={segmentedValue}
            options={[
              {
                value: "attente",
                label: "En attente",
              },
              {
                value: "traite",
                label: "Pre-examinés",
              },
            ]}
            onChange={(value) => {
              setSegmentedValue(value);
            }}
          />
        </Space>
      </Flex> */}

      <br />

      <DataTable
        dataSource={data}
        dataSourceCopy={
          segmentedValue === "attente"
            ? dataCopy.filter((element) => element.effectue === false)
            : dataCopy.filter((element) => element.effectue === true)
        }
        setDataSourceCopy={setDataCopy}
        rowKey={(record) => record.num_ordre}
        columns={[
          {
            title: "N°",
            dataIndex: "num_ordre",
            key: "num_ordre",
            ...getColumnSearchProps("num_ordre"),
          },
          {
            title: "N° patient",
            dataIndex: "num_patient",
            key: "num_patient",
            ...getColumnSearchProps("num_patient"),
          },
          {
            title: "Nom",
            dataIndex: "nom_patient",
            key: "nom_patient",
            ...getColumnSearchProps("nom_patient"),
          },
          {
            title: "Prénom",
            dataIndex: "prenom_patient",
            key: "prenom_patient",
            ...getColumnSearchProps("prenom_patient"),
          },
          {
            title: "Age",
            dataIndex: "age_patient",
            key: "age_patient",
            ...getColumnSearchProps("age_patient"),
          },
          {
            title: "Sexe",
            dataIndex: "sexe_patient",
            key: "sexe_patient",
            filters: ["MA","FE"].map((item)=>{
              return {
                  text : item,
                  value : item
              }
            }),
            onFilter: (value, record) =>
              record.sexe_patient.indexOf(value) === 0,
          },
          {
            title: 'Date RV',
            dataIndex: 'date_rv',
            key: 'date_rv',
            render: (record) => <div className='table-data'>
                <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
            </div>
          },
          {
            title: "Service",
            dataIndex: "service_medical",
            key: "service_medical",
            filters: services_medicaux.map((item)=>{
                return {
                    text : item?.lib_service,
                    value : item?.lib_service
                }
            }),
              onFilter: (value, record) =>
                record.service_medical.indexOf(value) === 0,
          },
          {
            title: "Médécin traitant",
            dataIndex: "medecin_traitant",
            key: "medecin_traitant",
            ...getColumnSearchProps('medecin_traitant')
          },
          {
            title: "Effectué",
            dataIndex: "effectue",
            key: "effectue",
            render: (record) => (
              <div className="table-data">
                {record ? (
                  <Tag color="#44bd32">
                    Oui
                  </Tag>
                ) : (
                  <Tag style={{ color: "black" }} color="#fbc531"> Non </Tag>
                )}
              </div>
            ),
          },
          
        ]}
      />

      <Modal
        title="Examen clinique"
        width={1000}
        open={open}
        onCancel={() => {
          setOpen(false);
          setCurrentRecord(null);
        }}
        footer={null}
        destroyOnClose
      >
        {examActionLoading ? (
          <Spin />
        ) : (
          <Examen
            setOpen={setOpen}
            currentRecord={currentRecord}
            onRefresh={onRefresh}
            defaultExamPayload={defaultExamPayload}
          />
        )}
      </Modal>
    </Card>
  );
}

export default RvList;

import { FolderOpenOutlined, ReloadOutlined } from "@ant-design/icons";
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
import DataTable from "../../common/DataTable/DataTable";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
import { RiStethoscopeLine } from "react-icons/ri";
import { AiOutlineFolder } from "react-icons/ai";
import Examen from "../Examen/Examen";
import { getActions } from "../../../actions/actions";
import useSearch from "../../../utils/hooks/useSearch";
import ReloadButton from "../../common/ReloadButton/ReloadButton";
import { ServiceType } from "../../../utils/types/types.ts";
import { formatDate } from "../../../utils/helpers.js";

const { Title } = Typography;

const RvList = ({ serviceType, today }) => {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, isLoading, error, onRefresh } = useFetch(
    today ? endpoints.rendezVous.TODAY_LIST : endpoints.rendezVous.LIST
  );
  const { data: services_medicaux } = useFetch(
    endpoints.services_medicaux.LIST
  );
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
    switch (serviceType) {
      case ServiceType.MEDICAL:
        navigate(`/espace-medical/patients/dossier`);
        break;
      case ServiceType.GYNECOLOGIE:
        navigate(
          `/espace-gynecologie/patients/dossier-medical/${record.num_patient}`
        );
        break;
      case ServiceType.DENTAIRE:
        navigate(
          `/espace-dentist/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.ANALYSE:
        navigate(
          `/espace-analyse/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.RADIOLOGIE:
        navigate(
          `/espace-radiologie/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.HOSPITALISATION:
        navigate(
          `/espace-hospitalisation/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.INFIRMERIE:
        navigate(
          `/espace-infirmerie/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      default:
        break;
    }

    sessionStorage.setItem("currentPatient", JSON.stringify(record));
  };

  console.log(data);

  return (
    <div>
      <Flex justify="space-between" align="center">
        <Space>
          <Title level={4}>
            {today
              ? "Liste des patients du jour"
              : "Liste de tous les rendez-vous"}
          </Title>
        </Space>
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
      </Flex>

      <br />

      <DataTable
        dataSource={data}
        dataSourceCopy={
          segmentedValue === "attente"
            ? dataCopy.filter((element) => {
                return serviceType === ServiceType.ACCUEIL
                  ? element.effectue === false
                  : element.service_medical === serviceType &&
                      element.effectue === false;
              })
            : dataCopy.filter((element) =>
                serviceType === ServiceType.ACCUEIL
                  ? element.effectue === true
                  : element.service_medical === serviceType &&
                    element.effectue === true
              )
        }
        setDataSourceCopy={setDataCopy}
        rowKey={(record) => record.num_ordre}
        tableLoading={isLoading}
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
            filters: ["MA", "FE"].map((item) => {
              return {
                text: item,
                value: item,
              };
            }),
            onFilter: (value, record) =>
              record.sexe_patient.indexOf(value) === 0,
          },
          {
            title: "Examens",
            dataIndex: "effectue",
            key: "effectue",
            render: (record) => (
              <div className="table-data">
                {!record ? (
                  <Tag style={{ color: "black" }} color="#fbc531">
                    {" "}
                    En Attente{" "}
                  </Tag>
                ) : (
                  <Tag color="#44bd32"> Effectué </Tag>
                )}
              </div>
            ),
          },
          {
            title: "Date RV",
            dataIndex: "date_rv",
            key: "date_rv",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}>
                  {" "}
                  {formatDate(record)}{" "}
                </span>
              </div>
            ),
          },
          {
            title: "Service",
            dataIndex: "service_medical",
            key: "service_medical",
            filters: services_medicaux.map((item) => {
              return {
                text: item?.lib_service,
                value: item?.lib_service,
              };
            }),
            onFilter: (value, record) =>
              record.service_medical.indexOf(value) === 0,
          },
          {
            title: "Médécin traitant",
            dataIndex: "medecin_traitant",
            key: "medecin_traitant",
            ...getColumnSearchProps("medecin_traitant"),
          },
          {
            fixed: "right",
            render: (record) => (
              <Flex align="center">
                <Space size="middle">
                  {/* {((serviceType === ServiceType.ACCUEIL) || (serviceType === ServiceType.MEDICAL) )
                     && (
                    <Tooltip title="Examiner">
                      <RiStethoscopeLine
                        cursor="pointer"
                        size={18}
                        onClick={() => {
                          handleExamenClinique(record);
                        }}
                      />
                    </Tooltip>
                  )} */}
                  <Tooltip title="Examiner">
                    <RiStethoscopeLine
                      cursor="pointer"
                      size={18}
                      onClick={() => {
                        handleExamenClinique(record);
                      }}
                    />
                  </Tooltip>
                  {serviceType !== ServiceType.ACCUEIL && (
                    <Tooltip title="Ouvrir dossier">
                      <FolderOpenOutlined
                        style={{ fontSize: 18 }}
                        onClick={() => {
                          openMedicalFile(record);
                        }}
                      />
                    </Tooltip>
                  )}
                </Space>
              </Flex>
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
    </div>
  );
};

export default RvList;

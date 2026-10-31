import {
  EditOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  HeartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
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
import PeriodeSelect from "../../common/PeriodeSelect/PeriodeSelect";
import { RiStethoscopeLine } from "react-icons/ri";
import { FaTooth } from "react-icons/fa";
import { AiOutlineFolder } from "react-icons/ai";
import Examen from "../Examen/Examen";
import {
  deleteActions,
  getActions,
  postActions,
} from "../../../actions/actions";
import useSearch from "../../../utils/hooks/useSearch";
import ReloadButton from "../../common/ReloadButton/ReloadButton";
import { ServiceType } from "../../../utils/types/types.ts";
import {
  deletePopup,
  formatDate,
  formatDateTime,
} from "../../../utils/helpers.js";
import AddRv from "../AddRv/AddRv.js";
import EditButton from "../../common/EditButton/EditButton.js";
import TotalTag from "../../common/TotalTag/TotalTag.js";
import AddAnalyseExterne from "../AddAnalyseExterne/AddAnalyseExterne.js";
import { LOGO_BROWN } from "../../../constants/app.constants.js";
import { isAdmin, isAssistantEspace } from "../../../utils/profils.js";
import ConstantesDentaires from "../ConstantesDentaires/ConstantesDentaires.js";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RvList = ({ serviceType, today }) => {
  const navigate = useNavigate();
  const userConnected = JSON.parse(sessionStorage.getItem('userConnected'));
  const [periode, setPeriode] = useState(1);
  const [dateRange, setDateRange] = useState(null);

  const listUrl = today
    ? endpoints.rendezVous.TODAY_LIST
    : (periode === 9
      ? (dateRange && dateRange[0] && dateRange[1]
        ? endpoints.rendezVous.LIST_BY_DATE(
          dateRange[0].format("YYYY-MM-DD"),
          dateRange[1].format("YYYY-MM-DD"),
        )
        : null)
      : endpoints.rendezVous.LIST(periode));

  const { data, dataCopy, setDataCopy, isLoading, error, onRefresh } = useFetch(listUrl);
  const [operationType, setOperationType] = useState("");
  const { getColumnSearchProps, getColumnRangeSearchProps } = useSearch();
  const [open, setOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [defaultExamPayload, setDefaultExamPayload] = useState(null);
  const [examActionLoading, setExamActionLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAddPrescriptionModalVisible, setIsAddPrescriptionModalVisible] = useState(false);
  const [prescriptionPatient, setPrescriptionPatient] = useState(null);

  const [segmentedValue, setSegmentedValue] = useState("attente");
  const [constantesPatient, setConstantesPatient] = useState(null);
  const [demarrageEnCours, setDemarrageEnCours] = useState(null);

  const estDentaire = serviceType === ServiceType.DENTAIRE;
  const assistantEspace = isAssistantEspace(serviceType, userConnected);

  // Dentaire : pas de pré-examen médical. La consultation est créée au besoin, puis ouverte directement
  const demarrerConsultationDentaire = async (record) => {
    setDemarrageEnCours(record.num_ordre);
    try {
      const response = await getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${record.num_ordre}`);
      if (!response?.data) throw new Error("Consultation introuvable");
      if (!response.data.numcons) {
        const creation = await postActions(endpoints.consultations.SAVE, { ...response.data, numpat: record.num_patient, numrv: record.num_ordre });
        if (creation?.data?.Saved !== true) throw new Error("Consultation non créée");
      }
      sessionStorage.setItem("currentPatient", JSON.stringify(record));
      navigate(`/espace-dentist/consultation/${record.num_patient}/${record.num_ordre}?serviceType=${serviceType}`, { state: { patient: record } });
    } catch (error) {
      console.log(error);
      message.error("La consultation n'a pas pu être démarrée, veuillez réessayer");
      setDemarrageEnCours(null);
    }
  };

  const onAddPrescription = (record) => {
    setPrescriptionPatient(record);
    setIsAddPrescriptionModalVisible(true);
  };

  const handleExamenClinique = (record) => {
    setOpen(true);
    setOperationType("");
    setExamActionLoading(true);
    getActions(
      `${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${record.num_ordre}`
    )
      .then((response) => {
        setCurrentRecord(record);
        setDefaultExamPayload(response.data);
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

  const onUpdate = (record) => {
    setOpen(true);
    setOperationType("update");
    setCurrentRecord(record);
  };

  const onMultipleDelete = (records) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        postActions(endpoints.rendezVous.DELETE, records).then((response) => {
          message.success(response?.data);
          setSelectedRows([]);
          onRefresh();
        });
      }
    });
  };

  const openMedicalFile = (record) => {
    switch (serviceType) {
      case ServiceType.MEDICAL:
        //navigate(`/espace-medical/patients/dossier`);
        navigate(
          `/espace-medical/patients/${record.num_patient}`
        );
        break;
      case ServiceType.GYNECOLOGIE:
        navigate(
          `/espace-gynecologie/patients/${record.num_patient}`
        );
        break;
      case ServiceType.DENTAIRE:
        navigate(
          `/espace-dentist/patients/${record?.num_patient}`
        );
        break;
      case ServiceType.ANALYSE_BIO_MEDICAL:
        navigate(
          `/espace-analyse/patients/${record?.num_patient}`
        );
        break;
      case ServiceType.RADIOLOGIE:
        navigate(
          `/espace-radiologie/patients/${record?.num_patient}`
        );
        break;
      case ServiceType.HOSPITALISATION:
        navigate(
          `/espace-hospitalisation/patients/${record?.num_patient}`
        );
        break;
      case ServiceType.INFIRMERIE:
        navigate(
          `/espace-infirmerie/patients/${record?.num_patient}`
        );
        break;
      default:
        break;
    }

    sessionStorage.setItem("currentPatient", JSON.stringify(record));
  };

  // Accueil, administrateurs et assistant(e)s de l'espace : tous les RV (du service) ; praticiens : uniquement leurs propres RV
  const voitTousLesRv = serviceType === ServiceType.ACCUEIL || isAdmin(userConnected) || assistantEspace;
  const estVisible = (element) =>
    serviceType === ServiceType.ACCUEIL
    || (element.service_medical === serviceType
      && (voitTousLesRv || element.id_medecin === userConnected?.login));

  const getFilteredData = () => {
    const effectue = segmentedValue !== "attente";
    return dataCopy.filter(element => element.effectue === effectue && estVisible(element)).reverse()
  }

  return (
    <Card>
      <Flex justify="space-between" align="center">
        <div>
          <Title level={4} style={{ color: LOGO_BROWN }}>
            {today
              ? "Liste des patients du jour"
              : "Liste complète des rendez-vous"}
            &nbsp; <TotalTag value={getFilteredData().length} />
          </Title>
          <Text type="secondary" >
            {
              today ? "Visualisez et gérez les rendez-vous du jour."
                : "Gérer et suivre l'ensemble des rendez-vous des patients des différents services de la clinique."
            }
          </Text>
        </div>
        <Space size="large">
          <ReloadButton onRefresh={onRefresh} />
          {!today && (
            <PeriodeSelect
              value={periode}
              onChange={(value) => setPeriode(value)}
            />
          )}
          {!today && periode === 9 && (
            <RangePicker
              variant="filled"
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          )}
          <Button
            type="primary"
            size="small"
            onClick={() => {
              onMultipleDelete(selectedRows);
            }}
            disabled={selectedRows.length === 0}
            danger
          >
            Supprimer
          </Button>

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
        compact
        dataSource={data.filter(estVisible)}
        rowSelected
        selectedRowKeys={selectedRows}
        setSelectedRowKeys={setSelectedRows}
        dataSourceCopy={getFilteredData()}
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
            align: "center",
            ...getColumnRangeSearchProps("age_patient"),
          },
          {
            title: "Sexe",
            dataIndex: "sexe_patient",
            key: "sexe_patient",
            align: "center",
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
            title: serviceType === ServiceType.ANALYSE_BIO_MEDICAL ? "Saisie" : "Examens",
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
                  {formatDateTime(record)}{" "}
                </span>
              </div>
            ),
          },
          {
            title: "Service",
            dataIndex: "service_medical",
            key: "service_medical",
            filters: Array.from(
              new Set((dataCopy || []).map((item) => item?.service_medical).filter(Boolean))
            ).map((value) => ({ text: value, value })),
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
                <Space>
                  {serviceType === ServiceType.ANALYSE_BIO_MEDICAL ? (
                    !record.effectue && (
                      <Tooltip title="Nouvelle prescription externe">
                        <Button
                          type="text"
                          onClick={() => {
                            onAddPrescription(record);
                          }}
                          icon={<FileAddOutlined style={{ fontSize: 18, color: "#3867d6" }} />}
                        />
                      </Tooltip>
                    )
                  ) : (
                    <>
                      <Tooltip title="Modifier">
                        {!record.effectue && (
                          <EditButton
                            onEdit={() => {
                              onUpdate(record);
                            }}
                          />
                        )}
                      </Tooltip>
                      {estDentaire && (
                        <>
                          <Tooltip title="Constantes avant le soin">
                            <Button
                              type="text"
                              onClick={() => setConstantesPatient(record)}
                              icon={<HeartOutlined style={{ fontSize: 18, color: "#eb3b5a" }} />}
                            />
                          </Tooltip>
                          {!assistantEspace && (
                            <Tooltip title={record.effectue ? "Ouvrir la consultation" : "Démarrer la consultation"}>
                              <Button
                                type="text"
                                loading={demarrageEnCours === record.num_ordre}
                                onClick={() => demarrerConsultationDentaire(record)}
                                icon={<FaTooth size={17} color="#3867d6" />}
                              />
                            </Tooltip>
                          )}
                        </>
                      )}
                      {
                        serviceType !== ServiceType.ACCUEIL && !estDentaire &&
                        <Tooltip title="Données cliniques">
                          <Button
                            type="text"
                            onClick={() => {
                              handleExamenClinique(record);
                            }}
                            icon={
                              <RiStethoscopeLine
                                cursor="pointer"
                                size={18}
                                color="#3867d6"
                              />
                            }
                          />
                        </Tooltip>
                      }

                      {(record.effectue && serviceType !== ServiceType.ACCUEIL) && (
                        <Tooltip title="Ouvrir dossier">
                          <Button
                            type="text"
                            onClick={() => {
                              openMedicalFile(record);
                            }}
                            icon={
                              <FolderOpenOutlined
                                style={{ fontSize: 18, color: "#eb3b5a" }}
                              />
                            }
                          />
                        </Tooltip>
                      )}
                    </>
                  )}
                </Space>
              </Flex>
            ),
          },
        ]}
      />

      <Modal
        style={{ top: 20 }}
        styles={{
          header: { padding: "12px 24px" },
          footer: { padding: "12px 24px" },
          content: { margin: 0, padding: 0 },
          body: {
            overflow: "auto",
            minHeight: "50vh",
            maxHeight: "80vh",
            padding: "12px 24px",
          },
        }}
        width={1000}
        title={
          operationType === "update"
            ? "Modifier le rendez-vous"
            : "Données cliniques"
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setCurrentRecord(null);
        }}
        footer={null}
        destroyOnClose
      >
        {operationType === "update" ? (
          <AddRv
            setOpen={setOpen}
            onRefresh={onRefresh}
            currentRecord={currentRecord}
            operationType="update"
          />
        ) : examActionLoading ? (
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

      {constantesPatient && (
        <ConstantesDentaires
          record={constantesPatient}
          onFermer={() => setConstantesPatient(null)}
          onEnregistre={() => {
            setConstantesPatient(null);
            onRefresh();
          }}
        />
      )}

      <Modal
        style={{ top: 20, maxWidth: "95vw" }}
        styles={{
          body: {
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "90vh",
          },
        }}
        width={1150}
        title="Nouvelle prescription d'analyse externe"
        open={isAddPrescriptionModalVisible}
        onCancel={() => {
          setIsAddPrescriptionModalVisible(false);
          setPrescriptionPatient(null);
        }}
        footer={null}
        destroyOnClose
      >
        <AddAnalyseExterne
          setIsModalVisible={setIsAddPrescriptionModalVisible}
          onRefresh={onRefresh}
          initialPatient={prescriptionPatient}
        />
      </Modal>
    </Card>
  );
};

export default RvList;

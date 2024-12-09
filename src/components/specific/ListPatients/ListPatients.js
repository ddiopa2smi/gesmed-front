import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useFetch from "../../../utils/hooks/useFetch";
import useSearch from "../../../utils/hooks/useSearch";
import PatientsAdvancedSearch from "../PatientsAdvancedSearch/PatientsAdvancedSearch";
import ExportFile from "../../common/ExportFile/ExportFile";
import AddRv from "../AddRv/AddRv";
import AddPatient from "../AddPatient/AddPatient";
import DataTable from "../../common/DataTable/DataTable";
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Flex,
  message,
  Modal,
  Space,
  Typography,
} from "antd";
import SearchBar from "../../common/SearchBar/SearchBar";
import AdvancedSearchButton from "../../common/AdvancedSearchButton/AdvancedSearchButton";
import ReloadButton from "../../common/ReloadButton/ReloadButton";
import ExcellExportButton from "../../common/ExcellExportButton/ExcellExportButton";
import { endpoints } from "../../../constants/endpoints.constants";
import {
  deletePopup,
  formatDate,
  getTypePatient,
} from "../../../utils/helpers";
import { deleteActions } from "../../../actions/actions";
import { MoreOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { ServiceType } from "../../../utils/types/types.ts";

const { Title, Text } = Typography;

function ListPatients({ serviceType }) {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, isLoading, onRefresh } = useFetch(
    endpoints.patients.LIST
  );
  const { getColumnSearchProps } = useSearch();
  const patientsList = data;
 
  const [open, setOpen] = useState(false);
  const [operationType, setOperationType] = useState("");
  const [currentRecord, setCurrentRecord] = useState(null);

  const onAdd = () => {
    setCurrentRecord(null);
    setOperationType("add");
    setOpen(true);
  };

  const onEdit = (record) => {
    setOperationType("update");
    setOpen(true);
    setCurrentRecord({ ...record });
  };

  const onDelete = (record) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(
          `${endpoints.patients.DELETE}/${record?.num_patient}`
        ).then((response) => {
          if (response.data.Deleted === true) {
            message.success("Ligne retirée avec succès");
            onRefresh();
          }
        });
      }
    });
  };

  const onOpenMedicalFolder = (record) => {
    switch (serviceType) {
      case ServiceType.MEDICAL:
        //navigate(`/espace-medical/dossier-medical/${record?.num_patient}`);
        navigate("/espace-medical/patients/dossier", {
          state: { currentPatient: record },
          replace: false,
        });
        break;
      case ServiceType.DENTAIRE:
        navigate(`/espace-dentist/patients/dossier-medical/${record?.num_patient}`);
        break;
      case ServiceType.GYNECOLOGIE:
        navigate(`/espace-gynecologie/patients/dossier-medical/${record?.num_patient}`);
        break;
      case ServiceType.ANALYSE:
        navigate(`/espace-analyse/patients/dossier-medical/${record?.num_patient}`);
          break;
      case ServiceType.RADIOLOGIE:
        navigate(`/espace-radiologie/patients/dossier-medical/${record?.num_patient}`);
          break;
      case ServiceType.HOSPITALISATION:
        navigate(`/espace-hospitalisation/patients/dossier-medical/${record?.num_patient}`);
          break;
      case ServiceType.INFIRMERIE:
        navigate(`/espace-infirmerie/patients/dossier-medical/${record?.num_patient}`);
          break;
      default:
        break;
    }
    sessionStorage.setItem("currentPatient", JSON.stringify(record));
  };

  const onCreateRV = (record) => {
    setOperationType("rv");
    setOpen(true);
    setCurrentRecord({ ...record });
  };

  const onExport = () => {
    setOperationType("exp");
    setOpen(true);
  };

  const onDisplayAdvancedSearch = () => {
    setOperationType("ads");
    setOpen(true);
  };

  return (
    <Card>
      <Title level={3}>Liste des patients</Title>

      <Flex justify="space-between" align="center">
        <Space>
          <SearchBar
            data={data}
            setDataCopy={setDataCopy}
            listKeys={["num_patient", "nom_patient", "prenom_patient"]}
          />
          <AdvancedSearchButton onClick={onDisplayAdvancedSearch} />{" "}
          &nbsp;&nbsp;
        </Space>
        <Space>
          <ReloadButton onRefresh={onRefresh} />
          <ExcellExportButton onClick={onExport} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Ajouter
          </Button>
        </Space>
      </Flex>

      <br />

      <DataTable
        dataSource={patientsList}
        dataSourceCopy={serviceType === ServiceType.GYNECOLOGIE ? dataCopy.filter((element) => element.sexe_patient === "FE") : dataCopy}
        setDataSourceCopy={setDataCopy}
        tableLoading={isLoading}
        rowKey={(record) => record.num_patient}
        columns={[
          {
            title: "",
            dataIndex: "image_patient",
            render: (record) => (
              <Flex justify="center" align="center" className="table-data">
                {/* <Image src={test_img} width={35} height={35} style={{borderRadius:'50%',objectFit:"cover"}} /> */}
                <Avatar icon={<UserOutlined />} />
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
            title: "Téléphone",
            dataIndex: "tel_patient",
            key: "tel_patient",
            ...getColumnSearchProps("tel_patient"),
          },
          {
            title: "Age",
            dataIndex: "age_patient",
            key: "age_patient",
            sorter: (a, b) => a.age_patient - b.age_patient,
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
            title: "Type",
            dataIndex: "type_patient",
            key: "type_patient",
            // render: (record) => (
            //   <div className="table-data">
            //     <Text ellipsis> {getTypePatient(record)} </Text>
            //   </div>
            // ),
          },
          {
            title: "Département",
            dataIndex: "lib_dept",
            key: "lib_dept",
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
            onFilter: (value, record) => record.address.indexOf(value) === 0,
          },
          {
            title: "Date de création",
            dataIndex: "date_creation",
            key: "date_creation",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}>
                  {" "}
                  {formatDate(record)}{" "}
                </span>
              </div>
            ),
          },
          // {
          //   title: "Crée par",
          //   dataIndex: "created_by",
          //   key: "created_by",
          // },
          {
            fixed: "right",
            render: (record) => (
              <Flex align="center">
                <Dropdown
                  menu={{
                    items: [
                      serviceType !== ServiceType.ACCUEIL && {
                        label: "Ouvrir Dossier Médical",
                        key: "0",
                        onClick: () => {
                          onOpenMedicalFolder(record);
                        },
                      },
                      {
                        label: "Créer RV",
                        key: "1",
                        onClick: () => {
                          onCreateRV(record);
                        },
                      },
                      {
                        label: "Modifier",
                        key: "2",
                        onClick: () => {
                          onEdit(record);
                        },
                      },
                      {
                        label: "Supprimer",
                        key: "3",
                        onClick: () => {
                          onDelete(record);
                        },
                      },
                    ],
                  }}
                  trigger={["click"]}
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </Flex>
            ),
          },
        ]}
      />

      <Modal
        style={{ top: 20 }}
        styles={{
          header: { padding: "12px 24px", },
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
          (operationType === "add" && "Nouveau patient") ||
          (operationType === "update" && "Mettre à jour les données") ||
          (operationType === "rv" && "Créer un Rendez-vous") ||
          (operationType === "ads" && "Recherche avancée") ||
          (operationType === "exp" && "Exporter le document")
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setCurrentRecord(null);
        }}
        footer={null}
        destroyOnClose={operationType === "ads" ? false : true}
        // okButtonProps={{
        //     htmlType : "submit",
        //     autoFocus : true
        // }}
      >
        {(operationType === "add" || operationType === "update") && (
          <AddPatient
            setOpen={setOpen}
            operationType={operationType}
            onRefresh={onRefresh}
            currentRecord={currentRecord}
          />
        )}

        {operationType === "rv" && (
          <AddRv
            setOpen={setOpen}
            onRefresh={onRefresh}
            currentRecord={currentRecord}
          />
        )}

        {operationType === "ads" && (
          <PatientsAdvancedSearch
            dataSource={patientsList}
            dataSourceCopy={dataCopy}
            setDataSourceCopy={setDataCopy}
            setOpen={setOpen}
          />
        )}

        {operationType === "exp" && (
          <ExportFile
            title="Liste des patients"
            data={dataCopy}
            setOpen={setOpen}
          />
        )}
      </Modal>
    </Card>
  );
}

export default ListPatients;

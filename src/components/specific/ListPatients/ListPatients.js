import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import useFetch from "../../../utils/hooks/useFetch";
import usePaginatedFetch from "../../../utils/hooks/usePaginatedFetch";
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
  Form,
  Input,
  message,
  Modal,
  Space,
  Tag,
  theme,
  Typography,
} from "antd";
import { MoreOutlined, PlusOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import AdvancedSearchButton from "../../common/AdvancedSearchButton/AdvancedSearchButton";
import ReloadButton from "../../common/ReloadButton/ReloadButton";
import ExcellExportButton from "../../common/ExcellExportButton/ExcellExportButton";
import { endpoints } from "../../../constants/endpoints.constants";
import {
  deletePopup,
  formatDate,
} from "../../../utils/helpers";
import { deleteActions } from "../../../actions/actions";
import { ServiceType } from "../../../utils/types/types.ts";
import { LOGO_BROWN } from "../../../constants/app.constants.js";
import dayjs from "dayjs";
import TotalTag from "../../common/TotalTag/TotalTag.js";

const { Title, Text } = Typography;

// Couleur stable par type de patient (basée sur un hash du libellé, pour rester cohérente
// quel que soit le libellé exact renvoyé par le back-end).
const TYPE_TAG_COLORS = ["blue", "green", "gold", "volcano", "purple", "geekblue", "magenta", "cyan", "orange", "lime"];
const getTypeColor = (value) => {
  if (!value) return "default";
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TYPE_TAG_COLORS[Math.abs(hash) % TYPE_TAG_COLORS.length];
};

function ListPatients({ serviceType }) {

  const { token: { colorBgElevated, colorBorder, } } = theme.useToken();
  const navigate = useNavigate();
  const { getColumnFilterProps } = useSearch();

  // Recherche/tri/filtres/pagination pilotés côté serveur (table patients volumineuse).
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("nom_patient");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [sexePatient, setSexePatient] = useState(undefined);
  const [suspension, setSuspension] = useState("A");
  const [codeDept, setCodeDept] = useState(undefined);
  const [typePatient, setTypePatient] = useState(undefined);

  // Critères de la recherche multi-critères (valeurs brutes du formulaire de la modale).
  const [advancedFilters, setAdvancedFilters] = useState({});

  const isGynecologie = serviceType === ServiceType.GYNECOLOGIE;
  // Les critères de la recherche multi-critères priment sur les filtres de colonnes équivalents.
  const effectiveSexeFilter = isGynecologie ? "FE" : (advancedFilters.sexe_patient || sexePatient);

  const listUrl = useMemo(() => {
    const [dateCreationDebut, dateCreationFin] = advancedFilters.date_creation || [];
    return endpoints.patients.LIST({
      page: page - 1,
      size: pageSize,
      search: search || undefined,
      sortField,
      sortOrder,
      sexe_patient: effectiveSexeFilter,
      suspension: advancedFilters.suspension || suspension,
      code_dept: advancedFilters.code_dept || codeDept,
      type_patient: advancedFilters.type_patient ?? typePatient,
      num_patient: advancedFilters.num_patient?.trim(),
      nom_patient: advancedFilters.nom_patient?.trim(),
      prenom_patient: advancedFilters.prenom_patient?.trim(),
      tel_patient: advancedFilters.tel_patient?.trim(),
      age_min: advancedFilters.age_min,
      age_max: advancedFilters.age_max,
      date_creation_debut: dateCreationDebut ? dayjs(dateCreationDebut).format("YYYY-MM-DD") : undefined,
      date_creation_fin: dateCreationFin ? dayjs(dateCreationFin).format("YYYY-MM-DD") : undefined,
    });
  }, [page, pageSize, search, sortField, sortOrder, effectiveSexeFilter, suspension, codeDept, typePatient, advancedFilters]);

  const { content, totalElements, isLoading, onRefresh } = usePaginatedFetch(listUrl);
  const patientsList = content;

  // Copie locale pour la recherche avancée / l'export : ne porte que la page actuellement chargée
  // (le jeu de données complet n'est plus disponible côté client avec la pagination serveur).
  const [dataCopy, setDataCopy] = useState([]);
  useEffect(() => {
    setDataCopy(content);
  }, [content]);

  const { data: listTypePatients } = useFetch(endpoints.patients.LIST_TYPE);
  const { data: listDepartements } = useFetch(endpoints.departements.LIST);

  const searchDebounceRef = useRef(null);
  const handleSearchChange = (value) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 300);
  };

  const handleTableChange = (paginationInfo, filters, sorter) => {
    if (paginationInfo) {
      setPage(paginationInfo.current);
      setPageSize(paginationInfo.pageSize);
    }
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === "descend" ? "DESC" : "ASC");
    }
    setSexePatient(filters?.sexe_patient?.[0]);
    setSuspension(filters?.suspension?.[0] || "A");
    setCodeDept(filters?.lib_dept?.[0]);
    // Le filtre affiche les libellés type_patient réellement présents dans les données,
    // mais l'API attend le code_patient (Integer) correspondant.
    const selectedTypeLabel = filters?.type_patient?.[0];
    const matchingType = (listTypePatients || []).find((item) => item.type_patient === selectedTypeLabel);
    setTypePatient(matchingType?.code_patient);
  };

  const [open, setOpen] = useState(false);
  const [operationType, setOperationType] = useState("");
  const [currentRecord, setCurrentRecord] = useState(null);

  const [advancedSearchForm] = Form.useForm();

  const applyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters || {});
    setPage(1);
  };

  const handleRemoveFilter = (key) => {
    const updatedFilters = { ...advancedFilters };
    delete updatedFilters[key];
    advancedSearchForm.setFieldValue(key, undefined);
    applyAdvancedFilters(updatedFilters);
  };

  const handleClearAllFilters = () => {
    advancedSearchForm.resetFields();
    applyAdvancedFilters({});
  };

  const getFilterLabel = (key) => {
    switch (key) {
      case "num_patient":
        return "Matricule";
      case "nom_patient":
        return "Nom";
      case "prenom_patient":
        return "Prénom";
      case "tel_patient":
        return "Téléphone";
      case "sexe_patient":
        return "Sexe";
      case "age_min":
        return "Age min";
      case "age_max":
        return "Age max";
      case "type_patient":
        return "Type";
      case "code_dept":
        return "Département";
      case "suspension":
        return "Etat";
      case "date_creation":
        return "Date création";
      default:
        return key;
    }
  };

  const getFilterValueDisplay = (key, value) => {
    if (key === "sexe_patient") {
      return value === "MA" ? "Masculin" : value === "FE" ? "Féminin" : value;
    }
    if (key === "type_patient") {
      return (listTypePatients || []).find((item) => item.code_patient === value)?.type_patient || value;
    }
    if (key === "code_dept") {
      return (listDepartements || []).find((item) => item.code_dept === value)?.lib_dept || value;
    }
    if (key === "suspension") {
      return value === "A" ? "Actif" : value === "S" ? "Suspendu" : value;
    }
    if (key === "date_creation" && Array.isArray(value)) {
      if (value[0] && value[1]) {
        return `${dayjs(value[0]).format("DD/MM/YYYY")} au ${dayjs(value[1]).format("DD/MM/YYYY")}`;
      }
    }
    return String(value);
  };

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
        navigate(`/espace-medical/patients/${record?.num_patient}`);
        break;
      case ServiceType.DENTAIRE:
        navigate(`/espace-dentist/patients/${record?.num_patient}`);
        break;
      case ServiceType.GYNECOLOGIE:
        navigate(`/espace-gynecologie/patients/${record?.num_patient}`);
        break;
      case ServiceType.ANALYSE:
        navigate(`/espace-analyse/patients/${record?.num_patient}`);
        break;
      case ServiceType.RADIOLOGIE:
        navigate(`/espace-radiologie/patients/${record?.num_patient}`);
        break;
      case ServiceType.HOSPITALISATION:
        navigate(`/espace-hospitalisation/patients/${record?.num_patient}`);
        break;
      case ServiceType.INFIRMERIE:
        navigate(`/espace-infirmerie/patients/${record?.num_patient}`);
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
      <Title level={3} style={{ color: LOGO_BROWN }}>Liste des patients</Title>

      <Text type="secondary" >
        Gérer l'ajout, la modification , la prise de rendez-vous et la suppression des patients. Vous pouvez également
        consulter les dossiers médicaux des patients.
      </Text>

      <br />
      <br />

      <Flex justify="space-between" align="center">
        <Space>
          <Input
            style={{ width: "300px" }}
            placeholder="Entrer votre recherche"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
          />
          <TotalTag value={totalElements} />
        </Space>
        <Space>
          <ReloadButton onRefresh={onRefresh} />
          <AdvancedSearchButton onClick={onDisplayAdvancedSearch} />
          <ExcellExportButton onClick={onExport} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Ajouter
          </Button>
        </Space>
      </Flex>

      {Object.entries(advancedFilters).some(([_, val]) => val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || (val.length > 0 && val[0] && val[1]))) && (
        <Flex align='center' justify='space-between' style={{ marginTop: 16, padding: 12, background: colorBgElevated, borderRadius: '8px', border: `1px solid ${colorBorder}` }}>
          <Space wrap>
            <Text type="secondary" strong >Filtres actifs :</Text>
            {Object.entries(advancedFilters).map(([key, value]) => {
              if (value === undefined || value === null || value === "") return null;
              if (Array.isArray(value) && (value.length === 0 || !value[0] || !value[1])) return null;
              return (
                <Tag
                  key={key}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    handleRemoveFilter(key);
                  }}
                  color="blue"
                  style={{
                    borderRadius: '4px',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  {getFilterLabel(key)}: {getFilterValueDisplay(key, value)}
                </Tag>
              );
            })}
          </Space>
          <Button
            type="link"
            danger
            size="small"
            onClick={handleClearAllFilters}
            style={{
              padding: 0,
              marginLeft: 8,
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: 500,
              height: 'auto',
              lineHeight: 'normal'
            }}
          >
            Tout effacer
          </Button>

        </Flex>
      )}

      <br />

      <DataTable
        compact
        dataSource={patientsList}
        dataSourceCopy={patientsList}
        tableLoading={isLoading}
        rowKey={(record) => record.num_patient}
        totalCount={totalElements}
        onTableChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
        }}
        columns={[
          {
            title: "",
            dataIndex: "image_patient",
            render: (record) => (
              <Flex justify="center" align="center" className="table-data">
                <Avatar icon={<UserOutlined />} />
              </Flex>
            ),
          },
          {
            title: "Matricule",
            dataIndex: "num_patient",
            key: "num_patient",
            render: (record) => (
              <Text copyable={{ toolTip: "Copier" }} ellipsis >{record}</Text>
            ),
          },
          {
            title: "Nom",
            dataIndex: "nom_patient",
            key: "nom_patient",
            sorter: true,
          },
          {
            title: "Prénom",
            dataIndex: "prenom_patient",
            key: "prenom_patient",
          },
          {
            title: "Téléphone",
            dataIndex: "tel_patient",
            key: "tel_patient",
          },
          {
            title: "Age",
            dataIndex: "age_patient",
            key: "age_patient",
            sorter: true,
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}>
                  {`${record} ${record > 1 ? "ans" : "an"}`}
                </span>
              </div>
            ),
          },
          {
            title: "Sexe",
            dataIndex: "sexe_patient",
            key: "sexe_patient",
            filters: isGynecologie ? undefined : ["MA", "FE"].map((item) => {
              return {
                text: item,
                value: item,
              };
            }),
            filterMultiple: false,
          },
          {
            title: "Type",
            dataIndex: "type_patient",
            key: "type_patient",
            ...getColumnFilterProps("type_patient", patientsList),
            render: (value) => <Tag color={getTypeColor(value)}> {value} </Tag>,
          },
          {
            title: "Département",
            dataIndex: "lib_dept",
            key: "lib_dept",
            filters: (listDepartements || []).map((item) => ({
              text: item.lib_dept,
              value: item.code_dept,
            })),
            filterMultiple: false,
            filterSearch: true,
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
          {
            fixed: "right",
            title: "Etat",
            dataIndex: "suspension",
            key: "suspension",
            render: (record) => (
              <Tag color={record === "A" ? "success" : "error"}>
                {record === "A" ? "Actif" : "Suspendu"}
              </Tag>
            ),
            filters: [{ text: "Actif", value: "A" }, { text: "Suspendu", value: "S" }],
            filterMultiple: false,
          },
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
                        danger: true
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
            setOpen={setOpen}
            form={advancedSearchForm}
            hideSexe={isGynecologie}
            onSearch={applyAdvancedFilters}
            onReset={() => applyAdvancedFilters({})}
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

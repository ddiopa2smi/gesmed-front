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
  Tooltip,
  Typography,
} from "antd";
import {
  CalendarOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined, FolderOpenOutlined, MoreOutlined,
  PhoneOutlined, PlusOutlined, SearchOutlined, StopOutlined, UserAddOutlined,
} from "@ant-design/icons";
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
import { getTypeColor } from "../../../utils/typePatient";

const { Title, Text } = Typography;


function ListPatients({ serviceType }) {

  const { token: { colorBgElevated, colorBorder, colorPrimary } } = theme.useToken();
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
      {/* En-tête */}
      <Flex justify="space-between" align="flex-start" wrap gap={12}>
        <div>
          <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>Liste des patients</Title>
          <Text type="secondary">
            Ajout, modification, prise de rendez-vous et accès aux dossiers médicaux des patients.
          </Text>
        </div>
        <Space wrap>
          <ReloadButton onRefresh={onRefresh} />
          <AdvancedSearchButton onClick={onDisplayAdvancedSearch} />
          <ExcellExportButton onClick={onExport} />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Nouveau patient
          </Button>
        </Space>
      </Flex>

      {/* Recherche rapide (le nombre de résultats est affiché par le tableau) */}
      <Flex align="center" wrap gap={12} style={{ marginTop: 16 }}>
        <Input
          size="large"
          style={{ maxWidth: 420 }}
          placeholder="Rechercher : prénom et nom (ex. « sarr abdou »), matricule, téléphone..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
        />
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
            // Tri serveur : le champ trié reste nom_patient
            title: "Patient",
            dataIndex: "nom_patient",
            key: "nom_patient",
            sorter: true,
            render: (_, record) => {
              const isFemme = record.sexe_patient === "FE";
              return (
                <Flex align="center" gap={10}>
                  <Avatar size={34} style={{ backgroundColor: isFemme ? "#eb2f96" : colorPrimary, flexShrink: 0, fontWeight: 600 }}>
                    {`${record.prenom_patient?.[0] || ""}${record.nom_patient?.[0] || ""}`.toUpperCase()}
                  </Avatar>
                  <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                    <Text strong>{record.prenom_patient} {record.nom_patient}</Text>
                    <div style={{ marginTop: 2 }}>
                      {/* Matricule en pastille, couleur du titre de la page pour le distinguer du nom */}
                      <Text
                        copyable={{ text: record.num_patient, tooltips: ["Copier le matricule", "Copié"] }}
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: 0.4,
                          color: LOGO_BROWN,
                          background: `${LOGO_BROWN}14`,
                          padding: "1px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {record.num_patient}
                      </Text>
                    </div>
                  </div>
                </Flex>
              );
            },
          },
          {
            title: "Sexe",
            dataIndex: "sexe_patient",
            key: "sexe_patient",
            align: "center",
            filters: isGynecologie ? undefined : [
              { text: "Masculin", value: "MA" },
              { text: "Féminin", value: "FE" },
            ],
            filterMultiple: false,
            render: (value) => value
              ? <Tag color={value === "FE" ? "magenta" : "blue"} style={{ marginInlineEnd: 0 }}>{value === "FE" ? "F" : "M"}</Tag>
              : "-",
          },
          {
            title: "Âge",
            dataIndex: "age_patient",
            key: "age_patient",
            align: "center",
            sorter: true,
            render: (value) => (value !== null && value !== undefined ? `${value} ${value > 1 ? "ans" : "an"}` : "-"),
          },
          {
            title: "Téléphone",
            dataIndex: "tel_patient",
            key: "tel_patient",
            render: (value) => value
              ? <Text><PhoneOutlined style={{ color: colorPrimary, marginRight: 6 }} />{value}</Text>
              : <Text type="secondary">-</Text>,
          },
          {
            title: "Type",
            dataIndex: "type_patient",
            key: "type_patient",
            ...getColumnFilterProps("type_patient", patientsList),
            render: (value) => value ? <Tag color={getTypeColor(value)}>{value}</Tag> : "-",
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
            render: (value) => value
              ? <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 200, display: "inline-block" }}>{value}</Text>
              : <Text type="secondary">-</Text>,
          },
          {
            title: "Créé le",
            dataIndex: "date_creation",
            key: "date_creation",
            render: (value) => value
              ? <Text type="secondary"><CalendarOutlined style={{ marginRight: 6 }} />{formatDate(value)}</Text>
              : "-",
          },
          {
            fixed: "right",
            title: "État",
            dataIndex: "suspension",
            key: "suspension",
            align: "center",
            render: (value) => value === "A"
              ? <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginInlineEnd: 0 }}>Actif</Tag>
              : <Tag icon={<StopOutlined />} color="error" style={{ marginInlineEnd: 0 }}>Suspendu</Tag>,
            filters: [{ text: "Actif", value: "A" }, { text: "Suspendu", value: "S" }],
            filterMultiple: false,
          },
          {
            fixed: "right",
            render: (record) => (
              <Space size={0}>
                {/* Actions principales directement accessibles */}
                {serviceType !== ServiceType.ACCUEIL && (
                  <Tooltip title="Ouvrir le dossier médical">
                    <Button type="text" style={{ color: colorPrimary }} icon={<FolderOpenOutlined />} onClick={() => onOpenMedicalFolder(record)} />
                  </Tooltip>
                )}
                <Tooltip title="Créer un rendez-vous">
                  <Button type="text" style={{ color: colorPrimary }} icon={<CalendarOutlined />} onClick={() => onCreateRV(record)} />
                </Tooltip>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      { key: "edit", label: "Modifier", icon: <EditOutlined />, onClick: () => onEdit(record) },
                      { type: "divider" },
                      { key: "delete", label: "Supprimer", icon: <DeleteOutlined />, danger: true, onClick: () => onDelete(record) },
                    ],
                  }}
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
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
            // Hauteur minimale réservée aux formulaires longs (fiche patient)
            minHeight: operationType === "add" || operationType === "update" ? "50vh" : undefined,
            maxHeight: "80vh",
            padding: "12px 24px",
          },
        }}
        // Largeur adaptée au contenu de chaque fenêtre
        width={operationType === "rv" ? 720 : operationType === "ads" ? 900 : 1000}
        title={
          (operationType === "add" && <span><UserAddOutlined style={{ color: colorPrimary, marginRight: 8 }} />Nouveau patient</span>) ||
          (operationType === "update" && <span><EditOutlined style={{ color: colorPrimary, marginRight: 8 }} />Modifier le patient {currentRecord?.num_patient}</span>) ||
          (operationType === "rv" && <span><CalendarOutlined style={{ color: colorPrimary, marginRight: 8 }} />Nouveau rendez-vous</span>) ||
          (operationType === "ads" && <span><SearchOutlined style={{ color: colorPrimary, marginRight: 8 }} />Recherche avancée de patients</span>) ||
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

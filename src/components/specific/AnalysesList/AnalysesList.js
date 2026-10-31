import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Flex,
  message,
  Modal,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import dayjs from "dayjs";
import DataTable from "../../common/DataTable/DataTable";
import useFetch from "../../../utils/hooks/useFetch";
import useSearch from "../../../utils/hooks/useSearch";
import ReloadButton from "../../common/ReloadButton/ReloadButton";
import PeriodeSelect from "../../common/PeriodeSelect/PeriodeSelect";
import { endpoints } from "../../../constants/endpoints.constants";
import DetailsPrescription from "../DetailsPrescription/DetailsPrescription";
import AddAnalyseExterne from "../AddAnalyseExterne/AddAnalyseExterne";
import { ServiceType } from "../../../utils/types/types.ts";
import { deletePopup, formatDateTime, printPDF, exportToExcel } from "../../../utils/helpers.js";
import { getEtatSegmentedOptions } from "../../../constants/table.constants";
import { deleteActions } from "../../../actions/actions.js";
import Link from "antd/es/typography/Link";
import UploadResultatModal from "../../common/UploadResultatModal/UploadResultatModal.js";
import { LOGO_BROWN } from "../../../constants/app.constants.js";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const etatSegmentedOptions = getEtatSegmentedOptions({ non: "En attente", oui: "Cloturées" });

function AnalysesList({ onDataChange }) {
  const [segmentedValue, setSegmentedValue] = useState("Non");
  const [periode, setPeriode] = useState(1);
  const [dateRange, setDateRange] = useState(null);

  const listUrl = periode === 9
    ? (dateRange && dateRange[0] && dateRange[1]
      ? endpoints.prescriptions.LIST_BY_DATE(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
        segmentedValue
      )
      : null)
    : endpoints.prescriptions.LIST(periode, segmentedValue);

  const { data, dataCopy, setDataCopy, isLoading, error, onRefresh: refreshList } = useFetch(listUrl);
  // Après chaque action : recharge la liste et prévient le parent (ex : tableau de bord)
  const onRefresh = () => {
    refreshList();
    onDataChange?.();
  };
  const { getColumnSearchProps, getColumnDateSearchProps, getColumnFilterProps } = useSearch();
  const [open, setOpen] = useState(false);
  const [operationType, setOperationType] = useState("");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isExternalModalVisible, setIsExternalModalVisible] = useState(false);

  const [isUploadResultatModalVisible, setIsUploadResultatModalVisible] = useState(false);
  const [numPrescription, setNumPrescription] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleUploadResultatModal = (numPresc) => {
    setIsUploadResultatModalVisible(true);
    setNumPrescription(numPresc);
  };

  const viewResultat = (numPrescription) => {
    printPDF(endpoints.files.GET_RESULTAT(numPrescription));
  };

  const deleteResultat = (numPrescription) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(endpoints.files.DELETE_RESULTAT(numPrescription)).then(
          (response) => {
            if (response.data) {
              message.success("Résultat supprimé avec succès");
              onRefresh();
            }
          },
        );
      }
    });
  };

  const onDeletePrescription = (record) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(`${endpoints.prescriptions.DELETE}/${record?.numpresc}`).then((response) => {
          if (response.data.Deleted === true) {
            message.success("Prescription supprimée avec succès");
            onRefresh();
          }
        });
      }
    });
  };

  const handleExport = (typePrescription) => {
    const rows = dataCopy
      .filter((element) =>
        element.code === "ANA" &&
        element.type_prescription === typePrescription &&
        element.isdone === segmentedValue
      )
      .map((item) => ({
        "N° Analyse": item.numpresc,
        "Date prescription": formatDateTime(item.datepresc),
        "N° Patient": item.num_patient,
        "Patient": item.patient,
        "Prescripteur": item.prescripteur,
        "Date effet": formatDateTime(item.date_effet),
        "Effectué par": item.effectue_par,
        "Etat": item.isdone === "Oui" ? "Cloturée" : "En attente",
      }));
    exportToExcel(rows, `Analyses_${typePrescription}_${dayjs().format("YYYYMMDD_HHmm")}`);
  };

  const buildActionsColumn = (showDelete) => ({
    render: (record) => (
      <Flex align="center">
        <Space size="middle">
          <Tooltip title="Voir détails">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentRecord(record);
                setOpen(true);
              }}
            />
          </Tooltip>
          {showDelete && record.isdone === "Non" && (
            <Tooltip title="Supprimer">
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDeletePrescription(record)}
              />
            </Tooltip>
          )}
        </Space>
      </Flex>
    ),
  });

  const columns = [
    {
      title: "N° Analyse",
      dataIndex: "numpresc",
      key: "numpresc",
      sorter: (a, b) => String(a.numpresc).localeCompare(String(b.numpresc)),
      ...getColumnSearchProps("numpresc"),
    },
    {
      title: "Date prescription",
      dataIndex: "datepresc",
      key: "datepresc",
      sorter: (a, b) => new Date(a.datepresc) - new Date(b.datepresc),
      ...getColumnDateSearchProps("datepresc"),
      render: (record) => (
        <div className="table-data">{formatDateTime(record)}</div>
      ),
    },
    {
      title: "N° Patient",
      dataIndex: "num_patient",
      key: "num_patient",
      ...getColumnSearchProps("num_patient"),
    },
    {
      title: "Patient",
      dataIndex: "patient",
      key: "patient",
      ...getColumnSearchProps("patient"),
    },
    {
      title: "Prescripteur",
      dataIndex: "prescripteur",
      key: "prescripteur",
      ...getColumnFilterProps("prescripteur", dataCopy),
    },
    {
      title: "Date effet",
      dataIndex: "date_effet",
      key: "date_effet",
      sorter: (a, b) => new Date(a.date_effet) - new Date(b.date_effet),
      ...getColumnDateSearchProps("date_effet"),
      render: (record) => <Text> {formatDateTime(record)} </Text>,
    },
    {
      title: "Effectué par",
      dataIndex: "effectue_par",
      key: "effectue_par",
      ...getColumnFilterProps("effectue_par", dataCopy),
    },
    {
      title: "Etat",
      dataIndex: "isdone",
      key: "isdone",
      render: (record) => (
        <Tag color={record === "Oui" ? "green" : "red"}>
          {record === "Oui" ? "Cloturée" : "En attente"}
        </Tag>
      ),
    },
    ...(segmentedValue === "Oui" ? [
      {
        title: "Résultat",
        key: "resultat",
        fixed: "right",
        render: (record) =>
          record?.resultat ? (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "view",
                    label: "Visualiser",
                    onClick: () => {
                      viewResultat(record.numpresc);
                    },
                    icon: <EyeOutlined />
                  },
                  {
                    key: "edit",
                    label: "Modifier",
                    onClick: () => {
                      handleUploadResultatModal(record.numpresc);
                    },
                    icon: <EditOutlined />
                  },
                  {
                    key: "delete",
                    label: "Supprimer",
                    onClick: () => {
                      deleteResultat(record.numpresc);
                    },
                    icon: <DeleteOutlined />,
                    danger: true
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Link ellipsis={{ tooltip: true }}>
                Afficher
              </Link>
            </Dropdown>
          ) : (
            <Button
              type="link"
              icon={<UploadOutlined />}
              onClick={() => {
                handleUploadResultatModal(record.numpresc);
              }}
            >
              Charger le résultat
            </Button>
          ),
      },
    ] : []),
    buildActionsColumn(false),
  ];

  const columnsExterne = [...columns.slice(0, -1), buildActionsColumn(true)];

  return (
    <Card
      title={<Title level={4} style={{ color: LOGO_BROWN }}> Liste des analyses </Title>}
      tabList={[
        {
          key: "interne",
          label: "Internes",
          children: (
            <div>
              <Flex justify="space-between" align="center">
                <Title level={5} style={{ margin: 0 }}>Analyses Internes</Title>
                <Space>
                  <ReloadButton onRefresh={onRefresh} />
                  <PeriodeSelect
                    value={periode}
                    onChange={(value) => setPeriode(value)}
                  />
                  {periode === 9 && (
                    <RangePicker
                      variant="filled"
                      format="DD/MM/YYYY"
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates)}
                    />
                  )}
                  <Segmented
                    defaultValue={segmentedValue}
                    options={etatSegmentedOptions}
                    onChange={(value) => {
                      setSegmentedValue(value);
                    }}
                  />
                  <Button type="primary" style={{ backgroundColor: "green" }} icon={<FileExcelOutlined />} onClick={() => handleExport("Interne")} >Export Excel</Button>
                </Space>
              </Flex>

              <br />

              <DataTable
                isLoading={isLoading}
                compact
                dataSource={data.filter((element) => element.code === "ANA" && element.type_prescription === "Interne")}
                dataSourceCopy={dataCopy.filter((element) => element.code === "ANA" && element.type_prescription === "Interne" && element.isdone === segmentedValue)}
                setDataSourceCopy={setDataCopy}
                columns={columns}
              />

              <Modal
                style={{ top: 20, maxWidth: 1000 }}
                styles={{
                  header: { padding: "12px 24px" },
                  footer: { padding: "12px 24px" },
                  content: { margin: 0, padding: 0 },
                  body: {
                    overflow: "auto",
                    maxHeight: "80vh",
                    padding: "12px 24px",
                  },
                }}
                width="90%"
                title={`Analyse N° ${currentRecord?.numpresc}`}
                open={open}
                onCancel={() => {
                  setOpen(false);
                  setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
              >
                <DetailsPrescription
                  prescriptionItem={currentRecord}
                  setPrescriptionItem={setCurrentRecord}
                  serviceType={ServiceType.ANALYSE}
                  setOpen={setOpen}
                  onRefresh={onRefresh}
                />
              </Modal>
            </div>
          ),
        },
        {
          key: "externe",
          label: "Externes",
          children: (
            <div>
              <Flex justify="space-between" align="center">
                <Title level={5} style={{ margin: 0 }}>Analyses Externes</Title>
                <Space>
                  <ReloadButton onRefresh={onRefresh} />
                  <PeriodeSelect
                    value={periode}
                    onChange={(value) => setPeriode(value)}
                  />
                  {periode === 9 && (
                    <RangePicker
                      variant="filled"
                      format="DD/MM/YYYY"
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates)}
                    />
                  )}
                  <Segmented
                    defaultValue={segmentedValue}
                    options={etatSegmentedOptions}
                    onChange={(value) => {
                      setSegmentedValue(value);
                    }}
                  />
                  <Button type="primary" style={{ backgroundColor: "green" }} icon={<FileExcelOutlined />} onClick={() => handleExport("Externe")} >Export Excel</Button>
                  <Button type="primary" style={{ backgroundColor: "green" }} onClick={() => setIsExternalModalVisible(true)} >Ajouter</Button>
                </Space>
              </Flex>

              <br />

              <DataTable
                isLoading={isLoading}
                compact
                dataSource={data.filter((element) => element.code === "ANA" && element.type_prescription === "Externe")}
                dataSourceCopy={dataCopy.filter((element) => element.code === "ANA" && element.type_prescription === "Externe" && element.isdone === segmentedValue)}
                setDataSourceCopy={setDataCopy}
                columns={columnsExterne}
                rowKey="numpresc"
                rowSelected
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                getCheckboxProps={(record) => ({ disabled: record.isdone === "Oui" })}
              />

              <Modal
                style={{ top: 20, maxWidth: 1000 }}
                styles={{
                  header: { padding: "12px 24px" },
                  footer: { padding: "12px 24px" },
                  content: { margin: 0, padding: 0 },
                  body: {
                    overflow: "auto",
                    maxHeight: "80vh",
                    padding: "12px 24px",
                  },
                }}
                width="90%"
                title={`Analyse N° ${currentRecord?.numpresc}`}
                open={open}
                onCancel={() => {
                  setOpen(false);
                  setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
              >
                <DetailsPrescription
                  prescriptionItem={currentRecord}
                  setPrescriptionItem={setCurrentRecord}
                  serviceType={ServiceType.ANALYSE}
                  setOpen={setOpen}
                  onRefresh={onRefresh}
                />
              </Modal>

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
                open={isExternalModalVisible}
                onCancel={() => setIsExternalModalVisible(false)}
                footer={null}
                destroyOnClose
              >
                <AddAnalyseExterne setIsModalVisible={setIsExternalModalVisible} onRefresh={onRefresh} />
              </Modal>
            </div>
          ),
        },
      ]}
    >
      <UploadResultatModal
        isModalVisible={isUploadResultatModalVisible}
        setIsModalVisible={setIsUploadResultatModalVisible}
        numPrescription={numPrescription}
        refreshConsultation={onRefresh}
      />
    </Card>
  );
}

export default AnalysesList;

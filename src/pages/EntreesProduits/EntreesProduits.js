import {
  CheckCircleFilled,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Card,
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
import { useNavigate } from "react-router";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { deletePopup, formatDate, validPopup } from "../../utils/helpers";
import { postActions, putActions } from "../../actions/actions";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import EditButton from "../../components/common/EditButton/EditButton";
import DetailsEntree from "./components/DetailsEntree";

const { Title } = Typography;

function EntreesProduits() {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, onRefresh, isLoading } = useFetch(
    endpoints.entrees_produits.LIST
  );
  const [open, setOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  //const [segmentedValue, setSegmentedValue] = useState("");
  const [segmentedValue, setSegmentedValue] = useState("all");
  const onAdd = () => {};

  const onMultipleDelete = (records) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        postActions(endpoints.entrees_produits.DELETE_MULTIPLE, records).then(
          (response) => {
            if (response?.data) {
              message.success("Eléments supprimés avec succès");
              setSelectedRows([]);
              onRefresh();
            }
          }
        );
      }
    });
  };

  const onMultipleValid = (records) => {
    validPopup().then((result) => {
      if (result.isConfirmed) {
        const temp = dataCopy.filter((item) => records.includes(item?.num_br));
        putActions(endpoints.entrees_produits.VALID_MULTIPLE, temp).then(
          (response) => {
            if (response?.data) {
              message.success(response?.data);
              setSelectedRows([]);
              onRefresh();
            }
          }
        );
      }
    });
  };

  const onViewDetails = (record) => {
    setCurrentRecord(record);
    setOpen(true);
  };

  return (
    <Card>
      <Title level={3}>Mouvement des entrées</Title>
      <br />

      <Flex justify="space-between" align="center">
        <Segmented
          defaultValue={segmentedValue}
          options={[
            {
              value: "all",
              label: "Tout",
            },
            {
              value: "recu",
              label: "Réceptionnées",
            },
            {
              value: "valid",
              label: "Validées",
            },
          ]}
          onChange={(value) => {
            setSegmentedValue(value);
          }}
        />
        <Space>
          <ReloadButton onRefresh={onRefresh} />
          <Button
            type="primary"
            danger
            onClick={() => onMultipleDelete(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Supprimer
          </Button>
          <Button
            type="primary"
            onClick={() => onMultipleValid(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Valider
          </Button>
          <Button
            type="primary"
            onClick={() => {
              navigate("/espace-pharmacie/entrees-produits/reception-commande");
            }}
          >
            Réception commande
          </Button>
          {/* <Button type='primary' icon={<PlusOutlined/>} >Entrées diverses</Button> */}
        </Space>
      </Flex>

      <br />

      <DataTable
        dataSource={data}
        dataSourceCopy={
          segmentedValue === "all"
            ? dataCopy
            : dataCopy.filter((record) => record?.etat === segmentedValue)
        }
        setDataSourceCopy={setDataCopy}
        rowSelected
        selectedRowKeys={selectedRows}
        setSelectedRowKeys={setSelectedRows}
        rowKey={(record) => record.num_br}
        getCheckboxProps={(record) => ({
          disabled: record?.etat === "valid",
        })}
        columns={[
          {
            title: "Date",
            dataIndex: "date_liv",
            key: "date_liv",
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
            title: "Date péremption",
            dataIndex: "date_peremption",
            key: "date_peremption",
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
            title: "Numéro",
            dataIndex: "num_br",
            key: "num_br",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "Réf (BC)",
            dataIndex: "num_bc",
            key: "num_bc",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "Fournisseur",
            dataIndex: "fourn_raisoc",
            key: "fourn_raisoc",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "N° BL(Frcs)",
            dataIndex: "num_bl",
            key: "num_bl",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "N° Lot",
            dataIndex: "num_lot",
            key: "num_lot",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "Etat",
            dataIndex: "etat",
            key: "etat",
            render: (record) => (
              <div className="table-data">
                {record === "recu" ? (
                  <Tag color="cyan"> Receptionnée </Tag>
                ) : record === "valid" ? (
                  <Tag color="green">Validée</Tag>
                ) : (
                  <Tag color="orange">En attente</Tag>
                )}
              </div>
            ),
          },
          {
            render: (record) => (
              <Flex align="center">
                <Space size="middle">
                  <Tooltip title="Voir détails">
                    <Button type="text" icon={<EyeOutlined />} onClick={() => onViewDetails(record)} />
                  </Tooltip>
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
            maxHeight: "80vh",
            padding: "12px 24px",
          },
        }}
        width={1000}
        title={"Détails entrée produit"}
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        footer={null}
      >
        <DetailsEntree
          setOpen={setOpen}
          currentRecord={currentRecord}
          onRefresh={onRefresh}
        />
      </Modal>
    </Card>
  );
}

export default EntreesProduits;

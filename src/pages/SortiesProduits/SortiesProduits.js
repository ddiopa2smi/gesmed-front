import {
  DeleteOutlined,
  EditOutlined,
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
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import { deletePopup, formatDate } from "../../utils/helpers";
import { postActions } from "../../actions/actions";

const { Title } = Typography;

function SortiesProduits() {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, onRefresh, isLoading } = useFetch(
    endpoints.sorties_produits.LIST
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [segmentedValue, setSegmentedValue] = useState("all");
  const onAdd = () => {
    navigate(
      "/espace-pharmacie/sorties-produits/new-mouvement-sortie"
    );
  }
  
  const onEdit = (record) => {
    navigate(
      "/espace-pharmacie/sorties-produits/new-mouvement-sortie", {
        state: {
          currentRecord: record,
        },
      }
    );
  };
  const onMultipleDelete = (records) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        postActions(endpoints.sorties_produits.DELETE_MULTIPLE, records).then(
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

  return (
    <Card>
      <Title level={3}>Mouvement des sorties</Title>
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
              value: "Saisie",
              label: "Saisies",
            },
            {
              value: "Valid",
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
            onClick={onAdd}
            icon={<PlusOutlined />}
          >
            Nouveau
          </Button>
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
        rowKey={(record) => record.num_sortie}
        columns={[
          {
            title: "Date",
            dataIndex: "date_sortie",
            key: "date_sortie",
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
            dataIndex: "num_sortie",
            key: "num_sortie",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "Motif sortie",
            dataIndex: "motif_sortie",
            key: "motif_sortie",
            render : (record) => {
              let result = "";
              switch (record) {
                case "Comptoir":
                  result = "Livraison comptoir"
                  break;
                case "Perime":
                  result = "Produit périmé"
                  break;
                case "Gratuit":
                  result = "Déstockage";
                  break;
                case "Defaut":
                  result = "Défault";
                  break;
                default:
                  result = "Livraison comptoir"
                  break;
              }
              return <div className="table-data" >{result}</div>;
            }
          },
          {
            title: "Etat",
            dataIndex: "etat",
            key: "etat",
            render: (record) => (
              <div className="table-data">
                {record === "Saisie" ? (
                  <Tag color="blue">{record}</Tag>
                ) : (
                  <Tag color="green">{record}</Tag>
                )}
              </div>
            ),
          },
          {
            render: (record) => (
              <Flex align="center">
                <Space size="middle">
                  <Tooltip title="Editer">
                    <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                  </Tooltip>
                </Space>
              </Flex>
            ),
          },
        ]}
      />
    </Card>
  );
}

export default SortiesProduits;

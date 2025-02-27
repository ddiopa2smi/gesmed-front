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
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import { deletePopup } from "../../utils/helpers";
import { postActions } from "../../actions/actions";

const { Title } = Typography;

function SortiesProduits() {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, onRefresh, isLoading } = useFetch(
    endpoints.sorties_produits.LIST
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [segmentedValue, setSegmentedValue] = useState("all");
  const onAdd = () => {};
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
            onClick={() => {
              navigate(
                "/espace-pharmacie/sorties-produits/new-mouvement-sortie"
              );
            }}
            icon={<PlusOutlined />}
          >
            Nouveau
          </Button>
        </Space>
      </Flex>

      <br />

      <DataTable
        dataSource={[]}
        dataSourceCopy={[]}
        setDataSourceCopy={null}
        columns={[
          {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}> {record} </span>
              </div>
            ),
          },
          {
            title: "Numéro",
            dataIndex: "numero",
            key: "numero",
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
          },
          {
            title: "Etat",
            dataIndex: "etat",
            key: "etat",
          },
          {
            render: (record) => (
              <Flex align="center">
                <Space size="middle">
                  <Tooltip title="Editer">
                    <Button type="link" icon={<EditOutlined />} />
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <Button type="link" danger icon={<DeleteOutlined />} />
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

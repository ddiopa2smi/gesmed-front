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
import { deletePopup, formatDate } from "../../utils/helpers";
import { postActions } from "../../actions/actions";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";

const { Title } = Typography;

function EntreesProduits() {
  const navigate = useNavigate();
  const { data, dataCopy, setDataCopy, onRefresh, isLoading } = useFetch(
    endpoints.entrees_produits.LIST
  );
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
            onClick={() => {
              navigate("/espace-pharmacie/entrees-produits/reception-commande");
            }}
            icon={<PlusOutlined />}
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
            title: "Etat",
            dataIndex: "etat",
            key: "etat",
            render: (record) => (
              <div className="table-data">
                {record === "recu" ? (
                  <Tag color="cyan"> Reçue </Tag>
                ) : record === "valid" ? (
                  <Tag color="green">Validée</Tag>
                ) : (
                  <Tag color="orange">En attente</Tag>  
                )}
              </div>
            ),
          },
          // {
          //     render :  (record)=>(
          //         <Flex align='center' >
          //             <Space size="middle" >
          //                 <Tooltip title="Editer">
          //                     <Button type='link' icon={<EditOutlined/>} />
          //                 </Tooltip>
          //                 <Tooltip title="Supprimer">
          //                     <Button type='link' danger icon={<DeleteOutlined/>} />
          //                 </Tooltip>
          //             </Space>
          //         </Flex>
          //     )
          // }
        ]}
      />
    </Card>
  );
}

export default EntreesProduits;

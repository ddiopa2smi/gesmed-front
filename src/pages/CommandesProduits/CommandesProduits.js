import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  MoreOutlined,
  PlusOutlined,
  PrinterOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Divider,
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
import { useNavigate } from "react-router";
import DataTable from "../../components/common/DataTable/DataTable";
import { Link } from "react-router-dom";
import { postActions } from "../../actions/actions";
import { endpoints } from "../../constants/endpoints.constants";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import {
  deletePopup,
  formatAmount,
  formatDate,
  formatDateTime,
  insertObjectIntoDataTable,
  insertObjectIntoDataTableAfterIndex,
} from "../../utils/helpers";
import useFetch from "../../utils/hooks/useFetch";
import EditButton from "../../components/common/EditButton/EditButton";
import CommandeProduitDetails from "../../components/specific/CommandeProduitDetails/CommandeProduitDetails";
import { LOGO_BROWN } from "../../constants/app.constants.js";
import SendCommande from "../../components/specific/SendCommande/SendCommande";

const { Title } = Typography;

function CommandesProduits() {
  const navigate = useNavigate();
  const [segmentedValue, setSegmentedValue] = useState("pending");
  const [operationType, setOperationType] = useState("");
  const {
    data: bonsCommandesList,
    dataCopy: bonsCommandesListCopy,
    setDataCopy: setBonsCommandesListCopy,
    onRefresh,
    isLoading,
  } = useFetch(endpoints.commande_produit.LIST);

  const [selectedRows, setSelectedRows] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const onAdd = () => {
    navigate("/espace-pharmacie/commandes-produits/new-commande-produit", {
      state: {
        currentRecord: null,
      },
    });
  };

  const onEdit = (record) => {
    navigate("/espace-pharmacie/commandes-produits/new-commande-produit", {
      state: {
        currentRecord: record,
      },
    });
  };

  const onViewDetails = (record) => {
    setOperationType("view");
    setOpen(true);
    setCurrentRecord(record);
  };

  const onMultipleDelete = (records) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        postActions(endpoints.commande_produit.DELETE_MULTIPLE, records).then(
          (response) => {
            message.success(response?.data);
            setSelectedRows([]);
            onRefresh();
          }
        );
      }
    });
  };

  const onPrint = (record) => {};

  const onSend = (record) => {
    setOperationType("send");
    setOpen(true);
    setCurrentRecord(record);
  };

  const onCancel = (record) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        // postActions(endpoints.commande_produit.CANCEL, record).then(
        //   (response) => {
        //     message.success(response?.data);
        //     onRefresh();
        //   }
        // );
      }
    });
  };

  const columns = [
    {
      title: "Numéro",
      dataIndex: "num_bc",
      key: "num_bc",
      render: (record) => (
        <div className="table-data">
          <span style={{ textOverflow: "ellipsis" }}> {record} </span>
        </div>
      ),
    },
    {
      title: "Date commande",
      dataIndex: "date_bc",
      key: "date_bc",
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
      title: "Date de livraison souhaitée",
      dataIndex: "date_liv_souhaitee",
      key: "date_liv_souhaitee",
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
      title: "Fournisseur",
      dataIndex: "fourn_raisoc",
      key: "fourn_raisoc",
      render: (record) => (
        <div className="table-data">
          <span style={{ textOverflow: "ellipsis" }}>{record}</span>
        </div>
      ),
      sorter: (a, b) => a.qte.charCodeAt(0) - b.qte.charCodeAt(0),
    },
    {
      title: "Montant",
      dataIndex: "montant_bc",
      key: "montant_bc",
      render: (record) => (
        <div className="table-data" style={{ textAlign: "right" }}>
          {formatAmount(record)}
        </div>
      ),
    },
    {
      title: "Etat",
      dataIndex: "etat",
      key: "etat",
      render: (record) => (
        <div className="table-data">
          {record === "pending" ? (
            <Tag color="cyan"> En attente </Tag>
          ) : record === "send" ? (
            <Tag color="yellow">Envoyée</Tag>
          ) : record === "cancel" ? (
            <Tag color="red">Annulée</Tag>
          ) : (
            <Tag color="green">Receptionnée</Tag>
          )}
        </div>
      ),
    },
    {
      render: (record) => {
        const viewDetailsObj = {
          label: "Voir détails",
          icon: <EyeOutlined />,
          key: "1",
          onClick: () => {
            onViewDetails(record);
          },
        };
        const editObj = {
          label: "Editer",
          key: "2",
          icon: <EditOutlined />,
          onClick: () => {
            onEdit(record);
          },
        };
        const printObj = {
          label: "Imprimer",
          key: "3",
          icon: <PrinterOutlined />,
          onClick: () => {
            onPrint(record);
          },
        };
        const sendObj = {
          label: "Envoyer",
          key: "4",
          icon: <SendOutlined />,
          onClick: () => {
            onSend(record);
          },
        };
        const cancelObj = {
          label: "Annuler",
          key: "5",
          icon: <CloseCircleOutlined />,
          onClick: () => {
            onCancel(record);
          },
        };

        let temp = [];
        switch (record.etat) {
          case "pending":
            temp.push(viewDetailsObj, editObj, printObj, sendObj, cancelObj);
            break;
          case "send":
            temp.push(viewDetailsObj, printObj, cancelObj);
            break;
          case "cancel":
            temp.push(viewDetailsObj, printObj);
            break;
          case "received":
            temp.push(viewDetailsObj, printObj);
            break;
        
          default:
            break;
        }
        return (
          <Flex align="center">
            <Space size="middle">
              <Dropdown
                menu={{
                  items: temp
                  // [
                  //   {
                  //     label: "Voir détails",
                  //     icon: <EyeOutlined />,
                  //     key: "1",
                  //     onClick: () => {
                  //       onViewDetails(record);
                  //     },
                  //   },
                  //   {
                  //     label: "Editer",
                  //     key: "2",
                  //     icon: <EditOutlined />,
                  //     onClick: () => {
                  //       onEdit(record);
                  //     },
                  //   },
                  //   {
                  //     label: "Imprimer",
                  //     key: "3",
                  //     icon: <PrinterOutlined />,
                  //     onClick: () => {
                  //       onPrint(record);
                  //     },
                  //   },
                  //   {
                  //     label: "Envoyer",
                  //     key: "4",
                  //     icon: <SendOutlined />,
                  //     onClick: () => {
                  //       onSend(record);
                  //     },
                  //   },
                  //   {
                  //     label: "Annuler",
                  //     key: "5",
                  //     icon: <CloseCircleOutlined />,
                  //     onClick: () => {
                  //       onCancel(record);
                  //     },
                  //   },
                  // ],
                }}
                trigger={["click"]}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </Flex>
        );
      },
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ color: LOGO_BROWN }}>Liste des bons de commandes produits</Title>
      <Divider />
      <Flex justify="space-between" align="center">
        <Segmented
          defaultValue={segmentedValue}
          options={[
            {
              value: "pending",
              label: "En attente",
            },
            {
              value: "send",
              label: "Envoyées",
            },
            {
              value: "cancel",
              label: "Annulées",
            },
            {
              value: "received",
              label: "Réceptionnées",
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
          <Button type="primary" onClick={onAdd} icon={<PlusOutlined />}>
            Nouveau
          </Button>
        </Space>
      </Flex>

      <br />

      <DataTable
        tableLoading={isLoading}
        dataSource={bonsCommandesList || []}
        dataSourceCopy={
          bonsCommandesListCopy.filter(
            (record) => record.etat === segmentedValue
          ) || []
        }
        setDataSourceCopy={setBonsCommandesListCopy}
        rowSelected
        selectedRowKeys={selectedRows}
        setSelectedRowKeys={setSelectedRows}
        rowKey={(record) => record.num_bc}
        getCheckboxProps={(record) => ({
          disabled: record?.etat === "received",
        })}
        columns={
          segmentedValue !== "pending"
            ? insertObjectIntoDataTableAfterIndex(
                columns,
                {
                  title: "Envoyé le",
                  dataIndex: "date_envoi",
                  key: "date_envoi",
                  render: (record) => (
                    <div className="table-data">
                      <span style={{ textOverflow: "ellipsis" }}>
                        {formatDateTime(record)}
                      </span>
                    </div>
                  ),
                },
                "date_bc"
              )
            : columns
        }
      />

      <Modal
        style={{ top: 20 }}
        styles={{
          header: { padding: "12px 24px" },
          footer: { padding: "12px 24px" },
          content: { margin: 0, padding: 0 },
          body: {
            overflow: "auto",
            //minHeight: "50vh",
            maxHeight: "80vh",
            padding: "12px 24px",
          },
        }}
        width={operationType === "view" ? 1000 : 500}
        title={
          operationType === "send"
            ? "Envoyer commande"
            : operationType === "view"
            ? "Détails commande produit"
            : ""
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setOperationType("");
        }}
        footer={null}
      >
        {operationType === "send" ? (
          <SendCommande
            setOpen={setOpen}
            currentRecord={currentRecord}
            onRefresh={onRefresh}
          />
        ) : operationType === "view" ? (
          <CommandeProduitDetails
            setOpen={setOpen}
            currentRecord={currentRecord}
          />
        ) : null}
      </Modal>
    </Card>
  );
}

export default CommandesProduits;

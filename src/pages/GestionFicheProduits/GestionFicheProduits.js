import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Space, Tooltip, Typography, message } from "antd";
import React, { useState } from "react";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import useSearch from "../../utils/hooks/useSearch";
import { deletePopup } from "../../utils/helpers";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import EditButton from "../../components/common/EditButton/EditButton";
import DeleteButton from "../../components/common/DeleteButton/DeleteButton";
import { deleteActions, postActions } from "../../actions/actions";
import { useNavigate } from "react-router";
import SearchBar from "../../components/common/SearchBar/SearchBar";

const { Title } = Typography;
function GestionFicheProduits() {
  const navigate = useNavigate();
  const {
    data: produitsList,
    dataCopy: produitsListCopy,
    setDataCopy: setProduitListCopy,
    onRefresh: refreshProduitsList,
    isLoading: produitsListLoading,
  } = useFetch(endpoints.fiche_produit.LIST);
  const { getColumnSearchProps } = useSearch();
  const [open, setOpen] = useState(false);
  const [operationType, setOperationType] = useState("");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const onAdd = () => {
    navigate("/espace-pharmacie/gestion-fiche-produits/fiche-produit", {
      state: {
        currentRecord: null,
      },
    });
    // setCurrentRecord(null);
    // setOperationType("add");
    // setOpen(true);
  };

  const onEdit = (record) => {
    // setOperationType("update");
    navigate("/espace-pharmacie/gestion-fiche-produits/fiche-produit", {
      state: {
        currentRecord: record,
      },
    });

    // setOpen(true);
    // setCurrentRecord({...record});
  };

  const onDelete = (record) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(
          `${endpoints.fiche_produit.DELETE}/${record?.code_produit}`
        ).then((response) => {
          if (response?.data === true) {
            message.success("Ligne retirée avec succès");
            refreshProduitsList();
          }
        });
      }
    });
  };

  const onMultipleDelete = (records) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        postActions(endpoints.fiche_produit.DELETE_MULTIPLE, records).then(
          (response) => {
            message.success(response?.data);
            setSelectedRows([]);
            refreshProduitsList();
          }
        );
      }
    });
  };

  return (
    <Card>
      <Title level={3}>Liste des produits</Title>

      <br />

      <Flex justify="space-between" align="center">
        <Space>
          <SearchBar
            data={produitsList}
            setDataCopy={setProduitListCopy}
            listKeys={[
              "code_produit",
              "libelle_produit",
              "code_cip",
              "qte_stock_mini",
              "libelle_forme",
              "libelle_famille",
              "cond_lib",
            ]}
          />
        </Space>
        <Space>
          <ReloadButton onRefresh={refreshProduitsList} />
          <Button
            type="primary"
            danger
            onClick={() => onMultipleDelete(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Supprimer
          </Button>
          <Button type="primary" onClick={onAdd}>
            Ajouter produit
          </Button>
        </Space>
      </Flex>

      <br />

      <DataTable
        dataSource={produitsList}
        dataSourceCopy={produitsListCopy}
        setDataSourceCopy={setProduitListCopy}
        tableLoading={produitsListLoading}
        rowSelected
        selectedRowKeys={selectedRows}
        setSelectedRowKeys={setSelectedRows}
        rowKey={(record) => record.code_produit}
        columns={[
          {
            title: "N°",
            dataIndex: "code_produit",
            key: "code_produit",
            ...getColumnSearchProps("code_produit"),
          },
          {
            title: "Code cip",
            dataIndex: "code_cip",
            key: "code_cip",
            ...getColumnSearchProps("code_cip"),
          },
          {
            title: "Libellé",
            dataIndex: "libelle_produit",
            key: "libelle_produit",
            sorter: (a, b) =>
              a.libelle_produit.charCodeAt(0) - b.libelle_produit.charCodeAt(0),
            ...getColumnSearchProps("libelle_produit"),
          },

          // {
          //   title: "Quantité en stock",
          //   dataIndex: "qte_stock_mini",
          //   key: "qte_stock_mini",
          //   ...getColumnSearchProps("qte_stock_mini"),
          // },
          {
            title: "Famille",
            dataIndex: "libelle_famille",
            key: "libelle_famille",
          },
          {
            title: "Forme",
            dataIndex: "libelle_forme",
            key: "libelle_forme",
          },
          {
            title: "Conditionnement",
            dataIndex: "cond_lib",
            key: "cond_lib",
          },
          
          // {
          //     title: 'Sexe',
          //     dataIndex: 'sexe_patient',
          //     key: 'sexe_patient'
          // },
          // {
          //     title: 'Type',
          //     dataIndex: 'type_patient',
          //     key: 'type_patient'
          // },
          // {
          //     title: 'Date péremption',
          //     dataIndex: 'date_per',
          //     key: 'date_per',
          //     render: (record) => <div className='table-data'>
          //         <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
          //     </div>
          // },
          // {
          //     title: 'Date de création',
          //     dataIndex: 'date_creation',
          //     key: 'date_creation',
          //     render: (record) => <div className='table-data'>
          //         <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
          //     </div>
          // },
          // {
          {
            width: "auto",
            render: (record) => (
              <Flex justify="center" align="center">
                <Space>
                  <EditButton
                    onEdit={() => {
                      onEdit(record);
                    }}
                  />
                  {/* <DeleteButton
                    onDelete={() => {
                      onDelete(record);
                    }}
                  /> */}
                </Space>
              </Flex>
            ),
          },
        ]}
      />
    </Card>
  );
}

export default GestionFicheProduits;

import React, { useState } from "react";
import { formatAmount, formatDate, sortColumn } from "../../../utils/helpers";
import DataTable from "../../../components/common/DataTable/DataTable";
import { Descriptions, Tag } from "antd";

function DetailsEntree({
  currentRecord,
  setCurrentRecord,
  setOpen,
  onRefresh,
}) {
  const [listProd, setListProd] = useState(currentRecord?.listProd || []);

  return (
    <div>
      <Descriptions
        layout="vertical"
        items={[
          {
            key: "1",
            label: "Date de bon de réception",
            span: 1,
            children: formatDate(new Date(currentRecord?.date_br)),
          },
          {
            key: "2",
            span: 1,
            label: "Date de livraison",
            children: formatDate(new Date(currentRecord?.date_liv)),
          },
          {
            key: "3",
            span: 1,
            label: "Numéro bon de commande",
            children: currentRecord?.num_bc,
          },
          {
            key: "4",
            label: "Numéro de bon de livraison",
            span: 1,
            children: currentRecord?.num_bl,
          },

          {
            key: "5",
            label: "Numéro de bon de réception",
            span: 1,
            children: currentRecord?.num_br,
          },
          {
            key: "6",
            label: "Code fournisseur",
            span: 1,
            children: currentRecord?.code_fourn,
          },
          {
            key: "7",
            label: "Fournisseur",
            span: 1,
            children: currentRecord?.fourn_raisoc,
          },
          {
            key: "8",
            label: "Montant de bon de réception",
            span: 1,
            children: (
              <p
                style={{
                  color: "var(--app-color)",
                  fontWeight: "500",
                  fontSize: 18,
                }}
              >
                {formatAmount(currentRecord?.montant_br)}
              </p>
            ),
          },
          {
            key: "9",
            label: "Etat de la commande",
            span: 1,
            children: (
              <div>
                {currentRecord?.etat === "recu" ? (
                  <Tag color="cyan"> Receptionnée </Tag>
                ) : currentRecord?.etat === "valid" ? (
                  <Tag color="green">Validée</Tag>
                ) : (
                  <Tag color="orange">En attente</Tag>
                )}
              </div>
            ),
          },
          {
            key: "10",
            label: "Liste des produits",
            span: 3,

            contentStyle: {
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            children: (
              <div style={{ width: "100%" }}>
                <DataTable
                  dataSource={[]}
                  dataSourceCopy={listProd || []}
                  setDataSourceCopy={setListProd}
                  rowKey={(record) => record?.num_bc + record?.num_br + record?.code_prod} 
                  columns={[
                    {
                      title: "Numéro",
                      dataIndex: "num_br",
                      key: "num_br",
                    },
                    {
                      title: "Référence",
                      dataIndex: "code_prod",
                      key: "code_prod",
                    },
                    {
                      title: "Désignation",
                      dataIndex: "libelle_produit",
                    },
                    {
                      title: "Quantité commandée",
                      dataIndex: "qte_com",
                      key: "qte_com",
                      sorter: (a, b) => sortColumn(a.qte_com, b.qte_com),
                    },
                    {
                      title: "Quantité livrée",
                      dataIndex: "qte_liv",
                      key: "qte_liv",
                      sorter: (a, b) => sortColumn(a.qte_liv, b.qte_liv),
                    },
                    {
                      title: "P.U (HT)",
                      dataIndex: "prix_unit",
                      key: "prix_unit",
                      sorter: (a, b) => sortColumn(a.prix_unit, b.prix_unit),
                      render: (record) => (
                        <div style={{ textAlign: "right" }}>
                          {formatAmount(record)}
                        </div>
                      ),
                    },
                    {
                      title: "Montant (HT)",
                      render: (record) => (
                        <div style={{ textAlign: "right" }}>
                          {formatAmount(record.prix_unit * record.qte_liv)}
                        </div>
                      ),
                    },
                    {
                      title: "Montant TVA",
                      render: (record) => (
                        <div style={{ textAlign: "right" }}>
                          {formatAmount(
                            record.prix_unit *
                              record.qte_liv *
                              (record.tva / 100)
                          )}
                        </div>
                      ),
                    },
                    {
                      title: "Montant (TTC)",
                      render: (record) => (
                        <div style={{ textAlign: "right" }}>
                          {formatAmount(
                            record.prix_unit *
                              record.qte_liv *
                              (1 + record.tva / 100)
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default DetailsEntree;

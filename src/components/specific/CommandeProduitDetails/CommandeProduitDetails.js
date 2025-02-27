import React, { useEffect, useState } from "react";
import { getActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { formatAmount, formatDate, sortColumn } from "../../../utils/helpers";
import DataTable from "../../common/DataTable/DataTable";
import useFetch from "../../../utils/hooks/useFetch";
import { Descriptions } from "antd";

function CommandeProduitDetails({ currentRecord }) {
  const [listProduitsCommandes, setListProduitsCommandes] = useState(
    currentRecord?.listCom || []
  );

  return (
    <div>
      <Descriptions
        layout="vertical"
        items={[
          {
            key: "1",
            label: "Date de commande",
            span: 1,
            children: formatDate(new Date(currentRecord?.date_bc)),
          },
          {
            key: "2",
            span: 1,
            label: "Date de livraison souhaitée",
            children: formatDate(new Date(currentRecord?.date_liv_souhaitee)),
          },
          {
            key: "3",
            span: 1,
            label: "Numéro bon de commande",
            children: currentRecord?.num_bc,
          },
          {
            key: "4",
            label: "Numéro offre",
            span: 1,
            children: currentRecord?.num_offre,
          },
          {
            key: "5",
            label: "Fournisseur",
            span: 1,
            children: currentRecord?.fourn_raisoc,
          },
          {
            key: "6",
            label: "Montant total",
            span: 1,
            children: (
              <p
                style={{
                  color: "var(--app-color)",
                  fontWeight: "500",
                  fontSize: 18,
                }}
              >
                {formatAmount(currentRecord?.montant_bc)}
              </p>
            ),
          },
          {
            key: "7",
            label: "Détails",
            span: 3,

            contentStyle: {
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            children: (
              <div style={{width:"100%"}} >
                <DataTable
                  dataSource={[]}
                  dataSourceCopy={listProduitsCommandes || []}
                  setDataSourceCopy={setListProduitsCommandes}
                  rowKey={(record) => record.code_prod}
                  columns={[
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
                      title: "Quantité",
                      dataIndex: "qte_com",
                      key: "qte_com",
                      sorter: (a, b) => sortColumn(a.qte_com, b.qte_com),
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
                          {formatAmount(record.prix_unit * record.qte_com)}
                        </div>
                      ),
                    },
                    {
                      title: "Montant TVA",
                      render: (record) => (
                        <div style={{ textAlign: "right" }}>
                          {formatAmount(
                            record.prix_unit *
                              record.qte_com *
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
                              record.qte_com *
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

export default CommandeProduitDetails;

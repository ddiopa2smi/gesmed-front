import { Button, Flex, message, Space, Tooltip, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useState } from "react";
import DataTable from "../../common/DataTable/DataTable";
import { EditOutlined } from "@ant-design/icons";
import { ServiceType } from "../../../utils/types/types.ts";
import { postActions, putActions } from "../../../actions/actions.js";
import { endpoints } from "../../../constants/endpoints.constants.js";

const { Title, Text } = Typography;
function DetailsPrescription({
  prescriptionItem,
  serviceType,
  setOpen,
  onRefresh,
}) {
  const [loading, setLoading] = useState(false);
  const getAppropriateColumns = (service) => {
    let res = [];
    switch (service) {
      case ServiceType.PHARMACIE:
        res = [
          {
            title: "Médicament",
            dataIndex: "libacte",
            key: "libacte",
          },
          {
            title: "Quantité",
            dataIndex: "qte",
            key: "qte",
            render: (record) => {
              return (
                <Flex justify="center" align="center">
                  <Text> {record} </Text>
                </Flex>
              );
            },
          },
          {
            title: "Posologie",
            dataIndex: "posologie",
            key: "posologie",
          },
          {
            title: "Observation",
            dataIndex: "observation",
            key: "observation",
          },
        ];
        break;
      case ServiceType.ANALYSE:
        res = [
          {
            title: "Analyse",
            dataIndex: "libacte",
            key: "libacte",
          },
          // {
          //   title: "Quantité",
          //   dataIndex: "qte",
          //   key: "qte",
          //   render : (record)=>{
          //     return <Flex  justify="center" align="center" >
          //       <Text> {record} </Text>
          //     </Flex>
          //   }
          // },
          // {
          //   title: "Motif",
          //   dataIndex: "observation",
          //   key: "observation",
          // }
        ];
        break;
      case ServiceType.RADIOLOGIE:
        res = [
          {
            title: "Imagerie",
            dataIndex: "libacte",
            key: "libacte",
          },
          {
            title: "Quantité",
            dataIndex: "qte",
            key: "qte",
            render: (record) => {
              return (
                <Flex justify="center" align="center">
                  <Text> {record} </Text>
                </Flex>
              );
            },
          },
          {
            title: "Motif",
            dataIndex: "motifImagerie",
            key: "motifImagerie",
          },
        ];
        break;
      case ServiceType.INFIRMERIE:
        res = [
          {
            title: "Acte",
            dataIndex: "libacte",
            key: "libacte",
          },
          {
            title: "Quantité",
            dataIndex: "qte",
            key: "qte",
            render: (record) => {
              return (
                <Flex justify="center" align="center">
                  <Text> {record} </Text>
                </Flex>
              );
            },
          },
          {
            title: "Motif",
            dataIndex: "motifImagerie",
            key: "motifImagerie",
          },
        ];
        break;
      default:
        res = [];
        break;
    }
    return res;
  };

  const valid = () => {
    setLoading(true);
    putActions(endpoints.prescriptions.UPDATE, prescriptionItem)
      .then((res) => {
        message.success("Prescription validée avec succès");
        setOpen(false);
        if (onRefresh) {
          onRefresh();
        }
      })
      .finally(() => setLoading(false));
  };
  return (
    <div>
      <Flex justify="space-between">
        <span style={{ fontSize: 18 }}>
          Patient : <Text strong>{prescriptionItem.patient}</Text>{" "}
        </span>
        <span>
          Prescripteur : <Text strong>{prescriptionItem.username}</Text>{" "}
        </span>
      </Flex>

      <div style={{ marginTop: "1em" }}>
        <Title level={5}>Liste des actes</Title>
        <DataTable
          dataSourceCopy={prescriptionItem.listActes || []}
          rowKey={(record) => record.codeacte}
          columns={getAppropriateColumns(serviceType)}
        />
      </div>
      <br />
      <Flex justify="center">
        <Space size="large">
          <Button
            type="primary"
            onClick={() => {
              setOpen(false);
            }}
            danger
          >
            Annuler
          </Button>
          <Button type="primary" loading={loading} onClick={valid}>
            Valider
          </Button>
        </Space>
      </Flex>
    </div>
  );
}

export default DetailsPrescription;

import {
  Button,
  Flex,
  message,
  Space,
  Typography,
  Popconfirm,
  Form,
  Table,
} from "antd";
import React, { useState } from "react";
import { ServiceType } from "../../../utils/types/types.ts";
import { putActions } from "../../../actions/actions.js";
import { endpoints } from "../../../constants/endpoints.constants.js";
import EditableCell from "../../common/EditableCell/EditableCell.js";

const { Title, Text } = Typography;
function DetailsPrescription({
  prescriptionItem,
  setPrescriptionItem,
  serviceType,
  setOpen,
  onRefresh,
}) {
  const [loading, setLoading] = useState(false);
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.codeacte === editingKey;

  const edit = (record) => {
    form.setFieldsValue(
      {
        libacte: "",
        resultat: "",
        observation: "",
        ...record,
      }
      //record
    );
    setEditingKey(record.codeacte);
  };
  const cancel = () => {
    setEditingKey("");
  };

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
        res =
          prescriptionItem?.isdone === "Non"
            ? [
                {
                  title: "Analyse",
                  dataIndex: "libacte",
                  key: "libacte",
                },
                {
                  title: "Résultat",
                  dataIndex: "resultat",
                  key: "resultat",
                  editable: true,
                },
                {
                  title: "Observation",
                  dataIndex: "observation",
                  key: "observation",
                  editable: true,
                },
                {
                  title: "",
                  render: (_, record) => {
                    const editable = isEditing(record);
                    return editable ? (
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          ghost
                          onClick={cancel}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => save(record.codeacte)}
                        >
                          Enregistrer
                        </Button>
                      </Space>
                    ) : (
                      <Button
                        type="primary"
                        size="small"
                        disabled={editingKey !== ""}
                        onClick={() => edit(record)}
                      >
                        Editer
                      </Button>
                    );
                  },
                },
              ]
            : [
                {
                  title: "Analyse",
                  dataIndex: "libacte",
                  key: "libacte",
                },
                {
                  title: "Résultat",
                  dataIndex: "resultat",
                  key: "resultat",
                  editable: true,
                },
                {
                  title: "Observation",
                  dataIndex: "observation",
                  key: "observation",
                  editable: true,
                },
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

  const save = (key) => {
    form
      .validateFields()
      .then((values) => {
        const newData = [...prescriptionItem.listActes];
        const index = newData.findIndex((item) => key === item.codeacte);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...values,
          });
          setPrescriptionItem({ ...prescriptionItem, listActes: newData });
          setEditingKey("");
        } else {
          newData.push(values);
          setPrescriptionItem({ ...prescriptionItem, listActes: newData });
          setEditingKey("");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const mergedColumns = getAppropriateColumns(serviceType)?.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      {prescriptionItem?.isdone !== "Non" ? (
        <div>
          <Flex justify="space-between">
            <span style={{ fontSize: 18 }}>
              Patient : <Text strong>{prescriptionItem?.patient}</Text>{" "}
            </span>
            <span style={{ fontSize: 18 }}>
              Prescripteur : <Text strong>{prescriptionItem?.username}</Text>
            </span>
            <span style={{ fontSize: 18 }}>
              Effectué par : <Text strong>{userConnected?.username}</Text>
            </span>
          </Flex>
          <br />
          <Table
            size="small"
            dataSource={prescriptionItem.listActes || []}
            rowKey={(record) => record.codeacte}
            columns={getAppropriateColumns(serviceType)}
            expandable={{
              expandedRowRender: (record) => (
                <div>
                  <p>
                    <b>Numéro</b> :{record.codeacte}
                  </p>
                  <p>
                    <b>Acte</b> :{record.libacte}
                  </p>
                  <p>
                    <b>Résultat</b> :{record.resultat}
                  </p>
                  <p>
                    <b>Observation</b> :{record.resultat}
                  </p>
                </div>
              ),
              rowExpandable: (record) => record.name !== "Not Expandable",
            }}
          />
        </div>
      ) : (
        <div>
          <Flex justify="space-between">
            <span style={{ fontSize: 18 }}>
              Patient : <Text strong>{prescriptionItem.patient}</Text>{" "}
            </span>
            <span style={{ fontSize: 18 }}>
              Prescripteur : <Text strong>{prescriptionItem.username}</Text>
            </span>
            <span style={{ fontSize: 18 }}>
              Effectué par : <Text strong>{userConnected.username}</Text>
            </span>
          </Flex>

          <div style={{ marginTop: "1em" }}>
            <Title level={5}> {serviceType === ServiceType.PHARMACIE ? "Liste des médicaments" : "Liste des actes"} </Title>
            <Form form={form} preserve={false}>
              <Table
                size="small"
                dataSource={prescriptionItem.listActes || []}
                rowKey={(record) => record.codeacte}
                columns={mergedColumns}
                rowClassName={"editable-row"}
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
              />
            </Form>
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
      )}
    </div>
  );
}

export default DetailsPrescription;

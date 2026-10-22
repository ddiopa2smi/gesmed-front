import {
  Avatar,
  Button,
  Flex,
  Tag,
  message,
  Space,
  Typography,
  Table,
  Switch,
  InputNumber,
  Checkbox,
  theme,
} from "antd";
import React, { useState } from "react";
import { ServiceType } from "../../../utils/types/types.ts";
import { putActions } from "../../../actions/actions.js";
import { endpoints } from "../../../constants/endpoints.constants.js";
import { formatDateTime, formatMontant, validPopup } from "../../../utils/helpers.js";
import { CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, CloseOutlined, InfoCircleOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import "../../common/DataTable/DataTable.scss";

const { Title, Text } = Typography;


function DetailsPrescription({
  prescriptionItem,
  setPrescriptionItem,
  serviceType,
  setOpen,
  onRefresh,
}) {
  const { token: { colorPrimary, colorPrimaryBg, colorFillAlter, colorBorderSecondary } } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));

  // Colonnes "Disponibilité" / "RI" réutilisées telles quelles (hors Pharmacie) pour Analyse et Radiologie
  const getDispoExclusColumns = () => [
    {
      title: "Disponibilité",
      dataIndex: "dispo",
      key: "dispo",
      align: "center",
      render: (value, record) => {
        const isDisabled = prescriptionItem?.isdone !== "Non";
        return (
          <Flex justify="center" align="center">
            <Switch
              checked={value === "Oui"}
              checkedChildren="Oui"
              unCheckedChildren="Non"
              disabled={isDisabled}
              style={value !== "Oui" ? { backgroundColor: "#ff4d4f" } : undefined}
              onChange={(checked) => {
                const newValue = checked ? "Oui" : "Non";
                const newData = [...prescriptionItem.listActes];
                const index = newData.findIndex((item) => record.codeacte === item.codeacte);
                if (index > -1) {
                  newData[index] = {
                    ...newData[index],
                    dispo: newValue,
                  };
                  if (setPrescriptionItem) {
                    setPrescriptionItem({ ...prescriptionItem, listActes: newData });
                  }
                }
              }}
            />
          </Flex>
        );
      },
    },
    {
      title: "RI",
      dataIndex: "exclus",
      key: "exclus",
      align: "center",
      render: (value, record) => {
        const isDisabled = prescriptionItem?.isdone !== "Non";
        return (
          <Flex justify="center" align="center">
            <Checkbox
              checked={!!value}
              disabled={isDisabled}
              onChange={(e) => {
                const newValue = e.target.checked;
                const newData = [...prescriptionItem.listActes];
                const index = newData.findIndex((item) => record.codeacte === item.codeacte);
                if (index > -1) {
                  newData[index] = {
                    ...newData[index],
                    exclus: newValue,
                  };
                  if (setPrescriptionItem) {
                    setPrescriptionItem({ ...prescriptionItem, listActes: newData });
                  }
                }
              }}
            />
          </Flex>
        );
      },
    },
  ];

  // Montant d'une ligne de médicament : quantité servie x tarif unitaire
  // (un médicament indisponible n'est pas servi, son montant est donc nul)
  const getMontant = (record) =>
    record?.dispo === "Non" ? 0 : (Number(record?.tarif) || 0) * (Number(record?.qte_servie) || 0);

  const formatMontantFCFA = (montant) => `${formatMontant(montant)} FCFA`;

  const renderSummary = (data) => {
    if (serviceType !== ServiceType.PHARMACIE) return null;
    const columns = getAppropriateColumns(serviceType);
    const montantIndex = columns.findIndex((column) => column.key === "montant");
    const total = (data || []).reduce((acc, record) => acc + getMontant(record), 0);
    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={montantIndex} align="right">
          <Text strong>Total</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={montantIndex} align="right">
          <Text strong>{formatMontantFCFA(total)}</Text>
        </Table.Summary.Cell>
        {montantIndex < columns.length - 1 && (
          <Table.Summary.Cell index={montantIndex + 1} colSpan={columns.length - montantIndex - 1} />
        )}
      </Table.Summary.Row>
    );
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
            title: "Disponibilité",
            dataIndex: "dispo",
            key: "dispo",
            align: "center",
            render: (value, record) => {
              const isDisabled = prescriptionItem?.isdone !== "Non";
              return (
                <Flex justify="center" align="center">
                  <Switch
                    checked={value === "Oui"}
                    checkedChildren="Oui"
                    unCheckedChildren="Non"
                    disabled={isDisabled}
                    style={value !== "Oui" ? { backgroundColor: "#ff4d4f" } : undefined}
                    onChange={(checked) => {
                      const newValue = checked ? "Oui" : "Non";
                      const newData = [...prescriptionItem.listActes];
                      const index = newData.findIndex((item) => record.codeacte === item.codeacte);
                      if (index > -1) {
                        newData[index] = {
                          ...newData[index],
                          dispo: newValue,
                          qte_servie: checked ? newData[index].qte : 0,
                        };
                        if (setPrescriptionItem) {
                          setPrescriptionItem({ ...prescriptionItem, listActes: newData });
                        }
                      }
                    }}
                  />
                </Flex>
              );
            },
          },
          {
            title: "Qté prescrite",
            dataIndex: "qte",
            key: "qte",
            align: "center",
            render: (record) => {
              return (
                <Flex justify="center" align="center">
                  <Text> {record} </Text>
                </Flex>
              );
            },
          },
          {
            title: "Qté servie",
            dataIndex: "qte_servie",
            key: "qte_servie",
            align: "center",
            render: (value, record) => {
              const isNotEditableAnymore = prescriptionItem?.isdone !== "Non";
              const isUnavailable = record?.dispo === "Non";
              if (isNotEditableAnymore || isUnavailable) {
                return (
                  <Flex justify="center" align="center">
                    <Text style={{ color: colorPrimary }}>
                      {isUnavailable ? 0 : value}
                    </Text>
                  </Flex>
                );
              }
              return (
                <Flex justify="center" align="center">
                  <InputNumber
                    className="input-number-center"
                    min={1}
                    max={record?.qte}
                    value={value}
                    onChange={(newValue) => {
                      const clampedValue =
                        newValue === null || newValue <= 0
                          ? 1
                          : Math.min(newValue, record?.qte ?? newValue);
                      const newData = [...prescriptionItem.listActes];
                      const index = newData.findIndex((item) => record.codeacte === item.codeacte);
                      if (index > -1) {
                        newData[index] = {
                          ...newData[index],
                          qte_servie: clampedValue,
                        };
                        if (setPrescriptionItem) {
                          setPrescriptionItem({ ...prescriptionItem, listActes: newData });
                        }
                      }
                    }}
                  />
                </Flex>
              );
            },
          },
          {
            title: "Unité",
            dataIndex: "cond",
            key: "cond",
          },
          {
            title: "Tarif",
            dataIndex: "tarif",
            key: "tarif",
            align: "right",
            render: (value) => formatMontantFCFA(Number(value) || 0),
          },
          {
            title: "Montant",
            key: "montant",
            align: "right",
            render: (record) => formatMontantFCFA(getMontant(record)),
          },
          // {
          //   title: "Posologie",
          //   dataIndex: "posologie",
          //   key: "posologie",
          // },
          {
            title: "RI",
            dataIndex: "exclus",
            key: "exclus",
            align: "center",
            render: (value, record) => {
              const isDisabled = prescriptionItem?.isdone !== "Non";
              return (
                <Flex justify="center" align="center">
                  <Checkbox
                    checked={!!value}
                    disabled={isDisabled}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      const newData = [...prescriptionItem.listActes];
                      const index = newData.findIndex((item) => record.codeacte === item.codeacte);
                      if (index > -1) {
                        newData[index] = {
                          ...newData[index],
                          exclus: newValue,
                        };
                        if (setPrescriptionItem) {
                          setPrescriptionItem({ ...prescriptionItem, listActes: newData });
                        }
                      }
                    }}
                  />
                </Flex>
              );
            },
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
          ...getDispoExclusColumns(),
        ];
        break;
      case ServiceType.RADIOLOGIE:
        res = [
          {
            title: "Imagerie",
            dataIndex: "libacte",
            key: "libacte",
          },
          ...getDispoExclusColumns(),
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
    validPopup().then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        //console.log(prescriptionItem);
        putActions(endpoints.prescriptions.UPDATE, prescriptionItem)
          .then((res) => {
            message.success("Prescription validée avec succès");
            setOpen(false);
            if (onRefresh) {
              onRefresh();
            }
          })
          .finally(() => setLoading(false));
      }
    });
  };

  const isDone = prescriptionItem?.isdone !== "Non";
  const isPharmacie = serviceType === ServiceType.PHARMACIE;
  const actes = prescriptionItem?.listActes || [];

  // Bloc "libellé / valeur" du bandeau d'informations
  const InfoBlock = ({ icon, label, value }) => (
    <Flex align="center" gap={10} style={{ minWidth: 180 }}>
      <Avatar size={36} icon={icon} style={{ backgroundColor: colorPrimaryBg, color: colorPrimary, flexShrink: 0 }} />
      <div style={{ lineHeight: 1.3 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
        <div><Text strong style={{ fontSize: 15 }}>{value || "—"}</Text></div>
      </div>
    </Flex>
  );

  return (
    <div>
      {/* Bandeau d'informations */}
      <Flex
        justify="space-between"
        align="center"
        wrap
        gap={16}
        style={{ padding: "12px 16px", borderRadius: 10, background: colorFillAlter, marginBottom: 16 }}
      >
        <InfoBlock icon={<UserOutlined />} label="Patient" value={prescriptionItem?.patient} />
        <InfoBlock icon={<SolutionOutlined />} label="Prescripteur" value={prescriptionItem?.prescripteur} />
        <InfoBlock
          icon={<CheckCircleOutlined />}
          label={isDone ? "Effectué par" : "Traité par"}
          value={isDone ? (prescriptionItem?.effectue_par || userConnected?.username) : userConnected?.username}
        />
        <Space direction="vertical" size={4} align="end">
          {isDone
            ? <Tag color="success" icon={<CheckCircleOutlined />}>{isPharmacie ? "Servie" : "Clôturée"}</Tag>
            : <Tag color="warning" icon={<ClockCircleOutlined />}>En attente</Tag>}
          {prescriptionItem?.datepresc && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Prescrite le {formatDateTime(prescriptionItem.datepresc)}
            </Text>
          )}
        </Space>
      </Flex>

      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>
          {isPharmacie ? "Médicaments" : "Actes"} <Tag style={{ marginLeft: 4 }}>{actes.length}</Tag>
        </Title>
        {!isDone && isPharmacie && (
          <Text style={{ fontSize: 14, fontWeight: 500, color: colorPrimary }}>
            <InfoCircleOutlined /> Ajuster la disponibilité et la quantité servie, puis valider.
          </Text>
        )}
      </Flex>

      <Table
        size="small"
        dataSource={actes}
        rowKey={(record) => record.codeacte}
        columns={getAppropriateColumns(serviceType)}
        className="compact-table"
        pagination={false}
        summary={renderSummary}
        scroll={{ x: "max-content" }}
      />

      {/* Barre d'actions */}
      <Flex justify="flex-end" gap={8} style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}>
        {isDone ? (
          <Button type="primary" onClick={() => setOpen(false)}>Fermer</Button>
        ) : (
          <>
            <Button type="primary" icon={<CheckOutlined />} loading={loading} onClick={valid}>
              {isPharmacie ? "Valider le service" : "Valider"}
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </>
        )}
      </Flex>
    </div>
  );
}

export default DetailsPrescription;

import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import {
  CloseOutlined,
  DownOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { getActions, postActions } from "../../actions/actions";
import { endpoints } from "../../constants/endpoints.constants";
import { LOGO_BROWN } from "../../constants/app.constants";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import Posologie from "../../components/specific/Posologie/Posologie";
import { deletePopup, printPDF, formatMontant } from "../../utils/helpers";
import BackButton from "../../components/common/BackButton/BackButton";
import DeleteButton from "../../components/common/DeleteButton/DeleteButton";
import Swal from "sweetalert2";
import { getMontantLigne, getPrixUnitaire } from "../../utils/tarifProduit";

const { Title, Text } = Typography;

// Anciennes prescriptions : code de conditionnement ; nouvelles : unité de distribution du médicament
const conditionnements = [
  { value: "boite", libelle: "Boîte(s)" },
  { value: "plaquette", libelle: "Plaquette(s)" },
  { value: "comprime", libelle: "Comprimé(s)" },
  { value: "unite", libelle: "Unité(s)" },
];

const Ordonnance = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { token: { colorPrimary, colorFillAlter, colorBgContainer, colorBorderSecondary } } = theme.useToken();
  const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const prescription = JSON.parse(sessionStorage.getItem("prescription"));
  const editPrescription = JSON.parse(
    sessionStorage.getItem("editPrescription"),
  );
  const [formLoading, setFormLoading] = useState(false);
  const [operationType] = useState("add");
  const [medicamentSelected, setMedicamentSelected] = useState(null);
  const [medicamentsPrescrites, setMedicamentsPrescrites] = useState(
    editPrescription?.listActes || [],
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [posologieButtonStatus, setPosologieButtonStatus] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [conditionnement, setConditionnement] = useState(null);
  const [isPrintDisabled, setIsPrintDisabled] = useState(true);
  const [numCons, setNumCons] = useState(null);
  const [qteStock, setQteStock] = useState(0);

  const medicamentsFetched = useFetch(endpoints.fiche_produit.LIST);
  const listMedicaments = medicamentsFetched.data;
  const selectMedicamentsListLoading = medicamentsFetched.isLoading;

  const getProduit = (codeacte) => listMedicaments.find((item) => item.code_produit === codeacte);

  // Montant d'une ligne arrondi au franc supérieur (règle commune, cf. utils/tarifProduit)
  const getTarifLigne = (acte) => getMontantLigne(getProduit(acte.codeacte), acte.qte);

  const totalTarif = medicamentsPrescrites.reduce(
    (acc, acte) => acc + getTarifLigne(acte),
    0,
  );

  const save = () => {
    form
      .validateFields(["datepresc"])
      .then(() => {
        const values = form.getFieldsValue();
        switch (operationType) {
          case "add":
            const listActes = medicamentsPrescrites.map((acte) => ({
              ...acte,
              tarif: getPrixUnitaire(getProduit(acte.codeacte)),
            }));
            const payload = {
              datepresc:
                editPrescription?.datepresc ||
                new Date(values.datepresc).toISOString(),
              num_patient:
                editPrescription?.num_patient || currentPatient.num_patient,
              code_prescripteur: userConnected?.code_ipm,
              qte_presc: values.qte_presc,
              cond: values.cond,
              codepresc: editPrescription?.codepresc || "06",
              listActes: listActes,
              numcons: editPrescription?.numcons || prescription?.numcons,
              numpresc: editPrescription?.numpresc || null,
            };

            if (medicamentsPrescrites.length !== 0) {
              setFormLoading(true);
              postActions(endpoints.prescriptions.ADD, payload)
                .then((response) => {
                  if (response?.data?.Saved) {
                    message.success("Nouvelle ordonnance ajoutée avec succès");
                    setIsPrintDisabled(false);
                    setNumCons(response?.data?.Saved);
                  }
                })
                .finally(() => {
                  setFormLoading(false);
                  form.resetFields();
                });
            } else {
              message.warning(
                "Veuillez svp renseigner la posologie de ce médicament, cliquer le boutton posologie ci-dessous pour l'ajouter",
              );
            }
            break;
          default:
            break;
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  useEffect(() => {
    if (editPrescription === null) {
      setIsPrintDisabled(true);
    } else if (editPrescription?.listActes?.length !== 0) {
      setIsPrintDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getQteStock = async (id) => {
    const response = await getActions(
      `${endpoints.saisie_inventaire.STOCK}/${id}`,
    );
    return response;
  };

  useEffect(() => {
    form.setFieldValue("qte_pres", qteStock);
  }, [qteStock, form]);

  const openPosologie = () => {
    if (
      form.getFieldValue("qte_presc") > form.getFieldValue("qte_pres") ||
      form.getFieldValue("qte_pres") === 0
    ) {
      Swal.fire({
        title: "Avertissement!",
        text: "Quantité en stock insuffisante",
        icon: "warning",
        iconColor: "var(--app-color)",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        cancelButtonText: "Annuler",
        confirmButtonColor: "var(--app-color)",
        confirmButtonText: "Poursuivre",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsModalVisible(true);
        }
      });
    } else {
      setIsModalVisible(true);
    }
  };

  const stockColor = !medicamentSelected ? "default" : qteStock <= 0 ? "error" : qteStock < quantity ? "warning" : "success";
  const initials = `${currentPatient?.prenom_patient?.[0] || ""}${currentPatient?.nom_patient?.[0] || ""}`.toUpperCase();

  const columns = [
    {
      title: "Médicament",
      dataIndex: "libacte",
      key: "libacte",
      render: (value) => <Text strong style={{ whiteSpace: "normal" }}>{value}</Text>,
    },
    {
      title: "Quantité",
      key: "qte",
      align: "center",
      render: (record) => (
        <Text strong>
          {record.qte}{" "}
          <Text type="secondary" style={{ fontWeight: 400 }}>
            {conditionnements.find((item) => item.value === record.cond)?.libelle ?? record.cond}
          </Text>
        </Text>
      ),
    },
    {
      title: "Posologie",
      dataIndex: "posologie",
      key: "posologie",
      render: (value) => value || <Text type="secondary">-</Text>,
    },
    {
      title: "Tarif Produit",
      key: "prix_vente",
      align: "right",
      render: (record) => formatMontant(getProduit(record.codeacte)?.prix_vente),
    },
    {
      title: "Montant",
      key: "tarif",
      align: "right",
      render: (record) => <Text strong>{formatMontant(getTarifLigne(record))}</Text>,
    },
    {
      width: 60,
      align: "center",
      render: (record) => (
        <Tooltip title="Retirer">
          <DeleteButton
            onDelete={() => {
              deletePopup().then((response) => {
                if (response?.isConfirmed) {
                  setMedicamentsPrescrites(
                    medicamentsPrescrites.filter((element) => element.codeacte !== record.codeacte),
                  );
                }
              });
            }}
          />
        </Tooltip>
      ),
    },
  ];
  // Position de la colonne Montant, pour placer le total juste en dessous
  const montantIndex = columns.findIndex((column) => column.key === "tarif");

  return (
    <>
    <Form
      form={form}
      layout="vertical"
      onFinish={save}
      onValuesChange={(changedValues, values) => {
        // L'unité de distribution est celle de la fiche du médicament sélectionné
        const uniteDistribution = (listMedicaments || []).find(
          (element) => element.code_produit === values.medicament,
        )?.unite_distribution;
        if ("medicament" in changedValues) {
          form.setFieldValue("cond", uniteDistribution);
          setConditionnement(uniteDistribution ?? null);
        }

        const requiredFieldsFilled =
          !!values.datepresc &&
          !!values.medicament &&
          !!uniteDistribution &&
          values.qte_presc !== undefined &&
          values.qte_presc !== null &&
          values.qte_presc > 0;
        setPosologieButtonStatus(!requiredFieldsFilled);

        if (changedValues.medicament) {
          const medicamentCode = changedValues.medicament;
          listMedicaments.forEach((element) => {
            if (element.code_produit === medicamentCode) {
              setMedicamentSelected(element);
              getQteStock(medicamentCode).then((response) => {
                setQteStock(response?.data);
              });
            }
          });
        } else if ("medicament" in changedValues) {
          setMedicamentSelected(null);
          setQteStock(0);
        }

        if (changedValues.qte_presc) {
          setQuantity(changedValues.qte_presc);
        }
      }}
    >
      {/* En-tête : patient + date + impression */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Flex justify="space-between" align="center" wrap gap={16}>
          <Flex align="center" gap={16} wrap>
            <BackButton />
            <Avatar size={56} style={{ backgroundColor: colorPrimary, fontSize: 20, fontWeight: 600 }}>
              {initials}
            </Avatar>
            <div>
              <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: colorPrimary }}>
                <MedicineBoxOutlined /> Prescription ordonnance
              </Text>
              <Title level={4} style={{ margin: 0, color: LOGO_BROWN }}>
                {currentPatient?.prenom_patient} {currentPatient?.nom_patient}
              </Title>
              <Space size={8} wrap>
                <Text strong>N° {currentPatient?.num_patient}</Text>
                {(editPrescription?.numcons || prescription?.numcons) && (
                  <Tag color="processing">Consultation {editPrescription?.numcons || prescription?.numcons}</Tag>
                )}
              </Space>
            </div>
          </Flex>

          <Flex align="flex-end" gap={12} wrap>
            <Form.Item
              label="Date de l'ordonnance"
              name="datepresc"
              rules={[{ required: true, message: "Champ obligatoire" }]}
              initialValue={dayjs(new Date())}
              style={{ marginBottom: 0 }}
            >
              <DatePicker format="DD/MM/YYYY" allowClear={false} />
            </Form.Item>
            <Dropdown
              disabled={isPrintDisabled}
              trigger={["click"]}
              menu={{
                items: [
                  { key: "1", label: "Imprimer l'ordonnance", onClick: () => printPDF(`/api/Print/smed/Prescription/${numCons}/ordonnance`) },
                  { key: "2", label: "Format ticket", onClick: () => printPDF(`/api/Print/smed/Prescription/${numCons}/ordonnance_Ticket`) },
                ],
              }}
            >
              <Tooltip title={isPrintDisabled ? "Disponible après l'enregistrement de l'ordonnance" : ""}>
                <Button icon={<PrinterOutlined />} disabled={isPrintDisabled}>
                  Imprimer <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Tooltip>
            </Dropdown>
          </Flex>
        </Flex>
      </Card>

      {/* Ajout d'un médicament */}
      <Card
        size="small"
        title={<Space style={{ color: colorPrimary }}><PlusOutlined /><span>Ajouter un médicament</span></Space>}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16} align="bottom">
          <Col xs={24} lg={11}>
            <Form.Item label="Médicament" name="medicament">
              <Select
                showSearch
                allowClear
                size="large"
                placeholder="Rechercher un médicament"
                optionFilterProp="label"
                loading={selectMedicamentsListLoading}
                options={listMedicaments.map((item) => ({ value: item.code_produit, label: item.libelle_produit }))}
              />
            </Form.Item>
          </Col>
          <Col xs={12} lg={5}>
            <Form.Item label="Quantité à prescrire" name="qte_presc" initialValue={editPrescription?.qte_presc || 1}>
              <InputNumber
                min={1}
                size="large"
                style={{ width: "100%" }}
                addonAfter={conditionnement || "unité"}
              />
            </Form.Item>
          </Col>
          <Col xs={12} lg={4}>
            <Form.Item label="Stock disponible">
              <Tag color={stockColor} style={{ fontSize: 14, padding: "6px 12px", margin: 0 }}>
                {medicamentSelected ? `${qteStock} en stock` : "—"}
              </Tag>
            </Form.Item>
          </Col>
          <Col xs={24} lg={4}>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                icon={<PlusOutlined />}
                disabled={posologieButtonStatus}
                onClick={openPosologie}
              >
                Posologie
              </Button>
            </Form.Item>
          </Col>
        </Row>

        {medicamentSelected && (
          <Flex gap={16} wrap style={{ padding: "8px 12px", borderRadius: 8, background: colorFillAlter }}>
            <Text type="secondary">Unité de distribution : <Text strong>{conditionnement || "non renseignée"}</Text></Text>
            <Text type="secondary">Prix de vente : <Text strong>{formatMontant(medicamentSelected.prix_vente) || "—"}</Text></Text>
            {medicamentSelected.libelle_famille && (
              <Text type="secondary">Famille : <Text strong>{medicamentSelected.libelle_famille}</Text></Text>
            )}
            {!conditionnement && (
              <Text type="danger">Unité de distribution manquante dans la fiche produit : la posologie ne peut pas être ajoutée.</Text>
            )}
          </Flex>
        )}

        {/* Champs techniques conservés pour le calcul et l'enregistrement */}
        <Form.Item name="cond" hidden><Input /></Form.Item>
        <Form.Item name="qte_pres" initialValue={0} hidden><InputNumber /></Form.Item>
      </Card>

      {/* Médicaments prescrits */}
      <Card
        size="small"
        title={
          <Space style={{ color: colorPrimary }}>
            <MedicineBoxOutlined />
            <span>Médicaments prescrits</span>
            <Tag style={{ marginInlineEnd: 0 }}>{medicamentsPrescrites.length}</Tag>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {medicamentsPrescrites.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucun médicament : choisissez un médicament puis renseignez sa posologie."
          />
        ) : (
          <DataTable
            compact
            hideTotal
            dataSourceCopy={medicamentsPrescrites}
            rowKey={(record) => record.codeacte}
            columns={columns}
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={montantIndex} align="right">
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={montantIndex} align="right">
                    <Text strong style={{ fontSize: 15 }}>{formatMontant(totalTarif)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={montantIndex + 1} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>

      {/* Barre d'actions */}
      <Flex
        justify="space-between"
        align="center"
        wrap
        gap={12}
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          padding: "12px 16px",
          background: colorBgContainer,
          borderTop: `1px solid ${colorBorderSecondary}`,
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.06)",
          borderRadius: 8,
        }}
      >
        <Text>
          Total de l'ordonnance : <Text strong style={{ fontSize: 18, color: LOGO_BROWN }}>{formatMontant(totalTarif) || 0} FCFA</Text>
        </Text>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={formLoading}
            disabled={medicamentsPrescrites.length === 0}
          >
            Enregistrer l'ordonnance
          </Button>
          <Button danger icon={<CloseOutlined />} onClick={() => navigate(-1)}>
            Annuler
          </Button>
        </Space>
      </Flex>
    </Form>

      {/* Hors du formulaire principal : la soumission du formulaire de posologie
          ne doit pas déclencher l'enregistrement de l'ordonnance */}
      <Modal
        style={{ top: 20 }}
        title="Ajouter la posologie"
        footer={null}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        width={700}
        destroyOnClose
      >
        <Posologie
          medicamentsPrescrites={medicamentsPrescrites}
          setMedicamentsPrescrites={setMedicamentsPrescrites}
          medicamentSelected={medicamentSelected}
          quantity={quantity}
          conditionnement={conditionnement}
          setIsModalVisible={setIsModalVisible}
          onValidate={() => {
            form.resetFields(["medicament", "qte_pres", "cond", "qte_presc"]);
            setMedicamentSelected(null);
            setQteStock(0);
            setQuantity(1);
            setConditionnement(null);
            setPosologieButtonStatus(true);
          }}
        />
      </Modal>
    </>
  );
};

export default Ordonnance;

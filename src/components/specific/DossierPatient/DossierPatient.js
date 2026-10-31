import React from "react";
import { useNavigate, useParams } from "react-router";
import useObjectFetch from "../../../utils/hooks/useObjectFetch";
import { endpoints } from "../../../constants/endpoints.constants";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Flex,
  Modal,
  Row,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import DataTable from "../../common/DataTable/DataTable";
import BackButton from "../../common/BackButton/BackButton";
import ReloadButton from "../../common/ReloadButton/ReloadButton";
import EditButton from "../../common/EditButton/EditButton";
import PrintButton from "../../common/PrintButton/PrintButton";
import DeleteButton from "../../common/DeleteButton/DeleteButton";
import NotSpecified from "../../common/NotSpecified/NotSpecified";
import { formatDate, deletePopup, printPDF, formatDateTime } from "../../../utils/helpers";
import useSearch from "../../../utils/hooks/useSearch";
import {
  CalendarOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  PrinterOutlined,
  ProfileOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { deleteActions } from "../../../actions/actions";
import { codesPrescriptions, LOGO_BROWN } from "../../../constants/app.constants";
import EditObservationPatient from "../EditObservationPatient/EditObservationPatient";
import { ServiceType } from "../../../utils/types/types.ts";
import UploadResultatModal from "../../common/UploadResultatModal/UploadResultatModal.js";
import PrescriptionApercu, { getTypePrescription } from "../PrescriptionApercu/PrescriptionApercu";
import { DELAI_CLOTURE_AUTO_HEURES, estClotureAuto, estConsultationCloturee, heuresAvantClotureAuto } from "../../../utils/clotureConsultation";
import { ouvrirCertificatMedical } from '../CertificatMedical/CertificatMedical';

const { Title, Text } = Typography;

// Configuration des onglets de prescriptions (libellés et routes d'impression)
const PRESCRIPTION_TYPES = {
  [codesPrescriptions.ORD]: { label: "Ordonnances", numLabel: "N° ordonnance", print: "ordonnance", printLabel: "Imprimer l'ordonnance", icon: <MedicineBoxOutlined />, withResultat: false },
  [codesPrescriptions.ANA]: { label: "Analyses", numLabel: "N° analyse", print: "analyse", printLabel: "Imprimer l'analyse", icon: <ExperimentOutlined />, withResultat: true },
  [codesPrescriptions.IMG]: { label: "Imageries", numLabel: "N° imagerie", print: "imagerie", printLabel: "Imprimer l'imagerie", icon: <FileSearchOutlined />, withResultat: true },
};

const getInitials = (patient) =>
  `${patient?.prenom_patient?.[0] || ""}${patient?.nom_patient?.[0] || ""}`.toUpperCase();

// Bloc "libellé / valeur" de la fiche d'identité
const InfoItem = ({ icon, label, value }) => (
  <div>
    <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
      {icon} {label}
    </Text>
    <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>
      {value || <NotSpecified />}
    </div>
  </div>
);

function DossierPatient({ serviceType }) {
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const { token: { colorPrimary, colorPrimaryBg, colorPrimaryBorder, colorTextQuaternary } } = theme.useToken();

  const { getColumnSearchProps } = useSearch();
  const navigate = useNavigate();

  const { id } = useParams();
  const numPatient = id;

  const [isUploadResultatModalVisible, setIsUploadResultatModalVisible] =
    React.useState(false);

  const [numPrescription, setNumPrescription] = React.useState(null);

  // Prescription affichée dans la modale d'aperçu
  const [prescriptionOuverte, setPrescriptionOuverte] = React.useState(null);

  // Onglet de l'historique (piloté aussi par les tuiles de synthèse)
  const [ongletActif, setOngletActif] = React.useState("consultations");

  const handleUploadResultatModal = (numPresc) => {
    setIsUploadResultatModalVisible(true);
    setNumPrescription(numPresc);
  };

  const {
    data,
    isLoading,
    onRefresh: refreshConsultation,
    error,
  } = useObjectFetch(
    `${endpoints.dossierMedical.DOSSIER}?numpat=${numPatient}`,
  );

  const patient = data?.patient;
  const listConsultation = data?.listConsultation || [];
  const listPrescription = data?.listPrescription || [];

  const doConsultation = (numRV) => {
    switch (serviceType) {
      case ServiceType.MEDICAL:
        navigate("/espace-medical/patients/dossier/consultation", {
          state: { numRV: numRV, currentPatient: patient },
        });
        break;
      case ServiceType.DENTAIRE:
        navigate(
          `/espace-dentist/consultation/${numPatient}/${numRV}?serviceType=${serviceType}`,
          { state: { patient } },
        );
        break;
      case ServiceType.GYNECOLOGIE:
        navigate(`/espace-gynecologie/patients/${numPatient}/consultation`, {
          state: {
            patient,
            numRV,
            serviceType,
          },
        });
        break;
      case ServiceType.RADIOLOGIE:
        navigate(
          `/espace-radiologie/consultation/${numPatient}/${numRV}?serviceType=${serviceType}`,
          { state: { patient } },
        );
        break;
      case ServiceType.ANALYSE:
        navigate(
          `/espace-analyse/consultation/${numPatient}/${numRV}?serviceType=${serviceType}`,
          { state: { patient } },
        );
        break;
      case ServiceType.HOSPITALISATION:
        navigate(
          `/espace-hospitalisation/consultation/${numPatient}/${numRV}?serviceType=${serviceType}`,
          { state: { patient } },
        );
        break;
      case ServiceType.INFIRMERIE:
        navigate(
          `/espace-infirmerie/consultation/${numPatient}/${numRV}?serviceType=${serviceType}`,
          { state: { patient } },
        );
        break;
      default:
        break;
    }
  };

  const openInfosClinique = () => {
    switch (serviceType) {
      case ServiceType.GYNECOLOGIE:
        navigate(`/espace-gynecologie/patients/${numPatient}/infos-cliniques`);
        break;
      case ServiceType.DENTAIRE:
        navigate(`/espace-dentist/patients/${numPatient}/infos-cliniques`);
        break;
      case ServiceType.MEDICAL:
        navigate(`/espace-medical/patients/${numPatient}/infos-cliniques`);
        break;
      case ServiceType.RADIOLOGIE:
        navigate(`/espace-radiologie/patients/${numPatient}/infos-cliniques`);
        break;
      case ServiceType.ANALYSE:
        navigate(`/espace-analyse/patients/${numPatient}/infos-cliniques`);
        break;
      case ServiceType.HOSPITALISATION:
        navigate(`/espace-hospitalisation/patients/${numPatient}/infos-cliniques`);
        break;
      case ServiceType.INFIRMERIE:
        navigate(`/espace-infirmerie/patients/${numPatient}/infos-cliniques`);
        break;
      default:
        break;
    }
  };

  const onEditConsultation = (record) => {
    doConsultation(record.numrv);
  };

  const onDeleteConsultation = (record) => { };

  const onEditPrescription = (record) => {
    setPrescriptionOuverte(record);
  };

  // Modification d'une prescription non servie (ajout d'un médicament oublié...) : réouvre l'écran
  // de prescription en mode édition (editPrescription), qui renvoie le numpresc existant à l'API
  const onModifierPrescription = (record, route) => {
    sessionStorage.setItem("editPrescription", JSON.stringify(record));
    sessionStorage.setItem("prescription", JSON.stringify({
      codepresc: record.codepresc,
      numcons: record.numcons,
      diagnostic: record.diagnostic,
    }));
    sessionStorage.setItem("currentPatient", JSON.stringify(patient));
    navigate(`/espace-medical/patients/dossier/prescriptions/${route}`);
  };

  const onDeletePrescription = (record) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(
          `${endpoints.prescriptions.DELETE}/${record?.numpresc}`,
        ).then((response) => {
          if (response.data.Deleted === true) {
            message.success("Ligne retirée avec succès");
            refreshConsultation();
          }
        });
      }
    });
  };

  const handlePrescriptions = (codepres, item) => { };

  const openAnalyse = (numRV) => {
    console.log(numRV);
  };

  const viewResultat = (numPrescription) => {
    printPDF(endpoints.files.GET_RESULTAT(numPrescription));
  };

  const deleteResultat = (numPrescription) => {
    deletePopup().then((result) => {
      if (result.isConfirmed) {
        deleteActions(endpoints.files.DELETE_RESULTAT(numPrescription)).then(
          (response) => {
            if (response.data) {
              message.success("Résultat supprimé avec succès");
              refreshConsultation();
            }
          },
        );
      }
    });
  };

  if (isLoading) return <Card loading />;
  if (error || !data || !patient) return <Card><Empty description="Dossier introuvable" /></Card>;

  const isFemme = patient.sexe_patient === "FE";
  const prescriptionsByType = (code) => listPrescription.filter((element) => element.codepresc === code);
  const derniereConsultation = listConsultation[0];

  // Ancienneté de la dernière consultation, en jours
  const joursDepuis = derniereConsultation?.datecons
    ? Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(derniereConsultation.datecons).setHours(0, 0, 0, 0)) / 86400000)
    : null;
  const libelleAnciennete = joursDepuis === null ? null
    : joursDepuis <= 0 ? "Aujourd'hui"
      : joursDepuis === 1 ? "Hier"
        : `Il y a ${joursDepuis} jours`;

  // Nombre de prescriptions d'un type encore en attente
  const enAttente = (code) => prescriptionsByType(code).filter((p) => p.isdone !== "Oui").length;
  const detailPrescriptions = (code, libelle) => {
    const total = prescriptionsByType(code).length;
    if (!total) return `Aucune ${libelle}`;
    const attente = enAttente(code);
    return attente ? `${attente} en attente` : "Toutes traitées";
  };

  const syntheses = [
    {
      label: "Dernière consultation",
      value: derniereConsultation ? formatDate(derniereConsultation.datecons) : "Aucune",
      detail: derniereConsultation
        ? [libelleAnciennete, derniereConsultation.medecin].filter(Boolean).join(" · ")
        : "Aucune consultation enregistrée",
      icon: <CalendarOutlined />,
      color: LOGO_BROWN,
      onglet: "consultations",
      large: true,
    },
    {
      label: "Consultations",
      value: listConsultation.length,
      detail: `${listConsultation.filter((c) => c.medecin).length} validée(s)`,
      icon: <ProfileOutlined />,
      color: colorPrimary,
      onglet: "consultations",
    },
    {
      label: "Ordonnances",
      value: prescriptionsByType(codesPrescriptions.ORD).length,
      detail: detailPrescriptions(codesPrescriptions.ORD, "ordonnance"),
      icon: <MedicineBoxOutlined />,
      color: "#52c41a",
      onglet: codesPrescriptions.ORD,
    },
    {
      label: "Analyses",
      value: prescriptionsByType(codesPrescriptions.ANA).length,
      detail: detailPrescriptions(codesPrescriptions.ANA, "analyse"),
      icon: <ExperimentOutlined />,
      color: "#722ed1",
      onglet: codesPrescriptions.ANA,
    },
    {
      label: "Imageries",
      value: prescriptionsByType(codesPrescriptions.IMG).length,
      detail: detailPrescriptions(codesPrescriptions.IMG, "imagerie"),
      icon: <FileSearchOutlined />,
      color: "#fa8c16",
      onglet: codesPrescriptions.IMG,
    },
  ];

  /* ---------------- Colonnes ---------------- */

  const consultationColumns = [
    {
      title: "N° Cons.",
      dataIndex: "numcons",
      key: "numcons",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Date",
      dataIndex: "datecons",
      key: "datecons",
      ...getColumnSearchProps("datecons"),
      render: (record) => formatDate(record),
    },
    {
      title: "Médecin",
      dataIndex: "medecin",
      key: "medecin",
      ...getColumnSearchProps("medecin"),
      sorter: (a, b) => (a.medecin || "").localeCompare(b.medecin || ""),
    },
    { title: "Tension", dataIndex: "tension", key: "tension", render: (v) => v || "-" },
    {
      title: "Temp.",
      dataIndex: "temp",
      key: "temp",
      sorter: (a, b) => a.temp - b.temp,
      render: (v) => (v ? <Text type={v > 37.5 ? "danger" : undefined}>{v} °C</Text> : "-"),
    },
    { title: "Poids", dataIndex: "poids", key: "poids", sorter: (a, b) => a.poids - b.poids, render: (v) => (v ? `${v} kg` : "-") },
    { title: "Taille", dataIndex: "taille", key: "taille", sorter: (a, b) => a.taille - b.taille, render: (v) => (v ? `${v} cm` : "-") },
    {
      title: "Statut",
      key: "statut",
      align: "center",
      render: (record) => {
        if (estConsultationCloturee(record)) {
          const auto = estClotureAuto(record);
          return (
            <Tooltip title={auto
              ? `Clôturée automatiquement ${DELAI_CLOTURE_AUTO_HEURES} h après la consultation`
              : record.date_cloture ? `Clôturée le ${formatDateTime(record.date_cloture)}` : "Clôturée par le médecin"}>
              <Tag icon={<LockOutlined />} color="success" style={{ marginInlineEnd: 0 }}>
                {auto ? "Clôturée (auto)" : "Clôturée"}
              </Tag>
            </Tooltip>
          );
        }
        if (record.medecin) {
          const heures = heuresAvantClotureAuto(record);
          return (
            <Tooltip title={heures !== null ? `Clôture automatique dans ${heures} h si elle n'est pas clôturée avant` : ""}>
              <Tag color="processing" style={{ marginInlineEnd: 0 }}>En cours</Tag>
            </Tooltip>
          );
        }
        return <Tag color="warning" style={{ marginInlineEnd: 0 }}>Non démarrée</Tag>;
      },
    },
    {
      fixed: "right",
      render: (record) => (
        <Space size={0}>
          {record?.medecin !== null && (
            <>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    { key: "0", label: "Ordonnances", onClick: () => handlePrescriptions(codesPrescriptions.ORD, record) },
                    { key: "1", label: "Analyses", onClick: () => handlePrescriptions(codesPrescriptions.ANA, record) },
                    { key: "2", label: "Imageries", onClick: () => handlePrescriptions(codesPrescriptions.IMG, record) },
                  ],
                }}
              >
                <Tooltip title="Prescriptions">
                  <Button type="text" icon={<UnorderedListOutlined />} />
                </Tooltip>
              </Dropdown>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    { key: "1", label: "Certificat médical", onClick: () => ouvrirCertificatMedical(record.numcons) },
                    { key: "2", label: "Bulletin de visite", disabled: true },
                    { key: "3", label: "Certificat d'aptitude", disabled: true },
                    { key: "4", label: "Certificat de reprise", disabled: true },
                    { key: "5", label: "Fiche de référencement", disabled: true },
                  ],
                }}
              >
                <div><PrintButton /></div>
              </Dropdown>
            </>
          )}
          {/* Modifiable par son médecin tant qu'elle n'est pas clôturée */}
          {record.medecin === userConnected?.username && !estConsultationCloturee(record) && (
            <>
              <EditButton onEdit={() => onEditConsultation(record)} />
              <DeleteButton onDelete={() => onDeleteConsultation(record)} />
            </>
          )}
        </Space>
      ),
    },
  ];

  const prescriptionColumns = (code) => {
    const config = PRESCRIPTION_TYPES[code];
    return [
      {
        title: config.numLabel,
        dataIndex: "numpresc",
        key: "numpresc",
        ...getColumnSearchProps("numpresc"),
        render: (value) => <Text strong>{value}</Text>,
      },
      {
        title: "Date",
        dataIndex: "datepresc",
        key: "datepresc",
        render: (record) => formatDateTime(record),
      },
      {
        title: "Prescripteur",
        dataIndex: "prescripteur",
        key: "prescripteur",
        ...getColumnSearchProps("prescripteur"),
        sorter: (a, b) => (a.prescripteur || "").localeCompare(b.prescripteur || ""),
      },
      ...(config.withResultat
        ? [{
          title: "Résultat",
          key: "resultat",
          render: (record) =>
            record?.resultat ? (
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    { key: "view", label: "Visualiser", icon: <EyeOutlined />, onClick: () => viewResultat(record.numpresc) },
                    { key: "delete", label: "Supprimer", icon: <DeleteOutlined />, danger: true, onClick: () => deleteResultat(record.numpresc) },
                  ],
                }}
              >
                <Tag color="success" style={{ cursor: "pointer" }}>Disponible</Tag>
              </Dropdown>
            ) : (
              <Tag>En attente</Tag>
            ),
        }]
        : []),
      {
        fixed: "right",
        render: (record) => (
          <Space size={0}>
            {/* Une prescription déjà servie / réalisée ne se réimprime pas */}
            {record?.medecin !== null && record?.isdone !== "Oui" && (
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    { key: "1", label: config.printLabel, onClick: () => printPDF(`/api/Print/smed/Prescription/${record.numpresc}/${config.print}`) },
                    { key: "2", label: "Format ticket", onClick: () => printPDF(`/api/Print/smed/Prescription/${record.numpresc}/${config.print}_Ticket`) },
                  ],
                }}
              >
                <Tooltip title="Imprimer">
                  <Button type="text" style={{ color: colorPrimary }} icon={<PrinterOutlined />} />
                </Tooltip>
              </Dropdown>
            )}
            <Tooltip title="Voir la prescription">
              <Button type="text" style={{ color: colorPrimary }} icon={<EyeOutlined />} onClick={() => onEditPrescription(record)} />
            </Tooltip>
            {/* Modifiable tant qu'elle n'est pas servie / réalisée (contrôlé aussi par l'API) */}
            {record?.isdone !== "Oui" && (
              <EditButton onEdit={() => onModifierPrescription(record, config.print)} />
            )}
            <DeleteButton onDelete={() => onDeletePrescription(record)} />
            {config.withResultat && (
              <Tooltip title="Charger le résultat">
                <Button
                  type="text"
                  onClick={() => handleUploadResultatModal(record.numpresc)}
                  icon={<UploadOutlined style={{ color: "orange" }} />}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];
  };

  /* ---------------- Onglets ---------------- */

  const tabLabel = (icon, label, count) => (
    <Space size={6}>
      {icon}
      <span>{label}</span>
      <Badge count={count} showZero size="small" color={count ? colorPrimary : "#bfbfbf"} />
    </Space>
  );

  const tabItems = [
    {
      key: "consultations",
      label: tabLabel(<ProfileOutlined />, "Consultations", listConsultation.length),
      children: (
        <DataTable
          compact
          dataSourceCopy={listConsultation}
          tableLoading={isLoading}
          rowKey={(record) => record.numcons}
          columns={consultationColumns}
        />
      ),
    },
    ...[codesPrescriptions.ORD, codesPrescriptions.ANA, codesPrescriptions.IMG].map((code) => {
      const list = prescriptionsByType(code);
      return {
        key: code,
        label: tabLabel(PRESCRIPTION_TYPES[code].icon, PRESCRIPTION_TYPES[code].label, list.length),
        children: (
          <DataTable
            compact
            dataSourceCopy={list}
            tableLoading={isLoading}
            rowKey={(record) => record.numpresc}
            columns={prescriptionColumns(code)}
          />
        ),
      };
    }),
  ];

  /* ---------------- Rendu ---------------- */

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {/* Bandeau patient */}
      <Card styles={{ body: { padding: 20 } }}>
        <Flex justify="space-between" align="flex-start" wrap gap={16}>
          <Flex align="center" gap={16} wrap>
            <BackButton />
            <Avatar
              size={64}
              style={{
                backgroundColor: isFemme ? "#eb2f96" : colorPrimary,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {getInitials(patient)}
            </Avatar>
            <div>
              <Title level={3} style={{ margin: 0, color: LOGO_BROWN }}>
                {patient.prenom_patient} {patient.nom_patient}
              </Title>
              <Space size={8} wrap style={{ marginTop: 6 }}>
                <Text copyable={{ text: patient.num_patient, tooltips: ["Copier", "Copié"] }} strong style={{ fontSize: 15 }}>
                  <IdcardOutlined /> {patient.num_patient}
                </Text>
                <Tag color={isFemme ? "magenta" : "blue"}>{isFemme ? "Féminin" : "Masculin"}</Tag>
                {patient.age_patient !== null && patient.age_patient !== undefined && (
                  <Tag>{patient.age_patient} ans</Tag>
                )}
                {patient.group_sanguin && <Tag color="red">Groupe {patient.group_sanguin}</Tag>}
                {patient.type_patient && <Tag color="geekblue">{patient.type_patient}</Tag>}
                {patient.suspension === "S" && <Tag color="error">Suspendu</Tag>}
              </Space>
            </div>
          </Flex>

          {/* Repère de l'écran courant */}
          <Flex
            align="center"
            gap={10}
            style={{
              alignSelf: "center",
              padding: "8px 20px",
              borderRadius: 999,
              background: colorPrimaryBg,
              border: `1px solid ${colorPrimaryBorder}`,
              color: colorPrimary,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            <FolderOpenOutlined style={{ fontSize: 22 }} />
            Dossier médical
          </Flex>

          <Space wrap>
            <ReloadButton onRefresh={refreshConsultation} />
            <Button icon={<FileTextOutlined />} onClick={openInfosClinique}>
              Infos cliniques
            </Button>
            {serviceType === ServiceType.ANALYSE ? (
              <Button type="primary" onClick={() => openAnalyse(derniereConsultation?.numrv)}>
                Analyse
              </Button>
            ) : (
              <Tooltip title={!derniereConsultation ? "Aucun rendez-vous / consultation pour ce patient" : ""}>
                <Button
                  type="primary"
                  icon={<MedicineBoxOutlined />}
                  onClick={() => doConsultation(derniereConsultation.numrv)}
                  disabled={!derniereConsultation}
                >
                  Consultation
                </Button>
              </Tooltip>
            )}
          </Space>
        </Flex>
      </Card>

      {/* Identité + observations */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="Informations du patient" size="small" style={{ height: "100%" }}>
            <Row gutter={[24, 16]}>
              <Col xs={12} md={8}>
                <InfoItem icon={<CalendarOutlined />} label="Date de naissance" value={patient.datenaiss_patient && formatDate(patient.datenaiss_patient)} />
              </Col>
              <Col xs={12} md={8}>
                <InfoItem label="Lieu de naissance" value={patient.lieunaiss_patient} />
              </Col>
              <Col xs={12} md={8}>
                <InfoItem label="Groupe sanguin" value={patient.group_sanguin} />
              </Col>
              <Col xs={12} md={8}>
                <InfoItem icon={<PhoneOutlined />} label="Téléphone" value={patient.tel_patient} />
              </Col>
              <Col xs={12} md={8}>
                <InfoItem icon={<MailOutlined />} label="Email" value={patient.email_patient} />
              </Col>
              <Col xs={12} md={8}>
                <InfoItem label="Département / Service" value={patient.lib_dept || patient.code_dir} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Observations particulières" size="small" style={{ height: "100%" }}>
            <EditObservationPatient observation={patient.obs_part} />
          </Card>
        </Col>
      </Row>

      {/* Synthèse : un clic sur une tuile ouvre l'onglet correspondant de l'historique */}
      <Row gutter={[16, 16]}>
        {syntheses.map((item) => {
          const actif = item.onglet && ongletActif === item.onglet;
          return (
            <Col key={item.label} xs={24} sm={12} md={8} xl={item.large ? 8 : 4}>
              <Card
                hoverable={!!item.onglet}
                onClick={item.onglet ? () => setOngletActif(item.onglet) : undefined}
                styles={{ body: { padding: "14px 16px" } }}
                style={{
                  height: "100%",
                  borderTop: `3px solid ${item.color}`,
                  background: actif ? `${item.color}14` : undefined,
                  borderColor: actif ? item.color : undefined,
                }}
              >
                <Flex align="center" gap={12}>
                  <Avatar size={46} icon={item.icon} style={{ backgroundColor: `${item.color}22`, color: item.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{item.label}</Text>
                    <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color: item.value === 0 ? colorTextQuaternary : item.color }}>
                      {item.value}
                    </div>
                    {item.detail && <Text type="secondary" ellipsis style={{ fontSize: 12, display: "block" }}>{item.detail}</Text>}
                  </div>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Historique */}
      <Card styles={{ body: { paddingTop: 4 } }}>
        <Tabs activeKey={ongletActif} onChange={setOngletActif} items={tabItems} />
      </Card>

      <Modal
        open={!!prescriptionOuverte}
        onCancel={() => setPrescriptionOuverte(null)}
        footer={null}
        width={960}
        destroyOnClose
        title={
          prescriptionOuverte && (
            <Space size={8}>
              <span style={{ color: colorPrimary }}>{getTypePrescription(prescriptionOuverte)?.icon}</span>
              <span>{getTypePrescription(prescriptionOuverte)?.libelle || "Prescription"} {prescriptionOuverte.numpresc}</span>
            </Space>
          )
        }
      >
        {prescriptionOuverte && (
          <PrescriptionApercu prescription={prescriptionOuverte} onClose={() => setPrescriptionOuverte(null)} />
        )}
      </Modal>

      <UploadResultatModal
        isModalVisible={isUploadResultatModalVisible}
        setIsModalVisible={setIsUploadResultatModalVisible}
        numPrescription={numPrescription}
        refreshConsultation={refreshConsultation}
      />
    </Space>
  );
}

export default DossierPatient;

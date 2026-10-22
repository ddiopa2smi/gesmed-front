import {
  ApartmentOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  StopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  message,
  Modal,
  Row,
  Segmented,
  Space,
  Tag,
  theme,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { Can } from "../../utils/contexts/AbilityContext";
import useSearch from "../../utils/hooks/useSearch";
import { deletePopup, formatDate } from "../../utils/helpers";
import UpdatePassword from "../../components/specific/UpdatePassword/UpdatePassword";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import ReloadButton from "../../components/common/ReloadButton/ReloadButton";
import { deleteActions } from "../../actions/actions";
import NewAccountModal from "../../components/specific/NewAccountModal/NewAccountModal";
import { LOGO_BROWN } from "../../constants/app.constants.js";

const { Title, Text } = Typography;

// Couleur stable par profil (basée sur un hash du libellé)
const ROLE_COLORS = ["blue", "purple", "cyan", "geekblue", "magenta", "gold", "volcano", "lime"];
const getRoleColor = (value) => {
  if (!value) return "default";
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  return ROLE_COLORS[Math.abs(hash) % ROLE_COLORS.length];
};

const getInitials = (name) =>
  (name || "")
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

// Carte de synthèse, cliquable quand elle sert de filtre rapide
const StatCard = ({ icon, label, value, color, active, onClick }) => {
  const { token } = theme.useToken();
  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        padding: "14px 16px",
        borderRadius: 10,
        background: active ? token.colorPrimaryBg : token.colorFillAlter,
        border: `1px solid ${active ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        transition: "all 0.2s",
      }}
    >
      <Flex align="center" gap={12}>
        <Avatar size={40} icon={icon} style={{ backgroundColor: color }} />
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
        </div>
      </Flex>
    </div>
  );
};

function Accounts() {
  const { token: { colorPrimary, colorSuccess, colorError } } = theme.useToken();
  const { getColumnSearchProps } = useSearch();
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const [open, setOpen] = useState(false);
  // Filtre rapide sur l'état : "all" | "actifs" | "bloques"
  const [etat, setEtat] = useState("all");
  const { data, dataCopy, setDataCopy, isLoading, onRefresh } = useFetch(
    endpoints.users.LIST
  );

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const { data: roles } = useFetch(endpoints.users.ROLES_LIST);

  const [currentRecord, setCurrentRecord] = useState(null);

  const { data: services_medicaux } = useFetch(endpoints.services_medicaux.LIST);

  // Personnel médical (hors utilisateur connecté), après recherche puis filtre rapide d'état
  const personnel = (dataCopy || []).filter(
    (element) => element?.login !== userConnected?.login && element?.perim === "MED"
  );
  const displayed = personnel.filter((element) =>
    etat === "all" || (etat === "actifs" ? element.etat === true : element.etat !== true)
  );
  const nbActifs = personnel.filter((element) => element.etat === true).length;
  const nbServices = new Set(personnel.map((element) => element.lib_service).filter(Boolean)).size;

  const toggleEtat = (value) => setEtat(etat === value ? "all" : value);

  const onAdd = () => {
    setCurrentRecord(null);
    setIsAccountModalOpen(true);
  };

  const onEdit = (record) => {
    setIsAccountModalOpen(true);
    setCurrentRecord(record);
  };

  const onEditPassword = (record) => {
    setCurrentRecord(record);
    setOpen(true);
  };

  const onDelete = (record) => {
    deletePopup()
      .then(async (result) => {
        if (result.isConfirmed) {
          await deleteActions(endpoints.users.DELETE(record.login))
            .then((response) => {
              if (response.data.Deleted) {
                message.success("Utilisateur supprimé avec succès");
                onRefresh();
              }
            })
        }
      })
  };

  const columns = [
    {
      title: "Utilisateur",
      dataIndex: "username",
      key: "username",
      ...getColumnSearchProps("username"),
      sorter: (a, b) => (a.username || "").localeCompare(b.username || ""),
      render: (_, record) => (
        <Flex align="center" gap={10}>
          <Avatar
            size={34}
            style={{ backgroundColor: record.etat === true ? colorPrimary : "#bfbfbf", flexShrink: 0, fontWeight: 600 }}
          >
            {getInitials(record.username)}
          </Avatar>
          <div style={{ lineHeight: 1.3 }}>
            <Text strong>{record.username}</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{record.login}</Text></div>
          </div>
        </Flex>
      ),
    },
    {
      title: "Email",
      dataIndex: "emailaddress",
      key: "emailaddress",
      ...getColumnSearchProps("emailaddress"),
      render: (value) => value
        ? <a href={`mailto:${value}`}><MailOutlined /> {value}</a>
        : <Text type="secondary">-</Text>,
    },
    {
      title: "Profil",
      dataIndex: "role_name",
      key: "role_name",
      filters: (roles || []).map((item) => ({ text: item?.role_name, value: item?.role_name })),
      onFilter: (value, record) => record.role_name === value,
      render: (value) => value ? <Tag color={getRoleColor(value)}>{value}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: "Service",
      dataIndex: "lib_service",
      key: "lib_service",
      filters: (services_medicaux || []).map((item) => ({ text: item?.lib_service, value: item?.lib_service })),
      onFilter: (value, record) => record.lib_service === value,
      render: (value) => value || <Text type="secondary">-</Text>,
    },
    {
      title: "Créé le",
      dataIndex: "pwd_date_creation",
      key: "pwd_date_creation",
      render: (value) => (value ? formatDate(value) : <Text type="secondary">-</Text>),
    },
    {
      title: "État",
      dataIndex: "etat",
      key: "etat",
      align: "center",
      render: (value) => value === true
        ? <Tag color="success" icon={<CheckCircleOutlined />}>Actif</Tag>
        : <Tag color="error" icon={<StopOutlined />}>Bloqué</Tag>,
    },
    {
      fixed: "right",
      render: (record) => (
        <Space size={0}>
          <Can I="update" an="account">
            <Tooltip title="Modifier">
              <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
          </Can>
          <Can I="update" an="account">
            <Tooltip title="Changer le mot de passe">
              <Button type="text" style={{ color: colorPrimary }} icon={<LockOutlined />} onClick={() => onEditPassword(record)} />
            </Tooltip>
          </Can>
          <Can I="delete" an="account">
            <Tooltip title="Supprimer">
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
            </Tooltip>
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      {/* En-tête */}
      <Flex justify="space-between" align="flex-start" wrap gap={12}>
        <div>
          <Title level={3} style={{ margin: 0, color: LOGO_BROWN }}>Personnel médical</Title>
          <Text type="secondary">
            Gérer les comptes du personnel médical : création, profil, service, mot de passe et état d'accès.
          </Text>
        </div>
        <Space wrap>
          <ReloadButton onRefresh={onRefresh} />
          <Can I="create" an="account">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Nouveau compte
            </Button>
          </Can>
        </Space>
      </Flex>

      {/* Synthèse */}
      <Row gutter={[12, 12]} style={{ margin: "16px 0" }}>
        <Col xs={12} lg={6}>
          <StatCard icon={<TeamOutlined />} label="Comptes" value={personnel.length} color={colorPrimary}
            active={etat === "all"} onClick={() => setEtat("all")} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard icon={<CheckCircleOutlined />} label="Actifs" value={nbActifs} color={colorSuccess}
            active={etat === "actifs"} onClick={() => toggleEtat("actifs")} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard icon={<StopOutlined />} label="Bloqués" value={personnel.length - nbActifs} color={colorError}
            active={etat === "bloques"} onClick={() => toggleEtat("bloques")} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard icon={<ApartmentOutlined />} label="Services représentés" value={nbServices} color={LOGO_BROWN} />
        </Col>
      </Row>

      {/* Barre de filtres */}
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 12 }}>
        <SearchBar
          data={data}
          setDataCopy={setDataCopy}
          listKeys={["login", "username", "emailaddress"]}
        />
        <Segmented
          value={etat}
          onChange={setEtat}
          options={[
            { label: "Tous", value: "all" },
            { label: "Actifs", value: "actifs" },
            { label: "Bloqués", value: "bloques" },
          ]}
        />
      </Flex>

      <DataTable
        compact
        hideTotal
        tableLoading={isLoading}
        dataSource={data}
        dataSourceCopy={displayed}
        setDataSourceCopy={setDataCopy}
        rowKey={(record) => record.login}
        columns={columns}
      />

      <Modal
        open={open}
        style={{ top: 20 }}
        title={`Modifier le mot de passe ${currentRecord ? `de ${currentRecord?.username}` : ""}`}
        onCancel={() => {
          setOpen(false);
        }}
        keyboard={false}
        maskClosable={false}
        footer={null}
        destroyOnClose
      >
        <UpdatePassword record={currentRecord} onClose={() => { setOpen(false) }} />
      </Modal>

      <NewAccountModal
        open={isAccountModalOpen}
        currentRecord={currentRecord}
        refresh={onRefresh}
        onCancel={() => {
          setIsAccountModalOpen(false);
          setCurrentRecord(null);
        }}
      />
    </Card>
  );
}

export default Accounts;

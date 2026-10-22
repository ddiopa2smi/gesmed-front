import React from "react";
import { Avatar, Card, Flex, Skeleton, Space, Typography, theme } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Text } = Typography;

// Carte indicateur des tableaux de bord : valeur principale + information complémentaire
export const KpiCard = ({ icon, color, label, value, footer, link, loading }) => {
  const { token } = theme.useToken();
  return (
    <Card
      styles={{ body: { padding: 18 } }}
      style={{ height: "100%", borderTop: `3px solid ${color}` }}
      hoverable={!!link}
    >
      <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
        <Flex justify="space-between" align="flex-start">
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, color: token.colorText }}>{value}</div>
          </div>
          <Avatar size={44} icon={icon} style={{ backgroundColor: `${color}22`, color }} />
        </Flex>
        <Flex justify="space-between" align="center" style={{ marginTop: 8, minHeight: 22 }}>
          <span style={{ fontSize: 12 }}>{footer}</span>
          {link && <Link to={link} style={{ fontSize: 12 }}>Voir plus</Link>}
        </Flex>
      </Skeleton>
    </Card>
  );
};

// Variation par rapport à une valeur de référence (ex : hier)
export const Evolution = ({ current, previous, label }) => {
  const { token } = theme.useToken();
  if (!previous && !current) return <Text type="secondary">Aucune activité {label}</Text>;
  const diff = current - previous;
  const color = diff >= 0 ? token.colorSuccess : token.colorError;
  return (
    <Text type="secondary">
      <span style={{ color, fontWeight: 600 }}>
        {diff >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(diff)}
      </span>{" "}
      par rapport à {label}
    </Text>
  );
};

// Ligne "icône + libellé + valeur" des cartes de synthèse
export const IndicatorRow = ({ icon, color, label, value }) => (
  <Flex align="center" justify="space-between" style={{ padding: "8px 0" }}>
    <Space>
      <Avatar size={30} icon={icon} style={{ backgroundColor: `${color}22`, color }} />
      <Text>{label}</Text>
    </Space>
    <Text strong style={{ fontSize: 16 }}>{value}</Text>
  </Flex>
);

export default KpiCard;

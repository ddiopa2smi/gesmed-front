import React from "react";
import { Alert, Card, Col, Empty, Row, Skeleton, Space, Tooltip as InfoBulle, Typography, theme } from "antd";
import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { KpiCard } from "../../common/KpiCard/KpiCard";

const { Text } = Typography;

const COULEURS_TYPES = ["#31bae8", "#9f5822", "#722ed1", "#fa8c16", "#13c2c2"];
const HAUTEUR = 280;

const Graphique = ({ titre, children }) => {
  const { token: { colorPrimary } } = theme.useToken();
  return (
    <Card size="small" title={<span style={{ color: colorPrimary }}>{titre}</span>} style={{ height: "100%" }}>
      <div style={{ width: "100%", height: HAUTEUR }}>{children}</div>
    </Card>
  );
};

const pieLabel = ({ percent }) => `${Math.round(percent * 100)} %`;

// Synthèse des visites (indicateurs et graphiques) : statistiques médicales et page de détail
function SyntheseVisites({ stats, loading, extra }) {
  const { token } = theme.useToken();

  return (
    <Card
      size="small"
      title={<Space style={{ color: token.colorPrimary }}><AuditOutlined /><span>Visites médicales</span></Space>}
      extra={extra}
    >
      {loading ? <Skeleton active /> : !stats.total ? <Empty description="Aucune visite sur la période" /> : (
        <>
          {stats.deduits > 0 && (
            <Alert
              type="info" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 12 }}
              message={`${stats.deduits} visite(s) sur ${stats.total} : type ou résultat déduit du motif et du diagnostic saisi en texte libre`}
            />
          )}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard icon={<AuditOutlined />} color={token.colorPrimary} label="Visites réalisées" value={stats.total}
                footer={<Text type="secondary"><Text strong>{stats.patients}</Text> patient(s) distinct(s)</Text>} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard icon={<CheckCircleOutlined />} color={token.colorSuccess} label="Taux d'aptitude" value={`${stats.tauxAptitude} %`}
                footer={(
                  <InfoBulle title="Part des visites déclarées aptes (avec ou sans réserve) parmi celles dont le résultat est connu">
                    <Text type="secondary"><Text strong>{stats.aptes}</Text> apte(s) sur {stats.aptes + stats.inaptes} résultat(s) connu(s) <QuestionCircleOutlined /></Text>
                  </InfoBulle>
                )} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard icon={<CloseCircleOutlined />} color={token.colorError} label="Inaptes" value={stats.inaptes}
                footer={<Text type="secondary">temporaires ou définitifs</Text>} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard icon={<QuestionCircleOutlined />} color="#8c8c8c" label="Résultat non renseigné" value={stats.nonRenseignes}
                footer={<Text type="secondary">aucun avis d'aptitude identifiable</Text>} />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={7}>
              <Graphique titre="Types de visites">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.parType} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="75%" label={pieLabel}>
                      {stats.parType.map((t, i) => <Cell key={t.name} fill={COULEURS_TYPES[i % COULEURS_TYPES.length]} />)}
                    </Pie>
                    <ChartTooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Graphique>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <Graphique titre="Résultats des visites">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.parResultat} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="75%" label={pieLabel}>
                      {stats.parResultat.map((r) => <Cell key={r.name} fill={r.couleur} />)}
                    </Pie>
                    <ChartTooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Graphique>
            </Col>
            <Col xs={24} xl={9}>
              <Graphique titre="Résultats par type de visite">
                <ResponsiveContainer>
                  <BarChart data={stats.parTypeResultat} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {stats.parResultat.map((r) => <Bar key={r.name} dataKey={r.name} stackId="resultats" fill={r.couleur} />)}
                  </BarChart>
                </ResponsiveContainer>
              </Graphique>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}

export default SyntheseVisites;

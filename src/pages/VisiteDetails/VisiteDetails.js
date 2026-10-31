import { Button, Card, Col, Descriptions, Flex, Result, Row, Space, Tag, Typography } from 'antd'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { SafetyOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import NotSpecified from '../../components/common/NotSpecified/NotSpecified';
import { formatDate } from '../../utils/helpers';
import BackButton from '../../components/common/BackButton/BackButton';
import { LOGO_BROWN } from '../../constants/app.constants';
import { NATURES_VISITE, dureeVisite, formatHeure, listeIntervenants } from '../../components/specific/AddVisite/AddVisite';

const { Title, Paragraph } = Typography;

const Bloc = ({ titre, valeur }) => (
  <div style={{ marginBottom: 12 }}>
    <Typography.Text type="secondary">{titre}</Typography.Text>
    <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{valeur || <NotSpecified />}</Paragraph>
  </div>
);

function VisiteDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const visite = state?.visite;

  // Accès direct à l'URL ou rafraîchissement : la visite n'est plus transmise
  if (!visite) {
    return (
      <Card>
        <Result
          status="warning"
          title="Visite introuvable"
          subTitle="Ouvrez la visite depuis la liste des visites des lieux."
          extra={<Button type="primary" onClick={() => navigate("/espace-medical/visites")}>Retour à la liste</Button>}
        />
      </Card>
    );
  }

  const nature = NATURES_VISITE[visite.nature_visite];

  return (
    <Card>
      <BackButton />
      <Flex align="center" gap={12} wrap="wrap" style={{ margin: "16px 0" }}>
        <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>{visite.lieu_visite}</Title>
        <Tag color={nature?.color}>{nature?.label || visite.nature_visite}</Tag>
      </Flex>

      <Descriptions column={{ xs: 1, sm: 2 }} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Date de la visite">
          {visite.date_visite ? formatDate(visite.date_visite) : <NotSpecified />}
        </Descriptions.Item>
        <Descriptions.Item label="N° visite">{visite.num_visite}</Descriptions.Item>
        <Descriptions.Item label="Horaire">
          {visite.heure_debut || visite.heure_fin
            ? <>
                {formatHeure(visite.heure_debut) || "?"} – {formatHeure(visite.heure_fin) || "?"}
                {dureeVisite(visite.heure_debut, visite.heure_fin) && <Tag color="blue" style={{ marginInlineStart: 8 }}>{dureeVisite(visite.heure_debut, visite.heure_fin)}</Tag>}
              </>
            : <NotSpecified />}
        </Descriptions.Item>
        <Descriptions.Item label="Effectuée par">
          {listeIntervenants(visite.intervenants).length
            ? <Space size={4} wrap>{listeIntervenants(visite.intervenants).map((nom) => <Tag key={nom} icon={<UserOutlined />}>{nom}</Tag>)}</Space>
            : <NotSpecified />}
        </Descriptions.Item>
      </Descriptions>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small" title={<><WarningOutlined style={{ color: "#fa8c16" }} /> Risques et problèmes</>} style={{ height: "100%" }}>
            <Bloc titre="Risques identifiés" valeur={visite.risques} />
            <Bloc titre="Problèmes liés" valeur={visite.problemes} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" title={<><SafetyOutlined style={{ color: "#52c41a" }} /> Mesures et préventions</>} style={{ height: "100%" }}>
            <Bloc titre="Mesures individuelles" valeur={visite.mesures_ind} />
            <Bloc titre="Mesures collectives" valeur={visite.mesures_col} />
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default VisiteDetails

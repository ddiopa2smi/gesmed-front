import React, { useEffect, useState } from "react";
import { Card, Col, Empty, Flex, Progress, Row, Skeleton, Space, Typography, theme } from "antd";
import {
  CalendarOutlined,
  FileDoneOutlined,
  FireOutlined,
  ProfileOutlined,
  SolutionOutlined,
  TeamOutlined,
  ExperimentOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { Evolution, IndicatorRow, KpiCard } from "../../common/KpiCard/KpiCard";
import { getResultatTdr } from "../../../utils/tdr";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import RvList from "../RvList/RvList";
import { ServiceType } from "../../../utils/types/types.ts";
import AnalysesList from "../AnalysesList/AnalysesList";
import RadiologiesList from "../RadiologiesList/RadiologiesList.js";
import useFetch from "../../../utils/hooks/useFetch";
import { getActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { codeServices, LOGO_BROWN } from "../../../constants/app.constants.js";

const { Text, Title } = Typography;

// Période "ce mois" des listes de consultations / rendez-vous
const PERIODE_MOIS = 5;
const SEUIL_FIEVRE = 37.5;

const isSameDay = (value, day) => value && dayjs(value).isSame(day, "day");

// Racine des routes de chaque espace (liens "Voir plus" des cartes)
const BASE_PATH_PAR_TYPE = {
  [ServiceType.ACCUEIL]: "/espace-accueil",
  [ServiceType.MEDICAL]: "/espace-medical",
  [ServiceType.DENTAIRE]: "/espace-dentist",
  [ServiceType.GYNECOLOGIE]: "/espace-gynecologie",
  [ServiceType.ANALYSE]: "/espace-analyse",
  [ServiceType.ANALYSE_BIO_MEDICAL]: "/espace-analyse",
  [ServiceType.RADIOLOGIE]: "/espace-radiologie",
  [ServiceType.HOSPITALISATION]: "/espace-hospitalisation",
  [ServiceType.INFIRMERIE]: "/espace-infirmerie",
};

// Code du service (champ code_serv des rendez-vous) pour chaque espace
const CODE_SERVICE_PAR_TYPE = {
  [ServiceType.MEDICAL]: codeServices.MEDICAL,
  [ServiceType.DENTAIRE]: codeServices.DENTAIRE,
  [ServiceType.GYNECOLOGIE]: codeServices.GYNECOLOGIE,
  [ServiceType.ANALYSE]: codeServices.BIO_MEDICAL,
  [ServiceType.ANALYSE_BIO_MEDICAL]: codeServices.BIO_MEDICAL,
  [ServiceType.RADIOLOGIE]: codeServices.RADIOLOGIE,
  [ServiceType.HOSPITALISATION]: codeServices.HOSPITALISATION,
  [ServiceType.INFIRMERIE]: codeServices.INFIRMERIE,
};

function DashboardComponent({ serviceType, title }) {
  const { token } = theme.useToken();
  const basePath = BASE_PATH_PAR_TYPE[serviceType];

  const { data: consultations, isLoading: consultationsLoading } = useFetch(endpoints.consultations.LIST(PERIODE_MOIS));
  const { data: rendezVous, isLoading: rendezVousLoading } = useFetch(endpoints.rendezVous.LIST(PERIODE_MOIS));

  // Nombre total de patients : l'API paginée renvoie le total sans charger toute la table
  const [totalPatients, setTotalPatients] = useState(null);
  useEffect(() => {
    getActions(endpoints.patients.LIST({ page: 0, size: 1 }))
      .then((response) => setTotalPatients(response?.data?.totalElements ?? 0))
      .catch(() => setTotalPatients(0));
  }, []);

  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  // Filtre par service : les rendez-vous portent leur service (code_serv) ;
  // une consultation est rattachée au service de son rendez-vous (numrv).
  const codeService = CODE_SERVICE_PAR_TYPE[serviceType];
  const listRv = (rendezVous || []).filter((rv) => !codeService || rv.code_serv === codeService);
  const rvDuService = new Set(listRv.map((rv) => rv.num_ordre));
  const listCons = (consultations || []).filter((c) => !codeService || rvDuService.has(c.numrv));

  // Indicateurs du jour
  const rvToday = listRv.filter((rv) => isSameDay(rv.date_rv, today));
  const rvEffectues = rvToday.filter((rv) => rv.effectue).length;
  const consToday = listCons.filter((c) => isSameDay(c.datecons, today)).length;
  const consYesterday = listCons.filter((c) => isSameDay(c.datecons, yesterday)).length;

  // Indicateurs du mois
  const consValidees = listCons.filter((c) => c.medecin !== null && c.medecin !== undefined).length;
  const tauxValidation = listCons.length ? Math.round((consValidees / listCons.length) * 100) : 0;
  const patientsVus = new Set(listCons.map((c) => c.numpat)).size;
  const nbFievres = listCons.filter((c) => c.temp > SEUIL_FIEVRE).length;
  const nbTdrPositifs = listCons.filter((c) => getResultatTdr(c) === "positif").length;
  const nbRepos = listCons.filter((c) => c.nb_jours_rm > 0).length;

  // Activité jour par jour depuis le début du mois
  const activite = Array.from({ length: today.date() }, (_, index) => {
    const day = today.startOf("month").add(index, "day");
    return {
      jour: day.format("DD/MM"),
      "Rendez-vous": listRv.filter((rv) => isSameDay(rv.date_rv, day)).length,
      Consultations: listCons.filter((c) => isSameDay(c.datecons, day)).length,
    };
  });

  // Médecins les plus actifs du mois
  const parMedecin = Object.entries(
    listCons.reduce((acc, c) => {
      if (c.medecin) acc[c.medecin] = (acc[c.medecin] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxMedecin = parMedecin[0]?.[1] || 1;

  // Sans filtre (accueil) : répartition des rendez-vous du mois par service
  const parService = Object.entries(
    listRv.reduce((acc, rv) => {
      const service = rv.service_medical || rv.code_serv || "Non renseigné";
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const loading = consultationsLoading || rendezVousLoading;
  const moisCourant = today.format("MMMM YYYY");

  return (
    <div>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>{title}</Title>
          <Text type="secondary" style={{ textTransform: "capitalize" }}>{today.format("dddd DD MMMM YYYY")}</Text>
        </div>
      )}

      {/* Indicateurs clés */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<CalendarOutlined />}
            color={token.colorPrimary}
            label="Rendez-vous du jour"
            value={rvToday.length}
            loading={rendezVousLoading}
            footer={<Text type="secondary"><Text strong>{rvEffectues}</Text> effectué(s) · <Text strong>{rvToday.length - rvEffectues}</Text> en attente</Text>}
            link={basePath && `${basePath}/rendez-vous`}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<SolutionOutlined />}
            color="#fa8c16"
            label="Consultations du jour"
            value={consToday}
            loading={consultationsLoading}
            footer={<Evolution current={consToday} previous={consYesterday} label="hier" />}
            link={basePath && serviceType !== ServiceType.ACCUEIL ? `${basePath}/consultations` : undefined}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<ProfileOutlined />}
            color={token.colorSuccess}
            label="Consultations du mois"
            value={listCons.length}
            loading={consultationsLoading}
            footer={<Text type="secondary"><Text strong>{tauxValidation} %</Text> validées</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<TeamOutlined />}
            color="#722ed1"
            label="Patients vus ce mois"
            value={patientsVus}
            loading={consultationsLoading}
            footer={
              <Text type="secondary">
                sur <Text strong>{totalPatients === null ? "…" : totalPatients.toLocaleString("fr-FR")}</Text> patients enregistrés
              </Text>
            }
            link={basePath && `${basePath}/patients`}
          />
        </Col>
      </Row>

      <br />

      {/* Liste de travail du service */}
      {serviceType === ServiceType.ANALYSE_BIO_MEDICAL ? (
        <AnalysesList />
      ) : serviceType === ServiceType.RADIOLOGIE ? (
        <RadiologiesList />
      ) : (
        <RvList serviceType={serviceType} today />
      )}

      <br />

      {/* Activité et synthèse du mois */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Activité du mois"
            extra={<Text type="secondary" style={{ textTransform: "capitalize" }}>{moisCourant}</Text>}
            style={{ height: "100%" }}
          >
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={activite} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fa8c16" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#fa8c16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Rendez-vous" stroke={token.colorPrimary} strokeWidth={2} fill="url(#gradRv)" />
                  <Area type="monotone" dataKey="Consultations" stroke="#fa8c16" strokeWidth={2} fill="url(#gradCons)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {!codeService && (
              <Card title="Rendez-vous par service" extra={<Text type="secondary">ce mois</Text>}>
                {loading ? <Skeleton active /> : parService.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun rendez-vous ce mois" />
                ) : (
                  parService.map(([service, count]) => (
                    <div key={service} style={{ marginBottom: 10 }}>
                      <Flex justify="space-between">
                        <Text style={{ textTransform: "capitalize" }}>{service.toLowerCase()}</Text>
                        <Text strong>{count} <Text type="secondary" style={{ fontWeight: 400 }}>({Math.round((count / listRv.length) * 100)} %)</Text></Text>
                      </Flex>
                      <Progress percent={Math.round((count / listRv.length) * 100)} showInfo={false} size="small" strokeColor={LOGO_BROWN} />
                    </div>
                  ))
                )}
              </Card>
            )}

            <Card title="Médecins les plus actifs" extra={<Text type="secondary">ce mois</Text>}>
              {loading ? <Skeleton active /> : parMedecin.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune consultation ce mois" />
              ) : (
                parMedecin.map(([medecin, count]) => (
                  <div key={medecin} style={{ marginBottom: 10 }}>
                    <Flex justify="space-between">
                      <Text>{medecin}</Text>
                      <Text strong>{count}</Text>
                    </Flex>
                    <Progress percent={Math.round((count / maxMedecin) * 100)} showInfo={false} size="small" strokeColor={token.colorPrimary} />
                  </div>
                ))
              )}
            </Card>

            <Card title="Indicateurs cliniques" extra={<Text type="secondary">ce mois</Text>}>
              {loading ? <Skeleton active /> : (
                <>
                  <IndicatorRow icon={<FireOutlined />} color={token.colorError} label={`Fièvres (> ${SEUIL_FIEVRE} °C)`} value={nbFievres} />
                  <IndicatorRow icon={<ExperimentOutlined />} color="#eb2f96" label="TDR positifs" value={nbTdrPositifs} />
                  <IndicatorRow icon={<CoffeeOutlined />} color="#13c2c2" label="Repos médicaux prescrits" value={nbRepos} />
                  <IndicatorRow icon={<FileDoneOutlined />} color={token.colorSuccess} label="Consultations validées" value={`${consValidees} / ${listCons.length}`} />
                </>
              )}
            </Card>
          </Space>
        </Col>
      </Row>

      <br />
    </div>
  );
}

export default DashboardComponent;

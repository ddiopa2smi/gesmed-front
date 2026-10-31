import React, { useState } from "react";
import { Card, Col, DatePicker, Empty, Flex, Progress, Row, Skeleton, Space, Tag, Typography, theme } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
import { LOGO_BROWN } from "../../../constants/app.constants.js";
import { Evolution, IndicatorRow, KpiCard } from "../../common/KpiCard/KpiCard";
import PeriodeSelect from "../../common/PeriodeSelect/PeriodeSelect";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// Périodes des listes de prescriptions (mêmes codes que l'API, cf. periodeOptions)
const PERIODE_MOIS = 5;
const PERIODE_DATE_A_DATE = 9;

/**
 * Bornes [début, fin] d'une période (mêmes règles que l'API : semaine du lundi au dimanche),
 * son libellé ("ce mois-ci", "du 01/10 au 15/10"...) et si elle contient aujourd'hui.
 */
const decrirePeriode = (periode, plage) => {
  const today = dayjs();
  const p = {
    1: [today.startOf("day"), today.endOf("day"), "aujourd'hui"],
    2: [today.subtract(1, "day").startOf("day"), today.subtract(1, "day").endOf("day"), "hier"],
    3: [today.startOf("week"), today.endOf("week"), "cette semaine"],
    4: [today.subtract(1, "week").startOf("week"), today.subtract(1, "week").endOf("week"), "la semaine dernière"],
    5: [today.startOf("month"), today.endOf("month"), `ce mois-ci (${today.format("MMMM YYYY")})`],
    6: [today.subtract(1, "month").startOf("month"), today.subtract(1, "month").endOf("month"), `le mois dernier (${today.subtract(1, "month").format("MMMM YYYY")})`],
    7: [today.startOf("year"), today.endOf("year"), `cette année (${today.year()})`],
    8: [today.subtract(1, "year").startOf("year"), today.subtract(1, "year").endOf("year"), `l'année dernière (${today.year() - 1})`],
  }[periode];
  if (periode === PERIODE_DATE_A_DATE) {
    if (!plage?.[0] || !plage?.[1]) return null;
    const [debut, fin] = [plage[0].startOf("day"), plage[1].endOf("day")];
    return { debut, fin, libelle: `du ${debut.format("DD/MM/YYYY")} au ${fin.format("DD/MM/YYYY")}`, inclutAujourdhui: !today.isBefore(debut) && !today.isAfter(fin) };
  }
  const [debut, fin, libelle] = p || [];
  return { debut, fin, libelle, inclutAujourdhui: !today.isBefore(debut) && !today.isAfter(fin) };
};

const isSameDay = (value, day) => value && dayjs(value).isSame(day, "day");

// Durée lisible à partir d'un nombre de minutes
const formatDuree = (minutes) => {
  if (minutes === null) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 60 * 24) return `${(minutes / 60).toFixed(1).replace(".", ",")} h`;
  return `${(minutes / 60 / 24).toFixed(1).replace(".", ",")} j`;
};

// Libellé d'indicateur sur deux lignes : intitulé, puis période concernée
const LibelleKpi = ({ titre, periode }) => (
  <span style={{ display: "block", lineHeight: 1.35 }}>
    {titre}
    <span style={{ display: "block", fontSize: 11, fontStyle: "italic" }}>{periode}</span>
  </span>
);

const TopList = ({ items, color, emptyText }) => {
  if (items.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
  const max = items[0][1] || 1;
  return items.map(([label, count]) => (
    <div key={label} style={{ marginBottom: 10 }}>
      <Flex justify="space-between" gap={8}>
        <Text ellipsis={{ tooltip: label }} style={{ maxWidth: "80%" }}>{label}</Text>
        <Text strong>{count}</Text>
      </Flex>
      <Progress percent={Math.round((count / max) * 100)} showInfo={false} size="small" strokeColor={color} />
    </div>
  ));
};

/**
 * Tableau de bord des espaces qui traitent des prescriptions (analyses, pharmacie...).
 *
 * codepresc : type de prescription suivi (codesPrescriptions.ANA, .ORD...)
 * labels : libellés propres à l'espace ({ singulier, pluriel, actes, traitees })
 * withStock : ajoute les indicateurs de stock et de commandes (pharmacie)
 * withResultats : ajoute l'indicateur des résultats déposés (analyses, imagerie)
 * workList : liste de travail affichée sous les indicateurs
 */
function PrescriptionsDashboard({ codepresc, title, labels, withStock = false, withResultats = false, workList, basePath }) {
  const { token } = theme.useToken();

  // Période analysée par les indicateurs (par défaut : le mois en cours)
  const [periode, setPeriode] = useState(PERIODE_MOIS);
  const [plage, setPlage] = useState(null);
  const infosPeriode = decrirePeriode(periode, plage);
  const libellePeriode = infosPeriode?.libelle || "période à préciser";

  // En "date à date", rien n'est chargé tant que les deux dates ne sont pas choisies
  const urlListe = (etat) => {
    if (periode !== PERIODE_DATE_A_DATE) return endpoints.prescriptions.LIST(periode, etat);
    return infosPeriode ? endpoints.prescriptions.LIST_BY_DATE(infosPeriode.debut.format("YYYY-MM-DD"), infosPeriode.fin.format("YYYY-MM-DD"), etat) : null;
  };

  const { data: enAttenteData, isLoading: enAttenteLoading, onRefresh: refreshEnAttente } = useFetch(urlListe("Non"));
  const { data: clotureesData, isLoading: clotureesLoading, onRefresh: refreshCloturees } = useFetch(urlListe("Oui"));
  const { data: stock, isLoading: stockLoading, onRefresh: refreshStock } = useFetch(withStock ? endpoints.situation_stock.LIST : null);
  const { data: commandes, isLoading: commandesLoading } = useFetch(withStock ? endpoints.commande_produit.LIST : null);

  // Recalcule les indicateurs après une action dans la liste de travail (service d'une ordonnance...)
  const refreshIndicateurs = () => {
    refreshEnAttente();
    refreshCloturees();
    if (withStock) refreshStock();
  };

  const today = dayjs();
  const yesterday = today.subtract(1, "day");
  const enAttente = (enAttenteData || []).filter((p) => p.codepresc === codepresc);
  const cloturees = (clotureesData || []).filter((p) => p.codepresc === codepresc);
  const toutes = [...enAttente, ...cloturees];
  const loading = enAttenteLoading || clotureesLoading;

  // Indicateurs du jour
  const recuesToday = toutes.filter((p) => isSameDay(p.datepresc, today)).length;
  const enAttenteToday = enAttente.filter((p) => isSameDay(p.datepresc, today)).length;
  const traiteesToday = cloturees.filter((p) => isSameDay(p.date_effet, today)).length;
  const traiteesYesterday = cloturees.filter((p) => isSameDay(p.date_effet, yesterday)).length;

  // Délai moyen entre la prescription et sa clôture
  const delais = cloturees
    .filter((p) => p.date_effet && p.datepresc)
    .map((p) => dayjs(p.date_effet).diff(dayjs(p.datepresc), "minute"))
    .filter((minutes) => minutes >= 0);
  const delaiMoyen = delais.length ? delais.reduce((a, b) => a + b, 0) / delais.length : null;

  const avecResultat = cloturees.filter((p) => p.resultat).length;
  const tauxResultat = cloturees.length ? Math.round((avecResultat / cloturees.length) * 100) : 0;
  const nbExternes = toutes.filter((p) => p.type_prescription === "Externe").length;

  // Stock (pharmacie)
  const produits = stock || [];
  const ruptures = produits.filter((p) => (p.qte_stock_th || 0) <= 0);
  const sousSeuil = produits.filter((p) => p.qte_stock_mini > 0 && p.qte_stock_th > 0 && p.qte_stock_th <= p.qte_stock_mini);
  const commandesEnCours = (commandes || []).filter((c) => c.etat !== "received");
  const montantCommandes = commandesEnCours.reduce((acc, c) => acc + (c.montant_bc || 0), 0);

  // Activité sur la période : par jour, ou par mois au-delà de deux mois (année...).
  // La période en cours s'arrête à aujourd'hui (pas de jours futurs vides).
  const parMois = infosPeriode ? infosPeriode.fin.diff(infosPeriode.debut, "day") > 62 : false;
  const uniteActivite = parMois ? "month" : "day";
  const finActivite = infosPeriode && (infosPeriode.fin.isAfter(today) ? today : infosPeriode.fin);
  const activite = [];
  if (infosPeriode) {
    for (let pas = infosPeriode.debut.startOf(uniteActivite); !pas.isAfter(finActivite, uniteActivite); pas = pas.add(1, uniteActivite)) {
      const courant = pas;
      activite.push({
        jour: parMois ? courant.format("MMM YY") : courant.format("DD/MM"),
        Reçues: toutes.filter((p) => p.datepresc && dayjs(p.datepresc).isSame(courant, uniteActivite)).length,
        [labels.traitees]: cloturees.filter((p) => p.date_effet && dayjs(p.date_effet).isSame(courant, uniteActivite)).length,
      });
    }
  }

  // Actes / médicaments les plus demandés
  const topActes = Object.entries(
    toutes.reduce((acc, p) => {
      (p.listActes || []).forEach((acte) => {
        if (acte.libacte) acc[acte.libacte] = (acc[acte.libacte] || 0) + (acte.qte || 1);
      });
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const topPrescripteurs = Object.entries(
    toutes.reduce((acc, p) => {
      if (p.prescripteur) acc[p.prescripteur] = (acc[p.prescripteur] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      {/* En-tête : titre + choix de la période analysée par les indicateurs */}
      <Flex justify="space-between" align="flex-end" wrap gap={12} style={{ marginBottom: 16 }}>
        <div>
          {title && <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>{title}</Title>}
          <Text type="secondary" style={{ textTransform: "capitalize" }}>{today.format("dddd DD MMMM YYYY")}</Text>
        </div>
        <Space wrap>
          <Text type="secondary">Indicateurs sur :</Text>
          <PeriodeSelect value={periode} onChange={setPeriode} />
          {periode === PERIODE_DATE_A_DATE && (
            <RangePicker
              format="DD/MM/YYYY"
              value={plage}
              onChange={setPlage}
              disabledDate={(date) => date && date.isAfter(dayjs(), "day")}
            />
          )}
        </Space>
      </Flex>

      {/* Indicateurs clés */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<ClockCircleOutlined />}
            color={token.colorWarning}
            label={<LibelleKpi titre={`${labels.pluriel} en attente`} periode={`prescrites ${libellePeriode}`} />}
            value={enAttente.length}
            loading={enAttenteLoading}
            footer={infosPeriode?.inclutAujourdhui
              ? <Text type="secondary">dont <Text strong>{enAttenteToday}</Text> reçue(s) aujourd'hui</Text>
              : <Text type="secondary">non encore {labels.traitees.toLowerCase()}</Text>}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          {/* Période contenant aujourd'hui : activité du jour ; sinon total de la période */}
          {infosPeriode?.inclutAujourdhui ? (
            <KpiCard
              icon={<CheckCircleOutlined />}
              color={token.colorSuccess}
              label={`${labels.traitees} aujourd'hui`}
              value={traiteesToday}
              loading={clotureesLoading}
              footer={<Evolution current={traiteesToday} previous={traiteesYesterday} label="hier" />}
            />
          ) : (
            <KpiCard
              icon={<CheckCircleOutlined />}
              color={token.colorSuccess}
              label={<LibelleKpi titre={labels.traitees} periode={libellePeriode} />}
              value={cloturees.length}
              loading={clotureesLoading}
              footer={<Text type="secondary">sur <Text strong>{toutes.length}</Text> reçue(s) sur la période</Text>}
            />
          )}
        </Col>
        {withStock ? (
          <>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard
                icon={<WarningOutlined />}
                color={token.colorError}
                label="Produits en rupture"
                value={ruptures.length}
                loading={stockLoading}
                footer={<Text type="secondary"><Text strong>{sousSeuil.length}</Text> sous le seuil minimum · {produits.length} produits</Text>}
                link={basePath && `${basePath}/situation-stocks`}
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard
                icon={<ShoppingCartOutlined />}
                color={token.colorPrimary}
                label="Commandes en cours"
                value={commandesEnCours.length}
                loading={commandesLoading}
                footer={<Text type="secondary"><Text strong>{montantCommandes.toLocaleString("fr-FR")}</Text> FCFA</Text>}
                link={basePath && `${basePath}/commandes-produits`}
              />
            </Col>
          </>
        ) : (
          <>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard
                icon={<FileDoneOutlined />}
                color={token.colorPrimary}
                label="Résultats déposés"
                value={avecResultat}
                loading={clotureesLoading}
                footer={<Text type="secondary"><Text strong>{tauxResultat} %</Text> des {labels.pluriel.toLowerCase()} clôturées {libellePeriode}</Text>}
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <KpiCard
                icon={<FieldTimeOutlined />}
                color="#722ed1"
                label="Délai moyen de traitement"
                value={formatDuree(delaiMoyen)}
                loading={clotureesLoading}
                footer={<Text type="secondary">prescription → clôture, {libellePeriode}</Text>}
              />
            </Col>
          </>
        )}
      </Row>

      <br />

      {workList && React.cloneElement(workList, { onDataChange: refreshIndicateurs })}

      <br />

      {/* Activité et synthèse de la période choisie */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={parMois ? "Activité par mois" : "Activité par jour"}
            extra={<Tag color="processing" style={{ marginInlineEnd: 0 }}>{libellePeriode}</Tag>}
            style={{ height: "100%" }}
          >
            {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={activite} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRecues" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTraitees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={token.colorSuccess} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={token.colorSuccess} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={token.colorBorderSecondary} />
                  <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Reçues" stroke={token.colorPrimary} strokeWidth={2} fill="url(#gradRecues)" />
                  <Area type="monotone" dataKey={labels.traitees} stroke={token.colorSuccess} strokeWidth={2} fill="url(#gradTraitees)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card title={`${labels.actes} les plus demandés`} extra={<Text type="secondary">{libellePeriode}</Text>}>
              {loading ? <Skeleton active /> : (
                <TopList items={topActes} color={token.colorPrimary} emptyText="Aucune prescription sur la période" />
              )}
            </Card>

            <Card title="Synthèse de la période" extra={<Text type="secondary">{libellePeriode}</Text>}>
              {loading ? <Skeleton active /> : (
                <>
                  <IndicatorRow icon={<InboxOutlined />} color={token.colorPrimary} label={`${labels.pluriel} reçues`} value={toutes.length} />
                  <IndicatorRow icon={<CheckCircleOutlined />} color={token.colorSuccess} label={labels.traitees} value={cloturees.length} />
                  {infosPeriode?.inclutAujourdhui
                    ? <IndicatorRow icon={<ClockCircleOutlined />} color={token.colorWarning} label="Reçues aujourd'hui" value={recuesToday} />
                    : <IndicatorRow icon={<ClockCircleOutlined />} color={token.colorWarning} label="En attente" value={enAttente.length} />}
                  <Flex justify="space-between" align="center" style={{ paddingTop: 8 }}>
                    <Text type="secondary">Origine</Text>
                    <Space size={4}>
                      <Tag color="blue">Internes {toutes.length - nbExternes}</Tag>
                      <Tag color="purple">Externes {nbExternes}</Tag>
                    </Space>
                  </Flex>
                </>
              )}
            </Card>

            <Card title="Principaux prescripteurs" extra={<Text type="secondary">{libellePeriode}</Text>}>
              {loading ? <Skeleton active /> : (
                <TopList items={topPrescripteurs} color={LOGO_BROWN} emptyText="Aucune prescription sur la période" />
              )}
            </Card>

            {withStock && sousSeuil.length > 0 && (
              <Card title="Produits sous le seuil minimum">
                {sousSeuil.slice(0, 6).map((p) => (
                  <Flex key={p.code_produit} justify="space-between" style={{ padding: "4px 0" }}>
                    <Text ellipsis={{ tooltip: p.libelle_produit }} style={{ maxWidth: "75%" }}>{p.libelle_produit}</Text>
                    <Text type="warning" strong>{p.qte_stock_th} / {p.qte_stock_mini}</Text>
                  </Flex>
                ))}
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      <br />
    </div>
  );
}

export default PrescriptionsDashboard;

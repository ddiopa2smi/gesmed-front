import React, { useState } from "react";
import { Button, Empty, Flex, Input, Popconfirm, Select, Space, Tag, Tooltip, Typography } from "antd";
import { CheckOutlined, DeleteOutlined, PlusOutlined, RollbackOutlined, ThunderboltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ACTES_DENTAIRES, PRIORITES, trouverActe } from "../../../utils/dentaire";

const { Text } = Typography;

const OPTIONS_ACTES = ACTES_DENTAIRES.map((g) => ({ label: g.groupe, options: g.actes.map((a) => ({ value: a.value, label: a.value })) }));
const FORMULAIRE_VIDE = { acte: undefined, priorite: 2, observation: "" };

const libelleDents = (dents) => (dents ? `Dent${dents.includes(",") ? "s" : ""} ${dents.split(",").join(", ")}` : "Bouche entière");

const LigneSoin = ({ soin, lectureSeule, actions }) => {
  const priorite = PRIORITES.find((p) => p.value === soin.priorite);
  return (
    <Flex justify="space-between" align="center" gap={8} style={{ padding: "7px 0", borderBottom: "1px solid #0000000f" }}>
      <div style={{ minWidth: 0 }}>
        <Text strong>{soin.acte}</Text>
        {soin.statut === "PLANIFIE" && priorite?.value !== 2 && <Tag color={priorite?.color} style={{ marginInlineStart: 6 }}>{priorite?.label}</Tag>}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {libelleDents(soin.dents)}
            {soin.date_realisation ? ` · ${dayjs(soin.date_realisation).format("DD/MM/YYYY")}` : ""}
            {soin.observation ? ` · ${soin.observation}` : ""}
          </Text>
        </div>
      </div>
      {!lectureSeule && <Space size={2}>{actions}</Space>}
    </Flex>
  );
};

// Plan de traitement : actes à faire, soins de la séance, historique du patient
function PlanTraitement({ soins, numcons, selection, onAjouter, onChangerStatut, onSupprimer, lectureSeule }) {
  const [nouveau, setNouveau] = useState(FORMULAIRE_VIDE);

  const aFaire = soins.filter((s) => s.statut === "PLANIFIE");
  const dujour = soins.filter((s) => s.statut === "REALISE" && (s.numcons === numcons || !s.id));
  const anciens = soins.filter((s) => s.statut === "REALISE" && s.numcons !== numcons && s.id);

  const acte = trouverActe(nouveau.acte);
  const sansDent = !selection.length && !acte?.bouche;

  const ajouter = (statut) => {
    onAjouter({ ...nouveau, statut, dents: selection.join(",") });
    setNouveau(FORMULAIRE_VIDE);
  };

  return (
    <div>
      {!lectureSeule && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selection.length ? libelleDents(selection.join(",")) : "Sélectionnez une ou plusieurs dents (Ctrl + clic), ou un acte de bouche entière"}
          </Text>
          <Select
            showSearch placeholder="Acte" optionFilterProp="label" options={OPTIONS_ACTES} value={nouveau.acte}
            onChange={(value) => setNouveau({ ...nouveau, acte: value })} style={{ width: "100%", margin: "6px 0" }}
          />
          <Flex gap={6}>
            <Select
              value={nouveau.priorite} onChange={(value) => setNouveau({ ...nouveau, priorite: value })} style={{ width: 110 }}
              options={PRIORITES.map((p) => ({ value: p.value, label: p.label }))}
            />
            <Input placeholder="Observation" value={nouveau.observation} onChange={(e) => setNouveau({ ...nouveau, observation: e.target.value })} />
          </Flex>
          <Flex gap={6} style={{ marginTop: 6 }}>
            <Button block icon={<PlusOutlined />} disabled={!nouveau.acte || sansDent} onClick={() => ajouter("PLANIFIE")}>À planifier</Button>
            <Button block type="primary" icon={<CheckOutlined />} disabled={!nouveau.acte || sansDent} onClick={() => ajouter("REALISE")}>Fait ce jour</Button>
          </Flex>
        </div>
      )}

      <Text strong><ThunderboltOutlined /> À faire ({aFaire.length})</Text>
      {aFaire.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun soin planifié" style={{ margin: "8px 0" }} />}
      {aFaire.map((soin) => (
        <LigneSoin
          key={soin.cle} soin={soin} lectureSeule={lectureSeule}
          actions={(
            <>
              <Tooltip title="Marquer comme fait ce jour"><Button type="text" size="small" style={{ color: "#389e0d" }} icon={<CheckOutlined />} onClick={() => onChangerStatut(soin, "REALISE")} /></Tooltip>
              <Popconfirm title="Retirer cet acte du plan ?" okText="Retirer" cancelText="Annuler" onConfirm={() => onSupprimer(soin)}>
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        />
      ))}

      {dujour.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ color: "#389e0d" }}><CheckOutlined /> Fait ce jour ({dujour.length})</Text>
          {dujour.map((soin) => (
            <LigneSoin
              key={soin.cle} soin={soin} lectureSeule={lectureSeule}
              actions={<Tooltip title="Remettre à faire"><Button type="text" size="small" icon={<RollbackOutlined />} onClick={() => onChangerStatut(soin, "PLANIFIE")} /></Tooltip>}
            />
          ))}
        </div>
      )}

      {anciens.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text strong type="secondary">Historique ({anciens.length})</Text>
          {anciens.slice(0, 8).map((soin) => <LigneSoin key={soin.cle} soin={soin} lectureSeule />)}
        </div>
      )}
    </div>
  );
}

export default PlanTraitement;

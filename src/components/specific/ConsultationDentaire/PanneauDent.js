import React from "react";
import { Button, Empty, Flex, Input, Radio, Space, Tag, Timeline, Tooltip, Typography, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DentForme } from "../../common/Odontogramme/Odontogramme";
import { ETATS_DENT, LESIONS_FACE, MOBILITES, decrireDent, dentVierge, ecrireFaces, faceSuivante, lireFaces, nomsFaces } from "../../../utils/dentaire";

const { Text } = Typography;

// Largeur / épaisseur de l'agrandissement : les faces y sont assez grandes pour être cliquées
const TAILLE_ZOOM = 96;

// Détail de la dent sélectionnée : état, faces, mobilité, note et historique des soins
function PanneauDent({ numero, dent, soins, onChange, onFermer, lectureSeule }) {
  const { token } = theme.useToken();

  if (!numero) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Cliquez sur une dent du schéma pour la renseigner" />;
  }

  const valeur = dent || dentVierge(numero);
  const faces = lireFaces(valeur.faces);
  const noms = nomsFaces(numero);
  const modifier = (changements) => onChange(numero, { ...valeur, ...changements });

  const cliquerFace = (face) => {
    const suivante = { ...faces, [face]: faceSuivante(faces[face]) };
    const lesions = Object.values(suivante).filter(Boolean);
    // L'état suit les faces, sauf si la dent porte déjà un état plus précis (couronne, dévitalisée...)
    const etatAuto = lesions.includes("CARIE") ? "CARIEE" : lesions.includes("OBTURATION") ? "OBTUREE" : "SAINE";
    modifier({
      faces: ecrireFaces(suivante),
      etat: ["SAINE", "CARIEE", "OBTUREE"].includes(valeur.etat) ? etatAuto : valeur.etat,
    });
  };

  const historique = soins.filter((s) => s.statut === "REALISE" && (s.dents || "").split(",").includes(String(numero)));

  return (
    <div>
      <Flex justify="space-between" align="flex-start" gap={8}>
        <Text strong style={{ fontSize: 15 }}>{decrireDent(numero)}</Text>
        <Tooltip title="Fermer"><Button type="text" size="small" icon={<CloseOutlined />} onClick={onFermer} /></Tooltip>
      </Flex>

      <Flex align="center" gap={16} wrap style={{ margin: "10px 0" }}>
        <svg viewBox="-70 -70 140 140" width={132} height={132} role="img" aria-label={`Faces de la dent ${numero}`}>
          <text x="0" y="-58" fontSize="11" textAnchor="middle" fill={token.colorTextSecondary}>V</text>
          <text x="0" y="66" fontSize="11" textAnchor="middle" fill={token.colorTextSecondary}>{noms.L[0]}</text>
          <text x="-62" y="4" fontSize="11" textAnchor="middle" fill={token.colorTextSecondary}>M</text>
          <text x="62" y="4" fontSize="11" textAnchor="middle" fill={token.colorTextSecondary}>D</text>
          <DentForme numero={numero < 50 ? 16 : 54} dent={{ ...valeur, etat: valeur.etat === "ABSENTE" ? "SAINE" : valeur.etat }} largeur={TAILLE_ZOOM} epaisseur={TAILLE_ZOOM} distal={1}
            onClickFace={lectureSeule ? undefined : cliquerFace} />
        </svg>
        <div style={{ flex: 1, minWidth: 150 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Cliquez sur une face : carie, obturation, puis saine.</Text>
          <Flex wrap gap={4} style={{ marginTop: 6 }}>
            {Object.entries(faces).map(([face, lesion]) => (
              <Tag key={face} color={lesion === "CARIE" ? "error" : "processing"} style={{ marginInlineEnd: 0 }}>{noms[face]} : {LESIONS_FACE[lesion]?.label}</Tag>
            ))}
            {!Object.keys(faces).length && <Text type="secondary" style={{ fontSize: 12 }}>Aucune lésion</Text>}
          </Flex>
        </div>
      </Flex>

      <Text strong style={{ fontSize: 12 }}>État de la dent</Text>
      <Flex wrap gap={4} style={{ margin: "4px 0 10px" }}>
        {Object.entries(ETATS_DENT).map(([code, etat]) => (
          <Tag.CheckableTag
            key={code} checked={valeur.etat === code}
            onChange={() => !lectureSeule && modifier({ etat: code })}
            style={{ border: `1px solid ${etat.trait}`, marginInlineEnd: 0, cursor: lectureSeule ? "default" : "pointer" }}
          >
            {etat.label}
          </Tag.CheckableTag>
        ))}
      </Flex>

      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Text strong style={{ fontSize: 12 }}>Mobilité</Text>
        <Radio.Group
          size="small" optionType="button" value={valeur.mobilite || 0} disabled={lectureSeule}
          onChange={(e) => modifier({ mobilite: e.target.value })}
          options={MOBILITES.map((m) => ({ value: m.value, label: <Tooltip title={m.detail}>{m.label}</Tooltip> }))}
        />
        <Input.TextArea
          rows={2} placeholder="Note sur cette dent" value={valeur.note || ""} disabled={lectureSeule}
          onChange={(e) => modifier({ note: e.target.value })} style={{ marginTop: 6 }}
        />
      </Space>

      {historique.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ fontSize: 12 }}>Soins déjà réalisés</Text>
          <Timeline
            style={{ marginTop: 8, marginBottom: -24 }}
            items={historique.slice(0, 5).map((s) => ({
              key: s.id,
              color: "green",
              children: <Text style={{ fontSize: 12 }}>{s.acte} <Text type="secondary">· {s.date_realisation ? dayjs(s.date_realisation).format("DD/MM/YYYY") : "aujourd'hui"}</Text></Text>,
            }))}
          />
        </div>
      )}
    </div>
  );
}

export default PanneauDent;

import { Button, Empty, Flex, Select, Space, Tag, Tooltip, Typography, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * Croquis du corps humain (face / dos) permettant de marquer les zones de lésions.
 *
 * value : [{ zone: "MAIN_D", type: "Plaie" }, ...]
 * onChange(value) : appelé à chaque ajout / retrait / changement de type
 * readOnly : affichage seul (dossier, liste des accidents)
 */

export const ZONES_LESIONS = {
    TETE: "Tête (face)",
    CRANE: "Crâne (arrière)",
    COU: "Cou",
    NUQUE: "Nuque",
    EPAULE_D: "Épaule droite",
    EPAULE_G: "Épaule gauche",
    THORAX: "Thorax",
    ABDOMEN: "Abdomen",
    BASSIN: "Bassin",
    DOS_HAUT: "Haut du dos",
    LOMBAIRES: "Lombaires",
    FESSIER: "Fessier",
    BRAS_D: "Bras droit",
    BRAS_G: "Bras gauche",
    AVANT_BRAS_D: "Avant-bras droit",
    AVANT_BRAS_G: "Avant-bras gauche",
    MAIN_D: "Main droite",
    MAIN_G: "Main gauche",
    CUISSE_D: "Cuisse droite",
    CUISSE_G: "Cuisse gauche",
    GENOU_D: "Genou droit",
    GENOU_G: "Genou gauche",
    JAMBE_D: "Jambe droite",
    JAMBE_G: "Jambe gauche",
    MOLLET_D: "Mollet droit",
    MOLLET_G: "Mollet gauche",
    PIED_D: "Pied droit",
    PIED_G: "Pied gauche",
};

export const TYPES_LESIONS = ["Plaie", "Contusion", "Fracture", "Entorse", "Luxation", "Brûlure", "Amputation", "Autre"];

// Formes du croquis. "D"/"G" désignent le côté du patient :
// sur la vue de face, le côté droit du patient est à gauche de l'écran ; sur la vue de dos, à droite.
const shapes = (side) => {
    const [left, right] = side === "face" ? ["D", "G"] : ["G", "D"];
    const isFace = side === "face";
    return [
        { zone: isFace ? "TETE" : "CRANE", el: "ellipse", props: { cx: 80, cy: 32, rx: 20, ry: 24 } },
        { zone: isFace ? "COU" : "NUQUE", el: "rect", props: { x: 70, y: 54, width: 20, height: 14, rx: 4 } },
        { zone: `EPAULE_${left}`, el: "ellipse", props: { cx: 48, cy: 80, rx: 15, ry: 12 } },
        { zone: `EPAULE_${right}`, el: "ellipse", props: { cx: 112, cy: 80, rx: 15, ry: 12 } },
        { zone: isFace ? "THORAX" : "DOS_HAUT", el: "rect", props: { x: 58, y: 70, width: 44, height: 50, rx: 8 } },
        { zone: isFace ? "ABDOMEN" : "LOMBAIRES", el: "rect", props: { x: 59, y: 122, width: 42, height: 40, rx: 6 } },
        { zone: isFace ? "BASSIN" : "FESSIER", el: "rect", props: { x: 57, y: 164, width: 46, height: 28, rx: 8 } },
        { zone: `BRAS_${left}`, el: "rect", props: { x: 32, y: 92, width: 15, height: 50, rx: 7 } },
        { zone: `BRAS_${right}`, el: "rect", props: { x: 113, y: 92, width: 15, height: 50, rx: 7 } },
        { zone: `AVANT_BRAS_${left}`, el: "rect", props: { x: 26, y: 144, width: 14, height: 48, rx: 7 } },
        { zone: `AVANT_BRAS_${right}`, el: "rect", props: { x: 120, y: 144, width: 14, height: 48, rx: 7 } },
        { zone: `MAIN_${left}`, el: "ellipse", props: { cx: 32, cy: 204, rx: 9, ry: 12 } },
        { zone: `MAIN_${right}`, el: "ellipse", props: { cx: 128, cy: 204, rx: 9, ry: 12 } },
        { zone: `CUISSE_${left}`, el: "rect", props: { x: 58, y: 194, width: 21, height: 68, rx: 9 } },
        { zone: `CUISSE_${right}`, el: "rect", props: { x: 81, y: 194, width: 21, height: 68, rx: 9 } },
        { zone: `GENOU_${left}`, el: "ellipse", props: { cx: 68, cy: 271, rx: 10, ry: 9 } },
        { zone: `GENOU_${right}`, el: "ellipse", props: { cx: 92, cy: 271, rx: 10, ry: 9 } },
        { zone: `${isFace ? "JAMBE" : "MOLLET"}_${left}`, el: "rect", props: { x: 60, y: 282, width: 16, height: 70, rx: 8 } },
        { zone: `${isFace ? "JAMBE" : "MOLLET"}_${right}`, el: "rect", props: { x: 84, y: 282, width: 16, height: 70, rx: 8 } },
        { zone: `PIED_${left}`, el: "ellipse", props: { cx: 66, cy: 362, rx: 12, ry: 7 } },
        { zone: `PIED_${right}`, el: "ellipse", props: { cx: 94, cy: 362, rx: 12, ry: 7 } },
    ];
};

// Convertit la valeur enregistrée (chaîne JSON) en tableau, et inversement
export const parseZonesLesions = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

export const serializeZonesLesions = (value) =>
    Array.isArray(value) && value.length ? JSON.stringify(value) : null;

// Croquis en SVG statique (chaîne HTML), utilisé pour l'impression
export const bodyMapSvgMarkup = (lesions, side, width = 150) => {
    const selectedZones = parseZonesLesions(lesions).map((lesion) => lesion.zone);
    const elements = shapes(side).map(({ zone, el, props }) => {
        const selected = selectedZones.includes(zone);
        const attrs = Object.entries(props).map(([key, val]) => `${key}="${val}"`).join(" ");
        return `<${el} ${attrs} fill="${selected ? "#e53935" : "#eeeeee"}" stroke="${selected ? "#b71c1c" : "#9e9e9e"}" stroke-width="1.2"/>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 375" width="${width}">${elements.join("")}</svg>`;
};

const BodyView = ({ side, selectedZones, onToggle, readOnly, size }) => {
    const { token } = theme.useToken();
    return (
        <Flex vertical align="center" gap={4}>
            <svg viewBox="0 0 160 375" width={size} style={{ maxWidth: "100%" }} role="img" aria-label={`Corps vu de ${side}`}>
                {shapes(side).map(({ zone, el: Element, props }) => {
                    const selected = selectedZones.includes(zone);
                    return (
                        <Element
                            key={`${side}-${zone}`}
                            {...props}
                            fill={selected ? token.colorError : token.colorFillSecondary}
                            fillOpacity={selected ? 0.85 : 1}
                            stroke={selected ? token.colorErrorBorderHover : token.colorBorder}
                            strokeWidth={1.2}
                            style={{ cursor: readOnly ? "default" : "pointer", transition: "fill 0.15s" }}
                            onClick={readOnly ? undefined : () => onToggle(zone)}
                        >
                            <title>{ZONES_LESIONS[zone]}</title>
                        </Element>
                    );
                })}
            </svg>
            <Text type="secondary" style={{ fontSize: 12 }}>{side === "face" ? "Face" : "Dos"}</Text>
        </Flex>
    );
};

function BodyMap({ value, onChange, readOnly = false, size = 150 }) {
    const lesions = parseZonesLesions(value);
    const selectedZones = lesions.map((lesion) => lesion.zone);

    const toggleZone = (zone) => {
        const next = selectedZones.includes(zone)
            ? lesions.filter((lesion) => lesion.zone !== zone)
            : [...lesions, { zone, type: undefined }];
        onChange?.(next);
    };

    const setType = (zone, type) => {
        onChange?.(lesions.map((lesion) => (lesion.zone === zone ? { ...lesion, type } : lesion)));
    };

    return (
        <Flex gap={24} wrap align="flex-start">
            <Flex gap={8}>
                <BodyView side="face" selectedZones={selectedZones} onToggle={toggleZone} readOnly={readOnly} size={size} />
                <BodyView side="dos" selectedZones={selectedZones} onToggle={toggleZone} readOnly={readOnly} size={size} />
            </Flex>

            <div style={{ flex: 1, minWidth: 220 }}>
                {!readOnly && (
                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                        Cliquer sur le croquis pour marquer ou retirer une zone.
                    </Text>
                )}
                {lesions.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune zone marquée" />
                ) : (
                    <Space direction="vertical" style={{ width: "100%" }} size={6}>
                        {lesions.map((lesion) =>
                            readOnly ? (
                                <div key={lesion.zone}>
                                    <Tag color="error">{ZONES_LESIONS[lesion.zone] || lesion.zone}</Tag>
                                    {lesion.type && <Text>{lesion.type}</Text>}
                                </div>
                            ) : (
                                <Flex key={lesion.zone} align="center" gap={8}>
                                    <Tag color="error" style={{ minWidth: 130, marginInlineEnd: 0 }}>
                                        {ZONES_LESIONS[lesion.zone] || lesion.zone}
                                    </Tag>
                                    <Select
                                        size="small"
                                        allowClear
                                        placeholder="Type de lésion"
                                        value={lesion.type}
                                        onChange={(type) => setType(lesion.zone, type)}
                                        options={TYPES_LESIONS.map((type) => ({ value: type, label: type }))}
                                        style={{ flex: 1, minWidth: 130 }}
                                    />
                                    <Tooltip title="Retirer">
                                        <Button size="small" type="text" danger icon={<CloseOutlined />} onClick={() => toggleZone(lesion.zone)} />
                                    </Tooltip>
                                </Flex>
                            )
                        )}
                    </Space>
                )}
            </div>
        </Flex>
    );
}

export default BodyMap;

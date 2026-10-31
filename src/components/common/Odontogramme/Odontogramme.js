import React, { useMemo } from "react";
import { ETATS_DENT, LESIONS_FACE, decrireDent, dentsDeLaDenture, estDentLait, estMaxillaire, lireFaces } from "../../../utils/dentaire";

/**
 * Schéma de la bouche vue de face, bouche ouverte : arcade maxillaire en haut, mandibule en bas.
 * Le côté droit du patient est à gauche de l'écran, comme pour un praticien face à son patient.
 *
 * dents : { 16: { etat, faces, mobilite } }, seules les dents renseignées y figurent
 * selection : numéros sélectionnés ; planifiees : numéros ayant un soin à faire
 * onClickDent(numero, evenement) : absent = affichage seul (impression, consultation clôturée)
 *
 * Aucune dépendance au thème : le même rendu sert à l'écran et à l'impression.
 */

const LARGEUR = 640;
const HAUTEUR = 780;
const CENTRE_X = LARGEUR / 2;
const CENTRE_Y = HAUTEUR / 2;

// Part de l'ellipse occupée par chaque quadrant : les arcades ne se touchent pas au fond de la bouche
const ANGLE_QUADRANT = Math.PI * 0.46;

// Arcades : demi-ellipses dont les dents suivent le contour, de l'incisive centrale à la dernière molaire
const ARCADE_ADULTE = { a: 234, b: 268, ecart: 42, echelle: 1 };
const ARCADE_LAIT = { a: 150, b: 176, ecart: 42, echelle: 0.72 };
const ARCADE_ENFANT = { a: 200, b: 232, ecart: 42, echelle: 1.25 };

// [largeur, épaisseur] de la dent, en vue occlusale
const FORMES_PERMANENTES = [[42, 30], [34, 28], [36, 36], [36, 36], [36, 36], [50, 48], [48, 46], [44, 42]];
const FORMES_LAIT = [[38, 28], [32, 26], [36, 34], [46, 42], [50, 46]];

const point = (arcade, theta, signe, haut) => ({
    x: CENTRE_X + signe * arcade.a * Math.sin(theta),
    y: haut ? CENTRE_Y - arcade.ecart - arcade.b * Math.cos(theta) : CENTRE_Y + arcade.ecart + arcade.b * Math.cos(theta),
});

// Répartit les dents d'un quadrant le long de l'arcade, à intervalles proportionnels à leur largeur
const placerQuadrant = (quadrant, formes, arcade) => {
    const signe = quadrant % 4 === 1 || quadrant % 4 === 0 ? -1 : 1;
    const haut = [1, 2, 5, 6].includes(quadrant);
    const sommeLargeurs = formes.reduce((total, [largeur]) => total + largeur, 0);
    let cumul = 0;

    return formes.map(([largeur, epaisseur], i) => {
        const theta = ((cumul + largeur / 2) / sommeLargeurs) * ANGLE_QUADRANT;
        cumul += largeur;
        const { x, y } = point(arcade, theta, signe, haut);
        // Normale à l'ellipse, dirigée vers l'extérieur (côté vestibulaire)
        const nx = signe * Math.sin(theta) / arcade.a;
        const ny = (haut ? -1 : 1) * Math.cos(theta) / arcade.b;
        const norme = Math.hypot(nx, ny);
        const normale = { x: nx / norme, y: ny / norme };
        const angle = Math.atan2(normale.x, -normale.y);
        // Sens "vers le fond de la bouche" dans le repère de la dent : la face distale y est orientée
        const tangente = { x: signe * Math.cos(theta), y: (haut ? 1 : -1) * Math.sin(theta) };
        const distal = Math.sign(Math.cos(angle) * tangente.x + Math.sin(angle) * tangente.y) || 1;
        return {
            numero: quadrant * 10 + i + 1,
            x, y,
            angle: (angle * 180) / Math.PI,
            distal,
            largeur: largeur * arcade.echelle,
            epaisseur: epaisseur * arcade.echelle,
            normale,
        };
    });
};

const placerDents = (denture) => {
    const permanentes = [1, 2, 3, 4].flatMap((q) => placerQuadrant(q, FORMES_PERMANENTES, ARCADE_ADULTE));
    if (denture === "adulte") return permanentes;
    const arcadeLait = denture === "enfant" ? ARCADE_ENFANT : ARCADE_LAIT;
    const lait = [5, 6, 7, 8].flatMap((q) => placerQuadrant(q, FORMES_LAIT, arcadeLait));
    return denture === "enfant" ? lait : [...permanentes, ...lait];
};

// Contour arrondi : rectangle à bords très ronds pour les molaires, plus pointu pour les dents antérieures
const contourDent = (largeur, epaisseur, rang) => {
    const l = largeur / 2;
    const e = epaisseur / 2;
    if (rang <= 2) {
        // Incisive : côté vestibulaire large, côté lingual effilé
        return `M ${-l} ${-e * 0.55} Q ${-l} ${-e} ${-l * 0.6} ${-e} L ${l * 0.6} ${-e} Q ${l} ${-e} ${l} ${-e * 0.55}
            Q ${l * 0.8} ${e * 0.75} ${l * 0.3} ${e} L ${-l * 0.3} ${e} Q ${-l * 0.8} ${e * 0.75} ${-l} ${-e * 0.55} Z`;
    }
    if (rang === 3) {
        // Canine : pointe vestibulaire
        return `M 0 ${-e} Q ${l * 0.75} ${-e * 0.8} ${l} ${-e * 0.1} Q ${l * 0.9} ${e * 0.8} 0 ${e} Q ${-l * 0.9} ${e * 0.8} ${-l} ${-e * 0.1} Q ${-l * 0.75} ${-e * 0.8} 0 ${-e} Z`;
    }
    const r = Math.min(l, e) * (rang <= 5 ? 0.75 : 0.5);
    return `M ${-l + r} ${-e} L ${l - r} ${-e} Q ${l} ${-e} ${l} ${-e + r} L ${l} ${e - r} Q ${l} ${e} ${l - r} ${e}
        L ${-l + r} ${e} Q ${-l} ${e} ${-l} ${e - r} L ${-l} ${-e + r} Q ${-l} ${-e} ${-l + r} ${-e} Z`;
};

// Faces de la dent dans son repère : -y vestibulaire, +y linguale/palatine, distal selon le sens du quadrant
const zonesFaces = (largeur, epaisseur, distal) => {
    const l = largeur / 2 + 2;
    const e = epaisseur / 2 + 2;
    const cl = largeur * 0.2;
    const ce = epaisseur * 0.2;
    return {
        V: `${-l},${-e} ${l},${-e} ${cl},${-ce} ${-cl},${-ce}`,
        L: `${-l},${e} ${l},${e} ${cl},${ce} ${-cl},${ce}`,
        D: `${distal * l},${-e} ${distal * l},${e} ${distal * cl},${ce} ${distal * cl},${-ce}`,
        M: `${-distal * l},${-e} ${-distal * l},${e} ${-distal * cl},${ce} ${-distal * cl},${-ce}`,
        O: `${-cl},${-ce} ${cl},${-ce} ${cl},${ce} ${-cl},${ce}`,
    };
};

// Dent seule (schéma de la bouche et agrandissement du panneau de détail)
export const DentForme = ({ numero, dent, largeur, epaisseur, distal, onClickFace, selectionnee }) => {
    const rang = numero % 10;
    const etat = ETATS_DENT[dent?.etat || "SAINE"] || ETATS_DENT.SAINE;
    const code = dent?.etat || "SAINE";
    const contour = contourDent(largeur, epaisseur, estDentLait(numero) && rang >= 4 ? rang + 2 : rang);
    const zones = zonesFaces(largeur, epaisseur, distal);
    const faces = lireFaces(dent?.faces);
    const idClip = `clip-dent-${numero}-${Math.round(largeur)}`;
    const absente = code === "ABSENTE";
    const croix = Math.min(largeur, epaisseur) * 0.32;
    const fond = absente ? "transparent" : etat.couleur;

    return (
        <g>
            <clipPath id={idClip}><path d={contour} /></clipPath>
            <path
                d={contour} fill={fond} stroke={selectionnee ? "#0f6fb5" : etat.trait}
                strokeWidth={selectionnee ? 3 : 1.4} strokeDasharray={absente ? "4 3" : undefined}
            />
            {!absente && (
                <g clipPath={`url(#${idClip})`}>
                    {Object.entries(zones).map(([face, points]) => (
                        <polygon
                            key={face} points={points}
                            fill={LESIONS_FACE[faces[face]]?.couleur || "transparent"}
                            fillOpacity={faces[face] ? 0.85 : 0}
                            stroke="#00000018" strokeWidth={0.8}
                            style={onClickFace ? { cursor: "pointer", pointerEvents: "all" } : undefined}
                            onClick={onClickFace ? (e) => { e.stopPropagation(); onClickFace(face); } : undefined}
                        />
                    ))}
                </g>
            )}
            {code === "A_EXTRAIRE" && (
                <path d={`M ${-croix} ${-croix} L ${croix} ${croix} M ${croix} ${-croix} L ${-croix} ${croix}`} stroke={etat.trait} strokeWidth={3} strokeLinecap="round" pointerEvents="none" />
            )}
            {absente && (
                <path d={`M ${-croix} ${-croix} L ${croix} ${croix} M ${croix} ${-croix} L ${-croix} ${croix}`} stroke={etat.trait} strokeWidth={1.5} strokeLinecap="round" pointerEvents="none" />
            )}
            {code === "DEVITALISEE" && <circle r={croix * 0.5} fill={etat.trait} pointerEvents="none" />}
            {code === "COURONNE" && <path d={contour} fill="none" stroke={etat.trait} strokeWidth={3} pointerEvents="none" />}
            {code === "IMPLANT" && (
                <path d={`M ${-croix} ${-croix * 0.6} H ${croix} M ${-croix * 0.8} 0 H ${croix * 0.8} M ${-croix * 0.6} ${croix * 0.6} H ${croix * 0.6}`} stroke={etat.trait} strokeWidth={2.4} strokeLinecap="round" pointerEvents="none" />
            )}
            {code === "PROTHESE" && <path d={`M ${-croix} 0 H ${croix}`} stroke={etat.trait} strokeWidth={3} strokeLinecap="round" pointerEvents="none" />}
            {code === "FRACTUREE" && (
                <path d={`M ${-croix} ${-croix} L ${-croix * 0.1} ${-croix * 0.1} L ${-croix * 0.4} ${croix * 0.2} L ${croix} ${croix}`} fill="none" stroke={etat.trait} strokeWidth={2.2} strokeLinejoin="round" pointerEvents="none" />
            )}
            {code === "INCLUSE" && <circle r={croix} fill="none" stroke={etat.trait} strokeWidth={1.6} strokeDasharray="3 2" pointerEvents="none" />}
        </g>
    );
};

const Arcade = ({ arcade, haut }) => {
    const pas = 48;
    const points = Array.from({ length: pas + 1 }, (_, i) => {
        const theta = -ANGLE_QUADRANT + (i / pas) * ANGLE_QUADRANT * 2;
        const p = point(arcade, Math.abs(theta), Math.sign(theta) || 1, haut);
        return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }).join(" ");
    return <path d={points} fill="none" stroke="#f3b4b4" strokeWidth={68 * arcade.echelle} strokeLinecap="round" strokeLinejoin="round" />;
};

function Odontogramme({ dents = {}, denture = "adulte", selection = [], planifiees = [], onClickDent, curseur = "pointer" }) {
    const placees = useMemo(() => placerDents(denture), [denture]);
    const visibles = useMemo(() => new Set(dentsDeLaDenture(denture)), [denture]);
    const principale = denture === "enfant" ? ARCADE_ENFANT : ARCADE_ADULTE;

    return (
        <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} role="img" aria-label="Schéma dentaire" style={{ width: "100%", maxWidth: 640, display: "block", margin: "0 auto" }}>
            <rect x="8" y="8" width={LARGEUR - 16} height={HAUTEUR - 16} rx="150" fill="#fff5f3" stroke="#f0d4cf" />

            {/* Palais (stries) et langue */}
            <g pointerEvents="none">
                <ellipse cx={CENTRE_X} cy={CENTRE_Y - 170} rx={principale.a * 0.6} ry={principale.b * 0.52} fill="#fbd9d4" />
                {[0, 1, 2, 3].map((i) => (
                    <path key={i} d={`M ${CENTRE_X - 60 + i * 10} ${CENTRE_Y - 215 + i * 28} Q ${CENTRE_X} ${CENTRE_Y - 200 + i * 28} ${CENTRE_X + 60 - i * 10} ${CENTRE_Y - 215 + i * 28}`} fill="none" stroke="#f2b9b0" strokeWidth="2.5" strokeLinecap="round" />
                ))}
                <ellipse cx={CENTRE_X} cy={CENTRE_Y + 170} rx={principale.a * 0.6} ry={principale.b * 0.52} fill="#f4a9a9" />
                <path d={`M ${CENTRE_X} ${CENTRE_Y + 90} V ${CENTRE_Y + 250}`} stroke="#e58f8f" strokeWidth="3" strokeLinecap="round" />
            </g>

            <Arcade arcade={principale} haut />
            <Arcade arcade={principale} haut={false} />

            {/* Repères */}
            <g pointerEvents="none" fontFamily="Segoe UI, Arial, sans-serif">
                <line x1={CENTRE_X} y1="16" x2={CENTRE_X} y2={HAUTEUR - 16} stroke="#b08a84" strokeDasharray="5 6" />
                <text x="30" y={CENTRE_Y + 5} fontSize="14" fontWeight="600" fill="#8a6a64">Droite</text>
                <text x={LARGEUR - 30} y={CENTRE_Y + 5} fontSize="14" fontWeight="600" fill="#8a6a64" textAnchor="end">Gauche</text>
                <text x={CENTRE_X + 8} y={CENTRE_Y - 10} fontSize="13" fill="#8a6a64">Maxillaire</text>
                <text x={CENTRE_X + 8} y={CENTRE_Y + 22} fontSize="13" fill="#8a6a64">Mandibule</text>
            </g>

            {placees.filter((p) => visibles.has(p.numero)).map((p) => {
                const dent = dents[p.numero];
                const selectionnee = selection.includes(p.numero);
                const distanceLabel = p.epaisseur / 2 + (estDentLait(p.numero) ? 9 : 44);
                const lait = estDentLait(p.numero);
                const interieur = lait ? -1 : 1;
                const label = { x: p.x + interieur * p.normale.x * distanceLabel, y: p.y + interieur * p.normale.y * distanceLabel };
                const planifiee = planifiees.includes(p.numero);
                return (
                    <g
                        key={p.numero}
                        role={onClickDent ? "button" : undefined}
                        tabIndex={onClickDent ? 0 : undefined}
                        aria-label={decrireDent(p.numero)}
                        style={onClickDent ? { cursor: curseur, outline: "none" } : undefined}
                        onClick={onClickDent ? (e) => onClickDent(p.numero, e) : undefined}
                        onKeyDown={onClickDent ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onClickDent(p.numero, e);
                            }
                        } : undefined}
                    >
                        <title>{`${decrireDent(p.numero)} — ${(ETATS_DENT[dent?.etat] || ETATS_DENT.SAINE).label}`}</title>
                        {/* Zone de clic plus large que la dent */}
                        <circle cx={p.x} cy={p.y} r={Math.max(p.largeur, p.epaisseur) * 0.62} fill="transparent" />
                        <g transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.angle.toFixed(1)})`}>
                            <DentForme numero={p.numero} dent={dent} largeur={p.largeur} epaisseur={p.epaisseur} distal={p.distal} selectionnee={selectionnee} />
                        </g>
                        <text
                            x={label.x} y={label.y} fontSize={lait && denture === "mixte" ? 10 : 13} fontWeight="700" textAnchor="middle" dominantBaseline="central"
                            fontFamily="Segoe UI, Arial, sans-serif" fill={selectionnee ? "#0f6fb5" : estMaxillaire(p.numero) ? "#5b3a23" : "#3b4a5a"}
                        >
                            {p.numero}
                        </text>
                        {planifiee && <circle cx={label.x + 14} cy={label.y - 8} r={5} fill="#fa8c16" stroke="#fff" strokeWidth={1.5}><title>Soin à faire</title></circle>}
                        {dent?.mobilite > 0 && (
                            <text x={label.x - 14} y={label.y - 8} fontSize="10" fontWeight="700" fill="#c1121f" textAnchor="middle" fontFamily="Segoe UI, Arial, sans-serif">M{dent.mobilite}</text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

export default Odontogramme;

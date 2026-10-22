import { Tag } from "antd";

// Options partagées pour le Select "Période" (utilisé par OrdonnancesList, AnalysesList, RadiologiesList...)
export const periodeOptions = [
    { value: 1, label: "Aujourd’hui" },
    { value: 2, label: "Hier" },
    { value: 3, label: "Cette Semaine" },
    { value: 4, label: "Semaine Dernière" },
    { value: 5, label: "Ce Mois-ci" },
    { value: 6, label: "Mois Dernier" },
    { value: 7, label: "Cette Année" },
    { value: 8, label: "Année Dernière" },
    { value: 9, label: "Date à Date" },
];

// Options colorées (rouge/vert) pour le Segmented "Etat", harmonisées avec la colonne Etat du tableau.
// Le libellé reste adaptable par domaine (ex: "En instance"/"Servies" ou "En attente"/"Cloturées").
export const getEtatSegmentedOptions = (labels = { non: "En instance", oui: "Servies" }) => [
    {
        value: "Non",
        label: <Tag color="red" style={{ margin: 0 }}>{labels.non}</Tag>,
    },
    {
        value: "Oui",
        label: <Tag color="green" style={{ margin: 0 }}>{labels.oui}</Tag>,
    },
];

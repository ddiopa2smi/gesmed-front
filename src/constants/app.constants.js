
import excell from "./../assets/excell.png";
import file from "./../assets/file.png";
import profil from "./../assets/profil.jpg";
import consultant from "./../assets/consultant.png";
import radiologie from "./../assets/radiologie.jpg";
import logo from "./../assets/logo_ipm.png";
import logo1 from "./../assets/logo1.png";
import logoWithoutBg from "./../assets/logo_ipm-removebg-preview.png";

// Bleu extrait du logo (logo_ipm.png), désormais couleur primaire de l'application
// (boutons, liens, menu, en-têtes de tableaux...).
export const LOGO_BLUE = "#31bae8";
export const PRIMARY_COLOR = LOGO_BLUE;

// Jaune extrait du logo, utilisé comme accent (ex: indicateurs actifs de tri/filtre
// sur les en-têtes de tableaux, où le bleu primaire manquerait de contraste).
export const LOGO_YELLOW = "#ffda29";

// 4e couleur du logo (brun/terracotta de la canne à sucre), en dehors du bleu/jaune/blanc.
export const LOGO_BROWN = "#9f5822";


export const codesPrescriptions = {
    ORD: "06",
    ANA: "01",
    IMG: "02",
    INF: "03"
}


// export const images = {
//     excell : require("./../assets/excell.png"),
//     file : require("./../assets/file.png"),
//     profil : require("./../assets/profil.jpg"),
//     consultant : require("./../assets/consultant.png"),
//     radiologie : require("./../assets/radiologie.jpg"),
//     logo : require("./../assets/logo_ipm.png"),
//     logo1 : require("./../assets/logo1.png"),
//     logoWithoutBg : require("./../assets/logo_ipm-removebg-preview.png"),
// }

export const images = {
    excell,
    file,
    profil,
    consultant,
    radiologie,
    logo,
    logo1,
    logoWithoutBg,
};


export const codeServices = {
    ACCUEIL: "ACC",
    ANALYSE: "ANA",
    BIO_MEDICAL: "BIO",
    DENTAIRE: "DEN",
    GYNECOLOGIE: "GYN",
    HOSPITALISATION: "HOS",
    INFIRMERIE: "INF",
    MEDICAL: "MED",
    PHARMACIE: "PHA",
    RADIOLOGIE: "RAD",
    ADMINISTRATION: "ADM"
}


export const aspectsUrinesOptions = [
    {
        label: "Clair",
        value: "CLAIR"
    },
    {
        label: "Trouble",
        value: "TROUBLE"
    },
    {
        label: "Jaune",
        value: "JAUNE"
    },
    {
        label: "Foncé",
        value: "FONCE"
    },
    {
        label: "Ictérique",
        value: "ICTERIQUE"
    }
]

export const typesVisiteMedicaleOptions = [
    {
        label: "Visite médicale",
        value: "VISITE_MEDICALE"
    },
    {
        label: "Visite d'embauche",
        value: "VISITE_EMBAUCHE"
    },
    {
        label: "Visite annuelle",
        value: "VISITE_ANNUELLE"
    }
]
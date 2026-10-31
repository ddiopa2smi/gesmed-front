import { ServiceType } from "./types/types.ts";

// Codes des profils utilisateurs (champ "profil" du compte, cf. /api/User/Role/list)
export const PROFILS = {
    ADMIN: "role_1",
    GERANT: "role_2",
    COMPTABLE: "role_3",
    ASSISTANT: "role_4",
    INFIRMIER: "role_5",
    MEDECIN: "role_6",
    AGENT_COMPTOIR: "role_7",
    TECHNICIEN_BIO: "role_8",
};

export const getUserConnected = () => {
    try {
        return JSON.parse(sessionStorage.getItem("userConnected"));
    } catch (e) {
        return null;
    }
};

export const isAdmin = (user = getUserConnected()) =>
    user?.profil === PROFILS.ADMIN || user?.role_name === "Admin";

// Profils d'assistance rattachés à un espace. Leur code vient d'une séquence et peut varier
// d'un serveur à l'autre : ils sont reconnus par leur nom, à garder identique à table_roles.
export const ASSISTANTS_PAR_ESPACE = {
    [ServiceType.MEDICAL]: "Assistant(e) Médicale",
    [ServiceType.DENTAIRE]: "Assistant(e) Dentaire",
};

export const isAssistantEspace = (espace, user = getUserConnected()) =>
    Boolean(user?.role_name) && ASSISTANTS_PAR_ESPACE[espace] === user.role_name;

export const isAssistantDunEspace = (user = getUserConnected()) =>
    Object.values(ASSISTANTS_PAR_ESPACE).includes(user?.role_name);

// Accès réservé aux médecins et aux administrateurs (statistiques médicales...)
export const isMedecinOuAdmin = (user = getUserConnected()) =>
    isAdmin(user) || user?.profil === PROFILS.MEDECIN;

// Profils autorisés à consulter les statistiques de chaque espace (les administrateurs ont toujours accès).
// C'est le seul endroit à modifier pour changer ces droits.
export const ACCES_STATISTIQUES = {
    medical: [PROFILS.MEDECIN],
    pharmacie: [PROFILS.GERANT],
    analyse: [PROFILS.MEDECIN, PROFILS.TECHNICIEN_BIO],
    imagerie: [PROFILS.MEDECIN],
};

export const peutVoirStatistiques = (espace, user = getUserConnected()) =>
    isAdmin(user) || (ACCES_STATISTIQUES[espace] || []).includes(user?.profil);

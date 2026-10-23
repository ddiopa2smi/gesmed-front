// Codes des profils utilisateurs (champ "profil" du compte, cf. /api/User/Role/list)
export const PROFILS = {
    ADMIN: "role_1",
    ASSISTANT: "role_4",
    INFIRMIER: "role_5",
    MEDECIN: "role_6",
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

// Accès réservé aux médecins et aux administrateurs (statistiques médicales...)
export const isMedecinOuAdmin = (user = getUserConnected()) =>
    isAdmin(user) || user?.profil === PROFILS.MEDECIN;

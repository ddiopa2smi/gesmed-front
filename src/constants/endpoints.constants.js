export const endpoints = {
    rendezVous: {
        ADD: "/api/smed/Patient/addRV",
        TODAY_LIST: "/api/smed/Patient/Today/list",
        LIST: (periode) => `/api/smed/Patient/RendezVous/list/${periode}`,
        LIST_BY_DATE: (dateDeb, dateFin) => `/api/smed/Patient/RendezVous/list/${dateDeb}/${dateFin}`,
        UPDATE: "/api/smed/Patient/updateRV",
        DELETE: "/api/smed/Patient/deleteRV",
        UPDATE_ETAT: (numRV) => `/api/smed/Consultation/updateRVEffectue/${numRV}`,
    },
    dossierMedical: {
        DOSSIER: "/api/smed/DossierMedical/getDos",
        INFOS_CLINIQUES: "/api/smed/DossierMedical/getInfosCliniques",
        INFOS_CLINIQUES_UPDATE: "/api/smed/DossierMedical/InfosCliniques/update",
    },
    consultations: {
        SAVE: "/api/smed/Consultation/save",
        UPDATE: "/api/smed/Consultation/update",
        LIST: (periode) => `/api/smed/Consultation/list/${periode}`,
        LIST_BY_DATE: (dateDeb, dateFin) => `/api/smed/Consultation/list/${dateDeb}/${dateFin}`,
        FIND_CONSULTATIONS: "/api/smed/Consultation/FindCons",
        DELETE: "/api/smed/Consultation/delete",
        LIST_VALEURS_VISITES_MEDICALES: "/api/smed/Consultation/listValeursVisiteMedical"
    },
    users: {
        LIST: "/api/User/list/MED",
        ADD: "/api/User/add",
        UPDATE: "/api/User/update",
        UPDATE_PASSWORD: "/api/User/updatePassword",
        DELETE: (login) => `/api/User/delete?login=${login}`,
        ROLES_LIST: "/api/User/Role/list",
        DISCONNECT: "/api/User/Disconnect"
    },
    prescriptions: {
        ADD: "/api/smed/Prescription/add",
        UPDATE: "/api/smed/Prescription/updatePresc",
        DELETE: "/api/smed/Prescription/delete",
        GET_DETAILS: "/api/smed/Prescription/getDetails",
        LIST: (periode, etat) => `/api/smed/Prescription/getAllPrescriptions/${periode}/${etat}`,
        LIST_BY_DATE: (dateDebut, dateFin, etat) => `/api/smed/Prescription/getAllPrescriptions/date/${dateDebut}/${dateFin}/${etat}`,
        LIST_PRESCRIPTEURS_EXT: "/api/Fournisseur/Ext/list",

    },
    prescriptionsActes: {
        LIST: "/api/smed/DonneesBases/ActesInf/List"
    },
    patients: {
        LIST: (params = {}) => {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    query.append(key, value);
                }
            });
            const queryString = query.toString();
            return `/api/smed/Patient/list${queryString ? `?${queryString}` : ""}`;
        },
        LIST_TYPE: "/api/smed/Patient/listType",
        GET_PATIENT: (numpat) => `/api/smed/Patient/${numpat}`,
        ADD: "/api/smed/Patient/add",
        UPDATE: "/api/smed/Patient/update",
        DELETE: "/api/smed/Patient/delete",
    },
    AT: {
        ADD: "/api/smed/DossierAT/add",
        UPDATE: "/api/smed/DossierAT/update",
        LIST: "/api/smed/DossierAT/list",
        DELETE: "/api/smed/DossierAT/delete"
    },
    motifs: {
        ADD: "/api/smed/DonneesBases/MotifCons/add",
        UPDATE: "/api/smed/DonneesBases/MotifCons/update",
        LIST: "/api/smed/DonneesBases/MotifCons/List",
        DELETE: "/api/smed/DonneesBases/MotifCons/delete",
    },
    pathologie: {
        ADD: "/api/smed/DonneesBases/Patho/add",
        UPDATE: "/api/smed/DonneesBases/Patho/update",
        LIST: "/api/smed/DonneesBases/Patho/List",
        DELETE: "/api/smed/DonneesBases/Patho/delete",
    },
    regions: {
        ADD: "/api/smed/DonneesBases/Regions/add",
        UPDATE: "/api/smed/DonneesBases/Regions/update",
        LIST: "/api/smed/DonneesBases/Regions/List",
        DELETE: "/api/smed/DonneesBases/Regions/delete",
    },
    postes: {
        ADD: "/api/smed/DonneesBases/Postes/add",
        UPDATE: "/api/smed/DonneesBases/Postes/update",
        LIST: "/api/smed/DonneesBases/Postes/List"
    },
    structures: {
        ADD: "/api/smed/DonneesBases/Structures/add",
        UPDATE: "/api/smed/DonneesBases/Structures/update",
        LIST: "/api/smed/DonneesBases/Structures/List"
    },
    maladiesProfessionelles: {
        ADD: "/api/smed/DonneesBases/MaladiesProf/add",
        UPDATE: "/api/smed/DonneesBases/MaladiesProf/update",
        LIST: "/api/smed/DonneesBases/MaladiesProf/List"
    },
    maladies: {
        LIST: "/api/smed/DonneesBases/Maladies/List"
    },
    visitesLieux: {
        ADD: "/api/smed/VisiteLieux/add",
        UPDATE: "/api/smed/VisiteLieux/update",
        LIST: "/api/smed/VisiteLieux/List"
    },
    actes: {
        LIST: "/api/smed/DonneesBases/Actes/List",
        DELETE: (codeacte) => `/api/Actes/delete/${codeacte}`,
        UPDATE: "/api/Actes/update",
        ADD: (codeacte) => `/api/Actes/add/${codeacte}`,
        LIST_CATEGORIES: "/api/Actes/Categories/list",
    },
    ipm: {
        infos: {
            ADD: "",
            UPDATE: "/api/InfosGen/update",
            INFOS_DATA: "/api/InfosGen/IPM"
        }
    },
    fournisseurs: {
        LIST: "/api/ParamMedoc/fournisseurs/list",
        ADD: "/api/ParamMedoc/fournisseurs/add",
        UPDATE: "/api/ParamMedoc/fournisseurs/update",
        DELETE: "/api/ParamMedoc/fournisseurs/delete"
    },
    forme_galenique: {
        LIST: "/api/ParamMedoc/forme/list",
        ADD: "/api/ParamMedoc/forme/add",
        UPDATE: "/api/ParamMedoc/forme/update",
        DELETE: "/api/ParamMedoc/forme/delete",
    },
    familleMedoc: {
        LIST: "/api/ParamMedoc/famille/list",
        ADD: "/api/ParamMedoc/famille/add",
        UPDATE: "/api/ParamMedoc/famille/update",
        DELETE: "/api/ParamMedoc/famille/delete",
    },
    conditionnements: {
        LIST: "/api/ParamMedoc/cond/list",
        ADD: "/api/ParamMedoc/cond/add",
        UPDATE: "/api/ParamMedoc/cond/update",
        DELETE: "/api/ParamMedoc/cond/delete",
    },
    fiche_produit: {
        ADD: "/api/Produit/add",
        LIST: "/api/Produit/list",
        UPDATE: "/api/Produit/update",
        DELETE_MULTIPLE: "/api/Produit/delete",
    },
    commande_produit: {
        ADD: "/api/CommandeProduit/add",
        LIST: "/api/CommandeProduit/list",
        UPDATE: "/api/CommandeProduit/update",
        UPDATE_DATE_ENVOI: "/api/CommandeProduit/updateDateEnvoi",
        DELETE_MULTIPLE: "/api/CommandeProduit/delete",
        GET_DETAILS: "/api/CommandeProduit/getDetails"
    },
    entrees_produits: {
        ADD: "/api/CommandeProduit/Recep/add",
        LIST: "/api/CommandeProduit/Recep/list",
        UPDATE: "/api/CommandeProduit/Recep/update",
        DELETE_MULTIPLE: "/api/CommandeProduit/Recep/delete",
        VALID_MULTIPLE: "/api/CommandeProduit/Recep/validate",
        GET_DETAILS: "/api/CommandeProduit/Recep/getDetails"
    },
    sorties_produits: {
        ADD: "/api/Produit/Sortie/add",
        LIST: "/api/Produit/Sortie/list",
        UPDATE: "/api/Produit/Sortie/update",
        DELETE_MULTIPLE: "/api/Produit/Sortie/delete",
        GET_DETAILS: "/api/Produit/Sortie/getDetails"
    },
    saisie_inventaire: {
        ADD: "/api/Inventory/add",
        LIST: "/api/Inventory/list",
        UPDATE: "/api/Inventory/update",
        DELETE: "/api/Inventory/delete",
        //DELETE_MULTIPLE : "/api/Inventory/delete",
        GET_DETAILS: "/api/Inventory/getDetails",
        VALIDATE: "/api/Inventory/validate",
        STOCK: "/api/Inventory/getStock"
    },
    situation_stock: {
        LIST: "/api/Inventory/situationStock",
    },
    services_medicaux: {
        LIST: "/api/smed/ServiceMedicaux/list"
    },
    departements: {
        LIST: "/api/smed/Patient/listDept"
    },
    files: {
        UPLOAD_RESULTAT: (numPrescription) => `/api/smed/Prescription/uploadFile/${numPrescription}`,
        GET_RESULTAT: (numPrescription) => `/api/smed/Prescription/downloadFile/${numPrescription}`,
        DELETE_RESULTAT: (numPrescription) => `/api/smed/Prescription/deleteFile/${numPrescription}`

    },

}
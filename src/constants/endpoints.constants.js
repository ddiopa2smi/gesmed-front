export const endpoints = {
    rendezVous : {
        ADD : "/api/smed/Patient/addRV",
        TODAY_LIST : "/api/smed/Patient/Today/list"
    },
    dossierMedical: {
        DOSSIER : "/api/smed/DossierMedical/getDos" ,
        INFOS_CLINIQUES :  "/api/smed/DossierMedical/getInfosCliniques",
        INFOS_CLINIQUES_UPDATE :  "/api/smed/DossierMedical/InfosCliniques/update",
    },
    consultations : {
        SAVE : "/api/smed/Consultation/save" ,
        UPDATE : "/api/smed/Consultation/update" ,
        LIST : "/api/smed/Consultation/list" ,
        FIND_CONSULTATIONS : "/api/smed/Consultation/FindCons",
        DELETE :"/api/smed/Consultation/delete"
    } ,
    users : {
        LIST : "/api/User/list/MED",
        ADD : "/api/User/add",
        UPDATE : "/api/User/update",
        UPDATE_PASSWORD : "/api/User/updatePassword",
        DELETE : "/api/User/delete",
        ROLES_LIST : "/api/User/Role/list" ,
        DISCONNECT : "/api/User/Disconnect"
    } ,
    prescriptions : {
        ADD : "/api/smed/Prescription/add",
        UPDATE : "",
        DELETE : "/api/smed/Prescription/delete",
        GET_DETAILS : "/api/smed/Prescription/getDetails"
    } ,
    patients : {
        LIST: "/api/smed/Patient/list",
        LIST_TYPE : "/api/smed/Patient/listType",
        GET_PATIENT : "/api/smed/Patient",
        ADD : "/api/smed/Patient/add" ,
        UPDATE : "/api/smed/Patient/update" ,
        DELETE : "/api/smed/Patient/delete",
    } ,
    AT : {
        ADD : "" ,
        UPDATE : "" ,
        LIST : "/api/smed/DossierAT/list"
    } ,
    motifs : {
        ADD : "/api/smed/DonneesBases/MotifCons/add" ,
        UPDATE : "/api/smed/DonneesBases/MotifCons/update" ,
        LIST : "/api/smed/DonneesBases/MotifCons/List" ,
    } ,
    pathologie : {
        ADD : "/api/smed/DonneesBases/Patho/add" ,
        UPDATE : "/api/smed/DonneesBases/Patho/update" ,
        LIST : "/api/smed/DonneesBases/Patho/List" ,
    } ,
    regions : {
        ADD : "/api/smed/DonneesBases/Regions/add" ,
        UPDATE : "/api/smed/DonneesBases/Regions/update" ,
        LIST : "/api/smed/DonneesBases/Regions/List" ,
    } ,
    postes : {
        ADD : "/api/smed/DonneesBases/Postes/add" ,
        UPDATE : "/api/smed/DonneesBases/Postes/update" ,
        LIST : "/api/smed/DonneesBases/Postes/List"
    } ,
    structures : {
        ADD : "/api/smed/DonneesBases/Structures/add" ,
        UPDATE : "/api/smed/DonneesBases/Structures/update" ,
        LIST : "/api/smed/DonneesBases/Structures/List"
    } ,
    maladiesProfessionelles : {
        ADD : "/api/smed/DonneesBases/MaladiesProf/add" ,
        UPDATE : "/api/smed/DonneesBases/MaladiesProf/update" ,
        LIST : "/api/smed/DonneesBases/MaladiesProf/List"
    } ,
    maladies : {
        LIST :  "/api/smed/DonneesBases/Maladies/List"
    },
    visitesLieux : {
        ADD : "/api/smed/VisiteLieux/add" ,
        UPDATE : "/api/smed/VisiteLieux/update" ,
        LIST : "/api/smed/VisiteLieux/List"
    } ,
    actes : {
        LIST : "/api/smed/DonneesBases/Actes/List"
    } ,
    ipm : {
        infos : {
            ADD : "" ,
            UPDATE : "/api/InfosGen/update" ,
            INFOS_DATA : "/api/InfosGen/IPM"
        }
    } ,
    fournisseurs : {
        LIST : "/api/ParamMedoc/fournisseurs/list",
        ADD : "/api/ParamMedoc/fournisseurs/add",
        UPDATE : "/api/ParamMedoc/fournisseurs/update",
        DELETE : "/api/ParamMedoc/fournisseurs/delete"
    } ,
    forme_galenique : {
        LIST : "/api/ParamMedoc/forme/list",
        ADD : "/api/ParamMedoc/forme/add",
        UPDATE : "/api/ParamMedoc/forme/update",
        DELETE : "/api/ParamMedoc/forme/delete", 
    },
    familleMedoc : {
        LIST : "/api/ParamMedoc/famille/list",
        ADD : "/api/ParamMedoc/famille/add",
        UPDATE : "/api/ParamMedoc/famille/update",
        DELETE : "/api/ParamMedoc/famille/delete",
    } ,
    conditionnements : {
        LIST : "/api/ParamMedoc/cond/list",
        ADD : "/api/ParamMedoc/cond/add",
        UPDATE : "/api/ParamMedoc/cond/update",
        DELETE : "/api/ParamMedoc/cond/delete", 
    } ,
    fiche_produit : {
        ADD : "/api/Produit/add",
        LIST : "/api/Produit/list",
    }
    
}
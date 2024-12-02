import Swal from "sweetalert2";
import printJS from "print-js";
import { API_URL } from "../constants/environment.constants";
import { message } from "antd";
import { v4 as uuidv4 } from 'uuid';

export const formatDate = (record) => {
    return (record === null || record === "") ? "" : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(record));
}

export const deletePopup =() => {
    return Swal.fire({
        title: 'Êtes-vous sûr ?',
        icon: 'question',
        iconColor : 'var(--app-color)' ,
        showCancelButton: true,
        cancelButtonColor: '#d33',
        cancelButtonText:'Non',
        confirmButtonColor: 'var(--app-color)',
        confirmButtonText: 'Oui' ,
        //background: colorBgElevated ,
        //color: colorTextBase ,
    })
}

export const logoutPopup =() => {
    return Swal.fire({
        title: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        icon: 'question',
        iconColor : 'var(--app-color)' ,
        showCancelButton: true,
        cancelButtonColor: '#d33',
        cancelButtonText:'Non',
        confirmButtonColor: 'var(--app-color)',
        confirmButtonText: 'Oui' ,
        //background: colorBgElevated ,
        //color: colorTextBase ,
    })
}
 
export const printPDF = (url) => {
    printJS({
        printable : `${API_URL}${url}` ,
        type : 'pdf' ,
        showModal : true ,
        onLoadingEnd : ()=>{
            console.log("end")
        },
        onError : (error) => {
                console.log(error)
        },
        
        modalMessage : "Impression en cours",
    }) 
}

export const getBreadCrumbLabel = (item) => {
    let label = "";
    switch (item) {
        case "myspace":
            label = "Mon espace"
            break;
        case "dashboard":
            label = "Tableau de bord"
            break;
        case "rendez-vous":
            label = "Rendez-vous"
            break;
        case "mon-agenda":
            label = "Mon agenda"
            break;
        case "patients":
            label = "Patients"
            break;
        case "dossier":
            label = "Dossier médical"
            break;
        case "consultation":
            label = "Consultation"
            break;
        case "prescriptions":
            label = "Prescriptions"
            break;
        case "infos-cliniques":
            label = "Infos cliniques"
            break;
        case "ordonnance":
            label = "Ordonnance"
            break;
        case "analyse":
            label = "Analyse"
            break;
        case "imagerie":
            label = "Imagerie"
            break;
        case "consultations":
            label = "Consultations"
            break;
        case "details-consultation":
            label = "Détails consultation"
            break;
        case "visites":
            label = "Visites";
            break;
        case "dossier-accident-travail":
            label = "Dossier AT";
            break;
        case "fiche-produit":
            label = "Fiche produit";
            break;
        case "gestion-fiche-produits":
            label = "Gestion Fiches Produits";
            break;
        case "commandes-produits":
            label = "Commandes produits";
            break;
        case "new-commande-produit":
            label = "Nouvelle commande produit";
            break;
        case "entrees-produits":
            label = "Entrées produits";
            break;
        case "sorties-produits":
            label = "Sorties produits";
            break;
        case "reception-commande":
            label = "Réception commande";
            break;
        case "sorties_produits":
            label = "Sorties produits";
            break;
        case "mouvements-sorties":
            label = "Mouvements sorties";
            break;
        case "situation-stocks":
            label = "Situation stocks";
            break;
        case "new-mouvement-sortie":
            label = "Nouveau mouvement sortie";
            break;
        case "saisie-inventaire":
            label = "Saisie inventaire";
            break;
        case "fournisseurs":
            label = "Fournisseurs";
            break;
        case "facturation":
            label = "Facturation";
            break;
        case "settings":
            label = "Paramètres";
            break;
        case "users":
            label = "Utilisateurs";
            break;
        case "accounts":
            label = "Comptes";
            break;
        case "account":
            label = "Compte";
            break;
        case "privileges":
            label = "Privilèges";
            break;
        case "privilege":
            label = "Privilège";
            break;
        case "profil":
            label = "Mon profil";
            break;
        default:
            break;
    }
    return label === "" ? item : label;
}


export const sortColumn = (record1, record2) => {
    if (typeof record1 === "string" && typeof record2 === "string") {
        return record1.charCodeAt(0) - record2.charCodeAt(0) ;
    }else {
        return record1- record2;
    }
}


export const getTypePatient = (code) => {
    let libelle_code = null;
    switch (code) {
        case 1:
            libelle_code = "PERMANENT";
            break;
        case 2:
            libelle_code = "JOURNALIER";
            break;
        case 3:
            libelle_code = "SAISONNIER";
            break;
        case 4:
            libelle_code = "EXTERNE";
            break;
    
        default:
            break;
    }
    return libelle_code;
}

export const generateRandomCode = () => {
    // return `PH${Math.floor(100000 + Math.random() * 900000)}`;
    let randomUniqueChaine = uuidv4();
    let result = randomUniqueChaine.toUpperCase().replaceAll("-","");
    return `PH${result}`;
}
  
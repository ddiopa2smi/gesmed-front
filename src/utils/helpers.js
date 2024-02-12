import Swal from "sweetalert2";
import printJS from "print-js";
import { API_URL } from "../constants/environment.constants";

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
 
export const printPDF = (url) => {
    printJS({
        printable : `${API_URL}${url}` ,
        type : 'pdf' ,
        showModal : true ,
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
        case "visites":
            label = "Visites";
            break;
        case "dossier-accident-travail":
            label = "Dossier AT";
            break;
        case "fiche-produit":
            label = "Fiche produit";
            break;
        case "commandes-produits":
            label = "Commandes produits";;
            break;
        case "new-commande-produit":
            label = "Nouveau commande produit";;
            break;
        case "entrees-produits":
            label = "Entrées produits";;
            break;
        case "reception-commande":
            label = "Réception commande";;
            break;
        case "sorties_produits":
            label = "Sorties produits";;
            break;
        case "mouvements-sorties":
            label = "Mouvements sorties";;
            break;
        case "situation-stocks":
            label = "Situation stocks";;
            break;
        case "new-mouvement-sortie":
            label = "Nouveau mouvement sortie";;
            break;
        case "saisie-inventaire":
            label = "Saisie inventaire";;
            break;
        case "fournisseurs":
            label = "Fournisseurs";;
            break;
        case "settings":
            label = "Paramètres";;
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
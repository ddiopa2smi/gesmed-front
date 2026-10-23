import { Navigate, createBrowserRouter, createHashRouter } from "react-router-dom";
import MySpace from "./layouts/MySpace/MySpace";
import Auth from "./pages/Auth/Auth";
import NotFound from "./pages/NotFound/NotFound";
import Patients from "./pages/Patients/Patients";
import RendezVous from "./pages/RendezVous/RendezVous";
import NewCommandeProduit from "./pages/NewCommandeProduit/NewCommandeProduit";
import CommandesProduits from "./pages/CommandesProduits/CommandesProduits";
import FicheProduit from "./pages/FicheProduit/FicheProduit";
import EntreesProduits from "./pages/EntreesProduits/EntreesProduits";
import ReceptionCommande from "./pages/ReceptionCommande/ReceptionCommande";
import SituationStocks from "./pages/SituationStocks/SituationStocks";
import Fournisseurs from "./pages/Fournisseurs/Fournisseurs";
import SaisieInventaire from "./pages/SaisieInventaire/SaisieInventaire";
import SortiesProduits from "./pages/SortiesProduits/SortiesProduits";
import NewMouvementSortie from "./pages/NewMouvementSortie/NewMouvementSortie";
import Profil from "./pages/Profil/Profil";
import DossierMedical from "./pages/DossierMedical/DossierMedical";
import InfosCliniques from "./pages/InfosCliniques/InfosCliniques";
import Consultation from "./pages/Consultation/Consultation";
import Prescriptions from "./pages/Prescriptions/Prescriptions";
import Ordonnance from "./pages/Ordonnance/Ordonnance";
import Analyse from "./pages/Analyse/Analyse";
import Imagerie from "./pages/Imagerie/Imagerie";
import Home from "./pages/Home/Home";
import Consultations from "./pages/Consultations/Consultations";
import Visites from "./pages/Visites/Visites";
import DossierAT from "./pages/DossierAT/DossierAT";
import StatistiquesMedicales from "./pages/StatistiquesMedicales/StatistiquesMedicales";
import Privileges from "./pages/Privileges/Privileges";
import Privilege from "./pages/Privilege/Privilege";
import DetailsConsultation from "./pages/DetailsConsultation/DetailsConsultation";
import GestionPassword from "./pages/GestionPassword/GestionPassword";
import GestionFicheProduits from "./pages/GestionFicheProduits/GestionFicheProduits";
import ProtectedRoute from "./components/specific/ProtectedRoute/ProtectedRoute";
import AgendaMedecin from "./pages/AgendaMedecin/AgendaMedecin";
import { gynecologieRouter } from "./pages/Espace-Gynecologue/Routing.tsx";
import { dentistRouter } from "./pages/Espace-Dentiste/Routing.tsx";
import { pharmacieRouter } from "./pages/Espace-Pharmacie/Routing.tsx";
import { radiologieRouter } from "./pages/Espace-Radiologie/Routing.tsx";
import { analyseRouter } from "./pages/Espace-analyse/Routing.tsx";
import ConfigPage from "./pages/ConfigPage/ConfigPage.js";
import PrescriptionsGroupes from "./pages/PrescriptionsGroupes/PrescriptionsGroupes.js";
import VisiteDetails from "./pages/VisiteDetails/VisiteDetails.js";
import { accueilRouter } from "./pages/Espace-Accueil/Routing.tsx";
import { hospitalisationRouter } from "./pages/Espace-Hospitalisation/Routing.tsx";
import { infirmerieRouter } from "./pages/Espace-Infirmerie/Routing.tsx";
import { administrationRouter } from "./pages/EspaceAdministration/Routing.tsx";
import MedicalDashboard from "./pages/MedicalDashboard/MedicalDashboard.js";
import PharmacyDashboard from "./pages/PharmacyDashboard/PharmacyDashboard.js";
import Infirmerie from "./pages/Infirmerie/Infirmerie.js"
//export const router = createBrowserRouter(
export const router = createHashRouter(
    [
        {
            path: "/",
            element: <Navigate to={"/login"} />
        },
        {
            path: "/login",
            element: <Auth />,
        },
        {
            path: "/home",
            element: <ProtectedRoute component={<Home />} />
        },
        {
            path: "*",
            element: <NotFound />
        },
        {
            path: "myspace",
            element: <ProtectedRoute component={<MySpace />} />,
            children: [
                {
                    path: "profil",
                    element: <Profil />
                },
                {
                    path: "profil",
                    element: <ProtectedRoute component={<Profil />} />
                },
                {
                    path: "gestion-mot-de-passe",
                    element: <ProtectedRoute component={<GestionPassword />} />,
                },
            ]
        },
        {
            path: "espace-medical",
            //path : "myspace",
            //element : <MySpace />  ,
            element: <ProtectedRoute component={<MySpace />} />,
            handle: {
                breadcrumb: "Espace Médical",
            },
            children: [
                {
                    path: "",
                    element: <Navigate to={"/espace-medical/dashboard"} />
                },
                {
                    path: "dashboard",
                    element: <MedicalDashboard />,
                    handle: {
                        breadcrumb: "Tableau de bord",
                    },
                },
                {
                    path: "rendez-vous",
                    element: <RendezVous />,
                    handle: {
                        breadcrumb: "Rendez-vous",
                    },
                },
                {
                    path: "mon-agenda",
                    element: <AgendaMedecin />,
                    handle: {
                        breadcrumb: "Mon agenda",
                    },
                },
                {
                    path: "patients",
                    children: [
                        {
                            path: "",
                            element: <Patients />
                        },
                        {
                            path: "dossier",
                            children: [
                                {
                                    path: "",
                                    element: <DossierMedical />
                                },
                                {
                                    path: "consultation",
                                    element: <Consultation />
                                },
                                {
                                    path: "infos-cliniques",
                                    element: <InfosCliniques />
                                },
                                {
                                    path: "prescriptions",
                                    children: [
                                        {
                                            path: "",
                                            element: <Prescriptions />
                                        },
                                        {
                                            path: "ordonnance",
                                            element: <Ordonnance />
                                        },
                                        {
                                            path: "analyse",
                                            element: <Analyse />
                                        },
                                        {
                                            path: "imagerie",
                                            element: <Imagerie />
                                        },
                                        {
                                            path: "infirmerie",
                                            element: <Infirmerie />
                                        },
                                    ]
                                },
                            ]
                        },
                        {
                            path: ":id",
                            children: [

                                {
                                    index: true,
                                    element: <DossierMedical />,
                                },
                                {
                                    path: "consultation",
                                    element: <Consultation />
                                },
                                {
                                    path: "infos-cliniques",
                                    element: <InfosCliniques />
                                },
                                {
                                    path: "prescriptions",
                                    children: [
                                        {
                                            path: "",
                                            element: <Prescriptions />
                                        },
                                        {
                                            path: "ordonnance",
                                            element: <Ordonnance />
                                        },
                                        {
                                            path: "analyse",
                                            element: <Analyse />
                                        },
                                        {
                                            path: "imagerie",
                                            element: <Imagerie />
                                        },
                                        {
                                            path: "infirmerie",
                                            element: <Infirmerie />
                                        },
                                    ]
                                },
                            ]
                        },
                    ]
                },
                {
                    path: "dossier-medical:id",
                    handle: {
                        breadcrumb: ({ id }) => `Dossier patient ${id}`,
                    },
                    children: [
                        {
                            path: "",
                            element: <DossierMedical />
                        },
                        {
                            path: "consultation",
                            element: <Consultation />
                        },
                        {
                            path: "infos-cliniques",
                            element: <InfosCliniques />
                        },
                        {
                            path: "prescriptions",
                            children: [
                                {
                                    path: "",
                                    element: <Prescriptions />
                                },
                                {
                                    path: "ordonnance",
                                    element: <Ordonnance />
                                },
                                {
                                    path: "analyse",
                                    element: <Analyse />
                                },
                                {
                                    path: "imagerie",
                                    element: <Imagerie />
                                },
                                {
                                    path: "infirmerie",
                                    element: <Infirmerie />
                                },
                            ]
                        },
                    ]
                },
                {
                    path: "consultations",
                    children: [
                        {
                            path: "",
                            element: <Consultations />
                        },
                        {
                            path: "details-consultation",
                            element: <DetailsConsultation />
                        },
                    ]
                },
                {
                    path: "prescriptions-groupes",
                    element: <PrescriptionsGroupes />
                },
                {
                    path: "visites",
                    children: [
                        {
                            path: "",
                            element: <Visites />
                        },
                        {
                            path: "details",
                            element: <VisiteDetails />
                        },
                    ]
                },
                {
                    path: "dossier-accident-travail",
                    element: <DossierAT />
                },
                {
                    // Réservé aux médecins et administrateurs (contrôle dans la page)
                    path: "statistiques",
                    element: <StatistiquesMedicales />
                },
                {
                    path: "*",
                    element: <NotFound />
                },

            ]
        },
        {
            path: "espace-pharmacie",
            //path : "myspace",
            //element : <MySpace />  ,
            element: <ProtectedRoute component={<MySpace />} />,
            children: [
                {
                    path: "",
                    element: <Navigate to={"/espace-pharmacie/dashboard"} />
                },
                {
                    path: "dashboard",
                    element: <PharmacyDashboard />,
                },
                {
                    path: "gestion-fiche-produits",
                    children: [
                        {
                            path: "",
                            element: <GestionFicheProduits />
                        },
                        {
                            path: "fiche-produit",
                            element: <FicheProduit />
                        },
                    ]
                },
                {
                    path: "commandes-produits",
                    children: [
                        {
                            path: "",
                            element: <CommandesProduits />
                        },
                        {
                            path: "new-commande-produit",
                            element: <NewCommandeProduit />
                        },
                    ]
                },
                {
                    path: "entrees-produits",
                    children: [
                        {
                            path: "",
                            element: <EntreesProduits />
                        },
                        {
                            path: "reception-commande",
                            element: <ReceptionCommande />
                        },
                    ]
                },
                {
                    path: "sorties-produits",
                    children: [
                        {
                            path: "",
                            element: <SortiesProduits />
                        },
                        {
                            path: "new-mouvement-sortie",
                            element: <NewMouvementSortie />
                        },
                    ]
                },
                {
                    path: "situation-stocks",
                    element: <SituationStocks />
                },
                {
                    path: "saisie-inventaire",
                    element: <SaisieInventaire />
                },
                {
                    path: "fournisseurs",
                    element: <Fournisseurs />
                },
            ]
        },
        accueilRouter,
        pharmacieRouter,
        gynecologieRouter,
        dentistRouter,
        radiologieRouter,
        analyseRouter,
        hospitalisationRouter,
        infirmerieRouter,
        administrationRouter
    ]
)
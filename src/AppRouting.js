import { Navigate, createBrowserRouter } from "react-router-dom";
import MySpace from "./layouts/MySpace/MySpace";
import Auth from "./pages/Auth/Auth";
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
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
import Accounts from "./pages/Accounts/Accounts";
import NewAccount from "./pages/NewAccount/NewAccount";
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
import Privileges from "./pages/Privileges/Privileges";
import Privilege from "./pages/Privilege/Privilege";
import Facturation from "./pages/Facturation/Facturation";
import DetailsConsultation from "./pages/DetailsConsultation/DetailsConsultation";
import GestionPassword from "./pages/GestionPassword/GestionPassword";
import GestionFicheProduits from "./pages/GestionFicheProduits/GestionFicheProduits";
import ProtectedRoute from "./components/specific/ProtectedRoute/ProtectedRoute";
import AgendaMedecin from "./pages/AgendaMedecin/AgendaMedecin";
import { gynecologieRouter } from "./pages/Espace-Gynecologue/GynecologieRouting.tsx";
import { dentistRouter } from "./pages/Espace-Dentiste/Routing.tsx";
import { pharmacieRouter } from "./pages/Espace-Pharmacie/Routing.tsx";
export const router = createBrowserRouter(
    [
        {
            path : "/",
            element : <Navigate to={"/login"} />
        },
        {
            path : "/login",
            element : <Auth />,
        },
        {
            path : "/home",
            element : <ProtectedRoute component={<Home/>} />
        },
        {
            path : "*",
            element : <NotFound />
        },
        {
            path : "myspace",
            //element : <MySpace />  ,
            element : <ProtectedRoute component={<MySpace />} />  ,
            children : [
                {
                    path : "",
                    element : <Navigate to={"/myspace/dashboard"} />
                },
                {
                    path : "dashboard",
                    element : <Dashboard />,
                },
                {
                    path : "rendez-vous",
                    element : <RendezVous />
                },
                {
                    path : "mon-agenda",
                    element : <AgendaMedecin />
                },
                {
                    path : "patients",
                    children : [
                        {
                            path : "",
                            element : <Patients />
                        },
                        {
                            path : "dossier",
                            children : [
                                {
                                    path : "" ,
                                    element : <DossierMedical />
                                } ,
                                {
                                    path : "consultation" ,
                                    element  : <Consultation />
                                } ,
                                {
                                    path : "infos-cliniques",
                                    element : <InfosCliniques />
                                },
                                {
                                    path : "prescriptions",
                                    children : [
                                        {
                                            path : "",
                                            element : <Prescriptions />
                                        },
                                        {
                                            path : "ordonnance",
                                            element : <Ordonnance />
                                        },
                                        {
                                            path : "analyse",
                                            element : <Analyse />
                                        },
                                        {
                                            path : "imagerie",
                                            element : <Imagerie />
                                        },
                                    ]
                                },
                            ]
                        },
                    ]
                },
                {
                    path : "consultations",
                    children : [
                        {
                            path : "",
                            element : <Consultations />
                        },
                        {
                            path : "details-consultation",
                            element : <DetailsConsultation />
                        },
                    ]
                },
                {
                    path : "visites",
                    element : <Visites />
                },
                {
                    path : "dossier-accident-travail",
                    element : <DossierAT />
                },
                {
                    path : "facturation",
                    element : <Facturation />
                },
                // {
                //     path : "fiche-produit",
                //     element : <FicheProduit />
                // },
                {
                    path : "gestion-fiche-produits",
                    children : [
                        {
                            path : "",
                            element : <GestionFicheProduits/>
                        },
                        {
                            path : "fiche-produit",
                            element : <FicheProduit/>
                        },
                    ]
                },
                {
                    path : "commandes-produits",
                    children : [
                        {
                            path : "",
                            element : <CommandesProduits/>
                        },
                        {
                            path : "new-commande-produit",
                            element : <NewCommandeProduit/>
                        },
                    ]
                },
                {
                    path : "entrees-produits",
                    children : [
                        {
                            path : "",
                            element : <EntreesProduits/>
                        },
                        {
                            path : "reception-commande",
                            element : <ReceptionCommande/>
                        },
                    ]
                },
                {
                    path : "sorties-produits",
                    children : [
                        {
                            path : "",
                            element : <SortiesProduits/>
                        },
                        {
                            path : "new-mouvement-sortie",
                            element : <NewMouvementSortie/>
                        },
                    ]
                },
                {
                    path : "situation-stocks",
                    element : <SituationStocks />
                },
                {
                    path : "saisie-inventaire",
                    element : <SaisieInventaire/>
                },
                {
                    path : "fournisseurs",
                    element : <Fournisseurs />
                },
                {
                    path : "settings",
                    children : [
                        {
                            path : "",
                            element : <Navigate to={"/myspace/settings/accounts"} />
                        },
                        {
                            path : "accounts",
                            children : [
                                {
                                    path : "",
                                    element : <Accounts />
                                },
                                {
                                    path : "account",
                                    element : <NewAccount />
                                },
                            ]
                        },
                        {
                            path : "privileges",
                            children : [
                                {
                                    path : "",
                                    element : <Privileges />
                                },
                                {
                                    path : "privilege",
                                    element : <Privilege />
                                },
                            ]
                        },
                        {
                            path : "gestion-mot-de-passe",
                            element : <GestionPassword />
                        },
                        {
                            path : "profil",
                            element : <Profil />
                        },
                    ]
                    
                },
                {
                    path : "*",
                    element : <NotFound />
                },
                
            ]
        },
        pharmacieRouter,
        gynecologieRouter ,
        dentistRouter 
    ]
)
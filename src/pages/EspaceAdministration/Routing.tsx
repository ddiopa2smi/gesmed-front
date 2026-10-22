import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Accounts from "../Accounts/Accounts";
import ConfigPage from "../ConfigPage/ConfigPage";
import GestionPassword from "../GestionPassword/GestionPassword";
import Privilege from "../Privilege/Privilege";
import Privileges from "../Privileges/Privileges";
import Profil from "../Profil/Profil";
export const administrationRouter: RouteObject = {
    path: "espace-administration",
    element: <MySpace />,
    children: [
        {
            path: "settings",
            children: [
                {
                    path: "",
                    element: <Navigate to={"/espace-administration/settings/accounts"} />
                },
                {
                    path: "accounts",
                    element: <Accounts />
                },
                {
                    path: "privileges",
                    children: [
                        {
                            path: "",
                            element: <Privileges />
                        },
                        {
                            path: "privilege",
                            element: <Privilege />
                        },
                    ]
                },
                {
                    path: "gestion-mot-de-passe",
                    element: <GestionPassword />
                },
                {
                    path: "profil",
                    element: <Profil />
                },
                {
                    path: "config",
                    element: <ConfigPage />
                },
            ]

        },
    ]
}
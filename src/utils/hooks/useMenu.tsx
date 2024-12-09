import {
  ApartmentOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  LeftCircleOutlined,
  LockOutlined,
  RightCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
  StockOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ServiceType } from "../types/types.ts";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { RiStethoscopeLine } from "react-icons/ri";

function useMenu({ serviceType }: { serviceType: ServiceType }) {
  const [sideBarMenu, setSideBarMenu] = useState<ItemType<MenuItemType>[]>([]);
  const navigate = useNavigate();

  const accueilMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "Tableau de bord",
      onClick: () => {
        navigate("/espace-accueil/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Liste des rendez-vous",
      title: "Liste des rendez-vous",
      onClick: () => {
        navigate("/espace-accueil/rendez-vous");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-accueil/patients");
      },
    }
  ];

  const medicalMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord ",
      title: "Tableau de bord ",
      onClick: () => {
        navigate("/espace-medical/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Liste des rendez-vous",
      title: "Liste des rendez-vous",
      onClick: () => {
        navigate("/espace-medical/rendez-vous");
      },
    },
    {
      key: "mon-agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-medical/mon-agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Liste des patients",
      title: "Liste des patients",
      onClick: () => {
        navigate("/espace-medical/patients");
      },
    },
    {
      key: "consultations",
      icon: <ClockCircleOutlined />,
      label: "Liste des consultations",
      title: "Liste des consultations",
      onClick: () => {
        navigate("/espace-medical/consultations");
      },
    },
    {
      key: "prescriptions-groupes",
      icon: <RiStethoscopeLine size={16} />,
      label: "Prescriptions groupées",
      title: "Prescriptions groupées",
      onClick: () => {
        navigate("/espace-medical/prescriptions-groupes");
      },
    },
    {
      key: "visites",
      icon: <ApartmentOutlined />,
      label: "Visite des lieux",
      title: "Visite des lieux",
      onClick: () => {
        navigate("/espace-medical/visites");
      },
    },

    {
      key: "dossier-accident-travail",
      icon: <FolderOutlined />,
      label: "Dossier AT",
      title: "Dossier AT",
      onClick: () => {
        navigate("/espace-medical/dossier-accident-travail");
      },
    },
    
  ];

  const pharmacieMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord ",
      title: "Tableau de bord ",
      onClick: () => {
        navigate("/espace-pharmacie/dashboard");
      },
    },
    {
      key: "gestion-fiche-produits",
      icon: <FileOutlined />,
      label: "Gestion fiche produits",
      title: "Gestion fiche produits",
      onClick: () => {
        navigate("/espace-pharmacie/gestion-fiche-produits");
      },
    },
    {
      key: "commandes-produits",
      icon: <AppstoreOutlined />,
      label: "Commandes Produits",
      title: "Commandes Produits",
      onClick: () => {
        navigate("/espace-pharmacie/commandes-produits");
      },
    },
    {
      key: "entrees-produits",
      icon: <RightCircleOutlined />,
      label: "Entrées Produits",
      title: "Entrées Produits",
      onClick: () => {
        navigate("/espace-pharmacie/entrees-produits");
      },
    },
    {
      key: "sorties-produits",
      icon: <LeftCircleOutlined />,
      label: "Sorties Produits",
      title: "Sorties Produits",
      onClick: () => {
        navigate("/espace-pharmacie/sorties-produits");
      },
    },
    {
      key: "situation-stocks",
      icon: <StockOutlined />,
      label: "Situation des stocks",
      title: "Situation des stocks",
      onClick: () => {
        navigate("/espace-pharmacie/situation-stocks");
      },
    },
    {
      key: "saisie-inventaire",
      icon: <EditOutlined />,
      label: "Saisie Inventaire",
      title: "Saisie Inventaire",
      onClick: () => {
        navigate("/espace-pharmacie/saisie-inventaire");
      },
    },
    {
      key: "fournisseurs",
      icon: <CarOutlined />,
      label: "Liste des fournisseurs",
      title: "Liste des fournisseurs",
      onClick: () => {
        navigate("/espace-pharmacie/fournisseurs");
      },
    },
  ];

  const dentistMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "Tableau de bord",
      onClick: () => {
        navigate("/espace-dentist/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Rendez-vous",
      title: "Rendez-vous",
      onClick: () => {
        navigate("/espace-dentist/rendez-vous");
      },
    },
    {
      key: "agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-dentist/agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-dentist/patients");
      },
    },
    {
      key: "consultations",
      icon: <ClockCircleOutlined />,
      label: "Consultations",
      title: "Consultations",
      onClick: () => {
        navigate("/espace-dentist/consultations");
      },
    },
  ];

  const infirmerieMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "dashboard",
      onClick: () => {
        navigate("/espace-infirmerie/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Rendez-vous",
      title: "Rendez-vous",
      onClick: () => {
        navigate("/espace-infirmerie/rendez-vous");
      },
    },
    {
      key: "agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-infirmerie/agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-infirmerie/patients");
      },
    },
    {
      key: "consultations",
      icon: <RiStethoscopeLine />,
      label: "Consultations",
      title: "Consultations",
      onClick: () => {
        navigate("/espace-infirmerie/consultations");
      },
    },
  ];

  const analyseMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "dashboard",
      onClick: () => {
        navigate("/espace-analyse/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Rendez-vous",
      title: "Rendez-vous",
      onClick: () => {
        navigate("/espace-analyse/rendez-vous");
      },
    },
    {
      key: "agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-analyse/agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-analyse/patients");
      },
    },
    {
      key: "consultations",
      icon: <RiStethoscopeLine />,
      label: "Consultations",
      title: "Consultations",
      onClick: () => {
        navigate("/espace-analyse/consultations");
      },
    },
  ];

  const radiologieMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "dashboard",
      onClick: () => {
        navigate("/espace-radiologie/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Rendez-vous",
      title: "Rendez-vous",
      onClick: () => {
        navigate("/espace-radiologie/rendez-vous");
      },
    },
    {
      key: "agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-radiologie/agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-radiologie/patients");
      },
    },
    {
      key: "consultations",
      icon: <RiStethoscopeLine />,
      label: "Consultations",
      title: "Consultations",
      onClick: () => {
        navigate("/espace-radiologie/consultations");
      },
    },
  ];

  const hospitalisationMenu: ItemType<MenuItemType>[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "dashboard",
      onClick: () => {
        navigate("/espace-hospitalisation/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Rendez-vous",
      title: "Rendez-vous",
      onClick: () => {
        navigate("/espace-hospitalisation/rendez-vous");
      },
    },
    {
      key: "agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-hospitalisation/agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-hospitalisation/patients");
      },
    },
    {
      key: "consultations",
      icon: <RiStethoscopeLine />,
      label: "Consultations",
      title: "Consultations",
      onClick: () => {
        navigate("/espace-hospitalisation/consultations");
      },
    },
  ];

  const gynecologieMenu: ItemType<MenuItemType>[]  = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
      title: "dashboard",
      onClick: () => {
        navigate("/espace-gynecologie/dashboard");
      },
    },
    {
      key: "rendez-vous",
      icon: <CalendarOutlined />,
      label: "Rendez-vous",
      title: "Rendez-vous",
      onClick: () => {
        navigate("/espace-gynecologie/rendez-vous");
      },
    },
    {
      key: "agenda",
      icon: <CalendarOutlined />,
      label: "Mon agenda",
      title: "Mon agenda",
      onClick: () => {
        navigate("/espace-gynecologie/agenda");
      },
    },
    {
      key: "patients",
      icon: <TeamOutlined />,
      label: "Patients",
      title: "Patients",
      onClick: () => {
        navigate("/espace-gynecologie/patients");
      },
    },
    {
      key: "consultations",
      icon: <RiStethoscopeLine />,
      label: "Consultations",
      title: "Consultations",
      onClick: () => {
        navigate("/espace-gynecologie/consultations");
      },
    },
  ];

  const administrationMenu: ItemType<MenuItemType>[] = [
    {
      key: "settings",
      label: "Paramètres",
      title: "Paramètres",
      icon: <SettingOutlined />,
      children: [
        {
          key: "accounts",
          icon: <TeamOutlined />,
          label: "Comptes",
          title: "Comptes",
          onClick: () => {
            navigate("/espace-administration/settings/accounts");
          },
        },
        {
          key: "privileges",
          icon: <SafetyOutlined />,
          label: "Privilèges",
          title: "Privilèges",
          onClick: () => {
            navigate("/espace-administration/settings/privileges");
          },
        },
        {
          key: "gestion-mot-de-passe",
          label: "Gestion de mot de passe",
          title: "Gestion de mot de passe",
          icon: <LockOutlined />,
          onClick: () => {
            navigate("/espace-administration/settings/gestion-mot-de-passe");
          },
        },
        {
          key: "profil",
          label: "Mon profil",
          title: "Mon profil",
          icon: <UserOutlined />,
          onClick: () => {
            navigate("/espace-administration/settings/profil");
          },
        },
        {
          key: "config",
          label: "Configurations",
          title: "Configurations",
          icon: <ToolOutlined />,
          onClick: () => {
            navigate("/espace-administration/settings/config");
          },
        },
      ],
    },
  ];
  useEffect(() => {
    switch (serviceType) {
      case ServiceType.ACCUEIL:
        setSideBarMenu(accueilMenu);
        break;
      case ServiceType.MEDICAL:
        setSideBarMenu(medicalMenu);
        break;
      case ServiceType.PHARMACIE:
        setSideBarMenu(pharmacieMenu);
        break;
      case ServiceType.DENTAIRE:
        setSideBarMenu(dentistMenu);
        break;
      case ServiceType.INFIRMERIE:
        setSideBarMenu(infirmerieMenu);
        break;
      case ServiceType.ANALYSE:
        setSideBarMenu(analyseMenu);
        break;
      case ServiceType.RADIOLOGIE:
        setSideBarMenu(radiologieMenu);
        break;
      case ServiceType.GYNECOLOGIE:
        setSideBarMenu(gynecologieMenu);
        break;
      case ServiceType.HOSPITALISATION:
        setSideBarMenu(hospitalisationMenu);
        break;
      case ServiceType.ADMINISTRATION:
        setSideBarMenu(administrationMenu);
        break;
      default:
        break;
    }
  }, [serviceType]);

  return {
    sideBarMenu,
  };
}

export default useMenu;

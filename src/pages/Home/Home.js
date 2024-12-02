import "./Home.scss";
import { Button, Flex, Layout, Space, Typography, message, theme } from "antd";
import React from "react";
import medicine_image from "./../../assets/medicine_image.svg";
import pharma_image from "./../../assets/pharma_image.svg";
import dentist_image from "./../../assets/dentist_image.svg";
import gynecologie_image from "./../../assets/gynecologie_image.svg";
import radiologie_image from "./../../assets/radiologie_image.svg";
import analyse_image from "./../../assets/analyse_image.svg";
import administration_image from "./../../assets/administration_image.svg";
import { useNavigate } from "react-router-dom";
import HomeCard from "../../components/specific/HomeCard/HomeCard";
import { Typewriter } from "react-simple-typewriter";
import { logoutPopup } from "../../utils/helpers";
import { postActions } from "../../actions/actions";
import { endpoints } from "../../constants/endpoints.constants";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { codeServices } from "../../constants/app.constants";
import { ServiceType } from "../../utils/types/types.ts";
const { Title } = Typography;

function Home() {
  const navigate = useNavigate();
  const homeMenus = [
    {
      id: 7,
      label: "Service d'accueil",
      code: codeServices.ACCUEIL,
      cover: administration_image,
      onClick: () => {
        navigate("/espace-accueil");
        sessionStorage.setItem("space", "saccueil");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.ACCUEIL)
        );
      },
    },
    {
      id: 1,
      label: "Service médical",
      code: codeServices.MEDICAL,
      cover: medicine_image,
      onClick: () => {
        navigate("/espace-medical/dashboard");
        sessionStorage.setItem("space", "smed");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.MEDICAL)
        );
      },
    },
    {
      id: 2,
      label: "Service pharmacie",
      code: codeServices.PHARMACIE,
      cover: pharma_image,
      onClick: () => {
        navigate("/espace-pharmacie/dashboard");
        sessionStorage.setItem("space", "spharma");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.PHARMACIE)
        );
      },
    },
    {
      id: 3,
      label: "Service dentaire",
      code: codeServices.DENTAIRE,
      cover: dentist_image,
      onClick: () => {
        navigate("/espace-dentist");
        sessionStorage.setItem("space", "sdentist");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.DENTAIRE)
        );
      },
    },
    {
      id: 4,
      label: "Service Gynécologie",
      code: codeServices.GYNECOLOGIE,
      cover: gynecologie_image,
      onClick: () => {
        navigate("/espace-gynecologie");
        sessionStorage.setItem("space", "sgynecologie");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.GYNECOLOGIE)
        );
      },
    },
    {
      id: 5,
      label: "Service Analyse",
      code: codeServices.ANALYSE,
      cover: analyse_image,
      onClick: () => {
        navigate("/espace-analyse");
        sessionStorage.setItem("space", "sanalyse");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.ANALYSE)
        );
      },
    },
    {
      id: 6,
      label: "Service Radiologie",
      code: codeServices.RADIOLOGIE,
      cover: radiologie_image,
      onClick: () => {
        navigate("/espace-radiologie");
        sessionStorage.setItem("space", "sradio");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.RADIOLOGIE)
        );
      },
    },

    {
      id: 8,
      label: "Service Hospitalisation",
      code: codeServices.HOSPITALISATION,
      cover: administration_image,
      onClick: () => {
        navigate("/espace-hospitalisation");
        sessionStorage.setItem("space", "shospitalisation");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.HOSPITALISATION)
        );
      },
    },
    {
      id: 9,
      label: "Service Infirmerie",
      code: codeServices.INFIRMERIE,
      cover: administration_image,
      onClick: () => {
        navigate("/espace-infirmerie");
        sessionStorage.setItem("space", "sinfirmerie");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.INFIRMERIE)
        );
      },
    },
  ];
  const {
    token: { colorBgElevated },
  } = theme.useToken();

  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const logout = () => {
    logoutPopup().then((result) => {
      if (result.isConfirmed) {
        postActions(`${endpoints.users.DISCONNECT}`, userConnected).then(
          (response) => {
            if (response.data.Disconnect === true) {
              sessionStorage.clear();
              navigate("/login", { replace: true });
              message.success("Déconnexion éffectuée avec succès");
            } else {
              message.error("Erreur de déconnexion");
            }
          }
        );
      }
    });
  };
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Flex
        align="center"
        justify="space-between"
        style={{ margin: "32px 8em 4px 8em" }}
      >
        <Title level={1} style={{ textAlign: "center" }}>
          Bienvenue dans votre service &nbsp;
          <span style={{ color: "var(--app-color)" }}>
            <Typewriter
              words={[
                "Accueil",
                "Médical",
                "Pharmacie",
                "Dentaire",
                "Gynécologie",
                "Analayse",
                "Radiologie",
                "Hospitalisation",
                "Infirmerie",
              ]}
              loop={5}
              cursor
              cursorStyle="_"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
              // onLoopDone={handleDone}
              // onType={handleType}
            />
          </span>
        </Title>
        <Space size="large">
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 24 }} />}
            onClick={() => {
              navigate("/espace-administration/settings");
              sessionStorage.setItem(
                "serviceType",
                JSON.stringify(ServiceType.ADMINISTRATION)
              );
            }}
          />
          <Button
            type="primary"
            size="large"
            onClick={logout}
            icon={<LogoutOutlined />}
          >
            Déconnexion
          </Button>
        </Space>
      </Flex>
      <div className="container">
        {homeMenus.map((item) => (
          <HomeCard
            key={item.id}
            cover={item.cover}
            label={item.label}
            onClick={item.onClick}
            canAccess={
              userConnected.code_serv === item.code ||
              userConnected.role_name === "Admin"
            }
          />
        ))}
      </div>
    </Layout>
  );
}

export default Home;

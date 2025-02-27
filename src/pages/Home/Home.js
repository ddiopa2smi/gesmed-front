import "./Home.scss";
import { Button, Flex, Layout, Space, Typography, message, theme } from "antd";
import React from "react";
import medicine_image from "./../../assets/medicine_image.svg";
import pharma_image from "./../../assets/pharma_image.svg";
import dentist_image from "./../../assets/dentist_image.svg";
import gynecologie_image from "./../../assets/gyneco_image.svg";
import hospitalisation_image from "./../../assets/hospitalisation_image.svg";
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
import { codeServices, images } from "../../constants/app.constants";
import { ServiceType } from "../../utils/types/types.ts";
import { FaHome, FaTooth, FaUserNurse } from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";
import { MdAdminPanelSettings } from "react-icons/md";
import { MdLocalPharmacy } from "react-icons/md";
import { FaTruckMedical } from "react-icons/fa6";
import { FaVirus } from "react-icons/fa";
import { TbGenderAndrogyne } from "react-icons/tb";
import { IoMdQrScanner } from "react-icons/io";

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
      icon : <FaHome size={24} />
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
      icon : <MdLocalHospital size={24} />
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
      icon : <MdLocalPharmacy size={24} />
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
      icon : <FaTooth size={24} />
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
      icon : <TbGenderAndrogyne size={24} />
    },
    {
      id: 5,
      label: "Service Analyse",
      code: codeServices.BIO_MEDICAL, //codeServices.ANALYSE,
      cover: analyse_image,
      onClick: () => {
        navigate("/espace-analyse");
        sessionStorage.setItem("space", "sanalyse");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.ANALYSE)
        );
      },
      icon : <FaVirus size={24} />
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
      icon : <IoMdQrScanner size={24} />
    },

    {
      id: 8,
      label: "Service Hospitalisation",
      code: codeServices.HOSPITALISATION,
      cover: hospitalisation_image,
      onClick: () => {
        navigate("/espace-hospitalisation");
        sessionStorage.setItem("space", "shospitalisation");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.HOSPITALISATION)
        );
      },
      icon : <FaTruckMedical size={24} />

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
      icon: <FaUserNurse size={24} />
    },
    {
      id: 10,
      label: "Administration",  
      code: codeServices.ADMINISTRATION,
      cover: administration_image,
      onClick: () => {
        navigate("/espace-administration/settings");
        sessionStorage.setItem("space", "sadmin");
        sessionStorage.setItem(
          "serviceType",
          JSON.stringify(ServiceType.ADMINISTRATION)
        );
      },
      icon:<MdAdminPanelSettings size={24} />

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
    <Layout style={{ minHeight: "100vh" }} className="homeWrapper">
      <div className="homeContainer" >
        <Flex
          align="center"
          justify="space-between"
          style={{ margin: "32px 8em 4px 8em" }}
          className="home"
        >
          <img 
            src={images.logoWithoutBg}
            width={200}
            height={100}
            style={{
              objectFit :"cover",
              borderRadius:4
            }}
          />
          <Title level={1} style={{ textAlign: "center" }}>
            Bienvenue dans votre espace santé
            {/* &nbsp;
            <span style={{ color: "var(--app-color)" }}>
              <Typewriter
                words={[
                  "Accueil",
                  "Médical",
                  "Pharmacie",
                  "Dentaire",
                  "Gynécologie",
                  "Analyse",
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
            </span> */}
          </Title>
          <Space size="large">
            {userConnected.role_name === "Admin" && (
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
            )}

            <Button
              type="primary"
              style={{background:"var(--second-color)", color:"black"}}
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
              //cover={item.cover}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              canAccess={
                userConnected.code_serv === item.code ||
                userConnected.role_name === "Admin"
              }
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Home;

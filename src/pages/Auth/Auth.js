import {
  Button,
  Form,
  Input,
  Card,
  Carousel,
  theme,
  message,
  Typography,
  Progress,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./Auth.scss";
import axios from "axios";
import { API_URL } from "../../constants/environment.constants";
import image1 from "./../../assets/auth-img-1.jpg";
import image2 from "./../../assets/auth-img-2.jpg";
import Title from "antd/es/typography/Title";
import { Link } from "react-router-dom";
import { auth } from "../../actions/actions";
import { images } from "../../constants/app.constants";

const { Text } = Typography;

function Auth() {
  const {
    token: { colorBgElevated },
  } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION = 60; // secondes
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const isLocked = remainingSeconds > 0;

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds > 0]);

  const login = () => {
    if (isLocked) {
      return;
    }
    form
      .validateFields()
      .then((values) => {
        setLoading(true);
        auth(values)
          .then((response) => {
            if (response?.data && response?.data?.username !== null) {
              sessionStorage.setItem(
                "userConnected",
                JSON.stringify(response.data)
              );
              form.resetFields();
              setFailedAttempts(0);
              navigate("/home", { replace: true });
              message.success("Bienvenue dans votre espace de gestion");
            } else {
              const attempts = failedAttempts + 1;
              setFailedAttempts(attempts);
              if (attempts >= MAX_ATTEMPTS) {
                setRemainingSeconds(LOCK_DURATION);
                message.error(
                  `Trop de tentatives échouées, veuillez patienter ${LOCK_DURATION} secondes`
                );
              } else {
                message.error("Login et/ou mot de passe incorrect(s)");
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
        message.error(info.message);
        message.error("Veuillez svp renseigner toutes les informations");
      });
  };

  return (
    // <div className="AuthWrapper" style={{ background: colorBgElevated }}>
    //   <div className="AuthContainer">
    //     <Card style={{margin:8}} bordered>
    //       <Text>
    //         <h3>Connexion utilisateur</h3>
    //       </Text>
    //       <Form
    //         form={form}
    //         layout="vertical"
    //         name="login-form"
    //         onFinish={login}
    //       >
    //         <Form.Item
    //           label="Identifiant"
    //           name="login"
    //           rules={[
    //             {
    //               required: true,
    //               message: "Veuillez entrer votre nom d'utilisateur svp!",
    //             },
    //           ]}
    //         >
    //           <Input
    //             prefix={<UserOutlined className="site-form-item-icon" />}
    //             placeholder="Identifiant"
    //           />
    //         </Form.Item>
    //         <Form.Item
    //           label="Mot de passe"
    //           name="password"
    //           rules={[
    //             {
    //               required: true,
    //               message: "Veuillez svp entrer votre mot de passe!",
    //             },
    //           ]}
    //         >
    //           <Input.Password
    //             prefix={<LockOutlined className="site-form-item-icon" />}
    //             placeholder="Mot de passe"
    //           />
    //         </Form.Item>

    //         <div
    //           style={{
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //           }}
    //         >
    //           <Button
    //             loading={loading}
    //             type="primary"
    //             htmlType="submit"
    //             className="login-form-button"
    //           >
    //             Connexion
    //           </Button>
    //         </div>
    //       </Form>
    //     </Card>
    //   </div>
    // </div>
    <div className="AuthWrapper" style={{ background: colorBgElevated }}>
      <Carousel className="carousel-content" style={{ borderRadius: 10 }} autoplay>
        <div>
          <img src={image1} alt="image1" className="carousel-img" />
        </div>
        <div>
          <img src={image2} alt="image2" className="carousel-img" />
        </div>
      </Carousel>
      <div className="authWrapper">
        <Card
          className="AuthContainer"
          bordered={false}
          style={{ boxShadow: "none" }}
        >
          {/* <Title level={2} >
            Bienvenue sur votre espace de gestion 
          </Title> */}
          <center>
            <img
              //src={images.logoWithoutBg}
              src={images.logoWithoutBg}
              width={200}
              height={100}
              style={{
                //objectFit: "cover",
                objectFit: "contain",
                borderRadius: 4,
              }}
            />
          </center>
          <br />

          <div style={{ margin: 0 }}>
            <Title level={5} style={{ textAlign: "center" }} > Bienvenue sur l'espace de gestion médicale de la CSS. Veuillez vous authentifier pour continuer</Title>
            <br />
            <Form
              form={form}
              layout="vertical"
              name="login-form"
              onFinish={login}
            >
              <Form.Item
                label="Login"
                name="login"
                rules={[
                  {
                    required: true,
                    message: "Veuillez entrer votre nom d'utilisateur svp!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Entrer votre login"
                  size="large"
                  disabled={isLocked}
                />
              </Form.Item>
              <Form.Item
                label="Mot de passe"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Veuillez svp entrer votre mot de passe!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Entrer votre mot de passe"
                  size="large"
                  disabled={isLocked}
                />
              </Form.Item>

              {/* <Link style={{ textAlign: "end", color: "var(--app-color)" }}>
                Mot de passe oublié
              </Link> */}

              {isLocked && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="danger">
                    {`Trop de tentatives échouées. Réessayez dans ${remainingSeconds}s`}
                  </Text>
                  <Progress
                    percent={(remainingSeconds / LOCK_DURATION) * 100}
                    showInfo={false}
                    status="exception"
                  />
                </div>
              )}

              <br />


              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="login-form-button"
                size="large"
                style={{ width: "100%" }}
                disabled={isLocked}
              >
                Se connecter
              </Button>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Auth;

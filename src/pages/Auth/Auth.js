import { Button, Form, Input, Card, Carousel, theme, message, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import './Auth.scss'
import axios from "axios";
import { API_URL } from "../../constants/environment.constants";
import image1 from "./../../assets/auth-img-1.jpg"
import image2 from "./../../assets/auth-img-2.jpg"

const { Text } = Typography;

function Auth() {
  const {
    token: { colorBgElevated },
  } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const login = () => {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        axios.post(`${API_URL}/api/User/Connect`, values).then((response) => {
          setLoading(false);
          if (response.data.username !== null) {
            sessionStorage.setItem(
              "userConnected",
              JSON.stringify(response.data)
            );
            //navigate("/myspace/dashboard", { replace: true });
            navigate("/home", { replace: true });
            message.success("Bienvenue dans votre espace de gestion");
            form.resetFields();
          } else {
            setLoading(false);
            message.error("Login et/ou mot de passe incorrect(s)");
          }
        });
      })
      .catch((info) => {
        setLoading(false);
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
      <Carousel className="carousel-content" autoplay>
        <div>
          <img src={image1} alt="image1" className="carousel-img" />
        </div>
        <div>
          <img src={image2} alt="image2" className="carousel-img" />
        </div>
      </Carousel>
      <div className="authWrapper" >
        
        <Card className="AuthContainer">
          <Text>
            <h3>Bienvenue sur votre espace de gestion </h3>
          </Text>
          <br/>

          <div style={{margin:8}} bordered>
            <Text>
              Veuillez vous authentifier pour continuer
            </Text>
            <br/>
            <br/>
            <Form
              form={form}
              layout="vertical"
              name="login-form"
              onFinish={login}
            >
              <Form.Item
                label="Identifiant"
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
                  placeholder="Identifiant"
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
                  placeholder="Mot de passe"
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Connexion
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
     
    </div>
  );
}

export default Auth;

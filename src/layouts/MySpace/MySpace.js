import React, { useContext, useEffect, useRef, useState } from "react";
import "./MySpace.scss";
import {
  Outlet,
  useLocation,
  useMatch,
  useNavigate /*useParams*/,
} from "react-router";
//import { useDispatch, useSelector } from 'react-redux';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  DashboardOutlined,
  BellOutlined,
  SnippetsOutlined,
  ApartmentOutlined,
  FolderOutlined,
  EditOutlined,
  FileOutlined,
  StockOutlined,
  CarOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
  AppstoreOutlined,
  SafetyOutlined,
  HourglassOutlined,
  HomeOutlined,
  CalendarOutlined,
  SearchOutlined,
  LockOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  message,
  Statistic,
  Tooltip,
  Drawer,
  Typography,
  notification,
  Button,
  Breadcrumb,
  theme,
  AutoComplete,
  Input,
  Flex,
  Badge,
  Tag,
  Space,
  Affix,
  Popover,
} from "antd";
//import { setLightMode , setDarkMode } from './../../reducers/theme.reducers';
import { TbMoonStars } from "react-icons/tb";
import { HiOutlineSun } from "react-icons/hi";
import { postActions } from "../../actions/actions";
import { endpoints } from "../../constants/endpoints.constants";
import { ThemeContext } from "../../utils/providers/ThemeProvider";
import { Link, useSearchParams } from "react-router-dom";
import { getBreadCrumbLabel, logoutPopup } from "../../utils/helpers";
import LoadingBar from "react-top-loading-bar";
import { LoadingContext } from "../../utils/providers/LoadingProvider";
import logo from "./../../assets/logo.png";
import { RiStethoscopeFill, RiStethoscopeLine } from "react-icons/ri";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import useMenu from "../../utils/hooks/useMenu.tsx";
import { ServiceType } from "../../utils/types/types.ts";
import { Footer } from "antd/es/layout/layout";
import { images } from "../../constants/app.constants.js";
import { Breadcrumbs } from "../../components/common/Breadcrumbs/Breadcrumbs.js";
const { Header, Sider, Content } = Layout;
const { Countdown } = Statistic;
const { Text, Title } = Typography;

const mockVal = (str, repeat = 1) => ({
  value: str.repeat(repeat),
});

const MySpace = () => {
  const { isDark, setLightMode, setDarkMode } = useContext(ThemeContext);
  const { loadindRef } = useContext(LoadingContext);
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const space = sessionStorage.getItem("space");
  const serviceType = JSON.parse(sessionStorage.getItem("serviceType"));

  const { sideBarMenu } = useMenu({ serviceType: serviceType });
  //const dispatch = useDispatch();
  //const sizes = useSelector((state)=>state.sizesRdx.sizes);
  const location = useLocation();
  const splitLocation = location.pathname.split("/");
  const route = splitLocation[splitLocation.length - 1];

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  //const [isDark , setisDark] = useState(useSelector((state)=>state.themeRdx.isDark));
  const [currentSelectedKeys, setCurrentSelectedKeys] = useState(null);
  //const [deadline , setDeadline] = useState(Date.now() + 1000 * 60 * 30); // 30min

  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const [breadCrumbItems, setBreadCrumbItems] = useState([]);

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

  const profilMenu = [
    {
      key: 1,
      icon: <UserOutlined />,
      label: "Mon profil",
      onClick: () => navigate("/myspace/settings/profil"),
    },
    {
      type: "divider",
    },
    {
      key: 2,
      icon: <LogoutOutlined />,
      label: "Déconnexion",
      onClick: logout,
    },
  ];

  const handleLightMode = () => {
    setLightMode();
  };

  const handleDarkMode = () => {
    setDarkMode();
  };

  const menu = (
    <Menu
      theme="light"
      mode="inline"
      defaultSelectedKeys={currentSelectedKeys}
      selectedKeys={[currentSelectedKeys]}
      style={{
        border: "none",
        fontSize: 14,
        width: "100%",
        padding: "0px 12px",
        background: "transparent",
      }}
      items={[
        {
          key: "grp",
          label: (
            <Text style={{ color: "var(--app-color)", fontSize: 16  }} strong>
              {serviceType === ServiceType.ADMINISTRATION
                ? "ADMINISTRATION"
                : `SERVICE ${serviceType}`}
            </Text>
          ),
          type: "group",
          children: sideBarMenu,
        },
      ]}
    />
  );

  useEffect(() => {
    if (
      !userConnected ||
      userConnected === undefined ||
      userConnected === null
    ) {
      navigate("/", { replace: true });
    }
    return () => {};
  }, []);

  useEffect(() => {
    const pathname = location.pathname;
    const splitPathname = pathname.split("/");
    const breadCItems = [
      {
        title: (
          <Link to="/home">
            {" "}
            <HomeOutlined />{" "}
          </Link>
        ),
      },
    ];
    let link = "";
    splitPathname.forEach((element, index) => {
      if (element !== "") {
        link += `/${element}`;
        if (index === splitPathname.length - 1) {
          breadCItems.push({
            title: getBreadCrumbLabel(element),
          });
        } else {
          // if ((element !== "myspace") && (element !== "settings")) {
          //     breadCItems.push({
          //         title : <Link to={link} > {getBreadCrumbLabel(element)} </Link>
          //     })
          // }
          breadCItems.push({
            title: (
              <Link to={link} state={location.state}>
                {" "}
                {getBreadCrumbLabel(element)}{" "}
              </Link>
            ),
          });
        }
      }
    });
    setBreadCrumbItems(breadCItems);

    return () => {
      setCurrentSelectedKeys(null);
    };
  }, [route, location]);

  useEffect(() => {
    sideBarMenu.forEach((element) => {
      if (location.pathname.includes(element?.key)) {
        setCurrentSelectedKeys(element?.key);
      }
    });
  }, [location , sideBarMenu]);

  // const [value, setValue] = useState('');
  // const [options, setOptions] = useState([]);
  // const [anotherOptions, setAnotherOptions] = useState([]);
  // const getPanelValue = (searchText) =>
  //     !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)];
  // const onSelect = (data) => {
  //     console.log('onSelect', data);
  // };

  let screenWidth = window.innerWidth;
  ///console.log(screenWidth)
  // const [screenWidth , setScreenWidth] = useState(window.innerWidth)
  // useEffect(() => {
  //     setScreenWidth(window.innerWidth)
  //     console.log(screenWidth)
  // }, [screenWidth])

  const screens = useBreakpoint(); // Hook to get current screen size

  return (
    <div className="MySpaceWrapper">
      <LoadingBar color={colorPrimary} ref={loadindRef} />
      <Layout>
        {/* <Affix offsetTop={0}>
          <div className="sider-container" style={{ height: "100vh" }}>
            <Sider
              style={{
                // overflow: "auto",
                height: "100%",
                // flex: "0 0 208px",
                // boxSizing: "border-box",
                // position: "fixed",
                // top: 56,
                // left: 0,
                // bottom: 0,
                // zIndex: 2,
              }}
              theme="light"
              trigger={null}
              collapsible
              collapsed={collapsed}
              breakpoint="lg"
              width={"20vw"}
              //collapsedWidth="0"
              //width={screens.xxl ? 300 : "20%"}
            >
              <Flex justify="center" align="center" style={{ height: "56px" }}>
                <Text strong>GESMED</Text>
              </Flex>
              {menu}
            </Sider>
          </div>
        </Affix> */}
        <div className="sider-container" style={{ height: "100vh" }}>
          <Sider
            style={{
              // overflow: "auto",
              height: "100%",
              // flex: "0 0 208px",
              // boxSizing: "border-box",
              // position: "fixed",
              // top: 56,
              // left: 0,
              // bottom: 0,
              // zIndex: 2,
            }}
            theme="light"
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="lg"
            width={"20vw"}
            //collapsedWidth="0"
            //width={screens.xxl ? 300 : "20%"}
          >
            <Flex justify="center" align="center" style={{ height: "56px" }}>
              {/* <Text strong>GESMED</Text> */}
              <img src={images.logoWithoutBg}  height={56} style={{objectFit:"cover"}} />
            </Flex>
            {menu}
          </Sider>
        </div>
        <Drawer
          placement={"left"}
          closable={false}
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          width={300}
        >
          {menu}
        </Drawer>

        <Layout className="site-layout">
          <Affix offsetTop={0.1}>
            <Header
              className="header"
              style={{
                backgroundColor: isDark
                  ? "rgba(78, 78, 78, 0.3)"
                  : "rgba(255,255,255, 0.7)",
                //rgb(255 255 255 /0.3)
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Flex align="center">
                  {React.createElement(
                    collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                    {
                      className: "trigger default-layout-ham",
                      onClick: () => setCollapsed(!collapsed),
                    }
                  )}

                  {React.createElement(MenuFoldOutlined, {
                    className: "trigger not-default-layout-ham",
                    onClick: () => setOpen(true),
                  })}

                  <Link to={"/home"}>Accueil</Link>

                  {/* <AutoComplete
                                    className='auto-complete'
                                    options={options}
                                    style={{
                                        width: 350,
                                    }}
                                    onSelect={onSelect}
                                    onSearch={(text) => setOptions(getPanelValue(text))}
                                    
                                    placeholder="Rechercher..."
                                /> */}
                </Flex>
                <div className="header-right">
                  {isDark ? (
                    <Tooltip placement="bottomRight" title={<>Mode Sombre</>}>
                      <Button
                        type="text"
                        icon={<TbMoonStars size={24} />}
                        onClick={() => handleLightMode()}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip placement="bottomRight" title={<>Mode clair</>}>
                      <Button
                        type="text"
                        icon={<HiOutlineSun size={24} />}
                        onClick={() => handleDarkMode()}
                      />
                    </Tooltip>
                  )}

                  <Popover
                    content={<>Aucune notification </>}
                    title="Notifications"
                    trigger="click"
                    placement="bottom"
                  >
                    <Tooltip placement="bottomRight" title={<>Notifications</>}>
                      <Badge count={0}>
                        <Button
                          type="text"
                          icon={<BellOutlined style={{ fontSize: 24 }} />}
                        />
                      </Badge>
                    </Tooltip>
                  </Popover>
                  <Dropdown
                    menu={{
                      items: profilMenu,
                    }}
                  >
                    <Button
                      type="text"
                      size="large"
                      icon={
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ cursor: "pointer" }}
                        />
                      }
                    >
                      <Text>
                        {userConnected ? userConnected?.username : ""} <br />{" "}
                        <div style={{ marginTop: -5 }}>
                          {" "}
                          {userConnected?.role_name}{" "}
                        </div>
                      </Text>
                    </Button>
                  </Dropdown>
                </div>
              </div>
            </Header>
          </Affix>

          <Content
            className="content"
            // style={{
            //   marginLeft:
            //     screenWidth > 992
            //       ? collapsed
            //         ? "5%"
            //         : screens.xxl
            //         ? screenWidth >= 1600 && screenWidth <= 1670
            //           ? "18.3%"
            //           : "16%"
            //         : "20%"
            //       : 0,
            // }}
          >
            <Breadcrumb items={breadCrumbItems} />
            {/* <Breadcrumbs /> */}
            <br />
            <Outlet />
            {/* <div className="footer">
              <Text>
                {" "}
                Réalisé par &nbsp;{" "}
                <a
                  style={{ color: "var(--app-color)" }}
                  href="https://a2smi.tech/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {" "}
                  A2SMI{" "}
                </a>
              </Text>
            </div> */}
          </Content>

          <Footer
            style={{
              textAlign: "center",
              position: "sticky",
              alignItems: "center",
              bottom: 0,
              zIndex: 5,
              padding: 8,
              backgroundColor: isDark
                ? "rgba(78, 78, 78, 0.3)"
                : "rgba(255,255,255, 0.7)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Text>
              Gesmed ©{new Date().getFullYear()} réalisé par{" "}
              <a
                style={{ color: "var(--app-color)" }}
                href="https://a2smi.tech/"
                target="_blank"
                rel="noreferrer"
              >
                A2SMI
              </a>
            </Text>
          </Footer>
        </Layout>
      </Layout>
    </div>
  );
};
export default MySpace;

import React, { useContext, useEffect, useRef, useState } from 'react';
import "./MySpace.scss";
import { Outlet, useLocation, useNavigate, /*useParams*/ } from 'react-router';
//import { useDispatch, useSelector } from 'react-redux';
import { MenuFoldOutlined,MenuUnfoldOutlined,UserOutlined, LogoutOutlined , SettingOutlined, TeamOutlined, DashboardOutlined, BellOutlined, SnippetsOutlined, ApartmentOutlined, FolderOutlined, EditOutlined, FileOutlined, StockOutlined, CarOutlined, RightCircleOutlined, LeftCircleOutlined, AppstoreOutlined, SafetyOutlined, HourglassOutlined, HomeOutlined, CalendarOutlined, SearchOutlined, LockOutlined, ThunderboltOutlined} from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu , message , Statistic, Tooltip, Drawer, Typography, notification, Button, Breadcrumb, theme, AutoComplete, Input, Flex} from 'antd';
//import { setLightMode , setDarkMode } from './../../reducers/theme.reducers';
import {TbMoonStars} from "react-icons/tb";
import {HiOutlineSun} from "react-icons/hi";
import { postActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import { ThemeContext } from '../../utils/providers/ThemeProvider';
import { Link } from 'react-router-dom';
import { getBreadCrumbLabel, logoutPopup } from '../../utils/helpers';
import LoadingBar from 'react-top-loading-bar';
import { LoadingContext } from '../../utils/providers/LoadingProvider';
import logo from './../../assets/logo.png'
import { RiStethoscopeFill } from 'react-icons/ri';

const { Header, Sider, Content } = Layout;
const { Countdown } = Statistic;
const {Text,Title} = Typography;


const mockVal = (str, repeat = 1) => ({
    value: str.repeat(repeat),
});

const MySpace = () => {
    const {isDark , setLightMode , setDarkMode} = useContext(ThemeContext);
    const {loadindRef} = useContext(LoadingContext);
    const {token: { colorPrimary },} = theme.useToken();
    const space = sessionStorage.getItem("space");

    //const dispatch = useDispatch();
    //const sizes = useSelector((state)=>state.sizesRdx.sizes);
    const location = useLocation();
    const splitLocation = location.pathname.split("/");
    const route = splitLocation[splitLocation.length-1];
	const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [open, setOpen] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    //const [isDark , setisDark] = useState(useSelector((state)=>state.themeRdx.isDark));
    const [currentSelectedKeys , setCurrentSelectedKeys] = useState(null);
	//const [deadline , setDeadline] = useState(Date.now() + 1000 * 60 * 30); // 30min
    
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const [breadCrumbItems , setBreadCrumbItems] = useState([]);

    

    const  logout = () => {
        logoutPopup()
        .then((result)=>{
            if(result.isConfirmed){
                postActions(`${endpoints.users.DISCONNECT}`, userConnected)
                .then((response)=>{
                    console.log(response.data);
                    if (response.data.Disconnect === true) {
                        sessionStorage.clear();
                        navigate("/" , {replace : true});
                        message.success("Déconnexion éffectuée avec succès");
                    }
                    else {
                        message.error("Erreur de déconnexion")
                    }
                })
            }
        })
    }
    
    const profilMenu = [
        {
			key : 1 ,
			icon : <UserOutlined /> ,
			label : "Mon profil" ,
			onClick : ()=> navigate("/myspace/settings/profil")
		} ,
		{
			type: 'divider',
		},
		{
			key : 2 ,
			icon : <LogoutOutlined /> ,
			label : "Déconnexion" ,
			onClick : logout
		} ,
	]

    const handleLightMode = () => {
		// setisDark(false);
		// dispatch(setLightMode())
        setLightMode()
    }

    const handleDarkMode = () => {
		// setisDark(true);
        // dispatch(setDarkMode());
        setDarkMode()
    }


    const medicalMenu = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined  />,
            label: "Tableau de bord " ,
            title: "Tableau de bord " ,
            onClick : ()=>{navigate("/myspace/dashboard")} ,
        },
        space === "smed" && {
            key: 'rendez-vous',
            icon: <CalendarOutlined  />,
            label: "Liste des rendez-vous" , 
            title: "Liste des rendez-vous" , 
            onClick : ()=>{navigate("/myspace/rendez-vous")}
        },
        space === "smed" && {
            key: 'mon-agenda',
            icon: <CalendarOutlined  />,
            label: "Mon agenda" , 
            title: "Mon agenda" , 
            onClick : ()=>{navigate("/myspace/mon-agenda")}
        },
        space === "smed" && {
            key: 'patients',
            icon: <TeamOutlined  />,
            label: "Liste des patients" , 
            title: "Liste des patients" , 
            onClick : ()=>{navigate("/myspace/patients")}
        },
        space === "smed" && {
            key: 'consultations',
            icon: <SnippetsOutlined  />,
            label: "Liste des consultations" , 
            title: "Liste des consultations" , 
            onClick : ()=>{navigate("/myspace/consultations")}
            
        },
        space === "smed" && {
            key: 'visites',
            icon: <ApartmentOutlined  />,
            label: "Visite des lieux" , 
            title: "Visite des lieux" , 
            onClick : ()=>{navigate("/myspace/visites")}
            
        },
        
        space === "smed" && {
            key: 'dossier-accident-travail',
            icon: <FolderOutlined  />,
            label: "Dossier AT" , 
            title: "Dossier AT" , 
            onClick : ()=>{navigate("/myspace/dossier-accident-travail")}
            
        },
    ]

    const pharmacieMenu = [
        space === "spharma" && {
            key: 'gestion-fiche-produits',
            icon: <FileOutlined  />,
            label: "Gestion fiche produits" , 
            title: "Gestion fiche produits" , 
            onClick : ()=>{navigate("/myspace/gestion-fiche-produits")}
        },
        space === "spharma" && {
            key: 'commandes-produits',
            icon: <AppstoreOutlined  />,
            label: "Commandes Produits" , 
            title: "Commandes Produits" , 
            onClick : ()=>{navigate("/myspace/commandes-produits")}
            
        },
        space === "spharma" && {
            key: 'entrees-produits',
            icon: <RightCircleOutlined  />,
            label: "Entrées Produits" , 
            title: "Entrées Produits" , 
            onClick : ()=>{navigate("/myspace/entrees-produits")},
            
        },
        space === "spharma" && {
            key: 'sorties-produits',
            icon: <LeftCircleOutlined  />,
            label: "Sorties Produits" , 
            title: "Sorties Produits" , 
            onClick : ()=>{navigate("/myspace/sorties-produits")}
            
        },
        space === "spharma" && {
            key: 'situation-stocks',
            icon: <StockOutlined  />,
            label: "Situation des stocks" , 
            title: "Situation des stocks" , 
            onClick : ()=>{navigate("/myspace/situation-stocks")}
            
        },
        space === "spharma" && {
            key: 'saisie-inventaire',
            icon: <EditOutlined  />,
            label: "Saisie Inventaire" , 
            title: "Saisie Inventaire" , 
            onClick : ()=>{navigate("/myspace/saisie-inventaire")}
            
        },
        space === "spharma" && {
            key: 'fournisseurs',
            icon: <CarOutlined  />,
            label: "Liste des fournisseurs" , 
            title: "Liste des fournisseurs" , 
            onClick : ()=>{navigate("/myspace/fournisseurs")}
            
        },
    ]


    const gynecologieMenu = [
        space === "sgynecologie" && {
            key: 'home',
            icon: <HomeOutlined  />,
            label: "Accueil" , 
            title: "Accueil" , 
            onClick : ()=>{navigate("/espace-gynecologie/home")}
        },
       
    ]


    const dentistMenu = [
        space === "sdentist" && {
            key: 'home',
            icon: <HomeOutlined  />,
            label: "Accueil" , 
            title: "Accueil" , 
            onClick : ()=>{navigate("/espace-dentist/home")}
        },
        space === "sdentist" && {
            key: 'appointments',
            icon: <CalendarOutlined  />,
            label: "Réservations" , 
            title: "Réservations" , 
            onClick : ()=>{navigate("/espace-dentist/appointments")}
        },
        space === "sdentist" && {
            key: 'patients',
            icon: <TeamOutlined />,
            label: "Patients" , 
            title: "Patients" , 
            onClick : ()=>{navigate("/espace-dentist/patients")}
        },
        space === "sdentist" && {
            key: 'treatments',
            icon: <RiStethoscopeFill />,
            label: "Treatments" , 
            title: "Treatments" , 
            onClick : ()=>{navigate("/espace-dentist/treatments")}
        },
        space === "sdentist" && {
            key: 'peripherals',
            icon: <ThunderboltOutlined />,
            label: "Périphériques" , 
            title: "Périphériques" , 
            onClick : ()=>{navigate("/espace-dentist/peripherals")}
        },
        space === "sdentist" && {
            key: 'staff',
            icon: <UserOutlined />,
            label: "Staff" , 
            title: "Staff" , 
            onClick : ()=>{navigate("/espace-dentist/staff")}
        },
    ]

    const othersMenu = [
        {
            key: 'facturation',
            icon: <ApartmentOutlined  />,
            label: "Facturation" , 
            title: "Facturation" , 
            onClick : ()=>{navigate("/myspace/facturation")}
            
        },
        {
            key : "settings" ,
            label: "Paramètres" , 
            title: "Paramètres" , 
            icon: <SettingOutlined  />,
            children : [
                {
                    key: 'accounts',
                    icon: <TeamOutlined  />,
                    label: "Comptes" , 
                    title: "Comptes" , 
                    onClick : ()=>{navigate("/myspace/settings/accounts")}
                },
                // {
                //     key: 'users',
                //     icon: <TeamOutlined  />,
                //     label: "Utilisateurs" , 
                //     title: "Utilisateurs" , 
                //     onClick : ()=>{navigate("/myspace/users")}
                // },
                {
                    key: 'privileges',
                    icon: <SafetyOutlined  />,
                    label: "Privilèges" , 
                    title: "Privilèges" , 
                    onClick : ()=>{navigate("/myspace/settings/privileges")}
                },
                {
                    key: 'gestion-mot-de-passe',   
                    label: "Gestion de mot de passe" , 
                    title: "Gestion de mot de passe" , 
                    icon: <LockOutlined  />,
                    onClick : ()=>{navigate("/myspace/settings/gestion-mot-de-passe")}   
                },
                {
                    key: 'profil',   
                    label: "Mon profil" , 
                    title: "Mon profil" , 
                    icon: <UserOutlined  />,
                    onClick : ()=>{navigate("/myspace/settings/profil")}   
                },
            ]
        }
    ]
    

    const menu = (
        <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={currentSelectedKeys}
            selectedKeys={[currentSelectedKeys]}
            style={{
                border:"none",
                fontSize :14 ,
                width : "100%",
                background : "transparent"
            }}
            items={[...medicalMenu, ...pharmacieMenu , ...dentistMenu , ...gynecologieMenu , ...othersMenu ,
                // {
                //     key: 'dashboard',
                //     icon: <DashboardOutlined  />,
                //     label: "Tableau de bord " ,
                //     title: "Tableau de bord " ,
                //     onClick : ()=>{navigate("/myspace/dashboard")} ,
                // },
                // space === "smed" && {
                //     key: 'rendez-vous',
                //     icon: <CalendarOutlined  />,
                //     label: "Liste des rendez-vous" , 
                //     title: "Liste des rendez-vous" , 
                //     onClick : ()=>{navigate("/myspace/rendez-vous")}
                // },
                // space === "smed" && {
                //     key: 'mon-agenda',
                //     icon: <CalendarOutlined  />,
                //     label: "Mon agenda" , 
                //     title: "Mon agenda" , 
                //     onClick : ()=>{navigate("/myspace/mon-agenda")}
                // },
                // space === "smed" && {
                //     key: 'patients',
                //     icon: <TeamOutlined  />,
                //     label: "Liste des patients" , 
                //     title: "Liste des patients" , 
                //     onClick : ()=>{navigate("/myspace/patients")}
                // },
                // space === "smed" && {
                //     key: 'consultations',
                //     icon: <SnippetsOutlined  />,
                //     label: "Liste des consultations" , 
                //     title: "Liste des consultations" , 
                //     onClick : ()=>{navigate("/myspace/consultations")}
                    
                // },
                // space === "smed" && {
                //     key: 'visites',
                //     icon: <ApartmentOutlined  />,
                //     label: "Visite des lieux" , 
                //     title: "Visite des lieux" , 
                //     onClick : ()=>{navigate("/myspace/visites")}
                    
                // },
                
                // space === "smed" && {
                //     key: 'dossier-accident-travail',
                //     icon: <FolderOutlined  />,
                //     label: "Dossier AT" , 
                //     title: "Dossier AT" , 
                //     onClick : ()=>{navigate("/myspace/dossier-accident-travail")}
                    
                // },
                // {
                //     key: 'facturation',
                //     icon: <ApartmentOutlined  />,
                //     label: "Facturation" , 
                //     title: "Facturation" , 
                //     onClick : ()=>{navigate("/myspace/facturation")}
                    
                // },
                // space === "spharma" && {
                //     key: 'fiche-produit',
                //     icon: <FileOutlined  />,
                //     label: "Fiche Produit" , 
                //     title: "Fiche Produit" , 
                //     onClick : ()=>{navigate("/myspace/fiche-produit")}
                // },
                // space === "spharma" && {
                //     key: 'gestion-fiche-produits',
                //     icon: <FileOutlined  />,
                //     label: "Gestion fiche produits" , 
                //     title: "Gestion fiche produits" , 
                //     onClick : ()=>{navigate("/myspace/gestion-fiche-produits")}
                // },
                // space === "spharma" && {
                //     key: 'commandes-produits',
                //     icon: <AppstoreOutlined  />,
                //     label: "Commandes Produits" , 
                //     title: "Commandes Produits" , 
                //     onClick : ()=>{navigate("/myspace/commandes-produits")}
                    
                // },
                // space === "spharma" && {
                //     key: 'entrees-produits',
                //     icon: <RightCircleOutlined  />,
                //     label: "Entrées Produits" , 
                //     title: "Entrées Produits" , 
                //     onClick : ()=>{navigate("/myspace/entrees-produits")},
                    
                // },
                // space === "spharma" && {
                //     key: 'sorties-produits',
                //     icon: <LeftCircleOutlined  />,
                //     label: "Sorties Produits" , 
                //     title: "Sorties Produits" , 
                //     onClick : ()=>{navigate("/myspace/sorties-produits")}
                    
                // },
                // space === "spharma" && {
                //     key: 'situation-stocks',
                //     icon: <StockOutlined  />,
                //     label: "Situation des stocks" , 
                //     title: "Situation des stocks" , 
                //     onClick : ()=>{navigate("/myspace/situation-stocks")}
                    
                // },
                // space === "spharma" && {
                //     key: 'saisie-inventaire',
                //     icon: <EditOutlined  />,
                //     label: "Saisie Inventaire" , 
                //     title: "Saisie Inventaire" , 
                //     onClick : ()=>{navigate("/myspace/saisie-inventaire")}
                    
                // },
                // space === "spharma" && {
                //     key: 'fournisseurs',
                //     icon: <CarOutlined  />,
                //     label: "Liste des fournisseurs" , 
                //     title: "Liste des fournisseurs" , 
                //     onClick : ()=>{navigate("/myspace/fournisseurs")}
                    
                // },
                // {
                //     key : "settings" ,
                //     label: "Paramètres" , 
                //     title: "Paramètres" , 
                //     icon: <SettingOutlined  />,
                //     children : [
                //         {
                //             key: 'accounts',
                //             icon: <TeamOutlined  />,
                //             label: "Comptes" , 
                //             title: "Comptes" , 
                //             onClick : ()=>{navigate("/myspace/settings/accounts")}
                //         },
                //         // {
                //         //     key: 'users',
                //         //     icon: <TeamOutlined  />,
                //         //     label: "Utilisateurs" , 
                //         //     title: "Utilisateurs" , 
                //         //     onClick : ()=>{navigate("/myspace/users")}
                //         // },
                //         {
                //             key: 'privileges',
                //             icon: <SafetyOutlined  />,
                //             label: "Privilèges" , 
                //             title: "Privilèges" , 
                //             onClick : ()=>{navigate("/myspace/settings/privileges")}
                //         },
                //         {
                //             key: 'gestion-mot-de-passe',   
                //             label: "Gestion de mot de passe" , 
                //             title: "Gestion de mot de passe" , 
                //             icon: <LockOutlined  />,
                //             onClick : ()=>{navigate("/myspace/settings/gestion-mot-de-passe")}   
                //         },
                //         {
                //             key: 'profil',   
                //             label: "Mon profil" , 
                //             title: "Mon profil" , 
                //             icon: <UserOutlined  />,
                //             onClick : ()=>{navigate("/myspace/settings/profil")}   
                //         },
                //     ]
                // }
            ]}
        />
    )

    useEffect(() => {
        if ( !userConnected || userConnected === undefined || userConnected === null  ) {
            navigate('/' , {replace : true});
        }
        return () => {
        }
    }, [])
    

    useEffect(()=>{
        
        switch (route) {
            case "myspace":
                setCurrentSelectedKeys("dashboard");
                break;
            case "dashboard":
                setCurrentSelectedKeys("dashboard");
                break;
            case "new-rv":
                setCurrentSelectedKeys("patients");
                break;
            case "mon-agenda":
                setCurrentSelectedKeys("mon-agenda");
                break;
            case "dossier":
                setCurrentSelectedKeys("patients");
                break;
            case "consultation":
                setCurrentSelectedKeys("patients");
                break;
            case "prescriptions":
                setCurrentSelectedKeys("patients");
                break;
            case "infos-cliniques":
                setCurrentSelectedKeys("patients");
                break;
            case "ordonnance":
                setCurrentSelectedKeys("patients");
                break;
            case "analyse":
                setCurrentSelectedKeys("patients");
                break;
            case "imagerie":
                setCurrentSelectedKeys("patients");
                break;
            case "consultations":
                setCurrentSelectedKeys("consultations");
                break;
            case "details-consultation":
                    setCurrentSelectedKeys("consultations");
                    break;
            case "visites":
                setCurrentSelectedKeys("visites");
                break;
            case "dossier-accident-travail":
                setCurrentSelectedKeys("dossier-accident-travail");
                break;
            case "gestion-fiche-produits":
                setCurrentSelectedKeys("gestion-fiche-produits");
                break;
            case "fiche-produit":
                setCurrentSelectedKeys("gestion-fiche-produits");
                break;
            case "commandes-produits":
                setCurrentSelectedKeys("commandes-produits");
                break;
            case "new-commande-produit":
                setCurrentSelectedKeys("commandes-produits");
                break;
            case "entrees-produits":
                setCurrentSelectedKeys("entrees-produits");
                break;
            case "reception-commande":
                setCurrentSelectedKeys("entrees-produits");
                break;
            case "sorties_produits":
                setCurrentSelectedKeys("sorties_produits");
                break;
            // case "mouvements-sorties":
            //     setCurrentSelectedKeys("mouvements-sorties");
            //     break;
            case "situation-stocks":
                setCurrentSelectedKeys("situation-stocks");
                break;
            case "new-mouvement-sortie":
                setCurrentSelectedKeys("sorties_produits");
                break;
            case "saisie-inventaire":
                setCurrentSelectedKeys("saisie-inventaire");
                break;
            case "fournisseurs":
                setCurrentSelectedKeys("fournisseurs");
                break;
            case "settings":
                setCurrentSelectedKeys("settings");
                break;
            case "users":
                setCurrentSelectedKeys("users");
                break;
            case "accounts":
                setCurrentSelectedKeys("accounts");
                break;
            case "account":
                setCurrentSelectedKeys("accounts");
                break;
            case "privileges":
                setCurrentSelectedKeys("privileges");
                break;
            case "privilege":
                setCurrentSelectedKeys("privileges");
                break;
            case "profil":
                setCurrentSelectedKeys("profil");
                break;
            case "gestion-mot-de-passe":
                setCurrentSelectedKeys("gestion-mot-de-passe");
                break;
            default:
                setCurrentSelectedKeys(route);
                break;
        }
        
        const pathname = location.pathname;
        const splitPathname = pathname.split("/");
        const breadCItems = [{
            title : <Link to="/home" > <HomeOutlined/> </Link>
        }]

        let link = "";
        splitPathname.forEach((element , index) => {
            if (element !== "") {
                link+=`/${element}`;
                if (index === splitPathname.length -1) {
                    breadCItems.push({
                        title : getBreadCrumbLabel(element)
                    })
                }else{
                    // if ((element !== "myspace") && (element !== "settings")) {
                    //     breadCItems.push({
                    //         title : <Link to={link} > {getBreadCrumbLabel(element)} </Link>
                    //     })
                    // }
                    breadCItems.push({
                        title : <Link to={link} > {getBreadCrumbLabel(element)} </Link>
                    })
                }
            }
        });
        setBreadCrumbItems(breadCItems)
        
        return ()=>{
            setCurrentSelectedKeys(null);
        }
        
	},[route , location])


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
    

    return (
        <div className="MySpaceWrapper">
            <LoadingBar color={colorPrimary} ref={loadindRef} />
            <Layout>  
                <div className='sider-container' style={{height:"100vh"}} >
                    <Sider style={{
                            overflow:"auto",
                            maxHeight:"100%",
                            flex : "0 0 208px",
                            boxSizing:"border-box",
                            position : "fixed",
                            top : 56,
                            left : 0,
                            bottom: 0,
                            zIndex : 2
                            
                        }} 
                        theme="light" 
                        trigger={null} 
                        collapsible 
                        collapsed={collapsed}
                        //width={250}
                        width={"20%"}
                    >  
                        {menu}
                    </Sider>
                </div> 

                <Drawer
                    placement={"left"}
                    closable={false}
                    open={open}
                    onClose={()=>{setOpen(false)}}
                    width={300}
                >
                    {menu}
                </Drawer>    
            
                <Layout className="site-layout">
                    <Header
                        className='header'
                        style={{
                            backgroundColor : isDark ? 'rgba(78, 78, 78, 0.3)' : 'rgba(255,255,255, 0.7)'
                            //rgb(255 255 255 /0.3)
                        }}
                    >
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center",width : collapsed ? "6%" : "25%",transition : "all ease-in 0.2s"}} >
                            <h3>GESMED</h3>
                        </div>
                        <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}} >
                            <Flex align='center' >
                                {
                                    React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                        className: 'trigger default-layout-ham',
                                        onClick: () => setCollapsed(!collapsed),

                                    })
                                }

                                {
                                    React.createElement(MenuFoldOutlined, {
                                        className: 'trigger not-default-layout-ham',
                                        onClick: () => setOpen(true),
                                    })
                                }

                                <Link to={"/home"} >Accueil</Link>


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
                            <div className='header-right' >
                            
                                {
                                    isDark ?
                                    <Tooltip placement="bottomRight" title={<>Mode Sombre</>} >
                                        <Button  type='text' icon={<TbMoonStars size={24} /> } onClick={()=> handleLightMode()} />
                                    </Tooltip>
                                    :
                                    <Tooltip placement="bottomRight" title={<>Mode clair</>}  >
                                        <Button  type='text' icon={<HiOutlineSun size={24} /> } onClick={()=> handleDarkMode()} />
                                    </Tooltip>
                                }   &nbsp;&nbsp;&nbsp;

                                <Tooltip placement="bottomRight" title={<>Notifications</>}  >
                                    <Button  type='text' icon={<BellOutlined style={{fontSize : 24}} /> } onClick={()=>{setOpenDrawer(true)}} /> 
                                </Tooltip>
                                &nbsp;&nbsp;&nbsp;

                                <Dropdown
                                    menu={{
                                        items : profilMenu ,
                                    }}
                                >
                                    <Button type='text' icon={<Avatar size="small" icon={<UserOutlined/>} style={{ cursor:'pointer'}} />} >
                                        <Text>  { userConnected ? userConnected?.username : ""} </Text>
                                    </Button> 
                                </Dropdown>
                                &nbsp;
                                
                                
                            </div>
                        </div>
                       
                    </Header>
                    
                    <Content className='content' style={{marginLeft: screenWidth > 992 ? (collapsed ? "6%" : "20%") : 0}} >
                        
                        <Breadcrumb items={breadCrumbItems}/> 
                        <br/>
                        <Outlet />
                        <div className='footer'>
                            <Text> Réalisé par &nbsp; <a style={{color:"var(--app-color)"}} href='https://a2smi.tech/' target="_blank" rel="noreferrer" > A2SMI </a></Text>
                        </div>
                    </Content>

                    <Drawer title="Mes notifications" placement="right" onClose={()=>{setOpenDrawer(false)}} open={openDrawer}>
                        <Text>Aucune notification</Text>
                    </Drawer>

                </Layout>
            </Layout>
        </div>
      
    );
};
export default MySpace;
  
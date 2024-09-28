import './Home.scss'
import { Space, Typography, theme } from 'antd'
import React from 'react'
import medicine_image from './../../assets/medicine_image.svg'
import pharma_image from './../../assets/pharma_image.svg'
import dentist_image from './../../assets/dentist_image.svg'
import gynecologie_image from './../../assets/gynecologie_image.svg'
import radiologie_image from './../../assets/radiologie_image.svg'
import analyse_image from './../../assets/analyse_image.svg'
import { useNavigate } from 'react-router-dom'
import HomeCard from '../../components/specific/HomeCard/HomeCard'
const {Title} = Typography;


function Home() {
    const navigate = useNavigate();
    const homeMenus = [
        {
            id : 1,
            label : "Service médical",
            cover : medicine_image ,
            onClick : ()=>{
                
                navigate("/myspace/dashboard")
                sessionStorage.setItem("space","smed")
                
            }
        },
        {
            id : 2,
            label : "Service pharmacie",
            cover : pharma_image ,
            onClick : ()=>{
                navigate("/myspace/dashboard")
                sessionStorage.setItem("space","spharma")
            }
        },
        {
            id : 3,
            label : "Service dentiste",
            cover : dentist_image ,
            onClick : ()=>{
                navigate("/espace-dentist")
                sessionStorage.setItem("space","sdentist")
            }
        },
        {
            id : 4,
            label : "Service Gynécologie",
            cover : gynecologie_image ,
            onClick : ()=>{
                navigate("/espace-gynecologie")
                sessionStorage.setItem("space","sgynecologie")
            }
        },
        {
            id : 5,
            label : "Service Analyse",
            cover : analyse_image ,
            onClick : ()=>{
                navigate("/espace-analyse")
                sessionStorage.setItem("space","sanalyse")
            }
        },
        {
            id : 6,
            label : "Service Radiologie",
            cover : radiologie_image ,
            onClick : ()=>{
                navigate("/espace-radiologie")
                sessionStorage.setItem("space","sradio")
            }
        }
    
    ]
    const {
        token: { colorBgElevated },
    } = theme.useToken();
    return (
        <div style={{background : colorBgElevated , width :"100%",minHeight : "100vh", height : "auto", padding :"0px 24px"}} >
            <Title level={1} style={{margin : "32px 0px",textAlign: "center"}} > Bienvenue sur l'espace de gestion de <span style={{color:"var(--app-color)"}} >GESMED</span> </Title>
            <div className='container' >
                <Space size="large" wrap >
                    {
                        homeMenus.map((item)=> (
                            <HomeCard 
                                key={item.id}
                                cover={item.cover}
                                label={item.label}
                                onClick={item.onClick}
                            />
                        ))
                    }
                </Space>
            </div>
        </div>
    )
}

export default Home
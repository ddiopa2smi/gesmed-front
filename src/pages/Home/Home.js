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
            label : "Service médical",
            cover : medicine_image ,
            onClick : ()=>{
                
                navigate("/myspace/dashboard")
                sessionStorage.setItem("space","smed")
                
            }
        },
        {
            label : "Service pharmacie",
            cover : pharma_image ,
            onClick : ()=>{
                navigate("/myspace/dashboard")
                sessionStorage.setItem("space","spharma")
            }
        },
        {
            label : "Service dentiste",
            cover : dentist_image ,
            onClick : ()=>{
                navigate("/espace-dentist")
                sessionStorage.setItem("space","sdentist")
            }
        },
        {
            label : "Service Gynécologie",
            cover : gynecologie_image ,
            onClick : ()=>{
                navigate("/espace-gynecologie")
                sessionStorage.setItem("space","sgynecologie")
            }
        },
        {
            label : "Service Analyse",
            cover : analyse_image ,
            onClick : ()=>{
                navigate("/espace-analyse")
                sessionStorage.setItem("space","sanalyse")
            }
        },
        {
            label : "Service Radiologie",
            cover : radiologie_image ,
            onClick : ()=>{
                navigate("/espace-radiologie")
                sessionStorage.setItem("space","sradio")
            }
        },
    
    ]
    const {
        token: { colorBgElevated },
    } = theme.useToken();
    return (
        <div style={{background : colorBgElevated , width :"100%",height : "100vh",paddingTop : 32}} >
            <Title level={1} style={{textAlign : "center"}} > Bienvenue sur l'espace de gestion de <span style={{color:"var(--app-color)"}} >GESMED</span> </Title>
            <div className='container' >
                <Space size="large" wrap >
                    {
                        homeMenus.map((item , index)=> (
                            <HomeCard 
                                key={index}
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
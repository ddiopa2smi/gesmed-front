import './Home.scss'
import { Card, Flex, Space, Typography, theme } from 'antd'
import React from 'react'
import medicine_image from './../../assets/medicine_image.svg'
import pharma_image from './../../assets/pharma_image.svg'
import dentist_image from './../../assets/dentist_image.svg'
import gynecologie_image from './../../assets/gynecologie_image.svg'
import { Link } from 'react-router-dom'
const {Text} = Typography;
function Home() {
    const {
        token: { colorBgElevated },
    } = theme.useToken();
    return (
        <div style={{background : colorBgElevated , width :"100%",height : "100vh"}} >
            <div className='container' >
                <Space size="large" >
                    <Flex vertical  align='center' >
                        <Text> Service médical </Text>
                        <Link to={"/myspace/dashboard"} onClick={()=>{sessionStorage.setItem("space","smed")}} >
                            <Card className='home-card' >
                                <img src={medicine_image} alt='medicine_image' />
                            </Card>
                        </Link>
                        
                    </Flex>
                    <Flex vertical  align='center'>
                        <Text> Service pharmacie</Text>
                        <Link to={"/myspace/dashboard"}>
                            <Card className='home-card' >
                                <img src={pharma_image} alt='pharma_image' onClick={()=>{sessionStorage.setItem("space","spharma")}} />
                            </Card>
                        </Link>
                    </Flex>
                    <Flex vertical  align='center'>
                        <Text> Service Dentiste</Text>
                        <Link to={"/espace-dentist"}>
                            <Card className='home-card' >
                                <img src={dentist_image} alt='dentist_image' onClick={()=>{sessionStorage.setItem("space","sdentist")}} />
                            </Card>
                        </Link>
                    </Flex>
                    <Flex vertical  align='center'>
                        <Text> Service Gynécologie</Text>
                        <Link to={"/espace-gynecologie"}>
                            <Card className='home-card' >
                                <img src={gynecologie_image} alt='gynecologie_image' onClick={()=>{sessionStorage.setItem("space","sgynecologie")}} />
                            </Card>
                        </Link>
                    </Flex>
                </Space>
            </div>
        </div>
    )
}

export default Home
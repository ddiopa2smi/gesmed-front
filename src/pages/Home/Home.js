import './Home.scss'
import { Card, Flex, Space, Typography, theme } from 'antd'
import React from 'react'
import medicine_image from './../../assets/medicine_image.svg'
import pharma_image from './../../assets/pharma_image.svg'
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
                </Space>
            </div>
        </div>
    )
}

export default Home
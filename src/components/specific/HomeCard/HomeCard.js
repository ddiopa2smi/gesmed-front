import { Card, Flex, Typography } from 'antd'
import React from 'react'
import "./HomeCard.scss"

const { Text , Title } = Typography
function HomeCard({cover , label , onClick}) {
  return (
    <Card className='home-card' onClick={onClick} >
        <center>
            <img src={cover} alt='medicine_image' />
        </center>
        <Title level={5} type='secondary' style={{textAlign:"center" , marginTop : "1em"}} > {label} </Title>
    </Card>
  )
}

export default HomeCard
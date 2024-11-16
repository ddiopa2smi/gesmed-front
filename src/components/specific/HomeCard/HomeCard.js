import { Card, message, Typography } from 'antd'
import React from 'react'
import "./HomeCard.scss"

const { Title } = Typography
function HomeCard({cover , label , onClick , canAccess}) {
  return (
    <Card className='home-card' onClick={()=>{
      if(canAccess){
        onClick()
      }else{
        message.warning("Désolé, vous n'avez pas accès à ce département")
      }
    }} >
        <center>
            <img src={cover} alt='medicine_image' />
        </center>
        <Title level={5} type='secondary' style={{textAlign:"center" , marginTop : "1em"}} > {label} </Title>
    </Card>
  )
}

export default HomeCard
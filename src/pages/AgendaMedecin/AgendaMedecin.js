import { Calendar, Card, Typography } from 'antd'
import React from 'react'

const {Title} = Typography
function AgendaMedecin() {
  return (
    <Card>
        <Title level={3} >Mon agenda</Title>
        <Calendar fullscreen />
    </Card>
  )
}

export default AgendaMedecin
import { Card, Typography } from 'antd'
import React from 'react'
import ChangePassword from '../../components/specific/ChangePassword/ChangePassword'

const {Title} = Typography;
function GestionPassword() {
    return (
        <Card>
            <Title level={2} > Gestion de mot de passe </Title>
            <ChangePassword />
        </Card>
    )
}

export default GestionPassword
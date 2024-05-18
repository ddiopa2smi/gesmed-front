import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react'
import { useNavigate } from 'react-router';

function BackButton() {
    const navigate = useNavigate();
    return (
        <Button type='ghost' size='small' style={{color:"#fff",backgroundColor:"var(--back-button)"}} onClick={()=>{navigate(-1);}}  > <ArrowLeftOutlined/> Retour</Button>
    )
}

export default BackButton
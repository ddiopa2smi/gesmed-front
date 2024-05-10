import { ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react'

function ReloadButton({onRefresh}) {
    return (
        <Button type='ghost'  style={{backgroundColor : "var(--reload-color)",color:"#fff"}}    onClick={onRefresh}  > <ReloadOutlined/> Actualiser</Button>
    )
}

export default ReloadButton
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React from 'react'

function ReloadButton({onRefresh}) {
    return (
        // <Button type='ghost'  style={{backgroundColor : "var(--reload-color)",color:"#fff"}}    onClick={onRefresh}  > <ReloadOutlined/> Actualiser</Button>
        <Tooltip title="Actualiser" >
            <Button type='text' shape="default" icon={<ReloadOutlined />} onClick={onRefresh} />
        </Tooltip> 
    )
}

export default ReloadButton
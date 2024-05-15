import { DeleteOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'

function DeleteButton({onDelete}) {
    return (
        <Tooltip title="Supprimer">
            <Button type="text" icon={<DeleteOutlined style={{color:"#e84118"}} />} onClick={onDelete} />
        </Tooltip>
    )
}

export default DeleteButton
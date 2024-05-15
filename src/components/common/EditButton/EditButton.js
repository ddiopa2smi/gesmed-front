import { EditOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'

function EditButton({onEdit}) {
    return (
        <Tooltip title="Editer">
            <Button type="text" icon={<EditOutlined style={{color:"#27ae60"}} />} onClick={onEdit} />
        </Tooltip>
    )
}

export default EditButton
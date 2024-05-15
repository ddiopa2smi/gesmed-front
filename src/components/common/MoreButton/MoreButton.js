import { MoreOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'

function MoreButton() {
    return (
        <Tooltip title="Autres actions">
            <Button type="text" icon={<MoreOutlined/>} />
        </Tooltip>
    )
}

export default MoreButton
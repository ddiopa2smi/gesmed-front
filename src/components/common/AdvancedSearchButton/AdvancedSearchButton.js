import { SearchOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'

function AdvancedSearchButton({onClick}) {
    return (
        <Tooltip title="Recherche avancée" >
            <Button type='text' icon={<SearchOutlined />} onClick={onClick} />
        </Tooltip> 
    )
}

export default AdvancedSearchButton
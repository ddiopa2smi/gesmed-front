import { FilterOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'
import { TbAdjustmentsSearch } from "react-icons/tb";
function AdvancedSearchButton({onClick}) {
    return (
        <Tooltip title="Recherche avancée" >
            <Button type='text' icon={/*<TbAdjustmentsSearch size={24} />*/<FilterOutlined style={{fontSize : 18}} />} onClick={onClick} />
        </Tooltip> 
    )
}

export default AdvancedSearchButton
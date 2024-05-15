import { PrinterOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'

function PrintButton({onPrint}) {
    return (
        <Tooltip title="Imprimer">
            <Button type="text" icon={<PrinterOutlined style={{color:"#3498db"}}/>} onClick={onPrint} />
        </Tooltip>
    )
}

export default PrintButton
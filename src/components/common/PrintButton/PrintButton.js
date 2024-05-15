import { PrinterOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import React from 'react'

function PrintButton({onPrint}) {
    return (
        <Tooltip title="Imprimer">
            <Button type="text" icon={<PrinterOutlined/>} onClick={onPrint} />
        </Tooltip>
    )
}

export default PrintButton
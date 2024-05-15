import React from 'react'
import { images } from '../../../constants/app.constants'
import { Button, Flex, Tooltip } from 'antd'

function ExcellExportButton({onClick}) {
  return (
    <Tooltip title="Exporter" >
        <Button 
            type='text' 
            icon={
                <Flex align='center' justify='center' >
                    <img src={images.excell} alt='excell' style={{width : 20 , height : 20}} />
                </Flex>
            } 
        onClick={onClick} />
    </Tooltip>
  )
}

export default ExcellExportButton
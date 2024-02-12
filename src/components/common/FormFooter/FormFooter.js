import { Button, Flex, Space } from 'antd'
import React from 'react'

function FormFooter({onCancel , onValid , htmlType}) {
  return (
    <Flex justify='center' align='center' >
        <Space size="middle">
            <Button type='ghost' style={{color:"#fff",backgroundColor:"firebrick"}} onClick={onCancel} >Annuler</Button>
            <Button type='primary' htmlType={htmlType} onClick={onValid} >Enregistrer</Button>
        </Space>
    </Flex>
  )
}

export default FormFooter
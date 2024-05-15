import { Button, Flex, Space } from 'antd'
import React from 'react'

function FormFooter({onCancel , onValid , htmlType , cancelLabel , loading, validLabel}) {
  return (
    <Flex justify='center' align='center' >
        <Space size="middle">
            <Button type='ghost' style={{color:"#fff",backgroundColor:"firebrick"}} onClick={onCancel} > {cancelLabel ? cancelLabel : "Annuler"} </Button>
            <Button type='primary' loading={loading} htmlType={htmlType} onClick={onValid} > {validLabel ? validLabel : "Enregistrer"} </Button>
        </Space>
    </Flex>
  )
}

export default FormFooter
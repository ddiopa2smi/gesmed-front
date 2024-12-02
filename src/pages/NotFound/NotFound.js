import { Button, Result } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router'

function NotFound() {
  const navigate = useNavigate();
    return (
      <Result
          status="404"
          title="404"
          subTitle="Désolé, cette page n'existe pas"
          extra={<Button type="primary" onClick={()=>{navigate("/home")}} >Back Home</Button>}
      />
    )
}

export default NotFound
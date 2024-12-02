import { PushpinOutlined, SnippetsOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, Col, Row } from 'antd'
import React from 'react'

function Stats() {
  return (
    <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
            title={
              <>
                <TeamOutlined
                  style={{
                    backgroundColor: "rgb(241,223,254)",
                    color: "#a02cfa",
                    padding: 5,
                    borderRadius: 8,
                    fontSize: 20,
                  }}
                />{" "}
                Patients{" "}
              </>
            }
          >
            120
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
            title={
              <>
                <SnippetsOutlined
                  style={{
                    backgroundColor: "#fff5dd",
                    color: "#ffbc11",
                    padding: 5,
                    borderRadius: 8,
                    fontSize: 20,
                  }}
                />{" "}
                Consultations{" "}
              </>
            }
            
          >
            80
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
            title={
              <>
                <PushpinOutlined
                  style={{
                    backgroundColor: "hsl(141,100%, 95%)",
                    color: "hsl(141,100%, 35%)",
                    padding: 5,
                    borderRadius: 8,
                    fontSize: 20,
                  }}
                />{" "}
                RV du jour{" "}
              </>
            }
            
          >
            220
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
            title={
              <>
                <PushpinOutlined
                  style={{
                    backgroundColor: "hsl(207,100%, 95%)",
                    color: "hsl(207,100%, 50%)",
                    padding: 5,
                    borderRadius: 8,
                    fontSize: 20,
                  }}
                />{" "}
                Staffs{" "}
              </>
            }
          
          >
            38
          </Card>
        </Col>
      </Row>
  )
}

export default Stats
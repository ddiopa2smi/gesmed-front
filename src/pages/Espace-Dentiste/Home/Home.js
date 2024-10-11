import { Card, Col, Row, Typography } from 'antd'
import React from 'react'
import ListRv from '../components/ListRv/ListRv'
import { PushpinOutlined, SnippetsOutlined, TeamOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
const {Text} = Typography
function Home() {
  return (
    <div>
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
            extra={<Link to="/myspace/patients">Voir plus</Link>}
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
            extra={<Link to="/myspace/consultations">Voir plus</Link>}
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
            extra={<Link to="/myspace/rendez-vous">Voir plus</Link>}
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
            extra={<Link to="/myspace/settings/accounts">Voir plus</Link>}
          >
            38
          </Card>
        </Col>
      </Row>
      <br/>
      <br/>
      <ListRv />  
    </div>
  )
}

export default Home
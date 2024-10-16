import {
  PushpinOutlined,
  SnippetsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Space } from "antd";
import React from "react";

function Home() {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card
          title={
            <Space>
              <TeamOutlined
                style={{
                  backgroundColor: "rgb(241,223,254)",
                  color: "#a02cfa",
                  padding: 5,
                  borderRadius: 8,
                  fontSize: 20,
                }}
              />
               Analyses du jour
            </Space>
          }
        >
          20
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card
          title={
            <Space>
              <SnippetsOutlined
                style={{
                  backgroundColor: "#fff5dd",
                  color: "#ffbc11",
                  padding: 5,
                  borderRadius: 8,
                  fontSize: 20,
                }}
              />
              Analyses en attente
            </Space>
          }
        >
          10
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card
          title={
            <Space>
              <PushpinOutlined
                style={{
                  backgroundColor: "hsl(141,100%, 95%)",
                  color: "hsl(141,100%, 35%)",
                  padding: 5,
                  borderRadius: 8,
                  fontSize: 20,
                }}
              />
              Analyses effectuées
            </Space>
          }
        >
          10
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <Card
          title={
            <Space>
              <PushpinOutlined
                style={{
                  backgroundColor: "hsl(207,100%, 95%)",
                  color: "hsl(207,100%, 50%)",
                  padding: 5,
                  borderRadius: 8,
                  fontSize: 20,
                }}
              />
              Staffs
            </Space>
          }
        >
          30
        </Card>
      </Col>

      <br />
      <br />

      <div>
        
      </div>
    </Row>
  );
}

export default Home;

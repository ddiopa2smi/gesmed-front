import React from "react";
import { Card, Col, Row, Empty } from "antd";
import {
  PushpinOutlined,
  SnippetsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import RvList from "../RvList/RvList";
import { ServiceType } from "../../../utils/types/types.ts";
import AnalysesList from "../AnalysesList/AnalysesList";
const chartData = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

function DashboardComponent({ serviceType }) {
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
      <br />
      {serviceType === ServiceType.ANALYSE && (
        <>
          <AnalysesList />
          <br />
        </>
      )}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Card>
            <RvList serviceType={serviceType} today />
          </Card>
        </Col>
      </Row>
      <br />
      
      <br />
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={16} lg={16} xl={16}>
          <Card title="Visualisation des graphes">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Card>
                  <center>
                    <LineChart
                      width={500}
                      height={350}
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="pv"
                        stroke="#8884d8"
                        activeDot={{ r: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uv"
                        stroke="var(--app-color)"
                      />
                    </LineChart>
                  </center>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card
            title="Liste des médécins actifs"
            extra={<Link>Voir plus</Link>}
          >
            <Empty />
          </Card>
        </Col>
      </Row>

      <br />
    </div>
  );
}

export default DashboardComponent;

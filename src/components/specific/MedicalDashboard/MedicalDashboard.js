import React, { PureComponent } from "react";
import {
  Card,
  Col,
  Row,
  Avatar,
  List,
  Typography,
  Breadcrumb,
  Empty,
} from "antd";
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
  ResponsiveContainer,
} from "recharts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

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
// import RvJour from '../../components/RvJour/RvJour';

// const {Title , Text} = Typography;
const data = [
  {
    title: "Ant Design Title 1",
  },
  {
    title: "Ant Design Title 2",
  },
  {
    title: "Ant Design Title 3",
  },
  {
    title: "Ant Design Title 4",
  },
];

function MedicalDashboard() {
  const demoUrl = "https://codesandbox.io/s/simple-line-chart-kec3v";
  const screens = useBreakpoint();

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
      {/* <br/>
        <Row  gutter={[24,24]}>
          <Col  xs={24} sm={12} md={8} lg={6} xl={6} >
            <Card title={<><TeamOutlined style={{ backgroundColor : "hsl(30,100%, 95%)", color : "hsl(30,100%, 50%)" ,padding:5,borderRadius:8 , fontSize:20}} /> Consultations du jour </>} extra={<Link to="/myspace/patients" >Voir plus</Link>} >
                120
            </Card>
          </Col>
        </Row> */}
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
            {/* <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={require("./../../../assets/test_img.jpg")} />}
                          title={<Link to="#">{item.title}</Link>}
                        />
                    </List.Item>
                    )}
                /> */}
            <Empty />
          </Card>
        </Col>
      </Row>

      <br />
    </div>
  );
}

export default MedicalDashboard;

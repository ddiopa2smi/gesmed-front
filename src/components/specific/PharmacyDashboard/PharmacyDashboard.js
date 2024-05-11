import React from 'react'
import { Card, Col, Row , Avatar , List , Typography, Breadcrumb} from 'antd';
import { MedicineBoxOutlined, PushpinOutlined, SnippetsOutlined, TeamOutlined } from '@ant-design/icons';
import OrdonnancesList from '../OrdonnancesList/OrdonnancesList';

// import RvJour from '../../components/RvJour/RvJour';

// const {Title , Text} = Typography;


function PharmacyDashboard() {
  return (
    <div>
        <Row  gutter={[24,24]}>
          <Col  xs={24} sm={12} md={8} lg={6} xl={6} >
            <Card title={<><PushpinOutlined style={{backgroundColor:"rgb(241,223,254)",color:"#a02cfa",padding:5,borderRadius:50 , fontSize:20}} /> Ordonnances </>} >
                120
            </Card>
          </Col>
          <Col  xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card title={<><SnippetsOutlined style={{backgroundColor:"#fff5dd",color:"#ffbc11",padding:5,borderRadius:50,fontSize:20}} /> Commandes en cours </>}>
              80
            </Card>
          </Col>
          <Col  xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card title={<><MedicineBoxOutlined style={{backgroundColor:"#e3f9e9",color:"#27bc48",padding:5,borderRadius:50,fontSize:20}} /> Médicaments </>} >
              220
            </Card>
          </Col>
          <Col  xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card title={<><TeamOutlined style={{backgroundColor:"#fff3f7",color:"#ff3282",padding:5,borderRadius:50,fontSize:20}} /> Staffs </>}>
              38
            </Card>
          </Col>
        </Row>
        {/* <br/><br/>
        <Row  gutter={[24,24]}>
          <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
            <Card title="Liste des médicaments facturés à l'IPM" extra={<a>Voir plus</a>} >
             
            </Card>
          </Col>
        </Row> */}
        
        <br/><br/>
        <OrdonnancesList />
    </div>
  )
}

export default PharmacyDashboard
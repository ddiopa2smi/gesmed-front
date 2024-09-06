import { UserOutlined } from '@ant-design/icons';
import { Alert, Avatar, Button, Card, Col, Descriptions, Flex, Row, Space, Tabs, Timeline, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import teeth from "./../../../assets/numerotation-des-dents.jpg"
import ToothComponent from '../components/ToothComponent';
import { useLocation, useNavigate } from 'react-router';
import NotSpecified from '../../../components/common/NotSpecified/NotSpecified';
import { formatDate } from '../../../utils/helpers';
const  {Text , Title} = Typography;
function PatientDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state.currentPatient;
    
    const queryParams = new URLSearchParams(location.search);
    const [currentTab , setCurrentTab] = useState(queryParams.get("tab"));

    const onChangeTab = (key) => {
      setCurrentTab(key)
      
    }
    useEffect(() => {
      navigate(`/espace-dentist/patients/details?tab=${currentTab}`,{state : {currentPatient : patient} , replace : false});
      return () => {
      }
    }, [currentTab])
    
    const items = [
        {
          key: '1',
          label: 'Informations du patient',
          children: <Descriptions
            column={2}
            layout="horizontal" /*layout={window.screen.height < 992 && 'vertical'}*/
          >
            <Descriptions.Item label="Nom">
              {patient?.nom_patient || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Prénom">
              {patient?.prenom_patient || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Sexe">
              {patient?.sexe_patient || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Date de naissance">
              {(patient?.datenaiss_patient &&
                formatDate(patient?.datenaiss_patient)) || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Age">
              {`${patient?.age_patient} an(s)` || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Groupe sanguin">
              {patient?.group_sanguin || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Téléphone">
              {patient?.tel_patient || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {patient?.email_patient || <NotSpecified />}
            </Descriptions.Item>
          </Descriptions>,
        },
        {
          key: '2',
          label: 'Historique des rendez-vous',
          children: 'Historique des rendez-vous',
        },
        {
          key: '3',
          label: 'Traitements à venir',
          children: 'Traitements à venir',
        },
        {
            key: '4',
            label: 'Enregistrement médical',
            children: <Card>
              <Row gutter={[24,24]} align='middle' >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <ToothComponent />
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <Timeline
                    items={[
                      {
                        children: <>
                          &#129463;
                          <Text> Diagnostic du {formatDate(new Date())} </Text>
                          <br/>
                          <br/>
                          <Alert 
                            message="Carie de la dent" 
                            type="warning"  
                            action={<>
                              <Space>
                                <Button size='small' type='link' onClick={null} >Prescrire</Button>
                                <Button size='small' type='link' onClick={null} >Remèdes</Button>
                              </Space>
                            </>} 
                            showIcon 
                          />
                        </>,
                      },
                      {
                        children: 'Technical testing 2015-09-01',
                      },
                    ]}
                  />
                </Col>
              </Row>
              
            </Card>,
        },
      ];
    return (
        <Card>
            <Flex justify="space-between" align="center">
                <Space align="end" >
                    <Avatar  size={64} icon={<UserOutlined/>} />
                    <Title level={3}> {patient?.prenom_patient} {patient?.nom_patient} </Title>
                </Space>
                <Button type='primary' >Créer un rendez-vous</Button>
            </Flex>
            <br/>
            <Tabs defaultActiveKey="1" onChange={(activeKey)=> onChangeTab(activeKey)} activeKey={currentTab} items={items}  />

            
            

            {/* <svg fill="#000000" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 368.477 368.477" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M273.106,8.768C271.885,8.41,242.528,0,184.239,0S96.591,8.41,95.37,8.768c-2.769,0.812-4.671,3.352-4.671,6.237v72.537 c0,28.018,12.386,53.195,31.966,70.353c0.48,27.934,8.605,77.12,20.522,123.856c6.025,23.629,12.326,43.834,18.22,58.43 c8.01,19.833,14.742,28.295,22.511,28.295c7.808,0,14.598-8.466,22.704-28.308c5.976-14.627,12.362-34.87,18.47-58.54 c12.019-46.582,20.234-95.616,20.807-123.75c20.297-17.793,31.881-43.253,31.881-70.337V15.005 C277.778,12.12,275.876,9.579,273.106,8.768z M264.778,87.542c0,24.096-10.649,46.701-29.223,62.073 c-1.589,1.185-2.622,3.073-2.622,5.208c0,25.334-7.726,73.085-19.224,118.823c-5.636,22.42-11.591,42.059-17.222,56.793 c-6.544,17.123-10.798,22.717-12.545,24.458c-1.733-1.76-5.941-7.386-12.394-24.488c-5.552-14.716-11.423-34.318-16.978-56.688 c-9.672-38.955-16.629-79.336-18.453-105.996c14.068,8.475,30.534,13.356,48.12,13.356c10.694,0,21.185-1.792,31.181-5.325 c3.385-1.196,5.159-4.91,3.962-8.295c-1.195-3.385-4.912-5.158-8.294-3.962c-6.568,2.321-13.389,3.762-20.35,4.317v-36.756 c0-3.59-2.909-6.5-6.499-6.5c-3.59,0-6.5,2.91-6.5,6.5v36.736c-41.379-3.324-74.04-38.035-74.04-80.254V20.101 C113.899,17.837,140.785,13,184.239,13c43.289,0,70.301,4.848,80.54,7.108V87.542z"></path> </g></svg> */}
        </Card>


    )
}

export default PatientDetails
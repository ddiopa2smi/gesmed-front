import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Descriptions, Flex, Space, Tabs, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router';
import NotSpecified from '../../../components/common/NotSpecified/NotSpecified';
import { formatDate } from '../../../utils/helpers';
const  {Title} = Typography;
function PatientDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state.currentPatient;
    
    const queryParams = new URLSearchParams(location.search);
    const [currentTab , setCurrentTab] = useState(queryParams.get("tab"));

    const onChangeTab = (key) => {
      setCurrentTab(key)
    }

    const doConsultation = () => {
        navigate(`/espace-gynecologie/patients/details/consultation`,{state : {currentPatient : patient} , replace : false});
    }

    useEffect(() => {
      navigate(`/espace-gynecologie/patients/details?tab=${currentTab}`,{state : {currentPatient : patient} , replace : false});
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
        }
      ];
    return (
        <Card>
            <Flex justify="space-between" align="center">
                <Space align="end" >
                    <Avatar  size={64} icon={<UserOutlined/>} />
                    <Title level={3}> {patient?.prenom_patient} {patient?.nom_patient} </Title>
                </Space>
                <Space>
                    <Button type='primary' >Créer un rendez-vous</Button>
                    <Button type='primary' onClick={doConsultation} >Consultation</Button>
                </Space>
            </Flex>
            <br/>
            <Tabs defaultActiveKey="1" onChange={(activeKey)=> onChangeTab(activeKey)} activeKey={currentTab} items={items}  />
        </Card>


    )
}

export default PatientDetails
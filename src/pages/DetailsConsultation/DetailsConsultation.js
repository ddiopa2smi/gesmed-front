import { Card, Descriptions, Flex, Typography } from 'antd'
import React from 'react'
import { useLocation } from 'react-router';
import NotSpecified from '../../components/common/NotSpecified/NotSpecified';
import { formatDate } from '../../utils/helpers';
import BackButton from '../../components/common/BackButton/BackButton';

const {Title} = Typography;
function DetailsConsultation() {
    const {state} = useLocation();
    const currentConsultation = state?.currentConsultation;
    console.log(currentConsultation)
    return (
        <Card>
            <Flex>
                <BackButton />
            </Flex>
            <br/>
            <Title level={3} >Détails de la consultation</Title>
            <Descriptions column={2} layout="horizontal"  /*layout={window.screen.height < 992 && 'vertical'}*/ >
                
                <Descriptions.Item label="Numéro patient">
                    { currentConsultation?.numpat  || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Numéro rendez-vous">
                    { currentConsultation?.numrv  || <NotSpecified/>}
                </Descriptions.Item>

                <Descriptions.Item label="Date de consultation">
                    { currentConsultation?.datecons && formatDate(currentConsultation?.datecons) || <NotSpecified/>}
                </Descriptions.Item>
                {/* <Descriptions.Item label="Age">
                    { `${currentConsultation?.age_patient} an(s)` || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Groupe sanguin">
                    { currentConsultation?.group_sanguin || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                    { currentConsultation?.tel_patient || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                    { currentConsultation?.email_patient || <NotSpecified/>}
                </Descriptions.Item> */}

                <Descriptions.Item label="Diagnostic"> 
                    { currentConsultation?.diagnostic || <NotSpecified/>} 
                </Descriptions.Item>
                <Descriptions.Item label="Examen">
                    { currentConsultation?.examen || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Résultat">
                    { currentConsultation?.resultat  || <NotSpecified/>}
                </Descriptions.Item>

                <Descriptions.Item label="Tension Artérielle">
                    { currentConsultation?.tension && currentConsultation?.tension || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Température(°C)">
                    { currentConsultation?.temp && currentConsultation?.temp || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Pouls">
                    { currentConsultation?.pouls && currentConsultation?.pouls || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Poids">
                    { currentConsultation?.poids && currentConsultation?.poids || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Taille(cm)">
                    { currentConsultation?.taille && currentConsultation?.taille || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="IMC(kg/m3)">
                    { currentConsultation?.imc && currentConsultation?.imc || <NotSpecified/>}
                </Descriptions.Item>
                
                {/* <Descriptions.Item label="Date de rendez-vous">
                    { currentConsultation?.tension && currentConsultation?.tension || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Date de début repos médical">
                    { currentConsultation?.tension && currentConsultation?.tension || <NotSpecified/>}
                </Descriptions.Item>
                <Descriptions.Item label="Date de fin repos médical">
                    { currentConsultation?.tension && currentConsultation?.tension || <NotSpecified/>}
                </Descriptions.Item> */}
                
            </Descriptions>
        </Card>
    )
}

export default DetailsConsultation
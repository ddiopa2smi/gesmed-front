import { Card, Descriptions } from 'antd'
import React from 'react'
import { useLocation } from 'react-router'
import NotSpecified from '../../components/common/NotSpecified/NotSpecified';
import { formatDate } from '../../utils/helpers';
import BackButton from '../../components/common/BackButton/BackButton';

function VisiteDetails() {
    const {state} = useLocation();
    const visite = state.visite; 
  return (
    <Card>
        <BackButton />
        <br />
        <br />
        <Descriptions
            column={2}
            layout="horizontal" /*layout={window.screen.height < 992 && 'vertical'}*/
          >
            <Descriptions.Item label="Date visite">
              {formatDate(new Date(visite.date_visite)) || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Lieu de la visite">
              {visite.lieu_visite || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Nature de la visite">
              {visite?.nature_visite || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Risques identifiés">
              {visite?.risques || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Problèmes liés">
              {visite?.problemes || <NotSpecified />}
            </Descriptions.Item>
            <Descriptions.Item label="Mesures individuelles">
                {visite?.mesures_ind || <NotSpecified />} 
            </Descriptions.Item>
            <Descriptions.Item label="Mesures collectives">
                {visite?.mesures_col || <NotSpecified />} 
            </Descriptions.Item>
          </Descriptions>
    </Card>
  )
}

export default VisiteDetails
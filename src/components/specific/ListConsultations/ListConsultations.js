import React from 'react'
import { Button, Card, Dropdown, Flex, Space, Typography} from "antd"
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import DataTable from '../../common/DataTable/DataTable';
import { deletePopup , formatDate } from '../../../utils/helpers';
import { MoreOutlined } from '@ant-design/icons';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import AdvancedSearchButton from '../../common/AdvancedSearchButton/AdvancedSearchButton';
import { useNavigate } from 'react-router';

const {Title} = Typography;

function ListConsultations({serviceType}) {
    const navigate = useNavigate()
    const {data : listConsultations , dataCopy : listConsultationsCopy , setDataCopy : setListConsultationsCopy, isLoading : listConsultationsLoading , onRefresh : refreshListConsultations} = useFetch(endpoints.consultations.LIST);

    const openConsultation = (record) => {    
        navigate("/espace-medical/consultations/details-consultation" , {state : {currentConsultation : record}});
    }

    const onDelete = (record) => {
        deletePopup()
        .then((result)=>{
            // if (result.isConfirmed) {
            //     deleteActions(`${endpoints.visitesLieux.}/${record?.num_patient}`)
            //     .then((response)=>{
            //         if (response.data.Deleted === true) {
            //             message.success("Ligne retirée avec succès");
            //             onRefresh()
            //         }
            //     })
            // }
        })
    }
    return (
        <Card >
          <Title level={3} >Liste des consultations</Title>

          <Flex justify="flex-end" align="center" >
              <Space>
                  <AdvancedSearchButton onClick={null} />
                  <ReloadButton onRefresh={refreshListConsultations} />
              </Space>
          </Flex>

          <br/>
            
          <DataTable
              dataSource={listConsultations}
              dataSourceCopy={listConsultationsCopy}
              setDataSourceCopy={setListConsultationsCopy}
              tableLoading={listConsultationsLoading}
              columns={[
                {
                  title: 'N° Cons',
                  dataIndex: 'numcons',
                  key: 'numcons'
                },
                {
                    title: 'N° Patient',
                    dataIndex: 'numpat',
                    key: 'numpat'
                },
                {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type'
                },
                {
                    title: 'Sexe',
                    dataIndex: 'sexe',
                    key: 'sexe'
                },
                {
                    title: 'Date cons',
                    dataIndex: 'datecons',
                    key: 'datecons',
                    render: (record) => <div className='table-data'>
                        {formatDate(record)}
                    </div>
                },
                {
                    title: 'Motif',
                    dataIndex: 'motif',
                    key: 'motif'
                },
                {
                    title: 'Pathologie',
                    dataIndex: 'pathologie',
                    key: 'pathologie'
                },
                {
                    title: 'Diagnostic',
                    dataIndex: 'diagnostic',
                    key: 'diagnostic'
                },
                {
                  render :  (record)=>(
                      <Flex justify="center" align="center" >
                          <Space>
                              <Dropdown
                                    menu={{items :  
                                        [
                                            {
                                                label: "Voir la consultation" ,
                                                key: '0',
                                                onClick : ()=>{openConsultation(record)},
                                            },
                                            // {
                                            //     label: "Créer RV" ,
                                            //     key: '1',
                                            //     onClick : ()=>{onCreateRV(record)} ,
                                            // },
                                            // {
                                            //     label: "Modifier",
                                            //     key: '2',
                                            //     onClick : ()=>{onEdit(record)} , 
                                            // }, 
                                            // {
                                            //     label: "Supprimer" ,
                                            //     key: '3',
                                            //     onClick : ()=>{onDelete(record)}
                                            // },
                                        ]
                                    }}
                                    trigger={['click']}
                                >
                                    <Button type='text' icon={<MoreOutlined/>} />
                                </Dropdown>
                          </Space>
                      </Flex>
                  )
                }
              ]}
          />
      </Card>
    )
}

export default ListConsultations
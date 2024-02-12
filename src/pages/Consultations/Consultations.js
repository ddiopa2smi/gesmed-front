import React from 'react'
import { Button, Card, Flex, Space, Tooltip, Typography} from "antd"
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import DataTable from '../../components/common/DataTable/DataTable';
import { deletePopup, formatDate } from '../../utils/helpers';
import { DeleteOutlined, EditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const {Title} = Typography;

function Consultations() {
    const {data , dataCopy , setDataCopy, isLoading , onRefresh} = useFetch(endpoints.consultations.LIST);
    console.log(data)
    const onEdit = (record) => {

     
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
                  <Tooltip title="Recherche" >
                      <Button type='text' shape="circle" icon={<SearchOutlined/>} onClick={()=>{return null;}} /> &nbsp;&nbsp;
                  </Tooltip> 
                 
                  <Tooltip title="Actualiser" >
                      <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={onRefresh} /> &nbsp;&nbsp;
                  </Tooltip> 
                  {/* <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button> */}
              </Space>
          </Flex>

          <br/>
            
          <DataTable
              dataSource={data}
              dataSourceCopy={dataCopy}
              setDataSourceCopy={setDataCopy}
              tableLoading={isLoading}
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
                              <Tooltip title="Editer">
                                  <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit(record)}} />
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                  <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                              </Tooltip>
                          </Space>
                      </Flex>
                  )
                }
              ]}
          />
      </Card>
    )
}

export default Consultations
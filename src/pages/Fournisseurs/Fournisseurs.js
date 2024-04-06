import { DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Space, Tooltip, Typography } from 'antd'
import React from 'react'
//import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';



const {Title} = Typography;
    
function Fournisseurs() {
    // const navigate = useNavigate();
    
    const {data , dataCopy : listFournisseurs , onRefresh : refreshListFournisseurs , isLoading : listLoading} = useFetch();

    // const onAdd = () => {
        
    // }

    return (
        <Card>
           

            <Title level={3} >Liste des fournisseurs</Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Button type='primary' icon={<PlusOutlined/>} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={[]}
                dataSourceCopy={[]}
                setDataSourceCopy={null}
                columns={[
                    {
                        title: 'N°',
                        dataIndex: 'num_fourn',
                        key: 'num_fourn'
                    },
                    {
                        title: 'Raison sociale',
                        dataIndex: 'denomination',
                        key: 'denomination'
                    },
                    {
                        title: 'Adresse',
                        dataIndex: 'adresse',
                        key: 'adresse'
                    },
                    {
                        title: 'Téléphone',
                        dataIndex: 'telephone',
                        key: 'telephone'
                    },
                    {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email'
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Space size="middle" >
                                    <Tooltip title="Editer">
                                        <Button type='link' icon={<EditOutlined/>} />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button type='link' danger icon={<DeleteOutlined/>} />
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

export default Fournisseurs
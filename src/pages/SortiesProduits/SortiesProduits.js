import { DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Space, Tooltip, Typography } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';



const {Title} = Typography;
    
function SortiesProduits() {
    const navigate = useNavigate();
    

    // const onAdd = () => {
        
    // }

    return (
        <Card>
            <Breadcrumb
                items={[
                    {
                        title : <Link to="/myspace/dashboard" > <HomeOutlined/> </Link>
                    } ,
                    {
                        title : "Mouvement des sorties"
                    }
                ]}
            /> 

            <br/>

            <Title level={3} >Mouvement des sorties</Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Button type='primary' onClick={()=>{navigate("/myspace/sorties-produits/new-mouvement-sortie")}} icon={<PlusOutlined/>} >Nouveau</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={[]}
                dataSourceCopy={[]}
                setDataSourceCopy={null}
                columns={[
                    {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                    },
                    {
                        title: 'Numéro',
                        dataIndex: 'numero',
                        key: 'numero',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                    },
                    {
                        title: 'Motif sortie',
                        dataIndex: 'motif_sortie',
                        key: 'motif_sortie',
                    },
                    {
                        title: 'Etat',
                        dataIndex: 'etat',
                        key: 'etat',
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

export default SortiesProduits
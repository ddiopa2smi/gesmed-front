import { DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Space, Tooltip, Typography } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';



const {Title} = Typography;
    
function EntreesProduits() {
    const navigate = useNavigate();
    

    const onAdd = () => {
        
    }

    return (
        <Card>
            <Breadcrumb
                items={[
                    {
                        title : <Link to="/myspace/dashboard" > <HomeOutlined/> </Link>
                    } ,
                    {
                        title : "Mouvement des entrées"
                    }
                ]}
            /> 

            <br/>

            <Title level={3} >Mouvement des entrées</Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Button type='primary' onClick={()=>{navigate("/myspace/entrees-produits/reception-commande")}} icon={<PlusOutlined/>} >Réception commande</Button>
                    <Button type='primary' icon={<PlusOutlined/>} >Entrées diverses</Button>
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
                        title: 'Réf (BC)',
                        dataIndex: 'ref',
                        key: 'ref',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div>,
                    },
                    {
                        title: 'N° BL(Frcs)',
                        dataIndex: 'num_bl',
                        key: 'num_bl',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div>,
                    },
                    {
                        title: 'Motif entrée',
                        dataIndex: 'motif_entree',
                        key: 'motif_entree',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div>,
                    },
                    {
                        title: 'Fournisseur',
                        dataIndex: 'fournisseur',
                        key: 'fournisseur',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div>,
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

export default EntreesProduits
import { DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Flex, Space, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import { Link } from 'react-router-dom';

const {Title} = Typography;
    
function CommandesProduits() {
    const navigate = useNavigate();
    const [bonsCommandesList , setBonsCommandesList ] = useState([]);
    const [bonsCommandesListCopy , setBonsCommandesListCopy ] = useState([]);

    const onAdd = () => {
        navigate("/myspace/commandes-produits/new-commande-produit")
    }

    return (
        <Card>
            <Title level={3} >Liste des bons de commandes produits</Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Button type='primary' onClick={onAdd} icon={<PlusOutlined/>} >Nouveau</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={[]}
                dataSourceCopy={[]}
                setDataSourceCopy={null}
                columns={[
                    {
                        title: 'Numéro',
                        dataIndex: 'numero',
                        key: 'numero',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                    },
                    {
                        title: 'Désignation',
                        dataIndex: 'designation',
                        key: 'designation',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                        sorter: (a, b) => a.designation.charCodeAt(0) - b.designation.charCodeAt(0),
                    },
                    {
                        title: 'Quantité',
                        dataIndex: 'qte',
                        key: 'qte',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                        sorter: (a, b) => a.qte.charCodeAt(0) - b.qte.charCodeAt(0),
                    },
                    {
                        title: 'P.U (HT)',
                        dataIndex: 'pu',
                        key: 'pu',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                        sorter: (a, b) => a.pu.charCodeAt(0) - b.pu.charCodeAt(0),
                    },
                    {
                        title: 'Total (HT)',
                        dataIndex: 'total',
                        key: 'total',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record} </span>
                        </div> ,
                        sorter: (a, b) => a.total.charCodeAt(0) - b.total.charCodeAt(0),
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Space size="middle" >
                                    <Tooltip title="Editer">
                                        <Button shape='circle' danger icon={<EditOutlined/>} />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button shape='circle' danger icon={<DeleteOutlined/>} />
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

export default CommandesProduits
import { DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Space, Tooltip, Typography } from 'antd'
import React from 'react'
//import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import { formatDate } from '../../utils/helpers';



const {Title} = Typography;
    
function SituationStocks() {
    // const navigate = useNavigate();
    

    // const onAdd = () => {
        
    // }

    return (
        <Card>
            <Title level={3} >Situation des stocks</Title>

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
                        title: 'Code',
                        dataIndex: 'code_stock',
                        key: 'code_stock',
                    },
                    {
                        title: 'Désignation',
                        dataIndex: 'designation',
                        key: 'designation',
                    },
                    {
                        title: 'Condition',
                        dataIndex: 'condition',
                        key: 'condition',
                    },
                    {
                        title: 'Stock théorique',
                        dataIndex: 'stock_theorique',
                        key: 'stock_theorique',
                    },
                    {
                        title: 'Date de péremption',
                        dataIndex: 'date_peremption',
                        key: 'date_peremption',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
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

export default SituationStocks
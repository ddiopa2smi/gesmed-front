import { DeleteOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons'
import { Breadcrumb, DatePicker, Card, Col, Form, Flex, Row, Select, Typography, Space, InputNumber, Button, Divider, Tooltip } from 'antd'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormFooter from '../../components/common/FormFooter/FormFooter'
import DataTable from '../../components/common/DataTable/DataTable'
import { formatDate } from '../../utils/helpers'
const {Option} = Select;
const {Title} = Typography;


function SaisieInventaire() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    return (
        <Card>
            <Breadcrumb
                items={[
                    {
                        title : <Link to={"/myspace/dashboard"} > <HomeOutlined/> </Link>
                    } ,
                    {
                        title : "Saisie inventaire"
                    }
                ]}
            /> 
            <br/>
            <Title level={3} > Saisie inventaire  </Title>
            <br/>
            <Form
                layout='vertical'
                form={form}
            >
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Form.Item 
                            name="Liste des inventaires" 
                            label="inventaire"
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                        >
                            <Select>
                                <Option></Option>
                            </Select>
                        </Form.Item>
                        
                    </Col>

                </Row>

                <Divider />

                <Row gutter={[24,24]} align={"middle"} >
                    <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                        <Form.Item 
                            label="Produits"
                            name="code_produit" 
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="choisir"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={"produit"} > produit </Option>          
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                        <Form.Item 
                            label="Quantité"
                            name="qte" 
                        >
                            <InputNumber min={0} style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={4} xl={4}>
                        <Form.Item 
                            name="date_peremption" 
                            label="Date de péremption"
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                        >
                            <DatePicker placeholder='Choisir la date' style={{width:"100%"}} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                        <Button type='primary'> Ajouter  </Button>
                    </Col>
                </Row>

                <Divider  orientation="left">Liste des produits</Divider>

                <DataTable 
                    dataSource={[]}
                    dataSourceCopy={[]}
                    setDataSourceCopy={null}
                    columns={[
                        {
                            title: 'Code',
                            dataIndex: 'code',
                            key: 'code'
                        },
                        {
                            title: 'Désignation',
                            dataIndex: 'designation',
                            key: 'designation'
                        },
                        {
                            title: 'Stock théorique',
                            dataIndex: 'stock_theorique',
                            key: 'stock_theorique',
                            render: (record) => <div className='table-data'>
                                <span style={{textOverflow:"ellipsis"}} > {record} </span>
                            </div>,
                        },
                        {
                            title: 'Stock réel',
                            dataIndex: 'stock_reel',
                            key: 'stock_reel',
                            render: (record) => <div className='table-data'>
                                <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                            </div>,
                        },
                        {
                            title: 'Ecart',
                            dataIndex: 'ecart',
                            key: 'ecart',
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
                 <br/>
                <FormFooter onCancel={()=>{navigate(-1)}} />
            </Form>
           

        </Card>
    )
}

export default SaisieInventaire
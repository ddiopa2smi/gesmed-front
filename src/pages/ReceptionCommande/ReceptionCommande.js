import { DeleteOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons'
import { Breadcrumb, DatePicker, Card, Col, Form, Flex, Row, Select, Typography, Space, InputNumber, Button,Input, Divider, Tooltip } from 'antd'
import React from 'react'
import dayjs from "dayjs"
import { Link, useNavigate } from 'react-router-dom'
import FormFooter from '../../components/common/FormFooter/FormFooter'
import DataTable from '../../components/common/DataTable/DataTable'
const {Option} = Select;
const {Title} = Typography;


function ReceptionCommande() {
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
                        title : <Link to={"/myspace/entrees-produits"} > Entrées produits </Link>
                    } ,
                    {
                        title : "Réception de commandes"
                    }
                ]}
            /> 
            <br/>
            <Title level={3} > Réception de commande  </Title>
            <br/>
            <Form
                layout='vertical'
                form={form}
            >
                <Divider  orientation="left">Référence de bon de commande</Divider>
                <Row gutter={[24,24]} align={"middle"} >
                    <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                        <Form.Item 
                            label="Commandes en instances"
                            name="code_produit" 
                        >
                            <Select
                                showSearch
                                placeholder="choisir"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={"1"} > produit </Option>          
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider  orientation="left">Référence de bon de livraison</Divider>
                <Row gutter={[24,24]} align={"middle"} >
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Form.Item 
                            name="date" 
                            label="Date"
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                            initialValue={dayjs(new Date())}
                        >
                            <DatePicker placeholder='Choisir la date' format="DD/MM/YYYY" />
                        </Form.Item>
                        
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                        <Form.Item 
                            label="Numéro"
                            name="numero" 
                        >
                                <InputNumber min={0} style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider />
                <Row gutter={[24,24]} align={"middle"} >
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Code produit"
                            name="code_produit" 
                        >
                                <InputNumber min={0} style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                        <Form.Item 
                            name="designation" 
                            label="Désignation"
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                        >
                            <Input placeholder='Désignation' />
                        </Form.Item>
                        
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Quantité livrée"
                            name="qte_livree" 
                        >
                                <InputNumber min={0} style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={4} lg={6} xl={6}>
                        <Button type='primary'> Ajouter  </Button>
                    </Col>
                </Row>
                <DataTable 
                    dataSource={[]}
                    dataSourceCopy={[]}
                    setDataSourceCopy={null}
                    columns={[
                        {
                            title: 'Référence',
                            dataIndex: 'reference',
                            key: 'reference'
                        },
                        {
                            title: 'Désignation',
                            dataIndex: 'designation',
                            key: 'designation'
                        },
                        {
                            title: 'Qté commandée',
                            dataIndex: 'qte_commande',
                            key: 'qte_commande'
                        },
                        {
                            title: 'Qté livrée',
                            dataIndex: 'qte_livree',
                            key: 'qte_livree'
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

export default ReceptionCommande
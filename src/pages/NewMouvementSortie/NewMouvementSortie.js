import { DeleteOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons'
import { Breadcrumb, DatePicker, Card, Col, Form, Flex, Row, Select, Typography, Space, InputNumber, Button,Input, Divider, Tooltip, Radio } from 'antd'
import React from 'react'
import dayjs from "dayjs"
import { Link, useNavigate } from 'react-router-dom'
import FormFooter from '../../components/common/FormFooter/FormFooter'
import DataTable from '../../components/common/DataTable/DataTable'
import { formatDate } from '../../utils/helpers'
const {Option} = Select;
const {Title} = Typography;


function NewMouvementSortie() {
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
                        title : <Link to={"/myspace/sorties-produits"} > Sorties produits </Link>
                    } ,
                    {
                        title : "Mouvement de sortie"
                    }
                ]}
            /> 
            <br/>
            <Title level={3} > Mouvement de sortie  </Title>
            <br/>
            <Form
                layout='vertical'
                form={form}
            >
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={12} lg={6} xl={6} >
                        <Form.Item 
                            label="Motif de sortie"
                            name="motif_sortie" 
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                            initialValue={1}
                        >
                            <Radio.Group >
                                <Space direction="vertical">
                                    <Radio value={1}>Appro comptoir</Radio>
                                    <Radio value={2}>Produits périmés</Radio>
                                    <Radio value={3}>Déstockage (gratuité)</Radio>
                                    <Radio value={4}>Défaut</Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                        <Form.Item 
                            name="date_sortie" 
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

                    
                    <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                        <Form.Item 
                            name="Numéro de prescription" 
                            label="numero"
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                        <Form.Item 
                            name="Matricule patient" 
                            label="num_patient"
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        
                    </Col>

                </Row>

                <Divider  orientation="left">Liste des produits</Divider>

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
                                <Option key={1}  value={"1"} > produit </Option>          
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

                
                <DataTable 
                    dataSource={[]}
                    dataSourceCopy={[]}
                    setDataSourceCopy={null}
                    columns={[
                        {
                            title: 'Numéro',
                            dataIndex: 'num_produit',
                            key: 'num_produit'
                        },
                        {
                            title: 'Motif sortie',
                            dataIndex: 'motif',
                            key: 'motif'
                        },
                        {
                            title: 'Etat',
                            dataIndex: 'etat',
                            key: 'etat',
                            render: (record) => <div className='table-data'>
                                <span style={{textOverflow:"ellipsis"}} > {record} </span>
                            </div>,
                        },
                        {
                            title: 'Date',
                            dataIndex: 'date',
                            key: 'date',
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

export default NewMouvementSortie
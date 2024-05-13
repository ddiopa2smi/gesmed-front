import { DeleteOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons'
import { Breadcrumb, DatePicker, Card, Col, Form, Flex, Row, Select, Typography, Space, InputNumber, Button,Input, Divider, Tooltip, Radio, message } from 'antd'
import React, { useState } from 'react'
import dayjs from "dayjs"
import { Link, useNavigate } from 'react-router-dom'
import FormFooter from '../../components/common/FormFooter/FormFooter'
import DataTable from '../../components/common/DataTable/DataTable'
import { deletePopup, formatDate, sortColumn } from '../../utils/helpers'
const {Option} = Select;
const {Title} = Typography;


const ListProduits = ({listProduits , setListProduits}) => {
    const [form] = Form.useForm()
    const onFinish = () => {
        form
        .validateFields()
        .then((values)=>{
            let inc = 0; // increment
            let index = 0;
            const payload = {
                ...values,
                reference : values.code_produit,
                designation : values.code_produit,
                date_peremption : new Date(values.date_peremption).toISOString()
            };
             // Tester l'existence du produit dans la table des produits si oui incrementer inc
             for (let i = 0; i < listProduits.length; i++) {
                if (listProduits[i].reference === payload.reference ) {
                    inc+=1;
                    index = i ;
                }
            }

            if (inc === 1) {
                message.info("Produit existant déjà dans la table des produits , mais modifié avec succès")
                const temp = [...listProduits];
                temp[index] = payload
                // console.log(temp)
                setListProduits(temp)
            }else {
                const temp = [...listProduits]
                temp.push(payload)
                setListProduits(temp)
                form.resetFields()
            }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }
    return(
        <Form
            layout='vertical'
            form={form}
            onFinish={onFinish}
            //preserve={false}
        >
            <Divider  orientation="left">Liste des produits</Divider>
            <Row gutter={[24,24]} align={"middle"} >
                <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                    <Form.Item 
                        label="Produits"
                        name="code_produit" 
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="choisir"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                        >     
                            <Option key={1}  value={"p-1"} > produit 1 </Option>          
                            <Option key={2}  value={"p-2"} > produit 2 </Option>          
                            <Option key={3}  value={"p-3"} > produit 3 </Option>          
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                    <Form.Item 
                        label="Quantité"
                        name="qte" 
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
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
                    <Button type='primary' htmlType='submit' > Ajouter  </Button>
                </Col>
            </Row>
        </Form>
    )
}

function NewMouvementSortie() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [listProduits , setListProduits] = useState([])
    return (
        <Card>
            <Title level={3} > Mouvement de sortie  </Title>
            <br/>
            <Form
                layout='vertical'
                form={form}
            >
                <Flex align='center' justify='flex-end' >
                    <Button type='primary' htmlType='submit' >Enregistrer</Button>
                </Flex>
                <br/>
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

                
                {/* <br/>
                <FormFooter onCancel={()=>{navigate(-1)}} /> */}
            </Form>

            
            <ListProduits 
                listProduits={listProduits}
                setListProduits={setListProduits}
            />
            
            <DataTable 
                dataSource={[]}
                dataSourceCopy={listProduits || []}
                setDataSourceCopy={setListProduits}
                rowKey={(record)=>record.reference}
                columns={[
                    {
                        title: 'Référence',
                        dataIndex: 'reference',
                        key: 'reference'
                    },
                    {
                        title: 'Désignation',
                        dataIndex: 'designation',
                        key: 'designation',
                        sorter: (a, b) => sortColumn(a.designation , b.designation) 
                    },
                    {
                        title: 'Quantité',
                        dataIndex: 'qte',
                        key: 'qte',
                        sorter: (a, b) => sortColumn(a.qte , b.qte) 
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
                                    {/* <Tooltip title="Editer">
                                        <Button type='link' icon={<EditOutlined/>} />
                                    </Tooltip> */}
                                    <Tooltip title="Supprimer">
                                        <Button 
                                            type='link' 
                                            danger 
                                            icon={<DeleteOutlined/>} 
                                            onClick={()=>{ 
                                                deletePopup()
                                                .then((response)=>{
                                                    if (response.isConfirmed) {
                                                        const temp = listProduits.filter((element)=>element.reference !== record.reference);
                                                        setListProduits(temp);
                                                    }
                                                })
                                            }} 
                                        />
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

export default NewMouvementSortie
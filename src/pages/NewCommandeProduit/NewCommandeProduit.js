import { Breadcrumb, Button, Card, Col, DatePicker, Divider, Flex, Form,InputNumber, Row, Select, Space, Tooltip } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import dayjs from 'dayjs'
import { DeleteOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';

//import DataTable from '../../shared/DataTable/DataTable';

const {Option} = Select;


function NewCommandeProduit() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    
    return (
        <Card>
            <Breadcrumb
                items={[
                    {
                        title : <a onClick={()=>{navigate("/myspace/dashboard")}} > <HomeOutlined/> </a>
                    } ,
                    {
                        title : <a onClick={()=>{navigate(-1)}} > Commandes produits </a>
                    } ,
                    {
                        title : "Nouveaux commandes produits"
                    }
                ]}
            /> 

            <br/>
            <Form
                layout='vertical'
                form={form}
                //initialValues={null}
                // onValuesChange={(changedValues , values)=>{
                //     if (changedValues.code_produit) {
                //         const medicamentCode = changedValues.code_produit;
                //         listMedicaments.forEach(element => {
                //             if (element.codeacte === medicamentCode) {
                //                 setMedicamentSelected(element);
                //             }
                //         }); 
                //     }
                    
                // }}
            >

                <Divider  orientation="left">En-tête Bon de commande</Divider>

                <Row gutter={[24,24]}>
                    <Col  xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Numéro"
                            name="numero_bc" 
                        >
                            <InputNumber min={0}/>
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Date prévue"
                            name="date" 
                            initialValue={dayjs(new Date())}
                        >
                            <DatePicker placeholder='Choisir la date' disabled format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Date prévue"
                            name="date_p" 
                            initialValue={dayjs(new Date())}
                        >
                            <DatePicker placeholder='Choisir la date' disabled format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Date de livraison"
                            name="date_livraison" 
                            initialValue={dayjs(new Date())}
                        >
                            <DatePicker placeholder='Date de livraison' disabled format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Fournisseur"
                            name="fournisseur" 
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Choisir..."
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                //loading={selectMedicamentsListLoading}
                            >     
                                {/* {
                                    listMedicaments.map((item)=>(
                                        <Option key={item.codeacte}  value={item.codeacte} > {item.libacte} </Option>
                                    ))
                                }   */}
                                <Option key="1"  value="fournisseur" > Fournisseur </Option>

                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation="left">Détails commande</Divider>
                <Row gutter={[24,24]} align="middle" >
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Produit"
                            name="produit" 
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Choisir..."
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={false}
                            >     
                                {/* {
                                    listProduits.map((item)=>(
                                        <Option key={item.codeacte}  value={item.codeacte} > {item.libacte} </Option>
                                    ))
                                }   */}
                                <Option key="1"  value="liste produits" > Liste produits </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={3} xl={3}>
                        <Form.Item 
                            label="Prix unitaire"
                            name="pu" 
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={3} xl={3}>
                        <Form.Item 
                            label="Quantité"
                            name="quantite" 
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Button type="primary"  htmlType='submit' >Ajouter</Button>
                    </Col>
                </Row>   
                <br/>
            </Form>
            <br />
            <DataTable 
                dataSource={[]}
                dataSourceCopy={[]}
                setDataSourceCopy={null}
                columns={[
                    {
                        title: 'Référence',
                        dataIndex: 'reference',
                        key: 'reference',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        </div> ,
                    },
                    {
                        title: 'Désignation',
                        dataIndex: 'designation',
                        key: 'designation',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        </div> ,
                        sorter: (a, b) => a.designation.charCodeAt(0) - b.designation.charCodeAt(0),
                        //sortOrder: sortedInfo.columnKey === 'designation' ? sortedInfo.order : null,
                    },
                    {
                        title: 'Quantité',
                        dataIndex: 'qte',
                        key: 'qte',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        </div> ,
                        sorter: (a, b) => a.qte.charCodeAt(0) - b.qte.charCodeAt(0),
                        //sortOrder: sortedInfo.columnKey === 'qte' ? sortedInfo.order : null,
                    },
                    {
                        title: 'P.U (HT)',
                        dataIndex: 'pu',
                        key: 'pu',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        </div> ,
                        sorter: (a, b) => a.pu.charCodeAt(0) - b.pu.charCodeAt(0),
                        //sortOrder: sortedInfo.columnKey === 'pu' ? sortedInfo.order : null,
                    },
                    {
                        title: 'Total (HT)',
                        dataIndex: 'total',
                        key: 'total',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        </div> ,
                        sorter: (a, b) => a.total.charCodeAt(0) - b.total.charCodeAt(0),
                        //sortOrder: sortedInfo.columnKey === 'total' ? sortedInfo.order : null,
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
            <br />
       

            <FormFooter  
                onCancel={()=>{navigate(-1)}}
                onValid={()=>{return;}}
            />
        </Card>
        
    )
}

export default NewCommandeProduit
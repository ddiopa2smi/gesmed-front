import { Breadcrumb, Button, Card, Col, DatePicker, Divider, Flex, Form,InputNumber, Modal, Row, Select, Space, Tooltip } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import dayjs from 'dayjs'
import { DeleteOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';
import DetailsCommande from '../../components/specific/DetailsCommande/DetailsCommande';
import { deletePopup, sortColumn } from '../../utils/helpers';

//import DataTable from '../../shared/DataTable/DataTable';

const {Option} = Select;


function NewCommandeProduit() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [listProduitsCommandes , setListProduitsCommandes] = useState([])
    return (
        <Card>
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

                <Flex align='center' justify='flex-end' >
                    <Button type='primary' htmlType='submit' >Enregistrer</Button>
                </Flex>
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
                            label="Date commande"
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
                 
                

                {/* <DetailsCommande 
                    listProduitsCommandes={listProduitsCommandes}
                    setListProduitsCommandes={setListProduitsCommandes}
                />

                <br /> */}

                

            </Form>

            <DetailsCommande 
                listProduitsCommandes={listProduitsCommandes}
                setListProduitsCommandes={setListProduitsCommandes}
            />

            <br/>

            <DataTable 
                dataSource={[]}
                dataSourceCopy={listProduitsCommandes || []}
                setDataSourceCopy={setListProduitsCommandes}
                rowKey={(record)=>record.reference}
                columns={[
                    {
                        title: 'Référence',
                        dataIndex: 'reference',
                        key: 'reference',
                        // render: (record) => <div className='table-data'>
                        //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        // </div> ,
                    },
                    {
                        title: 'Désignation',
                        dataIndex: 'produit',
                        key: 'produit',
                        // render: (record) => <div className='table-data'>
                        //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        // </div> ,
                        sorter: (a, b) => sortColumn(a.produit , b.produit) ,
                        //sortOrder: sortedInfo.columnKey === 'produit' ? sortedInfo.order : null,
                    },
                    {
                        title: 'Quantité',
                        dataIndex: 'quantite',
                        key: 'quantite',
                        // render: (record) => <div className='table-data'>
                        //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        // </div> ,
                        sorter: (a, b) => sortColumn(a.quantite , b.quantite),
                        //sortOrder: sortedInfo.columnKey === 'quantite' ? sortedInfo.order : null,
                    },
                    {
                        title: 'P.U (HT)',
                        dataIndex: 'pu',
                        key: 'pu',
                        // render: (record) => <div className='table-data'>
                        //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        // </div> ,
                        sorter: (a, b) => sortColumn(a.pu , b.pu),
                        //sortOrder: sortedInfo.columnKey === 'pu' ? sortedInfo.order : null,
                    },
                    {
                        title: 'Total (HT)',
                        dataIndex: 'total',
                        key: 'total',
                        // render: (record) => <div className='table-data'>
                        //     <span style={{textOverflow:"ellipsis"}} > {record.toUpperCase()} </span>
                        // </div> ,
                        sorter: (a, b) => sortColumn(a.total , b.total),
                        //sortOrder: sortedInfo.columnKey === 'total' ? sortedInfo.order : null,
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Space size="middle" >
                                    {/* <Tooltip title="Editer">
                                        <Button 
                                            type='link' 
                                            icon={<EditOutlined/>} 
                                            onClick={()=>{ 
                                                setCurrentRecord({...record})
                                            }} 
                                        />
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
                                                        const temp = listProduitsCommandes.filter((element)=>element.reference !== record.reference);
                                                        setListProduitsCommandes(temp);
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

export default NewCommandeProduit
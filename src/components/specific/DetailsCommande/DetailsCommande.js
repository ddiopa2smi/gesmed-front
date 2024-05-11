import { Button, Col, Divider, Form, InputNumber, Row, Select } from 'antd'
import React from 'react'

const {Option}  = Select;
function DetailsCommande({ listProduitsCommandes , setListProduitsCommandes}) {
    const [form] = Form.useForm()
    const onFinish = () => {
        form
        .validateFields()
        .then((values)=>{
            const temp = [...listProduitsCommandes]
            temp.push({
                ...values,
                reference : Date.now(),
                total  : values.pu * values.quantite
            })
            setListProduitsCommandes(temp)
            //console.log(temp)
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }
    return (
        <>
            <Form
                layout='vertical'
                form={form}
                onFinish={onFinish}
                preserve={false}
            >
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
            </Form>
        </>
    )
}

export default DetailsCommande
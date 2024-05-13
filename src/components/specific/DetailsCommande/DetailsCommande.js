import { Button, Col, Divider, Form, InputNumber, Row, Select, message } from 'antd'
import React, { useEffect } from 'react'

const {Option}  = Select;
function DetailsCommande({listProduitsCommandes , setListProduitsCommandes}) {
    const [form] = Form.useForm()
    const onFinish = () => {
        form
        .validateFields()
        .then((values)=>{
            let inc = 0; // increment
            let index = 0;
            const payload = {
                ...values,
                reference : values.produit,
                total  : values.pu * values.quantite
            };
             // Tester l'existence du produit dans la table des produits si oui incrementer inc
             for (let i = 0; i < listProduitsCommandes.length; i++) {
                if (listProduitsCommandes[i].reference === payload.reference ) {
                    inc+=1;
                    index = i ;
                }
            }

            if (inc === 1) {
                message.info("Produit existant déjà dans la table des commandes , mais modifié avec succès")
                const temp = [...listProduitsCommandes];
                temp[index] = payload
                // console.log(temp)
                setListProduitsCommandes(temp)
            }else {
                const temp = [...listProduitsCommandes]
                temp.push(payload)
                setListProduitsCommandes(temp)
                form.resetFields()
            }
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
                //preserve={false}
            >
                <Divider orientation="left">Détails commande</Divider>
                <Row gutter={[24,24]} align="middle" >
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Form.Item 
                            label="Produit"
                            name="produit" 
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
                                placeholder="Choisir..."
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={false}
                            >     
                                <Option key="1"  value="p-1" > Produit 1 </Option>
                                <Option key="2"  value="p-2" > Produit 2 </Option>
                                <Option key="3"  value="p-3" > Produit 3 </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={4} xl={4}>
                        <Form.Item 
                            label="Prix unitaire"
                            name="pu" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={4} xl={4}>
                        <Form.Item 
                            label="Quantité"
                            name="quantite" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
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
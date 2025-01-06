import { Col, Form, Input, Radio, Row, Select, Space, Card , Checkbox, InputNumber, message, Typography } from 'antd';
import FormFooter from "../../common/FormFooter/FormFooter";


const {TextArea} = Input;
const {Title} = Typography;
const { Option } = Select;

const Posologie = ({medicamentsPrescrites ,setMedicamentsPrescrites, medicamentSelected, quantity , setIsModalVisible}) => {
    
    
    const [form] = Form.useForm();

    const onFinish = () => {
        form
        .validateFields()
        .then((values)=>{
            let inc = 0; // increment
            let index = 0;
            const payload = {
                codeacte : medicamentSelected.codeacte ,
                libacte : medicamentSelected.libacte ,
                posologie : `${values.qte} ${values.forme_galenique} - ${values.qd} - ${values.comment} - pendant ${values.duree} jour(s)` ,
                qte : quantity ,
                observation : values.observation
            }

            // Tester l'existence du médicament dans la table des medicaments si oui incrementer inc
            for (let i = 0; i < medicamentsPrescrites.length; i++) {
                if (medicamentsPrescrites[i].codeacte === medicamentSelected.codeacte ) {
                    inc+=1;
                    index = i ;
                }
            }

            // Si le médicament existe alors modifier les valeurs du médicament courant sinon ajouter un autre médicament
            if (inc === 1) {
                const temp = {...medicamentsPrescrites[index],...payload};
                medicamentsPrescrites[index].codeacte =temp.codeacte;
                medicamentsPrescrites[index].libacte =temp.libacte;
                medicamentsPrescrites[index].posologie =temp.posologie;
                medicamentsPrescrites[index].qte =temp.qte;
                medicamentsPrescrites[index].observation =temp.observation;
                setMedicamentsPrescrites(medicamentsPrescrites);
                //message.info("Médicament déjà existant et modifié avec succès");
            }else{
                const temp = medicamentsPrescrites.push(payload);
                setMedicamentsPrescrites([...medicamentsPrescrites] , temp);
                //message.success("Médicament ajouté dans la liste avec succès");
            }
            form.resetFields();
            setIsModalVisible(false);
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

    
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            preserve={false}
        >
            <Title level={5} > { medicamentSelected !== null ? medicamentSelected.libacte : ""} </Title>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item 
                        label="Quantité"
                        name="qte" 
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={1}
                    >
                        <InputNumber min={1} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item 
                        label="Forme"
                        name="forme_galenique" 
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={"comprimes"}
                    >
                       <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Forme"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >     
                            <Option key={"comprimes"}  value={"comprimés"} > Comprimés </Option>
                            <Option key={"cuilliere"}  value={"cuillièrées"} > Cuillièrées </Option>
                            <Option key={"ovules"}  value={"ovules"} > Ovules </Option>
                            <Option key={"application"}  value={"applications"} > Applications </Option>
                            <Option key={"ampoules"}  value={"ampoules"} > Ampoules </Option>
                            <Option key={"sachets"}  value={"sachets"} > Sachets </Option>
                            <Option key={"injections"}  value={"injections"} > Injections </Option>
                            <Option key={"gouttes"}  value={"gouttes"} > Gouttes </Option>
                            <Option key={"gellules"}  value={"gellules"} > Gellules </Option>
                            <Option key={"suppositoires"}  value={"suppositoires"} > Suppositoires </Option>

                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                  
                    <Form.Item 
                        name="qd" 
                        label="Quand"
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={["Matin"]}
                    >
                        <Checkbox.Group style={{ display:"flex",flexDirection:"column"}} options={["Matin","Midi","Soir","Au coucher"]}/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Radio.Group>
                        <Form.Item 
                            name="comment" 
                            label="Comment"
                            initialValue={"Aucun"}
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Space direction="vertical">
                                <Radio value={"Aucun"}>Aucun</Radio>
                                <Radio value={"A jeun"}>A jeun</Radio>
                                <Radio value={"Avant repas"}>Avant repas </Radio>
                                <Radio value={"Après repas"}>Après repas</Radio>
                                <Radio value={"Milieu repas"}>Milieu repas</Radio>
                            </Space>
                        </Form.Item>
                        
                    </Radio.Group>
                    
                </Col>
            </Row>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Durée traitement en jours"
                        name="duree" 
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={1}
                    >
                        <InputNumber min={1} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={16} md={16} lg={16} xl={16} >
                    <Form.Item 
                        label="Observation"
                        name="observation" 
                    >
                        <TextArea rows={4} /> 
                    </Form.Item>
                </Col>
            </Row>
            

            <FormFooter 
                onCancel={()=>{setIsModalVisible(false)}}
                htmlType='submit'
                validLabel={"Ajouter"}
            />
            
        </Form>
    )
}

export default Posologie;
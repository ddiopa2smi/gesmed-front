import { Col, Form, Input, Row, Select, InputNumber, message} from 'antd';
import FormFooter from '../../common/FormFooter/FormFooter';


const {TextArea} = Input;
const { Option } = Select;

const AddImagerie = ({ setIsModalVisible , listImageries , imageriesPrescrites , setImageriesPrescriptes}) => {
    const [form] = Form.useForm();
    
    const onFinish = () => {
        form
        .validateFields()
        .then((values) => {
            let inc = 0; // increment
            let index = 0 ;
            listImageries.forEach(element => {
                if (element.codeacte === values.codeacte ) {
                    values.libacte = element.libacte ;
                }
            });

            // Tester l'existence de l'imagerie dans la table des imageries si oui incrementer inc
            for (let i = 0; i < imageriesPrescrites.length; i++) {
                if (imageriesPrescrites[i].codeacte === values.codeacte ) {
                    inc+=1;
                    index = i;
                }
            }

            if (inc===1) {
                const temp = {...imageriesPrescrites[index],...values};
                imageriesPrescrites[index].codeacte = temp.codeacte;
                imageriesPrescrites[index].libacte = temp.libacte;
                imageriesPrescrites[index].qte = temp.qte;
                imageriesPrescrites[index].motifImagerie = temp.motifImagerie;
                setImageriesPrescriptes(imageriesPrescrites);
                //message.info("Imagerie déjà existante et modifiée avec succès");
            }
            else {
                const temp = imageriesPrescrites.push(values);
                setImageriesPrescriptes([...imageriesPrescrites] , temp);
                //message.success("Imagerie ajoutée dans la liste avec succès");
            }
            setIsModalVisible(false);
            form.resetFields(); 
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

   

    return(
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
        >
           
           <Row gutter={[24,24]}>
                        
                <Col xs={24} sm={24} md={16} lg={16} xl={16} >
                    <Form.Item 
                        label="Imagerie"
                        name="codeacte" 
                            rules={[
                                {
                                required: true,
                                message: 'Sélection obligatoire',
                                },
                            ]}
                        initialValue={null}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Imagerie"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                        >     
                                {
                                    listImageries.map((item)=>(
                                        <Option key={item.codeacte}  value={item.codeacte} > {item.libacte} </Option>
                                    ))
                                }
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8} >
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
            </Row>
           
            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                    <Form.Item 
                        label="Motif"
                        name="motifImagerie" 
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                    >
                        <TextArea  rows={4} />
                    </Form.Item>
                </Col>
            </Row> 

            <FormFooter 
                onCancel={()=>{setIsModalVisible(false)}}
                htmlType='submit'
            />
        </Form>
    )
}

export default AddImagerie;
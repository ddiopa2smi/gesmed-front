import { Col, Form, Input, InputNumber, Row, message } from 'antd';
import { useState } from 'react';
import { postActions , putActions } from '../../../actions/actions';
import TextArea from 'antd/es/input/TextArea';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';

const AddTypeMaladie = ({setIsModalVisible , operationType , refresh , itemSelected}) => {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);

    const handleCurrentTask = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                        postActions(endpoints.maladiesProfessionelles.ADD,values)
                        .then((response)=>{
                            if (response.data.Added === true) {
                                setFormLoading(false);
                                message.success("Nouveau type de maladie ajouté avec succès");
                                refresh();
                                setIsModalVisible(false);
                            }
                        })
                        
                    break;
                case "update":
                        values.code_mp = itemSelected ?  itemSelected.code_mp : null ;
                        putActions(endpoints.maladiesProfessionelles.UPDATE,values)
                        .then((response)=>{
                            if (response.data.Updated === true) {
                                setFormLoading(false);
                                message.success("Type de maladie mis à jour avec succès");
                                refresh();
                                setIsModalVisible(false);
                            }
                        })
                    break;
                default:
                    break;
            }
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
            onFinish={handleCurrentTask}
        >
            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="num_tableau"
                        label="Numéro tableau"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={(itemSelected && itemSelected.num_tableau)||null}
                    >
                        <InputNumber/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="type_mp"
                        label="Type de maladie"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={(itemSelected && itemSelected.type_mp)||null}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="description_mp"
                        label="Description de la maladie"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={(itemSelected && itemSelected.description_mp)||null}
                    >
                        <TextArea rows={4}/>
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

export default AddTypeMaladie;
import { Col, Form, Input, Row, message } from 'antd';
import { useState } from 'react';
import { postActions , putActions } from '../../../actions/actions';
import TextArea from 'antd/es/input/TextArea';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';

const AddPoste = ({setIsModalVisible , operationType , refresh , itemSelected}) => {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);

    const handleCurrentTask = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                        postActions(endpoints.postes.ADD,values)
                        .then((response)=>{
                            if (response.data.Added === true) {
                                setFormLoading(false);
                                message.success("Nouveau poste ajouté avec succès");
                                refresh();
                                setIsModalVisible(false);
                            }
                        })
                        
                    break;
                case "update":
                        values.code_poste = itemSelected ?  itemSelected.code_poste : null ;
                        putActions(endpoints.postes.UPDATE,values)
                        .then((response)=>{
                            if (response.data.Updated === true) {
                                setFormLoading(false);
                                message.success("Poste mis à jour avec succès");
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
                        name="lib_poste"
                        label="Libellé du poste"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={(itemSelected && itemSelected.lib_poste)||null}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="nature_poste"
                        label="Nature travail"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={(itemSelected && itemSelected.nature_poste)||null}
                    >
                        <TextArea  rows={4} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="risques_poste"
                        label="Risques liés"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={(itemSelected && itemSelected.risques_poste)||null}
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

export default AddPoste;
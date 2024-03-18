import { Button, Col, Form, Input, Row, message} from 'antd';
import { useEffect, useState } from 'react';
import { postActions , putActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';

const AddStructure = ({setIsModalVisible , operationType , refresh , itemSelected}) => {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);

    const handleCurrentTask = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                        postActions(endpoints.structures.ADD,values)
                        .then((response)=>{
                            if (response.data.Added === true) {
                                setFormLoading(false);
                                message.success("Nouvelle structure ajoutée avec succès");
                                refresh();
                                setIsModalVisible(false);
                            }
                        })
                        
                    break;
                case "update":
                        values.code_structure = itemSelected ?  itemSelected.code_structure : null ;
                        putActions(endpoints.structures.UPDATE,values)
                        .then((response)=>{
                            if (response.data.Updated === true) {
                                setFormLoading(false);
                                message.success("Structure mise à jour avec succès");
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
                        name="lib_structure"
                        label="Libellé de la structure"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={itemSelected?.lib_structure}
                    >
                        <Input/>
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

export default AddStructure;
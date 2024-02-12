import { Col, Form, Input, Row,message } from 'antd';
import { useState } from 'react';
import { postActions , putActions } from '../../../actions/actions';
import FormFooter from '../../common/FormFooter/FormFooter';
import { endpoints } from '../../../constants/endpoints.constants';


const AddPathologie = ({
    operationType ,
    setOpen , 
    currentRecord ,
    onRefresh , 

}) => {
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setLoading(true);
            switch (operationType) {
                case "add":
                        postActions(endpoints.pathologie.ADD,values)
                        .then((response)=>{
                            if (response.data.Added === true) {
                                setLoading(false)
                                message.success("Enregistrement effectué avec succès");
                                //onRefresh();
                                form.resetFields(); 
                                setOpen(false);
                            }
                        })
                        
                    break;
                case "update":
                    values.code_patho = currentRecord?.code_patho;
                    putActions(endpoints.pathologie.UPDATE,values)
                        .then((response)=>{
                            if (response.data.Updated === true) {
                                setLoading(false);
                                message.success("Modification effectuée avec succès");
                                //onRefresh();
                                form.resetFields(); 
                                setOpen(false);
                            }
                        })
                    break;
                default:
                    break;
            }
            
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }
  

    return(
        <Form
            form={form}
            layout="vertical"
            initialValues={currentRecord}
            onFinish={save}
            preserve={operationType === "update" ? false : true}
        >
            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="libelle_patho"
                        label="Libellé"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        
                    >
                        <Input/>
                    </Form.Item>
                </Col>
            </Row>
            
            
            <FormFooter 
                onCancel={()=>{setOpen(false)}}
                loading={loading}
                htmlType='submit'
            />
         
        </Form>
    )
}

export default AddPathologie;
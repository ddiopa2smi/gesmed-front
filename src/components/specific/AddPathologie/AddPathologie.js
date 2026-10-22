import { Col, Form, Input, Row, message, Descriptions } from 'antd';
import { useState } from 'react';
import { postActions , putActions } from '../../../actions/actions';
import FormFooter from '../../common/FormFooter/FormFooter';
import { endpoints } from '../../../constants/endpoints.constants';
import TextArea from 'antd/es/input/TextArea';



const AddPathologie = ({
    operationType ,
    setOpen , 
    currentRecord ,
    onRefresh , 
    codeService

}) => {
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setLoading(true);

            const payload = {
                ...values,
                code_spe : JSON.parse(sessionStorage.getItem("userConnected"))?.code_serv
            }

            switch (operationType) {

                case "add":
                        postActions(endpoints.pathologie.ADD,payload)
                        .then((response)=>{
                            if (response.data.Added === true) {
                                setLoading(false)
                                message.success("Enregistrement effectué avec succès");
                                onRefresh();
                                form.resetFields(); 
                                setOpen(false);
                            }
                        })
                        
                    break;
                case "update":
                    //values.code_patho = currentRecord?.code_patho;
                    payload.code_patho = currentRecord?.code_patho;
                    putActions(endpoints.pathologie.UPDATE,payload)
                        .then((response)=>{
                            if (response.data.Updated === true) {
                                setLoading(false);
                                message.success("Modification effectuée avec succès");
                                onRefresh();
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
  

    
    if (operationType === "details") {
        return (
            <Descriptions 
                bordered 
                column={1} 
                size="middle"
                title={`Détails : ${currentRecord?.libelle_patho || ''}`}
            >
                <Descriptions.Item label="Libellé" labelStyle={{ fontWeight: 'bold', width: '30%' }}>
                    {currentRecord?.libelle_patho}
                </Descriptions.Item>
                <Descriptions.Item label="Description" labelStyle={{ fontWeight: 'bold' }}>
                    {currentRecord?.description || <span style={{ fontStyle: 'italic', color: '#999' }}>Non renseigné</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Symptômes principaux" labelStyle={{ fontWeight: 'bold' }}>
                    {currentRecord?.symptomes_principaux || <span style={{ fontStyle: 'italic', color: '#999' }}>Non renseigné</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Causes principales" labelStyle={{ fontWeight: 'bold' }}>
                    {currentRecord?.causes_principales || <span style={{ fontStyle: 'italic', color: '#999' }}>Non renseigné</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Traitements communs" labelStyle={{ fontWeight: 'bold' }}>
                    {currentRecord?.traitements_communs || <span style={{ fontStyle: 'italic', color: '#999' }}>Non renseigné</span>}
                </Descriptions.Item>
            </Descriptions>
        );
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
                        label="Libellé pathologie"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        
                    >
                        <Input  />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            {
                                required: false,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        
                    >
                        <TextArea
                            rows={2}
                            
                        />
                    </Form.Item>
                    <Form.Item
                        name="symptomes_principaux"
                        label="Symptômes principaux"
                        rules={[
                            {
                                required: false,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        
                    >
                        <TextArea
                            rows={2}
                            
                        />
                    </Form.Item>
                    <Form.Item
                        name="causes_principales"
                        label="Causes principales"
                        rules={[
                            {
                                required: false,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        
                    >
                        <TextArea
                            rows={2}
                            
                        />
                    </Form.Item>
                    <Form.Item
                        name="traitements_communs"
                        label="Traitements communs"
                        rules={[
                            {
                                required: false,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        
                    >
                        <TextArea
                            rows={2}
                            
                        />
                    </Form.Item>
                </Col>
            </Row>
            
            {
                operationType !== "details" && 
                <FormFooter 
                    onCancel={()=>{setOpen(false)}}
                    loading={loading}
                    htmlType='submit'
                />
            }
         
        </Form>
    )
}

export default AddPathologie;
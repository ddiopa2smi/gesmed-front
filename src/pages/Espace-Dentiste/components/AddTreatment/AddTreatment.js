import { Col, Form, Input, Row, Select } from 'antd';
import React, { useState } from 'react'
import FormFooter from '../../../../components/common/FormFooter/FormFooter';

const {TextArea} = Input;
const {Option} = Select;
function AddTreatment({ setOpen , operationType , onRefresh , currentRecord}) {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                       
                        console.log(values)
                        // postActions(endpoints.patients.ADD,values)
                        // .then((response)=>{
                        //     //setFormLoading(false);

                        //     if (response.data.Added) {
                        //         message.success("Nouveau patient ajouté avec succès");
                                
                        //         setOpen(false);
                        //         form.resetFields();
                        //         onRefresh();
                        //     }
                        //     else {
                        //         message.warning("Patient déja ajouté")
                        //     }

                            
                        // })
                        // .finally(()=>{
                        //     // setFormLoading(false)
                        //     // setOpen(false);
                        //     // form.resetFields();
                        //     // onRefresh();
                        //     setFormLoading(false)
                        // })
                        
                    break;
                case "update":
                        // values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
                        // values.num_patient = currentRecord ? currentRecord.num_patient : null;
                        // putActions(endpoints.patients.UPDATE,values)
                        // .then((response)=>{
                        //     setFormLoading(false);
                        //     message.success("Opération éffectuée avec succès");
                        //     setOpen(false);
                        //     form.resetFields();
                        //     onRefresh();
                        // })
                        // setOpen(false);
                    break;
                default:
                    break;
            }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={save}
            preserve={false}
            initialValues={currentRecord}
        >
            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="nom_traitement"
                        label="Nom du traitement"
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
            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="categorie_traitement"
                        label="Catégorie de traitement"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Catégorie de traitement"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >     
                                <Option value={'A'} > A </Option>                  
                                <Option value={'A+'} > A+ </Option>                
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="description_traitement"
                        label="Description du traitement"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                    >
                        <TextArea/>
                    </Form.Item>
                </Col>
            </Row>

            <FormFooter 
                loading={formLoading}
                onCancel={()=>{setOpen(false)}}
                htmlType='submit'
            />
        </Form>
    )
}

export default AddTreatment
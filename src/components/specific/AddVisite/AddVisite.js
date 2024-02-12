import { Button, Col, Form, Input, Radio, Row, Select, Typography, Upload , DatePicker, Card, Calendar, InputNumber, Checkbox, message, Divider } from 'antd';
import dayjs from 'dayjs'

import FormFooter from '../../common/FormFooter/FormFooter';
import { postActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import { useState } from 'react';
const {TextArea} = Input;
const { Option } = Select;
const {Title , Text} = Typography;

const AddVisite = ({setOpen , operationType , onRefresh , currentRecord}) => {
    const [form] = Form.useForm();
    
    const [formLoading , setFormLoading] = useState(false);

    const save = () => {
        form
        .validateFields()
        .then((values) => {
            switch (operationType) {
                case "add":
                        values.date_visite = new Date(values.date_visite).toISOString();
                        postActions(endpoints.visitesLieux.ADD,values)
                        .then((response)=>{
                            if (response.data.Added === true) {
                                message.success("Nouvelle visite ajoutée avec succès");
                                onRefresh();
                                setOpen(false);
                            } 
                        })
                        
                    break;
                case "update":
                        setOpen(false);
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
            onFinish={save}
            preserve={false}
        >
            <Divider>Visite</Divider>
            
            <Row gutter={[24,24]}>
                <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Date"
                        name="date_visite" 
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={dayjs(currentRecord?.date_visite) || dayjs(new Date())}
                    >
                        <DatePicker format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Lieu"
                        name="lieu_visite" 
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.lieu_visite}
                    >
                        <Input placeholder='Lieu de la visite' />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Nature"
                        name="nature_visite" 
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.nature_visite}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Nature"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >     
                                    <Option key={'SPONTANEE'}  value={'SPONTANEE'} > SPONTANEE </Option>
                                    <Option key={'ADMINISTRATIVE'}  value={'ADMINISTRATIVE'} > ADMINISTRATIVE </Option>
                                    <Option key={'TRAVAIL'}  value={'TRAVAIL'} > TRAVAIL </Option>
                                    <Option key={'INSPECTION'}  value={'INSPECTION'} > INSPECTION </Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <br/>

            <Divider>Risques et problèmes</Divider>
                                   
            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item 
                        label="Risques identifiés"
                        name="risques" 
                        initialValue={currentRecord?.risques || "Néant"}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item 
                        label="Problèmes liés"
                        name="problemes" 
                        initialValue={currentRecord?.problemes || "Néant"}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Col>
            </Row>
            <br/>

            <Divider>Mesures et préventions</Divider>
      
            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item 
                        label="Individuelles"
                        name="mesures_ind" 
                        initialValue={currentRecord?.mesures_ind || "Néant"}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item 
                        label="Collectives"
                        name="mesures_col" 
                        initialValue={currentRecord?.mesures_col || "Néant"}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Col>
            </Row>
            <br/>

            <FormFooter 
                onCancel={()=>{setOpen(false)}}
                htmlType='submit'
            />
            
        </Form>
    )
}

export default AddVisite;
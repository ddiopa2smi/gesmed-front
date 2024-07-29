import { Col, Form, Row, Calendar, message, Typography, Select, DatePicker } from 'antd';
import { useState } from 'react';
import { postActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';
import dayjs from "dayjs"

const {Title} = Typography;
const {Option} = Select;
function AddRv({setOpen , onRefresh , currentRecord}) {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);
     
    const createRV = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true)
            values.num_patient = currentRecord?.num_patient;
            values.date_rv = new Date(values.date_rv).toISOString();
            postActions(endpoints.rendezVous.ADD,values)
            .then((response)=>{
                setFormLoading(false)
                if (response.data.Created === true) {
                    message.success("Rendez-vous fixé avec succès");
                    onRefresh();
                    
                }
                setOpen(false);
            })
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={createRV}
        >
            <Title level={4} > Patient {currentRecord?.num_patient} / {currentRecord?.prenom_patient} {currentRecord?.nom_patient} </Title>
            <Row>
                <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="medecin" 
                        label="Médécin traitant"
                        rules={[
                            {
                                required: true,
                                message: 'Veuillez sélectionner le service',
                            },
                        ]}
                        //initialValue={dayjs(new Date())}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Médécin traitant"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={false}
                        >    
                            <Option key={1}  value={"MEDECINE_GENERALE"} > MEDECINE GENERALE </Option>
                                        
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="service" 
                        label="Service"
                        rules={[
                            {
                                required: true,
                                message: 'Veuillez sélectionner le service',
                            },
                        ]}
                        //initialValue={dayjs(new Date())}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Service"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={false}
                        >    
                            <Option key={1}  value={"MEDECINE_GENERALE"} > MEDECINE GENERALE </Option>
                            <Option key={2}  value={"MATERNITE"} > MATERNITE </Option>
                            <Option key={3}  value={"RADIOLOGIE"} > RADIOLOGIE </Option>
                            <Option key={4}  value={"BIOCHIMIE"} > BIOCHIMIE </Option>
                                        
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                    <Form.Item 
                        label="Date du rendez-vous"
                        name="date_rv" 
                    >
                        <DatePicker placeholder='Sélectionner' showTime  />
                    </Form.Item>
                </Col>
            </Row>
           
            <Row>
                <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="date_rv" 
                        rules={[
                            {
                                required: true,
                                message: 'Veuillez sélectionner la date du rendez-vous',
                            },
                        ]}
                        initialValue={dayjs(new Date())}
                    >
                        <Calendar fullscreen={false} />
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

export default AddRv
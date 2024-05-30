import { Col, Form, Row, Calendar, message, Typography } from 'antd';
import { useState } from 'react';
import { postActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';
import dayjs from "dayjs"

const {Title} = Typography;
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
                <Col>
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
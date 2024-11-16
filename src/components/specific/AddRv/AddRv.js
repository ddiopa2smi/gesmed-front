import { Col, Form, Row, Calendar, message, Typography, Select, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import { postActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';
import dayjs from "dayjs"
import useFetch from '../../../utils/hooks/useFetch';

const {Title} = Typography;
const {Option} = Select;

const typesRV = [
    {
        id : "rv_defaut",
        label : "RV par défaut"
    },
    {
        id : "rv_convocation",
        label : "RV sur convocation"
    },
    {
        id : "rv_update",
        label : "RV de mise à jour"
    },
]
function AddRv({setOpen , onRefresh , currentRecord}) {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);
    const { data : servicesMedicaux , loading : servicesMedicauxLoading } = useFetch(endpoints.services_medicaux.LIST)
    const { data : users, isLoading: usersLoading } = useFetch(
        endpoints.users.LIST
    );
    const [medecins , setMedecins] = useState([]);
    const [medecinsCopy , setMedecinsCopy] = useState([]);
    useEffect(() => {
        const temp = users.filter((item)=> item.role_name === "Medecin")
        setMedecins(temp);
        setMedecinsCopy(temp);
    }, [users])
    
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
            .catch(() => {
                message.success("Une erreur est survenue lors de la création du Rendez-vous");
            });
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
            onValuesChange={(changedValues , values)=>{
                if (changedValues.code_serv) {
                    const temp = medecins.filter((item)=> item.code_serv === changedValues.code_serv);
                    setMedecinsCopy(temp);
                }
            }}
        >
            <Title level={4} > Patient {currentRecord?.num_patient} / {currentRecord?.prenom_patient} {currentRecord?.nom_patient} </Title>
            
            <Row>
                <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="code_serv" 
                        label="Service"
                        rules={[
                            {
                                required: true,
                                message: 'Veuillez sélectionner le service',
                            },
                        ]}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Service"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={servicesMedicauxLoading}
                        >    
                            {
                            servicesMedicaux.map((item , index)=>(
                                <Option key={index}  value={item.code_service} > {item.lib_service} </Option>
                            ))
                            }               
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col  xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="id_medecin" 
                        label="Médécin traitant"
                        rules={[
                            {
                                required: true,
                                message: 'Veuillez sélectionner le service',
                            },
                        ]}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Médécin traitant"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={false}
                        >    
                            {
                                medecinsCopy.map((item , index)=>(
                                    <Option key={index}  value={item.login} > {item.username} </Option>
                                ))
                            }        
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                    <Form.Item 
                        label="Date du rendez-vous"
                        name="date_rv" 
                        rules={[
                            {
                                required: true,
                                message: 'Ce champ est obligatoire',
                            },
                        ]}
                    >
                        <DatePicker placeholder='Sélectionner' showTime  />
                    </Form.Item>
                </Col>
                <Col  xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item 
                        name="type_rv" 
                        label="Type de rendez-vous"
                        rules={[
                            {
                                required: false,
                                message: 'Veuillez sélectionner le type de rendez-vous',
                            },
                        ]}
                        initialValue="rv_defaut"
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Type de rendez-vous médical"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={false}
                        >  
                            {
                                typesRV.map((item)=>(
                                    <Option key={item.id}  value={item.id} > {item.label} </Option>
                                ))
                            }  
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

           
            {/* <Row>
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
            </Row> */}


            <FormFooter 
                loading={formLoading}
                onCancel={()=>{setOpen(false)}}
                htmlType='submit'
            />

        </Form>
    )
}

export default AddRv
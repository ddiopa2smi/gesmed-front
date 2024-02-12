import { Col, Form, Input, Row, Select, DatePicker, message } from 'antd';
import { useState } from 'react';
import { getActions, postActions, putActions } from './../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';
import useFetch from '../../../utils/hooks/useFetch';
import dayjs from "dayjs"

const {TextArea} = Input;
const { Option } = Select;

function AddPatient({ setOpen , operationType , onRefresh , currentRecord}) {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);
    const [typePatient , setTypePatient] = useState(null);
    const [matriculeToSearch , setMatriculeToSearch] = useState(null);
    const [listBeneficiaires, setListBeneficiaires] = useState([]);
    const {data , isLoading } = useFetch(endpoints.patients.LIST_TYPE)
    const listTypePatients = data;
    const listTypePatientsLoading = isLoading;

     
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                        values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
                        postActions(endpoints.patients.ADD,values)
                        .then((response)=>{
                            setFormLoading(false);

                            message.success("Nouveau patient ajouté avec succès");
                            setOpen(false);
                            form.resetFields();
                            onRefresh();
                        })
                        
                    break;
                case "update":
                        values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
                        values.num_patient = currentRecord ? currentRecord.num_patient : null;
                        putActions(endpoints.patients.UPDATE,values)
                        .then((response)=>{
                            setFormLoading(false);
                            message.success("Opération éffectuée avec succès");
                            setOpen(false);
                            form.resetFields();
                            onRefresh();
                        })
                        setOpen(false);
                    break;
                default:
                    break;
            }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

   

    const handleAdvancedSearch = (e) => {
        setMatriculeToSearch(e.target.value);
        const value = e.target.value ;
        if (value) {   
            getActions(`/api/Participant/Patient/${value}`)
            .then((response)=>{
                if (response !== undefined) {
                    getActions(`/api/Benef/list/${response.data.numcont}`)
                    .then((res)=>{
                        
                        const data = res.data ;
                        console.log(data);
                        setListBeneficiaires(data);
                    })
                }
            })
        }
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={save}
            preserve={false}
        >
            <Row gutter={[24,24]} >
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="type_patient" 
                        label="Type de patient"
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.type_patient}
                    >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Type de patient"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                onChange={(value)=>{setTypePatient(value);}}
                                loading={listTypePatientsLoading}
                            >     
                                {
                                    listTypePatients.map((item , key)=>(
                                        <Option key={key}  value={item.code_pat} > {item.type_pat} </Option>
                                    ))
                                }
                                
                            </Select>
                    </Form.Item>
                </Col>
                {
                    // Must fixed the search of patients when enter the matricule later 
                    typePatient === 1 && 
                    <>
                        <Col xs={24} sm={12} md={4} lg={4} xl={4} >
                            <Form.Item
                                name="matricule"
                                label="Matricule"
                                //initialValue={(currentRecord && currentRecord.num_patient)||null}
                            >
                                <Input  value={matriculeToSearch} onChange={(e)=> handleAdvancedSearch(e) } />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                            <Form.Item 
                                name="benef" 
                                label="Patient"
                                rules={[
                                    {
                                    required: true,
                                    message: 'Sélection obligatoire',   
                                    },
                                ]}
                                initialValue={currentRecord?.benef}
                            >
                                    <Select
                                        style={{width:'100%',background:"transparent"}}
                                        showSearch
                                        placeholder="Patient"
                                        optionFilterProp="children" 
                                        filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    >     
                                        {
                                            listBeneficiaires.map((item , key)=>{
                                                <Option key={key}  value={item.codebenef} > {item.matribenef} - {item.prenoms} </Option>
                                            })
                                        }
                                                    
                                    </Select>
                            </Form.Item>
                        </Col>
                    </>
                }
                
            </Row>
            
            <Row gutter={[24,24]} >
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="sexe_patient" 
                        label="Sexe"
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.sexe_patient}
                    >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Sexe"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >     
                                        <Option  value={'MA'} > Masculin </Option>
                                        <Option  value={'FE'} > Féminin </Option>
                                
                            </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="group_sanguin" 
                        label="Groupe sanguin"
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.group_sanguin}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Groupe Sanguin"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >     
                                <Option value={'A'} > A </Option>                  
                                <Option value={'A+'} > A+ </Option>                  
                                <Option value={'A-'} > A- </Option>                  
                                <Option value={'B'} > B </Option>                  
                                <Option value={'B+'} > B+ </Option>                  
                                <Option value={'B-'} > B- </Option>                  
                                <Option value={'AB'} > AB </Option>                  
                                <Option value={'AB+'} > AB+ </Option>                  
                                <Option value={'AB-'} > AB- </Option>                  
                                <Option value={'O'} > O </Option>                  
                                <Option value={'O+'} > O+ </Option>                  
                                <Option value={'O-'} > O- </Option>                  
                        </Select>
                    </Form.Item>
                </Col>
                
            </Row>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="prenom_patient"
                        label="Prénom(s)"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.prenom_patient}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="nom_patient"
                        label="Nom"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.nom_patient}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>  
                    <Form.Item
                        name="datenaiss_patient"
                        label="Date de naissance"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord === null ? dayjs(new Date()) : dayjs(new Date(currentRecord?.datenaiss_patient))}
                    >
                        <DatePicker placeholder='choisir la date' format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="tel_patient"
                        label="Téléphone"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.tel_patient}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="email_patient"
                        label="Email"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                            {
                                type: "email",
                                message: 'Entrer un email svp',
                            },
                        ]}
                        initialValue={currentRecord?.email_patient}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="contact"
                        label="Contact"
                        rules={[
                            {
                            required: true,
                            message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.contact}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="obs_part"
                        label="Observation"
                        initialValue={currentRecord?.obs_part}
                    >
                        <TextArea rows={4} placeholder='Observation' />
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

export default AddPatient
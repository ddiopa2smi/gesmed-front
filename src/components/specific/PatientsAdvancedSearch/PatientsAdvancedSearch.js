import { Form , Row , Col , Input , Select , DatePicker } from "antd";
import FormFooter from "../../common/FormFooter/FormFooter";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
const {Option } = Select;
const { RangePicker } = DatePicker;

function PatientsAdvancedSearch({dataSource,dataSourceCopy,setDataSourceCopy, setOpen}) {
    const [form] = Form.useForm();
    const {data : listTypePatients , isLoading : listTypePatientsLoading } = useFetch(endpoints.patients.LIST_TYPE)

    return (
        <Form
            form={form}
            layout="vertical"
            name="search_form"
            onFinish={(values)=>{
                const result = dataSource.filter((item) => {
                    let defaultStatus = true;
                    for (const key in values) {
                        if (values[key]) {
                            if (key === "date_creation") {
                                const itemCreatedDate = new Date(item[key]).getTime();
                                const startDate = new Date(values[key][0]).getTime();
                                const endDate = new Date(values[key][1]).getTime();
                                if (itemCreatedDate>= startDate && itemCreatedDate <= endDate) {
                                    defaultStatus = defaultStatus && true;
                                }else{
                                    defaultStatus = defaultStatus && false;
                                }
                            }else if (key === "date_rv") {
                                const itemRvDate = new Date(item[key]).getTime();
                                const startDate = new Date(values[key][0]).getTime();
                                const endDate = new Date(values[key][1]).getTime();
                                if (itemRvDate>= startDate && itemRvDate <= endDate) {
                                    defaultStatus = defaultStatus && true;
                                }else{
                                    defaultStatus = defaultStatus && false;
                                }
                            }else if (key === "age_patient" && values[key].includes("-") ) {
                                const splitValue = values[key].split("-");
                                if (item[key] >= parseInt(splitValue[0],10) && item[key] < parseInt(splitValue[1],10)  ) {
                                    defaultStatus = defaultStatus && true;
                                }else{
                                    defaultStatus = defaultStatus && false;
                                }
                            }
                            else {
                                if (item[key].toString().trim().toLowerCase().includes(values[key].toString().trim().toLowerCase())) {
                                    defaultStatus = defaultStatus && true;
                                }else {
                                    defaultStatus = defaultStatus && false;
                                }
                            }
                            
                        }
                    }
                    
                    return defaultStatus;
                })
                setDataSourceCopy(result);
                setOpen(false);
                
            }}
        >
            <Row gutter={[24,24]} >
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="num_patient"
                        label="Numéro patient" 
                    >
                        <Input placeholder="Entrer un numéro"/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="nom_patient"
                        label="Nom" 
                    >
                        <Input placeholder="Entrer un nom" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="prenom_patient"
                        label="Prénom"
                    >
                        <Input placeholder="Entrer un prénom"/>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[24,24]} >
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item 
                        name="sexe_patient" 
                        label="Sexe du patient"
                    >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Choisir"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                
                            >     
                                <Option key={1}  value={"MA"} > MA </Option>
                                <Option key={2}  value={"FE"} > FE </Option>
                                
                            </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="age_patient"
                        label="Age(min-max)"
                    >
                        <Input placeholder="Ex: 30; 40-50" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="type_patient"
                        label="Type de patient"
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Choisir"
                            optionFilterProp="children" 
                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            loading={listTypePatientsLoading}
                        >     
                            {
                                listTypePatients
                                .filter((item)=> item?.code_patient !== 2 && item?.code_patient !== 3)
                                .map((item , key)=>( 
                                    <Option key={key}  value={item.code_patient} > {item.type_patient} </Option>
                                ))
                            }
                            
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[24,24]} >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                        name="date_rv"
                        label="Date de rendez-vous"
                    >
                        <RangePicker style={{width:'100%'}} format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                        name="date_creation"
                        label="Date de création"
                    >
                        <RangePicker style={{width:'100%'}} format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
            </Row>
            <FormFooter 
                onCancel={()=>{
                    form.resetFields();
                    setOpen(false);
                    setDataSourceCopy(dataSource);
                }}
                htmlType='submit'
                cancelLabel={"Réinitialiser"}
                validLabel={"Valider"}
            />
        </Form>
    )
}

export default PatientsAdvancedSearch
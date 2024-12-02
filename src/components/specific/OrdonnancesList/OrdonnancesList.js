import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Modal, Row, Segmented, Select, Space, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import DataTable from '../../common/DataTable/DataTable';
import useFetch from '../../../utils/hooks/useFetch';
import useSearch from '../../../utils/hooks/useSearch';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import AdvancedSearchButton from '../../common/AdvancedSearchButton/AdvancedSearchButton';
import FormFooter from '../../common/FormFooter/FormFooter';

const {Option} = Select;
const {Title} = Typography;
function OrdonnancesList() {
    const [segmentedValue , setSegmentedValue] = useState("instance");
    const {data , dataCopy, setDataCopy , isLoading , error , onRefresh} = useFetch();
    const {getColumnSearchProps} = useSearch()
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);

    const onDisplayAdvancedSearch = () => {
        setOperationType("ads");
        setOpen(true);
    }
    
    return (
        <Card >
            <Flex justify="space-between" align="center" >
                <Title level={4} > Liste des ordonnances </Title>
                <Space>
                    {/* <Tooltip title="Recherche avancée" >
                        <Button type='text' shape="circle" icon={<SearchOutlined/>} onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp;
                    </Tooltip>  */}
                    <AdvancedSearchButton onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp;
                    <ReloadButton onRefresh={onRefresh} /> &nbsp;&nbsp;
                    <Segmented 
                        defaultValue={segmentedValue}
                        options={[
                            {
                                value : "instance",
                                label : "En instance"
                            },
                            {
                                value : "servis",
                                label : "Servies"
                            }
                        ]}
                        
                        onChange={(value)=>{
                            setSegmentedValue(value)
                        }}
                    
                    />
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={data}
                dataSourceCopy = {segmentedValue === "instance" ? dataCopy.filter((element)=> element.effectue === false) : dataCopy.filter((element)=> element.effectue === true)}
                setDataSourceCopy={setDataCopy}
                columns={[
                    {
                        title: 'N°',
                        dataIndex: 'num_ordre',
                        key: 'num_ordre',
                        ...getColumnSearchProps('num_ordre')
                    },
                    {
                        title: 'N° medoc',
                        dataIndex: 'medoc',
                        key: 'medoc',
                        ...getColumnSearchProps('medoc')
                    },
                    {
                        title: 'Medicament',
                        dataIndex: 'medoc',
                        key: 'medoc',
                        ...getColumnSearchProps('medoc')
                    },
                    // {
                    //     title: 'Prénom',
                    //     dataIndex: 'prenom_patient',
                    //     key: 'prenom_patient',
                    //     ...getColumnSearchProps('prenom_patient')
                    // },
                    // {
                    //     title: 'Age',
                    //     dataIndex: 'age_patient',
                    //     key: 'age_patient',
                    //     ...getColumnSearchProps('age_patient')
                    // },
                    // {
                    //     title: 'Sexe',
                    //     dataIndex: 'sexe_patient',
                    //     key: 'sexe_patient',
                    //     ...getColumnSearchProps('sexe_patient')
                    // },
                    // {
                    //     title: 'Examens',
                    //     dataIndex: 'effectue',
                    //     key: 'effectue',
                    //     render: (record) => <div className='table-data'> 
                    //         {
                    //             !record ?
                    //             <Tag style={{color:"black"}} color="#fbc531"> En Attente </Tag>
                    //             :
                    //             <Tag color="#44bd32"> Effectué </Tag>
                    //         }                 
                    //     </div>
                    // },
                    // {
                    //     render :  (record)=>(
                    //         <Flex align='center' >
                    //             <Space size="middle" >
                    //                 {
                    //                 examActionLoading === true ? <Spin /> :
                    //                 <Tooltip title="Examiner">
                    //                     <RiStethoscopeLine cursor="pointer" size={18} onClick={()=>{handleExamenClinique(record)}} />
                    //                 </Tooltip>
                    //                 }
                                    
                    //                 <Tooltip title="Ouvrir dossier">
                    //                 <AiOutlineFolder cursor="pointer" size={18} onClick={()=>{openMedicalFile(record)}} />
                    //                 </Tooltip>
                    //             </Space>
                    //         </Flex>
                    //     )
                    // }
                ]}
            />

            <Modal 
                // styles={{
                //     header : {
                //         background : "red"
                //     }
                // }}
                title={  
                    (operationType === "ads" && "Recherche avancée") || 
                    (operationType === "exp" && "Exporter le document")  
                } 
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose={operationType=== "ads"? false : true}
            >
                {/* Gérer la recherche avancée ici */}
                <Select
                    style={{width:'100%',background:"transparent"}}
                    showSearch
                    placeholder="Période"
                    optionFilterProp="children" 
                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                    //onChange={(value)=>{setTypePatient(value);}}
                    //loading={null}
                >     
                    <Option key={"1"}  value={"today"} > Aujourd'hui </Option>
                    <Option key={"2"}  value={"week"} > Dans la semaine </Option>
                    <Option key={"3"}  value={"trimestre"} > Dans 3 mois </Option>
                    <Option key={"4"}  value={"semestre"} > Dans 6 mois </Option>
                    <Option key={"5"}  value={"annual"} > Cette année </Option>
                </Select>
                <br/>
                <br/>
                <FormFooter />
                {/* {
                    (operationType === "ads") && 
                    <PatientsAdvancedSearch 
                        dataSource={patientsList}
                        dataSourceCopy={dataCopy}
                        setDataSourceCopy={setDataCopy}
                        setOpen={setOpen}
                    />
                }

                {
                    (operationType === "exp") && 
                    <ExportFile 
                        title="Liste des patients"
                        data={dataCopy}
                        setOpen={setOpen}
                    />
                } */}
                
            </Modal>
        </Card>
    )
}

export default OrdonnancesList
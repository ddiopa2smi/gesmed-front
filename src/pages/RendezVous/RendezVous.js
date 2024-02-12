import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Modal, Segmented, Space, Spin, Tag, Tooltip, Typography, message } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import {RiStethoscopeLine} from "react-icons/ri"
import {AiOutlineFolder} from "react-icons/ai"
import Examen from '../../components/specific/Examen/Examen';
import { getActions } from '../../actions/actions';


const {Title} = Typography;
    
function RendezVous() {
    const navigate = useNavigate();
    const {data , dataCopy, setDataCopy , isLoading , error , onRefresh} = useFetch(endpoints.rendezVous.TODAY_LIST);
    const [open , setOpen] = useState(false);
    const [currentRecord , setCurrentRecord] = useState(null);
    const [defaultExamPayload , setDefaultExamPayload] = useState(null);
    const [examActionLoading , setExamActionLoading] = useState(false);

    const handleExamenClinique = (record) => {
        setExamActionLoading(true);
        getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${record.num_ordre}`)
        .then((response)=>{
            // const resp = response.data;
            // console.log(resp);
            // sessionStorage.setItem("currentObject", JSON.stringify(record)); 
            // sessionStorage.setItem("initExamPayload", JSON.stringify(resp)); 
            setCurrentRecord(record);
            setDefaultExamPayload(response.data);
            setExamActionLoading(false);
            setOpen(true);
        })
        .catch((error)=>{
            setExamActionLoading(false);
            console.log(error);
            message.error("Une erreur est survenue, veuillez réessayer!")
        })
    }  

    const openMedicalFile = (record) => {
        navigate("/myspace/patients/dossier")
        sessionStorage.setItem("currentPatient",JSON.stringify(record));
    }

    return (
        <Card loading={isLoading} >

            <Title level={3} >Liste des patients du jour</Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Segmented 
                    defaultValue={null}
                    options={[
                        {
                        value : false,
                        label : "En attente"
                        },
                        {
                        value : true,
                        label : "Traités"
                        }
                    ]}
                    
                    onChange={(value)=>{
                        //const filterData = data.filter((element)=> element.etat === value);
                        const filterData = data.filter((element)=> element.effectue === value);
                        setDataCopy(filterData)
                        console.log(data)
                    }}
                    
                    />
                    <Tooltip title="Actualiser" >
                        <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={onRefresh} />
                    </Tooltip> 
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={data}
                dataSourceCopy={dataCopy}
                setDataSourceCopy={setDataCopy}
                columns={[
                    {
                    title: 'N°',
                    dataIndex: 'num_ordre',
                    key: 'num_ordre'
                    },
                    {
                        title: 'N° patient',
                        dataIndex: 'num_patient',
                        key: 'num_patient'
                    },
                    {
                        title: 'Nom',
                        dataIndex: 'nom_patient',
                        key: 'nom_patient'
                    },
                    {
                        title: 'Prénom',
                        dataIndex: 'prenom_patient',
                        key: 'prenom_patient'
                    },
                    {
                        title: 'Age',
                        dataIndex: 'age_patient',
                        key: 'age_patient'
                    },
                    {
                        title: 'Sexe',
                        dataIndex: 'sexe_patient',
                        key: 'sexe_patient'
                    },
                    {
                        title: 'Examens',
                        dataIndex: 'effectue',
                        key: 'effectue',
                        render: (record) => <div className='table-data'> 
                            {
                                !record ?
                                <Tag style={{color:"black"}} color="#fbc531"> En Attente </Tag>
                                :
                                <Tag color="#44bd32"> Effectué </Tag>
                            }                 
                        </div>
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Space size="middle" >
                                    {
                                    examActionLoading === true ? <Spin /> :
                                    <Tooltip title="Examiner">
                                        <RiStethoscopeLine cursor="pointer" size={18} onClick={()=>{handleExamenClinique(record)}} />
                                    </Tooltip>
                                    }
                                    
                                    <Tooltip title="Ouvrir dossier">
                                    <AiOutlineFolder cursor="pointer" size={18} onClick={()=>{openMedicalFile(record)}} />
                                    </Tooltip>
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />

            <Modal 
                title="Examen clinique"
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                <Examen 
                setOpen={setOpen}
                currentRecord={currentRecord}
                onRefresh={onRefresh}
                defaultExamPayload={defaultExamPayload}
                />
                
            </Modal>

        </Card>
    )
}

export default RendezVous
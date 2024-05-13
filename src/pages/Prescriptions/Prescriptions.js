import React from 'react';
import { Breadcrumb, Button, Card,Flex,Space,Table,Tooltip,Typography, message} from "antd";
import { useLocation, useNavigate } from 'react-router';
import { DeleteOutlined, EditOutlined, HomeOutlined,PrinterOutlined } from '@ant-design/icons';
import { endpoints } from '../../constants/endpoints.constants';
import { deleteActions} from '../../actions/actions';
import { codesPrescriptions } from '../../constants/app.constants';
import { Link } from 'react-router-dom';
import DataTable from '../../components/common/DataTable/DataTable';
import { deletePopup, formatDate, printPDF } from '../../utils/helpers';
import useObjectFetch from '../../utils/hooks/useObjectFetch';
import BackButton from '../../components/common/BackButton/BackButton';

const {Title} = Typography;

function Prescriptions() {
    const navigate = useNavigate();

    const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));
    const currentPatient  = JSON.parse(sessionStorage.getItem("currentPatient"));
    const prescription  = JSON.parse(sessionStorage.getItem("prescription"));
    const {data , dataCopy , isLoading, onRefresh , setDataCopy} = useObjectFetch(`${endpoints.dossierMedical.DOSSIER}?numpat=${currentPatient.num_patient}`)

    const getTitleByType = (code) => {
        switch (code) {
            case codesPrescriptions.ORD:
                return {type1 : "ordonnance", type2 : "ordonnances"} ;
            case codesPrescriptions.ANA:
                return {type1 : "analyse", type2 : "analyses"};
            case codesPrescriptions.IMG:
                return {type1 : "imagerie", type2 : "imageries"};
            default:
                return "";
        }
    }

    const ordonnancesColumns = [
        {
            title: 'N°',
            dataIndex: 'numpresc',
            key: 'numpresc'
        },
        {
            title: 'Date de prescription',
            dataIndex: 'datepresc',
            key: 'datepresc',
            render: (record) => <div className='table-data'>
                {formatDate(record)}
            </div>
        },
        {
            title: 'Prescripteur',
            dataIndex: 'prescripteur',
            key: 'prescripteur'
        },
        {
            title: 'Qte.',
            dataIndex: 'qte_presc',
            key: 'qte_presc',
            sorter: (a, b) => a.qte_presc - b.qte_presc
        } ,
        //Table.EXPAND_COLUMN ,
        {
            width : 'auto' ,
            render :  (record)=>(
                <Space>
                    <Tooltip title="Imprimer" >
                        <Button type='link' icon={<PrinterOutlined/>} onClick={()=>{ printPDF(`/api/Print/smed/Prescription/${record.numpresc}/ordonnance`) }} />
                    </Tooltip>
                    {
                        record.prescripteur === userConnected.login &&
                        <Tooltip title="Editer" >
                            <Button type='link' icon={<EditOutlined/>} onClick={()=>{ onEdit(record , "ordonnance") }} />
                        </Tooltip>
                    }
                    {
                        record.prescripteur === userConnected.login &&
                        <Tooltip title="Supprimer" >
                            <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                        </Tooltip>
                    }
                </Space>
            )
        }
    ];

    const analysesColumns = [
        {
            title: 'N°',
            dataIndex: 'numpresc',
            key: 'numpresc'
        },
        {
            title: 'Date',
            dataIndex: 'datepresc',
            key: 'datepresc',
            render: (record) => <div className='table-data'>
                {formatDate(record)}
            </div>
        },
        {
            title: 'Prescripteur',
            dataIndex: 'prescripteur',
            key: 'prescripteur'
        },
        {
            title: 'Qte.',
            dataIndex: 'qte_presc',
            key: 'qte_presc',
            sorter: (a, b) => a.qte_presc - b.qte_presc
        } ,
        //Table.EXPAND_COLUMN ,
        {
            width : 'auto',
            render :  (record)=>(
                <Space>
                    <Tooltip title="Imprimer" >
                        <Button type='link' icon={<PrinterOutlined/>} onClick={()=>{ printPDF(`/api/Print/smed/Prescription/${record.numpresc}/analyse`) }} />
                    </Tooltip>
                    {
                        record.prescripteur === userConnected.login &&
                        <Tooltip title="Editer" >
                            <Button type='link' icon={<EditOutlined/>} onClick={()=>{ onEdit(record , "analyse") }} />
                        </Tooltip>
                    }
                    {
                        record.prescripteur === userConnected.login &&
                        <Tooltip title="Supprimer" >
                            <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                        </Tooltip>
                    }
                </Space>
            )
        }
    ];

    const imageriesColumns = [
        {
            title: 'N°',
            dataIndex: 'numpresc',
            key: 'numpresc'
        },
        {
            title: 'Date',
            dataIndex: 'datepresc',
            key: 'datepresc',
            render: (record) => <div className='table-data'>
                {formatDate(record)}
            </div>
        },
        {
            title: 'Prescripteur',
            dataIndex: 'prescripteur',
            key: 'prescripteur'
        },
        {
            title: 'Qte.',
            dataIndex: 'qte_presc',
            key: 'qte_presc',
            sorter: (a, b) => a.qte_presc - b.qte_presc
        } ,
        //Table.EXPAND_COLUMN ,
        {
            width : 'auto' ,
            render :  (record)=>(
                <Space>
                    <Tooltip title="Imprimer" >
                        <Button type='link' icon={<PrinterOutlined/>} onClick={()=>{ printPDF(`/api/Print/smed/Prescription/${record.numpresc}/imagerie`) }} />
                    </Tooltip>
                    {
                        record.prescripteur === userConnected.login &&
                        <Tooltip title="Editer" >
                            <Button type='link' icon={<EditOutlined/>} onClick={()=>{ onEdit(record , "imagerie") }} />
                        </Tooltip>
                    }
                    {
                        record.prescripteur === userConnected.login &&
                        <Tooltip title="Supprimer" >
                            <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                        </Tooltip>
                    }
                </Space>
            )
        }
    ];

    const getColumnsByCodePresc = (code) => {
        switch (code) {
            case codesPrescriptions.ORD:
                return ordonnancesColumns;
            case codesPrescriptions.ANA:
                return analysesColumns;
            case codesPrescriptions.IMG:
                return imageriesColumns;
            default:
                return [];
        }
    }

    const onAdd = ()=> { 
        navigate(`/myspace/patients/dossier/prescriptions/${getTitleByType(prescription.codepresc).type1}`);
        sessionStorage.removeItem("editPrescription");
    }

    const onEdit = (record , prescriptionType) => {
        navigate(`/myspace/patients/dossier/prescriptions/${prescriptionType}`);
        sessionStorage.setItem("editPrescription", JSON.stringify(record));
        //console.log(record)
    }

    const onDelete = (record) => {
        deletePopup()
        .then((result)=>{
            if (result.isConfirmed) {
                deleteActions(`${endpoints.prescriptions.DELETE}/${record?.numpresc}`)
                .then((response)=>{
                    if (response.data.Deleted === true) {
                        message.success("Ligne retirée avec succès");
                        onRefresh()
                    }
                })
            }
        })
    }


    return (
        dataCopy &&
        <Card loading={isLoading} >
            <Flex align='flex-start' justify='space-between' >
                <BackButton />
            </Flex>
            <br/>
            <Flex align='center' justify='space-between' >
                <Title level={4} >Liste des {getTitleByType(prescription.codepresc).type2} de la consultation N° {prescription.numcons} </Title>            

                <Space>
                    {/* <Button type='ghost' className='button-close' onClick={()=>{navigate(-1);}}  >Retour</Button>  */}

                    {
                        prescription.medecin === userConnected.username && <Button type='primary' onClick={onAdd}  > Nouvelle {getTitleByType(prescription.codepresc).type1}  </Button> 
                        
                    } 
                </Space>
                
            </Flex>

            <br/>

            <DataTable 
                dataSourceCopy={dataCopy?.listPrescription?.filter(element => {
                    return element.codepresc === prescription.codepresc && element.numcons === prescription.numcons
                    //return element.codepresc === prescription.codepresc && element.numpresc === prescription.numpresc
                }) || []}
                tableLoading={isLoading}
                columns={getColumnsByCodePresc(prescription.codepresc)}
                rowKey={(record)=>record.codepresc}
            />

        </Card>
    )
}
export default Prescriptions
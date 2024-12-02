import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Modal, Segmented, Space, Spin, Tag, Tooltip, Typography, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import {RiStethoscopeLine} from "react-icons/ri"
import {AiOutlineFolder} from "react-icons/ai"
import Examen from '../../components/specific/Examen/Examen';
import { getActions } from '../../actions/actions';
import useSearch from '../../utils/hooks/useSearch';
import ReloadButton from '../../components/common/ReloadButton/ReloadButton';
import RvList from '../../components/specific/RvList/RvList';
import { ServiceType } from '../../utils/types/types.ts';


const {Title} = Typography;
    
function RendezVous() {
    const navigate = useNavigate();
    const {data , dataCopy, setDataCopy , isLoading , error , onRefresh} = useFetch(endpoints.rendezVous.TODAY_LIST);
    const {getColumnSearchProps} = useSearch()
    const [open , setOpen] = useState(false);
    const [currentRecord , setCurrentRecord] = useState(null);
    const [defaultExamPayload , setDefaultExamPayload] = useState(null);
    const [examActionLoading , setExamActionLoading] = useState(false);

    const [segmentedValue , setSegmentedValue] = useState("attente");

    const handleExamenClinique = (record) => {
        setOpen(true);
        setExamActionLoading(true);
        getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${record.num_ordre}`)
        .then((response)=>{
            // const resp = response.data;
            // console.log(resp);
            // sessionStorage.setItem("currentObject", JSON.stringify(record)); 
            // sessionStorage.setItem("initExamPayload", JSON.stringify(resp)); 
            setCurrentRecord(record);
            setDefaultExamPayload(response.data);
            //setExamActionLoading(false);
            // setOpen(true);
        })
        .catch((error)=>{
            //setExamActionLoading(false);
            console.log(error);
            message.error("Une erreur est survenue, veuillez réessayer!")
        })
        .finally(()=>{
            setExamActionLoading(false)
        })
    }  

    const openMedicalFile = (record) => {
        navigate("/espace-medical/patients/dossier")
        sessionStorage.setItem("currentPatient",JSON.stringify(record));
    }

    useEffect(() => {
      
    }, [segmentedValue])


    return (
        <Card>
            <RvList serviceType={ServiceType.MEDICAL} />
        </Card>
    )
}

export default RendezVous
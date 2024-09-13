import { Calendar, Card, Typography , Badge, Modal } from 'antd'
import React, { useState } from 'react'
import dayjs from 'dayjs';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
const {Title} = Typography

function Appointments() {
  const {data , dataCopy, setDataCopy , isLoading , error , onRefresh} = useFetch(endpoints.rendezVous.TODAY_LIST);
  const [open , setOpen] = useState(false);
  return (
    <Card>
        <Title level={3} >Rendez-vous</Title>
        <Calendar 
          cellRender={(current, info) => {
            if (info.type === 'date') {
              let date = new Date(current).getDate()
              let month = new Date(current).getMonth()
              let year = new Date(current).getFullYear()

              let todayDate = new Date().getDate() 
              let todayMonth = new Date().getMonth()
              let todayYear = new Date().getFullYear()


              if ((date === todayDate) && (month === todayMonth) && (year === todayYear)) {
                return <ul>
                {
                  dataCopy.map((item)=>(
                    <li key={item?.num_ordre} >
                      {
                        item?.num_ordre
                      }
                      {
                        item?.nom_patient
                      }
                    </li>
                  ))
                }
              </ul>;
              }
              
            }
            if (info.type === 'month'){
              
            }
            //return info.originNode;
          }} 
          onSelect={(date,info)=>{
            setOpen(true)
          }}
          fullscreen 
        />

        <Modal 
          title={"Liste des RV"} 
          open={open} 
          onCancel={()=>{
              setOpen(false);
          }}
          footer={null}
          destroyOnClose
        >
            
            
        </Modal>
    </Card>
  )
}

export default Appointments
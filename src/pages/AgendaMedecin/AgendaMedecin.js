import { Calendar, Card, Typography , Badge, Modal, Avatar, Tooltip } from 'antd'
import React, { useState } from 'react'
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import dayjs from 'dayjs';
import { AntDesignOutlined, UserOutlined } from '@ant-design/icons';
import DayAppointment from '../../components/specific/DayAppointment/DayAppointment.tsx';

const {Title} = Typography

function AgendaMedecin() {
  const {data , dataCopy, setDataCopy , isLoading , error , onRefresh} = useFetch(endpoints.rendezVous.TODAY_LIST);
  const [open , setOpen] = useState(false);
  return (
    <Card>
        <Title level={3} >Mon agenda</Title>
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
                return <div>
                  <Avatar.Group>
                      {
                        dataCopy.map((item)=>(
                          <Tooltip key={item.num_ordre} title={`${item.prenom_patient} ${item.nom_patient}`} placement="top">
                            <Avatar style={{ backgroundColor: '#87d068' }}  >
                              {`${item.prenom_patient[0].toUpperCase()}${item.nom_patient[0].toUpperCase()}`}
                            </Avatar>
                          </Tooltip>
                        ))
                      }
                  </Avatar.Group>
                    
                  {/* <ul>
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
                  </ul> */}
                </div>
              }
              
            } ;
            if (info.type === 'month'){
              
            };
            //return info.originNode;
          }} 
          onSelect={(date,info)=>{
            setOpen(true)
          }}
          fullscreen 
        />

        <Modal 
          title={"Liste des RV"} 
          width={1000}
          open={open} 
          onCancel={()=>{
              setOpen(false);
          }}
          footer={null}
          destroyOnClose
        >
            
            <DayAppointment
              total={dataCopy.length} 
              dentists={[]}
              data={dataCopy}
            />
        </Modal>
    </Card>
  )
}

export default AgendaMedecin
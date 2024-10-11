import React from 'react'
import "./DayAppointment.scss"
import { CalendarOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { Avatar, Button, DatePicker, Divider, Flex, List, Select, Skeleton, Space, Tag, Typography } from 'antd';
import dayjs from "dayjs";

export interface DayAppointmentInterface {
    date ?: Date;
    total ?: number;
    dentists ?: DentistInterface[];
    data?: any[]
}

export interface DentistInterface {
    fullname ?: string;
    profilImage ?:string;
    totalAppointments ?: number;
    appointMentsItems ?: AppointmentInterface[];
}

export interface AppointmentInterface {
    status ?: "registered" | "finished",
    date ?: Date;
    patientFullname ?: string;
    duration ?: number;
   
}

const {Text} = Typography;
function DayAppointment( props : DayAppointmentInterface) {
    return (
        <div>
            <Flex align='center' justify='space-between' >
                <Space>
                    <CalendarOutlined />
                    <Text> {props?.total ? props?.total : 0} rendez-vous </Text>
                </Space>
                <Space>
                    <DatePicker variant="borderless" placeholder='choisir la date' value={dayjs(new Date())} format="dddd, DD MMMM YYYY" />
                    <Divider type='vertical' />
                </Space>
                <Space> 
                    <Button type='default' size='small' icon={<FilterOutlined/>} >Filtres</Button>
                </Space>
            </Flex>
           
            <Divider />

            <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={props.data}
                renderItem={(item) => (
                    <List.Item
                    actions={[<a key="list-loadmore-edit">Examiner</a>, <a key="list-loadmore-more">Dossier médical</a>]}
                    >
                    <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                            avatar={<Avatar> {`${item?.prenom_patient[0].toUpperCase()}${item?.nom_patient[0].toUpperCase()}`} </Avatar>}
                            title={<Text>{`${item?.prenom_patient} ${item?.nom_patient}`}</Text>}
                            description="Rendez à 10h avec le médécin Dr FALL"
                        />
                        <div><Tag color='cyan' >En attente</Tag></div>
                    </Skeleton>
                    </List.Item>
                )}
            /> 

            {/* <div className='sch-table-container' >
                <table className='sch-table' >
                    <thead>
                        <tr className='sch-tr'>
                            <td className='sch-td' > GMT +07:00  </td>
                            {
                                props.dentists?.map((item , index: number)=>(
                                    <td className='sch-td' key={index}>
                                        <Flex justify='space-between' align='start' >
                                            <div>
                                                <Space>
                                                    <Avatar src={item.profilImage} />
                                                    <Text> {item.fullname} </Text>
                                                </Space>
                                                <p>
                                                <Text> RV du jour : {item.totalAppointments} </Text>
                                                </p>
                                            </div>
                                            <Button type='text' size='small' icon={<EllipsisOutlined />} />
                                        </Flex>
                                        
                                    </td>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='sch-tr'>
                            <td className='sch-td' > 9h  </td>
                        </tr>
                        <tr className='sch-tr'>
                            <td className='sch-td' > 10h  </td>
                        </tr>
                    </tbody>
                    
                    
                </table>
            </div> */}
        </div>
    )
}

export default DayAppointment
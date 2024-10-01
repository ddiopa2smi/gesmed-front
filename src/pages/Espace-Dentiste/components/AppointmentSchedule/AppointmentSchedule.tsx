import React from 'react'
import "./AppointmentSchedule.scss"
import { CalendarOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { Avatar, Button, DatePicker, Divider, Flex, Select, Space, Typography } from 'antd';
import dayjs from "dayjs";

export interface AppointmentScheduleInterface {
    date ?: Date;
    total ?: number;
    dentists ?: DentistInterface[];
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
const {Option} = Select;
function AppointmentSchedule( props : AppointmentScheduleInterface) {
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
                    <Select
                        style={{width:150,background:"transparent"}}
                        size='small'
                        showSearch
                        value={'all'}
                        filterOption={(input, option : any) => option.children.toLowerCase().includes(input.toLowerCase())}
                    >     
                        <Option key={1}  value={"all"} > Tous les dentistes </Option>
                        <Option key={2}  value={"sabrina"} > Sabrina </Option>
                    </Select>
                    <Button type='default' size='small' icon={<FilterOutlined/>} >Filtres</Button>
                </Space>
            </Flex>
           
            <Divider />

            <div className='sch-table-container' >
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
            </div>
        </div>
    )
}

export default AppointmentSchedule
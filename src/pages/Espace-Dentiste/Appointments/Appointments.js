import { Calendar, Card, Drawer, Typography, Timeline } from 'antd'
import React, { useState } from 'react'
import AppointmentSchedule from '../components/AppointmentSchedule/AppointmentSchedule.tsx';

const {Text} = Typography
function Appointments() {
    const [open, setOpen] = useState(false);
    const [selectInfo , setSelectInfo] = useState(null);
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };


    const users = [
        {
            profilImage : "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            fullname : "Mohamed Ndiaye",
            totalAppointments : 4
        },
        {
            profilImage : "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            fullname : "Amina Diouf",
            totalAppointments : 1
        },
        {
            profilImage : "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            fullname : "Salamata Fall",
            totalAppointments : 2
        },
        
    ]

    const dentists = [
        {
            fullname: "Dr. Alice Dupont",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 3,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T09:00:00'),
                    
                    patientFullname: "Jean Martin",
                    duration: 30
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T11:00:00'),
                    patientFullname: "Marie Dubois",
                    duration: 45
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T15:30:00'),
                    patientFullname: "Pierre Moreau",
                    duration: 60
                }
            ]
        },
        {
            fullname: "Dr. Marc Bernard",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 2,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T10:00:00'),
                    patientFullname: "Lucie Leblanc",
                    duration: 30
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T14:00:00'),
                    patientFullname: "Eric Dupuis",
                    duration: 50
                }
            ]
        },
        {
            fullname: "Dr. Clara Lemoine",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 4,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T11:00:00'),
                    patientFullname: "Paul Lefevre",
                    duration: 20
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T16:00:00'),
                    patientFullname: "Sarah Perrot",
                    duration: 30
                },
                {
                    status: "registered",
                    date: new Date('2024-09-06T12:00:00'),
                    patientFullname: "Luc Besson",
                    duration: 40
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T17:00:00'),
                    patientFullname: "Sophie Richard",
                    duration: 50
                }
            ]
        },
        {
            fullname: "Dr. Olivier Dubois",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 1,
            appointMentsItems: [
                {
                    status: "finished",
                    date: new Date('2024-09-05T13:00:00'),
                    patientFullname: "Micheline Martin",
                    duration: 60
                }
            ]
        },
        {
            fullname: "Dr. Jean-Luc Blanc",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 3,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T14:00:00'),
                    patientFullname: "Patrick Lefebvre",
                    duration: 45
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T11:30:00'),
                    patientFullname: "Claire Marchal",
                    duration: 30
                },
                {
                    status: "registered",
                    date: new Date('2024-09-06T15:30:00'),
                    patientFullname: "Jacques Lambert",
                    duration: 35
                }
            ]
        },
        {
            fullname: "Dr. Sophie Lambert",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 2,
            appointMentsItems: [
                {
                    status: "finished",
                    date: new Date('2024-09-05T14:30:00'),
                    patientFullname: "Antoine Renard",
                    duration: 40
                },
                {
                    status: "registered",
                    date: new Date('2024-09-06T16:00:00'),
                    patientFullname: "Julie Petit",
                    duration: 25
                }
            ]
        },
        {
            fullname: "Dr. Claire Deschamps",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 1,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T17:00:00'),
                    patientFullname: "Yves Fournier",
                    duration: 50
                }
            ]
        },
        {
            fullname: "Dr. Martin Girard",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 3,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T18:00:00'),
                    patientFullname: "Lucie Moulin",
                    duration: 30
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T10:30:00'),
                    patientFullname: "Gilles Giraud",
                    duration: 45
                },
                {
                    status: "finished",
                    date: new Date('2024-09-05T15:00:00'),
                    patientFullname: "Camille Simon",
                    duration: 20
                }
            ]
        },
        {
            fullname: "Dr. Brigitte Charpentier",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 2,
            appointMentsItems: [
                {
                    status: "finished",
                    date: new Date('2024-09-05T16:30:00'),
                    patientFullname: "Isabelle Leroy",
                    duration: 30
                },
                {
                    status: "registered",
                    date: new Date('2024-09-06T09:30:00'),
                    patientFullname: "François Picard",
                    duration: 40
                }
            ]
        },
        {
            fullname: "Dr. Philippe Bonnet",
            profilImage: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
            totalAppointments: 1,
            appointMentsItems: [
                {
                    status: "registered",
                    date: new Date('2024-09-06T10:30:00'),
                    patientFullname: "Martine Rousseau",
                    duration: 60
                }
            ]
        }
    ];
    
    return (
        <Card>
            <AppointmentSchedule 
                total={18}
                dentists={dentists}
            />
            {/* <Calendar onSelect={(date , selectInfo)=>{
                showDrawer()
                setSelectInfo(selectInfo)
            }} />
            <Drawer title="Rendez-vous du jour" onClose={onClose} open={open}>
                <Timeline
                    items={[
                    {
                        children: 'Create a services site 2015-09-01',
                    },
                    {
                        children: 'Solve initial network problems 2015-09-01',
                    },
                    {
                        children: 'Technical testing 2015-09-01',
                    },
                    {
                        children: 'Network problems being solved 2015-09-01',
                    },
                    ]}
                />
            </Drawer> */}
        </Card>
    )
}

export default Appointments
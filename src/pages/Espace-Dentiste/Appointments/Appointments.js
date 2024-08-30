import { Calendar, Card, Drawer, Typography, Timeline } from 'antd'
import React, { useState } from 'react'

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
    return (
        <Card>
            <Calendar onSelect={(date , selectInfo)=>{
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
            </Drawer>
        </Card>
    )
}

export default Appointments
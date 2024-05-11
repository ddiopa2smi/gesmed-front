import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex } from 'antd'

function AddAndEditDropdown({items}) {
  return (
    <Flex justify='center' align='center' >
        <Dropdown
            menu={{
                items : items ,
            }}
            trigger={['click']}     
            arrow
        >
            <Button type='primary' shape='circle' size='small'  icon={<PlusOutlined />} style={{marginLeft : 4}}  />
                {/* <div style={{cursor:"pointer"}} >
                    <PlusOutlined style={{fontSize:14}} />
                    <EditOutlined style={{fontSize:14}} />
                </div>
            </Button> */}
            
        </Dropdown>
    </Flex>
  )
}

export default AddAndEditDropdown
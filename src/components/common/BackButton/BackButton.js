import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate } from 'react-router';

function BackButton({ onClick }) {
    const navigate = useNavigate();
    return (
        // <Button type='ghost' size='small' style={{color:"#fff",backgroundColor:"var(--back-button)"}} onClick={()=>{navigate(-1);}}  > <ArrowLeftOutlined/> Retour</Button>
        <Button type="text" size='small' style={{ background: "rgba(172, 172, 172, 0.2)", marginBottom: "10px" }} onClick={() => { onClick ? onClick() : navigate(-1); }}  > <ArrowLeftOutlined /> Retour</Button>
    )
}

export default BackButton
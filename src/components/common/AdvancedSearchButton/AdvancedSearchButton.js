import { Button, Tooltip } from 'antd'
import { TbAdjustmentsHorizontal } from "react-icons/tb";
function AdvancedSearchButton({ onClick }) {
    return (
        <Tooltip title="Recherche avancée" >
            <Button type="primary" ghost icon={<TbAdjustmentsHorizontal size={20} />} onClick={onClick} >
                Recherche multi-critères
            </Button>
        </Tooltip>
    )
}

export default AdvancedSearchButton
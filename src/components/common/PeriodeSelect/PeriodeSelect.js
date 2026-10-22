import { CalendarOutlined } from "@ant-design/icons";
import { Flex, Select, theme } from "antd";
import { periodeOptions } from "../../../constants/table.constants";

/**
 * Select "Période" harmonisé (Ordonnances, Analyses, Radiologie, Consultations...).
 * Présenté comme une "puce" (icône + fond teinté) pour être plus visible qu'un select classique.
 */
function PeriodeSelect({ value, onChange, style, options = periodeOptions }) {
    const { token } = theme.useToken();

    return (
        <Flex
            align="center"
            gap={6}
            style={{
                background: token.colorPrimaryBg,
                border: `1px solid ${token.colorPrimaryBorder}`,
                borderRadius: 8,
                padding: "0 8px 0 12px",
                ...style,
            }}
        >
            <CalendarOutlined style={{ color: token.colorPrimary, fontSize: 15 }} />
            <Select
                variant="borderless"
                style={{ width: 168 }}
                value={value}
                onChange={onChange}
                options={options}
                popupMatchSelectWidth={false}
            />
        </Flex>
    );
}

export default PeriodeSelect;

import { Tag } from "antd";
import { ThemeContext } from "../../../utils/providers/ThemeProvider";
import { useContext } from "react";

function TotalTag({ value }) {
    const { isDark } = useContext(ThemeContext);

    return (
        <Tag style={{ background: isDark ? "#FFFFFF" : "#000000", color: isDark ? "#000000" : "#FFFFFF", fontSize: 13, fontWeight: 500 }} >
            Total: {value}
        </Tag>
    );
}

export default TotalTag;
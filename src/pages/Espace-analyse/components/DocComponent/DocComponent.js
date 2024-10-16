import React from "react";
import "./DocComponent.scss";
import { images } from "../../../../constants/app.constants";
import { Button, Typography } from "antd";
const { Text } = Typography;
function DocComponent({ docName }) {
  return (
    <div>
      <div className="doc-content" >
        <img src={images.file} alt="file_image" width={64} height={64} />
        <div className="relevant-content"  >
            <Button type="primary" size="small" ghost >Ouvrir</Button>
        </div>
      </div>
      <Text>{docName}</Text>
    </div>
  );
}

export default DocComponent;

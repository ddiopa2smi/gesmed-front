import React, { useState } from "react";
import { Button, message, Modal, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { endpoints } from "../../../constants/endpoints.constants";
import { API_URL } from "../../../constants/environment.constants";

const { Text } = Typography;
function UploadResultatModal({ isModalVisible, setIsModalVisible, numPrescription, refreshConsultation }) {
  const [importLoading, setImportLoading] = useState(false);
  return (
    <Modal
      style={{ top: 20 }}
      title="Uploader le résultat"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      centered
      footer={null}
      width={500}
      destroyOnClose
    >
      <Text type="secondary" > Dans cette fenêtre, il s'agit de charger un fichier PDF contenant le ou les résultat(s) de la prescription.</Text>
      <div style={{ margin: "30px 0px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Upload
          name="file"
          multiple={false}
          accept=".pdf"
          customRequest={async ({ file, onSuccess, onError }) => {
            setImportLoading(true);
            const formData = new FormData();
            formData.append("resultat", file);

            await axios.post(`${API_URL}${endpoints.files.UPLOAD_RESULTAT(numPrescription)}`, formData).then(() => {
              message.success('Fichier importé avec succès');
              setIsModalVisible(false);
              refreshConsultation();
            }).catch((error) => {
              message.error(error.response.data.message);
            }).finally(() => {
              setImportLoading(false);
            });
          }}
        >
          <Button loading={importLoading} icon={<UploadOutlined />}>
            Charger un document (en PDF)
          </Button>
        </Upload>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
        <Text type="warning" style={{ fontSize: 13 }}  > Veuillez svp charger un fichier en format PDF de préférence </Text>
      </div>

    </Modal>
  );
}

export default UploadResultatModal;

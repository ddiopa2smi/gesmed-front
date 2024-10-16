import {
  Button,
  Card,
  Descriptions,
  Flex,
  Image,
  Space,
  Typography,
} from "antd";
import React from "react";
import { useParams } from "react-router";
import { formatDate } from "../../../utils/helpers";
import { images } from "../../../constants/app.constants";
import BackButton from "./../../../components/common/BackButton/BackButton";
import DocComponent from "../components/DocComponent/DocComponent";
const { Title, Text } = Typography;
function DetailsAnalyse() {
  const { id } = useParams();
  return (
    <Card>
      <BackButton />
      <br />
      <br />
      <Flex justify="space-between" align="center">
        <Title level={3}> Détails de l'analyse {id} </Title>
        <Button type="primary"> Imprimer </Button>
      </Flex>
      <Descriptions
        title="Informations en détails"
        layout="vertical"
        bordered
        items={[
          {
            key: "1",
            label: "Prescripteur",
            children: "Ibrahima Dieng",
          },
          {
            key: "2",
            label: "Département",
            children: "Service médécine général",
          },
          {
            key: "3",
            label: "Date",
            children: formatDate(new Date().toISOString()),
          },
          {
            key: "4",
            label: "Motif",
            children: "Entorse poignet",
          },
          {
            key: "5",
            span: 3,
            label: "Documents analyses",
            children: (
              <Space>
                <DocComponent docName={`Doc ${id}`} />
                <DocComponent docName={`Doc ${id}`} />
                <DocComponent docName={`Doc ${id}`} />
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}



export default DetailsAnalyse;

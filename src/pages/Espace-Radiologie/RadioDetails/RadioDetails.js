import { Button, Card, Descriptions, Flex, Image, Space, Typography } from "antd";
import React from "react";
import { useParams } from "react-router";
import { images } from "../../../constants/app.constants";
import { formatDate } from "../../../utils/helpers";

const { Title, Text } = Typography;
function RadioDetails() {
  const { id } = useParams();
  return (
    <div>
      <Card>
        
        <Flex justify="space-between" align="center" >
            <Title level={3}> Détails de l'Imagerie IMG00183 </Title>
            <Button type="primary" > Valider la radiologie</Button>
        </Flex>
        <Descriptions
          title="Informations en détails"
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
                span : 3,
                label: "Images radiographie",
                children: (
                  <Space>
                    <Image
                      src={images.radiologie}
                      alt="radio_image"
                      width={100}
                      height={100}
                    />
                    <Image
                      src={images.radiologie}
                      alt="radio_image"
                      width={100}
                      height={100}
                    />
                    <Image
                      src={images.radiologie}
                      alt="radio_image"
                      width={100}
                      height={100}
                    />
                  </Space>
                ),
              },
          ]}
        />
      </Card>
    </div>
  );
}

export default RadioDetails;

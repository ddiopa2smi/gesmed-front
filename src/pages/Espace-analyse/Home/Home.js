import { Button, Card, Flex, Typography } from "antd";
import React from "react";
const { Text, Title } = Typography;
function Home() {
  return (
    <Card>
      <Flex align="center" justify="space-between">
        <Title level={3}>Accueil</Title>
        <Button>Actualiser</Button>
      </Flex>
    </Card>
  );
}

export default Home;

import { Card, message, Typography } from "antd";
import React from "react";
import "./HomeCard.scss";
import { serviceNoAccess } from "../../../utils/helpers";

const { Title , Text } = Typography;
function HomeCard({ cover, icon , label, onClick, canAccess }) {
  return (
    <Card
      className="home-card"
      onClick={() => {
        if (canAccess) {
          onClick();
        } else {
          //message.warning("Désolé, vous n'avez pas accès à ce département");
          serviceNoAccess();
        }
      }}
    >
      {cover && (
        <center>
          <img src={cover} alt="medicine_image" />
        </center>
      )}

      {icon && <center>{icon}</center>}

      <span
        strong
        style={{ textAlign: "center", marginTop: "0em", fontWeight : "500" }}
      >
        {" "}
        {label}{" "}
      </span>
    </Card>
  );
}

export default HomeCard;

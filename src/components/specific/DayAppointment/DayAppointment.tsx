import React from "react";
import "./DayAppointment.scss";
import { CalendarOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  DatePicker,
  Divider,
  Flex,
  List,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { formatDate, formatDateTime } from "../../../utils/helpers";
import { useNavigate } from "react-router";
import { ServiceType } from "../../../utils/types/types.ts";

export interface DayAppointmentInterface {
  data: any[];
  serviceType: ServiceType;
}

const { Text } = Typography;
function DayAppointment({ data, serviceType }: DayAppointmentInterface) {
  const navigate = useNavigate();

  const openMedicalFile = (record: any) => {
    switch (serviceType) {
      case ServiceType.MEDICAL:
        navigate(`/espace-medical/patients/dossier`);
        break;
      case ServiceType.DENTAIRE:
        navigate(
          `/espace-dentist/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.GYNECOLOGIE:
        navigate(
          `/espace-gynecologie/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.ANALYSE:
        navigate(
          `/espace-analyse/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.ANALYSE_BIO_MEDICAL:
        navigate(
          `/espace-analyse/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.RADIOLOGIE:
        navigate(
          `/espace-radiologie/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.HOSPITALISATION:
        navigate(
          `/espace-hospitalisation/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      case ServiceType.INFIRMERIE:
        navigate(
          `/espace-infirmerie/patients/dossier-medical/${record?.num_patient}`
        );
        break;
      default:
        break;
    }

    sessionStorage.setItem("currentPatient", JSON.stringify(record));
  };
  return (
    <div>
      <Flex align="center" justify="space-between">
        <Space>
          <CalendarOutlined />
          <Text> {data?.length ? data?.length : 0} rendez-vous au total pour cette journée. </Text>
        </Space>
        {/* <Space>
          <Text>
            {new Date(data?.[0]?.date_rv).getDate() === new Date().getDate()
              ? "Aujourd'hui"
              : formatDate(new Date(data?.[0]?.date_rv))}
          </Text>
        </Space> */}
      </Flex>

      <Divider />

      <List
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="primary" ghost onClick={() => openMedicalFile(item)}>
                Ouvrir Dossier
              </Button>,
            ]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={
                  <Avatar>
                    {" "}
                    {`${item?.prenom_patient[0].toUpperCase()}${item?.nom_patient[0].toUpperCase()}`}{" "}
                  </Avatar>
                }
                title={
                  <Text>{`${item?.prenom_patient} ${item?.nom_patient}`}</Text>
                }
                description={`Rendez-vous prévu le ${formatDateTime(
                  new Date(item?.date_rv)
                )}`}
              />
              
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
}

export default DayAppointment;

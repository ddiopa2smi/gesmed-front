import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Alert, Button, Col, ConfigProvider, DatePicker, Flex, Form, InputNumber, Modal, Row, Skeleton, Tag, Typography, message } from "antd";
import frFR from "antd/locale/fr_FR";
import { LockOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getActions, putActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";
import { PRIMARY_COLOR } from "../../../constants/app.constants";
import { certificatHtml, imprimerCertificat } from "../../../utils/printCertificat";

const { Text } = Typography;

const DUREES_COURANTES = [1, 2, 3, 5, 7, 15];
const FORMAT_API = "YYYY-MM-DD";

// Le premier jour de repos compte : n jours => fin = début + (n - 1)
const finDeRepos = (debut, jours) => dayjs(debut).add(Math.max(jours, 1) - 1, "day");
const joursEntre = (debut, fin) => fin.startOf("day").diff(debut.startOf("day"), "day") + 1;

// Saisie du repos médical, avec aperçu du certificat tel qu'il sera imprimé
function FenetreCertificat({ numcons, onFermer, onEnregistre }) {
  const [form] = Form.useForm();
  const [certificat, setCertificat] = useState(null);
  const [erreur, setErreur] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [repos, setRepos] = useState(null);

  useEffect(() => {
    getActions(endpoints.consultations.CERTIFICAT(numcons)).then((response) => {
      const data = response?.data;
      if (!data?.numcons) {
        setErreur(true);
        return;
      }
      const dateConsultation = dayjs(data.datecons);
      const valeurs = {
        nb_jours_rm: data.nb_jours_rm || 0,
        debut_rm: data.debut_rm ? dayjs(data.debut_rm) : dateConsultation,
        fin_rm: data.fin_rm ? dayjs(data.fin_rm) : dateConsultation,
      };
      setCertificat(data);
      setRepos(valeurs);
      form.setFieldsValue(valeurs);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numcons]);

  const lectureSeule = certificat?.cloturee === true;

  const appliquer = (valeurs) => {
    setRepos(valeurs);
    form.setFieldsValue(valeurs);
  };

  const onValuesChange = (changement, valeurs) => {
    const { debut_rm: debut, fin_rm: fin } = valeurs;
    if ("nb_jours_rm" in changement && debut) {
      appliquer({ ...valeurs, nb_jours_rm: changement.nb_jours_rm || 0, fin_rm: finDeRepos(debut, changement.nb_jours_rm || 0) });
    } else if ("debut_rm" in changement && debut) {
      appliquer({ ...valeurs, fin_rm: finDeRepos(debut, valeurs.nb_jours_rm || 0) });
    } else if ("fin_rm" in changement && debut && fin) {
      appliquer({ ...valeurs, nb_jours_rm: joursEntre(debut, fin) });
    } else {
      setRepos(valeurs);
    }
  };

  const donnees = useMemo(() => (certificat && repos ? {
    ...certificat,
    nb_jours_rm: repos.nb_jours_rm || 0,
    debut_rm: repos.debut_rm,
    fin_rm: repos.fin_rm,
  } : null), [certificat, repos]);

  const imprimer = async () => {
    const { nb_jours_rm: jours, debut_rm: debut, fin_rm: fin } = await form.validateFields();
    if (lectureSeule) {
      imprimerCertificat(donnees);
      onFermer();
      return;
    }
    setEnCours(true);
    const response = await putActions(endpoints.consultations.CERTIFICAT(numcons), {
      nb_jours_rm: jours || 0,
      debut_rm: debut.format(FORMAT_API),
      fin_rm: fin.format(FORMAT_API),
    });
    setEnCours(false);
    if (!response?.data?.Updated) {
      message.error("Le repos n'a pas pu être enregistré : le certificat n'est pas imprimé");
      return;
    }
    onEnregistre?.({ nb_jours_rm: jours || 0, debut_rm: debut, fin_rm: fin });
    imprimerCertificat(donnees);
    onFermer();
  };

  return (
    <Modal
      open centered width={1040} title="Certificat médical" onCancel={onFermer}
      footer={erreur ? null : (
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onFermer}>Annuler</Button>
          <Button type="primary" icon={<PrinterOutlined />} loading={enCours} disabled={!donnees} onClick={imprimer}>
            {lectureSeule ? "Imprimer" : "Enregistrer et imprimer"}
          </Button>
        </Flex>
      )}
    >
      {erreur && <Alert type="error" showIcon message="Consultation introuvable" />}
      {!erreur && !donnees && <Skeleton active paragraph={{ rows: 8 }} />}
      {donnees && (
        <Row gutter={20}>
          <Col xs={24} md={9}>
            <Text strong>Repos médical</Text>
            {lectureSeule && (
              <Alert type="info" showIcon icon={<LockOutlined />} style={{ margin: "8px 0" }} message="Consultation clôturée : le repos ne peut plus être modifié." />
            )}
            <Form form={form} layout="vertical" onValuesChange={onValuesChange} disabled={lectureSeule} style={{ marginTop: 10 }}>
              <Form.Item label="Nombre de jours" name="nb_jours_rm" extra="0 : certificat de consultation, sans repos">
                <InputNumber min={0} max={365} precision={0} addonAfter="jour(s)" style={{ width: "100%" }} />
              </Form.Item>
              {!lectureSeule && (
                <Flex wrap gap={4} style={{ marginTop: -12, marginBottom: 14 }}>
                  {DUREES_COURANTES.map((jours) => (
                    <Tag.CheckableTag
                      key={jours} checked={repos.nb_jours_rm === jours} style={{ border: "1px solid #d9d9d9", marginInlineEnd: 0 }}
                      onChange={() => onValuesChange({ nb_jours_rm: jours }, form.getFieldsValue())}
                    >
                      {jours} j
                    </Tag.CheckableTag>
                  ))}
                </Flex>
              )}
              <Form.Item label="Date de début" name="debut_rm" rules={[{ required: true, message: "Champ obligatoire" }]}>
                <DatePicker format="DD/MM/YYYY" allowClear={false} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Date de fin (incluse)" name="fin_rm" dependencies={["debut_rm"]}
                rules={[
                  { required: true, message: "Champ obligatoire" },
                  ({ getFieldValue }) => ({
                    validator: (_, fin) => (fin && getFieldValue("debut_rm") && fin.isBefore(getFieldValue("debut_rm"), "day")
                      ? Promise.reject(new Error("La fin précède le début"))
                      : Promise.resolve()),
                  }),
                ]}
              >
                <DatePicker format="DD/MM/YYYY" allowClear={false} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={24} md={15}>
            <Text strong>Aperçu</Text>
            <div style={{ position: "relative", marginTop: 10, height: 640, overflow: "hidden", border: "1px solid #e8e8e8", borderRadius: 8, background: "#fff" }}>
              <iframe
                title="Aperçu du certificat" srcDoc={certificatHtml(donnees)} tabIndex={-1}
                style={{ position: "absolute", top: 0, left: "50%", width: 794, height: 1123, marginLeft: -397, border: 0, transform: "scale(0.57)", transformOrigin: "top center", pointerEvents: "none" }}
              />
            </div>
          </Col>
        </Row>
      )}
    </Modal>
  );
}

/**
 * Ouvre la fenêtre du certificat depuis n'importe quel écran.
 * onEnregistre(repos) : prévient l'écran appelant, qui garde ainsi un formulaire à jour.
 */
export const ouvrirCertificatMedical = (numcons, onEnregistre) => {
  const conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  const racine = createRoot(conteneur);
  const fermer = () => {
    racine.unmount();
    conteneur.remove();
  };
  racine.render(
    <ConfigProvider locale={frFR} theme={{ token: { colorPrimary: PRIMARY_COLOR } }}>
      <FenetreCertificat numcons={numcons} onFermer={fermer} onEnregistre={onEnregistre} />
    </ConfigProvider>
  );
};

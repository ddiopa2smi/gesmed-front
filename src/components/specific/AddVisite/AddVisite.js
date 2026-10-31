import { useMemo, useState } from 'react';
import { Button, Col, DatePicker, Flex, Form, Input, Row, Segmented, Select, Space, Tag, TimePicker, message, theme } from 'antd';
import { CalendarOutlined, CloseOutlined, ClockCircleOutlined, EnvironmentOutlined, SafetyOutlined, SaveOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { postActions, putActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';

const { TextArea } = Input;

// Natures de visite : valeur stockée côté serveur, libellé et couleur d'affichage
export const NATURES_VISITE = {
    SPONTANEE: { label: "Spontanée", color: "blue" },
    ADMINISTRATIVE: { label: "Administrative", color: "purple" },
    TRAVAIL: { label: "Travail", color: "orange" },
    INSPECTION: { label: "Inspection", color: "green" },
};

const VALEUR_DEFAUT = "Néant";

// "08:30:00" (colonne time) -> dayjs du jour à 08:30
export const heureVersDayjs = (heure) => {
    const [h, m] = String(heure || "").split(":").map(Number);
    return Number.isInteger(h) && Number.isInteger(m) ? dayjs().hour(h).minute(m).second(0).millisecond(0) : null;
};

// "08:30:00" -> "08:30"
export const formatHeure = (heure) => (heure ? String(heure).slice(0, 5) : null);

// Durée entre deux heures "HH:mm[:ss]", ex. "1 h 30"
export const dureeVisite = (debut, fin) => {
    const d = heureVersDayjs(debut);
    const f = heureVersDayjs(fin);
    if (!d || !f || !f.isAfter(d)) return null;
    const minutes = f.diff(d, "minute");
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h} h${m ? ` ${String(m).padStart(2, "0")}` : ""}` : `${m} min`;
};

// Intervenants : stockés en texte "A, B, C" ; saisis sous forme de liste
export const listeIntervenants = (valeur) =>
    String(valeur || "").split(",").map((nom) => nom.trim()).filter(Boolean);

const SectionTitle = ({ icon, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Flex align="center" gap={8} style={{ margin: "4px 0 12px", color: colorPrimary, fontWeight: 600 }}>
            {icon}
            <span>{children}</span>
        </Flex>
    );
};

const AddVisite = ({ setOpen, operationType, onRefresh, currentRecord }) => {
    const [form] = Form.useForm();
    const { token: { colorBorderSecondary } } = theme.useToken();
    const [formLoading, setFormLoading] = useState(false);
    const heureDebut = Form.useWatch("heure_debut", form);
    const heureFin = Form.useWatch("heure_fin", form);
    const duree = dureeVisite(heureDebut?.format("HH:mm"), heureFin?.format("HH:mm"));

    const initialValues = useMemo(() => {
        if (operationType === "update" && currentRecord) {
            return {
                ...currentRecord,
                date_visite: currentRecord.date_visite ? dayjs(currentRecord.date_visite) : dayjs(),
                intervenants: listeIntervenants(currentRecord.intervenants),
                heure_debut: heureVersDayjs(currentRecord.heure_debut),
                heure_fin: heureVersDayjs(currentRecord.heure_fin),
            };
        }
        return {
            date_visite: dayjs(),
            nature_visite: "SPONTANEE",
            risques: VALEUR_DEFAUT,
            problemes: VALEUR_DEFAUT,
            mesures_ind: VALEUR_DEFAUT,
            mesures_col: VALEUR_DEFAUT,
        };
    }, [operationType, currentRecord]);

    const buildPayload = (values) => ({
        ...values,
        lieu_visite: values.lieu_visite?.trim(),
        // Colonne de type date : envoyée sans heure pour éviter tout décalage de fuseau
        date_visite: values.date_visite ? values.date_visite.format("YYYY-MM-DD") : null,
        intervenants: (values.intervenants || []).map((nom) => nom.trim()).filter(Boolean).join(", ") || null,
        heure_debut: values.heure_debut ? values.heure_debut.format("HH:mm") : null,
        heure_fin: values.heure_fin ? values.heure_fin.format("HH:mm") : null,
        // Un champ vidé est enregistré comme "Néant", comme à la création
        risques: values.risques?.trim() || VALEUR_DEFAUT,
        problemes: values.problemes?.trim() || VALEUR_DEFAUT,
        mesures_ind: values.mesures_ind?.trim() || VALEUR_DEFAUT,
        mesures_col: values.mesures_col?.trim() || VALEUR_DEFAUT,
    });

    const save = (values) => {
        setFormLoading(true);
        const requete = operationType === "update"
            ? putActions(endpoints.visitesLieux.UPDATE, { ...buildPayload(values), num_visite: currentRecord?.num_visite })
            : postActions(endpoints.visitesLieux.ADD, buildPayload(values));
        const cle = operationType === "update" ? "Updated" : "Added";

        requete
            .then((response) => {
                if (response?.data?.[cle] === true) {
                    message.success(operationType === "update" ? "Visite mise à jour avec succès" : "Nouvelle visite ajoutée avec succès");
                    form.resetFields();
                    setOpen(false);
                    onRefresh();
                } else {
                    message.error(operationType === "update" ? "La mise à jour n'a pas pu être effectuée" : "L'enregistrement n'a pas pu être effectué");
                }
            })
            .catch(() => {
                message.error("Erreur de communication avec le serveur");
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={save}
            initialValues={initialValues}
            preserve={false}
        >
            <SectionTitle icon={<EnvironmentOutlined />}>Visite</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <Form.Item
                        label="Date"
                        name="date_visite"
                        rules={[{ required: true, message: 'Champ obligatoire' }]}
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: "100%" }}
                            suffixIcon={<CalendarOutlined />}
                            disabledDate={(date) => date && date.isAfter(dayjs(), "day")}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                    <Form.Item
                        label="Lieu"
                        name="lieu_visite"
                        rules={[{ required: true, whitespace: true, message: 'Champ obligatoire' }]}
                    >
                        <Input placeholder="Atelier, bureau, site..." maxLength={255} />
                    </Form.Item>
                </Col>
                <Col xs={24}>
                    <Form.Item
                        label="Nature"
                        name="nature_visite"
                        rules={[{ required: true, message: 'Sélection obligatoire' }]}
                    >
                        <Segmented
                            block
                            options={Object.entries(NATURES_VISITE).map(([value, { label }]) => ({ value, label }))}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <SectionTitle icon={<TeamOutlined />}>Déroulement</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Personnes ayant effectué la visite"
                        name="intervenants"
                        tooltip="Saisir chaque nom puis appuyer sur Entrée"
                    >
                        <Select
                            mode="tags"
                            open={false}
                            suffixIcon={<TeamOutlined />}
                            tokenSeparators={[","]}
                            placeholder="Ex : Dr Kadialy SAMBOU, infirmier HSE..."
                        />
                    </Form.Item>
                </Col>
                <Col xs={12} md={5}>
                    <Form.Item label="Heure de début" name="heure_debut">
                        <TimePicker format="HH:mm" minuteStep={5} style={{ width: "100%" }} placeholder="HH:mm" />
                    </Form.Item>
                </Col>
                <Col xs={12} md={7}>
                    <Form.Item
                        label={<Space size={6}><span>Heure de fin</span>{duree && <Tag color="blue" icon={<ClockCircleOutlined />} style={{ marginInlineEnd: 0 }}>{duree}</Tag>}</Space>}
                        name="heure_fin"
                        dependencies={["heure_debut"]}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const debut = getFieldValue("heure_debut");
                                    if (!value || !debut || value.format("HH:mm") > debut.format("HH:mm")) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("L'heure de fin doit être après l'heure de début"));
                                },
                            }),
                        ]}
                    >
                        <TimePicker format="HH:mm" minuteStep={5} style={{ width: "100%" }} placeholder="HH:mm" />
                    </Form.Item>
                </Col>
            </Row>

            <SectionTitle icon={<WarningOutlined />}>Risques et problèmes</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="Risques identifiés" name="risques">
                        <TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder={VALEUR_DEFAUT} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Problèmes liés" name="problemes">
                        <TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder={VALEUR_DEFAUT} />
                    </Form.Item>
                </Col>
            </Row>

            <SectionTitle icon={<SafetyOutlined />}>Mesures et préventions</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="Individuelles" name="mesures_ind">
                        <TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder={VALEUR_DEFAUT} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Collectives" name="mesures_col">
                        <TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder={VALEUR_DEFAUT} />
                    </Form.Item>
                </Col>
            </Row>

            <Flex
                justify="flex-end"
                align="center"
                style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
            >
                <Space>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={formLoading}>
                        Enregistrer
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                </Space>
            </Flex>
        </Form>
    );
};

export default AddVisite;

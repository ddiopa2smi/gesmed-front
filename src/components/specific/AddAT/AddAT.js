import { Alert, Button, Col, DatePicker, Flex, Form, Input, InputNumber, Radio, Row, Select, Space, Steps, Tag, TimePicker, Typography, message, theme } from 'antd';
import { AlertOutlined, CarOutlined, CloseOutlined, FileDoneOutlined, HeartOutlined, LeftOutlined, MedicineBoxOutlined, ReadOutlined, RightOutlined, SaveOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs'
import { getActions, postActions, putActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import BodyMap, { parseZonesLesions, serializeZonesLesions } from '../../common/BodyMap/BodyMap';
import { parseCirconstances } from '../../../utils/printAT';

const { Search, TextArea } = Input;
const { Text } = Typography;

const JOURS_SEMAINE = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const LIEUX_AT = ["Atelier", "Poste", "Champ", "Trajet Aller", "Trajet Retour", "Autres"];

const toDayjs = (value) => (value ? dayjs(value) : null);
const toDate = (value) => (value ? dayjs(value).toISOString() : null);

// Horaires de poste les plus courants, proposés en un clic
const HORAIRES_COURANTS = [["06:00", "14:00"], ["07:00", "15:00"], ["08:00", "17:00"], ["14:00", "22:00"], ["22:00", "06:00"]];
const HEURE_FORMAT = "HH:mm";

// Horaire stocké en texte "07:00 - 15:00" (format attendu par l'API), saisi avec deux sélecteurs d'heure
const HoraireTravailInput = ({ value, onChange }) => {
    const match = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/.exec(value || "");
    const toTime = (hhmm) => {
        const [hour, minute] = hhmm.split(":").map(Number);
        return dayjs().hour(hour).minute(minute).second(0);
    };
    const range = match ? [toTime(match[1]), toTime(match[2])] : null;
    const setRange = (debut, fin) => onChange?.(debut && fin ? `${debut} - ${fin}` : null);

    return (
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <TimePicker.RangePicker
                style={{ width: "100%" }}
                format={HEURE_FORMAT}
                minuteStep={15}
                order={false}
                needConfirm={false}
                placeholder={["Début", "Fin"]}
                value={range}
                onChange={(times) => setRange(times?.[0]?.format(HEURE_FORMAT), times?.[1]?.format(HEURE_FORMAT))}
            />
            <Space size={4} wrap>
                {HORAIRES_COURANTS.map(([debut, fin]) => {
                    const label = `${debut} - ${fin}`;
                    return (
                        <Tag.CheckableTag key={label} checked={value === label} onChange={() => setRange(debut, fin)}>
                            {debut.replace(":00", "h")} - {fin.replace(":00", "h")}
                        </Tag.CheckableTag>
                    );
                })}
            </Space>
            {value && !match && <Text type="secondary" style={{ fontSize: 12 }}>Saisie précédente : {value}</Text>}
        </Space>
    );
};

// Champs de chaque étape : sert à revenir sur l'étape qui contient une erreur de saisie
const STEP_FIELDS = [
    ["matricule", "nom", "prenoms", "sexe", "datenaiss", "service", "emploi", "lieu_residence"],
    ["date_at", "jour_semaine", "lieu_at", "horaire_travail", "date_declaration", "num_carnet_at"],
    ["zones_lesions", "nature_lesions"],
    ["heure_premiers_soins", "structure_premiers_soins", "lieu_transport", "heure_transport", "structure_tansport", "moyen_transport", "temoin_vu", "temoin_entendu", "temoin_avise"],
    ["avant", "au_moment", "apres"],
    ["causes_date_prevue", "causes_par_qui", "causes_avec_qui", "certicat_medical", "itt", "date_guerison_prevue", "date_consolidation", "mesures_prises"],
];

const SectionTitle = ({ icon, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Flex align="center" gap={8} style={{ margin: "4px 0 12px", color: colorPrimary, fontWeight: 600 }}>
            {icon}
            <span>{children}</span>
        </Flex>
    );
};

const AddAT = ({ setOpen, currentRecord, operationType, onRefresh }) => {
    const [form] = Form.useForm();
    const { token: { colorBorderSecondary } } = theme.useToken();
    const [formLoading, setFormLoading] = useState(false);
    const [patientLoading, setPatientLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const initialValues = useMemo(() => {
        if (operationType === "update" && currentRecord) {
            return {
                ...currentRecord,
                date_at: toDayjs(currentRecord.date_at),
                datenaiss: toDayjs(currentRecord.datenaiss),
                date_declaration: toDayjs(currentRecord.date_declaration),
                heure_premiers_soins: toDayjs(currentRecord.heure_premiers_soins),
                heure_transport: toDayjs(currentRecord.heure_transport),
                causes_date_prevue: toDayjs(currentRecord.causes_date_prevue),
                date_guerison_prevue: toDayjs(currentRecord.date_guerison_prevue),
                date_consolidation: toDayjs(currentRecord.date_consolidation),
                ...parseCirconstances(currentRecord.circonstances),
                zones_lesions: parseZonesLesions(currentRecord.zones_lesions),
            };
        }
        const now = dayjs();
        return {
            date_at: now,
            date_declaration: now,
            jour_semaine: JOURS_SEMAINE[now.day()],
        };
    }, [operationType, currentRecord]);

    // Remplit les informations de la victime à partir de sa fiche patient (matricule = n° patient)
    const fillVictimeFromMatricule = (matricule) => {
        const numPatient = matricule?.trim();
        if (!numPatient) return;
        setPatientLoading(true);
        getActions(endpoints.patients.GET_PATIENT(numPatient))
            .then((response) => {
                const patient = response?.data;
                if (!patient?.num_patient) {
                    message.warning("Aucun patient trouvé pour ce matricule");
                    return;
                }
                form.setFieldsValue({
                    matricule: patient.num_patient,
                    nom: patient.nom_patient,
                    prenoms: patient.prenom_patient,
                    sexe: patient.sexe_patient,
                    datenaiss: toDayjs(patient.datenaiss_patient),
                    service: patient.lib_dept || patient.code_dir || undefined,
                    lieu_residence: patient.adresse_patient || undefined,
                });
                message.success(`Fiche de ${patient.prenom_patient} ${patient.nom_patient} chargée`);
            })
            .catch(() => {
                message.warning("Aucun patient trouvé pour ce matricule");
            })
            .finally(() => {
                setPatientLoading(false);
            });
    };

    // Les champs du formulaire portent les noms du modèle DossierAT de l'API ;
    // seules les dates sont converties et les circonstances regroupées.
    const buildPayload = ({ avant, au_moment, apres, ...values }) => ({
        ...values,
        date_at: toDate(values.date_at),
        datenaiss: toDate(values.datenaiss),
        // Zones de lésions enregistrées en JSON : [{"zone":"MAIN_D","type":"Plaie"}, ...]
        zones_lesions: serializeZonesLesions(values.zones_lesions),
        date_declaration: toDate(values.date_declaration),
        heure_premiers_soins: toDate(values.heure_premiers_soins),
        heure_transport: toDate(values.heure_transport),
        causes_date_prevue: toDate(values.causes_date_prevue),
        date_guerison_prevue: toDate(values.date_guerison_prevue),
        date_consolidation: toDate(values.date_consolidation),
        itt: values.itt || 0,
        circonstances: [
            avant && `Avant : ${avant}`,
            au_moment && `Au moment : ${au_moment}`,
            apres && `Après : ${apres}`,
        ].filter(Boolean).join("\n") || null,
    });

    const save = () => {
        form
            .validateFields()
            .then((values) => {
                switch (operationType) {
                    case "add":
                        setFormLoading(true);
                        postActions(endpoints.AT.ADD, buildPayload(values))
                            .then((response) => {
                                if (response?.data?.Added) {
                                    message.success("Accident de travail enregistré avec succès");
                                    form.resetFields();
                                    setOpen(false);
                                    onRefresh();
                                }
                            })
                            .finally(() => {
                                setFormLoading(false);
                            });
                        break;
                    case "update":
                        setFormLoading(true);
                        putActions(endpoints.AT.UPDATE, { ...buildPayload(values), num_at: currentRecord?.num_at })
                            .then((response) => {
                                if (response?.data?.Updated) {
                                    message.success("Accident de travail mis à jour avec succès");
                                    form.resetFields();
                                    setOpen(false);
                                    onRefresh();
                                } else {
                                    message.error("La mise à jour n'a pas pu être effectuée");
                                }
                            })
                            .finally(() => {
                                setFormLoading(false);
                            });
                        break;
                    default:
                        break;
                }
            })
            .catch((info) => {
                // Revient sur l'étape du premier champ en erreur
                const firstError = info?.errorFields?.[0]?.name?.[0];
                const step = STEP_FIELDS.findIndex((fields) => fields.includes(firstError));
                if (step > -1) setCurrentStep(step);
            });
    }

    const steps = [
        {
            title: "Victime",
            icon: <UserOutlined />,
            content: (
                <>
                    <Alert
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message="Saisissez le matricule du patient puis appuyez sur Entrée pour charger sa fiche."
                    />
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={8}>
                            <Form.Item name="matricule" label="Matricule Patient" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                                <Search
                                    placeholder="Ex : 180-231061-1"
                                    loading={patientLoading}
                                    enterButton
                                    onSearch={fillVictimeFromMatricule}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                                <Input placeholder="Nom" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="prenoms" label="Prénom(s)" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                                <Input placeholder="Prénom(s)" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="sexe" label="Sexe">
                                <Radio.Group optionType="button" buttonStyle="solid">
                                    <Radio value="MA">Masculin</Radio>
                                    <Radio value="FE">Féminin</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="datenaiss" label="Date de naissance">
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Sélectionner" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="lieu_residence" label="Lieu de résidence">
                                <Input placeholder="Lieu de résidence" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="service" label="Service">
                                <Input placeholder="Service" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="emploi" label="Emploi">
                                <Input placeholder="Emploi occupé" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            title: "Accident",
            icon: <AlertOutlined />,
            content: (
                <Row gutter={[24, 0]}>
                    <Col xs={24} md={8}>
                        <Form.Item name="date_at" label="Date et heure de l'accident">
                            <DatePicker
                                style={{ width: "100%" }}
                                showTime={{ format: "HH:mm" }}
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Sélectionner"
                                onChange={(value) => {
                                    if (value) form.setFieldValue("jour_semaine", JOURS_SEMAINE[value.day()]);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="jour_semaine" label="Jour de la semaine">
                            <Select
                                placeholder="Jour de la semaine"
                                options={JOURS_SEMAINE.map((jour) => ({ value: jour, label: jour }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="date_declaration" label="Date de déclaration">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Sélectionner" />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item name="lieu_at" label="Lieu exact">
                            <Radio.Group optionType="button" buttonStyle="solid">
                                {LIEUX_AT.map((lieu) => <Radio key={lieu} value={lieu}>{lieu}</Radio>)}
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="horaire_travail" label="Horaire de travail">
                            <HoraireTravailInput />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="num_carnet_at" label="N° Carnet AT">
                            <Input placeholder="N° Carnet AT" />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            title: "Lésions",
            icon: <HeartOutlined />,
            content: (
                <>
                    <Form.Item name="zones_lesions" label="Localisation des lésions">
                        <BodyMap />
                    </Form.Item>
                    <Form.Item name="nature_lesions" label="Nature et siège des lésions (précisions)">
                        <TextArea rows={3} placeholder="Compléments : description, étendue, gravité..." />
                    </Form.Item>
                </>
            ),
        },
        {
            title: "Secours",
            icon: <MedicineBoxOutlined />,
            content: (
                <>
                    <SectionTitle icon={<MedicineBoxOutlined />}>Premiers soins</SectionTitle>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={8}>
                            <Form.Item name="heure_premiers_soins" label="Heure">
                                <TimePicker style={{ width: "100%" }} format="HH:mm" placeholder="Entrer l'heure" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={16}>
                            <Form.Item name="structure_premiers_soins" label="Par qui ?">
                                <Input placeholder="Personne ou structure ayant donné les premiers soins" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <SectionTitle icon={<CarOutlined />}>Transport de la victime</SectionTitle>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={8}>
                            <Form.Item name="lieu_transport" label="Où ?">
                                <Input placeholder="Lieu de destination" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="heure_transport" label="Heure">
                                <TimePicker style={{ width: "100%" }} format="HH:mm" placeholder="Entrer l'heure" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="structure_tansport" label="Par qui ?">
                                <Input placeholder="Par qui ?" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="moyen_transport" label="Comment ?">
                                <Input placeholder="Moyen de transport (ambulance, véhicule de service...)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <SectionTitle icon={<TeamOutlined />}>Témoins</SectionTitle>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={8}>
                            <Form.Item name="temoin_vu" label="Qui a vu ?">
                                <Input placeholder="Qui a vu ?" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="temoin_entendu" label="Qui a entendu ?">
                                <Input placeholder="Qui a entendu ?" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="temoin_avise" label="Premier avisé">
                                <Input placeholder="Premier avisé" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            title: "Circonstances",
            icon: <ReadOutlined />,
            content: (
                <>
                    <Alert
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message="Décrire le déroulement de l'accident"
                        description={
                            <Space direction="vertical" size={2}>
                                <Text><Text strong>Avant :</Text> but, objectif précis de l'action dans laquelle la victime était engagée</Text>
                                <Text><Text strong>Au moment :</Text> ce qui s'est passé exactement au moment de l'accident</Text>
                                <Text><Text strong>Après :</Text> qu'a fait la victime, qui est intervenu, qu'a-t-on fait</Text>
                            </Space>
                        }
                    />
                    <Form.Item name="avant" label="Avant">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="au_moment" label="Au moment">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="apres" label="Après">
                        <TextArea rows={3} />
                    </Form.Item>
                </>
            ),
        },
        {
            title: "Suite",
            icon: <FileDoneOutlined />,
            content: (
                <>
                    <SectionTitle icon={<ReadOutlined />}>Recherche des causes</SectionTitle>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={8}>
                            <Form.Item name="causes_date_prevue" label="Date prévue">
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Sélectionner" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="causes_par_qui" label="Par qui ?">
                                <Input placeholder="Par qui ?" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="causes_avec_qui" label="Avec qui ?">
                                <Input placeholder="Avec qui ?" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <SectionTitle icon={<FileDoneOutlined />}>Autres informations</SectionTitle>
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={6}>
                            <Form.Item name="certicat_medical" label="Certificat médical">
                                <Radio.Group optionType="button" buttonStyle="solid">
                                    <Radio value="Oui">Oui</Radio>
                                    <Radio value="Non">Non</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="itt" label="ITT">
                                <InputNumber min={0} style={{ width: "100%" }} addonAfter="jours" placeholder="0" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="date_guerison_prevue" label="Date de guérison prévue">
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Sélectionner" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="date_consolidation" label="Date de consolidation">
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Sélectionner" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="mesures_prises" label="Mesures prises">
                                <TextArea rows={3} placeholder="Mesures prises suite à l'accident" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
    ];

    const isLastStep = currentStep === steps.length - 1;

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={save}
        >
            <Steps
                size="small"
                current={currentStep}
                onChange={setCurrentStep}
                items={steps.map(({ title, icon }) => ({ title, icon }))}
                style={{ margin: "8px 0 24px" }}
            />

            {/* Toutes les étapes restent montées pour conserver les valeurs saisies ; seule l'étape courante est affichée */}
            {steps.map((step, index) => (
                <div key={step.title} style={{ display: index === currentStep ? "block" : "none", minHeight: 320 }}>
                    {step.content}
                </div>
            ))}

            <Flex
                justify="flex-end"
                align="center"
                style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
            >
                <Space>
                    {currentStep > 0 && (
                        <Button icon={<LeftOutlined />} onClick={() => setCurrentStep(currentStep - 1)}>Précédent</Button>
                    )}
                    {!isLastStep && (
                        <Button type="primary" ghost onClick={() => setCurrentStep(currentStep + 1)}>
                            Suivant <RightOutlined />
                        </Button>
                    )}
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={formLoading}>
                        Enregistrer
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                </Space>
            </Flex>
        </Form>
    )
}

export default AddAT;

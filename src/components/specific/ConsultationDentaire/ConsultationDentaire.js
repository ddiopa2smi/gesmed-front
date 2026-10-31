import React, { useEffect, useRef, useState } from 'react'
import {
    Alert, Avatar, Button, Card, Checkbox, Col, ConfigProvider, DatePicker, Dropdown, Flex, Form, Input, InputNumber, Modal, Row, Segmented,
    Select, Skeleton, Slider, Space, Statistic, Tabs, Tag, Tooltip, Typography, message, theme,
} from 'antd'
import {
    AlertOutlined, CalendarOutlined, CheckCircleOutlined, EditOutlined, ExperimentOutlined, FileTextOutlined, HeartOutlined, HighlightOutlined, InfoCircleOutlined,
    LockOutlined, MedicineBoxOutlined, PrinterOutlined, SaveOutlined, ScheduleOutlined, SolutionOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { getActions, postActions, putActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import useFetch from '../../../utils/hooks/useFetch';
import { codesPrescriptions, codeServices, LOGO_BROWN } from '../../../constants/app.constants';
import { DELAI_CLOTURE_AUTO_HEURES, estClotureAuto, estConsultationCloturee, heuresAvantClotureAuto } from '../../../utils/clotureConsultation';
import {
    ANESTHESIES, ANESTHESIQUES, CARACTERES_DOULEUR, ETATS_DENT, OPTIONS_EXAMEN, ORIENTATIONS, RISQUES_PATIENT, TYPES_RADIO,
    calculerCao, conseilsPourActes, denturePourAge, dentVierge, ecrireFaces, lireFaces, pointsDeVigilance, trouverActe,
} from '../../../utils/dentaire';
import { imprimerConseils, imprimerFicheDentaire, imprimerPlanTraitement } from '../../../utils/printDentaire';
import BackButton from '../../common/BackButton/BackButton';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import Odontogramme from '../../common/Odontogramme/Odontogramme';
import GestionMotifs from '../GestionMotifs/GestionMotifs';
import GestionPathologies from '../GestionPathologies/GestionPathologies';
import PanneauDent from './PanneauDent';
import PlanTraitement from './PlanTraitement';
import { ouvrirCertificatMedical } from '../CertificatMedical/CertificatMedical';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DATE_FORMAT = "dddd DD MMMM YYYY";
const SEUIL_FIEVRE = 37.5;
const CODE_REGION_BOUCHE = /BUCCO/i;

const toDayjs = (value, defaultValue = null) => (value ? dayjs(value) : defaultValue);
const lireJson = (texte) => {
    try {
        return JSON.parse(texte) || {};
    } catch (e) {
        return {};
    }
};

const getInitCons = (initCons) => ({
    ...initCons,
    // L'API renvoie 0 tant que la température n'a pas été prise
    temp: initCons?.temp || null,
    datecons: toDayjs(initCons?.datecons),
    date_rv: toDayjs(initCons?.date_rv, dayjs()),
    debut_rm: toDayjs(initCons?.debut_rm, dayjs()),
    fin_rm: toDayjs(initCons?.fin_rm, dayjs()),
});

// La pathologie stocke ses traitements usuels en liste JSON, ou en texte libre
const traitementsUsuels = (pathologie) => {
    const valeur = pathologie?.traitements_communs;
    if (!valeur) return [];
    try {
        return JSON.parse(valeur);
    } catch (e) {
        return [valeur];
    }
};

const avecCle = (soin) => ({ ...soin, cle: `soin-${soin.id}` });

const SectionCard = ({ icon, title, extra, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Card
            size="small" extra={extra} style={{ marginBottom: 16 }}
            title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>}
        >
            {children}
        </Card>
    );
};

function ConsultationDentaire({ numPatient, numRV }) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    // Repos saisi sur le certificat : repris par le formulaire, pour ne pas être écrasé au prochain enregistrement
    const appliquerRepos = (repos) => form.setFieldsValue(repos);
    const { state } = useLocation();
    const { token } = theme.useToken();

    const patient = state?.patient || JSON.parse(sessionStorage.getItem("currentPatient") || "null");
    const age = patient?.age_patient ?? (patient?.datenaiss_patient ? dayjs().diff(dayjs(patient.datenaiss_patient), "year") : null);

    const [initConsultation, setInitConsultation] = useState(null);
    const [refetch, setRefetch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gestionOuverte, setGestionOuverte] = useState(null);

    // Dossier dentaire : l'état des dents suit le patient, la fiche d'examen appartient à la consultation
    const [dents, setDents] = useState({});
    const [soins, setSoins] = useState([]);
    const [denture, setDenture] = useState(denturePourAge(age));
    const [dossierIndisponible, setDossierIndisponible] = useState(false);
    const dentsModifiees = useRef(new Set());
    const soinsSupprimes = useRef([]);
    const formulaireModifie = useRef(false);

    const [selection, setSelection] = useState([]);
    // Mode rapide : un état choisi est appliqué à chaque dent cliquée
    const [pinceau, setPinceau] = useState(null);

    const refreshConsultation = () => setRefetch(Date.now());

    useEffect(() => {
        getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${numRV}`)
            .then((response) => {
                if (!response?.data) return;
                const data = getInitCons(response.data);
                setInitConsultation(data);
                form.setFieldsValue(data);
                formulaireModifie.current = false;
                if (!data.numcons) return;
                getActions(endpoints.dentaire.DOSSIER(numPatient, data.numcons)).then((reponse) => {
                    const dossier = reponse?.data;
                    setDossierIndisponible(!dossier);
                    if (!dossier) return;
                    dentsModifiees.current = new Set();
                    soinsSupprimes.current = [];
                    setDents(Object.fromEntries(dossier.dents.map((d) => [d.dent, d])));
                    setSoins(dossier.soins.map(avecCle));
                    // Nouvelle consultation : les antécédents sont repris de la dernière fiche du patient
                    const fiche = dossier.fiche ? lireJson(dossier.fiche) : { risques: lireJson(dossier.fiche_precedente).risques };
                    form.setFieldsValue({ fiche });
                    if (fiche.denture) setDenture(fiche.denture);
                });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch]);

    const { data: motifsList, isLoading: motifsLoading, onRefresh: motifsRefresh } = useFetch(endpoints.motifs.LIST);
    const { data: pathologiesList, isLoading: pathologiesLoading, onRefresh: pathologiesRefresh } = useFetch(endpoints.pathologie.LIST);
    const { data: regions } = useFetch(endpoints.regions.LIST);
    const [infosCliniques, setInfosCliniques] = useState(null);

    useEffect(() => {
        if (!numPatient) return;
        getActions(`${endpoints.dossierMedical.INFOS_CLINIQUES}?numpat=${numPatient}`).then((response) => setInfosCliniques(response?.data || null));
    }, [numPatient]);

    const motifs = (motifsList || []).filter((m) => m.code_spe === codeServices.DENTAIRE || m.code_motifcons === initConsultation?.code_motifcons);
    const pathologies = (pathologiesList || []).filter((p) => p.code_spe === codeServices.DENTAIRE || p.code_patho === initConsultation?.code_patho);

    const codePatho = Form.useWatch("code_patho", form);
    const temp = Form.useWatch("temp", form);
    const risques = Form.useWatch(["fiche", "risques"], form);
    const eva = Form.useWatch(["fiche", "eva"], form);
    const anesthesie = Form.useWatch(["fiche", "anesthesie"], form);

    const isConsultationOuverte = !!initConsultation?.medecin;
    const estCloturee = estConsultationCloturee(initConsultation);
    const clotureAuto = estClotureAuto(initConsultation);
    const heuresRestantes = heuresAvantClotureAuto(initConsultation);

    const pathologie = pathologies.find((p) => p.code_patho === codePatho);
    const aFaire = soins.filter((s) => s.statut === "PLANIFIE");
    const soinsDuJour = soins.filter((s) => s.statut === "REALISE" && (s.numcons === initConsultation?.numcons || !s.id));
    const actesEnCours = [...aFaire, ...soinsDuJour].map((s) => trouverActe(s.acte));
    const points = pointsDeVigilance(risques, actesEnCours.some((a) => a?.chirurgie));
    const planifiees = aFaire.flatMap((s) => (s.dents || "").split(",").filter(Boolean).map(Number));
    const cao = calculerCao(dents, denture);
    const conseilsDisponibles = conseilsPourActes(soinsDuJour.map((s) => s.acte)).length > 0;

    /* ---------------- Schéma dentaire ---------------- */

    const modifierDent = (numero, valeur) => {
        dentsModifiees.current.add(numero);
        setDents((actuelles) => ({ ...actuelles, [numero]: valeur }));
    };

    const cliquerDent = (numero, evenement) => {
        if (pinceau && !estCloturee) {
            const dent = dents[numero] || dentVierge(numero);
            modifierDent(numero, { ...dent, etat: dent.etat === pinceau ? "SAINE" : pinceau });
            return;
        }
        if (evenement.ctrlKey || evenement.metaKey) {
            setSelection((liste) => (liste.includes(numero) ? liste.filter((n) => n !== numero) : [...liste, numero]));
        } else {
            setSelection([numero]);
        }
    };

    // Un acte réalisé met à jour les dents concernées (obturation : la carie devient une obturation)
    const appliquerActe = (soin) => {
        const etat = trouverActe(soin.acte)?.etat;
        if (!etat) return;
        (soin.dents || "").split(",").filter(Boolean).map(Number).forEach((numero) => {
            const dent = dents[numero] || dentVierge(numero);
            const faces = Object.fromEntries(Object.entries(lireFaces(dent.faces)).map(([face, lesion]) => [face, lesion === "CARIE" ? "OBTURATION" : lesion]));
            modifierDent(numero, { ...dent, etat, faces: etat === "ABSENTE" ? "" : ecrireFaces(faces) });
        });
    };

    const ajouterSoin = (soin) => {
        setSoins((liste) => [...liste, { ...soin, cle: `nouveau-${Date.now()}`, id: null, numcons: initConsultation.numcons, modifie: true }]);
        if (soin.statut === "REALISE") appliquerActe(soin);
    };

    const changerStatutSoin = (soin, statut) => {
        setSoins((liste) => liste.map((s) => (s.cle === soin.cle
            ? { ...s, statut, modifie: true, numcons: statut === "REALISE" ? initConsultation.numcons : s.numcons, date_realisation: null }
            : s)));
        if (statut === "REALISE") appliquerActe(soin);
    };

    const supprimerSoin = (soin) => {
        if (soin.id) soinsSupprimes.current.push(soin.id);
        setSoins((liste) => liste.filter((s) => s.cle !== soin.cle));
    };

    /* ---------------- Enregistrement ---------------- */

    const save = () => {
        setLoading(true);
        form.validateFields()
            .then((values) => {
                const { fiche, ...consultation } = values;
                const regionBouche = (regions || []).find((r) => CODE_REGION_BOUCHE.test(r.libelle_region));
                const payload = {
                    ...initConsultation,
                    ...consultation,
                    code_region: initConsultation.code_region || regionBouche?.code_region || null,
                    datecons: consultation.datecons ? dayjs(consultation.datecons).toISOString() : null,
                    date_rv: consultation.date_rv ? dayjs(consultation.date_rv).toISOString() : null,
                    debut_rm: consultation.debut_rm ? dayjs(consultation.debut_rm).toISOString() : null,
                    fin_rm: consultation.fin_rm ? dayjs(consultation.fin_rm).toISOString() : null,
                };
                return putActions(endpoints.consultations.UPDATE, payload).then((response) => {
                    if (response?.data?.Cloturee) {
                        message.warning("Cette consultation est clôturée : elle ne peut plus être modifiée");
                        refreshConsultation();
                        return null;
                    }
                    if (!response?.data?.Updated) {
                        message.error("Oups... quelque chose s'est mal passé, veuillez réessayer");
                        return null;
                    }
                    return postActions(endpoints.dentaire.SAVE, {
                        num_patient: numPatient,
                        numcons: initConsultation.numcons,
                        dents: [...dentsModifiees.current].map((numero) => dents[numero]),
                        soins: soins.filter((s) => s.modifie).map(({ cle, modifie, ...soin }) => soin),
                        soins_supprimes: soinsSupprimes.current,
                        fiche: JSON.stringify({ ...fiche, denture }),
                    }).then((reponse) => {
                        if (reponse?.data?.Saved) {
                            message.success("Consultation enregistrée avec succès");
                        } else {
                            message.warning("La consultation est enregistrée, mais pas le dossier dentaire");
                        }
                        refreshConsultation();
                    });
                });
            })
            .catch((info) => console.log('Validate Failed:', info))
            .finally(() => setLoading(false));
    };

    const validFinalConsultation = () => {
        if (formulaireModifie.current || dentsModifiees.current.size || soins.some((s) => s.modifie)) {
            message.warning("Enregistrez d'abord vos modifications avant de clôturer");
            return;
        }
        Modal.confirm({
            title: "Clôturer la consultation ?",
            icon: <LockOutlined style={{ color: token.colorError }} />,
            content: "Une fois clôturée, la consultation ne pourra plus être modifiée.",
            okText: "Clôturer",
            okButtonProps: { danger: true },
            cancelText: "Annuler",
            onOk: () => putActions(endpoints.consultations.CLOTURER(initConsultation.numcons))
                .then((response) => {
                    if (response?.data?.Cloturee) {
                        message.success("Consultation clôturée");
                        refreshConsultation();
                    } else {
                        message.error("La consultation n'a pas pu être clôturée");
                    }
                }),
        });
    };

    const prescrire = (codepresc, route, avecDiagnostic) => {
        sessionStorage.removeItem("editPrescription");
        sessionStorage.setItem("prescription", JSON.stringify({
            codepresc,
            numcons: initConsultation.numcons,
            medecin: initConsultation.medecin,
            ...(avecDiagnostic ? { diagnostic: form.getFieldValue("diagnostic") || initConsultation.diagnostic } : {}),
        }));
        navigate(`/espace-medical/patients/dossier/prescriptions/${route}`);
    };

    const onValuesChange = (changedValues, allValues) => {
        formulaireModifie.current = true;
        if ("nb_jours_rv" in changedValues && allValues.nb_jours_rv) {
            form.setFieldValue("date_rv", dayjs(allValues.datecons || undefined).add(allValues.nb_jours_rv, "day"));
        }
        if (("nb_jours_rm" in changedValues || "debut_rm" in changedValues) && allValues.nb_jours_rm && allValues.debut_rm) {
            // Le premier jour de repos compte : n jours => fin = début + (n - 1)
            form.setFieldValue("fin_rm", dayjs(allValues.debut_rm).add(allValues.nb_jours_rm - 1, "day"));
        }
    };

    const choisirDepuisGestion = (champ, valeur) => {
        form.setFieldValue(champ, valeur);
        formulaireModifie.current = true;
        setGestionOuverte(null);
    };

    if (initConsultation === null) {
        return <Card><Skeleton active avatar paragraph={{ rows: 10 }} /></Card>;
    }

    const contexteImpression = { patient, consultation: { ...initConsultation, diagnostic: form.getFieldValue("diagnostic") }, soins };
    const tabs = [
        {
            key: "anamnese", label: "Motif et antécédents", forceRender: true,
            children: (
                <>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Motif de consultation">
                                <Flex gap={6}>
                                    <Form.Item name="code_motifcons" noStyle>
                                        <Select showSearch allowClear placeholder="Motif" loading={motifsLoading} optionFilterProp="label"
                                            options={motifs.map((m) => ({ value: m.code_motifcons, label: m.libelle_motifcons }))} />
                                    </Form.Item>
                                    <Tooltip title="Gérer les motifs"><Button icon={<EditOutlined />} onClick={() => setGestionOuverte("MOTIF")} /></Tooltip>
                                </Flex>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label={<span>Intensité de la douleur (EVA) : <Text strong>{eva ?? 0} / 10</Text></span>} name={["fiche", "eva"]}>
                                <Slider min={0} max={10} marks={{ 0: "0", 5: "5", 10: "10" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Caractère de la douleur" name={["fiche", "caracteres"]}>
                                <Select mode="multiple" allowClear placeholder="Spontanée, au froid..." options={CARACTERES_DOULEUR} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Depuis" name={["fiche", "depuis"]}>
                                <Input placeholder="Ex. : 3 jours" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Histoire de la plainte" name="resultat">
                        <TextArea rows={2} placeholder="Ce que rapporte le patient" />
                    </Form.Item>
                    <Form.Item label="Antécédents à risque pour les soins dentaires" name={["fiche", "risques"]}>
                        <Checkbox.Group style={{ width: "100%" }}>
                            <Row gutter={[8, 4]}>
                                {RISQUES_PATIENT.map((risque) => (
                                    <Col xs={24} sm={12} xl={8} key={risque.value}><Checkbox value={risque.value}>{risque.label}</Checkbox></Col>
                                ))}
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Traitements en cours" name={["fiche", "traitements"]} style={{ marginBottom: 0 }}>
                                <TextArea rows={2} placeholder="Médicaments pris par le patient" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}><InfoCircleOutlined /> Dossier médical</Text>
                            <div>
                                <Text>Allergies : <Text strong>{infosCliniques?.allergies || "non renseignées"}</Text></Text>
                            </div>
                            {(infosCliniques?.listMaladies || []).length > 0 && (
                                <div><Text>Maladies : <Text strong>{infosCliniques.listMaladies.map((m) => m.lib_maladie).join(", ")}</Text></Text></div>
                            )}
                            {infosCliniques?.tabac === "Oui" && <Tag color="warning" style={{ marginTop: 4 }}>Tabac</Tag>}
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            key: "examen", label: "Examen et diagnostic", forceRender: true,
            children: (
                <>
                    <Row gutter={16}>
                        <Col xs={12} lg={6}><Form.Item label="Hygiène" name={["fiche", "hygiene"]}><Select allowClear placeholder="-" options={OPTIONS_EXAMEN.hygiene} /></Form.Item></Col>
                        <Col xs={12} lg={6}><Form.Item label="Tartre" name={["fiche", "tartre"]}><Select allowClear placeholder="-" options={OPTIONS_EXAMEN.tartre} /></Form.Item></Col>
                        <Col xs={24} lg={12}><Form.Item label="Gencives" name={["fiche", "gencives"]}><Select mode="multiple" allowClear placeholder="-" options={OPTIONS_EXAMEN.gencives} /></Form.Item></Col>
                        <Col xs={24} lg={8}><Form.Item label="Occlusion" name={["fiche", "occlusion"]}><Select mode="multiple" allowClear placeholder="-" options={OPTIONS_EXAMEN.occlusion} /></Form.Item></Col>
                        <Col xs={24} lg={8}><Form.Item label="Articulation (ATM)" name={["fiche", "atm"]}><Select mode="multiple" allowClear placeholder="-" options={OPTIONS_EXAMEN.atm} /></Form.Item></Col>
                        <Col xs={24} lg={8}><Form.Item label="Muqueuses" name={["fiche", "muqueuses"]}><Select mode="multiple" allowClear placeholder="-" options={OPTIONS_EXAMEN.muqueuses} /></Form.Item></Col>
                        <Col xs={24} lg={8}><Form.Item label="Radiographies" name={["fiche", "radios"]}><Select mode="multiple" allowClear placeholder="-" options={TYPES_RADIO} /></Form.Item></Col>
                        <Col xs={24} lg={16}><Form.Item label="Lecture des radiographies" name={["fiche", "lecture_radio"]}><Input placeholder="Résultat de la lecture" /></Form.Item></Col>
                    </Row>
                    <Form.Item label="Examen clinique" name="examen">
                        <TextArea rows={2} placeholder="Observations exo-buccales et endo-buccales" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} md={10}>
                            <Form.Item label="Pathologie">
                                <Flex gap={6}>
                                    <Form.Item name="code_patho" noStyle>
                                        <Select showSearch allowClear placeholder="Pathologie" loading={pathologiesLoading} optionFilterProp="label"
                                            options={pathologies.map((p) => ({ value: p.code_patho, label: p.libelle_patho }))} />
                                    </Form.Item>
                                    <Tooltip title="Gérer les pathologies"><Button icon={<EditOutlined />} onClick={() => setGestionOuverte("PATHOLOGIE")} /></Tooltip>
                                </Flex>
                            </Form.Item>
                            {traitementsUsuels(pathologie).length > 0 && (
                                <div style={{ marginTop: -12, marginBottom: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Traitements usuels : </Text>
                                    <Flex wrap gap={4} style={{ marginTop: 4 }}>
                                        {traitementsUsuels(pathologie).map((t) => <Tag key={t} style={{ marginInlineEnd: 0 }}>{t}</Tag>)}
                                    </Flex>
                                </div>
                            )}
                        </Col>
                        <Col xs={24} md={14}>
                            <Form.Item label={<Text strong>Diagnostic</Text>} name="diagnostic" style={{ marginBottom: 0 }}>
                                <TextArea rows={3} placeholder="Diagnostic" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            key: "seance", label: "Séance du jour", forceRender: true,
            children: (
                <>
                    <Row gutter={16}>
                        <Col xs={24} md={8}><Form.Item label="Anesthésie" name={["fiche", "anesthesie"]}><Select allowClear placeholder="-" options={ANESTHESIES} /></Form.Item></Col>
                        {anesthesie && anesthesie !== "Aucune" && (
                            <>
                                <Col xs={24} md={8}><Form.Item label="Produit" name={["fiche", "anesthesique"]}><Select allowClear placeholder="-" options={ANESTHESIQUES} /></Form.Item></Col>
                                <Col xs={12} md={4}><Form.Item label="Carpules" name={["fiche", "carpules"]}><InputNumber min={0} step={0.5} style={{ width: "100%" }} /></Form.Item></Col>
                                <Col xs={12} md={4}><Form.Item label="N° de lot" name={["fiche", "lot"]}><Input /></Form.Item></Col>
                            </>
                        )}
                    </Row>
                    <Form.Item label="Matériaux utilisés" name={["fiche", "materiaux"]}>
                        <Input placeholder="Composite A2, ciment verre ionomère, teinte..." />
                    </Form.Item>
                    <Form.Item label="Compte rendu de la séance" name={["fiche", "compte_rendu"]} style={{ marginBottom: 0 }}>
                        <TextArea rows={3} placeholder="Déroulement, incidents, suites prévues" />
                    </Form.Item>
                </>
            ),
        },
        {
            key: "constantes", label: "Constantes", forceRender: true,
            children: (
                <Row gutter={16}>
                    <Col xs={12} md={6}><Form.Item label="Tension" name="tension" style={{ marginBottom: 0 }}><Input placeholder="120/80" /></Form.Item></Col>
                    <Col xs={12} md={6}><Form.Item label="Pouls" name="pouls" style={{ marginBottom: 0 }}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
                    <Col xs={12} md={6}>
                        <Form.Item label="Température" name="temp" style={{ marginBottom: 0 }}
                            validateStatus={temp > SEUIL_FIEVRE ? "warning" : undefined} help={temp > SEUIL_FIEVRE ? "Fièvre : infection à rechercher" : undefined}>
                            <InputNumber min={0} step={0.1} addonAfter="°C" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: "suivi", label: "Suivi et orientation", forceRender: true,
            children: (
                <Row gutter={24}>
                    <Col xs={24} lg={8}>
                        <Text strong><ScheduleOutlined /> Prochain rendez-vous</Text>
                        <Row gutter={8} style={{ marginTop: 8 }}>
                            <Col span={8}><Form.Item label="Dans" name="nb_jours_rv"><InputNumber min={0} addonAfter="j" style={{ width: "100%" }} /></Form.Item></Col>
                            <Col span={16}><Form.Item label="Date" name="date_rv"><DatePicker disabled format={DATE_FORMAT} style={{ width: "100%" }} /></Form.Item></Col>
                        </Row>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Text strong><CalendarOutlined /> Repos médical</Text>
                        <Row gutter={8} style={{ marginTop: 8 }}>
                            <Col span={8}><Form.Item label="Durée" name="nb_jours_rm"><InputNumber min={0} addonAfter="j" style={{ width: "100%" }} /></Form.Item></Col>
                            <Col span={16}><Form.Item label="Début" name="debut_rm"><DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} /></Form.Item></Col>
                        </Row>
                        <Form.Item name="fin_rm" hidden><DatePicker /></Form.Item>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Text strong><SolutionOutlined /> Orientation</Text>
                        <Form.Item label="Vers" name={["fiche", "orientation"]} style={{ marginTop: 8 }}>
                            <Select allowClear placeholder="Aucune" options={ORIENTATIONS} />
                        </Form.Item>
                        <Form.Item label="Motif" name={["fiche", "motif_orientation"]} style={{ marginBottom: 0 }}><Input /></Form.Item>
                    </Col>
                    <Form.Item name="datecons" hidden><DatePicker /></Form.Item>
                </Row>
            ),
        },
    ];

    return (
        <Form layout="vertical" form={form} name="consultation_dentaire" onValuesChange={onValuesChange} onFinish={save}>
            {/* En-tête : patient + actions */}
            <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
                <Flex justify="space-between" align="center" wrap gap={16}>
                    <Flex align="center" gap={16} wrap>
                        <BackButton />
                        <Avatar size={56} style={{ backgroundColor: token.colorPrimary, fontSize: 20, fontWeight: 600 }}>
                            {`${patient?.prenom_patient?.[0] || ""}${patient?.nom_patient?.[0] || ""}`.toUpperCase()}
                        </Avatar>
                        <div>
                            <Space size={8} wrap>
                                <Text style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: token.colorPrimary }}>
                                    <MedicineBoxOutlined /> Consultation dentaire
                                </Text>
                                <Tag color="processing">{initConsultation.numcons}</Tag>
                                {!isConsultationOuverte && <Tag>Non démarrée</Tag>}
                                {estCloturee && <Tag icon={<LockOutlined />} color="success">{clotureAuto ? "Clôturée (auto)" : "Clôturée"}</Tag>}
                                {heuresRestantes !== null && (
                                    <Tooltip title={`Sans clôture de votre part, la consultation sera clôturée automatiquement ${DELAI_CLOTURE_AUTO_HEURES} h après sa date.`}>
                                        <Tag color={heuresRestantes <= 2 ? "warning" : "default"}>Clôture auto dans {heuresRestantes} h</Tag>
                                    </Tooltip>
                                )}
                            </Space>
                            <Title level={4} style={{ margin: 0, color: LOGO_BROWN }}>{patient?.prenom_patient} {patient?.nom_patient}</Title>
                            <Space size={12} wrap>
                                <Text strong>N° {patient?.num_patient || numPatient}</Text>
                                {age !== null && <Text type="secondary">{age} ans</Text>}
                                {initConsultation.datecons && <Text type="secondary"><CalendarOutlined /> {dayjs(initConsultation.datecons).format("DD/MM/YYYY HH:mm")}</Text>}
                                {initConsultation.medecin && <Text type="secondary">Dr {initConsultation.medecin.replace(/^Dr\.?\s*/i, "")}</Text>}
                            </Space>
                            {/* Antécédents et allergies : toujours visibles pendant le soin */}
                            <Flex wrap gap={4} style={{ marginTop: 6 }}>
                                {infosCliniques?.allergies && <Tag color="error" icon={<AlertOutlined />} style={{ marginInlineEnd: 0 }}>Allergies : {infosCliniques.allergies}</Tag>}
                                {(risques || []).map((code) => (
                                    <Tag key={code} color="warning" style={{ marginInlineEnd: 0 }}>{RISQUES_PATIENT.find((r) => r.value === code)?.label}</Tag>
                                ))}
                            </Flex>
                        </div>
                    </Flex>

                    <Space wrap>
                        <ReloadButton onRefresh={refreshConsultation} />
                        <Dropdown
                            trigger={['click']}
                            menu={{
                                items: [
                                    { key: "fiche", label: "Fiche dentaire", onClick: () => imprimerFicheDentaire({ ...contexteImpression, dents, denture, points: pointsDeVigilance(risques, true) }) },
                                    { key: "plan", label: "Plan de traitement", onClick: () => imprimerPlanTraitement(contexteImpression) },
                                    { key: "conseils", label: "Conseils au patient", disabled: !conseilsDisponibles, onClick: () => imprimerConseils({ ...contexteImpression, actes: soinsDuJour.map((s) => s.acte) }) },
                                    { key: "certificat", label: "Certificat médical", disabled: !isConsultationOuverte, onClick: () => ouvrirCertificatMedical(initConsultation.numcons, appliquerRepos) },
                                ],
                            }}
                        >
                            <Button icon={<PrinterOutlined />}>Imprimer</Button>
                        </Dropdown>
                        <Dropdown
                            disabled={!isConsultationOuverte || estCloturee}
                            trigger={['click']}
                            menu={{
                                items: [
                                    { key: "ord", label: "Ordonnance", onClick: () => prescrire(codesPrescriptions.ORD, "ordonnance") },
                                    { key: "ana", label: "Analyse", onClick: () => prescrire(codesPrescriptions.ANA, "analyse", true) },
                                    { key: "img", label: "Imagerie", onClick: () => prescrire(codesPrescriptions.IMG, "imagerie", true) },
                                ],
                            }}
                        >
                            <Button type="primary" icon={<FileTextOutlined />}>Prescrire</Button>
                        </Dropdown>
                        {!estCloturee && (
                            <Tooltip title={!isConsultationOuverte ? "Enregistrez d'abord la consultation" : "Clôture définitive : plus aucune modification possible"}>
                                <Button danger icon={<CheckCircleOutlined />} onClick={validFinalConsultation} disabled={!isConsultationOuverte}>Clôturer</Button>
                            </Tooltip>
                        )}
                    </Space>
                </Flex>
                {estCloturee && (
                    <Alert type="success" showIcon style={{ marginTop: 12 }}
                        message={clotureAuto ? "Consultation clôturée automatiquement : lecture seule" : "Consultation clôturée : lecture seule"}
                        description="Le schéma affiche l'état actuel des dents du patient." />
                )}
                {dossierIndisponible && (
                    <Alert type="error" showIcon style={{ marginTop: 12 }} message="Dossier dentaire indisponible : le schéma et le plan de traitement ne pourront pas être enregistrés." />
                )}
                {points.length > 0 && (
                    <Alert
                        type="warning" showIcon icon={<AlertOutlined />} style={{ marginTop: 12 }}
                        message="Points de vigilance"
                        description={points.map((p) => <div key={p.code}><Text strong>{p.label} :</Text> {p.conseil}</div>)}
                    />
                )}
            </Card>

            <ConfigProvider componentDisabled={estCloturee}>
                <Row gutter={16}>
                    {/* Schéma dentaire */}
                    <Col xs={24} xl={14}>
                        <SectionCard
                            icon={<ExperimentOutlined />} title="Schéma dentaire"
                            extra={(
                                <Segmented
                                    size="small" value={denture} onChange={setDenture}
                                    options={[{ value: "adulte", label: "Adulte" }, { value: "mixte", label: "Mixte" }, { value: "enfant", label: "Enfant" }]}
                                />
                            )}
                        >
                            <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 8 }}>
                                <Space size={20}>
                                    <Tooltip title="Dents Cariées, Absentes ou Obturées : indice de référence de l'état bucco-dentaire">
                                        <Statistic title={denture === "enfant" ? "Indice cao" : "Indice CAO"} value={cao.total} valueStyle={{ fontSize: 20, color: LOGO_BROWN }} />
                                    </Tooltip>
                                    <Statistic title="Cariées" value={cao.C} valueStyle={{ fontSize: 20, color: ETATS_DENT.CARIEE.trait }} />
                                    <Statistic title="Absentes" value={cao.A} valueStyle={{ fontSize: 20 }} />
                                    <Statistic title="Obturées" value={cao.O} valueStyle={{ fontSize: 20, color: ETATS_DENT.OBTUREE.trait }} />
                                </Space>
                                <Tooltip title="Applique directement un état à chaque dent cliquée">
                                    <Select
                                        allowClear suffixIcon={<HighlightOutlined />} placeholder="Marquage rapide" value={pinceau} onChange={(v) => setPinceau(v ?? null)} style={{ width: 170 }}
                                        options={Object.entries(ETATS_DENT).filter(([code]) => code !== "SAINE").map(([value, e]) => ({ value, label: e.label }))}
                                    />
                                </Tooltip>
                            </Flex>
                            <Odontogramme
                                dents={dents} denture={denture} selection={selection} planifiees={planifiees} onClickDent={cliquerDent}
                                curseur={pinceau ? "crosshair" : "pointer"}
                            />
                            <Flex wrap gap={10} justify="center" style={{ marginTop: 8 }}>
                                {Object.entries(ETATS_DENT).filter(([code]) => code !== "SAINE").map(([code, e]) => (
                                    <Space key={code} size={4}>
                                        <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: e.couleur, border: `1.5px solid ${e.trait}` }} />
                                        <Text style={{ fontSize: 12 }}>{e.label}</Text>
                                    </Space>
                                ))}
                                <Space size={4}>
                                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#fa8c16" }} />
                                    <Text style={{ fontSize: 12 }}>Soin à faire</Text>
                                </Space>
                            </Flex>
                        </SectionCard>
                    </Col>

                    {/* Dent sélectionnée et plan de traitement */}
                    <Col xs={24} xl={10}>
                        <SectionCard icon={<HeartOutlined />} title={selection.length > 1 ? `${selection.length} dents sélectionnées` : "Dent sélectionnée"}>
                            <PanneauDent
                                numero={selection[selection.length - 1]} dent={dents[selection[selection.length - 1]]} soins={soins}
                                onChange={modifierDent} onFermer={() => setSelection([])} lectureSeule={estCloturee}
                            />
                        </SectionCard>
                        <SectionCard icon={<ScheduleOutlined />} title="Plan de traitement">
                            <PlanTraitement
                                soins={soins} numcons={initConsultation.numcons} selection={selection} lectureSeule={estCloturee}
                                onAjouter={ajouterSoin} onChangerStatut={changerStatutSoin} onSupprimer={supprimerSoin}
                            />
                        </SectionCard>
                    </Col>
                </Row>

                <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { paddingTop: 0 } }}>
                    <Tabs items={tabs} />
                </Card>
            </ConfigProvider>

            <Flex justify="flex-end" gap={8} style={{ position: "sticky", bottom: 0, zIndex: 5, padding: "10px 16px", background: token.colorBgContainer, borderTop: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8 }}>
                <Button onClick={() => navigate(-1)}>Fermer</Button>
                <Button type="primary" htmlType="submit" icon={estCloturee ? <LockOutlined /> : <SaveOutlined />} loading={loading} disabled={estCloturee}>
                    {estCloturee ? "Clôturée" : "Enregistrer"}
                </Button>
            </Flex>

            <Modal title="Gestion des motifs" open={gestionOuverte === "MOTIF"} width={900} footer={null} destroyOnClose onCancel={() => setGestionOuverte(null)}>
                <GestionMotifs
                    data={motifs} isLoading={motifsLoading} onRefresh={motifsRefresh} codeSpe={codeServices.DENTAIRE}
                    onSelect={(record) => choisirDepuisGestion("code_motifcons", record.code_motifcons)}
                />
            </Modal>
            <Modal title="Gestion des pathologies" open={gestionOuverte === "PATHOLOGIE"} width={900} footer={null} destroyOnClose onCancel={() => setGestionOuverte(null)}>
                <GestionPathologies
                    data={pathologies} isLoading={pathologiesLoading} onRefresh={pathologiesRefresh} codeSpe={codeServices.DENTAIRE}
                    onSelect={(record) => choisirDepuisGestion("code_patho", record.code_patho)}
                />
            </Modal>
        </Form>
    );
}

export default ConsultationDentaire

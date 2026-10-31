import React from 'react'
import { Avatar, Button, Card, Col, Descriptions, Dropdown, Empty, Flex, Result, Row, Space, Tag, Typography, theme } from 'antd'
import { useLocation, useNavigate } from 'react-router';
import {
    CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, DashboardOutlined, ExperimentOutlined, EyeOutlined,
    FileTextOutlined, FolderOpenOutlined, HeartOutlined, MedicineBoxOutlined, PrinterOutlined, SolutionOutlined, UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import NotSpecified from '../../components/common/NotSpecified/NotSpecified';
import BackButton from '../../components/common/BackButton/BackButton';
import { formatDate } from '../../utils/helpers';
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import { LOGO_BROWN, typesVisiteMedicaleOptions, getResultatVisite } from '../../constants/app.constants';
import { RESULTATS_TDR, getResultatTdr, isTdrRealise } from '../../utils/tdr';
import { getTypeColor } from '../../utils/typePatient';
import PrescriptionsConsultation from '../../components/specific/PrescriptionsConsultation/PrescriptionsConsultation';
import { ouvrirCertificatMedical } from '../../components/specific/CertificatMedical/CertificatMedical';

const { Title, Text, Paragraph } = Typography;

const SEUIL_FIEVRE = 37.5;

// Interprétation de l'IMC (classification OMS), identique à l'écran d'examen
const getImcCategory = (imc) => {
    if (imc < 18.5) return { label: "Maigreur", color: "warning" };
    if (imc < 25) return { label: "Normal", color: "success" };
    if (imc < 30) return { label: "Surpoids", color: "warning" };
    if (imc < 35) return { label: "Obésité modérée", color: "error" };
    if (imc < 40) return { label: "Obésité sévère", color: "error" };
    return { label: "Obésité morbide", color: "error" };
};

// Les champs numériques non saisis arrivent à 0 (types primitifs côté API), l'IMC à NaN
const valeurNum = (valeur) => {
    if (valeur === null || valeur === undefined || valeur === "") return null;
    const nombre = Number(valeur);
    return Number.isFinite(nombre) && nombre !== 0 ? nombre : null;
};
const estRenseigne = (valeur) => valeur !== null && valeur !== undefined && !["", "0"].includes(String(valeur).trim());
const estOui = (valeur) => valeur === true || ["oui", "true", "1"].includes(String(valeur ?? "").toLowerCase());
// Champs à choix multiples enregistrés sous la forme "Colorés-Pâles"
const listeChoix = (valeur) => (estRenseigne(valeur) ? String(valeur).split("-").filter(Boolean) : []);

const Section = ({ icon, title, children, extra }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Card
            size="small"
            title={<Space style={{ color: colorPrimary }}>{icon}<span>{title}</span></Space>}
            extra={extra}
            style={{ height: "100%" }}
        >
            {children}
        </Card>
    );
};

// Tuile d'une constante vitale, avec une éventuelle alerte
const Constante = ({ label, valeur, unite, statut }) => {
    const { token } = theme.useToken();
    return (
        <div
            style={{
                padding: "10px 12px",
                borderRadius: 8,
                height: "100%",
                background: token.colorFillAlter,
                border: `1px solid ${statut ? token[`color${statut.color === "error" ? "Error" : statut.color === "warning" ? "Warning" : "Success"}Border`] : token.colorBorderSecondary}`,
            }}
        >
            <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
                {estRenseigne(valeur) ? <>{valeur}{unite && <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}> {unite}</Text>}</> : <Text type="secondary">-</Text>}
            </div>
            {statut && <Tag color={statut.color} style={{ marginTop: 4, marginInlineEnd: 0 }}>{statut.label}</Tag>}
        </div>
    );
};

const OuiNon = ({ valeur }) => (estOui(valeur) ? <Tag color="error">Oui</Tag> : <Tag>Non</Tag>);

const Texte = ({ valeur }) => (
    estRenseigne(valeur)
        ? <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{valeur}</Paragraph>
        : <NotSpecified />
);

function DetailsConsultation() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { token: { colorPrimary } } = theme.useToken();
    const consultation = state?.currentConsultation;

    // Libellés des référentiels : l'API ne renvoie que les codes
    const { data: regions } = useFetch(consultation ? endpoints.regions.LIST : null);
    const { data: pathologies } = useFetch(consultation && !consultation.pathologie ? endpoints.pathologie.LIST : null);

    // Accès direct à l'URL ou rafraîchissement : la consultation n'est plus transmise
    if (!consultation) {
        return (
            <Card>
                <Result
                    status="warning"
                    title="Consultation introuvable"
                    subTitle="Ouvrez la consultation depuis la liste des consultations."
                    extra={<Button type="primary" onClick={() => navigate("/espace-medical/consultations")}>Retour à la liste</Button>}
                />
            </Card>
        );
    }

    const c = consultation;
    const estValidee = c.medecin !== null && c.medecin !== undefined;
    const libelleRegion = (regions || []).find((r) => r.code_region === c.code_region)?.libelle_region || c.code_region;
    const libellePatho = c.pathologie || (pathologies || []).find((p) => p.code_patho === c.code_patho)?.libelle_patho || c.code_patho;

    // Constantes
    const temp = valeurNum(c.temp);
    const poids = valeurNum(c.poids);
    const taille = valeurNum(c.taille);
    const imc = valeurNum(c.imc) || (poids && taille ? Number((poids / Math.pow(taille / 100, 2)).toFixed(2)) : null);
    const saturation = valeurNum(c.saturation_resp);
    const glucose = valeurNum(c.glucose_capi);

    // TDR
    const resultatTdr = RESULTATS_TDR.find((r) => r.value === getResultatTdr(c));

    // Repos médical et rendez-vous : les dates sont pré-remplies avec la date de consultation,
    // seul un nombre de jours > 0 indique une prescription réelle
    const nbJoursRm = valeurNum(c.nb_jours_rm);
    const aRepos = !!nbJoursRm;
    const aRendezVous = !!valeurNum(c.nb_jours_rv);
    const rvPasse = c.date_rv && dayjs(c.date_rv).isBefore(dayjs(), "day");

    const muqueuses = listeChoix(c.muqueuse);
    const zonesOedemes = listeChoix(c.zone_oedemes);

    const ouvrirDossier = () => {
        sessionStorage.setItem("currentPatient", JSON.stringify({
            num_patient: c.numpat,
            nom_patient: c.nom_patient,
            prenom_patient: c.prenom_patient,
            sexe_patient: c.sexe_patient,
            type_patient: c.type_patient,
        }));
        navigate(`/espace-medical/patients/${c.numpat}`);
    };

    return (
        <Card>
            <Flex justify="space-between" align="center" wrap gap={12}>
                <BackButton />
                <Space wrap>
                    <Button icon={<FolderOpenOutlined />} onClick={ouvrirDossier}>Dossier médical</Button>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'certificat', label: "Certificat médical", onClick: () => ouvrirCertificatMedical(c.numcons) },
                            ]
                        }}
                    >
                        <Button icon={<PrinterOutlined />}>Imprimer</Button>
                    </Dropdown>
                </Space>
            </Flex>

            {/* En-tête : patient et consultation */}
            <Flex justify="space-between" align="center" wrap gap={16} style={{ margin: "16px 0" }}>
                <Flex align="center" gap={14}>
                    <Avatar size={56} style={{ backgroundColor: c.sexe_patient === "FE" ? "#eb2f96" : colorPrimary, fontSize: 20 }}>
                        {`${c.prenom_patient?.[0] || ""}${c.nom_patient?.[0] || ""}`.toUpperCase() || <UserOutlined />}
                    </Avatar>
                    <div>
                        <Title level={3} style={{ color: LOGO_BROWN, margin: 0 }}>
                            {c.prenom_patient || c.nom_patient ? `${c.prenom_patient || ""} ${c.nom_patient || ""}` : "Détails de la consultation"}
                        </Title>
                        <Space size={6} wrap style={{ marginTop: 4 }}>
                            <Text type="secondary">{c.numpat}</Text>
                            {c.sexe_patient && <Tag color={c.sexe_patient === "FE" ? "magenta" : "blue"}>{c.sexe_patient === "FE" ? "Femme" : "Homme"}</Tag>}
                            {valeurNum(c.age_patient) !== null && <Tag>{c.age_patient} ans</Tag>}
                            {c.type_patient && <Tag color={getTypeColor(c.type_patient)}>{c.type_patient}</Tag>}
                        </Space>
                    </div>
                </Flex>
                <div style={{ textAlign: "right" }}>
                    {estValidee
                        ? <Tag icon={<CheckCircleOutlined />} color="success">Validée</Tag>
                        : <Tag icon={<ClockCircleOutlined />} color="warning">En attente</Tag>}
                    <div style={{ marginTop: 6 }}>
                        <Text strong>{c.datecons ? dayjs(c.datecons).format("DD/MM/YYYY à HH:mm") : "-"}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Consultation {c.numcons}{c.medecin ? ` · ${/^dr\.?\s/i.test(c.medecin) ? c.medecin : `Dr ${c.medecin}`}` : ""}{c.profil_medecin ? ` (${c.profil_medecin})` : ""}
                    </Text>
                </div>
            </Flex>

            {/* Constantes vitales */}
            <Section icon={<DashboardOutlined />} title="Constantes">
                <Row gutter={[10, 10]}>
                    <Col xs={12} sm={8} lg={3}><Constante label="Tension" valeur={c.tension} unite="mmHg" /></Col>
                    <Col xs={12} sm={8} lg={3}><Constante label="Pouls" valeur={valeurNum(c.pouls)} unite="bpm" /></Col>
                    <Col xs={12} sm={8} lg={3}>
                        <Constante label="Température" valeur={temp} unite="°C" statut={temp && temp >= SEUIL_FIEVRE ? { label: "Fièvre", color: "error" } : null} />
                    </Col>
                    <Col xs={12} sm={8} lg={3}><Constante label="Poids" valeur={poids} unite="kg" /></Col>
                    <Col xs={12} sm={8} lg={3}><Constante label="Taille" valeur={taille} unite="cm" /></Col>
                    <Col xs={12} sm={8} lg={3}>
                        <Constante label="IMC" valeur={imc} unite="kg/m²" statut={imc ? getImcCategory(imc) : null} />
                    </Col>
                    <Col xs={12} sm={8} lg={2}><Constante label="Fréq. resp." valeur={valeurNum(c.frequence_resp)} unite="/min" /></Col>
                    <Col xs={12} sm={8} lg={2}>
                        <Constante label="SpO₂" valeur={saturation} unite="%" statut={saturation && saturation < 95 ? { label: "Basse", color: "warning" } : null} />
                    </Col>
                    <Col xs={12} sm={8} lg={2}><Constante label="Glycémie" valeur={glucose} unite="g/L" /></Col>
                </Row>
            </Section>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {/* Motif et diagnostic */}
                <Col xs={24} lg={14}>
                    <Section icon={<SolutionOutlined />} title="Motif et diagnostic">
                        <Descriptions column={{ xs: 1, sm: 2 }} size="small" layout="vertical">
                            <Descriptions.Item label="Motif de consultation">
                                {c.libelle_motifcons || c.code_motifcons || <NotSpecified />}
                            </Descriptions.Item>
                            <Descriptions.Item label="Région concernée">
                                {libelleRegion || <NotSpecified />}
                            </Descriptions.Item>
                            <Descriptions.Item label="Pathologie">
                                {libellePatho ? <Tag color="volcano">{libellePatho}</Tag> : <NotSpecified />}
                            </Descriptions.Item>
                            <Descriptions.Item label="TDR paludisme">
                                {resultatTdr
                                    ? <Tag color={resultatTdr.color}>{resultatTdr.label}</Tag>
                                    : isTdrRealise(c) ? <Tag>Réalisé, sans résultat</Tag> : <Text type="secondary">Non réalisé</Text>}
                            </Descriptions.Item>
                            {(c.type_visite || c.resultat_visite) && (
                                <>
                                    <Descriptions.Item label="Type de visite">
                                        {typesVisiteMedicaleOptions.find((t) => t.value === c.type_visite)?.label || c.type_visite || <NotSpecified />}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Résultat de la visite">
                                        {c.resultat_visite
                                            ? <Tag color={getResultatVisite(c.resultat_visite)?.color} style={{ fontWeight: 600 }}>{getResultatVisite(c.resultat_visite)?.label || c.resultat_visite}</Tag>
                                            : <NotSpecified />}
                                    </Descriptions.Item>
                                </>
                            )}
                            <Descriptions.Item label="Diagnostic" span={2}><Texte valeur={c.diagnostic} /></Descriptions.Item>
                            <Descriptions.Item label="Examen" span={2}><Texte valeur={c.examen} /></Descriptions.Item>
                            <Descriptions.Item label="Résultat" span={2}><Texte valeur={c.resultat} /></Descriptions.Item>
                        </Descriptions>
                    </Section>
                </Col>

                {/* Repos médical et rendez-vous */}
                <Col xs={24} lg={10}>
                    <Flex vertical gap={16} style={{ height: "100%" }}>
                        <Section icon={<MedicineBoxOutlined />} title="Repos médical">
                            {aRepos ? (
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Durée">{nbJoursRm ? <Tag color="purple">{nbJoursRm} jour(s)</Tag> : <NotSpecified />}</Descriptions.Item>
                                    <Descriptions.Item label="Du">{c.debut_rm ? formatDate(c.debut_rm) : <NotSpecified />}</Descriptions.Item>
                                    <Descriptions.Item label="Au">{c.fin_rm ? formatDate(c.fin_rm) : <NotSpecified />}</Descriptions.Item>
                                </Descriptions>
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun repos médical prescrit" style={{ margin: 8 }} />}
                        </Section>
                        <Section icon={<CalendarOutlined />} title="Rendez-vous de suivi">
                            {aRendezVous ? (
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Date">
                                        {c.date_rv ? <Space>{formatDate(c.date_rv)}<Tag color={rvPasse ? "default" : "blue"}>{rvPasse ? "Passé" : "À venir"}</Tag></Space> : <NotSpecified />}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Dans">{valeurNum(c.nb_jours_rv) ? `${c.nb_jours_rv} jour(s)` : <NotSpecified />}</Descriptions.Item>
                                </Descriptions>
                            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun rendez-vous programmé" style={{ margin: 8 }} />}
                            {c.numrv && <Text type="secondary" style={{ fontSize: 12 }}>Consultation issue du rendez-vous n° {c.numrv}</Text>}
                        </Section>
                    </Flex>
                </Col>

                {/* Ordonnances, analyses, imageries et soins prescrits pendant la consultation */}
                <Col xs={24}>
                    <PrescriptionsConsultation numCons={c.numcons} />
                </Col>

                {/* Examen physique */}
                <Col xs={24} md={12}>
                    <Section icon={<HeartOutlined />} title="Examen physique">
                        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                            <Descriptions.Item label="Muqueuses">
                                {muqueuses.length ? <Space size={4} wrap>{muqueuses.map((m) => <Tag key={m}>{m}</Tag>)}</Space> : <NotSpecified />}
                            </Descriptions.Item>
                            <Descriptions.Item label="Oedèmes">
                                {estOui(c.oedemes)
                                    ? <Space size={4} wrap><Tag color="error">Oui</Tag>{zonesOedemes.map((z) => <Tag key={z}>{z}</Tag>)}</Space>
                                    : <Tag>Non</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Déshydratation"><OuiNon valeur={c.deshydratation} /></Descriptions.Item>
                            <Descriptions.Item label="Dénutrition"><OuiNon valeur={c.denutrition} /></Descriptions.Item>
                            <Descriptions.Item label="Obésité"><OuiNon valeur={c.obesite} /></Descriptions.Item>
                        </Descriptions>
                    </Section>
                </Col>

                {/* Vision et urines */}
                <Col xs={24} md={12}>
                    <Row gutter={[16, 16]} style={{ height: "100%" }}>
                        <Col xs={24} sm={12}>
                            <Section icon={<EyeOutlined />} title="Acuité visuelle">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Vision de loin">{c.vision_l || <NotSpecified />}</Descriptions.Item>
                                    <Descriptions.Item label="Vision de près">{c.vision_p || <NotSpecified />}</Descriptions.Item>
                                </Descriptions>
                            </Section>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Section icon={<ExperimentOutlined />} title="Urines (bandelette)">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Glucose">{c.urine_gl || <NotSpecified />}</Descriptions.Item>
                                    <Descriptions.Item label="Corps cétoniques">{c.urine_cc || <NotSpecified />}</Descriptions.Item>
                                    <Descriptions.Item label="Albumine">{c.urine_alb || <NotSpecified />}</Descriptions.Item>
                                </Descriptions>
                            </Section>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {!estValidee && (
                <Flex align="center" gap={8} style={{ marginTop: 16 }}>
                    <FileTextOutlined />
                    <Text type="secondary">Cette consultation n'a pas encore été validée par un médecin.</Text>
                </Flex>
            )}
        </Card>
    )
}

export default DetailsConsultation

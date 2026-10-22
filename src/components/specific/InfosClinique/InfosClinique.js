import React, { useEffect, useState } from 'react'
import { Alert, Avatar, Badge, Button, Card, Col, DatePicker, Empty, Flex, Form, Grid, Input, InputNumber, Modal, Row, Select, Skeleton, Space, Switch, Tabs, Tag, Tooltip, Typography, message, theme } from 'antd';
import { useNavigate } from 'react-router';
import {
    AlertOutlined, BankOutlined, DeleteOutlined, EditOutlined, ExperimentOutlined, HeartOutlined,
    PlusOutlined, SafetyOutlined, SaveOutlined, TeamOutlined, ToolOutlined, UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getActions, putActions } from '../../../actions/actions';
import AddPoste from '../AddPoste/AddPoste';
import AddTypeMaladie from '../AddTypeMaladie/AddTypeMaladie';
import AddStructure from '../AddStructure/AddStructure';
import { endpoints } from '../../../constants/endpoints.constants';
import DataTable from '../../common/DataTable/DataTable';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import BackButton from '../../common/BackButton/BackButton';
import useFetch from '../../../utils/hooks/useFetch';
import { formatDate } from '../../../utils/helpers';
import { LOGO_BROWN } from '../../../constants/app.constants';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Clé technique locale pour identifier une ligne (les nouvelles lignes n'ont pas encore d'identifiant serveur)
let keyCounter = 0;
const withKey = (item) => ({ ...item, _key: `row-${++keyCounter}` });
const withoutKey = ({ _key, ...item }) => item;
const toIso = (value) => (value ? dayjs(value).toISOString() : null);

/* ------------------------------------------------------------------ */
/* Habitudes de vie                                                    */
/* ------------------------------------------------------------------ */

// Interrupteur Oui/Non stocké sous forme de chaîne "Oui" / "Non" (format attendu par l'API)
const OuiNonSwitch = ({ name }) => (
    <Form.Item
        name={name}
        valuePropName="checked"
        getValueProps={(value) => ({ checked: value === "Oui" })}
        normalize={(checked) => (checked ? "Oui" : "Non")}
        noStyle
    >
        <Switch checkedChildren="Oui" unCheckedChildren="Non" />
    </Form.Item>
);

const AddictionCard = ({ title, icon, name, children }) => {
    const form = Form.useFormInstance();
    const isAddict = Form.useWatch(name, form) === "Oui";
    const { token: { colorWarningBg, colorWarningBorder } } = theme.useToken();
    return (
        <Card
            size="small"
            title={<Space>{icon}{title}</Space>}
            extra={<OuiNonSwitch name={name} />}
            style={isAddict ? { background: colorWarningBg, borderColor: colorWarningBorder } : undefined}
        >
            {isAddict ? children : <Text type="secondary">Non concerné</Text>}
        </Card>
    );
};

const HabitudesDeVie = () => (
    <>
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
                <AddictionCard title="Tabac" icon="🚬" name="tabac">
                    <Form.Item label="Durée (années)" name="duree_tabac">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Cigarettes / jour" name="nb_cigarettes" style={{ marginBottom: 0 }}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </AddictionCard>
            </Col>
            <Col xs={24} lg={8}>
                <AddictionCard title="Alcool" icon="🍷" name="alcool">
                    <Form.Item label="Durée (années)" name="duree_alcool">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Rythme" name="rythme_alcool" style={{ marginBottom: 0 }}>
                        <Input placeholder="Ex : occasionnel, quotidien..." />
                    </Form.Item>
                </AddictionCard>
            </Col>
            <Col xs={24} lg={8}>
                <AddictionCard title="Drogue" icon="💊" name="drogue">
                    <Form.Item label="Durée (années)" name="duree_drogue">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Type de drogue" name="type_drogue" style={{ marginBottom: 0 }}>
                        <Input placeholder="Type de drogue" />
                    </Form.Item>
                </AddictionCard>
            </Col>
        </Row>
        <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
                <Form.Item label="Allergies" name="allergies">
                    <TextArea rows={4} placeholder="Allergies connues (médicaments, aliments...)" />
                </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
                <Form.Item label="Régime en cours" name="regime">
                    <TextArea rows={4} placeholder="Régime alimentaire suivi" />
                </Form.Item>
            </Col>
        </Row>
    </>
);

const AntecedentsFamiliaux = () => (
    <Row gutter={[16, 0]}>
        <Col xs={24} lg={8}>
            <Form.Item label="Père" name="ant_pere">
                <TextArea rows={5} placeholder="Antécédents du père" />
            </Form.Item>
        </Col>
        <Col xs={24} lg={8}>
            <Form.Item label="Mère" name="ant_mere">
                <TextArea rows={5} placeholder="Antécédents de la mère" />
            </Form.Item>
        </Col>
        <Col xs={24} lg={8}>
            <Form.Item label="Autres" name="ant_autres">
                <TextArea rows={5} placeholder="Frères, sœurs, grands-parents..." />
            </Form.Item>
        </Col>
    </Row>
);

/* ------------------------------------------------------------------ */
/* Listes (antécédents, hospitalisations, maladies pro, postes)        */
/* ------------------------------------------------------------------ */

const ListSection = ({ description, data, columns, onAdd, onRemove, emptyText }) => (
    <>
        <Flex justify="space-between" align="center" gap={12} style={{ marginBottom: 12 }}>
            <Text type="secondary">{description}</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Ajouter</Button>
        </Flex>
        {data.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText}>
                <Button icon={<PlusOutlined />} onClick={onAdd}>Ajouter</Button>
            </Empty>
        ) : (
            <DataTable
                compact
                dataSource={data}
                dataSourceCopy={data}
                rowKey={(record) => record._key}
                columns={[
                    ...columns,
                    {
                        width: 60,
                        align: "center",
                        render: (record) => (
                            <Tooltip title="Retirer">
                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onRemove(record._key)} />
                            </Tooltip>
                        ),
                    },
                ]}
            />
        )}
    </>
);

// Select d'un référentiel avec boutons d'ajout / modification de l'élément sélectionné
const ReferentielSelect = ({ name, label, list, valueKey, labelKey, loading, onRefresh, AddComponent, entityLabel, rules }) => {
    const form = Form.useFormInstance();
    const value = Form.useWatch(name, form);
    const selected = (list || []).find((item) => item[valueKey] === value) || null;
    const [operation, setOperation] = useState(null);

    return (
        <>
            <Form.Item label={label} required={!!rules}>
                <Flex gap={8}>
                    <Form.Item name={name} noStyle rules={rules}>
                        <Select
                            showSearch
                            allowClear
                            loading={loading}
                            placeholder="Choisir..."
                            optionFilterProp="label"
                            options={(list || []).map((item) => ({ value: item[valueKey], label: item[labelKey] }))}
                        />
                    </Form.Item>
                    <Tooltip title={`Nouveau ${entityLabel}`}>
                        <Button icon={<PlusOutlined />} onClick={() => setOperation("add")} />
                    </Tooltip>
                    <Tooltip title={`Modifier le ${entityLabel} sélectionné`}>
                        <Button icon={<EditOutlined />} disabled={!selected} onClick={() => setOperation("update")} />
                    </Tooltip>
                </Flex>
            </Form.Item>
            <Modal
                title={operation === "add" ? `Nouveau ${entityLabel}` : `Modifier le ${entityLabel}`}
                open={operation !== null}
                onCancel={() => setOperation(null)}
                footer={null}
                destroyOnClose
            >
                <AddComponent
                    isModalVisible={operation !== null}
                    setIsModalVisible={(visible) => { if (!visible) setOperation(null) }}
                    operationType={operation}
                    refresh={onRefresh}
                    itemSelected={operation === "update" ? selected : null}
                />
            </Modal>
        </>
    );
};

const AntecedentForm = ({ referentiels, onSubmit }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} layout="vertical" onFinish={(values) => {
            const maladie = referentiels.maladies.find((item) => item.code_maladie === values.code_maladie);
            onSubmit({ ...values, lib_maladie: maladie?.lib_maladie });
        }}>
            <Form.Item label="Maladie" name="code_maladie" rules={[{ required: true, message: "Choisir une maladie" }]}>
                <Select
                    showSearch
                    placeholder="Rechercher une maladie"
                    optionFilterProp="label"
                    loading={referentiels.maladiesLoading}
                    options={referentiels.maladies.map((item) => ({ value: item.code_maladie, label: item.lib_maladie }))}
                />
            </Form.Item>
            <Form.Item label="Observation" name="observation">
                <TextArea rows={3} placeholder="Précisions (date de diagnostic, traitement...)" />
            </Form.Item>
            <Flex justify="flex-end"><Button type="primary" htmlType="submit">Ajouter</Button></Flex>
        </Form>
    );
};

const HospitalisationForm = ({ referentiels, onSubmit }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} layout="vertical" onFinish={(values) => {
            const structure = referentiels.structures.find((item) => item.code_structure === values.code_structure);
            const [dateEntree, dateSortie] = values.periode || [];
            onSubmit({
                code_structure: values.code_structure,
                structure: structure?.lib_structure,
                date_entree: toIso(dateEntree),
                date_sortie: toIso(dateSortie),
                motif: values.motif,
            });
        }}>
            <ReferentielSelect
                name="code_structure"
                label="Structure"
                list={referentiels.structures}
                valueKey="code_structure"
                labelKey="lib_structure"
                loading={referentiels.structuresLoading}
                onRefresh={referentiels.refreshStructures}
                AddComponent={AddStructure}
                entityLabel="structure"
                rules={[{ required: true, message: "Choisir une structure" }]}
            />
            <Form.Item label="Période (entrée - sortie)" name="periode">
                <DatePicker.RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" allowEmpty={[false, true]} />
            </Form.Item>
            <Form.Item label="Motif" name="motif">
                <TextArea rows={3} placeholder="Motif de l'hospitalisation" />
            </Form.Item>
            <Flex justify="flex-end"><Button type="primary" htmlType="submit">Ajouter</Button></Flex>
        </Form>
    );
};

const MaladieProfForm = ({ referentiels, onSubmit }) => {
    const [form] = Form.useForm();
    const codeMp = Form.useWatch("code_mp", form);
    const maladie = referentiels.maladiesProf.find((item) => item.code_mp === codeMp);
    return (
        <Form form={form} layout="vertical" initialValues={{ date_dec: dayjs() }} onFinish={(values) => {
            onSubmit({
                code_mp: values.code_mp,
                type_mp: maladie?.type_mp,
                num_tab: maladie?.num_tableau,
                description_mp: maladie?.description_mp,
                date_dec: toIso(values.date_dec),
                observation: values.observation,
            });
        }}>
            <ReferentielSelect
                name="code_mp"
                label="Type de maladie professionnelle"
                list={referentiels.maladiesProf}
                valueKey="code_mp"
                labelKey="type_mp"
                loading={referentiels.maladiesProfLoading}
                onRefresh={referentiels.refreshMaladiesProf}
                AddComponent={AddTypeMaladie}
                entityLabel="type de maladie"
                rules={[{ required: true, message: "Choisir un type de maladie" }]}
            />
            {maladie && (
                <Alert
                    type="info"
                    style={{ marginBottom: 16 }}
                    message={`Tableau n° ${maladie.num_tableau ?? "-"}`}
                    description={maladie.description_mp}
                />
            )}
            <Form.Item label="Date de déclaration" name="date_dec">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Observations" name="observation">
                <TextArea rows={3} />
            </Form.Item>
            <Flex justify="flex-end"><Button type="primary" htmlType="submit">Ajouter</Button></Flex>
        </Form>
    );
};

const PosteForm = ({ referentiels, onSubmit }) => {
    const [form] = Form.useForm();
    const codePoste = Form.useWatch("code_poste", form);
    const poste = referentiels.postes.find((item) => item.code_poste === codePoste);
    return (
        <Form form={form} layout="vertical" onFinish={(values) => {
            const [dateDeb, dateFin] = values.periode || [];
            onSubmit({
                code_poste: values.code_poste,
                lib_poste: poste?.lib_poste,
                nature_poste: poste?.nature_poste,
                risques_poste: poste?.risques_poste,
                date_deb: toIso(dateDeb),
                date_fin: toIso(dateFin),
            });
        }}>
            <ReferentielSelect
                name="code_poste"
                label="Poste"
                list={referentiels.postes}
                valueKey="code_poste"
                labelKey="lib_poste"
                loading={referentiels.postesLoading}
                onRefresh={referentiels.refreshPostes}
                AddComponent={AddPoste}
                entityLabel="poste"
                rules={[{ required: true, message: "Choisir un poste" }]}
            />
            {poste && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                        <Text type="secondary">Nature du travail</Text>
                        <div style={{ whiteSpace: "pre-line" }}>{poste.nature_poste || "-"}</div>
                    </Col>
                    <Col span={12}>
                        <Text type="secondary">Risques liés</Text>
                        <div style={{ whiteSpace: "pre-line" }}>{poste.risques_poste || "-"}</div>
                    </Col>
                </Row>
            )}
            <Form.Item label="Période (début - fin)" name="periode">
                <DatePicker.RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" allowEmpty={[false, true]} />
            </Form.Item>
            <Flex justify="flex-end"><Button type="primary" htmlType="submit">Ajouter</Button></Flex>
        </Form>
    );
};

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

const LIST_CONFIG = {
    maladies: { title: "Ajouter un antécédent médical", Form: AntecedentForm, uniqueKey: "code_maladie", duplicate: "Cette maladie figure déjà dans les antécédents" },
    hospitalisations: { title: "Ajouter une hospitalisation", Form: HospitalisationForm },
    maladiesProf: { title: "Ajouter une maladie professionnelle", Form: MaladieProfForm, uniqueKey: "code_mp", duplicate: "Cette maladie professionnelle est déjà déclarée" },
    postes: { title: "Ajouter un risque lié au poste", Form: PosteForm, uniqueKey: "code_poste", duplicate: "Ce poste figure déjà dans la liste" },
};

function InfosClinique() {
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const { token: { colorPrimary } } = theme.useToken();
    const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));
    const [form] = Form.useForm();

    const [infos, setInfos] = useState(null);
    const [lists, setLists] = useState({ maladies: [], hospitalisations: [], maladiesProf: [], postes: [] });
    const [refetch, setRefetch] = useState(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [addingTo, setAddingTo] = useState(null);

    const { data: maladies, isLoading: maladiesLoading } = useFetch(endpoints.maladies.LIST);
    const { data: structures, isLoading: structuresLoading, onRefresh: refreshStructures } = useFetch(endpoints.structures.LIST);
    const { data: maladiesProf, isLoading: maladiesProfLoading, onRefresh: refreshMaladiesProf } = useFetch(endpoints.maladiesProfessionelles.LIST);
    const { data: postes, isLoading: postesLoading, onRefresh: refreshPostes } = useFetch(endpoints.postes.LIST);
    const referentiels = {
        maladies: maladies || [], maladiesLoading,
        structures: structures || [], structuresLoading, refreshStructures,
        maladiesProf: maladiesProf || [], maladiesProfLoading, refreshMaladiesProf,
        postes: postes || [], postesLoading, refreshPostes,
    };

    useEffect(() => {
        getActions(`${endpoints.dossierMedical.INFOS_CLINIQUES}?numpat=${currentPatient?.num_patient}`)
            .then((response) => {
                const data = response.data || {};
                setInfos(data);
                setLists({
                    maladies: (data.listMaladies || []).map(withKey),
                    hospitalisations: (data.listHospitalisations || []).map(withKey),
                    maladiesProf: (data.listMaladiesProf || []).map(withKey),
                    postes: (data.listPatientsPostes || []).map(withKey),
                });
                setDirty(false);
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch])

    const addItem = (listName, item) => {
        const { uniqueKey, duplicate } = LIST_CONFIG[listName];
        if (uniqueKey && lists[listName].some((element) => element[uniqueKey] === item[uniqueKey])) {
            message.warning(duplicate);
            return;
        }
        setLists({ ...lists, [listName]: [...lists[listName], withKey({ ...item, numpat: currentPatient?.num_patient })] });
        setDirty(true);
        setAddingTo(null);
    };

    const removeItem = (listName, key) => {
        setLists({ ...lists, [listName]: lists[listName].filter((element) => element._key !== key) });
        setDirty(true);
    };

    const save = () => {
        setSaving(true);
        const payload = {
            ...infos,
            ...form.getFieldsValue(true),
            listMaladies: lists.maladies.map(withoutKey),
            listHospitalisations: lists.hospitalisations.map(withoutKey),
            listMaladiesProf: lists.maladiesProf.map(withoutKey),
            listPatientsPostes: lists.postes.map(withoutKey),
        };
        putActions(endpoints.dossierMedical.INFOS_CLINIQUES_UPDATE, payload)
            .then((response) => {
                if (response?.data?.Updated === true) {
                    message.success("Infos cliniques mises à jour avec succès");
                    setRefetch(Date.now());
                } else {
                    message.error("Une erreur s'est produite, veuillez réessayer svp");
                }
            })
            .catch(() => message.error("Une erreur s'est produite, veuillez réessayer svp"))
            .finally(() => setSaving(false));
    };

    const tabLabel = (icon, label, count) => (
        <Space>
            {icon}
            <span>{label}</span>
            {count !== undefined && <Badge count={count} showZero color={count ? colorPrimary : "#bfbfbf"} size="small" />}
        </Space>
    );

    const dateColumn = (title, dataIndex) => ({ title, dataIndex, key: dataIndex, render: (value) => formatDate(value) || "-" });

    const items = [
        {
            key: "habitudes",
            label: tabLabel(<HeartOutlined />, "Habitudes de vie"),
            children: <HabitudesDeVie />,
        },
        {
            key: "maladies",
            label: tabLabel(<ExperimentOutlined />, "Antécédents médicaux", lists.maladies.length),
            children: (
                <ListSection
                    description="Maladies et antécédents médicaux du patient"
                    emptyText="Aucun antécédent médical"
                    data={lists.maladies}
                    onAdd={() => setAddingTo("maladies")}
                    onRemove={(key) => removeItem("maladies", key)}
                    columns={[
                        { title: "Code", dataIndex: "code_maladie", key: "code_maladie", width: 100 },
                        { title: "Maladie", dataIndex: "lib_maladie", key: "lib_maladie" },
                        { title: "Observation", dataIndex: "observation", key: "observation" },
                    ]}
                />
            ),
        },
        {
            key: "hospitalisations",
            label: tabLabel(<BankOutlined />, "Hospitalisations", lists.hospitalisations.length),
            children: (
                <ListSection
                    description="Séjours hospitaliers du patient"
                    emptyText="Aucune hospitalisation"
                    data={lists.hospitalisations}
                    onAdd={() => setAddingTo("hospitalisations")}
                    onRemove={(key) => removeItem("hospitalisations", key)}
                    columns={[
                        {
                            title: "Structure",
                            key: "structure",
                            render: (record) => record.structure
                                || referentiels.structures.find((item) => item.code_structure === record.code_structure)?.lib_structure
                                || record.code_structure,
                        },
                        dateColumn("Entrée", "date_entree"),
                        dateColumn("Sortie", "date_sortie"),
                        { title: "Motif", dataIndex: "motif", key: "motif" },
                    ]}
                />
            ),
        },
        {
            key: "familiaux",
            label: tabLabel(<TeamOutlined />, "Antécédents familiaux"),
            children: <AntecedentsFamiliaux />,
        },
        {
            key: "maladiesProf",
            label: tabLabel(<SafetyOutlined />, "Maladies professionnelles", lists.maladiesProf.length),
            children: (
                <ListSection
                    description="Maladies professionnelles déclarées"
                    emptyText="Aucune maladie professionnelle"
                    data={lists.maladiesProf}
                    onAdd={() => setAddingTo("maladiesProf")}
                    onRemove={(key) => removeItem("maladiesProf", key)}
                    columns={[
                        dateColumn("Déclaration", "date_dec"),
                        { title: "Type", dataIndex: "type_mp", key: "type_mp" },
                        { title: "N° tableau", dataIndex: "num_tab", key: "num_tab", align: "center", width: 100 },
                        { title: "Observation", dataIndex: "observation", key: "observation" },
                    ]}
                />
            ),
        },
        {
            key: "postes",
            label: tabLabel(<ToolOutlined />, "Risques liés au poste", lists.postes.length),
            children: (
                <ListSection
                    description="Postes occupés et risques associés"
                    emptyText="Aucun poste renseigné"
                    data={lists.postes}
                    onAdd={() => setAddingTo("postes")}
                    onRemove={(key) => removeItem("postes", key)}
                    columns={[
                        { title: "Poste", dataIndex: "lib_poste", key: "lib_poste" },
                        { title: "Risques", dataIndex: "risques_poste", key: "risques_poste", ellipsis: true },
                        dateColumn("Début", "date_deb"),
                        dateColumn("Fin", "date_fin"),
                    ]}
                />
            ),
        },
    ];

    const AddListForm = addingTo ? LIST_CONFIG[addingTo].Form : null;

    return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Card>
                <Flex justify="space-between" align="center" wrap gap={16}>
                    <Flex align="center" gap={16}>
                        <BackButton />
                        <Avatar size={52} icon={<UserOutlined />} style={{ backgroundColor: colorPrimary }} />
                        <div>
                            <Title level={4} style={{ margin: 0, color: LOGO_BROWN }}>Infos cliniques</Title>
                            <Text strong style={{ fontSize: 15 }}>
                                {currentPatient?.prenom_patient} {currentPatient?.nom_patient} · N° {currentPatient?.num_patient}
                            </Text>
                        </div>
                    </Flex>
                    <Space wrap>
                        {dirty && <Tag icon={<AlertOutlined />} color="warning">Modifications non enregistrées</Tag>}
                        <ReloadButton onRefresh={() => setRefetch(Date.now())} />
                        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} disabled={!dirty}>
                            Enregistrer
                        </Button>
                    </Space>
                </Flex>
            </Card>

            <Card styles={{ body: { paddingTop: 8 } }}>
                {infos === null ? <Skeleton active paragraph={{ rows: 8 }} /> : (
                    <Form
                        // Remonté à chaque chargement pour repartir des valeurs du serveur
                        key={refetch ?? "initial"}
                        layout="vertical"
                        form={form}
                        name="infos_cliniques_form"
                        initialValues={infos}
                        onValuesChange={() => setDirty(true)}
                    >
                        <Tabs
                            tabPosition={screens.lg ? "left" : "top"}
                            items={items}
                            style={{ minHeight: 380 }}
                        />
                    </Form>
                )}

                <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
                    <Button onClick={() => navigate(-1)}>Fermer</Button>
                    <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} disabled={!dirty}>
                        Enregistrer
                    </Button>
                </Flex>
            </Card>

            <Modal
                title={addingTo ? LIST_CONFIG[addingTo].title : ""}
                open={addingTo !== null}
                onCancel={() => setAddingTo(null)}
                footer={null}
                destroyOnClose
            >
                {AddListForm && <AddListForm referentiels={referentiels} onSubmit={(item) => addItem(addingTo, item)} />}
            </Modal>
        </Space>
    )
}

export default InfosClinique

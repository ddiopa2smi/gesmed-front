import dayjs from "dayjs";

/**
 * Clôture des consultations (même règle que l'API, cf. ConsultationRepository.cloturerConsultationsExpirees) :
 * une consultation démarrée (médecin renseigné) est clôturée par le médecin, ou automatiquement
 * 24 h après sa date de consultation.
 */
export const DELAI_CLOTURE_AUTO_HEURES = 24;

const estDemarree = (consultation) => !!consultation?.medecin;

// Délai de 24 h dépassé (la tâche planifiée de l'API peut ne pas être encore passée)
const estExpiree = (consultation) =>
    estDemarree(consultation) && !!consultation?.datecons
    && dayjs().diff(dayjs(consultation.datecons), "hour", true) >= DELAI_CLOTURE_AUTO_HEURES;

export const estConsultationCloturee = (consultation) =>
    consultation?.cloturee === true || estExpiree(consultation);

// Clôture faite automatiquement (ou délai dépassé) et non par le médecin
export const estClotureAuto = (consultation) =>
    consultation?.cloture_auto === true || (consultation?.cloturee !== true && estExpiree(consultation));

// Heures restantes avant la clôture automatique (null si non démarrée ou déjà clôturée)
export const heuresAvantClotureAuto = (consultation) => {
    if (!estDemarree(consultation) || !consultation?.datecons || estConsultationCloturee(consultation)) return null;
    const restant = DELAI_CLOTURE_AUTO_HEURES - dayjs().diff(dayjs(consultation.datecons), "hour", true);
    return Math.max(0, Math.ceil(restant));
};

/**
 * Permissions v3.0 (guide master ORSEC, §6.4).
 * Elles remplacent les 42 codes de la version 22 rôles. Aucune désignation :
 * le rôle, le module et le territoire suffisent, complétés par l'état du plan.
 */

import type { Localized } from "../data/locale";
import type { Role } from "./roles";

export const PERMISSIONS = [
  // Citoyen
  "CREER_SIGNALEMENT",
  "SUIVRE_MON_SIGNALEMENT",
  // Module
  "RECEVOIR_ALERTE_MODULE",
  "CONFIRMER_SIGNALEMENT",
  "FIXER_GRAVITE",
  "LANCER_INTERVENTION",
  "AFFECTER_AGENTS",
  "DEMANDER_APPUI_MODULE",
  "CLOTURER_INTERVENTION",
  "DECLARER_HORS_CONTROLE",
  "CONSULTER_MODULE",
  "INDIQUER_DISPONIBILITE",
  "SUIVRE_TACHE",
  "ENVOYER_COMPTE_RENDU",
  "CONFIRMER_PARTICIPATION",
  // Autorités
  "TRAITER_DEMANDE_DECLENCHEMENT",
  "DECLENCHER_PLAN",
  "CHANGER_PHASE",
  "LEVER_PLAN",
  "PROPOSER_ESCALADE",
  "DEMANDER_PLAN_SUPERIEUR",
  "LANCER_EXERCICE",
  "CONSULTER_PLANS_ALERTES_EFFECTIFS",
  "DECLENCHER_PLAN_NATIONAL",
  // Administration
  "GERER_COMPTES",
  "ATTRIBUER_ROLE",
  "GERER_REFERENTIELS",
  "CONSULTER_JOURNAL",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Désignation opérationnelle historique (affectation titulaire / suppléant). */
export type DesignationFn = string;

export const PERMISSION_LABELS: Record<Permission, Localized> = {
  CREER_SIGNALEMENT: { fr: "Créer un signalement", ar: "إنشاء تبليغ" },
  SUIVRE_MON_SIGNALEMENT: { fr: "Suivre mes signalements", ar: "متابعة تبليغاتي" },
  RECEVOIR_ALERTE_MODULE: { fr: "Recevoir les alertes de son module", ar: "تلقي تنبيهات وحدته" },
  CONFIRMER_SIGNALEMENT: { fr: "Confirmer ou rejeter un signalement", ar: "تأكيد تبليغ أو رفضه" },
  FIXER_GRAVITE: { fr: "Fixer la gravité à la confirmation", ar: "تحديد الخطورة عند التأكيد" },
  LANCER_INTERVENTION: { fr: "Lancer une intervention", ar: "إطلاق تدخل" },
  AFFECTER_AGENTS: { fr: "Affecter des agents", ar: "تكليف أعوان" },
  DEMANDER_APPUI_MODULE: { fr: "Demander l'appui d'un autre module", ar: "طلب دعم وحدة أخرى" },
  CLOTURER_INTERVENTION: { fr: "Clôturer une intervention", ar: "إغلاق تدخل" },
  DECLARER_HORS_CONTROLE: { fr: "Déclarer la situation hors de contrôle", ar: "الإعلان عن الخروج عن السيطرة" },
  CONSULTER_MODULE: { fr: "Consulter les données du module", ar: "الاطلاع على بيانات الوحدة" },
  INDIQUER_DISPONIBILITE: { fr: "Indiquer sa disponibilité", ar: "الإعلان عن الجاهزية" },
  SUIVRE_TACHE: { fr: "Suivre ses tâches", ar: "متابعة المهام" },
  ENVOYER_COMPTE_RENDU: { fr: "Envoyer un compte rendu", ar: "إرسال تقرير" },
  CONFIRMER_PARTICIPATION: { fr: "Confirmer sa participation", ar: "تأكيد المشاركة" },
  TRAITER_DEMANDE_DECLENCHEMENT: { fr: "Traiter une demande de déclenchement", ar: "معالجة طلب إطلاق" },
  DECLENCHER_PLAN: { fr: "Déclencher un plan", ar: "إطلاق مخطط" },
  CHANGER_PHASE: { fr: "Changer la phase d'un plan", ar: "تغيير مرحلة المخطط" },
  LEVER_PLAN: { fr: "Lever un plan", ar: "رفع مخطط" },
  PROPOSER_ESCALADE: { fr: "Proposer une escalade", ar: "اقتراح تصعيد" },
  DEMANDER_PLAN_SUPERIEUR: { fr: "Demander le plan du niveau supérieur", ar: "طلب مخطط المستوى الأعلى" },
  LANCER_EXERCICE: { fr: "Lancer un exercice", ar: "إطلاق تمرين" },
  CONSULTER_PLANS_ALERTES_EFFECTIFS: { fr: "Consulter plans, alertes et effectifs", ar: "الاطلاع على المخططات والتنبيهات والعديد" },
  DECLENCHER_PLAN_NATIONAL: { fr: "Déclencher le plan national", ar: "إطلاق المخطط الوطني" },
  GERER_COMPTES: { fr: "Gérer les comptes", ar: "تسيير الحسابات" },
  ATTRIBUER_ROLE: { fr: "Attribuer un rôle", ar: "إسناد دور" },
  GERER_REFERENTIELS: { fr: "Gérer les référentiels", ar: "تسيير المراجع" },
  CONSULTER_JOURNAL: { fr: "Consulter le journal", ar: "الاطلاع على السجل" },
};

const MODULE_RESPONSIBLE: Permission[] = [
  "RECEVOIR_ALERTE_MODULE",
  "CONFIRMER_SIGNALEMENT",
  "FIXER_GRAVITE",
  "LANCER_INTERVENTION",
  "AFFECTER_AGENTS",
  "DEMANDER_APPUI_MODULE",
  "CLOTURER_INTERVENTION",
  "DECLARER_HORS_CONTROLE",
  "CONSULTER_MODULE",
];

const MODULE_DIRECTOR: Permission[] = [
  "RECEVOIR_ALERTE_MODULE",
  "DECLARER_HORS_CONTROLE",
  "CONSULTER_MODULE",
];

const MODULE_AGENT: Permission[] = [
  "RECEVOIR_ALERTE_MODULE",
  "INDIQUER_DISPONIBILITE",
  "SUIVRE_TACHE",
  "ENVOYER_COMPTE_RENDU",
  "CONFIRMER_PARTICIPATION",
];

const AUTHORITY: Permission[] = [
  "TRAITER_DEMANDE_DECLENCHEMENT",
  "DECLENCHER_PLAN",
  "CHANGER_PHASE",
  "LEVER_PLAN",
  "PROPOSER_ESCALADE",
  "DEMANDER_PLAN_SUPERIEUR",
  "LANCER_EXERCICE",
  "CONSULTER_PLANS_ALERTES_EFFECTIFS",
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  citizen: ["CREER_SIGNALEMENT", "SUIVRE_MON_SIGNALEMENT"],
  admin: ["GERER_COMPTES", "ATTRIBUER_ROLE", "GERER_REFERENTIELS", "CONSULTER_JOURNAL"],
  wali: AUTHORITY,
  apc_president: AUTHORITY,
  minister: [...AUTHORITY, "DECLENCHER_PLAN_NATIONAL"],
  module_agent: MODULE_AGENT,
  module_manager: MODULE_RESPONSIBLE,
  module_director: MODULE_DIRECTOR,
};

/** Groupes affichés en lecture seule dans l'écran « Rôles ». */
export const PERMISSION_GROUPS: { key: string; permissions: Permission[] }[] = [
  {
    key: "citizen",
    permissions: ["CREER_SIGNALEMENT", "SUIVRE_MON_SIGNALEMENT"],
  },
  {
    key: "module",
    permissions: [
      "RECEVOIR_ALERTE_MODULE",
      "CONFIRMER_SIGNALEMENT",
      "FIXER_GRAVITE",
      "LANCER_INTERVENTION",
      "AFFECTER_AGENTS",
      "DEMANDER_APPUI_MODULE",
      "CLOTURER_INTERVENTION",
      "DECLARER_HORS_CONTROLE",
      "CONSULTER_MODULE",
      "INDIQUER_DISPONIBILITE",
      "SUIVRE_TACHE",
      "ENVOYER_COMPTE_RENDU",
      "CONFIRMER_PARTICIPATION",
    ],
  },
  {
    key: "authority",
    permissions: AUTHORITY,
  },
  {
    key: "national",
    permissions: ["DECLENCHER_PLAN_NATIONAL"],
  },
  {
    key: "admin",
    permissions: ["GERER_COMPTES", "ATTRIBUER_ROLE", "GERER_REFERENTIELS", "CONSULTER_JOURNAL"],
  },
];

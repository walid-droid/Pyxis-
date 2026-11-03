/**
 * Catalogue unique des rôles de compte CADM v3.0 (guide master ORSEC, §2).
 * Un compte = un rôle. Le module et le territoire sont des attributs du compte.
 * Les fonctions PCO (responsable de module) et PCF (directeur de module) sont
 * désormais des rôles, et non plus des désignations.
 */

import {
  ADMIN_DASHBOARD_PATH,
  AUTHORITY_DASHBOARD_PATH,
  DASHBOARD_PATH,
  MODULE_DASHBOARD_PATH,
} from "../config";
import type { Localized } from "../data/locale";

export type Role =
  | "citizen"
  | "admin"
  | "wali"
  | "apc_president"
  | "minister"
  | "module_agent"
  | "module_manager"
  | "module_director";

export const ROLES: Role[] = [
  "citizen",
  "admin",
  "wali",
  "apc_president",
  "minister",
  "module_agent",
  "module_manager",
  "module_director",
];

/** Espace (famille d'écrans) auquel un rôle donne accès. */
export type Space = "citizen" | "admin" | "authority" | "module";

/** Famille abstraite des diagrammes UML v2.0. */
export type RoleFamily = "population" | "autorite" | "module" | "systeme";

export type TerritoryScope = "none" | "commune" | "wilaya" | "national";

export type RoleDef = {
  id: Role;
  name: Localized;
  description: Localized;
  space: Space;
  family: RoleFamily;
  /** Rattachement territorial obligatoire à la création du compte. */
  territoryScope: TerritoryScope;
  /** Le compte doit être rattaché à un module. */
  needsModule: boolean;
  sprint: string;
  tone: "neutral" | "green" | "amber" | "red" | "blue" | "violet" | "slate";
};

function def(
  id: Role,
  fr: string,
  ar: string,
  descFr: string,
  descAr: string,
  rest: Omit<RoleDef, "id" | "name" | "description">,
): RoleDef {
  return {
    id,
    name: { fr, ar },
    description: { fr: descFr, ar: descAr },
    ...rest,
  };
}

export const ROLE_DEFS: Record<Role, RoleDef> = {
  citizen: def(
    "citizen",
    "Citoyen",
    "مواطن",
    "Signale une catastrophe d'un type C1 à C10 et suit l'état de son signalement.",
    "يبلّغ عن كارثة من نوع C1 إلى C10 ويتابع حالة تبليغه.",
    {
      space: "citizen",
      family: "population",
      territoryScope: "commune",
      needsModule: false,
      sprint: "S1",
      tone: "green",
    },
  ),
  admin: def(
    "admin",
    "Administrateur système",
    "مسؤول النظام",
    "Gère les comptes, les référentiels, la matrice et consulte le journal. Aucune fonction ORSEC.",
    "يدير الحسابات والمراجع والمصفوفة ويطّلع على السجل. لا مهمة له في ORSEC.",
    {
      space: "admin",
      family: "systeme",
      territoryScope: "none",
      needsModule: false,
      sprint: "S1",
      tone: "violet",
    },
  ),
  wali: def(
    "wali",
    "Wali",
    "والي",
    "Déclenche le plan de wilaya, alerte les wilayas limitrophes et notifie le ministre.",
    "يطلق مخطط الولاية وينبّه الولايات المجاورة ويُعلم الوزير.",
    {
      space: "authority",
      family: "autorite",
      territoryScope: "wilaya",
      needsModule: false,
      sprint: "S2",
      tone: "blue",
    },
  ),
  apc_president: def(
    "apc_president",
    "Président de l'APC",
    "رئيس المجلس الشعبي البلدي",
    "Déclenche le plan communal, alerte les communes limitrophes et notifie le wali.",
    "يطلق المخطط البلدي وينبّه البلديات المجاورة ويُعلم الوالي.",
    {
      space: "authority",
      family: "autorite",
      territoryScope: "commune",
      needsModule: false,
      sprint: "S2",
      tone: "blue",
    },
  ),
  minister: def(
    "minister",
    "Ministre de l'Intérieur",
    "وزير الداخلية",
    "Déclenche le plan national dès que deux plans de wilaya sont déclenchés.",
    "يطلق المخطط الوطني بمجرد إطلاق مخططي ولاية.",
    {
      space: "authority",
      family: "autorite",
      territoryScope: "national",
      needsModule: false,
      sprint: "S2",
      tone: "blue",
    },
  ),
  module_agent: def(
    "module_agent",
    "Agent de module",
    "عون وحدة",
    "Indique sa disponibilité, suit ses tâches, confirme sa participation et envoie ses comptes rendus.",
    "يعلن جاهزيته ويتابع مهامه ويؤكد مشاركته ويرسل تقاريره.",
    {
      space: "module",
      family: "module",
      territoryScope: "commune",
      needsModule: true,
      sprint: "S3",
      tone: "green",
    },
  ),
  module_manager: def(
    "module_manager",
    "Responsable de module (PCO)",
    "مسؤول الوحدة (PCO)",
    "Confirme les signalements, lance les interventions, affecte les agents et déclare le hors-contrôle.",
    "يؤكد التبليغات ويطلق التدخلات ويكلف الأعوان ويعلن الخروج عن السيطرة.",
    {
      space: "module",
      family: "module",
      territoryScope: "commune",
      needsModule: true,
      sprint: "S3",
      tone: "amber",
    },
  ),
  module_director: def(
    "module_director",
    "Directeur de module (PCF)",
    "مدير الوحدة (PCF)",
    "Suit les signalements et interventions de son module, ses effectifs, et peut déclarer le hors-contrôle.",
    "يتابع تبليغات وتدخلات وحدته وعديدها ويمكنه إعلان الخروج عن السيطرة.",
    {
      space: "module",
      family: "module",
      territoryScope: "wilaya",
      needsModule: true,
      sprint: "S3",
      tone: "blue",
    },
  ),
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/** Page d'accueil après connexion, selon l'espace du rôle. */
export function homeForRole(role: Role): string {
  switch (ROLE_DEFS[role].space) {
    case "admin":
      return ADMIN_DASHBOARD_PATH;
    case "authority":
      return AUTHORITY_DASHBOARD_PATH;
    case "module":
      return MODULE_DASHBOARD_PATH;
    default:
      return DASHBOARD_PATH;
  }
}

export function spaceOf(role: Role): Space {
  return ROLE_DEFS[role].space;
}

export function roleName(role: Role, lang: "fr" | "ar"): string {
  return ROLE_DEFS[role].name[lang];
}

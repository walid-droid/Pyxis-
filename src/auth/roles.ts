/**
 * Catalogue unique des rôles de compte CADM (22 rôles, un seul rôle par compte).
 * Source : « Organisation des acteurs selon le plan ORSEC », tableau 14.
 * Les fonctions de crise (directeur du PCF/PCO, responsable de module…) ne sont
 * pas des rôles : ce sont des désignations (voir permissions.ts).
 */

import {
  ADMIN_DASHBOARD_PATH,
  AUTHORITY_DASHBOARD_PATH,
  DASHBOARD_PATH,
  ORG_DASHBOARD_PATH,
  SITE_DASHBOARD_PATH,
} from "../config";

export type Localized = { fr: string; ar: string };

export const ROLES = [
  "citizen",
  "farmer",
  "organism",
  "admin",
  "wali",
  "apc_president",
  "minister",
  "site_operator",
  "forecaster",
  "forestry_agent",
  "org_director",
  "unit_lead",
  "pc_lead",
  "medical_lead",
  "evac_lead",
  "pc_agent",
  "engine_chief",
  "police",
  "gendarmerie",
  "coast_guard",
  "emergency_doctor",
  "org_agent",
] as const;

export type Role = (typeof ROLES)[number];

/** Espace (famille d'écrans) auquel un rôle donne accès. */
export type Space = "citizen" | "admin" | "authority" | "site" | "organisme";

/** Regroupement utilisé par l'écran d'administration des rôles. */
export type AdminFamily = "population" | "gestion" | "autorites" | "terrain";

export type TerritoryScope = "none" | "wilaya" | "commune" | "site";

export type RoleDef = {
  id: Role;
  name: Localized;
  description: Localized;
  space: Space;
  adminFamily: AdminFamily;
  /** Rattachement territorial obligatoire à la création du compte. */
  territoryScope: TerritoryScope;
  /** Le compte doit être rattaché à un organisme. */
  needsOrganism: boolean;
  /** Sprint d'introduction du rôle. */
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
    "Signale un incident, demande de l'aide et reçoit les alertes et consignes.",
    "يبلّغ عن حادث ويطلب المساعدة ويتلقى التنبيهات والإرشادات.",
    { space: "citizen", adminFamily: "population", territoryScope: "none", needsOrganism: false, sprint: "S1", tone: "green" },
  ),
  farmer: def(
    "farmer",
    "Agriculteur",
    "فلاح",
    "Signale les dégâts touchant son exploitation et reçoit les alertes.",
    "يبلّغ عن الأضرار التي تمس مستثمرته ويتلقى التنبيهات.",
    { space: "citizen", adminFamily: "population", territoryScope: "none", needsOrganism: false, sprint: "S1", tone: "green" },
  ),
  organism: def(
    "organism",
    "Organisme (sprint 1)",
    "هيئة (السبرينت 1)",
    "Compte d'un service de secours qui confirme ou rejette les signalements. Remplacé au sprint 3 par les rôles de chaque organisme.",
    "حساب مصلحة إنقاذ تؤكد التبليغات أو ترفضها. تُستبدل في السبرينت 3 بأدوار كل هيئة.",
    { space: "organisme", adminFamily: "gestion", territoryScope: "none", needsOrganism: false, sprint: "S1", tone: "blue" },
  ),
  admin: def(
    "admin",
    "Administrateur système",
    "مسؤول النظام",
    "Gère les comptes, les rôles, les rattachements et les listes. Aucune fonction ORSEC.",
    "يدير الحسابات والأدوار والإلحاقات والقوائم. لا مهمة له في مخطط ORSEC.",
    { space: "admin", adminFamily: "gestion", territoryScope: "none", needsOrganism: false, sprint: "S1", tone: "violet" },
  ),
  wali: def(
    "wali",
    "Wali",
    "والي",
    "Autorité de la wilaya : approuve, met en état d'alerte, déclenche et lève le plan ; dirige le PCF.",
    "سلطة الولاية: يصادق على المخطط ويضعه في حالة تأهب ويطلقه ويرفعه ويقود مركز القيادة الثابت.",
    { space: "authority", adminFamily: "autorites", territoryScope: "wilaya", needsOrganism: false, sprint: "S2", tone: "blue" },
  ),
  apc_president: def(
    "apc_president",
    "Président de l'APC",
    "رئيس المجلس الشعبي البلدي",
    "Autorité de la commune : approuve, met en état d'alerte, déclenche et lève le plan communal.",
    "سلطة البلدية: يصادق على المخطط البلدي ويضعه في حالة تأهب ويطلقه ويرفعه.",
    { space: "authority", adminFamily: "autorites", territoryScope: "commune", needsOrganism: false, sprint: "S2", tone: "blue" },
  ),
  minister: def(
    "minister",
    "Ministre de l'Intérieur",
    "وزير الداخلية",
    "Autorité du plan national : met en état d'alerte, déclenche et lève le plan, voit toutes les wilayas.",
    "سلطة المخطط الوطني: يضعه في حالة تأهب ويطلقه ويرفعه ويطّلع على كل الولايات.",
    { space: "authority", adminFamily: "autorites", territoryScope: "none", needsOrganism: false, sprint: "S8", tone: "blue" },
  ),
  site_operator: def(
    "site_operator",
    "Exploitant de site sensible",
    "مستغل موقع حساس",
    "Saisit le plan de son site, le déclenche et le lève, et établit le rapport détaillé.",
    "يُدخل مخطط موقعه ويطلقه ويرفعه ويُعدّ التقرير المفصّل.",
    { space: "site", adminFamily: "autorites", territoryScope: "site", needsOrganism: false, sprint: "S8", tone: "amber" },
  ),
  forecaster: def(
    "forecaster",
    "Prévisionniste",
    "المتنبئ",
    "Cellule de veille : surveille barrages et oueds, propose les alertes de crue à l'autorité.",
    "خلية اليقظة: يراقب السدود والأودية ويقترح تنبيهات الفيضان على السلطة.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "wilaya", needsOrganism: false, sprint: "S2", tone: "amber" },
  ),
  forestry_agent: def(
    "forestry_agent",
    "Agent forestier",
    "عون غابي",
    "Cellule de veille : signale les risques forestiers, appui au module secours en cas de feu.",
    "خلية اليقظة: يبلّغ عن المخاطر الغابية ويدعم وحدة الإنقاذ عند الحرائق.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S3", tone: "green" },
  ),
  org_director: def(
    "org_director",
    "Directeur d'organisme",
    "مدير هيئة",
    "Siège au PCF, en général responsable du module de son organisme ; gère ses équipes et ses renforts.",
    "يجلس في مركز القيادة الثابت وهو عادة مسؤول وحدة هيئته؛ يدير فرقه وتعزيزاته.",
    { space: "organisme", adminFamily: "gestion", territoryScope: "wilaya", needsOrganism: true, sprint: "S3", tone: "blue" },
  ),
  unit_lead: def(
    "unit_lead",
    "Responsable d'unité",
    "مسؤول وحدة",
    "Dirige une unité sur le terrain ; représente son organisme au PCO ; demande les renforts.",
    "يقود وحدة ميدانية ويمثل هيئته في مركز القيادة العملياتي ويطلب التعزيزات.",
    { space: "organisme", adminFamily: "gestion", territoryScope: "commune", needsOrganism: true, sprint: "S3", tone: "blue" },
  ),
  pc_lead: def(
    "pc_lead",
    "Responsable de la Protection civile",
    "مسؤول الحماية المدنية",
    "Dirige le PCO sur le lieu ; saisit le plan de la commission ; demande le déclenchement du plan.",
    "يقود مركز القيادة العملياتي في الموقع ويُدخل مخطط اللجنة ويطلب إطلاق المخطط.",
    { space: "organisme", adminFamily: "gestion", territoryScope: "commune", needsOrganism: true, sprint: "S5", tone: "amber" },
  ),
  medical_lead: def(
    "medical_lead",
    "Responsable médical",
    "المسؤول الطبي",
    "Coordonne les moyens sanitaires, suit le bilan des victimes et les renforts médicaux.",
    "ينسّق الوسائل الصحية ويتابع حصيلة الضحايا والتعزيزات الطبية.",
    { space: "organisme", adminFamily: "gestion", territoryScope: "commune", needsOrganism: true, sprint: "S5", tone: "red" },
  ),
  evac_lead: def(
    "evac_lead",
    "Responsable des évacuations",
    "مسؤول الإخلاء",
    "Organise les itinéraires, les zones de rassemblement et le déplacement des populations.",
    "ينظّم المسارات ومناطق التجمع وتنقل السكان.",
    { space: "organisme", adminFamily: "gestion", territoryScope: "commune", needsOrganism: true, sprint: "S7", tone: "amber" },
  ),
  pc_agent: def(
    "pc_agent",
    "Agent de la Protection civile",
    "عون الحماية المدنية",
    "Intervient sur le terrain, suit ses missions et transmet ses comptes rendus.",
    "يتدخل ميدانياً ويتابع مهامه ويرسل تقاريره.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S3", tone: "green" },
  ),
  engine_chief: def(
    "engine_chief",
    "Chef d'engin",
    "قائد عربة",
    "Suit son véhicule, ses équipements et ses moyens de lutte.",
    "يتابع مركبته وتجهيزاته ووسائل المكافحة.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S3", tone: "green" },
  ),
  police: def(
    "police",
    "Police",
    "الشرطة",
    "Sécurise les zones, gère les accès et signale les routes bloquées.",
    "تؤمّن المناطق وتنظم المداخل وتبلّغ عن الطرق المقطوعة.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S5", tone: "slate" },
  ),
  gendarmerie: def(
    "gendarmerie",
    "Gendarmerie",
    "الدرك الوطني",
    "Mêmes missions que la police, avec son propre rôle.",
    "نفس مهام الشرطة بدور خاص بها.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S5", tone: "slate" },
  ),
  coast_guard: def(
    "coast_guard",
    "Garde-côtes",
    "حرس السواحل",
    "Intervient en mer et sur le littoral (sauvetage, sécurité), avec son propre rôle.",
    "يتدخل في البحر وعلى الساحل (إنقاذ وأمن) بدور خاص به.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S5", tone: "slate" },
  ),
  emergency_doctor: def(
    "emergency_doctor",
    "Médecin urgentiste",
    "طبيب استعجالات",
    "Enregistre les victimes et leur état clinique, signale les urgences médicales.",
    "يسجّل الضحايا وحالتهم السريرية ويبلّغ عن الاستعجالات الطبية.",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S7", tone: "red" },
  ),
  org_agent: def(
    "org_agent",
    "Agent d'organisme",
    "عون هيئة",
    "Agent d'un service rattaché à un module (travaux publics, énergie, eau, transports…).",
    "عون مصلحة مرتبطة بوحدة تدخل (الأشغال العمومية، الطاقة، المياه، النقل…).",
    { space: "organisme", adminFamily: "terrain", territoryScope: "commune", needsOrganism: true, sprint: "S3", tone: "slate" },
  ),
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Page d'accueil après connexion, selon l'espace du rôle. */
export function homeForRole(role: Role): string {
  switch (ROLE_DEFS[role].space) {
    case "admin":
      return ADMIN_DASHBOARD_PATH;
    case "authority":
      return AUTHORITY_DASHBOARD_PATH;
    case "site":
      return SITE_DASHBOARD_PATH;
    case "organisme":
      return ORG_DASHBOARD_PATH;
    default:
      return DASHBOARD_PATH;
  }
}

export function spaceOf(role: Role): Space {
  return ROLE_DEFS[role].space;
}

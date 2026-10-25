/**
 * Données de démonstration de l'espace administrateur système (S1).
 * Aucune de ces données n'est reliée à un backend : elles alimentent
 * uniquement l'interface et les interactions du prototype.
 *
 * Le catalogue de rôles suit le changement OC-02 : 18 rôles répartis en
 * quatre familles, un compte portant un seul rôle.
 */

export type BadgeTone =
  | "neutral"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "slate";

export type UserStatus = "active" | "invited" | "suspended";
export type OrgStatus = "active" | "pending" | "suspended";
export type DocumentStatus = "indexed" | "processing" | "draft";
export type DocumentCategory =
  | "procedure"
  | "plan"
  | "consignes"
  | "retour"
  | "referentiel"
  | "fiche";
export type DocumentLanguage = "fr" | "ar" | "en";
export type DocumentAudience = "public" | "agents" | "admin";
export type OrgKind =
  | "administration"
  | "protection"
  | "health"
  | "redcrescent"
  | "security"
  | "meteo"
  | "publicworks"
  | "media"
  | "ngo";

/* ------------------------------------------------------------------ */
/* Identité de l'administrateur connecté                               */
/* ------------------------------------------------------------------ */

/** Auteur attribué aux actions du prototype (aucun backend). */
export const CURRENT_ADMIN = "Amine Bensalem";

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

export type Permission = {
  id: string;
  labelKey: string;
};

export type PermissionGroup = {
  id: string;
  labelKey: string;
  permissions: Permission[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "accounts",
    labelKey: "admin.perm.group.accounts",
    permissions: [
      { id: "users.view", labelKey: "admin.perm.usersView" },
      { id: "users.manage", labelKey: "admin.perm.usersManage" },
      { id: "roles.manage", labelKey: "admin.perm.rolesManage" },
    ],
  },
  {
    id: "territories",
    labelKey: "admin.perm.group.territories",
    permissions: [
      { id: "territories.view", labelKey: "admin.perm.terrView" },
      { id: "territories.manage", labelKey: "admin.perm.terrManage" },
    ],
  },
  {
    id: "organisations",
    labelKey: "admin.perm.group.organisations",
    permissions: [
      { id: "orgs.view", labelKey: "admin.perm.orgsView" },
      { id: "orgs.manage", labelKey: "admin.perm.orgsManage" },
      { id: "orgs.link", labelKey: "admin.perm.orgsLink" },
    ],
  },
  {
    id: "configuration",
    labelKey: "admin.perm.group.configuration",
    permissions: [
      { id: "settings.view", labelKey: "admin.perm.settingsView" },
      { id: "settings.edit", labelKey: "admin.perm.settingsEdit" },
    ],
  },
  {
    id: "documents",
    labelKey: "admin.perm.group.documents",
    permissions: [
      { id: "docs.view", labelKey: "admin.perm.docsView" },
      { id: "docs.manage", labelKey: "admin.perm.docsManage" },
      { id: "docs.publish", labelKey: "admin.perm.docsPublish" },
    ],
  },
  {
    id: "operations",
    labelKey: "admin.perm.group.operations",
    permissions: [
      { id: "ops.incidents", labelKey: "admin.perm.opsIncidents" },
      { id: "ops.reports", labelKey: "admin.perm.opsReports" },
      { id: "ops.alerts", labelKey: "admin.perm.opsAlerts" },
    ],
  },
  {
    id: "audit",
    labelKey: "admin.perm.group.audit",
    permissions: [
      { id: "audit.view", labelKey: "admin.perm.auditView" },
      { id: "audit.export", labelKey: "admin.perm.auditExport" },
    ],
  },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.id),
);

export function permissionLabelKey(id: string): string {
  for (const group of PERMISSION_GROUPS) {
    const found = group.permissions.find((permission) => permission.id === id);
    if (found) return found.labelKey;
  }
  return id;
}

/* ------------------------------------------------------------------ */
/* Rôles — catalogue OC-02 (18 rôles, 4 familles)                      */
/* ------------------------------------------------------------------ */

export type RoleFamily = "population" | "gestion" | "autorites" | "terrain";

export type TerritoryScope = "none" | "wilaya" | "commune";

export const ROLE_FAMILIES: RoleFamily[] = [
  "population",
  "gestion",
  "autorites",
  "terrain",
];

export type AdminRole = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  tone: BadgeTone;
  family: RoleFamily;
  /** Territoire obligatoire lors de la création du compte. */
  territoryScope: TerritoryScope;
  permissions: string[];
  /** Rôle système : permissions non modifiables. */
  locked?: boolean;
};

export const INITIAL_ROLES: AdminRole[] = [
  /* ---------- Population ---------- */
  {
    id: "citizen",
    name: "Citoyen",
    nameAr: "مواطن",
    description:
      "Consulte les alertes, les consignes et les abris, et adresse un signalement à sa commune.",
    descriptionAr:
      "يطّلع على التنبيهات والإرشادات والمآوي، ويرسل تبليغًا إلى بلديته.",
    tone: "green",
    family: "population",
    territoryScope: "none",
    permissions: ["docs.view"],
  },
  {
    id: "farmer",
    name: "Agriculteur",
    nameAr: "فلاح",
    description:
      "Suit les vigilances météo et les consignes agricoles, et signale les dégâts sur ses parcelles.",
    descriptionAr:
      "يتابع يقظة الأرصاد وإرشادات الفلاحة، ويبلّغ عن الأضرار في مستثمرته.",
    tone: "green",
    family: "population",
    territoryScope: "commune",
    permissions: ["docs.view", "ops.reports"],
  },
  {
    id: "breeder",
    name: "Éleveur",
    nameAr: "مربّي مواشي",
    description:
      "Reçoit les consignes de protection animale et signale les pertes liées à un événement.",
    descriptionAr:
      "يتلقى إرشادات حماية الثروة الحيوانية ويبلّغ عن الخسائر المرتبطة بحدث.",
    tone: "green",
    family: "population",
    territoryScope: "commune",
    permissions: ["docs.view", "ops.reports"],
  },
  {
    id: "resident",
    name: "Riverain d'une zone à risque",
    nameAr: "ساكن منطقة معرّضة",
    description:
      "Reçoit les consignes d'évacuation et les informations propres à sa zone.",
    descriptionAr:
      "يتلقى إرشادات الإخلاء والمعلومات الخاصة بمنطقته.",
    tone: "slate",
    family: "population",
    territoryScope: "commune",
    permissions: ["docs.view", "ops.reports"],
  },

  /* ---------- Gestion ---------- */
  {
    id: "super-admin",
    name: "Administrateur système",
    nameAr: "مسؤول النظام",
    description:
      "Administre les comptes, les rôles, les territoires, les organisations et la configuration de la plateforme.",
    descriptionAr:
      "يدير الحسابات والأدوار والأقاليم والمنظمات وإعدادات المنصة.",
    tone: "violet",
    family: "gestion",
    territoryScope: "none",
    permissions: ALL_PERMISSIONS,
    locked: true,
  },
  {
    id: "crisis-manager",
    name: "Gestionnaire de crise",
    nameAr: "مسيّر الأزمات",
    description:
      "Pilote les incidents de sa wilaya, propose les canaux d'alerte et suit les moyens engagés.",
    descriptionAr:
      "يقود الحوادث في ولايته ويقترح قنوات التنبيه ويتابع الوسائل المعبأة.",
    tone: "amber",
    family: "gestion",
    territoryScope: "wilaya",
    permissions: [
      "users.view",
      "territories.view",
      "orgs.view",
      "docs.view",
      "ops.incidents",
      "ops.reports",
      "ops.alerts",
      "audit.view",
      "audit.export",
    ],
  },
  {
    id: "org-manager",
    name: "Responsable d'organisation",
    nameAr: "مسؤول منظمة",
    description:
      "Suit les comptes et les moyens de son organisation, rattachée à un module ORSEC.",
    descriptionAr:
      "يتابع حسابات ووسائل منظمته المرتبطة بوحدة ORSEC.",
    tone: "blue",
    family: "gestion",
    territoryScope: "none",
    permissions: [
      "users.view",
      "orgs.view",
      "orgs.link",
      "docs.view",
      "ops.reports",
    ],
  },
  {
    id: "analyst",
    name: "Analyste & documentation",
    nameAr: "محلّل وتوثيق",
    description:
      "Prépare les documents de l'assistant IA, contrôle leur publication et exploite le journal.",
    descriptionAr:
      "يُعدّ وثائق المساعد الذكي ويراقب نشرها ويستغل السجل.",
    tone: "violet",
    family: "gestion",
    territoryScope: "none",
    permissions: [
      "territories.view",
      "orgs.view",
      "settings.view",
      "docs.view",
      "docs.manage",
      "docs.publish",
      "audit.view",
    ],
  },
  {
    id: "protection-agent",
    name: "Agent de protection civile",
    nameAr: "عون الحماية المدنية",
    description:
      "Traite les signalements et les incidents de son territoire d'affectation.",
    descriptionAr:
      "يعالج التبليغات والحوادث في إقليم تعيينه.",
    tone: "green",
    family: "gestion",
    territoryScope: "commune",
    permissions: [
      "territories.view",
      "orgs.view",
      "docs.view",
      "ops.incidents",
      "ops.reports",
      "ops.alerts",
    ],
  },

  /* ---------- Autorités ---------- */
  {
    id: "wali",
    name: "Wali",
    nameAr: "والي",
    description:
      "Autorise les alertes de sa wilaya, valide les plans ORSEC et suit les communes.",
    descriptionAr:
      "يأذن بتنبيهات ولايته ويصادق على مخططات ORSEC ويتابع البلديات.",
    tone: "blue",
    family: "autorites",
    territoryScope: "wilaya",
    permissions: [
      "users.view",
      "territories.view",
      "territories.manage",
      "orgs.view",
      "settings.view",
      "docs.view",
      "ops.incidents",
      "ops.reports",
      "ops.alerts",
      "audit.view",
    ],
  },
  {
    id: "apc-president",
    name: "Président de l'APC",
    nameAr: "رئيس المجلس الشعبي البلدي",
    description:
      "Représente la commune, valide les consignes locales et désigne les points de rassemblement.",
    descriptionAr:
      "يمثّل البلدية ويصادق على الإرشادات المحلية ويحدد نقاط التجمع.",
    tone: "green",
    family: "autorites",
    territoryScope: "commune",
    permissions: [
      "territories.view",
      "orgs.view",
      "docs.view",
      "ops.reports",
      "ops.alerts",
    ],
  },
  {
    id: "daira-chief",
    name: "Chef de daïra",
    nameAr: "رئيس الدائرة",
    description:
      "Coordonne les communes de sa daïra et remonte les besoins au wali.",
    descriptionAr:
      "ينسّق بلديات دائرته ويرفع الاحتياجات إلى الوالي.",
    tone: "blue",
    family: "autorites",
    territoryScope: "wilaya",
    permissions: [
      "territories.view",
      "orgs.view",
      "docs.view",
      "ops.reports",
      "ops.alerts",
    ],
  },
  {
    id: "wilaya-sg",
    name: "Secrétaire général de wilaya",
    nameAr: "الأمين العام للولاية",
    description:
      "Tient à jour le référentiel territorial et le secrétariat des cellules de crise.",
    descriptionAr:
      "يحدّث المرجعية الإقليمية وأمانة خلايا الأزمات.",
    tone: "slate",
    family: "autorites",
    territoryScope: "wilaya",
    permissions: [
      "users.view",
      "territories.view",
      "orgs.view",
      "settings.view",
      "docs.view",
      "audit.view",
    ],
  },
  {
    id: "local-elected",
    name: "Élu local",
    nameAr: "منتخب محلي",
    description:
      "Suit les alertes et les besoins de la population de sa commune.",
    descriptionAr:
      "يتابع التنبيهات واحتياجات سكان بلديته.",
    tone: "green",
    family: "autorites",
    territoryScope: "commune",
    permissions: ["territories.view", "docs.view", "ops.reports"],
  },

  /* ---------- Terrain ---------- */
  {
    id: "field-agent",
    name: "Agent de terrain",
    nameAr: "عون ميداني",
    description:
      "Remonte les observations de terrain et consulte les consignes opérationnelles.",
    descriptionAr:
      "يرفع الملاحظات الميدانية ويطّلع على الإرشادات العملياتية.",
    tone: "green",
    family: "terrain",
    territoryScope: "commune",
    permissions: ["docs.view", "ops.incidents", "ops.reports"],
  },
  {
    id: "team-lead",
    name: "Chef d'équipe d'intervention",
    nameAr: "قائد فريق التدخل",
    description:
      "Encadre une équipe, met à jour les moyens engagés et signale les besoins.",
    descriptionAr:
      "يشرف على فريق ويحدّث الوسائل المعبأة ويبلّغ عن الاحتياجات.",
    tone: "green",
    family: "terrain",
    territoryScope: "commune",
    permissions: [
      "docs.view",
      "ops.incidents",
      "ops.reports",
      "ops.alerts",
    ],
  },
  {
    id: "meteorologist",
    name: "Météorologue de veille",
    nameAr: "متنبئ جوي",
    description:
      "Diffuse les vigilances météo et qualifie les événements climatiques.",
    descriptionAr:
      "ينشر يقظة الأرصاد ويصنّف الأحداث المناخية.",
    tone: "blue",
    family: "terrain",
    territoryScope: "none",
    permissions: ["docs.view", "ops.reports", "ops.alerts"],
  },
  {
    id: "observer",
    name: "Observateur",
    nameAr: "مراقب",
    description:
      "Consultation seule des référentiels territoriaux, des organisations et des documents validés.",
    descriptionAr:
      "اطلاع فقط على المرجعيات الإقليمية والمنظمات والوثائق المعتمدة.",
    tone: "slate",
    family: "terrain",
    territoryScope: "none",
    permissions: [
      "territories.view",
      "orgs.view",
      "docs.view",
      "audit.view",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Comptes                                                             */
/* ------------------------------------------------------------------ */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Un compte porte un seul rôle (OC-02). */
  roleId: string;
  permissions: string[];
  organisationId: string | null;
  wilaya: string;
  commune: string;
  status: UserStatus;
  mfa: boolean;
  lastLogin: string;
  createdAt: string;
};

export const INITIAL_USERS: AdminUser[] = [
  {
    id: "u-1",
    name: "Amine Bensalem",
    email: "amine.bensalem@cadm.dz",
    phone: "0770 12 34 56",
    roleId: "super-admin",
    permissions: [],
    organisationId: "org-cadm",
    wilaya: "Alger",
    commune: "Alger-Centre",
    status: "active",
    mfa: true,
    lastLogin: "24 oct. 2026 · 09:42",
    createdAt: "12 janv. 2026",
  },
  {
    id: "u-2",
    name: "Leïla Haddad",
    email: "l.haddad@wilaya-setif.dz",
    phone: "0661 45 87 21",
    roleId: "wali",
    permissions: [],
    organisationId: null,
    wilaya: "Sétif",
    commune: "",
    status: "active",
    mfa: true,
    lastLogin: "24 oct. 2026 · 08:15",
    createdAt: "03 févr. 2026",
  },
  {
    id: "u-3",
    name: "Karim Ziani",
    email: "k.ziani@apc-bejaia.dz",
    phone: "0555 78 90 12",
    roleId: "apc-president",
    permissions: [],
    organisationId: null,
    wilaya: "Béjaïa",
    commune: "Béjaïa",
    status: "active",
    mfa: false,
    lastLogin: "23 oct. 2026 · 17:08",
    createdAt: "18 févr. 2026",
  },
  {
    id: "u-4",
    name: "Nadia Cherif",
    email: "n.cherif@cadm.dz",
    phone: "0771 22 33 44",
    roleId: "crisis-manager",
    permissions: [],
    organisationId: "org-cadm",
    wilaya: "Alger",
    commune: "Bir Mourad Raïs",
    status: "active",
    mfa: true,
    lastLogin: "24 oct. 2026 · 07:56",
    createdAt: "05 mars 2026",
  },
  {
    id: "u-5",
    name: "Sofiane Kaci",
    email: "s.kaci@meteo.dz",
    phone: "0699 10 20 30",
    roleId: "meteorologist",
    permissions: [],
    organisationId: "org-meteo",
    wilaya: "Oran",
    commune: "Es Sénia",
    status: "invited",
    mfa: false,
    lastLogin: "—",
    createdAt: "21 oct. 2026",
  },
  {
    id: "u-6",
    name: "Yacine Meziane",
    email: "y.meziane@gendarmerie.dz",
    phone: "0660 55 44 33",
    roleId: "observer",
    permissions: [],
    organisationId: "org-gendarmerie",
    wilaya: "Constantine",
    commune: "Constantine",
    status: "suspended",
    mfa: false,
    lastLogin: "12 sept. 2026 · 14:21",
    createdAt: "20 avr. 2026",
  },
  {
    id: "u-7",
    name: "Meriem Belkacem",
    email: "m.belkacem@cadm.dz",
    phone: "0550 98 76 54",
    roleId: "org-manager",
    permissions: [],
    organisationId: "org-cadm",
    wilaya: "Skikda",
    commune: "Skikda",
    status: "active",
    mfa: true,
    lastLogin: "23 oct. 2026 · 16:40",
    createdAt: "10 mai 2026",
  },
  {
    id: "u-8",
    name: "Rachid Amrani",
    email: "r.amrani@protection-civile.dz",
    phone: "0772 11 22 33",
    roleId: "team-lead",
    permissions: ["ops.alerts"],
    organisationId: "org-protection",
    wilaya: "Tizi Ouzou",
    commune: "Tizi Ouzou",
    status: "active",
    mfa: true,
    lastLogin: "24 oct. 2026 · 10:03",
    createdAt: "22 juin 2026",
  },
  {
    id: "u-9",
    name: "Samira Ould Ali",
    email: "s.ouldali@dsp.dz",
    phone: "0663 77 88 99",
    roleId: "protection-agent",
    permissions: [],
    organisationId: "org-sante",
    wilaya: "Jijel",
    commune: "Jijel",
    status: "active",
    mfa: false,
    lastLogin: "22 oct. 2026 · 11:12",
    createdAt: "30 juil. 2026",
  },
  {
    id: "u-10",
    name: "Bilal Saidi",
    email: "b.saidi@agriculture.dz",
    phone: "0558 44 55 66",
    roleId: "farmer",
    permissions: [],
    organisationId: null,
    wilaya: "Béjaïa",
    commune: "Akbou",
    status: "invited",
    mfa: false,
    lastLogin: "—",
    createdAt: "23 oct. 2026",
  },
  {
    id: "u-11",
    name: "Souhila Benmansour",
    email: "s.benmansour@apc-akbou.dz",
    phone: "0773 65 43 21",
    roleId: "local-elected",
    permissions: [],
    organisationId: null,
    wilaya: "Béjaïa",
    commune: "Akbou",
    status: "active",
    mfa: false,
    lastLogin: "21 oct. 2026 · 15:30",
    createdAt: "02 sept. 2026",
  },
  {
    id: "u-12",
    name: "Djamel Ould Kaci",
    email: "d.ouldkaci@wilaya-skikda.dz",
    phone: "0664 12 90 45",
    roleId: "daira-chief",
    permissions: [],
    organisationId: null,
    wilaya: "Skikda",
    commune: "Azzaba",
    status: "active",
    mfa: true,
    lastLogin: "20 oct. 2026 · 13:18",
    createdAt: "14 sept. 2026",
  },
];

/* ------------------------------------------------------------------ */
/* Organisations                                                       */
/* ------------------------------------------------------------------ */

export type Organisation = {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  kind: OrgKind;
  wilaya: string;
  commune: string;
  contact: string;
  email: string;
  phone: string;
  status: OrgStatus;
  /** Module ORSEC de rattachement (modules 4 à 13). */
  moduleId: string;
  createdAt: string;
};

export const INITIAL_ORGANISATIONS: Organisation[] = [
  {
    id: "org-cadm",
    code: "CADM-ADM",
    name: "CADM · Administration",
    nameAr: "CADM · الإدارة",
    kind: "administration",
    wilaya: "Alger",
    commune: "Alger-Centre",
    contact: "Amine Bensalem",
    email: "contact@cadm.dz",
    phone: "021 00 14 00",
    status: "active",
    moduleId: "admin",
    createdAt: "12 janv. 2026",
  },
  {
    id: "org-protection",
    code: "PC-19",
    name: "Protection civile · Sétif",
    nameAr: "الحماية المدنية · سطيف",
    kind: "protection",
    wilaya: "Sétif",
    commune: "Sétif",
    contact: "Leïla Haddad",
    email: "pc.setif@protection-civile.dz",
    phone: "021 45 00 14",
    status: "active",
    moduleId: "command",
    createdAt: "03 févr. 2026",
  },
  {
    id: "org-croix-rouge",
    code: "CRA-06",
    name: "Croissant-Rouge algérien · Béjaïa",
    nameAr: "الهلال الأحمر الجزائري · بجاية",
    kind: "redcrescent",
    wilaya: "Béjaïa",
    commune: "Béjaïa",
    contact: "Karim Ziani",
    email: "cra.bejaia@croix-rouge.dz",
    phone: "034 21 45 67",
    status: "active",
    moduleId: "resources",
    createdAt: "18 févr. 2026",
  },
  {
    id: "org-meteo",
    code: "ONM",
    name: "Office national de la météorologie",
    nameAr: "الديوان الوطني للأرصاد الجوية",
    kind: "meteo",
    wilaya: "Oran",
    commune: "Es Sénia",
    contact: "Sofiane Kaci",
    email: "veille@meteo.dz",
    phone: "021 50 55 66",
    status: "active",
    moduleId: "events",
    createdAt: "05 mars 2026",
  },
  {
    id: "org-gendarmerie",
    code: "GN-25",
    name: "Gendarmerie nationale · Constantine",
    nameAr: "الدرك الوطني · قسنطينة",
    kind: "security",
    wilaya: "Constantine",
    commune: "Constantine",
    contact: "Yacine Meziane",
    email: "gn.constantine@gendarmerie.dz",
    phone: "031 92 00 17",
    status: "active",
    moduleId: "command",
    createdAt: "20 avr. 2026",
  },
  {
    id: "org-sante",
    code: "DSP-18",
    name: "Direction de la santé · Jijel",
    nameAr: "مديرية الصحة · جيجل",
    kind: "health",
    wilaya: "Jijel",
    commune: "Jijel",
    contact: "Samira Ould Ali",
    email: "dsp.jijel@sante.dz",
    phone: "034 47 11 22",
    status: "active",
    moduleId: "shelters",
    createdAt: "30 juil. 2026",
  },
  {
    id: "org-travaux",
    code: "DTP-06",
    name: "Direction des travaux publics · Béjaïa",
    nameAr: "مديرية الأشغال العمومية · بجاية",
    kind: "publicworks",
    wilaya: "Béjaïa",
    commune: "Akbou",
    contact: "Bilal Saidi",
    email: "dtp.bejaia@travaux-publics.dz",
    phone: "034 12 33 44",
    status: "pending",
    moduleId: "resources",
    createdAt: "23 oct. 2026",
  },
  {
    id: "org-radio",
    code: "RAD-21",
    name: "Radio locale · Skikda",
    nameAr: "الإذاعة المحلية · سكيكدة",
    kind: "media",
    wilaya: "Skikda",
    commune: "Skikda",
    contact: "Farid Boukhalfa",
    email: "redaction@radio-skikda.dz",
    phone: "038 70 20 20",
    status: "pending",
    moduleId: "contacts",
    createdAt: "23 oct. 2026",
  },
];

/* ------------------------------------------------------------------ */
/* Territoires                                                         */
/* ------------------------------------------------------------------ */

export type Commune = {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  population: number;
  active: boolean;
  /** Président de l'APC désigné ; null = poste vacant. */
  apcPresident: string | null;
};

export type Wilaya = {
  code: string;
  name: string;
  nameAr: string;
  region: string;
  /** Wali désigné ; null = poste vacant (alerte ORSEC). */
  wali: string | null;
  communes: Commune[];
};

/** Le référentiel livré est partiel : il sert uniquement à la démonstration. */
export const TERRITORY_DATA_SOURCE = "demo" as const;

export const REGION_KEYS = [
  "north",
  "east",
  "west",
  "center",
  "highlands",
  "south",
] as const;

export const INITIAL_WILAYAS: Wilaya[] = [
  {
    code: "06",
    name: "Béjaïa",
    nameAr: "بجاية",
    region: "north",
    wali: "Youcef Aïssaoui",
    communes: [
      { id: "c-06-01", name: "Béjaïa", nameAr: "بجاية", code: "06-01", population: 187_000, active: true, apcPresident: "Nadia Ferhat" },
      { id: "c-06-02", name: "Akbou", nameAr: "أقبو", code: "06-02", population: 52_000, active: true, apcPresident: "Mourad Saïdi" },
      { id: "c-06-03", name: "Kherrata", nameAr: "خراطة", code: "06-03", population: 38_500, active: true, apcPresident: "Slimane Brahimi" },
      { id: "c-06-04", name: "Tichy", nameAr: "تيشي", code: "06-04", population: 21_400, active: true, apcPresident: "Lamia Ouyahia" },
      { id: "c-06-05", name: "Amizour", nameAr: "أميزور", code: "06-05", population: 44_800, active: true, apcPresident: "Kamel Aït Ali" },
      { id: "c-06-06", name: "Oued Ghir", nameAr: "وادي غير", code: "06-06", population: 27_600, active: true, apcPresident: "Rachid Bennadji" },
      { id: "c-06-07", name: "El Kseur", nameAr: "القصر", code: "06-07", population: 33_200, active: true, apcPresident: "Salima Haddadi" },
      { id: "c-06-08", name: "Tazmalt", nameAr: "تازمالت", code: "06-08", population: 29_900, active: true, apcPresident: "Hocine Belkacem" },
      { id: "c-06-09", name: "Seddouk", nameAr: "صدوق", code: "06-09", population: 25_100, active: true, apcPresident: "Farid Ouali" },
    ],
  },
  {
    code: "19",
    name: "Sétif",
    nameAr: "سطيف",
    region: "highlands",
    wali: "Abdelkader Zerrouki",
    communes: [
      { id: "c-19-01", name: "Sétif", nameAr: "سطيف", code: "19-01", population: 288_000, active: true, apcPresident: "Brahim Guettaf" },
      { id: "c-19-02", name: "El Eulma", nameAr: "العلمة", code: "19-02", population: 155_000, active: true, apcPresident: "Nassim Boudjema" },
      { id: "c-19-03", name: "Aïn Oulmene", nameAr: "عين ولمان", code: "19-03", population: 81_000, active: true, apcPresident: "Rachida Meziane" },
      { id: "c-19-04", name: "Bougaa", nameAr: "بوقاعة", code: "19-04", population: 34_200, active: true, apcPresident: "Tarek Settou" },
    ],
  },
  {
    code: "21",
    name: "Skikda",
    nameAr: "سكيكدة",
    region: "east",
    wali: null,
    communes: [
      { id: "c-21-01", name: "Skikda", nameAr: "سكيكدة", code: "21-01", population: 210_000, active: true, apcPresident: "Amel Bouziane" },
      { id: "c-21-02", name: "Azzaba", nameAr: "عزابة", code: "21-02", population: 68_000, active: true, apcPresident: "Djamel Kherbache" },
      { id: "c-21-03", name: "Collo", nameAr: "القل", code: "21-03", population: 39_600, active: true, apcPresident: "Yacine Belhadj" },
      { id: "c-21-04", name: "El Harrouch", nameAr: "الحروش", code: "21-04", population: 48_700, active: true, apcPresident: "Samir Laouar" },
    ],
  },
  {
    code: "15",
    name: "Tizi Ouzou",
    nameAr: "تيزي وزو",
    region: "north",
    wali: "Hamid Belaïd",
    communes: [
      { id: "c-15-01", name: "Tizi Ouzou", nameAr: "تيزي وزو", code: "15-01", population: 148_000, active: true, apcPresident: "Noura Aït Kaci" },
      { id: "c-15-02", name: "Azazga", nameAr: "عزازقة", code: "15-02", population: 37_900, active: true, apcPresident: "Arezki Haddad" },
      { id: "c-15-03", name: "Draâ Ben Khedda", nameAr: "ذراع بن خدة", code: "15-03", population: 42_300, active: true, apcPresident: "Lynda Meziani" },
      { id: "c-15-04", name: "Tigzirt", nameAr: "تيقزيرت", code: "15-04", population: 15_600, active: false, apcPresident: null },
    ],
  },
  {
    code: "16",
    name: "Alger",
    nameAr: "الجزائر",
    region: "center",
    wali: "Kamel Bouzid",
    communes: [
      { id: "c-16-01", name: "Alger-Centre", nameAr: "الجزائر الوسطى", code: "16-01", population: 110_000, active: true, apcPresident: "Yasmina Khelifi" },
      { id: "c-16-02", name: "Bab El Oued", nameAr: "باب الوادي", code: "16-02", population: 172_000, active: true, apcPresident: "Nadir Allal" },
      { id: "c-16-03", name: "El Harrach", nameAr: "الحراش", code: "16-03", population: 96_000, active: true, apcPresident: "Sofiane Merabet" },
      { id: "c-16-04", name: "Bir Mourad Raïs", nameAr: "بئر مراد رايس", code: "16-04", population: 58_000, active: true, apcPresident: "Amine Cherifi" },
    ],
  },
  {
    code: "25",
    name: "Constantine",
    nameAr: "قسنطينة",
    region: "east",
    wali: "Rachid Temim",
    communes: [
      { id: "c-25-01", name: "Constantine", nameAr: "قسنطينة", code: "25-01", population: 465_000, active: true, apcPresident: "Salim Boudraa" },
      { id: "c-25-02", name: "El Khroub", nameAr: "الخروب", code: "25-02", population: 179_000, active: true, apcPresident: "Hakim Benkhelifa" },
      { id: "c-25-03", name: "Aïn Smara", nameAr: "عين السمارة", code: "25-03", population: 42_500, active: true, apcPresident: null },
    ],
  },
  {
    code: "31",
    name: "Oran",
    nameAr: "وهران",
    region: "west",
    wali: "Mouloud Benali",
    communes: [
      { id: "c-31-01", name: "Oran", nameAr: "وهران", code: "31-01", population: 650_000, active: true, apcPresident: "Nabil Kaddour" },
      { id: "c-31-02", name: "Es Sénia", nameAr: "السانية", code: "31-02", population: 92_000, active: true, apcPresident: "Fouzia Hamdi" },
      { id: "c-31-03", name: "Bir El Djir", nameAr: "بئر الجير", code: "31-03", population: 171_000, active: true, apcPresident: "Mehdi Benaissa" },
      { id: "c-31-04", name: "Aïn El Turk", nameAr: "عين الترك", code: "31-04", population: 41_000, active: true, apcPresident: "Karim Belkhadem" },
    ],
  },
  {
    code: "18",
    name: "Jijel",
    nameAr: "جيجل",
    region: "east",
    wali: "Bachir Lounis",
    communes: [
      { id: "c-18-01", name: "Jijel", nameAr: "جيجل", code: "18-01", population: 134_000, active: true, apcPresident: "Souad Benazouz" },
      { id: "c-18-02", name: "Taher", nameAr: "الطاهير", code: "18-02", population: 78_000, active: true, apcPresident: "Riad Bouhali" },
      { id: "c-18-03", name: "El Milia", nameAr: "الميلية", code: "18-03", population: 82_000, active: true, apcPresident: null },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Configuration : gravité, événements, modules                        */
/* ------------------------------------------------------------------ */

export type SeverityLevel = {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  min: number;
  max: number;
  slaMinutes: number;
  /** Canaux proposés à la validation (RG02), pas de diffusion automatique. */
  channels: string[];
  active: boolean;
  description: string;
  descriptionAr: string;
};

export const INITIAL_SEVERITIES: SeverityLevel[] = [
  {
    id: "low",
    name: "Faible",
    nameAr: "منخفضة",
    color: "#16704a",
    min: 1,
    max: 25,
    slaMinutes: 240,
    channels: [],
    active: true,
    description:
      "Surveillance simple : aucun canal n'est proposé, la diffusion reste soumise à validation.",
    descriptionAr:
      "مراقبة بسيطة: لا تُقترح أي قناة، ويبقى البثّ رهينًا بالموافقة.",
  },
  {
    id: "medium",
    name: "Moyenne",
    nameAr: "متوسطة",
    color: "#2563eb",
    min: 26,
    max: 50,
    slaMinutes: 120,
    channels: ["push"],
    active: true,
    description:
      "Notification push proposée aux équipes d'astreinte, puis validée par une personne habilitée.",
    descriptionAr:
      "يُقترح إشعار فوري لفرق المناوبة، ثم يصادق عليه شخص مؤهل.",
  },
  {
    id: "high",
    name: "Élevée",
    nameAr: "مرتفعة",
    color: "#d97706",
    min: 51,
    max: 75,
    slaMinutes: 30,
    channels: ["push", "sms", "radio"],
    active: true,
    description:
      "Canaux push, SMS et radio proposés à la validation du gestionnaire de crise.",
    descriptionAr:
      "تُقترح قنوات الإشعار والرسالة النصية والإذاعة لمصادقة مسيّر الأزمات.",
  },
  {
    id: "critical",
    name: "Critique",
    nameAr: "حرجة",
    color: "#b42318",
    min: 76,
    max: 100,
    slaMinutes: 10,
    channels: ["push", "sms", "radio", "email"],
    active: true,
    description:
      "Cellule de crise de la wilaya (ou PCF) : tous les canaux sont proposés, sans diffusion automatique.",
    descriptionAr:
      "خلية أزمة الولاية (أو مركز القيادة): تُقترح كل القنوات دون بثّ تلقائي.",
  },
];

export type EventType = {
  id: string;
  name: string;
  nameAr: string;
  severity: string;
  moduleId: string;
  active: boolean;
  incidents: number;
};

export const INITIAL_EVENT_TYPES: EventType[] = [
  { id: "flood", name: "Inondation", nameAr: "فيضان", severity: "high", moduleId: "alerts", active: true, incidents: 34 },
  { id: "fire", name: "Incendie", nameAr: "حريق", severity: "critical", moduleId: "incidents", active: true, incidents: 27 },
  { id: "earthquake", name: "Séisme", nameAr: "زلزال", severity: "critical", moduleId: "incidents", active: true, incidents: 6 },
  { id: "storm", name: "Tempête", nameAr: "عاصفة", severity: "medium", moduleId: "alerts", active: true, incidents: 19 },
  { id: "heatwave", name: "Canicule", nameAr: "موجة حرارة", severity: "medium", moduleId: "alerts", active: true, incidents: 11 },
  { id: "chemical", name: "Risque chimique", nameAr: "خطر كيميائي", severity: "high", moduleId: "incidents", active: true, incidents: 3 },
  { id: "accident", name: "Accident", nameAr: "حادث", severity: "medium", moduleId: "reports", active: true, incidents: 22 },
  { id: "landslide", name: "Glissement de terrain", nameAr: "انهيار أرضي", severity: "high", moduleId: "map", active: true, incidents: 8 },
  { id: "epidemic", name: "Épidémie", nameAr: "وباء", severity: "high", moduleId: "reports", active: false, incidents: 0 },
  { id: "other", name: "Autre", nameAr: "أخرى", severity: "low", moduleId: "reports", active: true, incidents: 5 },
];

export type AdminModule = {
  id: string;
  index: number;
  nameKey: string;
  descriptionKey: string;
  level: "core" | "standard" | "optional";
  enabled: boolean;
  roles: number;
  /** Module de la plateforme ou module d'un site sensible. */
  scope: "platform" | "site";
};

export const INITIAL_MODULES: AdminModule[] = [
  { id: "alerts", index: 1, nameKey: "admin.module.alerts", descriptionKey: "admin.module.alertsDesc", level: "core", enabled: true, roles: 5, scope: "platform" },
  { id: "reports", index: 2, nameKey: "admin.module.reports", descriptionKey: "admin.module.reportsDesc", level: "core", enabled: true, roles: 6, scope: "platform" },
  { id: "incidents", index: 3, nameKey: "admin.module.incidents", descriptionKey: "admin.module.incidentsDesc", level: "core", enabled: true, roles: 5, scope: "platform" },
  { id: "map", index: 4, nameKey: "admin.module.map", descriptionKey: "admin.module.mapDesc", level: "core", enabled: true, roles: 6, scope: "platform" },
  { id: "command", index: 5, nameKey: "admin.module.command", descriptionKey: "admin.module.commandDesc", level: "standard", enabled: true, roles: 4, scope: "platform" },
  { id: "resources", index: 6, nameKey: "admin.module.resources", descriptionKey: "admin.module.resourcesDesc", level: "standard", enabled: true, roles: 4, scope: "platform" },
  { id: "shelters", index: 7, nameKey: "admin.module.shelters", descriptionKey: "admin.module.sheltersDesc", level: "standard", enabled: true, roles: 6, scope: "platform" },
  { id: "consignes", index: 8, nameKey: "admin.module.consignes", descriptionKey: "admin.module.consignesDesc", level: "standard", enabled: true, roles: 6, scope: "platform" },
  { id: "assistant", index: 9, nameKey: "admin.module.assistant", descriptionKey: "admin.module.assistantDesc", level: "standard", enabled: true, roles: 3, scope: "platform" },
  { id: "events", index: 10, nameKey: "admin.module.events", descriptionKey: "admin.module.eventsDesc", level: "optional", enabled: true, roles: 6, scope: "platform" },
  { id: "contacts", index: 11, nameKey: "admin.module.contacts", descriptionKey: "admin.module.contactsDesc", level: "optional", enabled: true, roles: 6, scope: "platform" },
  { id: "journal", index: 12, nameKey: "admin.module.journal", descriptionKey: "admin.module.journalDesc", level: "standard", enabled: true, roles: 4, scope: "platform" },
  { id: "admin", index: 13, nameKey: "admin.module.admin", descriptionKey: "admin.module.adminDesc", level: "core", enabled: true, roles: 2, scope: "platform" },
  { id: "site-registry", index: 1, nameKey: "admin.module.siteRegistry", descriptionKey: "admin.module.siteRegistryDesc", level: "core", enabled: true, roles: 3, scope: "site" },
  { id: "site-risks", index: 2, nameKey: "admin.module.siteRisks", descriptionKey: "admin.module.siteRisksDesc", level: "core", enabled: true, roles: 3, scope: "site" },
  { id: "site-means", index: 3, nameKey: "admin.module.siteMeans", descriptionKey: "admin.module.siteMeansDesc", level: "standard", enabled: true, roles: 2, scope: "site" },
  { id: "site-plans", index: 4, nameKey: "admin.module.sitePlans", descriptionKey: "admin.module.sitePlansDesc", level: "core", enabled: true, roles: 2, scope: "site" },
  { id: "site-drills", index: 5, nameKey: "admin.module.siteDrills", descriptionKey: "admin.module.siteDrillsDesc", level: "optional", enabled: true, roles: 2, scope: "site" },
];

/** Modules ORSEC auxquels une organisation peut être rattachée (4 à 13). */
export const ORSEC_MODULE_IDS = INITIAL_MODULES.filter(
  (module) =>
    module.scope === "platform" && module.index >= 4 && module.index <= 13,
).map((module) => module.id);

/* ------------------------------------------------------------------ */
/* Documents de l'assistant IA                                         */
/* ------------------------------------------------------------------ */

export type AiDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  language: DocumentLanguage;
  audience: DocumentAudience;
  /** Version du document publié. */
  version: string;
  sizeMb: number;
  chunks: number;
  status: DocumentStatus;
  published: boolean;
  updatedAt: string;
  owner: string;
  tags: string[];
  excerpt: string;
};

export const INITIAL_DOCUMENTS: AiDocument[] = [
  {
    id: "doc-1",
    title: "Plan ORSEC — Wilaya de Béjaïa",
    category: "plan",
    language: "fr",
    audience: "agents",
    version: "v4.2",
    sizeMb: 4.2,
    chunks: 186,
    status: "indexed",
    published: true,
    updatedAt: "24 oct. 2026",
    owner: "CADM · Administration",
    tags: ["ORSEC", "évacuation", "wilaya 06"],
    excerpt:
      "Le plan ORSEC de la wilaya de Béjaïa organise la réponse aux risques majeurs : incendies de forêt, inondations et séismes. Il précise les centres de commandement, les itinéraires d'évacuation et la répartition des moyens entre les communes.",
  },
  {
    id: "doc-2",
    title: "Consignes de sécurité — Risques sismiques",
    category: "consignes",
    language: "fr",
    audience: "public",
    version: "v2.0",
    sizeMb: 1.1,
    chunks: 42,
    status: "indexed",
    published: true,
    updatedAt: "22 oct. 2026",
    owner: "Protection civile",
    tags: ["séisme", "population", "réflexes"],
    excerpt:
      "Avant la secousse : fixez les meubles, préparez un kit d'urgence et repérez les points de rassemblement. Pendant la secousse : abritez-vous sous une table solide, protégez votre tête et éloignez-vous des fenêtres.",
  },
  {
    id: "doc-3",
    title: "دليل الإخلاء في حالات الفيضان",
    category: "consignes",
    language: "ar",
    audience: "public",
    version: "v1.3",
    sizeMb: 2.4,
    chunks: 74,
    status: "indexed",
    published: true,
    updatedAt: "20 oct. 2026",
    owner: "الهلال الأحمر الجزائري",
    tags: ["فيضان", "إخلاء", "عربية"],
    excerpt:
      "لا تدخل الطرق المغمورة بالمياه، واصعد إلى المناطق المرتفعة. اتبع مسارات الإخلاء المعلنة وانتظر تعليمات السلطات المحلية قبل العودة إلى منزلك.",
  },
  {
    id: "doc-4",
    title: "Fiches réflexes — Incendies de forêt",
    category: "fiche",
    language: "fr",
    audience: "agents",
    version: "v1.1",
    sizeMb: 0.9,
    chunks: 31,
    status: "indexed",
    published: true,
    updatedAt: "18 oct. 2026",
    owner: "Protection civile",
    tags: ["incendie", "forêt", "agents"],
    excerpt:
      "Fiche opérationnelle destinée aux équipes terrain : lecture du vent, établissement des lisières, protection des habitations et coordination avec les moyens aériens.",
  },
  {
    id: "doc-5",
    title: "Guide de communication de crise",
    category: "procedure",
    language: "fr",
    audience: "admin",
    version: "v3.0",
    sizeMb: 1.8,
    chunks: 58,
    status: "indexed",
    published: true,
    updatedAt: "16 oct. 2026",
    owner: "CADM · Administration",
    tags: ["communication", "médias", "messages"],
    excerpt:
      "Ce guide définit les principes de rédaction des alertes officielles : clarté, zone concernée, consignes à tenir, canaux de diffusion et fréquence de mise à jour.",
  },
  {
    id: "doc-6",
    title: "Retour d'expérience — Inondations d'Azzaba",
    category: "retour",
    language: "fr",
    audience: "agents",
    version: "v0.9",
    sizeMb: 3.6,
    chunks: 112,
    status: "processing",
    published: false,
    updatedAt: "24 oct. 2026",
    owner: "Protection civile",
    tags: ["RETEX", "inondation", "Skikda"],
    excerpt:
      "Analyse des délais d'alerte, de la coordination inter-services et de l'occupation des centres d'hébergement lors des inondations d'octobre 2025 à Azzaba.",
  },
  {
    id: "doc-7",
    title: "Référentiel des modules CADM",
    category: "referentiel",
    language: "fr",
    audience: "admin",
    version: "v2.4",
    sizeMb: 0.6,
    chunks: 24,
    status: "indexed",
    published: true,
    updatedAt: "12 oct. 2026",
    owner: "CADM · Administration",
    tags: ["modules", "référentiel", "configuration"],
    excerpt:
      "Description fonctionnelle des treize modules de la plateforme, des cinq modules d'un site sensible, de leurs rôles associés et des dépendances entre alertes, incidents et ressources.",
  },
  {
    id: "doc-8",
    title: "Emergency contact directory — Coastal wilayas",
    category: "procedure",
    language: "en",
    audience: "agents",
    version: "v0.4",
    sizeMb: 0.4,
    chunks: 18,
    status: "draft",
    published: false,
    updatedAt: "11 oct. 2026",
    owner: "CADM · Administration",
    tags: ["contacts", "coast", "english"],
    excerpt:
      "Directory of operational contact points for the coastal wilayas, including civil protection units, hospitals and local crisis cells.",
  },
  {
    id: "doc-9",
    title: "Décret exécutif n° 19-59 — Gestion des risques majeurs",
    category: "referentiel",
    language: "fr",
    audience: "admin",
    version: "v1.0",
    sizeMb: 0.3,
    chunks: 16,
    status: "indexed",
    published: true,
    updatedAt: "09 oct. 2026",
    owner: "Journal officiel",
    tags: ["décret 19-59", "cadre juridique", "ORSEC"],
    excerpt:
      "Cadre juridique de la gestion des risques majeurs : obligations des wilayas et des communes, élaboration des plans ORSEC, information préventive et exercices de sécurité. Texte indexé pour l'assistant IA.",
  },
];

/* ------------------------------------------------------------------ */
/* Journal d'administration                                            */
/* ------------------------------------------------------------------ */

export type ActivityTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "slate";

export type ActivityCategory =
  | "accounts"
  | "roles"
  | "territories"
  | "organisations"
  | "settings"
  | "documents"
  | "security";

export type ActivityEntry = {
  id: string;
  actionKey: string;
  target: string;
  /** Auteur de l'action (compte administrateur). */
  author: string;
  category: ActivityCategory;
  /** Motif obligatoire pour les actions sensibles. */
  detail?: string;
  tone: ActivityTone;
  at: number;
};

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "accounts",
  "roles",
  "territories",
  "organisations",
  "settings",
  "documents",
  "security",
];

const now = Date.now();
const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: "act-1",
    actionKey: "admin.act.userCreated",
    target: "Bilal Saidi",
    author: CURRENT_ADMIN,
    category: "accounts",
    tone: "green",
    at: now - 42 * minute,
  },
  {
    id: "act-2",
    actionKey: "admin.act.documentPublished",
    target: "Décret exécutif n° 19-59",
    author: "Meriem Belkacem",
    category: "documents",
    tone: "blue",
    at: now - 95 * minute,
  },
  {
    id: "act-3",
    actionKey: "admin.act.orgApproved",
    target: "Protection civile · Sétif",
    author: CURRENT_ADMIN,
    category: "organisations",
    tone: "green",
    at: now - 140 * minute,
  },
  {
    id: "act-4",
    actionKey: "admin.act.userRoleChanged",
    target: "Rachid Amrani",
    author: CURRENT_ADMIN,
    category: "accounts",
    detail:
      "Passage du rôle Observateur au rôle Chef d'équipe d'intervention pour la wilaya de Tizi Ouzou.",
    tone: "amber",
    at: now - 3 * hour,
  },
  {
    id: "act-5",
    actionKey: "admin.act.severityUpdated",
    target: "Élevée",
    author: "Nadia Cherif",
    category: "settings",
    tone: "amber",
    at: now - 5 * hour,
  },
  {
    id: "act-6",
    actionKey: "admin.act.userSuspended",
    target: "Yacine Meziane",
    author: CURRENT_ADMIN,
    category: "security",
    detail:
      "Suspension demandée par la hiérarchie : compte sans MFA et accès non utilisé depuis 40 jours.",
    tone: "red",
    at: now - day,
  },
  {
    id: "act-7",
    actionKey: "admin.act.communeCreated",
    target: "Oued Ghir · Béjaïa",
    author: "Souhila Benmansour",
    category: "territories",
    tone: "green",
    at: now - day - 2 * hour,
  },
  {
    id: "act-8",
    actionKey: "admin.act.moduleEnabled",
    target: "admin.module.assistant",
    author: CURRENT_ADMIN,
    category: "settings",
    tone: "violet",
    at: now - 2 * day,
  },
  {
    id: "act-9",
    actionKey: "admin.act.orgLinked",
    target: "Samira Ould Ali · Direction de la santé · Jijel",
    author: CURRENT_ADMIN,
    category: "organisations",
    tone: "green",
    at: now - 3 * day,
  },
  {
    id: "act-10",
    actionKey: "admin.act.documentIndexed",
    target: "Plan ORSEC — Wilaya de Béjaïa",
    author: "Meriem Belkacem",
    category: "documents",
    tone: "blue",
    at: now - 4 * day,
  },
  {
    id: "act-11",
    actionKey: "admin.act.roleUpdated",
    target: "Gestionnaire de crise",
    author: CURRENT_ADMIN,
    category: "roles",
    tone: "violet",
    at: now - 5 * day,
  },
  {
    id: "act-12",
    actionKey: "admin.act.orgRejected",
    target: "Association locale · Annaba",
    author: CURRENT_ADMIN,
    category: "organisations",
    detail: "Document d'habilitation manquant.",
    tone: "red",
    at: now - 6 * day,
  },
];

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

export function wilayaByName(
  wilayas: Wilaya[],
  name: string,
): Wilaya | undefined {
  return wilayas.find((wilaya) => wilaya.name === name);
}

export function communeNames(wilayas: Wilaya[], wilayaName: string): string[] {
  return (
    wilayaByName(wilayas, wilayaName)?.communes.map((commune) => commune.name) ??
    []
  );
}

/** Rôles nécessitant une wilaya ou une commune à la création du compte. */
export function roleRequiresWilaya(role: AdminRole | undefined): boolean {
  return role?.territoryScope === "wilaya" || role?.territoryScope === "commune";
}

export function roleRequiresCommune(role: AdminRole | undefined): boolean {
  return role?.territoryScope === "commune";
}

export function formatPopulation(population: number, lang: string): string {
  return new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "fr-DZ").format(
    population,
  );
}

export function formatFileSize(mb: number, lang: string): string {
  return `${new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
    maximumFractionDigits: 1,
  }).format(mb)} ${lang === "ar" ? "ميغابايت" : "Mo"}`;
}

export function formatTime(at: number, lang: string): string {
  return new Date(at).toLocaleTimeString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** Date et heure au format 24 h, avec l'auteur affiché séparément. */
export function formatDateTime(at: number, lang: string): string {
  const locale = lang === "ar" ? "ar-DZ" : "fr-DZ";
  const date = new Date(at);
  const dayLabel = date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${dayLabel} · ${formatTime(at, lang)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

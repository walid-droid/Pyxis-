/* =========================================================
   Domaine du plan ORSEC.
   Source : décret exécutif n° 19-59 (art. 22 à 48),
   cahier des charges BF17, règles RG-O01 à RG-O20.
   ========================================================= */

export type PlanLevel = "commune" | "wilaya" | "national" | "site";

/** États du plan : saisi → approuvé → alerte → déclenché → levé. */
export type PlanStatus = "draft" | "pending" | "approved" | "alert" | "active";

export type PlanPhase = "urgence" | "evaluation" | "rehabilitation";

export type Readiness = "ready" | "partial" | "missing";

/** Les 13 modules d'intervention du décret (art. 43). */
export type ModuleId =
  | "securite"
  | "secours"
  | "sante"
  | "materiaux"
  | "communication"
  | "travaux"
  | "telecom"
  | "transports"
  | "humanitaire"
  | "energie"
  | "eau"
  | "hebergement"
  | "expertises";

export type OrsecModule = {
  id: ModuleId;
  index: number;
  nameKey: string;
  orgKey: string;
};

export const ORSEC_MODULES: OrsecModule[] = [
  { id: "securite", index: 1, nameKey: "orsec.module.securite", orgKey: "orsec.moduleOrg.securite" },
  { id: "secours", index: 2, nameKey: "orsec.module.secours", orgKey: "orsec.moduleOrg.secours" },
  { id: "sante", index: 3, nameKey: "orsec.module.sante", orgKey: "orsec.moduleOrg.sante" },
  { id: "materiaux", index: 4, nameKey: "orsec.module.materiaux", orgKey: "orsec.moduleOrg.materiaux" },
  { id: "communication", index: 5, nameKey: "orsec.module.communication", orgKey: "orsec.moduleOrg.communication" },
  { id: "travaux", index: 6, nameKey: "orsec.module.travaux", orgKey: "orsec.moduleOrg.travaux" },
  { id: "telecom", index: 7, nameKey: "orsec.module.telecom", orgKey: "orsec.moduleOrg.telecom" },
  { id: "transports", index: 8, nameKey: "orsec.module.transports", orgKey: "orsec.moduleOrg.transports" },
  { id: "humanitaire", index: 9, nameKey: "orsec.module.humanitaire", orgKey: "orsec.moduleOrg.humanitaire" },
  { id: "energie", index: 10, nameKey: "orsec.module.energie", orgKey: "orsec.moduleOrg.energie" },
  { id: "eau", index: 11, nameKey: "orsec.module.eau", orgKey: "orsec.moduleOrg.eau" },
  { id: "hebergement", index: 12, nameKey: "orsec.module.hebergement", orgKey: "orsec.moduleOrg.hebergement" },
  { id: "expertises", index: 13, nameKey: "orsec.module.expertises", orgKey: "orsec.moduleOrg.expertises" },
];

/** Les 5 modules d'un plan de site sensible (cahier des charges BF17). */
export const SITE_MODULE_IDS: ModuleId[] = [
  "secours",
  "securite",
  "sante",
  "communication",
  "travaux",
];

/** Modules applicables à un niveau de plan (13 pour commune/wilaya, 5 pour un site). */
export function modulesForLevel(level: PlanLevel): OrsecModule[] {
  if (level === "site") {
    return ORSEC_MODULES.filter((module) => SITE_MODULE_IDS.includes(module.id));
  }
  return ORSEC_MODULES;
}

export type Person = {
  id: string;
  name: string;
  orgKey: string;
  territory: string;
};

/** Annuaire de démonstration : tous rattachés au territoire du plan. */
export const PEOPLE: Person[] = [
  { id: "p-pc", name: "Colonel A. Mansouri", orgKey: "orsec.org.protectionCivile", territory: "Béjaïa" },
  { id: "p-gendarmerie", name: "Capitaine F. Ould", orgKey: "orsec.org.gendarmerie", territory: "Béjaïa" },
  { id: "p-police", name: "Commissaire T. Saidi", orgKey: "orsec.org.police", territory: "Béjaïa" },
  { id: "p-sante", name: "Dr L. Benali", orgKey: "orsec.org.sante", territory: "Béjaïa" },
  { id: "p-materiaux", name: "M. B. Hamdi", orgKey: "orsec.org.materiaux", territory: "Béjaïa" },
  { id: "p-communication", name: "Mme N. Cherif", orgKey: "orsec.org.communication", territory: "Béjaïa" },
  { id: "p-travaux", name: "M. K. Zidane", orgKey: "orsec.org.travauxPublics", territory: "Béjaïa" },
  { id: "p-telecom", name: "M. S. Brahimi", orgKey: "orsec.org.telecom", territory: "Béjaïa" },
  { id: "p-transports", name: "M. R. Amrani", orgKey: "orsec.org.transports", territory: "Béjaïa" },
  { id: "p-humanitaire", name: "Mme S. Kaci", orgKey: "orsec.org.humanitaire", territory: "Béjaïa" },
  { id: "p-energie", name: "M. Y. Boudiaf", orgKey: "orsec.org.energie", territory: "Béjaïa" },
  { id: "p-eau", name: "Mme H. Taleb", orgKey: "orsec.org.eau", territory: "Béjaïa" },
  { id: "p-hebergement", name: "M. H. Meziane", orgKey: "orsec.org.education", territory: "Béjaïa" },
  { id: "p-expertises", name: "Mme A. Lounis", orgKey: "orsec.org.expertises", territory: "Béjaïa" },
];

/** Responsable proposé par défaut pour chaque module. */
const DEFAULT_PERSON: Record<ModuleId, string> = {
  securite: "p-police",
  secours: "p-pc",
  sante: "p-sante",
  materiaux: "p-materiaux",
  communication: "p-communication",
  travaux: "p-travaux",
  telecom: "p-telecom",
  transports: "p-transports",
  humanitaire: "p-humanitaire",
  energie: "p-energie",
  eau: "p-eau",
  hebergement: "p-hebergement",
  expertises: "p-expertises",
};

export type Designation = {
  id: string;
  moduleId: ModuleId;
  personId: string;
  personName: string;
  orgKey: string;
  since: string;
  by: string;
};

export type PlanModule = {
  id: ModuleId;
  readiness: Readiness;
};

export type ActivationReason = "occurrence" | "insufficient" | "complementary";

export type Activation = {
  id: string;
  at: string;
  by: string;
  reason: ActivationReason;
  incidentIds: number[];
  moduleIds: ModuleId[];
  phase: PlanPhase;
  pcf: boolean;
  pco: boolean;
  recipients: string[];
};

export type PlanReport = {
  id: string;
  reference: string;
  createdAt: string;
  status: "draft" | "sent";
  recipientKey: string;
  sentAt?: string;
};

export type PlanLog = {
  id: string;
  at: string;
  actionKey: string;
  subjectKey?: string;
  subject?: string;
};

export type OrsecPlan = {
  id: PlanLevel;
  level: PlanLevel;
  scopeKey: string;
  reference: string;
  version: string;
  status: PlanStatus;
  phase: PlanPhase | null;
  approvedBy: string | null;
  approvedAt: string | null;
  revisionDue: string;
  modules: PlanModule[];
  designations: Designation[];
  activation: Activation | null;
  liftedAt: string | null;
  reports: PlanReport[];
  log: PlanLog[];
};

/* ------------------------------------------------------------------ */
/* Règles du domaine                                                   */
/* ------------------------------------------------------------------ */

/** RG-O14 : le plan national n'a pas d'approbation propre. */
export function levelRequiresApproval(level: PlanLevel): boolean {
  return level !== "national";
}

/** RG-O03 : PCF et PCO pour un plan de wilaya ou de commune uniquement. */
export function levelOpensPosts(level: PlanLevel): boolean {
  return level === "commune" || level === "wilaya";
}

/** RG-O17 : les modules concernés sont choisis sauf pour le plan national. */
export function levelSelectsModules(level: PlanLevel): boolean {
  return level !== "national";
}

/** Destinataires informés au déclenchement (RG-O02, RG-O19). */
export function recipientsFor(level: PlanLevel): string[] {
  switch (level) {
    case "commune":
      return ["orsec.recipient.wali", "orsec.recipient.pc"];
    case "wilaya":
      return [
        "orsec.recipient.minister",
        "orsec.recipient.pc",
        "orsec.recipient.limitrophes",
      ];
    case "national":
      return ["orsec.recipient.walis"];
    case "site":
      return [
        "orsec.recipient.apc",
        "orsec.recipient.wali",
        "orsec.recipient.pc",
      ];
  }
}

/** Index de l'étape courante dans le cycle de vie. */
export function currentStepIndex(plan: OrsecPlan): number {
  if (plan.liftedAt) return 4;
  switch (plan.status) {
    case "draft":
    case "pending":
      return 0;
    case "approved":
      return levelRequiresApproval(plan.level) ? 1 : 2;
    case "alert":
      return 2;
    case "active":
      return 3;
  }
}

/** Une étape est-elle sans objet pour ce niveau de plan ? */
export function isStepSkipped(plan: OrsecPlan, step: number): boolean {
  if (step === 1) return !levelRequiresApproval(plan.level);
  if (step === 2) return plan.level === "site";
  return false;
}

export function responsibleFor(
  plan: OrsecPlan,
  moduleId: ModuleId,
): Designation | undefined {
  return plan.designations.find((item) => item.moduleId === moduleId);
}

export function designatedCount(plan: OrsecPlan): number {
  const ids = new Set(plan.designations.map((item) => item.moduleId));
  return modulesForLevel(plan.level).filter((module) => ids.has(module.id))
    .length;
}

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

const READINESS: Record<ModuleId, Readiness> = {
  securite: "ready",
  secours: "ready",
  sante: "ready",
  materiaux: "partial",
  communication: "ready",
  travaux: "ready",
  telecom: "partial",
  transports: "ready",
  humanitaire: "ready",
  energie: "ready",
  eau: "ready",
  hebergement: "partial",
  expertises: "missing",
};

type PlanSeed = {
  reference: string;
  version: string;
  status: PlanStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  revisionDue: string;
  since: string;
  designatedBy: string;
  designated: ModuleId[];
  log: PlanLog[];
};

function buildPlan(level: PlanLevel, seed: PlanSeed): OrsecPlan {
  const designations: Designation[] = seed.designated.map((moduleId) => {
    const person = PEOPLE.find((item) => item.id === DEFAULT_PERSON[moduleId]);
    return {
      id: `des-${level}-${moduleId}`,
      moduleId,
      personId: person?.id ?? DEFAULT_PERSON[moduleId],
      personName: person?.name ?? "—",
      orgKey: person?.orgKey ?? "orsec.org.materiaux",
      since: seed.since,
      by: seed.designatedBy,
    };
  });

  return {
    id: level,
    level,
    scopeKey: `orsec.level.${level}Scope`,
    reference: seed.reference,
    version: seed.version,
    status: seed.status,
    phase: null,
    approvedBy: seed.approvedBy,
    approvedAt: seed.approvedAt,
    revisionDue: seed.revisionDue,
    modules: modulesForLevel(level).map((module) => ({
      id: module.id,
      readiness: READINESS[module.id],
    })),
    designations,
    activation: null,
    liftedAt: null,
    reports: [],
    log: seed.log,
  };
}

const ALL_MODULES: ModuleId[] = ORSEC_MODULES.map((module) => module.id);

/** Plans initiaux : un par niveau, dans l'état prévu par le décret. */
export function initialPlans(): Record<PlanLevel, OrsecPlan> {
  return {
    commune: buildPlan("commune", {
      reference: "ORSEC-06-2026",
      version: "v3.1",
      status: "approved",
      approvedBy: "Président de l'APC de Béjaïa",
      approvedAt: "12/01/2026",
      revisionDue: "janvier 2028",
      since: "12/01/2026",
      designatedBy: "Président de l'APC de Béjaïa",
      designated: ALL_MODULES.filter(
        (id) => id !== "telecom" && id !== "expertises",
      ),
      log: [
        {
          id: "log-commune-2",
          at: "12/01/2026 · 10:15",
          actionKey: "orsec.log.approved",
          subject: "Président de l'APC de Béjaïa",
        },
        {
          id: "log-commune-1",
          at: "08/01/2026 · 09:30",
          actionKey: "orsec.log.created",
          subjectKey: "orsec.level.commune",
        },
      ],
    }),
    wilaya: buildPlan("wilaya", {
      reference: "ORSEC-15-2026",
      version: "v4.2",
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      revisionDue: "mars 2031",
      since: "20/10/2026",
      designatedBy: "Commission ORSEC",
      designated: ALL_MODULES.filter(
        (id) =>
          id !== "materiaux" && id !== "telecom" && id !== "expertises",
      ),
      log: [
        {
          id: "log-wilaya-2",
          at: "22/10/2026 · 16:40",
          actionKey: "orsec.log.submitted",
          subject: "Commission ORSEC · Protection civile",
        },
        {
          id: "log-wilaya-1",
          at: "20/10/2026 · 09:10",
          actionKey: "orsec.log.created",
          subjectKey: "orsec.level.wilaya",
        },
      ],
    }),
    national: buildPlan("national", {
      reference: "ORSEC-NAT-2026",
      version: "v2.0",
      status: "approved",
      approvedBy: null,
      approvedAt: null,
      revisionDue: "—",
      since: "—",
      designatedBy: "—",
      designated: [],
      log: [
        {
          id: "log-national-1",
          at: "05/01/2026 · 08:00",
          actionKey: "orsec.log.created",
          subjectKey: "orsec.level.national",
        },
      ],
    }),
    site: buildPlan("site", {
      reference: "POI-ARZEW-2026",
      version: "v3.2",
      status: "approved",
      approvedBy: "Wali de Béjaïa",
      approvedAt: "04/02/2026",
      revisionDue: "février 2028",
      since: "04/02/2026",
      designatedBy: "Exploitant du site",
      designated: SITE_MODULE_IDS.filter((id) => id !== "travaux"),
      log: [
        {
          id: "log-site-2",
          at: "04/02/2026 · 11:20",
          actionKey: "orsec.log.approved",
          subject: "Wali de Béjaïa",
        },
        {
          id: "log-site-1",
          at: "28/01/2026 · 14:05",
          actionKey: "orsec.log.created",
          subjectKey: "orsec.level.site",
        },
      ],
    }),
  };
}

/** Incidents de démonstration proposés au déclenchement. */
export const DEMO_INCIDENTS: { id: number; key: string; place: string }[] = [
  { id: 1, key: "orsec.incident.forest", place: "Béjaïa, Gouraya" },
  { id: 2, key: "orsec.incident.flood", place: "Béjaïa, Oued Soummam" },
  { id: 3, key: "orsec.incident.quake", place: "Béjaïa, El Kseur" },
  { id: 4, key: "orsec.incident.landslide", place: "Béjaïa, RN26" },
  { id: 5, key: "orsec.incident.gas", place: "Béjaïa, zone industrielle" },
];

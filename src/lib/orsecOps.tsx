/**
 * État opérationnel partagé du prototype ORSEC : main courante, réquisitions,
 * secteurs PCO, PMA, communications publiques, réhabilitation, conformité,
 * HAZMAT, allocations et passation de garde.
 *
 * Aucun backend : les données sont conservées dans localStorage pour que la
 * démonstration survive à un rechargement et que le mode hors-ligne soit réel.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Localized } from "../auth/roles";
import type { ModuleId } from "../pages/shared/plan/orsecPlan";

export type Scope = "pcf" | "pco" | "sector" | "module" | "authority" | "terrain";

export type MainCouranteCategory =
  | "alerte"
  | "operation"
  | "victime"
  | "moyen"
  | "decision"
  | "communication"
  | "rehabilitation";

export type MainCouranteEntry = {
  id: string;
  at: string;
  authorName: string;
  assignmentId: string;
  role: string;
  scope: Scope;
  sectorId?: string;
  category: MainCouranteCategory;
  message: string;
  coordinates?: [number, number];
  attachments?: { id: string; name: string; kind: "photo" | "pdf" | "audio" }[];
  amendmentOf?: string;
  prevHash: string;
  hash: string;
  syncStatus: "local" | "synced";
};

export type RequisitionState =
  | "draft"
  | "signed"
  | "notified"
  | "acknowledged"
  | "in_progress"
  | "completed"
  | "refused"
  | "timeout"
  | "cancelled";

export type Requisition = {
  id: string;
  ref: string;
  moduleId: ModuleId;
  resource: Localized;
  owner: Localized;
  ownerNin: string;
  location: Localized;
  start: string;
  end: string;
  compensation: string;
  status: RequisitionState;
  createdAt: string;
  signedAt?: string;
  notifiedAt?: string;
  acknowledgedAt?: string;
  completedAt?: string;
  signatureHash?: string;
  note?: string;
  timeoutAt?: string;
  fallbackOf?: string;
  timeoutSeconds: number;
  history: { at: string; status: RequisitionState; by: string; note?: string }[];
};

export type PcoSector = {
  id: string;
  name: Localized;
  commander: string;
  level: "central" | "advanced";
  status: "open" | "consolidated" | "closed";
  teams: number;
  victims: number;
  lastRollupAt: string;
};

export type TriageColor = "red" | "yellow" | "green" | "black";

export type PmaPatient = {
  id: string;
  name: string;
  age: number;
  triage: TriageColor;
  location: Localized;
  hospital?: string;
  updatedAt: string;
};

export type TacticalTeam = {
  id: string;
  name: string;
  kind: Localized;
  status: "available" | "engaged" | "out";
  incidentId?: string;
  sectorId: string;
};

export type TacticalIncident = {
  id: string;
  name: Localized;
  priority: 1 | 2 | 3;
  sectorId: string;
};

export type PublicMessage = {
  id: string;
  title: Localized;
  body: Localized;
  zone: Localized;
  channel: "push" | "sms" | "public" | "all";
  status: "draft" | "scheduled" | "published";
  publishedAt?: string;
  reach: number;
  acknowledgements: number;
};

export type Rumor = {
  id: string;
  claim: Localized;
  source: string;
  status: "checking" | "confirmed" | "denied";
  response?: Localized;
  at: string;
};

export type DamageAssessment = {
  id: string;
  ref: string;
  commune: Localized;
  building: string;
  inspection: "green" | "orange" | "red";
  households: number;
  amount: number;
  status: "draft" | "validated" | "transmitted";
  at: string;
};

export type DebrisSite = {
  id: string;
  name: Localized;
  kind: "collection" | "deposit";
  zone: Localized;
  tonnage: number;
  scheduled: string;
  status: "planned" | "in_progress" | "done";
  environment: "ok" | "watch";
};

export type ComplianceItem = {
  id: string;
  label: Localized;
  due: string;
  status: "planned" | "done" | "late";
  evidence?: string;
};

export type FicheItem = {
  id: string;
  number: number;
  name: Localized;
  status: "missing" | "partial" | "complete";
  updatedAt?: string;
};

export type HazmatEvent = {
  id: string;
  product: Localized;
  windDirection: number;
  windSpeed: number;
  radius: number;
  updatedAt: string;
  active: boolean;
};

export type Handover = {
  id: string;
  from: string;
  to: string;
  at: string;
  notes: string;
  signature: string;
};

export type SiteBasculement = {
  active: boolean;
  at?: string;
  threshold?: string;
  people?: number;
  means?: string;
  by?: string;
};

export type VictimSummary = {
  dead: number;
  injured: number;
  missing: number;
};

export type ShelterSummary = {
  open: number;
  capacity: number;
  occupied: number;
};

export type BedSummary = {
  available: number;
  total: number;
};

type Conflict = {
  id: string;
  entryId: string;
  fieldMessage: string;
  pcfMessage: string;
  status: "open" | "resolved";
  winner?: "field" | "pcf";
};

type OpsContextValue = {
  entries: MainCouranteEntry[];
  conflicts: Conflict[];
  addEntry: (input: {
    at?: string;
    authorName: string;
    assignmentId: string;
    role: string;
    scope: Scope;
    sectorId?: string;
    category: MainCouranteCategory;
    message: string;
    coordinates?: [number, number];
    attachments?: MainCouranteEntry["attachments"];
    offline?: boolean;
  }) => MainCouranteEntry;
  addAmendment: (entryId: string, message: string, authorName: string) => void;
  syncPending: () => number;
  verifyChain: () => boolean;
  raiseConflict: (entryId: string, pcfMessage: string) => void;
  resolveConflict: (id: string, winner: "field" | "pcf") => void;

  requisitions: Requisition[];
  createRequisition: (
    input: Omit<
      Requisition,
      "id" | "ref" | "status" | "createdAt" | "history" | "timeoutSeconds"
    > & { timeoutSeconds?: number },
  ) => Requisition;
  signRequisition: (id: string, by: string) => void;
  notifyRequisition: (id: string, by: string) => void;
  acknowledgeRequisition: (id: string, by: string) => void;
  completeRequisition: (id: string, by: string) => void;
  refuseRequisition: (id: string, by: string, note: string) => void;
  cancelRequisition: (id: string, by: string, note: string) => void;
  forceTimeout: (id: string) => void;

  sectors: PcoSector[];
  consolidateSector: (id: string) => void;
  patients: PmaPatient[];
  updateTriage: (id: string, triage: TriageColor) => void;
  addPatient: (input: Omit<PmaPatient, "id" | "updatedAt">) => void;

  teams: TacticalTeam[];
  incidents: TacticalIncident[];
  allocate: (
    teamId: string,
    incidentId: string,
  ) => { ok: boolean; reason?: "engaged" | "out"; conflictIncident?: string };
  releaseTeam: (teamId: string) => void;

  messages: PublicMessage[];
  publishMessage: (id: string) => void;
  scheduleMessage: (id: string) => void;
  createMessage: (
    input: Omit<PublicMessage, "id" | "status" | "reach" | "acknowledgements" | "publishedAt">,
  ) => void;
  rumors: Rumor[];
  resolveRumor: (id: string, status: Rumor["status"], response: string) => void;

  damages: DamageAssessment[];
  addDamage: (
    input: Omit<DamageAssessment, "id" | "ref" | "at" | "status">,
  ) => void;
  validateDamage: (id: string) => void;
  transmitDamage: (id: string) => void;
  debris: DebrisSite[];
  addDebris: (input: Omit<DebrisSite, "id">) => void;
  updateDebris: (id: string, status: DebrisSite["status"]) => void;

  compliance: ComplianceItem[];
  toggleCompliance: (id: string) => void;
  fiches: FicheItem[];
  attachFiche: (id: string) => void;

  hazmat: HazmatEvent;
  updateHazmat: (
    product: string,
    windDirection: number,
    windSpeed: number,
    productAr?: string,
  ) => void;
  toggleHazmat: () => void;

  handovers: Handover[];
  createHandover: (from: string, to: string, notes: string) => void;

  siteBasculement: SiteBasculement;
  declareBasculement: (threshold: string, people: number, means: string, by: string) => void;

  victims: VictimSummary;
  updateVictims: (patch: Partial<VictimSummary>) => void;
  shelters: ShelterSummary;
  beds: BedSummary;

  degraded: boolean;
  setDegraded: (value: boolean) => void;
  pendingCount: number;
};

const OpsContext = createContext<OpsContextValue | null>(null);

const STORAGE_KEYS = {
  entries: "cadm-orsec-main-courante",
  requisitions: "cadm-orsec-requisitions",
  messages: "cadm-orsec-messages",
  rumors: "cadm-orsec-rumors",
  damages: "cadm-orsec-damages",
  debris: "cadm-orsec-debris",
  compliance: "cadm-orsec-compliance",
  hazmat: "cadm-orsec-hazmat",
  handovers: "cadm-orsec-handovers",
  site: "cadm-orsec-site-basculement",
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState<T>(
  key: string,
  fallback: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Stockage indisponible : la démonstration reste en mémoire.
    }
  }, [key, value]);
  return [value, setValue];
}

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}

function nowLabel(): string {
  return new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Accepte l'ISO et l'ancien libellé « 30/10/2026 · 08:45 ». */
function isTimeoutDue(value?: string): boolean {
  if (!value) return false;
  let timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    const match = value.match(
      /(\d{2})\/(\d{2})\/(\d{4})(?:\s*[·]\s*|\s+)(\d{2}):(\d{2})/,
    );
    if (match) {
      timestamp = new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1]),
        Number(match[4]),
        Number(match[5]),
      ).getTime();
    }
  }
  return !Number.isNaN(timestamp) && Date.now() >= timestamp;
}

export function hashText(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function sealEntry(
  prevHash: string,
  entry: Omit<MainCouranteEntry, "prevHash" | "hash">,
): MainCouranteEntry {
  const hash = hashText(
    `${prevHash}|${entry.id}|${entry.at}|${entry.authorName}|${entry.category}|${entry.message}`,
  );
  return { ...entry, prevHash, hash };
}

function seedEntries(): MainCouranteEntry[] {
  const base: Omit<MainCouranteEntry, "prevHash" | "hash">[] = [
    {
      id: "mc-1",
      at: "30/10/2026 · 08:20",
      authorName: "Commandant R. Amrani",
      assignmentId: "aff-pc",
      role: "pc_lead",
      scope: "pco",
      sectorId: "sector-central",
      category: "alerte",
      message:
        "Montée des eaux sur la Soummam, secteur d'Akbou. Deux équipes engagées, périmètre établi.",
      coordinates: [36.45, 4.53],
      syncStatus: "synced",
    },
    {
      id: "mc-2",
      at: "30/10/2026 · 08:24",
      authorName: "Wali de Béjaïa",
      assignmentId: "aff-wilaya",
      role: "wali",
      scope: "pcf",
      category: "decision",
      message:
        "Pré-alerte confirmée. Les 13 modules sont invités à vérifier leurs moyens et à accuser réception.",
      syncStatus: "synced",
    },
    {
      id: "mc-3",
      at: "30/10/2026 · 08:31",
      authorName: "Capitaine S. Haddad",
      assignmentId: "aff-unite",
      role: "unit_lead",
      scope: "sector",
      sectorId: "sector-akbou",
      category: "operation",
      message:
        "Reconnaissance effectuée : route RN26 coupée au niveau du pont, déviation par la RN12.",
      coordinates: [36.42, 4.54],
      attachments: [{ id: "att-1", name: "RN26_coupure.jpg", kind: "photo" }],
      syncStatus: "synced",
    },
    {
      id: "mc-4",
      at: "30/10/2026 · 08:40",
      authorName: "Dr L. Benali",
      assignmentId: "aff-medical",
      role: "medical_lead",
      scope: "pco",
      category: "victime",
      message:
        "PMA ouvert : 6 rouges, 11 jaunes, 18 verts. Deux évacuations vers l'hôpital de Béjaïa.",
      syncStatus: "synced",
    },
  ];

  let prevHash = "GENESIS";
  const sealed: MainCouranteEntry[] = [];
  for (const entry of [...base].reverse()) {
    const next = sealEntry(prevHash, entry);
    sealed.push(next);
    prevHash = next.hash;
  }
  return sealed.reverse();
}

const SEED_REQUISITIONS: Requisition[] = [
  {
    id: "req-1",
    ref: "REQ-2026-041",
    moduleId: "travaux",
    resource: { fr: "Bulldozer Caterpillar 320", ar: "جرافة كاتربيلر 320" },
    owner: { fr: "ETB Amrani", ar: "مؤسسة عمراني" },
    ownerNin: "109 224 331 08",
    location: { fr: "Akbou · RN26", ar: "أقبو · الطريق الوطنية 26" },
    start: "30/10/2026 09:00",
    end: "30/10/2026 18:00",
    compensation: "Barème Art. 70 · 45 000 DA/jour",
    status: "draft",
    createdAt: "30/10/2026 · 08:45",
    timeoutSeconds: 15,
    history: [
      {
        at: "30/10/2026 · 08:45",
        status: "draft",
        by: "M. K. Zidane · module Travaux publics",
      },
    ],
  },
  {
    id: "req-2",
    ref: "REQ-2026-040",
    moduleId: "energie",
    resource: { fr: "Groupe électrogène 100 kVA", ar: "مولد كهربائي 100 كفأ" },
    owner: { fr: "Sonelgaz · parc de Béjaïa", ar: "سونلغاز · حظيرة بجاية" },
    ownerNin: "—",
    location: { fr: "Hôpital de Béjaïa", ar: "مستشفى بجاية" },
    start: "30/10/2026 08:00",
    end: "31/10/2026 08:00",
    compensation: "Mise à disposition publique",
    status: "signed",
    createdAt: "30/10/2026 · 07:55",
    signedAt: "30/10/2026 · 08:05",
    signatureHash: "9ac41b2e",
    timeoutSeconds: 15,
    history: [
      {
        at: "30/10/2026 · 07:55",
        status: "draft",
        by: "M. Y. Boudiaf · module Énergie",
      },
      {
        at: "30/10/2026 · 08:05",
        status: "signed",
        by: "Wali de Béjaïa",
      },
    ],
  },
  {
    id: "req-3",
    ref: "REQ-2026-039",
    moduleId: "transports",
    resource: { fr: "3 bus de 50 places", ar: "3 حافلات بسعة 50 مقعداً" },
    owner: { fr: "Direction des transports", ar: "مديرية النقل" },
    ownerNin: "—",
    location: { fr: "Centre d'accueil · Akbou", ar: "مركز الاستقبال · أقبو" },
    start: "30/10/2026 09:30",
    end: "30/10/2026 20:00",
    compensation: "Carburant + chauffeurs",
    status: "notified",
    createdAt: "30/10/2026 · 08:20",
    signedAt: "30/10/2026 · 08:25",
    signatureHash: "3de90a17",
    notifiedAt: "30/10/2026 · 08:30",
    timeoutAt: "30/10/2026 · 08:45",
    timeoutSeconds: 15,
    history: [
      {
        at: "30/10/2026 · 08:20",
        status: "draft",
        by: "M. R. Amrani · module Transports",
      },
      {
        at: "30/10/2026 · 08:25",
        status: "signed",
        by: "Wali de Béjaïa",
      },
      {
        at: "30/10/2026 · 08:30",
        status: "notified",
        by: "PCF · cellule réquisitions",
      },
    ],
  },
];

const SEED_SECTORS: PcoSector[] = [
  {
    id: "sector-central",
    name: { fr: "PCO central · Béjaïa", ar: "مركز العمليات المركزي · بجاية" },
    commander: "Commandant R. Amrani",
    level: "central",
    status: "open",
    teams: 8,
    victims: 35,
    lastRollupAt: "30/10/2026 · 08:42",
  },
  {
    id: "sector-akbou",
    name: { fr: "PCO avancé · Akbou", ar: "مركز العمليات المتقدم · أقبو" },
    commander: "Capitaine S. Haddad",
    level: "advanced",
    status: "consolidated",
    teams: 4,
    victims: 18,
    lastRollupAt: "30/10/2026 · 08:38",
  },
  {
    id: "sector-gouraya",
    name: { fr: "PCO avancé · Gouraya", ar: "مركز العمليات المتقدم · قورايا" },
    commander: "Cne N. Cherif",
    level: "advanced",
    status: "open",
    teams: 3,
    victims: 4,
    lastRollupAt: "30/10/2026 · 08:35",
  },
];

const SEED_PATIENTS: PmaPatient[] = [
  { id: "pma-1", name: "A. B.", age: 34, triage: "red", location: { fr: "Akbou", ar: "أقبو" }, updatedAt: "08:22" },
  { id: "pma-2", name: "M. K.", age: 67, triage: "red", location: { fr: "Oued Ghir", ar: "واد غير" }, hospital: "CHU Béjaïa", updatedAt: "08:26" },
  { id: "pma-3", name: "S. T.", age: 12, triage: "yellow", location: { fr: "Akbou", ar: "أقبو" }, updatedAt: "08:28" },
  { id: "pma-4", name: "R. H.", age: 45, triage: "yellow", location: { fr: "Sidi Aïch", ar: "سيدي عيش" }, updatedAt: "08:31" },
  { id: "pma-5", name: "N. A.", age: 29, triage: "green", location: { fr: "Béjaïa", ar: "بجاية" }, updatedAt: "08:33" },
  { id: "pma-6", name: "Inconnu", age: 0, triage: "black", location: { fr: "RN26", ar: "الطريق الوطنية 26" }, updatedAt: "08:36" },
];

const SEED_TEAMS: TacticalTeam[] = [
  { id: "team-1", name: "CM06", kind: { fr: "Colonne mobile", ar: "قافلة متنقلة" }, status: "engaged", incidentId: "inc-flood", sectorId: "sector-akbou" },
  { id: "team-2", name: "CM03", kind: { fr: "Colonne mobile", ar: "قافلة متنقلة" }, status: "engaged", incidentId: "inc-fire", sectorId: "sector-gouraya" },
  { id: "team-3", name: "SAMU-1", kind: { fr: "Ambulance médicalisée", ar: "إسعاف طبي" }, status: "available", sectorId: "sector-central" },
  { id: "team-4", name: "TP-12", kind: { fr: "Bulldozer", ar: "جرافة" }, status: "available", sectorId: "sector-akbou" },
  { id: "team-5", name: "PC-04", kind: { fr: "Poste de commandement", ar: "مركز قيادة" }, status: "out", sectorId: "sector-central" },
];

const SEED_INCIDENTS: TacticalIncident[] = [
  { id: "inc-flood", name: { fr: "Crue de la Soummam", ar: "فيضان سومام" }, priority: 1, sectorId: "sector-akbou" },
  { id: "inc-fire", name: { fr: "Feu de Gouraya", ar: "حريق قورايا" }, priority: 2, sectorId: "sector-gouraya" },
  { id: "inc-gas", name: { fr: "Fuite de gaz · zone industrielle", ar: "تسرب غاز · المنطقة الصناعية" }, priority: 1, sectorId: "sector-central" },
];

const SEED_MESSAGES: PublicMessage[] = [
  {
    id: "msg-1",
    title: { fr: "Consignes de sécurité — crue de la Soummam", ar: "إرشادات السلامة — فيضان سومام" },
    body: {
      fr: "Évitez les abords de l'oued, ne traversez pas les routes inondées et rejoignez le centre d'accueil le plus proche. Les équipes de secours sont mobilisées.",
      ar: "ابتعدوا عن ضفاف الوادي، لا تعبروا الطرق المغمورة بالمياه، وتوجهوا إلى أقرب مركز استقبال. فرق الإنقاذ مجندة.",
    },
    zone: { fr: "Béjaïa · Akbou · Oued Ghir", ar: "بجاية · أقبو · واد غير" },
    channel: "all",
    status: "published",
    publishedAt: "30/10/2026 · 08:30",
    reach: 12400,
    acknowledgements: 8930,
  },
  {
    id: "msg-2",
    title: { fr: "Routes coupées — RN26", ar: "طرق مغلقة — الطريق الوطنية 26" },
    body: {
      fr: "La RN26 est coupée au niveau du pont d'Akbou. Déviation par la RN12. Prévoyez des délais supplémentaires.",
      ar: "الطريق الوطنية 26 مغلقة عند جسر أقبو. تحويل عبر الطريق الوطنية 12. توقعوا تأخيراً.",
    },
    zone: { fr: "Akbou · RN26", ar: "أقبو · الطريق الوطنية 26" },
    channel: "public",
    status: "draft",
    reach: 0,
    acknowledgements: 0,
  },
];

const SEED_RUMORS: Rumor[] = [
  {
    id: "rumor-1",
    claim: { fr: "Le pont d'Akbou aurait cédé.", ar: "جسر أقبو انهار." },
    source: "Réseaux sociaux",
    status: "denied",
    response: {
      fr: "Information démentie : le pont est fermé pour contrôle, il n'a pas cédé.",
      ar: "تم نفي المعلومة: الجسر مغلق للمراقبة ولم ينهار.",
    },
    at: "30/10/2026 · 08:50",
  },
  {
    id: "rumor-2",
    claim: { fr: "Une deuxième vague est annoncée pour ce soir.", ar: "موجة ثانية متوقعة هذا المساء." },
    source: "Message vocal",
    status: "checking",
    at: "30/10/2026 · 09:05",
  },
];

const SEED_DAMAGES: DamageAssessment[] = [
  { id: "dmg-1", ref: "DOM-2026-001", commune: { fr: "Akbou", ar: "أقبو" }, building: "École primaire Ibn Sina", inspection: "orange", households: 0, amount: 1800000, status: "validated", at: "30/10/2026" },
  { id: "dmg-2", ref: "DOM-2026-002", commune: { fr: "Oued Ghir", ar: "واد غير" }, building: "12 logements · cité des oliviers", inspection: "red", households: 12, amount: 5400000, status: "draft", at: "30/10/2026" },
  { id: "dmg-3", ref: "DOM-2026-003", commune: { fr: "Béjaïa", ar: "بجاية" }, building: "Atelier mécanique", inspection: "green", households: 0, amount: 240000, status: "transmitted", at: "29/10/2026" },
];

const SEED_DEBRIS: DebrisSite[] = [
  { id: "deb-1", name: { fr: "Point de collecte · Akbou centre", ar: "نقطة جمع · وسط أقبو" }, kind: "collection", zone: { fr: "Akbou", ar: "أقبو" }, tonnage: 320, scheduled: "31/10/2026", status: "in_progress", environment: "ok" },
  { id: "deb-2", name: { fr: "Site de dépôt · Oued Ghir", ar: "موقع إيداع · واد غير" }, kind: "deposit", zone: { fr: "Oued Ghir", ar: "واد غير" }, tonnage: 780, scheduled: "02/11/2026", status: "planned", environment: "watch" },
];

const SEED_COMPLIANCE: ComplianceItem[] = [
  { id: "comp-1", label: { fr: "Exercice annuel ORSEC 2026 · inondation", ar: "تمرين ORSEC السنوي 2026 · فيضان" }, due: "15/11/2026", status: "planned" },
  { id: "comp-2", label: { fr: "Deuxième exercice annuel · feu de forêt", ar: "التمرين السنوي الثاني · حريق غابة" }, due: "20/05/2027", status: "planned" },
  { id: "comp-3", label: { fr: "Révision du plan de wilaya", ar: "مراجعة مخطط الولاية" }, due: "mars 2031", status: "planned" },
  { id: "comp-4", label: { fr: "Mise à jour des contacts des 13 modules", ar: "تحديث جهات اتصال الوحدات 13" }, due: "30/11/2026", status: "done", evidence: "Annuaire v4.2" },
  { id: "comp-5", label: { fr: "Inventaire des moyens stratégiques", ar: "جرد الوسائل الاستراتيجية" }, due: "15/10/2026", status: "late" },
];

const SEED_FICHES: FicheItem[] = [
  { id: "f-1", number: 1, name: { fr: "Fiche 01 · Risque inondation", ar: "البطاقة 01 · خطر الفيضان" }, status: "complete", updatedAt: "12/01/2026" },
  { id: "f-2", number: 2, name: { fr: "Fiche 02 · Risque sismique", ar: "البطاقة 02 · الخطر الزلزالي" }, status: "complete", updatedAt: "12/01/2026" },
  { id: "f-3", number: 3, name: { fr: "Fiche 03 · Risque feux de forêt", ar: "البطاقة 03 · خطر حرائق الغابات" }, status: "partial", updatedAt: "03/2026" },
  { id: "f-4", number: 4, name: { fr: "Fiche 04 · BMS et veille", ar: "البطاقة 04 · النشرات الجوية واليقظة" }, status: "complete", updatedAt: "10/2026" },
  { id: "f-5", number: 5, name: { fr: "Fiche 05 · Annuaire des modules", ar: "البطاقة 05 · دليل الوحدات" }, status: "complete", updatedAt: "10/2026" },
  { id: "f-6", number: 6, name: { fr: "Fiche 06 · Moyens et engins", ar: "البطاقة 06 · الوسائل والآليات" }, status: "partial", updatedAt: "09/2026" },
  { id: "f-7", number: 7, name: { fr: "Fiche 07 · Établissements sensibles", ar: "البطاقة 07 · المؤسسات الحساسة" }, status: "complete", updatedAt: "08/2026" },
  { id: "f-8", number: 8, name: { fr: "Fiche 08 · Mobilisation", ar: "البطاقة 08 · التعبئة" }, status: "partial" },
  { id: "f-9", number: 9, name: { fr: "Fiche 09 · Évacuation", ar: "البطاقة 09 · الإخلاء" }, status: "complete", updatedAt: "07/2026" },
  { id: "f-10", number: 10, name: { fr: "Fiche 10 · Hébergement", ar: "البطاقة 10 · الإيواء" }, status: "missing" },
  { id: "f-11", number: 11, name: { fr: "Fiche 11 · Information du public", ar: "البطاقة 11 · إعلام الجمهور" }, status: "partial" },
];

const SEED_HAZMAT: HazmatEvent = {
  id: "hazmat-1",
  product: { fr: "Chlore · zone industrielle", ar: "كلور · المنطقة الصناعية" },
  windDirection: 240,
  windSpeed: 18,
  radius: 840,
  updatedAt: "30/10/2026 · 08:45",
  active: true,
};

export function OrsecOpsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useStoredState(STORAGE_KEYS.entries, seedEntries());
  const [requisitions, setRequisitions] = useStoredState(
    STORAGE_KEYS.requisitions,
    SEED_REQUISITIONS,
  );
  const [messages, setMessages] = useStoredState(STORAGE_KEYS.messages, SEED_MESSAGES);
  const [rumors, setRumors] = useStoredState(STORAGE_KEYS.rumors, SEED_RUMORS);
  const [damages, setDamages] = useStoredState(STORAGE_KEYS.damages, SEED_DAMAGES);
  const [debris, setDebris] = useStoredState(STORAGE_KEYS.debris, SEED_DEBRIS);
  const [compliance, setCompliance] = useStoredState(
    STORAGE_KEYS.compliance,
    SEED_COMPLIANCE,
  );
  const [hazmat, setHazmat] = useStoredState(STORAGE_KEYS.hazmat, SEED_HAZMAT);
  const [handovers, setHandovers] = useStoredState<Handover[]>(
    STORAGE_KEYS.handovers,
    [],
  );
  const [siteBasculement, setSiteBasculement] = useStoredState<SiteBasculement>(
    STORAGE_KEYS.site,
    { active: false },
  );
  const [fiches, setFiches] = useState<FicheItem[]>(SEED_FICHES);
  const [sectors, setSectors] = useState<PcoSector[]>(SEED_SECTORS);
  const [patients, setPatients] = useState<PmaPatient[]>(SEED_PATIENTS);
  const [teams, setTeams] = useState<TacticalTeam[]>(SEED_TEAMS);
  const [conflicts, setConflicts] = useState<Conflict[]>([
    {
      id: "conflict-1",
      entryId: "mc-3",
      fieldMessage: "RN26 coupée au niveau du pont, déviation par la RN12.",
      pcfMessage: "RN26 praticable, circulation rétablie à 08:25.",
      status: "open",
    },
  ]);
  const [victims, setVictims] = useState<VictimSummary>({
    dead: 3,
    injured: 27,
    missing: 4,
  });
  const [shelters] = useState<ShelterSummary>({
    open: 6,
    capacity: 480,
    occupied: 312,
  });
  const [beds] = useState<BedSummary>({ available: 42, total: 180 });
  const [degraded, setDegraded] = useState(false);

  const addEntry = useCallback<OpsContextValue["addEntry"]>(
    (input) => {
      const prevHash = entries[0]?.hash ?? "GENESIS";
      const entry = sealEntry(prevHash, {
        id: nextId("mc"),
        at: input.at ?? nowLabel(),
        authorName: input.authorName,
        assignmentId: input.assignmentId,
        role: input.role,
        scope: input.scope,
        sectorId: input.sectorId,
        category: input.category,
        message: input.message,
        coordinates: input.coordinates,
        attachments: input.attachments,
        syncStatus:
          input.offline || (typeof navigator !== "undefined" && !navigator.onLine)
            ? "local"
            : "synced",
      });
      setEntries((current) => [entry, ...current]);
      return entry;
    },
    [entries, setEntries],
  );

  const addAmendment = useCallback<OpsContextValue["addAmendment"]>(
    (entryId, message, authorName) => {
      setEntries((current) => {
        const target = current.find((entry) => entry.id === entryId);
        if (!target) return current;
        const prevHash = current[0]?.hash ?? "GENESIS";
        const entry = sealEntry(prevHash, {
          id: nextId("mc"),
          at: nowLabel(),
          authorName,
          assignmentId: "aff-amendment",
          role: "authority",
          scope: target.scope,
          sectorId: target.sectorId,
          category: "decision",
          message,
          amendmentOf: entryId,
          syncStatus:
            typeof navigator !== "undefined" && !navigator.onLine
              ? "local"
              : "synced",
        });
        return [entry, ...current];
      });
    },
    [setEntries],
  );

  const syncPending = useCallback(() => {
    let count = 0;
    setEntries((current) =>
      current.map((entry) => {
        if (entry.syncStatus !== "local") return entry;
        count += 1;
        return { ...entry, syncStatus: "synced" };
      }),
    );
    return count;
  }, [setEntries]);

  const verifyChain = useCallback(() => {
    const oldestFirst = [...entries].reverse();
    let prevHash = "GENESIS";
    for (const entry of oldestFirst) {
      if (entry.prevHash !== prevHash) return false;
      const expected = hashText(
        `${entry.prevHash}|${entry.id}|${entry.at}|${entry.authorName}|${entry.category}|${entry.message}`,
      );
      if (entry.hash !== expected) return false;
      prevHash = entry.hash;
    }
    return true;
  }, [entries]);

  const raiseConflict = useCallback(
    (entryId: string, pcfMessage: string) => {
      const source = entries.find((entry) => entry.id === entryId);
      setConflicts((current) => [
        ...current,
        {
          id: nextId("conflict"),
          entryId,
          fieldMessage: source?.message ?? "Entrée terrain",
          pcfMessage,
          status: "open",
        },
      ]);
    },
    [entries],
  );

  const resolveConflict = useCallback<OpsContextValue["resolveConflict"]>(
    (id, winner) => {
      setConflicts((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "resolved", winner } : item,
        ),
      );
    },
    [],
  );

  const createRequisition = useCallback<OpsContextValue["createRequisition"]>(
    (input) => {
      const seq = requisitions.length + 42;
      const requisition: Requisition = {
        ...input,
        id: nextId("req"),
        ref: `REQ-2026-${String(seq).padStart(3, "0")}`,
        status: "draft",
        createdAt: nowLabel(),
        timeoutSeconds: input.timeoutSeconds ?? 15,
        history: [
          {
            at: nowLabel(),
            status: "draft",
            by: "Module demandeur",
          },
        ],
      };
      setRequisitions((current) => [requisition, ...current]);
      return requisition;
    },
    [requisitions.length, setRequisitions],
  );

  const signRequisition = useCallback<OpsContextValue["signRequisition"]>(
    (id, by) => {
      const signatureHash = hashText(`${id}|${by}|${Date.now()}`);
      setRequisitions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "signed",
                signedAt: nowLabel(),
                signatureHash,
                history: [
                  ...item.history,
                  { at: nowLabel(), status: "signed", by },
                ],
              }
            : item,
        ),
      );
    },
    [setRequisitions],
  );

  const notifyRequisition = useCallback<OpsContextValue["notifyRequisition"]>(
    (id, by) => {
      setRequisitions((current) => {
        const target = current.find((item) => item.id === id);
        const timeoutAt = new Date(
          Date.now() + (target?.timeoutSeconds ?? 15) * 1000,
        ).toISOString();
        return current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "notified",
                notifiedAt: nowLabel(),
                timeoutAt,
                history: [
                  ...item.history,
                  { at: nowLabel(), status: "notified", by },
                ],
              }
            : item,
        );
      });
    },
    [setRequisitions],
  );

  const acknowledgeRequisition = useCallback<
    OpsContextValue["acknowledgeRequisition"]
  >(
    (id, by) => {
      setRequisitions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "acknowledged",
                acknowledgedAt: nowLabel(),
                history: [
                  ...item.history,
                  { at: nowLabel(), status: "acknowledged", by },
                ],
              }
            : item,
        ),
      );
    },
    [setRequisitions],
  );

  const completeRequisition = useCallback<OpsContextValue["completeRequisition"]>(
    (id, by) => {
      setRequisitions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "completed",
                completedAt: nowLabel(),
                history: [
                  ...item.history,
                  { at: nowLabel(), status: "completed", by },
                ],
              }
            : item,
        ),
      );
    },
    [setRequisitions],
  );

  const refuseRequisition = useCallback<OpsContextValue["refuseRequisition"]>(
    (id, by, note) => {
      setRequisitions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "refused",
                note,
                history: [
                  ...item.history,
                  { at: nowLabel(), status: "refused", by, note },
                ],
              }
            : item,
        ),
      );
    },
    [setRequisitions],
  );

  const cancelRequisition = useCallback<OpsContextValue["cancelRequisition"]>(
    (id, by, note) => {
      setRequisitions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "cancelled",
                note,
                history: [
                  ...item.history,
                  { at: nowLabel(), status: "cancelled", by, note },
                ],
              }
            : item,
        ),
      );
    },
    [setRequisitions],
  );

  const forceTimeout = useCallback<OpsContextValue["forceTimeout"]>(
    (id) => {
      setRequisitions((current) => {
        const target = current.find((item) => item.id === id);
        if (!target || target.status !== "notified") return current;
        const timedOut: Requisition = {
          ...target,
          status: "timeout",
          note: "Délai de 15 minutes dépassé, remplacement automatique (EC-03).",
          history: [
            ...target.history,
            {
              at: nowLabel(),
              status: "timeout",
              by: "Moteur de réquisition",
              note: "Timeout EC-03",
            },
          ],
        };
        const fallback: Requisition = {
          ...target,
          id: nextId("req"),
          ref: `${target.ref}-B`,
          resource:
            target.moduleId === "travaux"
              ? { fr: "Bulldozer Komatsu PC210", ar: "جرافة كومatsu PC210" }
              : { fr: "Moyen équivalent disponible", ar: "وسيلة مكافئة متاحة" },
          owner: { fr: "Parc public de secours", ar: "حظيرة الإنقاذ العمومية" },
          status: "draft",
          createdAt: nowLabel(),
          fallbackOf: target.id,
          timeoutAt: undefined,
          note: "Réquisition de remplacement après timeout.",
          history: [
            {
              at: nowLabel(),
              status: "draft",
              by: "Moteur de réquisition",
              note: `Remplacement de ${target.ref}`,
            },
          ],
        };
        return [fallback, timedOut, ...current.filter((item) => item.id !== id)];
      });
    },
    [setRequisitions],
  );

  // EC-03 : le pourvoi automatique s'exécute après le délai de démonstration.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRequisitions((current) => {
        let changed = false;
        const next: Requisition[] = [];
        for (const item of current) {
          if (
            item.status !== "notified" ||
            !item.timeoutAt ||
            !isTimeoutDue(item.timeoutAt)
          ) {
            next.push(item);
            continue;
          }
          changed = true;
          const at = nowLabel();
          next.push({
            ...item,
            id: nextId("req"),
            ref: `${item.ref}-B`,
            resource:
              item.moduleId === "travaux"
                ? { fr: "Bulldozer Komatsu PC210", ar: "جرافة كومatsu PC210" }
                : { fr: "Moyen équivalent disponible", ar: "وسيلة مكافئة متاحة" },
            owner: { fr: "Parc public de secours", ar: "حظيرة الإنقاذ العمومية" },
            status: "draft",
            createdAt: at,
            signedAt: undefined,
            notifiedAt: undefined,
            acknowledgedAt: undefined,
            completedAt: undefined,
            signatureHash: undefined,
            fallbackOf: item.id,
            timeoutAt: undefined,
            note: "Réquisition de remplacement après timeout (EC-03).",
            history: [
              {
                at,
                status: "draft",
                by: "Moteur de réquisition",
                note: `Remplacement automatique de ${item.ref}`,
              },
            ],
          });
          next.push({
            ...item,
            status: "timeout",
            note: "Délai d'accusé dépassé : remplacement automatique (EC-03).",
            timeoutAt: undefined,
            history: [
              ...item.history,
              {
                at,
                status: "timeout",
                by: "Moteur de réquisition",
                note: "Timeout EC-03",
              },
            ],
          });
        }
        return changed ? next : current;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [setRequisitions]);

  const consolidateSector = useCallback((id: string) => {
    setSectors((current) =>
      current.map((sector) =>
        sector.id === id
          ? {
              ...sector,
              status: "consolidated",
              lastRollupAt: nowLabel(),
            }
          : sector,
      ),
    );
  }, []);

  const updateTriage = useCallback((id: string, triage: TriageColor) => {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === id
          ? { ...patient, triage, updatedAt: nowLabel().slice(-5) }
          : patient,
      ),
    );
  }, []);

  const addPatient = useCallback<OpsContextValue["addPatient"]>((input) => {
    setPatients((current) => [
      {
        ...input,
        id: nextId("pma"),
        updatedAt: nowLabel().slice(-5),
      },
      ...current,
    ]);
  }, []);

  const allocate = useCallback<OpsContextValue["allocate"]>(
    (teamId, incidentId) => {
      const team = teams.find((item) => item.id === teamId);
      if (!team) return { ok: false, reason: "out" };
      if (team.status === "out") return { ok: false, reason: "out" };
      if (team.status === "engaged" && team.incidentId !== incidentId) {
        return {
          ok: false,
          reason: "engaged",
          conflictIncident: team.incidentId,
        };
      }
      setTeams((current) =>
        current.map((item) =>
          item.id === teamId
            ? { ...item, status: "engaged", incidentId }
            : item,
        ),
      );
      return { ok: true };
    },
    [teams],
  );

  const releaseTeam = useCallback((teamId: string) => {
    setTeams((current) =>
      current.map((team) =>
        team.id === teamId
          ? { ...team, status: "available", incidentId: undefined }
          : team,
      ),
    );
  }, []);

  const publishMessage = useCallback((id: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              status: "published",
              publishedAt: nowLabel(),
              reach: message.reach || 8200,
              acknowledgements: message.acknowledgements || 5100,
            }
          : message,
      ),
    );
  }, [setMessages]);

  const scheduleMessage = useCallback((id: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, status: "scheduled" } : message,
      ),
    );
  }, [setMessages]);

  const createMessage = useCallback<OpsContextValue["createMessage"]>(
    (input) => {
      setMessages((current) => [
        {
          ...input,
          id: nextId("msg"),
          status: "draft",
          reach: 0,
          acknowledgements: 0,
        },
        ...current,
      ]);
    },
    [setMessages],
  );

  const resolveRumor = useCallback<OpsContextValue["resolveRumor"]>(
    (id, status, response) => {
      setRumors((current) =>
        current.map((rumor) =>
          rumor.id === id
            ? {
                ...rumor,
                status,
                response: response ? { fr: response, ar: response } : rumor.response,
              }
            : rumor,
        ),
      );
    },
    [setRumors],
  );

  const addDamage = useCallback<OpsContextValue["addDamage"]>((input) => {
    setDamages((current) => [
      {
        ...input,
        id: nextId("dmg"),
        ref: `DOM-2026-${String(current.length + 4).padStart(3, "0")}`,
        at: nowLabel().slice(0, 10),
        status: "draft",
      },
      ...current,
    ]);
  }, [setDamages]);

  const validateDamage = useCallback((id: string) => {
    setDamages((current) =>
      current.map((damage) =>
        damage.id === id ? { ...damage, status: "validated" } : damage,
      ),
    );
  }, [setDamages]);

  const transmitDamage = useCallback((id: string) => {
    setDamages((current) =>
      current.map((damage) =>
        damage.id === id ? { ...damage, status: "transmitted" } : damage,
      ),
    );
  }, [setDamages]);

  const addDebris = useCallback<OpsContextValue["addDebris"]>((input) => {
    setDebris((current) => [
      { ...input, id: nextId("deb") },
      ...current,
    ]);
  }, [setDebris]);

  const updateDebris = useCallback<OpsContextValue["updateDebris"]>(
    (id, status) => {
      setDebris((current) =>
        current.map((site) =>
          site.id === id ? { ...site, status } : site,
        ),
      );
    },
    [setDebris],
  );

  const toggleCompliance = useCallback((id: string) => {
    setCompliance((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "done" ? "planned" : "done",
              evidence:
                item.status === "done" ? undefined : "Preuve déposée le " + nowLabel().slice(0, 10),
            }
          : item,
      ),
    );
  }, [setCompliance]);

  const attachFiche = useCallback((id: string) => {
    setFiches((current) =>
      current.map((fiche) =>
        fiche.id === id
          ? {
              ...fiche,
              status: "complete",
              updatedAt: nowLabel().slice(0, 10),
            }
          : fiche,
      ),
    );
  }, []);

  const updateHazmat = useCallback(
    (product: string, windDirection: number, windSpeed: number, productAr?: string) => {
      setHazmat((current) => ({
        ...current,
        product: { fr: product, ar: productAr || product },
        windDirection,
        windSpeed,
        radius: Math.round(300 + windSpeed * 30),
        updatedAt: nowLabel(),
        active: true,
      }));
    },
    [setHazmat],
  );

  const toggleHazmat = useCallback(() => {
    setHazmat((current) => ({
      ...current,
      active: !current.active,
      updatedAt: nowLabel(),
    }));
  }, [setHazmat]);

  const createHandover = useCallback(
    (from: string, to: string, notes: string) => {
      setHandovers((current) => [
        {
          id: nextId("hand"),
          from,
          to,
          at: nowLabel(),
          notes,
          signature: hashText(`${from}|${to}|${Date.now()}`),
        },
        ...current,
      ]);
    },
    [setHandovers],
  );

  const declareBasculement = useCallback(
    (threshold: string, people: number, means: string, by: string) => {
      setSiteBasculement({
        active: true,
        at: nowLabel(),
        threshold,
        people,
        means,
        by,
      });
    },
    [setSiteBasculement],
  );

  const updateVictims = useCallback((patch: Partial<VictimSummary>) => {
    setVictims((current) => ({ ...current, ...patch }));
  }, []);

  const pendingCount = entries.filter((entry) => entry.syncStatus === "local").length;

  const value = useMemo<OpsContextValue>(
    () => ({
      entries,
      conflicts,
      addEntry,
      addAmendment,
      syncPending,
      verifyChain,
      raiseConflict,
      resolveConflict,
      requisitions,
      createRequisition,
      signRequisition,
      notifyRequisition,
      acknowledgeRequisition,
      completeRequisition,
      refuseRequisition,
      cancelRequisition,
      forceTimeout,
      sectors,
      consolidateSector,
      patients,
      updateTriage,
      addPatient,
      teams,
      incidents: SEED_INCIDENTS,
      allocate,
      releaseTeam,
      messages,
      publishMessage,
      scheduleMessage,
      createMessage,
      rumors,
      resolveRumor,
      damages,
      addDamage,
      validateDamage,
      transmitDamage,
      debris,
      addDebris,
      updateDebris,
      compliance,
      toggleCompliance,
      fiches,
      attachFiche,
      hazmat,
      updateHazmat,
      toggleHazmat,
      handovers,
      createHandover,
      siteBasculement,
      declareBasculement,
      victims,
      updateVictims,
      shelters,
      beds,
      degraded,
      setDegraded,
      pendingCount,
    }),
    [
      entries,
      conflicts,
      addEntry,
      addAmendment,
      syncPending,
      verifyChain,
      raiseConflict,
      resolveConflict,
      requisitions,
      createRequisition,
      signRequisition,
      notifyRequisition,
      acknowledgeRequisition,
      completeRequisition,
      refuseRequisition,
      cancelRequisition,
      forceTimeout,
      sectors,
      consolidateSector,
      patients,
      updateTriage,
      addPatient,
      teams,
      allocate,
      releaseTeam,
      messages,
      publishMessage,
      scheduleMessage,
      createMessage,
      rumors,
      resolveRumor,
      damages,
      addDamage,
      validateDamage,
      transmitDamage,
      debris,
      addDebris,
      updateDebris,
      compliance,
      toggleCompliance,
      fiches,
      attachFiche,
      hazmat,
      updateHazmat,
      toggleHazmat,
      handovers,
      createHandover,
      siteBasculement,
      declareBasculement,
      victims,
      updateVictims,
      shelters,
      beds,
      degraded,
      pendingCount,
    ],
  );

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOrsecOps(): OpsContextValue {
  const context = useContext(OpsContext);
  if (!context) {
    throw new Error("useOrsecOps must be used inside OrsecOpsProvider");
  }
  return context;
}

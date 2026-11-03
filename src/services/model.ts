import type { Localized } from "../data/locale";
import type { MatrixCell, ModuleMatrix } from "../data/moduleMatrix";
import type { ModuleDef, ModuleNo } from "../data/modules";
import type { Territory, Voisinage } from "../data/territories";
import type { TypeCatastrophe, TypeCode } from "../data/types";
import type { Role } from "../auth/roles";
import type { TerritoryRef } from "../auth/session";

export type Gravity = "faible" | "moyenne" | "elevee" | "critique";

export type SignalState = "non_verifie" | "confirme" | "rejete";
export type InterventionState = "en_cours" | "cloturee" | "hors_de_controle";
export type PlanLevel = "commune" | "wilaya" | "national";
export type PlanState = "en_alerte" | "declenche" | "leve";
export type PlanPhase = "urgence" | "evaluation_controle" | "rehabilitation";
export type RequestState = "en_attente" | "traitee" | "refusee";
export type RequestOrigin = "hors_de_controle" | "maire" | "wali" | "proposition_automatique";
export type ParticipationState = "appele" | "confirme" | "libere";
export type TaskState = "a_faire" | "en_cours" | "terminee";
export type NotificationEvent =
  | "alerte_module"
  | "demande_declenchement"
  | "plan_declenche"
  | "plan_en_alerte"
  | "mise_en_alerte"
  | "participation"
  | "relance"
  | "refus"
  | "levee"
  | "appui"
  | "systeme";
export type Canal = "app" | "sms" | "radio";

/** Situations A–E du guide ORSEC master (état normal → réhabilitation). */
export type SituationCode = "A" | "B" | "C" | "D" | "E";

export type SituationTransition = {
  id: string;
  from: SituationCode;
  to: SituationCode;
  at: string;
  byId: string;
  assignmentId?: string;
  role: Role;
  justification: Localized;
  signatureHash: string;
  source?: string;
  moduleIds: string[];
  planId?: string;
};

export type MainCouranteCategory =
  | "alerte"
  | "operation"
  | "victime"
  | "moyen"
  | "decision"
  | "communication"
  | "rehabilitation";

export type MainCouranteScope = "pcf" | "pco" | "sector" | "module" | "authority";

export type MainCouranteEntry = {
  id: string;
  at: string;
  authorId: string;
  assignmentId?: string;
  role: Role;
  scope: MainCouranteScope;
  moduleId?: string;
  planId?: string;
  category: MainCouranteCategory;
  message: Localized;
  coordinates?: [number, number];
  amendmentOf?: string;
  prevHash: string;
  hash: string;
  syncStatus: "local" | "synced";
};

export type RequisitionState =
  | "proposee"
  | "signee"
  | "notifiee"
  | "acceptee"
  | "en_cours"
  | "terminee"
  | "refusee"
  | "expiree"
  | "annulee";

export type RequisitionUrgency = "normale" | "haute" | "critique";

/** Réquisition légale au titre de l'article 70. */
export type Requisition = {
  id: string;
  planId?: string;
  moduleId: string;
  demandeurId: string;
  nature: Localized;
  moyen: string;
  proprietaire: string;
  identifiant: string;
  lieu: Localized;
  debut: string;
  fin: string;
  baseLegale: string;
  etat: RequisitionState;
  urgence: RequisitionUrgency;
  creeLe: string;
  signeeLe?: string;
  signeeParId?: string;
  notificationLe?: string;
  motifRefus?: Localized;
  hash?: string;
};

export type CommuniqueState = "brouillon" | "valide" | "publie" | "archive";
export type CommuniqueCanal = "push" | "sms" | "site" | "radio";

export type Communique = {
  id: string;
  titre: Localized;
  message: Localized;
  zoneIds: string[];
  canaux: CommuniqueCanal[];
  etat: CommuniqueState;
  auteurId: string;
  valideParId?: string;
  creeLe: string;
  publieLe?: string;
  couverture: number;
};

export type ModuleStatus = "operationnel" | "sature" | "hors_service" | "non_mobilise";

export type ModuleMetric = { key: string; value: number; unit?: string };

/** Photographie opérationnelle d'un module pour son cockpit et le PCF. */
export type ModuleSnapshot = {
  id: string;
  moduleId: string;
  planId?: string;
  statut: ModuleStatus;
  responsableId?: string;
  effectifEngage: number;
  effectifDisponible: number;
  dernierRapportLe?: string;
  note?: Localized;
  metrics: ModuleMetric[];
};

export type User = {
  id: string;
  nom: Localized;
  prenom: Localized;
  email: string;
  /** Démo : empreinte locale, jamais le mot de passe en clair. */
  motDePasseHash?: string;
  role: Role;
  moduleId?: string;
  territoryId?: string;
  disponible?: boolean;
  actif: boolean;
  createdAt: string;
};

export type Signalement = {
  id: string;
  auteurId: string;
  typeId: TypeCode;
  description: string;
  latitude?: number;
  longitude?: number;
  communeId: string;
  photo?: string;
  personnesConcernees: number;
  gravite?: Gravity;
  etat: SignalState;
  creeLe: string;
  confirmeLe?: string;
  rejeteLe?: string;
  traiteParModuleId?: string;
  suggestion?: {
    typeId: TypeCode;
    gravite: Gravity;
    confiance: number;
  };
};

export type Routage = {
  id: string;
  signalementId: string;
  moduleId: string;
  destinataireId: string;
  envoyeLe: string;
  luLe?: string;
};

export type Intervention = {
  id: string;
  signalementId: string;
  moduleId: string;
  responsableId: string;
  etat: InterventionState;
  debut: string;
  fin?: string;
  motifHorsControle?: string;
  horsControleLe?: string;
  horsControleParId?: string;
};

export type AffectationAgent = {
  id: string;
  interventionId: string;
  agentId: string;
  etatTache: TaskState;
  compteRendu?: string;
  affecteLe: string;
  majLe: string;
};

export type DemandeAppui = {
  id: string;
  interventionId: string;
  moduleSolliciteId: string;
  etat: "en_attente" | "acceptee" | "refusee";
  creeLe: string;
};

export type DemandeDeclenchement = {
  id: string;
  niveauDemande: PlanLevel;
  territoireId: string;
  origine: RequestOrigin;
  auteurId: string;
  interventionId?: string;
  motif: string;
  etat: RequestState;
  planId?: string;
  reponse?: string;
  creeLe: string;
  traiteLe?: string;
  traiteParId?: string;
  relances: string[];
};

export type Plan = {
  id: string;
  niveau: PlanLevel;
  territoireId: string;
  phase: PlanPhase;
  etat: PlanState;
  /** Situation ORSEC A–E du plan (déduite de l'état si absente). */
  situation?: SituationCode;
  planEnglobantId?: string;
  demandeOrigineId?: string;
  creeLe: string;
  majLe: string;
  leveLe?: string;
  exercice: boolean;
};

export type ModuleMobilise = {
  planId: string;
  moduleId: string;
  mobiliseLe: string;
  libereLe?: string;
};

export type MiseEnAlerte = {
  id: string;
  territoireId: string;
  planSourceId: string;
  raison: "limitrophe" | "niveau_superieur";
  debut: string;
  levee?: string;
};

export type Participation = {
  id: string;
  planId: string;
  agentId: string;
  moduleId: string;
  etat: ParticipationState;
  appeleLe: string;
  confirmeLe?: string;
  libereLe?: string;
};

export type Notification = {
  id: string;
  destinataireId: string;
  typeEvenement: NotificationEvent;
  objet: Localized;
  message: Localized;
  canal: Canal;
  creeLe: string;
  lueLe?: string;
};

export type JournalEntry = {
  id: string;
  acteurId: string;
  action: string;
  objet: string;
  details: string;
  date: string;
  assignmentId?: string;
};

export type ReferenceData = {
  modules: ModuleDef[];
  types: TypeCatastrophe[];
  territories: Territory[];
  voisinage: Voisinage[];
  matrix: { URGENCE: ModuleMatrix; REHABILITATION: ModuleMatrix };
};

export type Db = {
  version: number;
  users: User[];
  signalements: Signalement[];
  routages: Routage[];
  interventions: Intervention[];
  affectations: AffectationAgent[];
  demandesAppui: DemandeAppui[];
  demandes: DemandeDeclenchement[];
  plans: Plan[];
  modulesMobilises: ModuleMobilise[];
  misesEnAlerte: MiseEnAlerte[];
  participations: Participation[];
  situationTransitions: SituationTransition[];
  mainCourante: MainCouranteEntry[];
  requisitions: Requisition[];
  communiques: Communique[];
  moduleSnapshots: ModuleSnapshot[];
  notifications: Notification[];
  journal: JournalEntry[];
  reference: ReferenceData;
};

export type SessionScope = {
  role: Role;
  userId: string;
  moduleId?: string;
  territory?: TerritoryRef;
};

export type MatrixPhase = keyof Db["reference"]["matrix"];
export type MatrixCellValue = MatrixCell;

export type NewSignalementInput = {
  auteurId: string;
  typeId: TypeCode;
  description: string;
  communeId: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  personnesConcernees: number;
  suggestion?: Signalement["suggestion"];
};

export type ModuleRef = { no: ModuleNo; moduleId: string };

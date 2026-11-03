import type { Localized } from "../data/locale";
import type { ModuleDef } from "../data/modules";
import type {
  Communique,
  CommuniqueCanal,
  Db,
  ModuleSnapshot,
  ModuleStatus,
  Plan,
  Requisition,
  RequisitionUrgency,
  SessionScope,
} from "./model";
import { plansForSession } from "./authority";
import { sealHash } from "./hash";
import { appendMainCouranteTo } from "./mainCourante";
import { pushNotification } from "./notifications";
import { signalementsForPlan } from "./plans";
import { findModuleDef } from "./selectors";
import { MODULE_ROLES, territoryOf } from "./scope";
import { appendJournal, newId, nowIso, updateDb } from "./store";

/** Clés stables des indicateurs de cockpit, partagées par le seed et les écrans. */
export const METRIC_KEYS = {
  victimsDead: "victimes_decedes",
  victimsInjured: "victimes_blessees",
  victimsMissing: "victimes_disparues",
  extracted: "victimes_extraites",
  triageRed: "triage_rouge",
  triageYellow: "triage_jaune",
  triageGreen: "triage_vert",
  triageBlack: "triage_noir",
  icuBeds: "lits_rea_disponibles",
  totalBeds: "lits_total",
  bloodBags: "sang_poches",
  transfers: "transferts_en_cours",
  sheltersOpen: "centres_ouverts",
  shelterCapacity: "capacite_accueil",
  shelterOccupancy: "occupation_accueil",
  families: "familles_hebergees",
  rations: "rations",
  blankets: "couvertures",
  distributionPoints: "points_distribution",
  outages: "coupures",
  prioritySites: "sites_prioritaires",
  generators: "groupes_electrogenes",
  heavyEngines: "engins_lourds",
  roadsCut: "axes_coupes",
  waterTrucks: "camions_citernes",
  pipes: "conduites_touchees",
  radios: "radios",
  buses: "bus",
  rotations: "rotations",
  inspected: "batiments_inspectes",
  affected: "sinistres",
  estimation: "estimation_mda",
} as const;

export function isModuleScope(scope: SessionScope): boolean {
  return MODULE_ROLES.includes(scope.role);
}

export function primaryPlanForScope(db: Db, scope: SessionScope): Plan | undefined {
  const plans = plansForSession(db, scope);
  return (
    plans.find((plan) => plan.etat === "declenche") ??
    plans.find((plan) => plan.etat === "en_alerte") ??
    plans[0]
  );
}

function planIdsForScope(db: Db, scope: SessionScope): Set<string> {
  return new Set(plansForSession(db, scope).map((plan) => plan.id));
}

/* ------------------------------------------------------------------ */
/* Réquisitions légales (article 70)                                   */
/* ------------------------------------------------------------------ */

export function requisitionsForScope(db: Db, scope: SessionScope): Requisition[] {
  if (isModuleScope(scope)) {
    return db.requisitions
      .filter((requisition) => requisition.moduleId === scope.moduleId)
      .sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));
  }
  const planIds = planIdsForScope(db, scope);
  return db.requisitions
    .filter((requisition) => requisition.planId !== undefined && planIds.has(requisition.planId))
    .sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));
}

export function pendingRequisitions(db: Db, scope: SessionScope): Requisition[] {
  return requisitionsForScope(db, scope).filter(
    (requisition) => requisition.etat === "proposee" || requisition.etat === "expiree",
  );
}

export type NewRequisitionInput = {
  moduleId: string;
  demandeurId: string;
  planId?: string;
  nature: Localized;
  moyen: string;
  proprietaire: string;
  identifiant: string;
  lieu: Localized;
  debut: string;
  fin: string;
  urgence: RequisitionUrgency;
};

export function createRequisition(input: NewRequisitionInput): Requisition {
  return updateDb((db) => {
    const requisition: Requisition = {
      id: newId("req"),
      planId: input.planId,
      moduleId: input.moduleId,
      demandeurId: input.demandeurId,
      nature: input.nature,
      moyen: input.moyen,
      proprietaire: input.proprietaire,
      identifiant: input.identifiant,
      lieu: input.lieu,
      debut: input.debut,
      fin: input.fin,
      baseLegale: "Article 70 — Loi 24-04",
      etat: "proposee",
      urgence: input.urgence,
      creeLe: nowIso(),
    };
    db.requisitions.unshift(requisition);
    appendJournal(
      db,
      input.demandeurId,
      "PROPOSITION_REQUISITION",
      requisition.id,
      `Réquisition proposée par ${input.moduleId} : ${input.nature.fr}.`,
    );
    return requisition;
  });
}

export function signRequisition(id: string, actorId: string): Requisition | undefined {
  return updateDb((db) => {
    const requisition = db.requisitions.find((item) => item.id === id);
    if (!requisition || requisition.etat !== "proposee") return undefined;
    const at = nowIso();
    const actor = db.users.find((user) => user.id === actorId);
    requisition.etat = "signee";
    requisition.signeeLe = at;
    requisition.signeeParId = actorId;
    requisition.notificationLe = at;
    requisition.hash = sealHash(
      requisition.id,
      requisition.moyen,
      requisition.proprietaire,
      requisition.debut,
      requisition.fin,
      actorId,
      at,
    );
    appendMainCouranteTo(db, {
      authorId: actorId,
      role: actor?.role ?? "wali",
      scope: "pcf",
      planId: requisition.planId,
      moduleId: requisition.moduleId,
      category: "moyen",
      message: {
        fr: `Réquisition signée — ${requisition.nature.fr} (${requisition.moyen}) au profit de ${requisition.moduleId}.`,
        ar: `تم توقيع طلب التزويد — ${requisition.nature.ar} (${requisition.moyen}) لفائدة ${requisition.moduleId}.`,
      },
      syncStatus: "synced",
      at,
    });
    pushNotification(
      db,
      requisition.demandeurId,
      "systeme",
      { fr: "Réquisition signée", ar: "تم توقيع طلب التزويد" },
      {
        fr: `La réquisition ${requisition.id} est signée et notifiée au propriétaire.`,
        ar: `تم توقيع الطلب ${requisition.id} وإبلاغ المالك.`,
      },
    );
    appendJournal(
      db,
      actorId,
      "SIGNATURE_REQUISITION",
      requisition.id,
      `Réquisition signée : ${requisition.nature.fr}.`,
    );
    return requisition;
  });
}

export function refuseRequisition(
  id: string,
  actorId: string,
  motif: Localized,
): Requisition | undefined {
  return updateDb((db) => {
    const requisition = db.requisitions.find((item) => item.id === id);
    if (!requisition || requisition.etat !== "proposee") return undefined;
    requisition.etat = "refusee";
    requisition.motifRefus = motif;
    requisition.signeeParId = actorId;
    appendJournal(
      db,
      actorId,
      "REFUS_REQUISITION",
      requisition.id,
      `Réquisition refusée : ${motif.fr}`,
    );
    return requisition;
  });
}

/* ------------------------------------------------------------------ */
/* Communication publique (module 4)                                   */
/* ------------------------------------------------------------------ */

function zoneMatchesScope(db: Db, scope: SessionScope, zoneId: string): boolean {
  const territory = scope.territory;
  if (!territory) return false;
  if (territory.level === "national") return true;
  const target = territoryOf(db, zoneId);
  if (!target) return false;
  if (target.id === territory.id) return true;
  if (territory.level === "wilaya") {
    return target.parentId === territory.id || target.id === target.parentId;
  }
  return target.parentId === territory.id || target.id === territory.id;
}

export function communiquesForScope(db: Db, scope: SessionScope): Communique[] {
  return db.communiques
    .filter((communique) => communique.zoneIds.some((zoneId) => zoneMatchesScope(db, scope, zoneId)))
    .sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));
}

export function latestCommunique(db: Db, scope: SessionScope): Communique | undefined {
  return communiquesForScope(db, scope).find((communique) => communique.etat === "publie");
}

export type NewCommuniqueInput = {
  titre: Localized;
  message: Localized;
  zoneIds: string[];
  canaux: CommuniqueCanal[];
  auteurId: string;
  publier?: boolean;
};

export function createCommunique(input: NewCommuniqueInput): Communique {
  return updateDb((db) => {
    const at = nowIso();
    const communique: Communique = {
      id: newId("com"),
      titre: input.titre,
      message: input.message,
      zoneIds: input.zoneIds,
      canaux: input.canaux,
      etat: input.publier ? "publie" : "brouillon",
      auteurId: input.auteurId,
      valideParId: input.publier ? input.auteurId : undefined,
      creeLe: at,
      publieLe: input.publier ? at : undefined,
      couverture: input.publier ? 62 : 0,
    };
    db.communiques.unshift(communique);
    if (input.publier) {
      const actor = db.users.find((user) => user.id === input.auteurId);
      appendMainCouranteTo(db, {
        authorId: input.auteurId,
        role: actor?.role ?? "wali",
        scope: "pcf",
        category: "communication",
        message: {
          fr: `Communiqué publié — ${input.titre.fr}.`,
          ar: `تم نشر بلاغ — ${input.titre.ar}.`,
        },
        syncStatus: "synced",
        at,
      });
    }
    appendJournal(
      db,
      input.auteurId,
      input.publier ? "PUBLICATION_COMMUNIQUE" : "BROUILLON_COMMUNIQUE",
      communique.id,
      `${input.titre.fr} (${input.canaux.join(", ")}).`,
    );
    return communique;
  });
}

export function publishCommunique(id: string, actorId: string): Communique | undefined {
  return updateDb((db) => {
    const communique = db.communiques.find((item) => item.id === id);
    if (!communique || communique.etat === "publie" || communique.etat === "archive") {
      return undefined;
    }
    const at = nowIso();
    communique.etat = "publie";
    communique.valideParId = actorId;
    communique.publieLe = at;
    communique.couverture = Math.max(communique.couverture, 68);
    const actor = db.users.find((user) => user.id === actorId);
    appendMainCouranteTo(db, {
      authorId: actorId,
      role: actor?.role ?? "wali",
      scope: "pcf",
      category: "communication",
      message: {
        fr: `Communiqué validé et publié — ${communique.titre.fr}.`,
        ar: `تمت المصادقة على البلاغ ونشره — ${communique.titre.ar}.`,
      },
      syncStatus: "synced",
      at,
    });
    appendJournal(
      db,
      actorId,
      "PUBLICATION_COMMUNIQUE",
      communique.id,
      `${communique.titre.fr} publié sur ${communique.canaux.join(", ")}.`,
    );
    return communique;
  });
}

/* ------------------------------------------------------------------ */
/* Cockpits des 13 modules                                             */
/* ------------------------------------------------------------------ */

export type ModuleStatusRow = {
  module: ModuleDef;
  status: ModuleStatus;
  mobilise: boolean;
  snapshot?: ModuleSnapshot;
  responsableId?: string;
};

export function snapshotForModule(
  db: Db,
  moduleId: string,
  planId?: string,
): ModuleSnapshot | undefined {
  return [...db.moduleSnapshots]
    .filter(
      (snapshot) =>
        snapshot.moduleId === moduleId && (planId === undefined || snapshot.planId === planId),
    )
    .sort(
      (a, b) =>
        Date.parse(b.dernierRapportLe ?? "") - Date.parse(a.dernierRapportLe ?? ""),
    )[0];
}

export function moduleStatusRows(db: Db, planId?: string): ModuleStatusRow[] {
  return db.reference.modules.map((module) => {
    const mobilise = planId
      ? db.modulesMobilises.some(
          (item) => item.planId === planId && item.moduleId === module.id && !item.libereLe,
        )
      : db.modulesMobilises.some((item) => item.moduleId === module.id && !item.libereLe);
    const snapshot = snapshotForModule(db, module.id, planId);
    const responsable =
      db.users.find(
        (user) => user.actif && user.moduleId === module.id && user.role === "module_director",
      ) ??
      db.users.find(
        (user) => user.actif && user.moduleId === module.id && user.role === "module_manager",
      );
    return {
      module,
      status: snapshot?.statut ?? (mobilise ? "operationnel" : "non_mobilise"),
      mobilise,
      snapshot,
      responsableId: snapshot?.responsableId ?? responsable?.id,
    };
  });
}

export function moduleMetric(snapshot: ModuleSnapshot | undefined, key: string): number {
  return snapshot?.metrics.find((metric) => metric.key === key)?.value ?? 0;
}

export type PmaTriage = {
  red: number;
  yellow: number;
  green: number;
  black: number;
  total: number;
};

export function pmaTriage(snapshot: ModuleSnapshot | undefined): PmaTriage {
  const red = moduleMetric(snapshot, METRIC_KEYS.triageRed);
  const yellow = moduleMetric(snapshot, METRIC_KEYS.triageYellow);
  const green = moduleMetric(snapshot, METRIC_KEYS.triageGreen);
  const black = moduleMetric(snapshot, METRIC_KEYS.triageBlack);
  return { red, yellow, green, black, total: red + yellow + green + black };
}

export type OrsecStats = {
  plan?: Plan;
  signalements: number;
  personnesConcernees: number;
  victimsDead: number;
  victimsInjured: number;
  victimsMissing: number;
  sheltersOpen: number;
  shelterCapacity: number;
  shelterOccupancy: number;
  modulesEngaged: number;
  modulesSaturated: number;
  pendingRequisitions: number;
  draftCommuniques: number;
  mainCouranteCount: number;
  lastPoint?: string;
};

export function orsecStats(db: Db, scope: SessionScope): OrsecStats {
  const plan = primaryPlanForScope(db, scope);
  const moduleScope = isModuleScope(scope);
  const activePlans = moduleScope
    ? plan
      ? [plan]
      : []
    : plansForSession(db, scope).filter((item) => item.etat !== "leve");
  const planIds = new Set(activePlans.map((item) => item.id));
  const snapshots = db.moduleSnapshots.filter(
    (snapshot) =>
      snapshot.planId === undefined || planIds.size === 0 || planIds.has(snapshot.planId),
  );
  const sante = snapshots.find((snapshot) => snapshot.moduleId === "module-3");
  const hebergement = snapshots.find((snapshot) => snapshot.moduleId === "module-7");
  const signalementMap = new Map<string, (typeof db.signalements)[number]>();
  if (activePlans.length === 0) {
    db.signalements
      .filter((signalement) => signalement.etat !== "rejete")
      .forEach((signalement) => signalementMap.set(signalement.id, signalement));
  } else {
    activePlans.forEach((activePlan) => {
      signalementsForPlan(db, activePlan.niveau, activePlan.territoireId).forEach((signalement) =>
        signalementMap.set(signalement.id, signalement),
      );
    });
  }
  const signalements = [...signalementMap.values()];
  const modules = moduleScope
    ? db.modulesMobilises.filter(
        (module) => planIds.has(module.planId) && !module.libereLe && module.moduleId === scope.moduleId,
      )
    : db.modulesMobilises.filter(
        (module) => planIds.has(module.planId) && !module.libereLe,
      );
  const mainCourante =
    planIds.size === 0
      ? db.mainCourante
      : db.mainCourante.filter(
          (entry) => (entry.planId !== undefined && planIds.has(entry.planId)) || entry.scope === "pcf",
        );
  const lastReport = snapshots
    .map((snapshot) => snapshot.dernierRapportLe)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const lastEntry = [...mainCourante]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0];

  return {
    plan,
    signalements: signalements.length,
    personnesConcernees: signalements.reduce(
      (total, signalement) => total + signalement.personnesConcernees,
      0,
    ),
    victimsDead: moduleMetric(sante, METRIC_KEYS.victimsDead),
    victimsInjured: moduleMetric(sante, METRIC_KEYS.victimsInjured),
    victimsMissing: moduleMetric(sante, METRIC_KEYS.victimsMissing),
    sheltersOpen: moduleMetric(hebergement, METRIC_KEYS.sheltersOpen),
    shelterCapacity: moduleMetric(hebergement, METRIC_KEYS.shelterCapacity),
    shelterOccupancy: moduleMetric(hebergement, METRIC_KEYS.shelterOccupancy),
    modulesEngaged: new Set(modules.map((module) => module.moduleId)).size,
    modulesSaturated: snapshots.filter((snapshot) => snapshot.statut === "sature").length,
    pendingRequisitions: pendingRequisitions(db, scope).length,
    draftCommuniques: communiquesForScope(db, scope).filter(
      (communique) => communique.etat === "brouillon",
    ).length,
    mainCouranteCount: mainCourante.length,
    lastPoint: lastReport ?? lastEntry?.at,
  };
}

export function moduleStatusLabelKey(status: ModuleStatus): string {
  return `orsec.moduleStatus.${status}`;
}

export function moduleDisplay(
  db: Db,
  moduleId: string,
): { module?: ModuleDef; name: string } {
  const module = findModuleDef(db, moduleId);
  return { module, name: module?.id ?? moduleId };
}

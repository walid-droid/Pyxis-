import type { Localized } from "../data/locale";
import { MODULE_BY_NO, MODULES, type ModuleNo } from "../data/modules";
import type { TypeCode } from "../data/types";
import type { Territory } from "../data/territories";
import type {
  AffectationAgent,
  Db,
  ModuleMobilise,
  Participation,
  Plan,
  Signalement,
  User,
} from "./model";

export function findUser(db: Db, id: string | undefined): User | undefined {
  return id ? db.users.find((user) => user.id === id) : undefined;
}

export function findSignalement(db: Db, id: string): Signalement | undefined {
  return db.signalements.find((signalement) => signalement.id === id);
}

export function findIntervention(db: Db, id: string) {
  return db.interventions.find((intervention) => intervention.id === id);
}

export function findPlan(db: Db, id: string) {
  return db.plans.find((plan) => plan.id === id);
}

export function findType(db: Db, code: TypeCode) {
  return db.reference.types.find((type) => type.code === code);
}

export function findTerritory(db: Db, id: string | undefined): Territory | undefined {
  return id ? db.reference.territories.find((territory) => territory.id === id) : undefined;
}

export function findModuleDef(db: Db, moduleId: string | undefined) {
  return moduleId ? db.reference.modules.find((module) => module.id === moduleId) : undefined;
}

export function moduleNoOf(moduleId: string | undefined): ModuleNo | undefined {
  const match = /^module-(\d+)$/.exec(moduleId ?? "");
  const no = match ? Number(match[1]) : 0;
  return MODULES.some((module) => module.no === no) ? (no as ModuleNo) : undefined;
}

export function moduleDefByNo(no: ModuleNo) {
  return MODULE_BY_NO[no];
}

export function moduleLabel(db: Db, moduleId: string | undefined, lang: "fr" | "ar"): string {
  if (!moduleId) return "—";
  const module = findModuleDef(db, moduleId);
  return module ? module.nom[lang] : moduleId;
}

export function userName(user: User | undefined, lang: "fr" | "ar"): string {
  if (!user) return lang === "ar" ? "غير معروف" : "Inconnu";
  return `${user.prenom[lang]} ${user.nom[lang]}`;
}

export function scopeLabel(territory: Territory | undefined, lang: "fr" | "ar"): string {
  return territory ? territory.nom[lang] : lang === "ar" ? "—" : "—";
}

export function localizedOr(value: Localized | undefined, lang: "fr" | "ar", fallback: string): string {
  return value ? value[lang] : fallback;
}

export function moduleUsers(db: Db, moduleId: string): User[] {
  return db.users.filter((user) => user.actif && user.moduleId === moduleId);
}

export function agentsOfModule(db: Db, moduleId: string): User[] {
  return moduleUsers(db, moduleId).filter((user) => user.role === "module_agent");
}

export function routagesForModule(db: Db, moduleId: string, userId?: string) {
  return db.routages.filter(
    (routage) =>
      routage.moduleId === moduleId && (userId === undefined || routage.destinataireId === userId),
  );
}

export function signalementsForModule(db: Db, moduleId: string): Signalement[] {
  const ids = new Set(
    db.routages.filter((routage) => routage.moduleId === moduleId).map((routage) => routage.signalementId),
  );
  return db.signalements.filter((signalement) => ids.has(signalement.id));
}

export function interventionsForModule(db: Db, moduleId: string) {
  return db.interventions.filter((intervention) => intervention.moduleId === moduleId);
}

export function activeInterventionsForModule(db: Db, moduleId: string) {
  return interventionsForModule(db, moduleId).filter(
    (intervention) => intervention.etat === "en_cours" || intervention.etat === "hors_de_controle",
  );
}

export function assignmentsForIntervention(db: Db, interventionId: string): AffectationAgent[] {
  return db.affectations.filter((assignment) => assignment.interventionId === interventionId);
}

export function assignmentsForAgent(db: Db, agentId: string): AffectationAgent[] {
  return db.affectations.filter((assignment) => assignment.agentId === agentId);
}

export function interventionsForAgent(db: Db, agentId: string) {
  const ids = new Set(assignmentsForAgent(db, agentId).map((assignment) => assignment.interventionId));
  return db.interventions.filter((intervention) => ids.has(intervention.id));
}

export function participationsForAgent(db: Db, agentId: string): Participation[] {
  return db.participations.filter((participation) => participation.agentId === agentId);
}

export function plansVisibleTo(db: Db, level: Plan["niveau"], territoryId: string, includeChildren = false): Plan[] {
  return db.plans.filter((plan) => {
    if (plan.exercice) return false;
    if (plan.niveau === level && plan.territoireId === territoryId) return true;
    if (!includeChildren) return false;
    if (level === "wilaya" && plan.niveau === "commune") {
      return findTerritory(db, plan.territoireId)?.parentId === territoryId;
    }
    if (level === "national") return true;
    return false;
  });
}

export function activePlan(db: Db, level: Plan["niveau"], territoryId: string): Plan | undefined {
  return db.plans.find(
    (plan) =>
      !plan.exercice &&
      plan.niveau === level &&
      plan.territoireId === territoryId &&
      plan.etat !== "leve",
  );
}

export function planModules(db: Db, planId: string): ModuleMobilise[] {
  return db.modulesMobilises.filter((module) => module.planId === planId);
}

export function planParticipations(db: Db, planId: string): Participation[] {
  return db.participations.filter((participation) => participation.planId === planId);
}

export function activeAlertsFor(db: Db, territoryId: string) {
  return db.misesEnAlerte.filter(
    (alert) => !alert.levee && (alert.territoireId === territoryId || territoryId === "dz"),
  );
}

export function unreadNotifications(db: Db, userId: string) {
  return db.notifications.filter(
    (notification) => notification.destinataireId === userId && !notification.lueLe,
  );
}

export function notificationsFor(db: Db, userId: string) {
  return db.notifications
    .filter((notification) => notification.destinataireId === userId)
    .sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));
}

export function citizenSignalements(db: Db, userId: string): Signalement[] {
  return db.signalements
    .filter((signalement) => signalement.auteurId === userId)
    .sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));
}

export function signalementModules(db: Db, signalementId: string): string[] {
  return Array.from(
    new Set(
      db.routages
        .filter((routage) => routage.signalementId === signalementId)
        .map((routage) => routage.moduleId),
    ),
  );
}

export function interventionForSignalementModule(
  db: Db,
  signalementId: string,
  moduleId: string,
) {
  return db.interventions.find(
    (intervention) =>
      intervention.signalementId === signalementId && intervention.moduleId === moduleId,
  );
}

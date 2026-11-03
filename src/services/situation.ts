import type { Localized } from "../data/locale";
import type { Role } from "../auth/roles";
import type {
  Db,
  Plan,
  PlanLevel,
  SessionScope,
  SituationCode,
  SituationTransition,
} from "./model";
import { planLevelForRole } from "../auth/access";
import { currentAssignmentId, getAuthSession } from "../auth/session";
import { plansForSession } from "./authority";
import { sealHash } from "./hash";
import { appendMainCouranteTo } from "./mainCourante";
import { pushNotification } from "./notifications";
import { appendJournal, newId, nowIso, updateDb } from "./store";
import { territoryOf } from "./scope";

export const SITUATION_CODES: SituationCode[] = ["A", "B", "C", "D", "E"];

export const SITUATION_LABELS: Record<SituationCode, Localized> = {
  A: { fr: "État normal", ar: "الحالة العادية" },
  B: { fr: "Pré-alerte", ar: "الإنذار المسبق" },
  C: { fr: "Urgence active", ar: "الاستعجال النشط" },
  D: { fr: "Escalade inter-wilayas", ar: "التصعيد بين الولايات" },
  E: { fr: "Évaluation et réhabilitation", ar: "التقييم وإعادة التأهيل" },
};

const AUTHORITY_ROLES: Role[] = ["wali", "apc_president", "minister"];

export function isAuthorityRole(role: Role): boolean {
  return AUTHORITY_ROLES.includes(role);
}

/** Situation déduite du cycle de vie du plan, sauf valeur explicite. */
export function situationOfPlan(plan: Plan | undefined): SituationCode {
  if (!plan) return "A";
  if (plan.situation) return plan.situation;
  if (plan.etat === "leve") return "A";
  if (plan.etat === "en_alerte") return "B";
  if (plan.phase === "evaluation_controle" || plan.phase === "rehabilitation") return "E";
  if (plan.etat === "declenche") return "C";
  return "A";
}

export type CurrentSituation = {
  code: SituationCode;
  plan?: Plan;
  since?: string;
  transition?: SituationTransition;
};

/** Situation courante du périmètre : plan du niveau du rôle, sinon plan actif. */
export function currentSituation(db: Db, scope: SessionScope): CurrentSituation {
  const plans = plansForSession(db, scope);
  const level = isAuthorityRole(scope.role) ? planLevelForRole(scope.role) : null;
  const ownPlan = plans.find(
    (item) =>
      item.etat !== "leve" &&
      (level === null || item.niveau === level) &&
      (scope.role === "minister" || item.territoireId === scope.territory?.id),
  );
  const plan =
    ownPlan ??
    plans.find((item) => item.etat === "declenche") ??
    plans.find((item) => item.etat === "en_alerte");
  const code = situationOfPlan(plan);
  const transition = plan
    ? [...db.situationTransitions]
        .filter((item) => item.planId === plan.id)
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))[0]
    : undefined;
  return {
    code,
    plan,
    since: transition?.at ?? plan?.majLe,
    transition,
  };
}

/** Transitions autorisées par la matrice ORSEC, filtrées par rôle. */
export function allowedSituationTargets(from: SituationCode, role: Role): SituationCode[] {
  if (!isAuthorityRole(role)) return [];
  switch (from) {
    case "A":
      return ["B", "C"];
    case "B":
      return ["A", "C"];
    case "C":
      return role === "apc_president" ? ["E"] : ["D", "E"];
    case "D":
      return role === "apc_president" ? [] : ["C", "E"];
    case "E":
      return ["A"];
    default:
      return [];
  }
}

export type SituationTransitionInput = {
  planId?: string;
  level?: PlanLevel;
  territoryId?: string;
  from: SituationCode;
  to: SituationCode;
  actorId: string;
  role: Role;
  justification: Localized;
  source?: string;
  moduleIds?: string[];
};

/** Applique une transition A–E, scelle l'acte et notifie les modules. */
export function transitionSituation(
  input: SituationTransitionInput,
): SituationTransition | undefined {
  return updateDb((db) => {
    if (!isAuthorityRole(input.role)) return undefined;
    if (!allowedSituationTargets(input.from, input.role).includes(input.to)) {
      return undefined;
    }

    let plan = input.planId
      ? db.plans.find((item) => item.id === input.planId)
      : db.plans.find(
          (item) =>
            !item.exercice &&
            item.etat !== "leve" &&
            (input.territoryId === undefined || item.territoireId === input.territoryId),
        );

    if (!plan && input.level && input.territoryId && input.to !== "A" && input.to !== "E") {
      const at = nowIso();
      plan = {
        id: newId("plan"),
        niveau: input.level,
        territoireId: input.territoryId,
        phase: "urgence",
        etat: input.to === "B" ? "en_alerte" : "declenche",
        situation: input.to,
        creeLe: at,
        majLe: at,
        exercice: false,
      };
      db.plans.unshift(plan);
    }

    if (!plan) return undefined;
    const current = situationOfPlan(plan);
    if (current !== input.from) return undefined;

    const at = nowIso();
    const session = getAuthSession();
    const assignmentId = currentAssignmentId(session) ?? undefined;
    const moduleIds =
      input.moduleIds ??
      db.modulesMobilises.filter((module) => module.planId === plan!.id).map((module) => module.moduleId);
    const transition: SituationTransition = {
      id: newId("sit"),
      from: input.from,
      to: input.to,
      at,
      byId: input.actorId,
      assignmentId,
      role: input.role,
      justification: input.justification,
      signatureHash: sealHash(
        plan.id,
        input.from,
        input.to,
        input.actorId,
        at,
        input.justification.fr,
      ),
      source: input.source,
      moduleIds,
      planId: plan.id,
    };

    plan.situation = input.to;
    plan.majLe = at;
    if (input.to === "A") {
      plan.etat = "leve";
      plan.leveLe = at;
      db.modulesMobilises
        .filter((module) => module.planId === plan!.id && !module.libereLe)
        .forEach((module) => {
          module.libereLe = at;
        });
    } else if (input.to === "B") {
      plan.etat = "en_alerte";
    } else if (input.to === "E") {
      plan.etat = "declenche";
      plan.phase = "evaluation_controle";
    } else {
      plan.etat = "declenche";
    }

    db.situationTransitions.unshift(transition);

    appendMainCouranteTo(db, {
      authorId: input.actorId,
      assignmentId,
      role: input.role,
      scope: "pcf",
      planId: plan.id,
      category: "decision",
      message: input.justification,
      syncStatus: "synced",
      at,
    });

    const label = SITUATION_LABELS[input.to];
    const territory = territoryOf(db, plan.territoireId);
    db.users
      .filter(
        (user) =>
          user.actif &&
          (user.role === "module_manager" || user.role === "module_director"),
      )
      .filter((user) => moduleIds.length === 0 || moduleIds.includes(user.moduleId ?? ""))
      .forEach((user) => {
        pushNotification(
          db,
          user.id,
          "systeme",
          {
            fr: `Situation ${input.to} — ${label.fr}`,
            ar: `الحالة ${input.to} — ${label.ar}`,
          },
          {
            fr: `${territory?.nom.fr ?? plan!.territoireId} passe en situation ${input.to}. ${input.justification.fr}`,
            ar: `${territory?.nom.ar ?? plan!.territoireId} تنتقل إلى الحالة ${input.to}. ${input.justification.ar}`,
          },
        );
      });

    appendJournal(
      db,
      input.actorId,
      "TRANSITION_SITUATION",
      transition.id,
      `Situation ${input.from} → ${input.to} pour ${plan.territoireId} (${input.justification.fr}).`,
    );
    return transition;
  });
}

export function situationLevelForRole(role: Role): PlanLevel | null {
  return planLevelForRole(role);
}

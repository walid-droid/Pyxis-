import type { Localized } from "../data/locale";
import type { ModuleNo } from "../data/modules";
import { TYPES_CATASTROPHE, type TypeCode } from "../data/types";
import type { Role } from "../auth/roles";
import type {
  Db,
  DemandeDeclenchement,
  MiseEnAlerte,
  ModuleMobilise,
  Participation,
  Plan,
  PlanLevel,
  PlanPhase,
  SessionScope,
  Signalement,
} from "./model";
import { pushNotification } from "./notifications";
import {
  authorityOf,
  levelOfTerritory,
  parentWilayaOf,
  roleForLevel,
  territoryOf,
  userInTerritory,
} from "./scope";
import { appendJournal, newId, nowIso, updateDb } from "./store";
import { findUser, findModuleDef } from "./selectors";

const LEVEL_LABEL: Record<PlanLevel, Localized> = {
  commune: { fr: "plan communal", ar: "المخطط البلدي" },
  wilaya: { fr: "plan de wilaya", ar: "مخطط الولاية" },
  national: { fr: "plan national", ar: "المخطط الوطني" },
};

export type TriggerPlanInput = {
  level: PlanLevel;
  territoryId: string;
  actorId: string;
  exercise?: boolean;
  demandeId?: string;
  phase?: PlanPhase;
};

export function signalementsForPlan(db: Db, level: PlanLevel, territoryId: string): Signalement[] {
  return db.signalements.filter((signalement) => {
    if (signalement.etat === "rejete") return false;
    if (level === "national") return true;
    if (level === "commune") return signalement.communeId === territoryId;
    const commune = territoryOf(db, signalement.communeId);
    return commune?.parentId === territoryId;
  });
}

export function typesForPlan(db: Db, level: PlanLevel, territoryId: string): TypeCode[] {
  return Array.from(new Set(signalementsForPlan(db, level, territoryId).map((item) => item.typeId)));
}

export function modulesToMobilize(db: Db, types: TypeCode[]): ModuleNo[] {
  const matrix = db.reference.matrix.URGENCE;
  const modules = db.reference.modules
    .filter((module) => types.some((type) => matrix[module.no][type] === true))
    .map((module) => module.no);
  if (modules.length > 0) return modules;
  return [1, 2, 3, 4];
}

function activePlanOf(db: Db, level: PlanLevel, territoryId: string): Plan | undefined {
  return db.plans.find(
    (plan) =>
      !plan.exercice &&
      plan.niveau === level &&
      plan.territoireId === territoryId &&
      plan.etat !== "leve",
  );
}

function ensureAlertPlan(db: Db, level: PlanLevel, territoryId: string, actorId: string): Plan {
  const existing = activePlanOf(db, level, territoryId);
  if (existing) return existing;
  const plan: Plan = {
    id: newId("plan"),
    niveau: level,
    territoireId: territoryId,
    phase: "urgence",
    etat: "en_alerte",
    creeLe: nowIso(),
    majLe: nowIso(),
    exercice: false,
  };
  db.plans.unshift(plan);
  appendJournal(
    db,
    actorId,
    "MISE_EN_ALERTE_PLAN",
    plan.id,
    `${LEVEL_LABEL[level].fr} de ${territoryId} mis en état d'alerte.`,
  );
  return plan;
}

function notifyAuthority(
  db: Db,
  level: PlanLevel,
  territoryId: string,
  typeEvenement: "plan_declenche" | "plan_en_alerte" | "mise_en_alerte",
  objet: Localized,
  message: Localized,
): void {
  authorityOf(db, level, territoryId).forEach((user) => {
    pushNotification(db, user.id, typeEvenement, objet, message);
  });
}

function alertTerritory(
  db: Db,
  territoryId: string,
  planSourceId: string,
  raison: MiseEnAlerte["raison"],
  actorId: string,
): MiseEnAlerte | undefined {
  const territory = territoryOf(db, territoryId);
  if (!territory) return undefined;
  const duplicate = db.misesEnAlerte.find(
    (alert) => !alert.levee && alert.territoireId === territoryId && alert.planSourceId === planSourceId,
  );
  if (duplicate) return duplicate;

  const alert: MiseEnAlerte = {
    id: newId("alerte"),
    territoireId: territoryId,
    planSourceId,
    raison,
    debut: nowIso(),
  };
  db.misesEnAlerte.unshift(alert);

  const level = territory.niveau;
  if (level !== "national") {
    ensureAlertPlan(db, level, territoryId, actorId);
  }
  const label = level === "commune" ? { fr: "commune", ar: "بلدية" } : level === "wilaya" ? { fr: "wilaya", ar: "ولاية" } : { fr: "territoire national", ar: "التراب الوطني" };
  notifyAuthority(
    db,
    level,
    territoryId,
    "mise_en_alerte",
    { fr: "Mise en alerte", ar: "وضع في حالة تأهب" },
    {
      fr: `La ${label.fr} ${territory.nom.fr} est mise en alerte (${raison === "limitrophe" ? "territoire limitrophe" : "niveau supérieur"}).`,
      ar: `${label.ar} ${territory.nom.ar} وُضعت في حالة تأهب (${raison === "limitrophe" ? "إقليم مجاور" : "المستوى الأعلى"}).`,
    },
  );
  appendJournal(
    db,
    actorId,
    "MISE_EN_ALERTE",
    alert.id,
    `Territoire ${territoryId} mis en alerte (${raison}) par le plan ${planSourceId}.`,
  );
  return alert;
}

function cascadeFromPlan(db: Db, plan: Plan, actorId: string): void {
  if (plan.exercice) return;

  if (plan.niveau === "commune") {
    const neighbours = db.reference.voisinage.flatMap((pair) => {
      if (pair.territoireA === plan.territoireId) return [pair.territoireB];
      if (pair.territoireB === plan.territoireId) return [pair.territoireA];
      return [];
    });
    neighbours
      .filter((id) => levelOfTerritory(db, id) === "commune")
      .forEach((id) => alertTerritory(db, id, plan.id, "limitrophe", actorId));

    const wilaya = parentWilayaOf(db, plan.territoireId);
    if (wilaya) {
      const wilayaPlan = ensureAlertPlan(db, "wilaya", wilaya.id, actorId);
      notifyAuthority(
        db,
        "wilaya",
        wilaya.id,
        "plan_en_alerte",
        { fr: "Plan de wilaya en alerte", ar: "مخطط الولاية في حالة تأهب" },
        {
          fr: `Le plan communal de ${territoryOf(db, plan.territoireId)?.nom.fr ?? plan.territoireId} est déclenché. Le plan de wilaya ${wilaya.nom.fr} passe en état d'alerte.`,
          ar: `تم إطلاق المخطط البلدي لـ${territoryOf(db, plan.territoireId)?.nom.ar ?? plan.territoireId}. مخطط ولاية ${wilaya.nom.ar} ينتقل إلى حالة التأهب.`,
        },
      );
      appendJournal(
        db,
        actorId,
        "PLAN_WILAYA_ALERTE",
        wilayaPlan.id,
        `Plan de wilaya ${wilaya.id} mis en alerte après le déclenchement communal.`,
      );
    }
  }

  if (plan.niveau === "wilaya") {
    db.plans
      .filter(
        (child) =>
          child.niveau === "commune" &&
          child.etat === "declenche" &&
          territoryOf(db, child.territoireId)?.parentId === plan.territoireId,
      )
      .forEach((child) => {
        child.planEnglobantId = plan.id;
      });

    const neighbours = db.reference.voisinage.flatMap((pair) => {
      if (pair.territoireA === plan.territoireId) return [pair.territoireB];
      if (pair.territoireB === plan.territoireId) return [pair.territoireA];
      return [];
    });
    neighbours
      .filter((id) => levelOfTerritory(db, id) === "wilaya")
      .forEach((id) => alertTerritory(db, id, plan.id, "limitrophe", actorId));

    const nationalPlan = ensureAlertPlan(db, "national", "dz", actorId);
    notifyAuthority(
      db,
      "national",
      "dz",
      "plan_en_alerte",
      { fr: "Plan national en alerte", ar: "المخطط الوطني في حالة تأهب" },
      {
        fr: `Le plan de wilaya ${plan.territoireId} est déclenché. Le ministre est notifié.`,
        ar: `تم إطلاق مخطط ولاية ${plan.territoireId}. تم إشعار الوزير.`,
      },
    );
    appendJournal(
      db,
      actorId,
      "PLAN_NATIONAL_ALERTE",
      nationalPlan.id,
      "Plan national mis en alerte après le déclenchement d'un plan de wilaya.",
    );
  }

  if (plan.niveau === "national") {
    db.plans
      .filter(
        (child) =>
          child.niveau === "wilaya" &&
          child.etat === "declenche" &&
          child.id !== plan.id,
      )
      .forEach((child) => {
        child.planEnglobantId = plan.id;
      });
  }
}

function createPlanInternal(db: Db, input: TriggerPlanInput): Plan {
  let plan = input.exercise ? undefined : activePlanOf(db, input.level, input.territoryId);

  if (plan?.etat === "declenche") {
    if (input.demandeId) {
      const demande = db.demandes.find((item) => item.id === input.demandeId);
      if (demande) {
        demande.etat = "traitee";
        demande.planId = plan.id;
        demande.traiteLe = nowIso();
        demande.traiteParId = input.actorId;
      }
    }
    return plan;
  }

  if (plan) {
    // Un plan déjà en état d'alerte est promu au déclenchement.
    plan.etat = "declenche";
    plan.phase = input.phase ?? "urgence";
    plan.majLe = nowIso();
    plan.demandeOrigineId = input.demandeId ?? plan.demandeOrigineId;
  } else {
    plan = {
      id: newId("plan"),
      niveau: input.level,
      territoireId: input.territoryId,
      phase: input.phase ?? "urgence",
      etat: "declenche",
      planEnglobantId: undefined,
      demandeOrigineId: input.demandeId,
      creeLe: nowIso(),
      majLe: nowIso(),
      exercice: input.exercise ?? false,
    };
    db.plans.unshift(plan);
  }

  const types = typesForPlan(db, input.level, input.territoryId);
  const moduleNos: ModuleNo[] = input.exercise ? [1, 2, 3, 4, 8] : modulesToMobilize(db, types);
  moduleNos.forEach((no) => {
    const moduleId = `module-${no}`;
    const mobilise: ModuleMobilise = {
      planId: plan.id,
      moduleId,
      mobiliseLe: plan.creeLe,
    };
    db.modulesMobilises.push(mobilise);

    // Un exercice ne génère aucun appel réel : les agents ne sont pas notifiés.
    if (input.exercise) return;

    db.users
      .filter(
        (user) =>
          user.actif &&
          user.role === "module_agent" &&
          user.moduleId === moduleId &&
          userInTerritory(db, user, plan.territoireId),
      )
      .forEach((agent) => {
        const participation: Participation = {
          id: newId("part"),
          planId: plan.id,
          agentId: agent.id,
          moduleId,
          etat: "appele",
          appeleLe: plan.creeLe,
        };
        db.participations.push(participation);
        pushNotification(
          db,
          agent.id,
          "participation",
          {
            fr: input.exercise ? "Appel — exercice" : "Appel — plan déclenché",
            ar: input.exercise ? "استدعاء — تمرين" : "استدعاء — مخطط مُطلق",
          },
          {
            fr: `Vous êtes appelé pour le ${LEVEL_LABEL[plan.niveau].fr} de ${territoryOf(db, plan.territoireId)?.nom.fr ?? plan.territoireId}.`,
            ar: `تم استدعاؤكم لـ${LEVEL_LABEL[plan.niveau].ar} الخاص بـ${territoryOf(db, plan.territoireId)?.nom.ar ?? plan.territoireId}.`,
          },
        );
      });
  });

  if (input.demandeId) {
    const demande = db.demandes.find((item) => item.id === input.demandeId);
    if (demande) {
      demande.etat = "traitee";
      demande.planId = plan.id;
      demande.traiteLe = nowIso();
      demande.traiteParId = input.actorId;
    }
  }

  const label = LEVEL_LABEL[plan.niveau];
  const territory = territoryOf(db, plan.territoireId);
  if (!input.exercise) {
    notifyAuthority(
      db,
      plan.niveau,
      plan.territoireId,
      "plan_declenche",
      {
        fr: "Plan déclenché",
        ar: "تم إطلاق المخطط",
      },
      {
        fr: `Déclenchement du ${label.fr} de ${territory?.nom.fr ?? plan.territoireId}.`,
        ar: `إطلاق ${label.ar} الخاص بـ${territory?.nom.ar ?? plan.territoireId}.`,
      },
    );
  }

  appendJournal(
    db,
    input.actorId,
    input.exercise ? "LANCEMENT_EXERCICE" : "DECLENCHEMENT_PLAN",
    plan.id,
    `${label.fr} de ${plan.territoireId} déclenché${input.exercise ? " (exercice)" : ""}. Modules : ${moduleNos.join(", ")}.`,
  );

  cascadeFromPlan(db, plan, input.actorId);
  return plan;
}

/** Déclenche un plan (communal, wilaya ou national) et applique la cascade. */
export function triggerPlan(input: TriggerPlanInput): Plan {
  return updateDb((db) => createPlanInternal(db, input));
}

/** Traite une demande de déclenchement : acceptation ou refus motivé. */
export function handleTriggerRequest(
  demandeId: string,
  actorId: string,
  accept: boolean,
  motif?: string,
): Plan | undefined {
  return updateDb((db) => {
    const demande = db.demandes.find((item) => item.id === demandeId);
    if (!demande || demande.etat !== "en_attente") return undefined;

    if (!accept) {
      demande.etat = "refusee";
      demande.traiteLe = nowIso();
      demande.traiteParId = actorId;
      demande.reponse = motif;
      pushNotification(
        db,
        demande.auteurId,
        "refus",
        { fr: "Demande de déclenchement refusée", ar: "تم رفض طلب الإطلاق" },
        {
          fr: `La demande ${demande.id} a été refusée.${motif ? ` Motif : ${motif}` : ""}`,
          ar: `تم رفض الطلب ${demande.id}.${motif ? ` السبب: ${motif}` : ""}`,
        },
      );
      appendJournal(
        db,
        actorId,
        "REFUS_DECLENCHEMENT",
        demande.id,
        `Demande refusée${motif ? ` : ${motif}` : "."}`,
      );
      return undefined;
    }

    const plan = createPlanInternal(db, {
      level: demande.niveauDemande,
      territoryId: demande.territoireId,
      actorId,
      demandeId: demande.id,
    });
    pushNotification(
      db,
      demande.auteurId,
      "plan_declenche",
      { fr: "Plan déclenché", ar: "تم إطلاق المخطط" },
      {
        fr: `Votre demande ${demande.id} a été traitée : ${LEVEL_LABEL[plan.niveau].fr} déclenché.`,
        ar: `تمت معالجة طلبكم ${demande.id}: ${LEVEL_LABEL[plan.niveau].ar} تم إطلاقه.`,
      },
    );
    return plan;
  });
}

export function changePlanPhase(
  planId: string,
  phase: PlanPhase,
  actorId: string,
): void {
  updateDb((db) => {
    const plan = db.plans.find((item) => item.id === planId);
    if (!plan || plan.etat === "leve") return;
    const previous = plan.phase;
    plan.phase = phase;
    plan.majLe = nowIso();
    appendJournal(
      db,
      actorId,
      "CHANGEMENT_PHASE",
      plan.id,
      `Phase ${previous} → ${phase}.`,
    );
  });
}

/** Clôture un exercice sans toucher aux plans réels, aux alertes ni aux agents. */
export function closeExercise(planId: string, actorId: string): void {
  updateDb((db) => {
    const plan = db.plans.find((item) => item.id === planId && item.exercice);
    if (!plan || plan.etat === "leve") return;
    plan.etat = "leve";
    plan.leveLe = nowIso();
    plan.majLe = plan.leveLe;
    db.modulesMobilises
      .filter((module) => module.planId === planId && !module.libereLe)
      .forEach((module) => {
        module.libereLe = plan.leveLe;
      });
    appendJournal(db, actorId, "CLOTURE_EXERCICE", plan.id, "Exercice clos, données réelles inchangées.");
  });
}

/** Lève un plan, libère les modules et les agents, lève les alertes en cascade. */
export function liftPlan(planId: string, actorId: string): void {
  updateDb((db) => {
    const plan = db.plans.find((item) => item.id === planId);
    if (!plan || plan.etat === "leve") return;

    plan.etat = "leve";
    plan.leveLe = nowIso();
    plan.majLe = plan.leveLe;
    db.modulesMobilises
      .filter((module) => module.planId === planId && !module.libereLe)
      .forEach((module) => {
        module.libereLe = plan.leveLe;
      });
    db.participations
      .filter((participation) => participation.planId === planId && participation.etat !== "libere")
      .forEach((participation) => {
        participation.etat = "libere";
        participation.libereLe = plan.leveLe;
      });
    const liftedAlerts = db.misesEnAlerte.filter(
      (alert) => alert.planSourceId === planId && !alert.levee,
    );
    liftedAlerts.forEach((alert) => {
      alert.levee = plan.leveLe;
    });

    db.users
      .filter((user) => user.role === "module_director" && user.moduleId === "module-13")
      .forEach((director) => {
        pushNotification(
          db,
          director.id,
          "systeme",
          { fr: "Rapport à compléter", ar: "تقرير يجب استكماله" },
          {
            fr: `Le ${LEVEL_LABEL[plan.niveau].fr} de ${plan.territoireId} est levé. Le rapport détaillé est à compléter.`,
            ar: `تم رفع ${LEVEL_LABEL[plan.niveau].ar} الخاص بـ${plan.territoireId}. يجب استكمال التقرير المفصّل.`,
          },
        );
      });

    appendJournal(
      db,
      actorId,
      "LEVEE_PLAN",
      plan.id,
      `${LEVEL_LABEL[plan.niveau].fr} levé. ${liftedAlerts.length} alerte(s) levée(s) en cascade.`,
    );
  });
}

/** L'autorité demande le plan du niveau supérieur. */
export function requestSuperiorPlan(
  sourcePlanId: string,
  actorId: string,
  actorRole: Role,
  motif: string,
): DemandeDeclenchement | undefined {
  return updateDb((db) => {
    const source = db.plans.find((item) => item.id === sourcePlanId);
    if (!source || source.niveau === "national") return undefined;
    const targetLevel: PlanLevel = source.niveau === "commune" ? "wilaya" : "national";
    const targetTerritoryId =
      targetLevel === "wilaya" ? parentWilayaOf(db, source.territoireId)?.id : "dz";
    if (!targetTerritoryId) return undefined;

    const existing = db.demandes.find(
      (demande) =>
        demande.niveauDemande === targetLevel &&
        demande.territoireId === targetTerritoryId &&
        demande.etat === "en_attente",
    );
    if (existing) return existing;

    const origine =
      actorRole === "apc_president" ? "maire" : actorRole === "wali" ? "wali" : "proposition_automatique";
    const demande: DemandeDeclenchement = {
      id: newId("dem"),
      niveauDemande: targetLevel,
      territoireId: targetTerritoryId,
      origine,
      auteurId: actorId,
      motif,
      etat: "en_attente",
      creeLe: nowIso(),
      relances: [],
    };
    db.demandes.unshift(demande);
    authorityOf(db, targetLevel, targetTerritoryId).forEach((autorite) => {
      pushNotification(
        db,
        autorite.id,
        "demande_declenchement",
        {
          fr: "Demande de plan supérieur",
          ar: "طلب مخطط المستوى الأعلى",
        },
        {
          fr: `Le ${LEVEL_LABEL[source.niveau].fr} de ${source.territoireId} demande le ${LEVEL_LABEL[targetLevel].fr}. Motif : ${motif}`,
          ar: `${LEVEL_LABEL[source.niveau].ar} الخاص بـ${source.territoireId} يطلب ${LEVEL_LABEL[targetLevel].ar}. السبب: ${motif}`,
        },
      );
    });
    appendJournal(
      db,
      actorId,
      "DEMANDE_PLAN_SUPERIEUR",
      demande.id,
      `Demande du ${LEVEL_LABEL[targetLevel].fr} pour ${targetTerritoryId}.`,
    );
    return demande;
  });
}

export function triggeredPlansOfLevel(db: Db, level: PlanLevel): Plan[] {
  return db.plans.filter(
    (plan) => !plan.exercice && plan.niveau === level && plan.etat === "declenche",
  );
}

export function canTriggerNational(db: Db): boolean {
  const wilayas = new Set(triggeredPlansOfLevel(db, "wilaya").map((plan) => plan.territoireId));
  return wilayas.size >= 2;
}

export type EscalationProposal = {
  id: string;
  action: "trigger" | "request";
  targetLevel: PlanLevel;
  targetTerritoryId: string;
  sourcePlanId?: string;
  reason: Localized;
};

export function escalationProposals(db: Db, session: SessionScope): EscalationProposal[] {
  const proposals: EscalationProposal[] = [];
  const territoryId = session.territory?.id;

  if (session.role === "apc_president" && territoryId) {
    const communePlan = activePlanOf(db, "commune", territoryId);
    if (communePlan && communePlan.etat === "declenche") {
      const wilaya = parentWilayaOf(db, territoryId);
      if (wilaya && !activePlanOf(db, "wilaya", wilaya.id)) {
        proposals.push({
          id: `prop-wilaya-${communePlan.id}`,
          action: "request",
          targetLevel: "wilaya",
          targetTerritoryId: wilaya.id,
          sourcePlanId: communePlan.id,
          reason: {
            fr: "La catastrophe peut dépasser votre commune : demandez le plan de wilaya.",
            ar: "قد تتجاوز الكارثة بلديتكم: اطلبوا مخطط الولاية.",
          },
        });
      }
    }
  }

  if (session.role === "wali" && territoryId) {
    const communes = db.plans.filter(
      (plan) =>
        !plan.exercice &&
        plan.niveau === "commune" &&
        plan.etat === "declenche" &&
        territoryOf(db, plan.territoireId)?.parentId === territoryId,
    );
    const wilayaPlan = activePlanOf(db, "wilaya", territoryId);
    if (communes.length >= 2 && (!wilayaPlan || wilayaPlan.etat !== "declenche")) {
      proposals.push({
        id: `prop-wilaya-${territoryId}`,
        action: "trigger",
        targetLevel: "wilaya",
        targetTerritoryId: territoryId,
        reason: {
          fr: `${communes.length} plans communaux sont déclenchés : le plan de wilaya peut les englober.`,
          ar: `${communes.length} مخططات بلدية مُطلقة: يمكن لمخطط الولاية أن يشملها.`,
        },
      });
    }
    if (wilayaPlan?.etat === "declenche" && canTriggerNational(db)) {
      proposals.push({
        id: `prop-national-${wilayaPlan.id}`,
        action: "request",
        targetLevel: "national",
        targetTerritoryId: "dz",
        sourcePlanId: wilayaPlan.id,
        reason: {
          fr: "Deux plans de wilaya sont déclenchés : demandez le plan national.",
          ar: "تم إطلاق مخططي ولاية: اطلبوا المخطط الوطني.",
        },
      });
    }
  }

  if (session.role === "minister" && canTriggerNational(db)) {
    const activeNational = activePlanOf(db, "national", "dz");
    if (!activeNational || activeNational.etat !== "declenche") {
      proposals.push({
        id: "prop-national",
        action: "trigger",
        targetLevel: "national",
        targetTerritoryId: "dz",
        reason: {
          fr: "Au moins deux plans de wilaya sont déclenchés : le plan national peut être déclenché.",
          ar: "تم إطلاق مخططي ولاية على الأقل: يمكن إطلاق المخطط الوطني.",
        },
      });
    }
  }

  return proposals;
}

export function planLevelOfRequest(request: DemandeDeclenchement): PlanLevel {
  return request.niveauDemande;
}

export function requestTargetRole(level: PlanLevel): Role {
  return roleForLevel(level);
}

export function planAuthorityName(db: Db, plan: Plan): string {
  const territory = territoryOf(db, plan.territoireId);
  return territory?.nom.fr ?? plan.territoireId;
}

export function moduleNameOf(db: Db, moduleId: string): string {
  return findModuleDef(db, moduleId)?.nom.fr ?? moduleId;
}

export function actorName(db: Db, actorId: string): string {
  const actor = findUser(db, actorId);
  return actor ? `${actor.prenom.fr} ${actor.nom.fr}` : actorId;
}

export const ALL_TYPES: TypeCode[] = TYPES_CATASTROPHE.map((type) => type.code);

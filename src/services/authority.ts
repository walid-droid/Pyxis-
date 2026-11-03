import type { Db, DemandeDeclenchement, Participation, Plan, SessionScope } from "./model";
import { parentWilayaOf, territoryOf } from "./scope";

export function demandesForSession(db: Db, session: SessionScope): DemandeDeclenchement[] {
  const territoryId = session.territory?.id;
  return db.demandes
    .filter((demande) => {
      if (session.role === "minister") return true;
      if (!territoryId) return false;
      if (session.role === "apc_president") {
        return demande.territoireId === territoryId;
      }
      if (session.role === "wali") {
        if (demande.niveauDemande === "wilaya") return demande.territoireId === territoryId;
        return parentWilayaOf(db, demande.territoireId)?.id === territoryId;
      }
      return false;
    })
    .sort((a, b) => {
      if (a.etat === "en_attente" && b.etat !== "en_attente") return -1;
      if (b.etat === "en_attente" && a.etat !== "en_attente") return 1;
      return Date.parse(b.creeLe) - Date.parse(a.creeLe);
    });
}

export function canTreatDemande(
  session: SessionScope,
  demande: DemandeDeclenchement,
): boolean {
  const territoryId = session.territory?.id;
  if (!territoryId) return false;
  if (session.role === "apc_president") {
    return demande.niveauDemande === "commune" && demande.territoireId === territoryId;
  }
  if (session.role === "wali") {
    return demande.niveauDemande === "wilaya" && demande.territoireId === territoryId;
  }
  if (session.role === "minister") {
    return demande.niveauDemande === "national";
  }
  return false;
}

export function plansForSession(db: Db, session: SessionScope): Plan[] {
  const territoryId = session.territory?.id;
  return db.plans
    .filter((plan) => {
      if (plan.exercice) return false;
      if (session.role === "minister") return true;
      if (
        session.role === "module_agent" ||
        session.role === "module_manager" ||
        session.role === "module_director"
      ) {
        return db.modulesMobilises.some(
          (module) => module.planId === plan.id && module.moduleId === session.moduleId,
        );
      }
      if (!territoryId) return false;
      if (session.role === "apc_president") {
        if (plan.territoireId === territoryId) return true;
        return plan.niveau === "wilaya" && plan.territoireId === parentWilayaOf(db, territoryId)?.id;
      }
      if (session.role === "wali") {
        if (plan.territoireId === territoryId) return true;
        return (
          plan.niveau === "commune" &&
          territoryOf(db, plan.territoireId)?.parentId === territoryId
        );
      }
      return false;
    })
    .sort((a, b) => {
      if (a.etat === "declenche" && b.etat !== "declenche") return -1;
      if (b.etat === "declenche" && a.etat !== "declenche") return 1;
      return Date.parse(b.majLe) - Date.parse(a.majLe);
    });
}

export function alertsForSession(db: Db, session: SessionScope) {
  const territoryId = session.territory?.id;
  if (session.role === "minister") return db.misesEnAlerte;
  if (!territoryId) return [];
  return db.misesEnAlerte.filter((alert) => {
    if (alert.territoireId === territoryId) return true;
    const target = territoryOf(db, alert.territoireId);
    const scope = territoryOf(db, territoryId);
    if (!target || !scope) return false;
    if (scope.niveau === "wilaya") {
      return target.parentId === scope.id || target.id === scope.parentId;
    }
    if (scope.niveau === "commune") {
      return target.id === scope.parentId || target.parentId === scope.parentId;
    }
    return false;
  });
}

export function participationsForSession(
  db: Db,
  session: SessionScope,
): { participation: Participation; plan: Plan }[] {
  const plans = plansForSession(db, session);
  const planIds = new Set(plans.map((plan) => plan.id));
  return db.participations
    .filter((participation) => planIds.has(participation.planId))
    .map((participation) => ({
      participation,
      plan: plans.find((plan) => plan.id === participation.planId)!,
    }));
}

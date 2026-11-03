import type { Role } from "../auth/roles";
import type { Territory } from "../data/territories";
import type { TerritoryRef } from "../auth/session";
import type { Db, PlanLevel, SessionScope, User } from "./model";

export function territoryOf(db: Db, id: string | undefined): Territory | undefined {
  return id ? db.reference.territories.find((territory) => territory.id === id) : undefined;
}

export function userCoversCommune(db: Db, user: User, communeId: string): boolean {
  if (!user.territoryId) return false;
  const scope = territoryOf(db, user.territoryId);
  const commune = territoryOf(db, communeId);
  if (!scope || !commune) return false;
  if (scope.niveau === "national") return true;
  if (scope.niveau === "commune") return scope.id === communeId;
  if (scope.niveau === "wilaya") return commune.parentId === scope.id;
  return false;
}

export function userCoversTerritory(db: Db, user: User, targetId: string): boolean {
  if (!user.territoryId) return false;
  const scope = territoryOf(db, user.territoryId);
  const target = territoryOf(db, targetId);
  if (!scope || !target) return false;
  if (scope.niveau === "national") return true;
  if (scope.id === targetId) return true;
  if (scope.niveau === "wilaya") return target.parentId === scope.id || target.id === scope.parentId;
  return false;
}

/**
 * Vrai si le compte est physiquement rattaché au territoire du plan :
 * un agent communal appartient au plan de sa wilaya, un agent de wilaya
 * appartient au plan de chacune de ses communes.
 */
export function userInTerritory(db: Db, user: User, targetId: string): boolean {
  if (!user.territoryId) return false;
  const userTerritory = territoryOf(db, user.territoryId);
  const target = territoryOf(db, targetId);
  if (!userTerritory || !target) return false;
  if (target.niveau === "national" || userTerritory.niveau === "national") return true;
  if (target.niveau === "wilaya") {
    return userTerritory.id === target.id || userTerritory.parentId === target.id;
  }
  if (target.niveau === "commune") {
    return userTerritory.id === target.id || userTerritory.id === target.parentId;
  }
  return false;
}

export function roleForLevel(level: PlanLevel): Role {
  if (level === "commune") return "apc_president";
  if (level === "wilaya") return "wali";
  return "minister";
}

export function authorityOf(
  db: Db,
  level: PlanLevel,
  territoryId: string,
): User[] {
  const role = roleForLevel(level);
  return db.users.filter(
    (user) =>
      user.actif &&
      user.role === role &&
      (level === "national" || user.territoryId === territoryId),
  );
}

export function parentWilayaOf(db: Db, communeId: string): Territory | undefined {
  const commune = territoryOf(db, communeId);
  return commune?.parentId ? territoryOf(db, commune.parentId) : undefined;
}

export function levelOfTerritory(db: Db, territoryId: string): PlanLevel | undefined {
  return territoryOf(db, territoryId)?.niveau;
}

export function sessionScope(session: {
  userId: string;
  role: Role;
  moduleId?: string;
  territory?: TerritoryRef;
}): SessionScope {
  return {
    userId: session.userId,
    role: session.role,
    moduleId: session.moduleId,
    territory: session.territory,
  };
}

export const MODULE_ROLES: Role[] = ["module_agent", "module_manager", "module_director"];

export function isModuleRole(role: Role): boolean {
  return MODULE_ROLES.includes(role);
}

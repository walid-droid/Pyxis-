/**
 * Contrôle d'accès v3.0, dans l'ordre du guide master (§6.4) :
 * 1. session active ; 2. permission du rôle ; 3. module du compte ;
 * 4. territoire du compte ; 5. niveau du plan correspondant au rôle.
 */

import { territoryById } from "../data/territories";
import { ROLE_DEFS, type Role } from "./roles";
import { ROLE_PERMISSIONS, type Permission } from "./permissions";
import { isAssignmentActive, type AuthSession, type TerritoryRef } from "./session";

export type PlanLevel = "commune" | "wilaya" | "national";

export type AccessContext = {
  wilayaId?: string;
  communeId?: string;
  moduleId?: string;
  planLevel?: PlanLevel;
};

/** Niveau de plan sur lequel un rôle agit (RG-O01). */
export function planLevelForRole(role: Role): PlanLevel | null {
  switch (role) {
    case "wali":
      return "wilaya";
    case "apc_president":
      return "commune";
    case "minister":
      return "national";
    default:
      return null;
  }
}

const PLAN_ACTIONS: readonly Permission[] = [
  "TRAITER_DEMANDE_DECLENCHEMENT",
  "DECLENCHER_PLAN",
  "CHANGER_PHASE",
  "LEVER_PLAN",
  "DECLENCHER_PLAN_NATIONAL",
];

export function grantedPermissions(session: AuthSession): Set<Permission> {
  return new Set<Permission>(ROLE_PERMISSIONS[session.role]);
}

function territoryMatches(scope: TerritoryRef | undefined, context: AccessContext): boolean {
  if (!scope) return true;
  const targetCommune = context.communeId;
  const targetWilaya = context.wilayaId;
  if (!targetCommune && !targetWilaya) return true;
  if (scope.level === "national") return true;
  if (scope.level === "wilaya") {
    if (targetWilaya !== undefined) return targetWilaya === scope.id;
    if (targetCommune !== undefined) {
      return territoryById(targetCommune)?.parentId === scope.id;
    }
  }
  if (scope.level === "commune") {
    return targetCommune === undefined ? targetWilaya === undefined : targetCommune === scope.id;
  }
  return false;
}

export function canAccess(
  session: AuthSession | null,
  permission: Permission,
  context: AccessContext = {},
): boolean {
  if (!session || !isAssignmentActive(session.assignment)) return false;
  if (!grantedPermissions(session).has(permission)) return false;
  if (context.moduleId !== undefined && ROLE_DEFS[session.role].needsModule) {
    if (session.moduleId !== context.moduleId) return false;
  }
  if (!territoryMatches(session.territory, context)) return false;
  if (context.planLevel !== undefined && PLAN_ACTIONS.includes(permission)) {
    if (planLevelForRole(session.role) !== context.planLevel) return false;
  }
  return true;
}

export function canAccessAny(
  session: AuthSession | null,
  permissions: readonly Permission[],
  context: AccessContext = {},
): boolean {
  return permissions.some((permission) => canAccess(session, permission, context));
}

export function hasRole(session: AuthSession | null, ...roles: Role[]): boolean {
  return session !== null && roles.includes(session.role);
}

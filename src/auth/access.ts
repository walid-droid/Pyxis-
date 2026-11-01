/**
 * Contrôle d'accès, dans l'ordre du document « Rôles et permissions » :
 * 1. compte connecté et actif ; 2. permission accordée par le rôle ou par une
 * fonction en cours ; 3. objet dans son territoire / son organisme ;
 * 4. niveau du plan correspondant au rôle (RG-O01).
 */

import {
  DESIGNATION_PERMISSIONS,
  IMPLICIT_DESIGNATIONS,
  ROLE_PERMISSIONS,
  type DesignationFn,
  type Permission,
} from "./permissions";
import { ROLE_DEFS, type Role } from "./roles";
import {
  activeDesignations,
  isAssignmentActive,
  type AuthSession,
} from "./session";

/** Niveaux de plan, identiques à PlanLevel (pages/shared/plan/orsecPlan.ts). */
export type PlanLevel = "commune" | "wilaya" | "national" | "site";

export type AccessContext = {
  wilayaId?: string;
  communeId?: string;
  siteId?: string;
  organismId?: string;
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
    case "site_operator":
      return "site";
    default:
      return null;
  }
}

const PLAN_ACTIONS: readonly Permission[] = [
  "APPROUVER_PLAN",
  "METTRE_EN_ALERTE_PLAN",
  "DECLENCHER_PLAN",
  "LEVER_PLAN",
];

export function designationsOf(session: AuthSession): DesignationFn[] {
  const explicit = activeDesignations(session).map((item) => item.fn);
  const implicit = IMPLICIT_DESIGNATIONS[session.role] ?? [];
  return Array.from(new Set([...explicit, ...implicit]));
}

export function grantedPermissions(session: AuthSession): Set<Permission> {
  const granted = new Set<Permission>(ROLE_PERMISSIONS[session.role]);
  for (const fn of designationsOf(session)) {
    DESIGNATION_PERMISSIONS[fn].forEach((permission) => granted.add(permission));
  }
  return granted;
}

function inTerritory(session: AuthSession, context: AccessContext): boolean {
  if (session.role === "minister") return true;
  const territory = session.territory;
  if (territory?.level === "wilaya") {
    if (context.wilayaId !== undefined) return context.wilayaId === territory.id;
    return context.communeId === undefined && context.siteId === undefined;
  }
  if (territory?.level === "commune") {
    if (context.communeId !== undefined) return context.communeId === territory.id;
    return context.wilayaId === undefined && context.siteId === undefined;
  }
  if (ROLE_DEFS[session.role].territoryScope === "site") {
    return context.siteId === undefined || context.siteId === session.siteId;
  }
  return true;
}

export function canAccess(
  session: AuthSession | null,
  permission: Permission,
  context: AccessContext = {},
): boolean {
  if (!session || !isAssignmentActive(session.assignment)) return false;
  if (!grantedPermissions(session).has(permission)) return false;
  if (!inTerritory(session, context)) return false;
  if (
    context.organismId !== undefined &&
    ROLE_DEFS[session.role].needsOrganism &&
    session.organismId !== context.organismId
  ) {
    return false;
  }
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

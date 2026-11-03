/**
 * Tests unitaires du contrôle d'accès v3.0 (guide master ORSEC §6.4).
 * Les tests sont des modules purs ; la chaîne de build (`tsc -b`) les valide.
 */

import { canAccess, canAccessAny, hasRole, planLevelForRole } from "../src/auth/access";
import { getAuthSession, isAssignmentActive, startSession, type AuthSession } from "../src/auth/session";
import { ROLE_DEFS, type Role } from "../src/auth/roles";

function expectTrue(condition: unknown, message: string): void {
  if (!condition) throw new Error(`Échec du test : ${message}`);
}

function expectFalse(condition: unknown, message: string): void {
  if (condition) throw new Error(`Échec du test : ${message}`);
}

function sessionFor(role: Role, moduleId?: string): AuthSession {
  startSession({ email: "test@cadm.dz", phone: "0555", role, moduleId });
  const session = getAuthSession();
  if (!session) throw new Error("Session introuvable");
  return session;
}

/** RG-O01 : chaque rôle d'autorité agit sur un niveau de plan unique. */
function testAuthorityPlanLevels(): void {
  expectTrue(planLevelForRole("wali") === "wilaya", "le wali agit sur une wilaya");
  expectTrue(planLevelForRole("apc_president") === "commune", "l'APC agit sur une commune");
  expectTrue(planLevelForRole("minister") === "national", "le ministre agit sur le national");
  expectTrue(planLevelForRole("module_agent") === null, "un agent de module n'a pas de niveau");
}

/** RG-O02 : le citoyen signe, l'admin ne consulte pas les signalements. */
function testCitizenAndAdminPermissions(): void {
  const citizen = sessionFor("citizen");
  expectTrue(canAccess(citizen, "CREER_SIGNALEMENT"), "le citoyen crée un signalement");
  expectTrue(canAccess(citizen, "SUIVRE_MON_SIGNALEMENT"), "le citoyen suit ses signalements");
  expectFalse(
    canAccess(sessionFor("admin"), "CREER_SIGNALEMENT"),
    "l'administrateur ne crée pas de signalement",
  );
}

/** Les autorités sont scopées par niveau de plan (RG-O01). */
function testAuthorityScoping(): void {
  const wali = sessionFor("wali");
  expectTrue(
    canAccess(wali, "DECLENCHER_PLAN", { planLevel: "wilaya" }),
    "le wali déclenche le plan de wilaya",
  );
  expectFalse(
    canAccess(wali, "DECLENCHER_PLAN", { planLevel: "national" }),
    "le wali ne déclenche pas le plan national",
  );

  const minister = sessionFor("minister");
  expectTrue(
    canAccess(minister, "DECLENCHER_PLAN_NATIONAL"),
    "le ministre déclenche le plan national",
  );
}

/** Les rôles de module sont scopés par module (RG-O03). */
function testModuleScoping(): void {
  const manager = sessionFor("module_manager", "module-1");
  expectTrue(
    canAccessAny(manager, ["LANCER_INTERVENTION", "AFFECTER_AGENTS"], { moduleId: "module-1" }),
    "le responsable de module agit sur son module",
  );
  expectFalse(
    canAccessAny(manager, ["LANCER_INTERVENTION", "AFFECTER_AGENTS"], { moduleId: "module-8" }),
    "le responsable de module est scopé à son module",
  );
  expectTrue(
    hasRole(sessionFor("module_agent"), "module_agent"),
    "l'agent porte bien le rôle module_agent",
  );
}

export const ACCESS_TESTS: Array<() => void> = [
  testAuthorityPlanLevels,
  testCitizenAndAdminPermissions,
  testAuthorityScoping,
  testModuleScoping,
];

export function runAccessTests(): void {
  for (const test of ACCESS_TESTS) test();
}

export const ACCESS_ROLE_COUNT: number = Object.keys(ROLE_DEFS).length;

export function runAccessSuite(): void {
  runAccessTests();
  const session = getAuthSession();
  if (!session || !isAssignmentActive(session.assignment)) {
    throw new Error("Échec du test : affectation inactive");
  }
}

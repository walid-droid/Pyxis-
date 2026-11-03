/**
 * Tests de la cascade de plans (spec v3.0 §6.2–§6.3) :
 * isolation des exercices, seuil d'escalade nationale, périmètre des signalements.
 */

import { TYPE_CODES, type TypeCode } from "../src/data/types";
import type { Plan } from "../src/services/model";
import {
  canTriggerNational,
  signalementsForPlan,
  triggeredPlansOfLevel,
  typesForPlan,
} from "../src/services/plans";
import { createSeedDb } from "../src/services/seed";

function expectTrue(condition: unknown, message: string): void {
  if (!condition) throw new Error(`Échec du test : ${message}`);
}

function makePlan(
  overrides: Partial<Plan> & Pick<Plan, "id" | "niveau" | "territoireId">,
): Plan {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    phase: "urgence",
    etat: "declenche",
    creeLe: now,
    majLe: now,
    exercice: false,
    ...overrides,
  };
}

/** Un exercice ne doit jamais apparaître dans les plans opérationnels (RG exercice). */
export function assertExerciseIsolation(): void {
  const db = createSeedDb();
  db.plans.push(
    makePlan({ id: "plan-test-reel", niveau: "wilaya", territoireId: "wilaya-bejaia" }),
    makePlan({
      id: "plan-test-exercice",
      niveau: "wilaya",
      territoireId: "wilaya-bejaia",
      exercice: true,
    }),
  );

  const triggered = triggeredPlansOfLevel(db, "wilaya");
  expectTrue(
    triggered.some((plan) => plan.id === "plan-test-reel"),
    "le plan réel est visible",
  );
  expectTrue(
    !triggered.some((plan) => plan.id === "plan-test-exercice"),
    "le plan d'exercice est exclu",
  );
  expectTrue(
    triggered.every((plan) => plan.etat === "declenche"),
    "seuls les plans déclenchés sont listés",
  );
}

/** L'escalade nationale exige au moins deux wilayas réellement déclenchées. */
export function assertNationalEscalationThreshold(): void {
  const db = createSeedDb();
  expectTrue(canTriggerNational(db) === false, "pas d'escalade sans plan de wilaya");

  db.plans.push(makePlan({ id: "plan-w1", niveau: "wilaya", territoireId: "wilaya-bejaia" }));
  expectTrue(canTriggerNational(db) === false, "une seule wilaya ne suffit pas");

  db.plans.push(makePlan({ id: "plan-w2", niveau: "wilaya", territoireId: "wilaya-setif" }));
  expectTrue(canTriggerNational(db) === true, "deux wilayas déclenchent l'escalade nationale");
}

/** Les exercices ne comptent pas dans le seuil national. */
export function assertExercisesDoNotEscalate(): void {
  const db = createSeedDb();
  db.plans.push(
    makePlan({ id: "ex-w1", niveau: "wilaya", territoireId: "wilaya-bejaia", exercice: true }),
    makePlan({ id: "ex-w2", niveau: "wilaya", territoireId: "wilaya-setif", exercice: true }),
  );
  expectTrue(canTriggerNational(db) === false, "deux exercices ne déclenchent pas l'escalade");
}

/** Le périmètre d'un plan filtre les signalements par commune, wilaya ou national. */
export function assertPlanSignalementScope(): void {
  const db = createSeedDb();

  const communal = signalementsForPlan(db, "commune", "commune-bejaia");
  expectTrue(
    communal.every((item) => item.communeId === "commune-bejaia" && item.etat !== "rejete"),
    "filtre communal",
  );

  const wilaya = signalementsForPlan(db, "wilaya", "wilaya-bejaia");
  const parentOf = (communeId: string) =>
    db.reference.territories.find((territory) => territory.id === communeId)?.parentId;
  expectTrue(
    wilaya.every(
      (item) => parentOf(item.communeId) === "wilaya-bejaia" && item.etat !== "rejete",
    ),
    "filtre wilaya",
  );

  const national = signalementsForPlan(db, "national", "dz");
  expectTrue(
    national.every((item) => item.etat !== "rejete"),
    "filtre national : les signalements rejetés restent exclus",
  );

  const types = typesForPlan(db, "national", "dz");
  expectTrue(new Set(types).size === types.length, "types dédupliqués");
  expectTrue(
    types.every((type) => TYPE_CODES.includes(type as TypeCode)),
    "types de catastrophe valides",
  );
}

export const CASCADE_TESTS: Array<() => void> = [
  assertExerciseIsolation,
  assertNationalEscalationThreshold,
  assertExercisesDoNotEscalate,
  assertPlanSignalementScope,
];

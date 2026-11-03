/**
 * Tests du routage automatique citoyen → modules de premier envoi (spec v3.0 §6.1).
 * Le citoyen ne choisit jamais d'organisme : `FIRST_WAVE` porte le routage.
 */

import { MODULES, type ModuleNo } from "../src/data/modules";
import { TYPE_CODES } from "../src/data/types";
import { URGENCE } from "../src/data/moduleMatrix";
import { FIRST_WAVE, firstWaveModules } from "../src/data/moduleParType";

function expectTrue(condition: unknown, message: string): void {
  if (!condition) throw new Error(`Échec du test : ${message}`);
}

const MODULE_NUMBERS = new Set<ModuleNo>(MODULES.map((module) => module.no));

/** Chaque type C1–C10 doit avoir au moins un module de premier envoi valide. */
export function assertFirstWaveCoverage(): void {
  for (const type of TYPE_CODES) {
    const modules = FIRST_WAVE[type];
    expectTrue(Array.isArray(modules), `premier envoi défini pour ${type}`);
    expectTrue(modules.length > 0, `premier envoi non vide pour ${type}`);
    expectTrue(new Set(modules).size === modules.length, `pas de doublon pour ${type}`);
    for (const no of modules) {
      expectTrue(MODULE_NUMBERS.has(no), `module ${no} inconnu pour ${type}`);
    }
  }
}

/** Le premier envoi ne peut pas viser un module exclu de la phase d'urgence. */
export function assertFirstWaveMatchesMatrix(): void {
  for (const type of TYPE_CODES) {
    for (const no of firstWaveModules(type)) {
      const cell = URGENCE[no][type];
      expectTrue(
        cell !== false,
        `M${no} est exclu en urgence pour ${type} mais figure au premier envoi`,
      );
    }
  }
}

export function assertFirstWaveUnknownTypeFallback(): void {
  expectTrue(firstWaveModules("C10").length > 0, "C10 a un premier envoi");
}

export const ROUTING_TESTS: Array<() => void> = [
  assertFirstWaveCoverage,
  assertFirstWaveMatchesMatrix,
  assertFirstWaveUnknownTypeFallback,
];

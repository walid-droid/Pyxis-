import type { ModuleNo } from "./modules";
import type { TypeCode } from "./types";

/**
 * Modules de premier envoi par type de catastrophe (guide master v3.0, §6.1).
 * Le routage automatique utilise cette table : le citoyen ne choisit pas d'organisme.
 */
export const FIRST_WAVE: Record<TypeCode, ModuleNo[]> = {
  C1: [1, 8],
  C2: [1, 8],
  C3: [1, 8],
  C4: [1, 10],
  C5: [1, 6],
  C6: [1, 3],
  C7: [3],
  C8: [3],
  C9: [3, 1],
  C10: [1, 2],
};

export function firstWaveModules(type: TypeCode): ModuleNo[] {
  return FIRST_WAVE[type] ?? [];
}

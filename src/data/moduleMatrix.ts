import type { ModuleNo } from "./modules";
import type { TypeCode } from "./types";

/**
 * Matrice module × type × phase (guide master v3.0, tableaux 11 et 12).
 *
 * IMPORTANT : les cellules illisibles sur le document source restent `"TODO"`.
 * Le test `tests/matrix.test.ts` échoue tant qu'il en reste. Seules les règles
 * explicitement lisibles dans la spécification sont encodées ici :
 *  - en urgence, les modules 1 à 4 sont cochés pour C1–C10 ;
 *  - la solidarité (5) n'est pas mobilisée pour C4, C5, C6, C8, C10 ;
 *  - l'hébergement (7) n'intervient pas pour C7 ni C9 ;
 *  - en réhabilitation, les modules marqués * (1, 2, 3, 5, 10) sont absents.
 */
export type MatrixCell = boolean | "TODO";

export type ModuleMatrix = Record<ModuleNo, Record<TypeCode, MatrixCell>>;

export type MatrixPhase = "URGENCE" | "REHABILITATION";

const TODO: MatrixCell = "TODO";

function row(value: MatrixCell): Record<TypeCode, MatrixCell> {
  return {
    C1: value,
    C2: value,
    C3: value,
    C4: value,
    C5: value,
    C6: value,
    C7: value,
    C8: value,
    C9: value,
    C10: value,
  };
}

function rowWith(overrides: Partial<Record<TypeCode, MatrixCell>>): Record<TypeCode, MatrixCell> {
  return { ...row(TODO), ...overrides };
}

export const URGENCE: ModuleMatrix = {
  1: row(true),
  2: row(true),
  3: row(true),
  4: row(true),
  5: rowWith({ C4: false, C5: false, C6: false, C8: false, C10: false }),
  6: row(TODO),
  7: rowWith({ C7: false, C9: false }),
  8: row(TODO),
  9: row(TODO),
  10: row(TODO),
  11: row(TODO),
  12: row(TODO),
  13: row(TODO),
};

export const REHABILITATION: ModuleMatrix = {
  1: row(false),
  2: row(false),
  3: row(false),
  4: row(TODO),
  5: row(false),
  6: row(TODO),
  7: row(TODO),
  8: row(TODO),
  9: row(TODO),
  10: row(false),
  11: row(TODO),
  12: row(TODO),
  13: row(TODO),
};

export const DEFAULT_MATRIX = {
  URGENCE,
  REHABILITATION,
};

export function matrixValue(
  phase: MatrixPhase,
  moduleNo: ModuleNo,
  type: TypeCode,
): MatrixCell {
  return phase === "URGENCE" ? URGENCE[moduleNo][type] : REHABILITATION[moduleNo][type];
}

export function countTodo(matrix: ModuleMatrix): number {
  return Object.values(matrix).reduce(
    (total, cells) => total + Object.values(cells).filter((cell) => cell === "TODO").length,
    0,
  );
}

export function isModuleMobilized(
  matrix: ModuleMatrix,
  moduleNo: ModuleNo,
  types: TypeCode[],
): boolean {
  return types.some((type) => matrix[moduleNo][type] === true);
}

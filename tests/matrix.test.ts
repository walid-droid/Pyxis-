/**
 * Tests de la matrice module × type × phase (guide master v3.0, tableaux 11–12).
 * Sans runner installé, le module est validé par `tsc -b` (inclus dans le build).
 * `assertMatrixComplete` échoue volontairement tant qu'une cellule reste `"TODO"`.
 */

import { MODULES, type ModuleNo } from "../src/data/modules";
import { TYPE_CODES, type TypeCode } from "../src/data/types";
import {
  REHABILITATION,
  URGENCE,
  type MatrixCell,
  type ModuleMatrix,
} from "../src/data/moduleMatrix";

function expectTrue(condition: unknown, message: string): void {
  if (!condition) throw new Error(`Échec du test : ${message}`);
}

export type MatrixCellRef = {
  phase: "URGENCE" | "REHABILITATION";
  moduleNo: ModuleNo;
  type: TypeCode;
  value: MatrixCell;
};

function cellsOf(matrix: ModuleMatrix, phase: MatrixCellRef["phase"]): MatrixCellRef[] {
  const cells: MatrixCellRef[] = [];
  for (const module of MODULES) {
    for (const type of TYPE_CODES) {
      cells.push({ phase, moduleNo: module.no, type, value: matrix[module.no][type] });
    }
  }
  return cells;
}

export function matrixCells(): MatrixCellRef[] {
  return [...cellsOf(URGENCE, "URGENCE"), ...cellsOf(REHABILITATION, "REHABILITATION")];
}

export function todoCells(): MatrixCellRef[] {
  return matrixCells().filter((cell) => cell.value === "TODO");
}

/** Vérifie la forme : 13 modules × 10 types × 2 phases et des valeurs autorisées. */
export function assertMatrixShape(): void {
  expectTrue(MODULES.length === 13, "13 modules attendus");
  expectTrue(TYPE_CODES.length === 10, "10 types C1–C10 attendus");
  expectTrue(matrixCells().length === 260, "260 cellules attendues (13 × 10 × 2)");

  for (const cell of matrixCells()) {
    expectTrue(
      cell.value === true || cell.value === false || cell.value === "TODO",
      `cellule invalide ${cell.phase} M${cell.moduleNo} ${cell.type}`,
    );
  }

  for (const module of MODULES) {
    for (const type of TYPE_CODES) {
      expectTrue(type in URGENCE[module.no], `urgence M${module.no} : ${type} manquant`);
      expectTrue(
        type in REHABILITATION[module.no],
        `réhabilitation M${module.no} : ${type} manquant`,
      );
    }
  }
}

/**
 * Échoue tant qu'il reste des cellules `"TODO"` : exigence explicite de la spec
 * (le propriétaire du projet doit remplir la matrice depuis les pages 11–12).
 */
export function assertMatrixComplete(): void {
  const todos = todoCells();
  if (todos.length === 0) return;
  const list = todos.map((cell) => `${cell.phase}:M${cell.moduleNo}:${cell.type}`).join(", ");
  throw new Error(`Matrice incomplète — ${todos.length} cellule(s) TODO : ${list}`);
}

export const MATRIX_TESTS: Array<() => void> = [assertMatrixShape, assertMatrixComplete];

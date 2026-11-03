import type { Localized } from "../data/locale";
import type { MatrixCell } from "../data/moduleMatrix";
import type { ModuleNo } from "../data/modules";
import type { Territory, TerritoryLevel } from "../data/territories";
import type { TypeCode } from "../data/types";
import { appendJournal, updateDb } from "./store";

export function updateModuleRef(
  moduleId: string,
  patch: { nom?: Localized; mission?: Localized; organismes?: Localized[]; rehabilitation?: boolean },
  actorId: string,
): void {
  updateDb((db) => {
    const module = db.reference.modules.find((item) => item.id === moduleId);
    if (!module) return;
    if (patch.nom) module.nom = patch.nom;
    if (patch.mission) module.mission = patch.mission;
    if (patch.organismes) module.organismes = patch.organismes;
    if (patch.rehabilitation !== undefined) module.rehabilitation = patch.rehabilitation;
    appendJournal(db, actorId, "MODIFICATION_MODULE", moduleId, "Référentiel du module modifié.");
  });
}

export function updateTypeRef(
  typeId: TypeCode,
  patch: { libelle?: Localized; consignes?: Localized },
  actorId: string,
): void {
  updateDb((db) => {
    const type = db.reference.types.find((item) => item.code === typeId);
    if (!type) return;
    if (patch.libelle) type.libelle = patch.libelle;
    if (patch.consignes) type.consignes = patch.consignes;
    appendJournal(db, actorId, "MODIFICATION_TYPE", typeId, "Type de catastrophe ou consignes modifiés.");
  });
}

export function setMatrixCell(
  phase: "URGENCE" | "REHABILITATION",
  moduleNo: ModuleNo,
  type: TypeCode,
  value: MatrixCell,
  actorId: string,
): void {
  updateDb((db) => {
    db.reference.matrix[phase][moduleNo][type] = value;
    appendJournal(
      db,
      actorId,
      "MODIFICATION_MATRICE",
      `${phase}:${moduleNo}:${type}`,
      `Cellule fixée à ${String(value)}.`,
    );
  });
}

export function addTerritory(
  input: {
    nom: Localized;
    code: string;
    niveau: TerritoryLevel;
    parentId?: string;
  },
  actorId: string,
): Territory | undefined {
  return updateDb((db) => {
    const exists = db.reference.territories.some(
      (territory) => territory.code === input.code || territory.nom.fr === input.nom.fr,
    );
    if (exists) return undefined;
    const territory: Territory = {
      id: `territory-${input.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      code: input.code,
      nom: input.nom,
      niveau: input.niveau,
      parentId: input.parentId,
    };
    db.reference.territories.push(territory);
    appendJournal(db, actorId, "CREATION_TERRITOIRE", territory.id, `Territoire ${input.nom.fr} créé.`);
    return territory;
  });
}

export function addVoisinage(territoireA: string, territoireB: string, actorId: string): void {
  updateDb((db) => {
    if (territoireA === territoireB) return;
    const exists = db.reference.voisinage.some(
      (pair) =>
        (pair.territoireA === territoireA && pair.territoireB === territoireB) ||
        (pair.territoireA === territoireB && pair.territoireB === territoireA),
    );
    if (exists) return;
    db.reference.voisinage.push({ territoireA, territoireB });
    appendJournal(db, actorId, "AJOUT_VOISINAGE", `${territoireA}/${territoireB}`, "Voisinage ajouté.");
  });
}

import type { Lang } from "../i18n";
import type { Localized } from "../data/locale";
import type { Role } from "../auth/roles";
import type {
  Db,
  MainCouranteCategory,
  MainCouranteEntry,
  MainCouranteScope,
  SessionScope,
} from "./model";
import { plansForSession } from "./authority";
import { GENESIS_HASH, mainCouranteHash } from "./hash";
import { appendJournal, newId, nowIso, updateDb } from "./store";

export const MAIN_COURANTE_CATEGORIES: MainCouranteCategory[] = [
  "alerte",
  "operation",
  "victime",
  "moyen",
  "decision",
  "communication",
  "rehabilitation",
];

export type NewMainCouranteInput = {
  authorId: string;
  role: Role;
  scope: MainCouranteScope;
  moduleId?: string;
  planId?: string;
  category: MainCouranteCategory;
  message: Localized;
  coordinates?: [number, number];
  amendmentOf?: string;
  syncStatus?: "local" | "synced";
  at?: string;
  assignmentId?: string;
};

function entryHash(entry: Omit<MainCouranteEntry, "hash">): string {
  return mainCouranteHash({
    at: entry.at,
    authorId: entry.authorId,
    scope: entry.scope,
    category: entry.category,
    messageFr: entry.message.fr,
    messageAr: entry.message.ar,
    prevHash: entry.prevHash,
    moduleId: entry.moduleId,
    planId: entry.planId,
    coordinates: entry.coordinates,
    amendmentOf: entry.amendmentOf,
  });
}

function lastEntry(db: Db): MainCouranteEntry | undefined {
  return [...db.mainCourante].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).at(-1);
}

/** Ajoute une entrée scellée dans une copie de la base (usage interne/seed). */
export function appendMainCouranteTo(
  db: Db,
  input: NewMainCouranteInput,
): MainCouranteEntry {
  const previous = lastEntry(db);
  const base: Omit<MainCouranteEntry, "hash"> = {
    id: newId("mc"),
    at: input.at ?? nowIso(),
    authorId: input.authorId,
    assignmentId: input.assignmentId,
    role: input.role,
    scope: input.scope,
    moduleId: input.moduleId,
    planId: input.planId,
    category: input.category,
    message: input.message,
    coordinates: input.coordinates,
    amendmentOf: input.amendmentOf,
    prevHash: previous?.hash ?? GENESIS_HASH,
    syncStatus: input.syncStatus ?? "synced",
  };
  const entry: MainCouranteEntry = { ...base, hash: entryHash(base) };
  db.mainCourante.unshift(entry);
  appendJournal(
    db,
    input.authorId,
    "MAIN_COURANTE",
    entry.id,
    `Entrée ${entry.category} (${entry.scope}) — ${entry.message.fr}`,
  );
  return entry;
}

/** Ajoute une entrée depuis l'interface (persistée et notifiée). */
export function addMainCourante(input: NewMainCouranteInput): MainCouranteEntry {
  return updateDb((db) => appendMainCouranteTo(db, input));
}

/** Marque les entrées locales comme synchronisées (simulation de reconnexion). */
export function syncMainCourante(moduleId?: string): number {
  return updateDb((db) => {
    const entries = db.mainCourante.filter(
      (entry) =>
        entry.syncStatus === "local" && (moduleId === undefined || entry.moduleId === moduleId),
    );
    entries.forEach((entry) => {
      entry.syncStatus = "synced";
    });
    return entries.length;
  });
}

export function mainCouranteForPlan(db: Db, planId: string): MainCouranteEntry[] {
  return db.mainCourante
    .filter((entry) => entry.planId === planId)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

/** Fil partagé : le PCF lit tout son périmètre, un module lit son fil et les décisions PCF. */
export function mainCouranteForScope(db: Db, scope: SessionScope): MainCouranteEntry[] {
  const planIds = new Set(plansForSession(db, scope).map((plan) => plan.id));
  return db.mainCourante
    .filter((entry) => {
      if (scope.role === "module_agent" || scope.role === "module_manager" || scope.role === "module_director") {
        return (
          entry.moduleId === scope.moduleId ||
          entry.scope === "pcf" ||
          entry.scope === "authority" ||
          (entry.planId !== undefined && planIds.has(entry.planId))
        );
      }
      if (planIds.size === 0) return entry.scope === "pcf" || entry.scope === "authority";
      return entry.planId !== undefined && planIds.has(entry.planId);
    })
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export type ChainCheck = {
  ok: boolean;
  checked: number;
  brokenAt?: string;
};

/** Vérifie le chaînage append-only de la main courante. */
export function verifyMainCouranteChain(db: Db): ChainCheck {
  const entries = [...db.mainCourante].sort(
    (a, b) => Date.parse(a.at) - Date.parse(b.at),
  );
  let previous = GENESIS_HASH;
  for (const entry of entries) {
    if (entry.prevHash !== previous || entry.hash !== entryHash(entry)) {
      return { ok: false, checked: entries.length, brokenAt: entry.id };
    }
    previous = entry.hash;
  }
  return { ok: true, checked: entries.length };
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function mainCouranteCsv(entries: MainCouranteEntry[], lang: Lang): string {
  const header = [
    "id",
    "at",
    "authorId",
    "role",
    "scope",
    "category",
    "moduleId",
    "planId",
    "message",
    "syncStatus",
    "prevHash",
    "hash",
  ];
  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.at,
      entry.authorId,
      entry.role,
      entry.scope,
      entry.category,
      entry.moduleId ?? "",
      entry.planId ?? "",
      entry.message[lang],
      entry.syncStatus,
      entry.prevHash,
      entry.hash,
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

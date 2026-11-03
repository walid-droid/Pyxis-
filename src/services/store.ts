import { currentAssignmentId, getAuthSession } from "../auth/session";
import type { Db, JournalEntry } from "./model";
import { createSeedDb } from "./seed";

const STORAGE_KEY = "cadm-v3-db";
const DB_VERSION = 2;

type Listener = () => void;
const listeners = new Set<Listener>();
let memoryDb: Db | null = null;
let cacheRaw: string | null | undefined;
let cacheDb: Db | null = null;

function notify(): void {
  listeners.forEach((listener) => listener());
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persist(db: Db): void {
  const raw = JSON.stringify(db);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    memoryDb = db;
  }
  cacheRaw = raw;
  cacheDb = db;
}

function isDb(value: unknown): value is Db {
  if (!value || typeof value !== "object") return false;
  const db = value as Partial<Db>;
  return (
    db.version === DB_VERSION &&
    Array.isArray(db.users) &&
    Array.isArray(db.signalements) &&
    Array.isArray(db.plans) &&
    Array.isArray(db.situationTransitions) &&
    Array.isArray(db.mainCourante) &&
    Array.isArray(db.requisitions) &&
    Array.isArray(db.communiques) &&
    Array.isArray(db.moduleSnapshots) &&
    !!db.reference
  );
}

export function getDb(): Db {
  const raw = readStored();
  if (raw === null) {
    if (!memoryDb) {
      memoryDb = createSeedDb();
      persist(memoryDb);
    } else if (cacheDb?.version !== DB_VERSION) {
      cacheDb = memoryDb;
    }
    return memoryDb;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = JSON.parse(raw) as unknown;
      cacheDb = isDb(parsed) ? parsed : createSeedDb();
    } catch {
      cacheDb = createSeedDb();
    }
  }
  if (!cacheDb) cacheDb = createSeedDb();
  return cacheDb;
}

export function subscribeDb(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cacheRaw = undefined;
      listener();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Applique une mutation sur une copie, persiste et notifie les écrans. */
export function updateDb<T>(mutator: (db: Db) => T): T {
  const next = JSON.parse(JSON.stringify(getDb())) as Db;
  const result = mutator(next);
  next.version = DB_VERSION;
  persist(next);
  notify();
  return result;
}

export function replaceDb(next: Db): void {
  persist(next);
  notify();
}

export function resetDb(): void {
  memoryDb = createSeedDb();
  persist(memoryDb);
  notify();
}

export function newId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}-${suffix}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Écrit une entrée de journal avec l'affectation active du compte. */
export function appendJournal(
  db: Db,
  acteurId: string,
  action: string,
  objet: string,
  details: string,
): JournalEntry {
  const session = getAuthSession();
  const entry: JournalEntry = {
    id: newId("j"),
    acteurId,
    action,
    objet,
    details,
    date: nowIso(),
    assignmentId: currentAssignmentId(session) ?? undefined,
  };
  db.journal.unshift(entry);
  return entry;
}

export function resetCacheForTests(): void {
  memoryDb = null;
  cacheRaw = undefined;
  cacheDb = null;
}

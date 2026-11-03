/**
 * Session unique de l'application (démo : aucun backend).
 * Un seul compte connecté à la fois, avec un seul rôle. L'affectation
 * (titulaire, suppléant, intérim) reste portée par le compte et son identifiant
 * est scellé dans chaque entrée du journal.
 */

import { isRole, type Role } from "./roles";

const SESSION_KEY = "cadm-auth-session-v3";

export type TitleType = "TITULAIRE" | "SUPPLEANT_1" | "SUPPLEANT_2" | "INTERIM";

export type Assignment = {
  id: string;
  titleType: TitleType;
  /** ISO 8601. */
  from: string;
  /** ISO 8601 ; absent = en cours. */
  to?: string;
};

export type TerritoryRef = {
  level: "commune" | "wilaya" | "national";
  id: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  phone?: string;
  role: Role;
  moduleId?: string;
  territory?: TerritoryRef;
  available?: boolean;
  assignment: Assignment;
  createdAt: number;
};

export type NewSession = {
  email: string;
  phone?: string;
  role: Role;
  userId?: string;
  moduleId?: string;
  territory?: TerritoryRef;
  available?: boolean;
  titleType?: TitleType;
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY || event.key === null) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parse(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<AuthSession> | null;
    if (!value || typeof value.email !== "string" || !isRole(value.role)) {
      return null;
    }
    const assignment: Assignment =
      value.assignment && isIso(value.assignment.from)
        ? value.assignment
        : {
            id: `aff-${value.userId ?? value.email}`,
            titleType: "TITULAIRE",
            from: new Date(value.createdAt ?? Date.now()).toISOString(),
          };
    return {
      userId: value.userId ?? value.email,
      email: value.email,
      phone: value.phone,
      role: value.role,
      moduleId: value.moduleId,
      territory: value.territory,
      available: value.available,
      assignment,
      createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

let cacheRaw: string | null | undefined;
let cacheValue: AuthSession | null = null;

export function getAuthSession(): AuthSession | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SESSION_KEY);
  } catch {
    return cacheValue;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheValue = parse(raw);
  }
  return cacheValue;
}

function write(session: AuthSession | null): void {
  try {
    if (session) {
      const raw = JSON.stringify(session);
      localStorage.setItem(SESSION_KEY, raw);
      cacheRaw = raw;
      cacheValue = session;
    } else {
      localStorage.removeItem(SESSION_KEY);
      cacheRaw = null;
      cacheValue = null;
    }
  } catch {
    cacheValue = session;
  }
  notify();
}

export function startSession(input: NewSession): AuthSession {
  const now = new Date().toISOString();
  const userId = input.userId ?? input.email;
  const session: AuthSession = {
    userId,
    email: input.email,
    phone: input.phone,
    role: input.role,
    moduleId: input.moduleId,
    territory: input.territory,
    available: input.available,
    assignment: {
      id: `aff-${userId}-${Date.now().toString(36)}`,
      titleType: input.titleType ?? "TITULAIRE",
      from: now,
    },
    createdAt: Date.now(),
  };
  write(session);
  return session;
}

export function updateSession(patch: Partial<Pick<AuthSession, "available" | "moduleId" | "territory">>): void {
  const current = getAuthSession();
  if (!current) return;
  write({ ...current, ...patch });
}

export function endSession(): void {
  write(null);
}

/** Identifiant d'affectation scellé dans toute décision ou entrée de journal. */
export function currentAssignmentId(session: AuthSession | null): string | null {
  return session && isAssignmentActive(session.assignment) ? session.assignment.id : null;
}

export function isAssignmentActive(assignment: Assignment, at: number = Date.now()): boolean {
  const from = Date.parse(assignment.from);
  const to = assignment.to ? Date.parse(assignment.to) : Number.POSITIVE_INFINITY;
  return from <= at && at < to;
}

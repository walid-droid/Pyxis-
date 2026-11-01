/**
 * Session unique de l'application (démo : aucun backend d'authentification).
 * Un seul compte connecté à la fois, avec un seul rôle ; les fonctions de crise
 * passent par les désignations. L'affectation (titulaire, suppléant, intérim)
 * est portée par le compte : elle sera scellée dans chaque décision journalisée.
 */

import {
  DESIGNATION_FNS,
  type DesignationFn,
} from "./permissions";
import { isRole, type Role } from "./roles";

const SESSION_KEY = "cadm-auth-session";

export type TitleType = "TITULAIRE" | "SUPPLEANT_1" | "SUPPLEANT_2" | "INTERIM";

export type Assignment = {
  id: string;
  titleType: TitleType;
  /** ISO 8601. */
  from: string;
  /** ISO 8601 ; absent = en cours. */
  to?: string;
};

export type Designation = {
  fn: DesignationFn;
  from: string;
  to?: string;
  planId?: string;
  moduleId?: string;
};

export type TerritoryRef = { level: "wilaya" | "commune"; id: string };

export type AuthSession = {
  userId: string;
  email: string;
  phone?: string;
  role: Role;
  organismId?: string;
  territory?: TerritoryRef;
  siteId?: string;
  assignment: Assignment;
  designations: Designation[];
  createdAt: number;
};

export type NewSession = {
  email: string;
  phone?: string;
  role: Role;
  userId?: string;
  organismId?: string;
  territory?: TerritoryRef;
  siteId?: string;
  titleType?: TitleType;
  designations?: DesignationFn[];
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  // Une connexion ou déconnexion dans un autre onglet met aussi celui-ci à jour.
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
    const designations = Array.isArray(value.designations)
      ? value.designations.filter(
          (item): item is Designation =>
            !!item &&
            (DESIGNATION_FNS as readonly string[]).includes(item.fn) &&
            isIso(item.from),
        )
      : [];
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
      organismId: value.organismId,
      territory: value.territory,
      siteId: value.siteId,
      assignment,
      designations,
      createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Dernière valeur lue : évite de recréer un objet à chaque lecture. */
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
    organismId: input.organismId,
    territory: input.territory,
    siteId: input.siteId,
    assignment: {
      id: `aff-${userId}-${Date.now().toString(36)}`,
      titleType: input.titleType ?? "TITULAIRE",
      from: now,
    },
    designations: (input.designations ?? []).map((fn) => ({ fn, from: now })),
    createdAt: Date.now(),
  };
  write(session);
  return session;
}

/** Modifie le rôle et les désignations du compte connecté (sélecteur de démo). */
export function switchSessionProfile(input: {
  role: Role;
  designations?: DesignationFn[];
  organismId?: string;
  territory?: TerritoryRef;
}): void {
  const current = getAuthSession();
  if (!current) return;
  const now = new Date().toISOString();
  write({
    ...current,
    role: input.role,
    organismId: input.organismId ?? current.organismId,
    territory: input.territory ?? current.territory,
    designations: (input.designations ?? []).map((fn) => ({ fn, from: now })),
    assignment: { ...current.assignment, from: now },
  });
}

export function endSession(): void {
  write(null);
}

/** Identifiant d'affectation à sceller dans toute décision ou entrée de journal. */
export function currentAssignmentId(session: AuthSession | null): string | null {
  return session && isAssignmentActive(session.assignment) ? session.assignment.id : null;
}

export function isAssignmentActive(assignment: Assignment, at: number = Date.now()): boolean {
  const from = Date.parse(assignment.from);
  const to = assignment.to ? Date.parse(assignment.to) : Number.POSITIVE_INFINITY;
  return from <= at && at < to;
}

export function activeDesignations(session: AuthSession, at: number = Date.now()): Designation[] {
  return session.designations.filter((item) => {
    const from = Date.parse(item.from);
    const to = item.to ? Date.parse(item.to) : Number.POSITIVE_INFINITY;
    return from <= at && at < to;
  });
}

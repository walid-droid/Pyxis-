// Adaptateur de compatibilité : toutes les connexions passent désormais par la
// session unique de `auth/session.ts` (un compte = un rôle). Les anciennes
// fonctions sont conservées pour les pages de connexion et la page d'accueil.

import {
  ADMIN_DEMO_ACCOUNT,
  sessionFromAccount,
  type DemoAccount,
} from "../auth/demoAccounts";
import { ROLE_DEFS, type Role } from "../auth/roles";
import { endSession, getAuthSession, startSession } from "../auth/session";

/* ------------------------------ Citoyen ------------------------------ */

export type Session = {
  email: string;
  phone?: string;
  createdAt: number;
};

export function getSession(): Session | null {
  const session = getAuthSession();
  if (!session || ROLE_DEFS[session.role].space !== "citizen") return null;
  return { email: session.email, phone: session.phone, createdAt: session.createdAt };
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

/** Connexion ou inscription d'un citoyen. */
export function signIn(
  email: string,
  phone?: string,
  role: Role = "citizen",
): void {
  startSession({ email, phone, role });
}

export function signOut(): void {
  endSession();
}

/* ------------------- Personnel (autorités, organismes) ------------------- */

export type RespSession = {
  email: string;
  role: string;
  createdAt: number;
};

export function getRespSession(): RespSession | null {
  const session = getAuthSession();
  if (!session) return null;
  const space = ROLE_DEFS[session.role].space;
  if (space === "citizen" || space === "admin") return null;
  return { email: session.email, role: session.role, createdAt: session.createdAt };
}

/** Connexion du personnel : le compte de démonstration fixe le rôle. */
export function signInResp(email: string, account: DemoAccount): void {
  startSession(sessionFromAccount(account, email));
}

export function signOutResp(): void {
  endSession();
}

/* ------------------------- Administrateur système ------------------------- */

export type AdminSession = {
  email: string;
  role: "admin";
  createdAt: number;
};

export function getAdminSession(): AdminSession | null {
  const session = getAuthSession();
  if (!session || session.role !== "admin") return null;
  return { email: session.email, role: "admin", createdAt: session.createdAt };
}

export function signInAdmin(email: string): void {
  startSession(sessionFromAccount(ADMIN_DEMO_ACCOUNT, email));
}

export function signOutAdmin(): void {
  endSession();
}

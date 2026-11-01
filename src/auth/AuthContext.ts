import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  canAccess,
  canAccessAny,
  designationsOf,
  type AccessContext,
} from "./access";
import type { DesignationFn, Permission } from "./permissions";
import type { Role } from "./roles";
import { getAuthSession, subscribeSession, type AuthSession } from "./session";

export type AuthValue = {
  session: AuthSession | null;
  role: Role | null;
  designations: DesignationFn[];
  /** Vérifie une permission, avec le contexte territoire / organisme / niveau de plan. */
  can: (permission: Permission, context?: AccessContext) => boolean;
  canAny: (permissions: readonly Permission[], context?: AccessContext) => boolean;
  hasDesignation: (fn: DesignationFn) => boolean;
};

export const AuthContext = createContext<AuthValue | null>(null);

/** Construit la valeur d'authentification à partir de la session courante. */
export function useAuthValue(): AuthValue {
  const session = useSyncExternalStore(subscribeSession, getAuthSession, () => null);

  return useMemo<AuthValue>(() => {
    const designations = session ? designationsOf(session) : [];
    return {
      session,
      role: session?.role ?? null,
      designations,
      can: (permission, context) => canAccess(session, permission, context),
      canAny: (permissions, context) => canAccessAny(session, permissions, context),
      hasDesignation: (fn) => designations.includes(fn),
    };
  }, [session]);
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { canAccess, canAccessAny, type AccessContext } from "./access";
import type { Permission } from "./permissions";
import type { Role } from "./roles";
import { getAuthSession, subscribeSession, type AuthSession } from "./session";

export type AuthValue = {
  session: AuthSession | null;
  role: Role | null;
  /** Vérifie une permission, avec le contexte module / territoire / niveau de plan. */
  can: (permission: Permission, context?: AccessContext) => boolean;
  canAny: (permissions: readonly Permission[], context?: AccessContext) => boolean;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuthValue(): AuthValue {
  const session = useSyncExternalStore(subscribeSession, getAuthSession, () => null);

  return useMemo<AuthValue>(() => {
    return {
      session,
      role: session?.role ?? null,
      can: (permission, context) => canAccess(session, permission, context),
      canAny: (permissions, context) => canAccessAny(session, permissions, context),
    };
  }, [session]);
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

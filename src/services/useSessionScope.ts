import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import type { SessionScope } from "./model";
import { sessionScope } from "./scope";

/** Périmètre (rôle, module, territoire) de la session courante. */
export function useSessionScope(): SessionScope | null {
  const { session } = useAuth();
  return useMemo(() => (session ? sessionScope(session) : null), [session]);
}

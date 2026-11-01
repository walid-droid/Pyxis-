import { planLevelForRole, type PlanLevel } from "./access";
import { useAuth } from "./AuthContext";

/**
 * Niveau de plan sur lequel l'autorité connectée agit (RG-O01) :
 * wali → wilaya, président de l'APC → commune, ministre → national.
 */
export function useAuthorityLevel(): Exclude<PlanLevel, "site"> {
  const { role } = useAuth();
  const level = role ? planLevelForRole(role) : null;
  return level === null || level === "site" ? "wilaya" : level;
}

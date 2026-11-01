import type { AuthSession } from "../../auth/session";
import type { Permission } from "../../auth/permissions";
import { designationsOf } from "../../auth/access";
import { PERSONAS, type OrgPage, type PersonaProfile } from "./organismeData";

/** Pages de l'espace organisme, dans l'ordre du menu. */
export const ORG_PAGES: readonly OrgPage[] = [
  "reports",
  "missions",
  "resources",
  "reinforcements",
  "watch",
  "victims",
  "evacuation",
  "roads",
  "maritime",
  "pco",
  "pcf",
  "vehicle",
  "history",
];

/** Permissions ouvrant chaque page (au moins une). */
export const ORG_PAGE_PERMISSIONS: Record<OrgPage, readonly Permission[]> = {
  reports: ["CONSULTER_SIGNALEMENT"],
  missions: ["CREER_MISSION", "EXECUTER_MISSION"],
  resources: ["RECENSER_MOYENS"],
  reinforcements: ["DEMANDER_RENFORT", "TRANSMETTRE_RENFORT", "TRAITER_RENFORT"],
  watch: ["SURVEILLER_RISQUES"],
  victims: ["SUIVRE_VICTIMES"],
  evacuation: ["GERER_EVACUATIONS", "SECURISER_ZONES"],
  roads: ["CONFIRMER_REOUVERTURE_ROUTE", "SECURISER_ZONES"],
  maritime: ["SURVEILLER_MARITIME"],
  pco: ["CONSOLE_PCO"],
  pcf: ["VOIR_PCF"],
  vehicle: ["SUIVRE_VEHICULE"],
  history: ["CONSULTER_HISTORIQUE"],
};

/** Persona de démonstration correspondant au rôle et aux désignations de la session. */
export function personaForSession(session: AuthSession | null): PersonaProfile {
  if (!session) return PERSONAS[0];
  const designations = designationsOf(session);
  const sameRole = PERSONAS.filter((item) => item.accountRole === session.role);
  const exact = sameRole.find(
    (item) =>
      item.designations.length > 0 &&
      item.designations.every((fn) => designations.includes(fn)),
  );
  return exact ?? sameRole.find((item) => item.designations.length === 0) ?? sameRole[0] ?? PERSONAS[0];
}

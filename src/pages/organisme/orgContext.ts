import { createContext, useContext } from "react";
import type { OrgPage, Persona, PersonaId } from "./organismeData";

export type OrganismeContextValue = {
  persona: Persona;
  setPersonaId: (id: PersonaId) => void;
  canAccess: (page: OrgPage) => boolean;
};

export const OrganismeContext = createContext<OrganismeContextValue | null>(null);

export function useOrganisme(): OrganismeContextValue {
  const context = useContext(OrganismeContext);
  if (!context) {
    throw new Error("useOrganisme must be used inside OrganismeProvider");
  }
  return context;
}

import { useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "../../auth/AuthContext";
import { switchSessionProfile } from "../../auth/session";
import { DEMO_MODE } from "../../config";
import { useI18n } from "../../i18n";
import { PERSONAS, loc, type Persona, type PersonaId } from "./organismeData";
import { ORG_PAGE_PERMISSIONS, ORG_PAGES, personaForSession } from "./orgAccess";
import { OrganismeContext, useOrganisme, type OrganismeContextValue } from "./orgContext";

/**
 * Fournit la persona de l'utilisateur connecté : elle vient de sa session
 * (rôle + désignations), et ses pages sont déduites de ses permissions.
 */
export function OrganismeProvider({ children }: { children: ReactNode }) {
  const { session, canAny } = useAuth();

  const persona = useMemo<Persona>(() => {
    const profile = personaForSession(session);
    return {
      ...profile,
      pages: ORG_PAGES.filter((page) => canAny(ORG_PAGE_PERMISSIONS[page])),
    };
  }, [session, canAny]);

  /** Réservé au mode démo : rejoue la session avec le rôle de la persona choisie. */
  const setPersonaId = useCallback((id: PersonaId) => {
    if (!DEMO_MODE) return;
    const target = PERSONAS.find((item) => item.id === id);
    if (!target) return;
    switchSessionProfile({
      role: target.accountRole,
      designations: target.designations,
    });
  }, []);

  const value = useMemo<OrganismeContextValue>(
    () => ({
      persona,
      setPersonaId,
      canAccess: (page) => persona.pages.includes(page),
    }),
    [persona, setPersonaId],
  );

  return (
    <OrganismeContext.Provider value={value}>{children}</OrganismeContext.Provider>
  );
}

/** Sélecteur de rôle de la barre supérieure : visible uniquement en mode démo. */
export function PersonaSwitcher() {
  const { t, lang } = useI18n();
  const { persona, setPersonaId } = useOrganisme();

  if (!DEMO_MODE) return null;

  return (
    <label className="org-role-switch" title={t("org.role.hint")}>
      <span>{t("org.role.label")}</span>
      <select
        value={persona.id}
        aria-label={t("org.role.switch")}
        onChange={(event) => setPersonaId(event.target.value as PersonaId)}
      >
        {PERSONAS.map((item) => (
          <option key={item.id} value={item.id}>
            {loc(lang, item.role)} — {loc(lang, item.name)}
          </option>
        ))}
      </select>
    </label>
  );
}

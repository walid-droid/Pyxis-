import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "../../i18n";
import { PERSONAS, loc, type Persona, type PersonaId } from "./organismeData";
import { OrganismeContext, useOrganisme, type OrganismeContextValue } from "./orgContext";

const STORAGE_KEY = "cadm-org-persona";

function readPersona(): Persona {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const found = PERSONAS.find((item) => item.id === stored);
    if (found) return found;
  } catch {
    // Ignore storage failures.
  }
  return PERSONAS[0];
}

export function OrganismeProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<PersonaId>(() => readPersona().id);

  const setPersonaId = useCallback((id: PersonaId) => {
    setPersonaIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const persona = useMemo(
    () => PERSONAS.find((item) => item.id === personaId) ?? PERSONAS[0],
    [personaId],
  );

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

/** Sélecteur de rôle affiché dans la barre supérieure. */
export function PersonaSwitcher() {
  const { t, lang } = useI18n();
  const { persona, setPersonaId } = useOrganisme();

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

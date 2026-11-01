import { useAuth } from "../../auth/AuthContext";
import { DEMO_COMMUNE, DEMO_WILAYA } from "../../auth/demoAccounts";
import { ROLE_DEFS } from "../../auth/roles";
import { useI18n } from "../../i18n";

const KNOWN_TERRITORIES: Record<string, { fr: string; ar: string }> = {
  [DEMO_WILAYA.id]: { fr: "Wilaya de Béjaïa", ar: "ولاية بجاية" },
  [DEMO_COMMUNE.id]: { fr: "Commune de Béjaïa", ar: "بلدية بجاية" },
};

/** Rappelle le rôle et le périmètre de l'autorité connectée (barre supérieure). */
export default function AuthorityScopeBadge() {
  const { lang } = useI18n();
  const { session } = useAuth();
  if (!session) return null;

  const role = ROLE_DEFS[session.role].name[lang];
  const scope =
    session.role === "minister"
      ? lang === "ar"
        ? "وطني · كل الولايات"
        : "National · toutes les wilayas"
      : session.territory
        ? (KNOWN_TERRITORIES[session.territory.id]?.[lang] ?? session.territory.id)
        : "";

  return (
    <span className="rc-chip" title={scope ? `${role} · ${scope}` : role}>
      <strong>{role}</strong>
      {scope ? <span> · {scope}</span> : null}
    </span>
  );
}

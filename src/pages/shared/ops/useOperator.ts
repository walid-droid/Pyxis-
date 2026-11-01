import { useMemo } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { ROLE_DEFS, type Role } from "../../../auth/roles";
import { useI18n } from "../../../i18n";

export type Operator = {
  name: string;
  roleLabel: string;
  role: Role | "anonymous";
  assignmentId: string;
  email?: string;
};

/** Identité et affectation scellées dans chaque entrée opérationnelle. */
export function useOperator(): Operator {
  const { session } = useAuth();
  const { lang } = useI18n();

  return useMemo(() => {
    if (!session) {
      return {
        name: "Opérateur de démonstration",
        roleLabel: lang === "ar" ? "مشغّل تجريبي" : "Opérateur de démonstration",
        role: "anonymous",
        assignmentId: "aff-demo",
      };
    }
    const roleLabel = ROLE_DEFS[session.role].name[lang];
    const local = session.email.split("@")[0]?.replace(/[._-]+/g, " ");
    return {
      name: local ? `${roleLabel} · ${local}` : roleLabel,
      roleLabel,
      role: session.role,
      assignmentId: session.assignment.id,
      email: session.email,
    };
  }, [session, lang]);
}

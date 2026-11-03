import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import {
  ADMIN_LOGIN_PATH,
  LOGIN_PATH,
  STAFF_LOGIN_PATH,
} from "../config";
import { useI18n } from "../i18n";
import type { AccessContext } from "./access";
import { useAuth } from "./AuthContext";
import type { Permission } from "./permissions";
import { homeForRole, ROLE_DEFS, type Space } from "./roles";

function loginPathFor(space: Space): string {
  if (space === "citizen") return LOGIN_PATH;
  if (space === "admin") return ADMIN_LOGIN_PATH;
  return STAFF_LOGIN_PATH;
}

/**
 * Réserve un espace aux rôles qui en relèvent.
 * Sans session : connexion de l'espace. Avec un autre rôle : accueil de ce rôle.
 */
export function RequireSpace({
  space,
  children,
}: {
  space: Space;
  children: ReactNode;
}) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return (
      <Navigate
        to={loginPathFor(space)}
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  if (ROLE_DEFS[session.role].space !== space) {
    return <Navigate to={homeForRole(session.role)} replace />;
  }
  return <>{children}</>;
}

/** Page « accès refusé » affichée lorsqu'une vérification échoue. */
export function AccessDenied() {
  const { lang } = useI18n();
  const { role } = useAuth();
  const text =
    lang === "ar"
      ? { title: "الوصول مرفوض", body: "دورك الحالي لا يسمح بهذه الصفحة.", back: "العودة إلى الرئيسية" }
      : { title: "Accès refusé", body: "Votre rôle ne permet pas d'ouvrir cette page.", back: "Retour à l'accueil" };

  return (
    <section role="alert" style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
      <h1>{text.title}</h1>
      <p>{text.body}</p>
      <Link to={role ? homeForRole(role) : "/"}>{text.back}</Link>
    </section>
  );
}

/** Réserve une page à une ou plusieurs permissions (au moins une). */
export function RequirePermission({
  any,
  context,
  children,
  redirect = false,
}: {
  any: readonly Permission[];
  context?: AccessContext;
  children: ReactNode;
  /** Redirige vers l'accueil du rôle au lieu d'afficher « accès refusé ». */
  redirect?: boolean;
}) {
  const { session, canAny } = useAuth();

  if (!session) return null;
  if (!canAny(any, context)) {
    return redirect ? (
      <Navigate to={homeForRole(session.role)} replace />
    ) : (
      <AccessDenied />
    );
  }
  return <>{children}</>;
}

/** Affiche son contenu seulement si la permission est accordée. */
export function Can({
  permission,
  context,
  children,
  fallback = null,
}: {
  permission: Permission;
  context?: AccessContext;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useAuth();
  return <>{can(permission, context) ? children : fallback}</>;
}

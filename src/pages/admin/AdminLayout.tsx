import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { endSession } from "../../auth/session";
import AppShell, { type ShellNavItem } from "../../components/AppShell";
import {
  ADMIN_ACCOUNTS_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_JOURNAL_PATH,
  ADMIN_MATRIX_PATH,
  ADMIN_MODULES_PATH,
  ADMIN_ROLES_PATH,
  ADMIN_TERRITORIES_PATH,
  ADMIN_TYPES_PATH,
  LOGIN_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import "../shared/v3/v3.css";

const ADMIN_NAV: ShellNavItem[] = [
  { to: ADMIN_DASHBOARD_PATH, labelKey: "admin.nav.dashboard", end: true },
  { to: ADMIN_ACCOUNTS_PATH, labelKey: "admin.nav.accounts" },
  { to: ADMIN_ROLES_PATH, labelKey: "admin.nav.roles" },
  { to: ADMIN_TERRITORIES_PATH, labelKey: "admin.nav.territories" },
  { to: ADMIN_MODULES_PATH, labelKey: "admin.nav.modules" },
  { to: ADMIN_TYPES_PATH, labelKey: "admin.nav.types" },
  { to: ADMIN_MATRIX_PATH, labelKey: "admin.nav.matrix" },
  { to: ADMIN_JOURNAL_PATH, labelKey: "admin.nav.journal" },
];

/** Coque de l'espace administrateur système. */
export default function AdminLayout() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useI18n();

  return (
    <AppShell
      variant="admin"
      homePath={ADMIN_DASHBOARD_PATH}
      storageKey="cadm-admin-sidebar-collapsed-v3"
      navItems={ADMIN_NAV}
      navGroupKey="admin.shellGroup"
      authenticated={session !== null}
      topbarExtra={<span className="v3-topbar-meta">{t("admin.topbarRole")}</span>}
      onSignOut={() => {
        endSession();
        navigate(LOGIN_PATH);
      }}
    />
  );
}

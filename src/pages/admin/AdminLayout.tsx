import { useNavigate } from "react-router";
import AppShell, { type ShellNavItem } from "../../components/AppShell";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_DOCUMENTS_PATH,
  ADMIN_JOURNAL_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_ORGANISATIONS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_TERRITORIES_PATH,
  ADMIN_USERS_PATH,
} from "../../config";
import { getAdminSession, signOutAdmin } from "../../lib/session";

const ADMIN_NAV: ShellNavItem[] = [
  { to: ADMIN_DASHBOARD_PATH, labelKey: "admin.nav.dashboard", end: true },
  { to: ADMIN_USERS_PATH, labelKey: "admin.nav.users" },
  { to: ADMIN_TERRITORIES_PATH, labelKey: "admin.nav.territories" },
  { to: ADMIN_ORGANISATIONS_PATH, labelKey: "admin.nav.organisations" },
  { to: ADMIN_SETTINGS_PATH, labelKey: "admin.nav.settings" },
  { to: ADMIN_DOCUMENTS_PATH, labelKey: "admin.nav.documents" },
  { to: ADMIN_JOURNAL_PATH, labelKey: "admin.nav.journal" },
];

/** Coque de l'espace administrateur système (S1). */
function AdminLayout() {
  const navigate = useNavigate();

  return (
    <AppShell
      variant="admin"
      homePath={ADMIN_DASHBOARD_PATH}
      storageKey="cadm-admin-sidebar-collapsed"
      navItems={ADMIN_NAV}
      navGroupKey="admin.shellGroup"
      authenticated={getAdminSession() !== null}
      onSignOut={() => {
        signOutAdmin();
        navigate(ADMIN_LOGIN_PATH);
      }}
    />
  );
}

export default AdminLayout;

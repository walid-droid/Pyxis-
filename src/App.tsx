import "./App.css";
import { useEffect, type ReactNode } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";
import AppShell, { type ShellNavItem } from "./components/AppShell";
import { useI18n } from "./i18n";
import {
  ADMIN_ASSISTANT_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_DOCUMENTS_PATH,
  ADMIN_JOURNAL_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_ORGANISATIONS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_TERRITORIES_PATH,
  ADMIN_USERS_PATH,
  ASSISTANT_PATH,
  DASHBOARD_PATH,
  FORGOT_PASSWORD_PATH,
  LOGIN_PATH,
  MY_REPORTS_PATH,
  RESP_ASSISTANT_PATH,
  RESP_DASHBOARD_PATH,
  RESP_LOGIN_PATH,
} from "./config";
import {
  getAdminSession,
  getRespSession,
  getSession,
  signOut,
  signOutResp,
} from "./lib/session";
// Landing is currently implemented in JavaScript/JSX without type declarations.
// @ts-expect-error No declaration file is available for this JSX module.
import Landing from "./landing/Landing";
import ContactsPage from "./pages/citizen/ContactsPage";
import HomePage from "./pages/citizen/HomePage";
import AlertsPage from "./pages/citizen/AlertsPage";
import SheltersPage from "./pages/citizen/SheltersPage";
import SubmitAlertPage from "./pages/citizen/SubmitAlertPage";
import MyReportsPage from "./pages/citizen/MyReportsPage";
import EventsPage from "./pages/citizen/EventsPage";
import ConsignesPage from "./pages/citizen/ConsignesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RespLoginPage from "./pages/resp-crise/RespLoginPage";
import CommandDashboard from "./pages/resp-crise/CommandDashboard";
import IncidentManagement from "./pages/resp-crise/IncidentManagement";
import CommandChain from "./pages/resp-crise/CommandChain";
import ReportValidation from "./pages/resp-crise/ReportValidation";
import AlertBroadcast from "./pages/resp-crise/AlertBroadcast";
import CrisisResources from "./pages/resp-crise/CrisisResources";
import JournalReports from "./pages/resp-crise/JournalReports";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import { AdminProvider } from "./pages/admin/AdminContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersRolesPage from "./pages/admin/UsersRolesPage";
import TerritoriesPage from "./pages/admin/TerritoriesPage";
import OrganisationsPage from "./pages/admin/OrganisationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import DocumentsPage from "./pages/admin/DocumentsPage";
import AdminJournalPage from "./pages/admin/AdminJournalPage";

const CITIZEN_NAV: ShellNavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/alerts", labelKey: "nav.alerts" },
  { to: "/consignes", labelKey: "nav.consignes" },
  { to: "/resources", labelKey: "nav.resources" },
  { to: "/events", labelKey: "nav.events" },
  { to: MY_REPORTS_PATH, labelKey: "nav.myReports" },
  { to: "/contacts", labelKey: "nav.contacts" },
];

const RESP_NAV: ShellNavItem[] = [
  { to: RESP_DASHBOARD_PATH, labelKey: "nav.respDashboard", end: true },
  { to: "/responsable/incidents/1", labelKey: "nav.respIncident" },
  { to: "/responsable/chaine", labelKey: "nav.respChain" },
  { to: "/responsable/signalements", labelKey: "nav.respReports" },
  { to: "/responsable/diffusion", labelKey: "nav.respBroadcast" },
  { to: "/responsable/ressources", labelKey: "nav.respResources" },
  { to: "/responsable/journal", labelKey: "nav.respJournal" },
];

/** Espace citoyen. */
function CitizenLayout() {
  const navigate = useNavigate();

  return (
    <AppShell
      homePath={DASHBOARD_PATH}
      storageKey="cadm-sidebar-collapsed"
      navItems={CITIZEN_NAV}
      authenticated={getSession() !== null}
      onSignOut={() => {
        signOut();
        navigate("/");
      }}
    />
  );
}

/** Espace responsable de crise (navigation et session dédiées). */
function RespLayout() {
  const navigate = useNavigate();

  return (
    <AppShell
      variant="crisis"
      homePath={RESP_DASHBOARD_PATH}
      storageKey="cadm-resp-sidebar-collapsed"
      navItems={RESP_NAV}
      navGroupKey="resp.shellGroup"
      authenticated={getRespSession() !== null}
      onSignOut={() => {
        signOutResp();
        navigate(RESP_LOGIN_PATH);
      }}
    />
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const allowed = getSession() !== null;

  useEffect(() => {
    if (allowed) return;
    navigate(LOGIN_PATH, { replace: true, state: { from: location.pathname } });
  }, [allowed, navigate, location.pathname]);

  // Rien n'est rendu tant que la redirection vers la connexion est en cours.
  if (!allowed) return null;

  return <>{children}</>;
}

/** Accès à l'espace responsable : redirige vers sa page de connexion dédiée. */
function RequireRespAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const allowed = getRespSession() !== null;

  if (!allowed) {
    return (
      <Navigate
        to={RESP_LOGIN_PATH}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

/** Accès à l'espace administrateur système. */
function RequireAdminAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const allowed = getAdminSession() !== null;

  if (!allowed) {
    return (
      <Navigate
        to={ADMIN_LOGIN_PATH}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

function App() {
  const { t } = useI18n();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path={LOGIN_PATH} element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path={FORGOT_PASSWORD_PATH} element={<ForgotPasswordPage />} />
      <Route path={RESP_LOGIN_PATH} element={<RespLoginPage />} />
      <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginPage />} />

      {/* ---------- Espace citoyen ---------- */}
      <Route element={<CitizenLayout />}>
        <Route path={DASHBOARD_PATH} element={<HomePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/resources" element={<SheltersPage />} />
        <Route path="/consignes" element={<ConsignesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route
          path={ASSISTANT_PATH}
          element={<Navigate to={DASHBOARD_PATH} replace />}
        />
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="/submit-alert"
          element={
            <RequireAuth>
              <SubmitAlertPage />
            </RequireAuth>
          }
        />
        <Route
          path={MY_REPORTS_PATH}
          element={
            <RequireAuth>
              <MyReportsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<h1>{t("nav.notFound")}</h1>} />
      </Route>

      {/* ---------- Espace responsable de crise ---------- */}
      <Route
        element={
          <RequireRespAuth>
            <RespLayout />
          </RequireRespAuth>
        }
      >
        <Route path={RESP_DASHBOARD_PATH} element={<CommandDashboard />} />
        <Route
          path="/responsable/incidents/:id"
          element={<IncidentManagement />}
        />
        <Route path="/responsable/chaine" element={<CommandChain />} />
        <Route
          path="/responsable/signalements"
          element={<ReportValidation />}
        />
        <Route path="/responsable/diffusion" element={<AlertBroadcast />} />
        <Route path="/responsable/ressources" element={<CrisisResources />} />
        <Route
          path={RESP_ASSISTANT_PATH}
          element={<Navigate to={RESP_DASHBOARD_PATH} replace />}
        />
        <Route path="/responsable/journal" element={<JournalReports />} />
      </Route>

      {/* ---------- Espace administrateur système (S1) ---------- */}
      <Route
        element={
          <RequireAdminAuth>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </RequireAdminAuth>
        }
      >
        <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboard />} />
        <Route
          path={ADMIN_ASSISTANT_PATH}
          element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />}
        />
        <Route path={ADMIN_USERS_PATH} element={<UsersRolesPage />} />
        <Route path={ADMIN_TERRITORIES_PATH} element={<TerritoriesPage />} />
        <Route
          path={ADMIN_ORGANISATIONS_PATH}
          element={<OrganisationsPage />}
        />
        <Route path={ADMIN_SETTINGS_PATH} element={<SettingsPage />} />
        <Route path={ADMIN_DOCUMENTS_PATH} element={<DocumentsPage />} />
        <Route path={ADMIN_JOURNAL_PATH} element={<AdminJournalPage />} />
        <Route
          path="*"
          element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />}
        />
      </Route>
    </Routes>
  );
}

export default App;

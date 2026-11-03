import "./App.css";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import AppShell, { type ShellNavItem } from "./components/AppShell";
import { endSession } from "./auth/session";
import { RequireSpace } from "./auth/guards";
import { useAuth } from "./auth/AuthContext";
import AuthProvider from "./auth/AuthProvider";
import {
  ASSISTANT_PATH,
  AUTHORITY_SITUATION_PATH,
  STAFF_LOGIN_ALIAS_PATHS,
  STAFF_LOGIN_PATH,
} from "./config";
// Landing est actuellement implémenté en JavaScript/JSX sans typage.
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
import PublicInformationPage from "./pages/citizen/PublicInformationPage";
import AssistantPage from "./pages/assistant/AssistantPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import StaffLoginPage from "./pages/auth/StaffLoginPage";
import NotFoundPage from "./pages/auth/NotFoundPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccountsPage from "./pages/admin/AdminAccountsPage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import AdminTerritoriesPage from "./pages/admin/AdminTerritoriesPage";
import AdminModulesPage from "./pages/admin/AdminModulesPage";
import AdminTypesPage from "./pages/admin/AdminTypesPage";
import AdminMatrixPage from "./pages/admin/AdminMatrixPage";
import AdminJournalPage from "./pages/admin/AdminJournalPage";
import AuthorityLayout from "./pages/authority/AuthorityLayout";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthoritySituationPage from "./pages/authority/AuthoritySituationPage";
import AuthorityPlansPage from "./pages/authority/AuthorityPlansPage";
import AuthorityEscalationPage from "./pages/authority/AuthorityEscalationPage";
import AuthorityAlertsPage from "./pages/authority/AuthorityAlertsPage";
import AuthorityStaffPage from "./pages/authority/AuthorityStaffPage";
import AuthorityExercisesPage from "./pages/authority/AuthorityExercisesPage";
import AuthorityRequestsPage from "./pages/authority/AuthorityRequestsPage";
import ModuleLayout from "./pages/module/ModuleLayout";
import ModuleDashboard from "./pages/module/ModuleDashboard";
import ModuleAlertsPage from "./pages/module/ModuleAlertsPage";
import ModuleInterventionsPage from "./pages/module/ModuleInterventionsPage";
import ModuleTasksPage from "./pages/module/ModuleTasksPage";
import ModuleAvailabilityPage from "./pages/module/ModuleAvailabilityPage";
import ModuleCallsPage from "./pages/module/ModuleCallsPage";
import ModuleHistoryPage from "./pages/module/ModuleHistoryPage";

const CITIZEN_NAV: ShellNavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/alerts", labelKey: "nav.alerts" },
  { to: "/consignes", labelKey: "nav.consignes" },
  { to: "/resources", labelKey: "nav.resources" },
  { to: "/events", labelKey: "nav.events" },
  { to: "/my-reports", labelKey: "nav.myReports" },
  { to: "/contacts", labelKey: "nav.contacts" },
];

/** Espace citoyen : signalement, suivi, consignes, alertes, contacts. */
function CitizenLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  return (
    <AppShell
      homePath="/dashboard"
      storageKey="cadm-sidebar-collapsed"
      navItems={CITIZEN_NAV}
      authenticated={session !== null}
      onSignOut={() => {
        endSession();
        navigate("/");
      }}
      onSignIn={() => navigate("/login", { state: { from: location.pathname } })}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path={STAFF_LOGIN_PATH} element={<StaffLoginPage />} />
      {STAFF_LOGIN_ALIAS_PATHS.map((path) => (
        <Route
          key={path}
          path={path}
          element={<Navigate to={STAFF_LOGIN_PATH} replace />}
        />
      ))}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/information" element={<PublicInformationPage />} />
      <Route path={ASSISTANT_PATH} element={<AssistantPage />} />

      {/* ---------- Espace citoyen ---------- */}
      <Route element={<CitizenLayout />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/submit-alert" element={<SubmitAlertPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/consignes" element={<ConsignesPage />} />
        <Route path="/resources" element={<SheltersPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Route>

      {/* ---------- Espace module ---------- */}
      <Route
        element={
          <RequireSpace space="module">
            <ModuleLayout />
          </RequireSpace>
        }
      >
        <Route path="/module" element={<ModuleDashboard />} />
        <Route path="/module/alertes" element={<ModuleAlertsPage />} />
        <Route path="/module/interventions" element={<ModuleInterventionsPage />} />
        <Route path="/module/taches" element={<ModuleTasksPage />} />
        <Route path="/module/disponibilite" element={<ModuleAvailabilityPage />} />
        <Route path="/module/appels" element={<ModuleCallsPage />} />
        <Route path="/module/historique" element={<ModuleHistoryPage />} />
      </Route>

      {/* ---------- Espace autorité ---------- */}
      <Route
        element={
          <RequireSpace space="authority">
            <AuthorityLayout />
          </RequireSpace>
        }
      >
        <Route path="/autorite" element={<AuthorityDashboard />} />
        <Route path="/autorite/demandes" element={<AuthorityRequestsPage />} />
        <Route path="/autorite/plans" element={<AuthorityPlansPage />} />
        <Route path="/autorite/escalade" element={<AuthorityEscalationPage />} />
        <Route path="/autorite/alertes" element={<AuthorityAlertsPage />} />
        <Route path="/autorite/effectifs" element={<AuthorityStaffPage />} />
        <Route path="/autorite/exercices" element={<AuthorityExercisesPage />} />
        <Route path={AUTHORITY_SITUATION_PATH} element={<AuthoritySituationPage />} />
      </Route>

      {/* ---------- Espace administrateur ---------- */}
      <Route
        element={
          <RequireSpace space="admin">
            <AdminLayout />
          </RequireSpace>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/comptes" element={<AdminAccountsPage />} />
        <Route path="/admin/roles" element={<AdminRolesPage />} />
        <Route path="/admin/territoires" element={<AdminTerritoriesPage />} />
        <Route path="/admin/modules" element={<AdminModulesPage />} />
        <Route path="/admin/types" element={<AdminTypesPage />} />
        <Route path="/admin/matrice" element={<AdminMatrixPage />} />
        <Route path="/admin/journal" element={<AdminJournalPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

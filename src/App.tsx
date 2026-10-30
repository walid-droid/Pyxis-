import "./App.css";
import { useEffect, useMemo, type ReactNode } from "react";
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
  AUTHORITY_ALERTS_PATH,
  AUTHORITY_CRISIS_PATH,
  AUTHORITY_DASHBOARD_PATH,
  AUTHORITY_DECISIONS_PATH,
  AUTHORITY_PLAN_PATH,
  AUTHORITY_SITUATION_PATH,
  DASHBOARD_PATH,
  FORGOT_PASSWORD_PATH,
  LOGIN_PATH,
  MY_REPORTS_PATH,
  ORG_DASHBOARD_PATH,
  ORG_EVACUATION_PATH,
  ORG_HISTORY_PATH,
  ORG_MISSIONS_PATH,
  ORG_PCF_PATH,
  ORG_PCO_PATH,
  ORG_REINFORCEMENTS_PATH,
  ORG_REPORTS_PATH,
  ORG_RESOURCES_PATH,
  ORG_VEHICLE_PATH,
  ORG_VICTIMS_PATH,
  ORG_WATCH_PATH,
  RESP_ASSISTANT_PATH,
  RESP_DASHBOARD_PATH,
  RESP_LOGIN_PATH,
  SITE_CONSIGNES_PATH,
  SITE_DASHBOARD_PATH,
  SITE_PLAN_PATH,
  SITE_SIMULATIONS_PATH,
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
import RespLoginPage from "./pages/command/RespLoginPage";
import CommandDashboard from "./pages/command/CommandDashboard";
import IncidentManagement from "./pages/command/IncidentManagement";
import CommandChain from "./pages/command/CommandChain";
import ReportValidation from "./pages/command/ReportValidation";
import AlertBroadcast from "./pages/command/AlertBroadcast";
import CrisisResources from "./pages/command/CrisisResources";
import JournalReports from "./pages/command/JournalReports";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthorityPlanPage from "./pages/authority/AuthorityPlanPage";
import AuthoritySituationPage from "./pages/authority/AuthoritySituationPage";
import AuthorityDecisionsPage from "./pages/authority/AuthorityDecisionsPage";
import AuthorityAlertsPage from "./pages/authority/AuthorityAlertsPage";
import AuthorityCrisisPage from "./pages/authority/AuthorityCrisisPage";
import { OrganismeProvider, PersonaSwitcher } from "./pages/organisme/OrganismeContext";
import { useOrganisme } from "./pages/organisme/orgContext";
import type { OrgPage } from "./pages/organisme/organismeData";
import OrganismeDashboard from "./pages/organisme/OrganismeDashboard";
import OrganismReportsPage from "./pages/organisme/OrganismReportsPage";
import MissionsPage from "./pages/organisme/MissionsPage";
import ResourcesPage from "./pages/organisme/ResourcesPage";
import ReinforcementsPage from "./pages/organisme/ReinforcementsPage";
import WatchPage from "./pages/organisme/WatchPage";
import VictimsPage from "./pages/organisme/VictimsPage";
import EvacuationPage from "./pages/organisme/EvacuationPage";
import PcoPage from "./pages/organisme/PcoPage";
import PcfPage from "./pages/organisme/PcfPage";
import HistoryPage from "./pages/organisme/HistoryPage";
import VehiclePage from "./pages/organisme/VehiclePage";
import SiteDashboard from "./pages/site/SiteDashboard";
import SitePlanPage from "./pages/site/SitePlanPage";
import SiteSimulationsPage from "./pages/site/SiteSimulationsPage";
import SiteConsignesPage from "./pages/site/SiteConsignesPage";
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

const AUTHORITY_NAV: ShellNavItem[] = [
  { to: AUTHORITY_DASHBOARD_PATH, labelKey: "nav.authorityDashboard", end: true },
  { to: AUTHORITY_SITUATION_PATH, labelKey: "nav.authoritySituation" },
  { to: AUTHORITY_PLAN_PATH, labelKey: "nav.authorityPlan" },
  { to: AUTHORITY_DECISIONS_PATH, labelKey: "nav.authorityDecisions" },
  { to: AUTHORITY_ALERTS_PATH, labelKey: "nav.authorityAlerts" },
  { to: AUTHORITY_CRISIS_PATH, labelKey: "nav.authorityCrisis" },
];

/** Correspondance entre une interface organisme et sa route. */
const ORG_NAV_META: Record<OrgPage, ShellNavItem> = {
  reports: { to: ORG_REPORTS_PATH, labelKey: "org.nav.reports" },
  missions: { to: ORG_MISSIONS_PATH, labelKey: "org.nav.missions" },
  resources: { to: ORG_RESOURCES_PATH, labelKey: "org.nav.resources" },
  reinforcements: {
    to: ORG_REINFORCEMENTS_PATH,
    labelKey: "org.nav.reinforcements",
  },
  watch: { to: ORG_WATCH_PATH, labelKey: "org.nav.watch" },
  victims: { to: ORG_VICTIMS_PATH, labelKey: "org.nav.victims" },
  evacuation: { to: ORG_EVACUATION_PATH, labelKey: "org.nav.evacuation" },
  pco: { to: ORG_PCO_PATH, labelKey: "org.nav.pco" },
  pcf: { to: ORG_PCF_PATH, labelKey: "org.nav.pcf" },
  history: { to: ORG_HISTORY_PATH, labelKey: "org.nav.history" },
  vehicle: { to: ORG_VEHICLE_PATH, labelKey: "org.nav.vehicle" },
};

const SITE_NAV: ShellNavItem[] = [
  { to: SITE_DASHBOARD_PATH, labelKey: "nav.siteDashboard", end: true },
  { to: SITE_PLAN_PATH, labelKey: "nav.sitePlan" },
  { to: SITE_SIMULATIONS_PATH, labelKey: "nav.siteSimulations" },
  { to: SITE_CONSIGNES_PATH, labelKey: "nav.siteConsignes" },
];

/** Espace citoyen. */
function CitizenLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
      onSignIn={() =>
        navigate(LOGIN_PATH, { state: { from: location.pathname } })
      }
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

/** Espace autorité compétente (navigation et session dédiées). */
function AuthorityLayout() {
  const navigate = useNavigate();

  return (
    <AppShell
      variant="authority"
      homePath={AUTHORITY_DASHBOARD_PATH}
      storageKey="cadm-authority-sidebar-collapsed"
      navItems={AUTHORITY_NAV}
      navGroupKey="authority.shellGroup"
      authenticated={getRespSession() !== null}
      onSignOut={() => {
        signOutResp();
        navigate(RESP_LOGIN_PATH);
      }}
    />
  );
}

/** Espace site sensible (navigation et session dédiées). */
function SiteLayout() {
  const navigate = useNavigate();

  return (
    <AppShell
      variant="site"
      homePath={SITE_DASHBOARD_PATH}
      storageKey="cadm-site-sidebar-collapsed"
      navItems={SITE_NAV}
      navGroupKey="site.shellGroup"
      authenticated={getRespSession() !== null}
      onSignOut={() => {
        signOutResp();
        navigate(RESP_LOGIN_PATH);
      }}
    />
  );
}

/** Espace organisme : navigation filtrée selon le rôle actif (S1, S3, S5, S7). */
function OrganismeLayout() {
  const navigate = useNavigate();
  const { persona } = useOrganisme();

  const navItems = useMemo<ShellNavItem[]>(
    () => [
      { to: ORG_DASHBOARD_PATH, labelKey: "org.nav.overview", end: true },
      ...persona.pages.map((page) => ORG_NAV_META[page]),
    ],
    [persona],
  );

  return (
    <AppShell
      variant="organisme"
      homePath={ORG_DASHBOARD_PATH}
      storageKey="cadm-org-sidebar-collapsed"
      navItems={navItems}
      navGroupKey="org.shellGroup"
      authenticated={getRespSession() !== null}
      topbarExtra={<PersonaSwitcher />}
      onSignOut={() => {
        signOutResp();
        navigate(RESP_LOGIN_PATH);
      }}
    />
  );
}

/** Interdit l'accès direct à une interface hors du périmètre du rôle actif. */
function OrgGuard({ page, children }: { page: OrgPage; children: ReactNode }) {
  const { canAccess } = useOrganisme();

  if (!canAccess(page)) {
    return <Navigate to={ORG_DASHBOARD_PATH} replace />;
  }

  return <>{children}</>;
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

      {/* ---------- Espace autorité compétente ---------- */}
      <Route
        element={
          <RequireRespAuth>
            <AuthorityLayout />
          </RequireRespAuth>
        }
      >
        <Route path={AUTHORITY_DASHBOARD_PATH} element={<AuthorityDashboard />} />
        <Route path={AUTHORITY_SITUATION_PATH} element={<AuthoritySituationPage />} />
        <Route path={AUTHORITY_PLAN_PATH} element={<AuthorityPlanPage />} />
        <Route path={AUTHORITY_DECISIONS_PATH} element={<AuthorityDecisionsPage />} />
        <Route path={AUTHORITY_ALERTS_PATH} element={<AuthorityAlertsPage />} />
        <Route path={AUTHORITY_CRISIS_PATH} element={<AuthorityCrisisPage />} />
      </Route>

      {/* ---------- Espace organisme (S1, S3, S5, S7) ---------- */}
      <Route
        element={
          <RequireRespAuth>
            <OrganismeProvider>
              <OrganismeLayout />
            </OrganismeProvider>
          </RequireRespAuth>
        }
      >
        <Route path={ORG_DASHBOARD_PATH} element={<OrganismeDashboard />} />
        <Route
          path={ORG_REPORTS_PATH}
          element={
            <OrgGuard page="reports">
              <OrganismReportsPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_MISSIONS_PATH}
          element={
            <OrgGuard page="missions">
              <MissionsPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_RESOURCES_PATH}
          element={
            <OrgGuard page="resources">
              <ResourcesPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_REINFORCEMENTS_PATH}
          element={
            <OrgGuard page="reinforcements">
              <ReinforcementsPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_WATCH_PATH}
          element={
            <OrgGuard page="watch">
              <WatchPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_VICTIMS_PATH}
          element={
            <OrgGuard page="victims">
              <VictimsPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_EVACUATION_PATH}
          element={
            <OrgGuard page="evacuation">
              <EvacuationPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_PCO_PATH}
          element={
            <OrgGuard page="pco">
              <PcoPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_PCF_PATH}
          element={
            <OrgGuard page="pcf">
              <PcfPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_HISTORY_PATH}
          element={
            <OrgGuard page="history">
              <HistoryPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_VEHICLE_PATH}
          element={
            <OrgGuard page="vehicle">
              <VehiclePage />
            </OrgGuard>
          }
        />
      </Route>

      {/* ---------- Espace site sensible ---------- */}
      <Route
        element={
          <RequireRespAuth>
            <SiteLayout />
          </RequireRespAuth>
        }
      >
        <Route path={SITE_DASHBOARD_PATH} element={<SiteDashboard />} />
        <Route path={SITE_PLAN_PATH} element={<SitePlanPage />} />
        <Route path={SITE_SIMULATIONS_PATH} element={<SiteSimulationsPage />} />
        <Route path={SITE_CONSIGNES_PATH} element={<SiteConsignesPage />} />
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

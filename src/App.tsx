import "./App.css";
import { useMemo, type ReactNode } from "react";
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
  ADMIN_ASSIGNMENTS_PATH,
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
  AUTHORITY_COMMUNICATION_PATH,
  AUTHORITY_COMPLIANCE_PATH,
  AUTHORITY_CRISIS_PATH,
  AUTHORITY_DASHBOARD_PATH,
  AUTHORITY_DECISIONS_PATH,
  AUTHORITY_PCF_PATH,
  AUTHORITY_PCF_WALL_PATH,
  AUTHORITY_PLAN_PATH,
  AUTHORITY_RECOVERY_PATH,
  AUTHORITY_REQUISITIONS_PATH,
  AUTHORITY_SITUATION_PATH,
  DASHBOARD_PATH,
  FORGOT_PASSWORD_PATH,
  LOGIN_PATH,
  MY_REPORTS_PATH,
  ORG_DASHBOARD_PATH,
  ORG_EVACUATION_PATH,
  ORG_HISTORY_PATH,
  ORG_MARITIME_PATH,
  ORG_MISSIONS_PATH,
  ORG_MODULES_PATH,
  ORG_MODULE_PATH,
  ORG_PCF_PATH,
  ORG_PCF_WALL_PATH,
  ORG_PCO_PATH,
  ORG_REINFORCEMENTS_PATH,
  ORG_REPORTS_PATH,
  ORG_RESOURCES_PATH,
  ORG_ROADS_PATH,
  ORG_TERRAIN_PATH,
  ORG_VEHICLE_PATH,
  ORG_VICTIMS_PATH,
  ORG_WATCH_PATH,
  LEGACY_RESP_PATH,
  PUBLIC_INFO_PATH,
  STAFF_LOGIN_PATH,
  SITE_CONSIGNES_PATH,
  SITE_DASHBOARD_PATH,
  SITE_PLAN_PATH,
  SITE_SIMULATIONS_PATH,
} from "./config";
import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/AuthContext";
import { RequirePermission, RequireSpace } from "./auth/guards";
import type { Permission } from "./auth/permissions";
import { endSession } from "./auth/session";
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
import StaffLoginPage from "./pages/auth/StaffLoginPage";
import AuthorityScopeBadge from "./pages/authority/AuthorityScopeBadge";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthorityPlanPage from "./pages/authority/AuthorityPlanPage";
import AuthoritySituationPage from "./pages/authority/AuthoritySituationPage";
import AuthorityDecisionsPage from "./pages/authority/AuthorityDecisionsPage";
import AuthorityAlertsPage from "./pages/authority/AuthorityAlertsPage";
import AuthorityCrisisPage from "./pages/authority/AuthorityCrisisPage";
import AuthorityPcfPage from "./pages/authority/AuthorityPcfPage";
import RequisitionsPage from "./pages/authority/RequisitionsPage";
import PublicCommunicationPage from "./pages/authority/PublicCommunicationPage";
import RecoveryPage from "./pages/authority/RecoveryPage";
import CompliancePage from "./pages/authority/CompliancePage";
import PublicInformationPage from "./pages/citizen/PublicInformationPage";
import PcfWallPage from "./pages/shared/ops/PcfWallPage";
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
import RoadsPage from "./pages/organisme/RoadsPage";
import MaritimePage from "./pages/organisme/MaritimePage";
import PcoPage from "./pages/organisme/PcoPage";
import PcfPage from "./pages/organisme/PcfPage";
import ModulesPage from "./pages/organisme/ModulesPage";
import ModuleConsolePage from "./pages/organisme/ModuleConsolePage";
import TerrainPage from "./pages/organisme/TerrainPage";
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
import AssignmentsPage from "./pages/admin/AssignmentsPage";

const CITIZEN_NAV: ShellNavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/alerts", labelKey: "nav.alerts" },
  { to: "/consignes", labelKey: "nav.consignes" },
  { to: "/resources", labelKey: "nav.resources" },
  { to: "/events", labelKey: "nav.events" },
  { to: MY_REPORTS_PATH, labelKey: "nav.myReports" },
  { to: "/contacts", labelKey: "nav.contacts" },
];

type GuardedNavItem = ShellNavItem & { perms: readonly Permission[] };

/** Menu de l'autorité : chaque entrée exige une permission (voir auth/permissions.ts). */
const AUTHORITY_NAV: GuardedNavItem[] = [
  {
    to: AUTHORITY_DASHBOARD_PATH,
    labelKey: "nav.authorityDashboard",
    end: true,
    perms: ["CONSULTER_INCIDENTS_TERRITOIRE"],
  },
  {
    to: AUTHORITY_SITUATION_PATH,
    labelKey: "nav.authoritySituation",
    perms: ["CONSULTER_INCIDENTS_TERRITOIRE"],
  },
  {
    to: AUTHORITY_PLAN_PATH,
    labelKey: "nav.authorityPlan",
    perms: ["APPROUVER_PLAN", "METTRE_EN_ALERTE_PLAN"],
  },
  {
    to: AUTHORITY_DECISIONS_PATH,
    labelKey: "nav.authorityDecisions",
    perms: ["DECLENCHER_PLAN", "LEVER_PLAN", "DESIGNER_FONCTION"],
  },
  {
    to: AUTHORITY_ALERTS_PATH,
    labelKey: "nav.authorityAlerts",
    perms: ["VALIDER_ALERTE"],
  },
  {
    to: AUTHORITY_CRISIS_PATH,
    labelKey: "nav.authorityCrisis",
    perms: ["DECLENCHER_PLAN"],
  },
  {
    to: AUTHORITY_PCF_PATH,
    labelKey: "nav.authorityPcf",
    perms: ["PILOTER_SITUATION", "VOIR_PCF"],
  },
  {
    to: AUTHORITY_REQUISITIONS_PATH,
    labelKey: "nav.authorityRequisitions",
    perms: ["GERER_REQUISITIONS"],
  },
  {
    to: AUTHORITY_COMMUNICATION_PATH,
    labelKey: "nav.authorityCommunication",
    perms: ["DIFFUSER_INFO_PUBLIC"],
  },
  {
    to: AUTHORITY_RECOVERY_PATH,
    labelKey: "nav.authorityRecovery",
    perms: ["GERER_REHABILITATION"],
  },
  {
    to: AUTHORITY_COMPLIANCE_PATH,
    labelKey: "nav.authorityCompliance",
    perms: ["SUIVRE_CONFORMITE"],
  },
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
  roads: { to: ORG_ROADS_PATH, labelKey: "org.nav.roads" },
  maritime: { to: ORG_MARITIME_PATH, labelKey: "org.nav.maritime" },
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
  const { session } = useAuth();

  return (
    <AppShell
      homePath={DASHBOARD_PATH}
      storageKey="cadm-sidebar-collapsed"
      navItems={CITIZEN_NAV}
      authenticated={session !== null}
      onSignOut={() => {
        endSession();
        navigate("/");
      }}
      onSignIn={() =>
        navigate(LOGIN_PATH, { state: { from: location.pathname } })
      }
    />
  );
}

/** Espace autorité compétente : menu filtré selon le rôle (wali, APC, ministre). */
function AuthorityLayout() {
  const navigate = useNavigate();
  const { session, canAny } = useAuth();

  const navItems = useMemo<ShellNavItem[]>(
    () =>
      AUTHORITY_NAV.filter((item) => canAny(item.perms)).map(
        ({ perms: _perms, ...item }) => item,
      ),
    [canAny],
  );

  return (
    <AppShell
      variant="authority"
      homePath={AUTHORITY_DASHBOARD_PATH}
      storageKey="cadm-authority-sidebar-collapsed"
      navItems={navItems}
      navGroupKey="authority.shellGroup"
      authenticated={session !== null}
      topbarExtra={<AuthorityScopeBadge />}
      onSignOut={() => {
        endSession();
        navigate(STAFF_LOGIN_PATH);
      }}
    />
  );
}

/** Espace site sensible (navigation et session dédiées). */
function SiteLayout() {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <AppShell
      variant="site"
      homePath={SITE_DASHBOARD_PATH}
      storageKey="cadm-site-sidebar-collapsed"
      navItems={SITE_NAV}
      navGroupKey="site.shellGroup"
      authenticated={session !== null}
      onSignOut={() => {
        endSession();
        navigate(STAFF_LOGIN_PATH);
      }}
    />
  );
}

/** Espace organisme : navigation filtrée selon le rôle actif (S1, S3, S5, S7). */
function OrganismeLayout() {
  const navigate = useNavigate();
  const { session, canAny } = useAuth();
  const { persona } = useOrganisme();

  const navItems = useMemo<ShellNavItem[]>(() => {
    const items: ShellNavItem[] = [
      { to: ORG_DASHBOARD_PATH, labelKey: "org.nav.overview", end: true },
      ...persona.pages.map((page) => ORG_NAV_META[page]),
    ];
    if (canAny(["CONSOLE_MODULE"])) {
      items.push({ to: ORG_MODULES_PATH, labelKey: "org.nav.modules" });
    }
    if (canAny(["MODE_TERRAIN"])) {
      items.push({ to: ORG_TERRAIN_PATH, labelKey: "org.nav.terrain" });
    }
    if (canAny(["VOIR_PCF", "CONSOLE_MODULE"])) {
      items.push({ to: ORG_PCF_WALL_PATH, labelKey: "org.nav.pcfWall" });
    }
    return items;
  }, [persona, canAny]);

  return (
    <AppShell
      variant="organisme"
      homePath={ORG_DASHBOARD_PATH}
      storageKey="cadm-org-sidebar-collapsed"
      navItems={navItems}
      navGroupKey="org.shellGroup"
      authenticated={session !== null}
      topbarExtra={<PersonaSwitcher />}
      onSignOut={() => {
        endSession();
        navigate(STAFF_LOGIN_PATH);
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

function AppRoutes() {
  const { t } = useI18n();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path={LOGIN_PATH} element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path={FORGOT_PASSWORD_PATH} element={<ForgotPasswordPage />} />
      <Route path={STAFF_LOGIN_PATH} element={<StaffLoginPage />} />
      {/* L'ancien espace « responsable de crise » est supprimé : la crise est gérée par l'autorité. */}
      <Route
        path={`${LEGACY_RESP_PATH}/*`}
        element={<Navigate to={STAFF_LOGIN_PATH} replace />}
      />
      <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginPage />} />
      <Route path={PUBLIC_INFO_PATH} element={<PublicInformationPage />} />

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
            <RequireSpace space="citizen">
              <SubmitAlertPage />
            </RequireSpace>
          }
        />
        <Route
          path={MY_REPORTS_PATH}
          element={
            <RequireSpace space="citizen">
              <MyReportsPage />
            </RequireSpace>
          }
        />
        <Route path="*" element={<h1>{t("nav.notFound")}</h1>} />
      </Route>

      {/* ---------- Espace autorité compétente ---------- */}
      <Route
        element={
          <RequireSpace space="authority">
            <AuthorityLayout />
          </RequireSpace>
        }
      >
        <Route
          path={AUTHORITY_DASHBOARD_PATH}
          element={
            <RequirePermission any={["CONSULTER_INCIDENTS_TERRITOIRE"]}>
              <AuthorityDashboard />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_SITUATION_PATH}
          element={
            <RequirePermission any={["CONSULTER_INCIDENTS_TERRITOIRE"]}>
              <AuthoritySituationPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_PLAN_PATH}
          element={
            <RequirePermission any={["APPROUVER_PLAN", "METTRE_EN_ALERTE_PLAN"]}>
              <AuthorityPlanPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_DECISIONS_PATH}
          element={
            <RequirePermission any={["DECLENCHER_PLAN", "LEVER_PLAN", "DESIGNER_FONCTION"]}>
              <AuthorityDecisionsPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_ALERTS_PATH}
          element={
            <RequirePermission any={["VALIDER_ALERTE"]}>
              <AuthorityAlertsPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_CRISIS_PATH}
          element={
            <RequirePermission any={["DECLENCHER_PLAN"]}>
              <AuthorityCrisisPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_PCF_PATH}
          element={
            <RequirePermission any={["PILOTER_SITUATION", "VOIR_PCF"]}>
              <AuthorityPcfPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_PCF_WALL_PATH}
          element={
            <RequirePermission any={["PILOTER_SITUATION", "VOIR_PCF"]}>
              <PcfWallPage exitTo={AUTHORITY_PCF_PATH} />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_REQUISITIONS_PATH}
          element={
            <RequirePermission any={["GERER_REQUISITIONS"]}>
              <RequisitionsPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_COMMUNICATION_PATH}
          element={
            <RequirePermission any={["DIFFUSER_INFO_PUBLIC"]}>
              <PublicCommunicationPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_RECOVERY_PATH}
          element={
            <RequirePermission any={["GERER_REHABILITATION"]}>
              <RecoveryPage />
            </RequirePermission>
          }
        />
        <Route
          path={AUTHORITY_COMPLIANCE_PATH}
          element={
            <RequirePermission any={["SUIVRE_CONFORMITE"]}>
              <CompliancePage />
            </RequirePermission>
          }
        />
      </Route>

      {/* ---------- Espace organisme (S1, S3, S5, S7) ---------- */}
      <Route
        element={
          <RequireSpace space="organisme">
            <OrganismeProvider>
              <OrganismeLayout />
            </OrganismeProvider>
          </RequireSpace>
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
          path={ORG_ROADS_PATH}
          element={
            <OrgGuard page="roads">
              <RoadsPage />
            </OrgGuard>
          }
        />
        <Route
          path={ORG_MARITIME_PATH}
          element={
            <OrgGuard page="maritime">
              <MaritimePage />
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
        <Route
          path={ORG_MODULES_PATH}
          element={
            <RequirePermission any={["CONSOLE_MODULE"]}>
              <ModulesPage />
            </RequirePermission>
          }
        />
        <Route
          path={ORG_MODULE_PATH}
          element={
            <RequirePermission any={["CONSOLE_MODULE"]}>
              <ModuleConsolePage />
            </RequirePermission>
          }
        />
        <Route
          path={ORG_TERRAIN_PATH}
          element={
            <RequirePermission any={["MODE_TERRAIN"]}>
              <TerrainPage />
            </RequirePermission>
          }
        />
        <Route
          path={ORG_PCF_WALL_PATH}
          element={
            <RequirePermission any={["VOIR_PCF", "CONSOLE_MODULE"]}>
              <PcfWallPage exitTo={ORG_PCF_PATH} />
            </RequirePermission>
          }
        />
      </Route>

      {/* ---------- Espace site sensible ---------- */}
      <Route
        element={
          <RequireSpace space="site">
            <SiteLayout />
          </RequireSpace>
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
          <RequireSpace space="admin">
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </RequireSpace>
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
        <Route path={ADMIN_ASSIGNMENTS_PATH} element={<AssignmentsPage />} />
        <Route
          path="*"
          element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />}
        />
      </Route>
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

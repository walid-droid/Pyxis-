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
  DASHBOARD_PATH,
  LOGIN_PATH,
  RESP_DASHBOARD_PATH,
  RESP_LOGIN_PATH,
} from "./config";
import {
  getRespSession,
  getSession,
  signOut,
  signOutResp,
} from "./lib/session";
// Landing is currently implemented in JavaScript/JSX without type declarations.
// @ts-expect-error No declaration file is available for this JSX module.
import Landing from "./landing/Landing";
import ContactsPage from "./pages/citizen/ContactsPage";
import AssistantPage from "./pages/citizen/AssistantPage";
import HomePage from "./pages/citizen/HomePage";
import AlertsPage from "./pages/citizen/AlertsPage";
import SheltersPage from "./pages/citizen/SheltersPage";
import SubmitAlertPage from "./pages/citizen/SubmitAlertPage";
import EventsPage from "./pages/citizen/EventsPage";
import ConsignesPage from "./pages/citizen/ConsignesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RespLoginPage from "./pages/resp-crise/RespLoginPage";
import CommandDashboard from "./pages/resp-crise/CommandDashboard";
import IncidentManagement from "./pages/resp-crise/IncidentManagement";
import CommandChain from "./pages/resp-crise/CommandChain";
import ReportValidation from "./pages/resp-crise/ReportValidation";
import AlertBroadcast from "./pages/resp-crise/AlertBroadcast";
import CrisisResources from "./pages/resp-crise/CrisisResources";
import JournalReports from "./pages/resp-crise/JournalReports";

const CITIZEN_NAV: ShellNavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/alerts", labelKey: "nav.alerts" },
  { to: "/consignes", labelKey: "nav.consignes" },
  { to: "/resources", labelKey: "nav.resources" },
  { to: "/assistant", labelKey: "nav.assistant" },
  { to: "/events", labelKey: "nav.events" },
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

function App() {
  const { t } = useI18n();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path={LOGIN_PATH} element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path={RESP_LOGIN_PATH} element={<RespLoginPage />} />

      {/* ---------- Espace citoyen ---------- */}
      <Route element={<CitizenLayout />}>
        <Route path={DASHBOARD_PATH} element={<HomePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/resources" element={<SheltersPage />} />
        <Route path="/consignes" element={<ConsignesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="/submit-alert"
          element={
            <RequireAuth>
              <SubmitAlertPage />
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
        <Route path="/responsable/journal" element={<JournalReports />} />
      </Route>
    </Routes>
  );
}

export default App;

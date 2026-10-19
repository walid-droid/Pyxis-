import "./App.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Routes, Route, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import logo from "./assets/Logo SafeDZ.png";
import ThemeToggle from "./components/ThemeToggle";
import LanguageToggle from "./components/LanguageToggle";
import { useI18n } from "./i18n";
import { LOGIN_PATH } from "./config";
import { getSession, signOut } from "./lib/session";
// Landing is currently implemented in JavaScript/JSX without type declarations.
// @ts-expect-error No declaration file is available for this JSX module.
import Landing from "./landing/Landing";
import ContactsPage from "./pages/ContactsPage";
import AssistantPage from "./pages/AssistantPage";
import DashboardPage from "./pages/DashboardPage";
import AlertsPage from "./pages/AlertsPage";
import ResourcesPage from "./pages/ResourcesPage";
import SubmitAlertPage from "./pages/SubmitAlertPage";
import EventsPage from "./pages/EventsPage";
import ConsignesPage from "./pages/ConsignesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const NAV_ITEMS = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/alerts", labelKey: "nav.alerts" },
  { to: "/consignes", labelKey: "nav.consignes" },
  { to: "/resources", labelKey: "nav.resources" },
  { to: "/assistant", labelKey: "nav.assistant" },
  { to: "/events", labelKey: "nav.events" },
  { to: "/contacts", labelKey: "nav.contacts" },
];

const SIDEBAR_KEY = "safedz-sidebar-collapsed";

function DashboardLayout() {
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });

  const setSidebarCollapsed = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0");
    } catch {
      // Ignore storage failures (private mode, etc.).
    }
  };

  useEffect(() => {
    const closeOnHistory = () => setMenuOpen(false);
    window.addEventListener("popstate", closeOnHistory);
    return () => window.removeEventListener("popstate", closeOnHistory);
  }, []);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>("a.active");
    active?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className={`app-layout${collapsed ? " is-collapsed" : ""}`}>
      <header className="app-topbar">
        <div className="app-topbar__start">
          <NavLink to="/dashboard" className="app-brand" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="" />
            <span>SafeDZ</span>
          </NavLink>

          <button
            type="button"
            className="app-sidebar-toggle"
            aria-label={collapsed ? t("nav.showSidebar") : t("nav.hideSidebar")}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            onClick={() => setSidebarCollapsed(!collapsed)}
          >
            {collapsed ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M9 4v16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m14 9-3 3 3 3" />
              </svg>
            )}
          </button>
        </div>

        <div className="app-topbar__end">
          <LanguageToggle />
          <ThemeToggle />

          <button
            type="button"
            className="app-menu-toggle"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <aside
        id="app-sidebar"
        className={`app-sidebar${menuOpen ? " is-open" : ""}`}
      >
        <nav className="app-nav" ref={navRef} aria-label={t("nav.main")}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__foot">
          <a className="app-sidebar__call" href="tel:14">
            {t("nav.emergencyCall")}
          </a>
          {session && (
            <button
              type="button"
              className="app-sidebar__logout"
              onClick={() => {
                signOut();
                setSession(null);
                navigate("/");
              }}
            >
              {t("nav.logout")}
            </button>
          )}
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="app-sidebar__backdrop"
          aria-label={t("nav.closeMenu")}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="app-main">
        <Outlet />
      </div>
    </div>
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

function App() {
  const { t } = useI18n();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
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
    </Routes>
  );
}

export default App;

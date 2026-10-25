import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import logo from "../assets/Logo CADM.png";
import ConnectionStatus from "./ConnectionStatus";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { useI18n } from "../i18n";

export type ShellNavItem = {
  to: string;
  labelKey: string;
  end?: boolean;
};

type AppShellProps = {
  /** Route cible du logo. */
  homePath: string;
  /** Clé de persistance de la réduction de la barre latérale. */
  storageKey: string;
  navItems: ShellNavItem[];
  /** Titre affiché au-dessus des liens (espace responsable). */
  navGroupKey?: string;
  variant?: "citizen" | "crisis" | "admin";
  authenticated: boolean;
  onSignOut: () => void;
};

/**
 * Coque commune aux deux espaces (citoyen et responsable de crise) :
 * barre flottante, barre latérale escamotable et tiroir mobile.
 */
function AppShell({
  homePath,
  storageKey,
  navItems,
  navGroupKey,
  variant = "citizen",
  authenticated,
  onSignOut,
}: AppShellProps) {
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  const setSidebarCollapsed = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(storageKey, value ? "1" : "0");
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <div
      className={`app-layout${collapsed ? " is-collapsed" : ""}${
        variant === "crisis"
          ? " app-layout--resp"
          : variant === "admin"
            ? " app-layout--admin"
            : ""
      }`}
    >
      <header className={`app-topbar${scrolled ? " is-scrolled" : ""}`}>
        <div className="app-topbar__start">
          <NavLink to={homePath} className="app-brand" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="" />
            <span>CADM</span>
          </NavLink>

          {variant !== "citizen" && (
            <span className="app-topbar__role">
              {t(variant === "admin" ? "admin.topbarRole" : "resp.topbarRole")}
            </span>
          )}

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
          <ConnectionStatus />
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
          {navGroupKey && (
            <p className="app-nav__title app-nav__title--first">
              {t(navGroupKey)}
            </p>
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__foot">
          {authenticated && (
            <button
              type="button"
              className="app-sidebar__logout"
              onClick={onSignOut}
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

export default AppShell;

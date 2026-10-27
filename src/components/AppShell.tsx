import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import logo from "../assets/Logo CADM.png";
import AssistantPage from "../pages/assistant/AssistantPage";
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
  /** Ouvre la connexion pour un visiteur non authentifié. */
  onSignIn?: () => void;
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
  onSignIn,
}: AppShellProps) {
  const navRef = useRef<HTMLElement>(null);
  const assistantTriggerRef = useRef<HTMLButtonElement>(null);
  const assistantDialogRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistantLabel = assistantOpen
    ? t("nav.closeAssistant")
    : t("nav.assistant");
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

  /** Ouvre ou ferme la fenêtre de l'assistant. */
  const toggleAssistant = () => {
    setMenuOpen(false);
    setAssistantOpen((open) => !open);
  };

  const closeAssistant = () => setAssistantOpen(false);

  // Verrouille le défilement de la page et piège le focus dans la modale.
  useEffect(() => {
    if (!assistantOpen) return;

    const dialog = assistantDialogRef.current;
    const trigger = assistantTriggerRef.current;
    dialog?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAssistantOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!active || !dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      trigger?.focus();
    };
  }, [assistantOpen]);

  useEffect(() => {
    const closeOnHistory = () => {
      setMenuOpen(false);
      setAssistantOpen(false);
    };
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

          <button
            type="button"
            ref={assistantTriggerRef}
            className={`app-assistant-link${assistantOpen ? " is-active" : ""}`}
            aria-label={assistantLabel}
            title={assistantLabel}
            aria-haspopup="dialog"
            aria-expanded={assistantOpen}
            aria-controls="assistant-dialog"
            onClick={toggleAssistant}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="7" width="14" height="11" rx="3" />
              <path d="M12 7V4" />
              <circle cx="12" cy="3" r="1" />
              <path d="M3 12h2M19 12h2" />
              <circle cx="9.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="14.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
              <path d="M9 15h6" />
            </svg>
            <span className="app-control-label">{t("nav.assistantShort")}</span>
          </button>

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

        {(authenticated || onSignIn) && (
          <div className="app-sidebar__foot">
            {authenticated ? (
              <button
                type="button"
                className="app-sidebar__logout"
                onClick={onSignOut}
              >
                {t("nav.logout")}
              </button>
            ) : (
              <button
                type="button"
                className="app-sidebar__login"
                onClick={onSignIn}
              >
                {t("nav.login")}
              </button>
            )}
          </div>
        )}
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

      {/* Assistant IA : fenêtre modale commune aux trois espaces. */}
      <div
        className="assistant-popup"
        hidden={!assistantOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeAssistant();
        }}
      >
        <div
          id="assistant-dialog"
          className="assistant-popup__dialog"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.assistant")}
          ref={assistantDialogRef}
          tabIndex={-1}
        >
          <AssistantPage onClose={closeAssistant} />
        </div>
      </div>
    </div>
  );
}

export default AppShell;

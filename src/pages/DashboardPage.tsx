import "./DashboardPage.css";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { useI18n } from "../i18n";

const QUICK_LINKS: {
  key: string;
  labelKey: string;
  descKey: string;
  to: string;
  icon: ReactNode;
}[] = [
  {
    key: "alerts",
    labelKey: "dashboard.quick.alerts",
    descKey: "dashboard.quick.alertsDesc",
    to: "/alerts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "resources",
    labelKey: "dashboard.quick.resources",
    descKey: "dashboard.quick.resourcesDesc",
    to: "/resources",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9.5 9-7 9 7" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    ),
  },
  {
    key: "consignes",
    labelKey: "dashboard.quick.consignes",
    descKey: "dashboard.quick.consignesDesc",
    to: "/consignes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "contacts",
    labelKey: "dashboard.quick.contacts",
    descKey: "dashboard.quick.contactsDesc",
    to: "/contacts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    key: "assistant",
    labelKey: "dashboard.quick.assistant",
    descKey: "dashboard.quick.assistantDesc",
    to: "/assistant",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M12 8V5" />
        <path d="M8 4h8" />
        <path d="M9 13h.01M15 13h.01" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    key: "events",
    labelKey: "dashboard.quick.events",
    descKey: "dashboard.quick.eventsDesc",
    to: "/events",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01" />
      </svg>
    ),
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <main className="page-container dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__text">
          <span className="live-badge">
            <i className="live-dot" /> {t("dashboard.live")}
          </span>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.lead")}</p>
          <div className="dashboard-hero__actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/submit-alert")}
            >
              {t("dashboard.createAlert")}
            </button>
            <Link to="/alerts" className="btn-secondary">
              {t("dashboard.viewAlerts")}
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-quick" aria-labelledby="dashboard-quick-title">
        <h2 id="dashboard-quick-title" className="dashboard-quick__title">
          {t("dashboard.quickTitle")}
        </h2>
        <div className="dashboard-quick__grid">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`dashboard-quick__card ${link.key}`}
            >
              <span className="dashboard-quick__icon" aria-hidden="true">
                {link.icon}
              </span>
              <span className="dashboard-quick__label">{t(link.labelKey)}</span>
              <span className="dashboard-quick__desc">{t(link.descKey)}</span>
              <span className="dashboard-quick__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-emergency" aria-label={t("dashboard.emergency.title")}>
        <span className="dashboard-emergency__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
        </span>
        <div className="dashboard-emergency__text">
          <strong>{t("dashboard.emergency.title")}</strong>
          <span>{t("dashboard.emergency.text")}</span>
        </div>
        <a className="dashboard-emergency__call" href="tel:14">
          {t("dashboard.emergency.call")} <span>14</span>
        </a>
      </section>
    </main>
  );
}

export default DashboardPage;

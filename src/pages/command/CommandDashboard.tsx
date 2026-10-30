import "./resp-crise.css";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useI18n } from "../../i18n";

type QuickLink = {
  key: string;
  labelKey: string;
  descKey: string;
  to: string;
  icon: ReactNode;
};

const QUICK_LINKS: QuickLink[] = [
  {
    key: "incidents",
    labelKey: "resp.dash.quick.incidents",
    descKey: "resp.dash.quick.incidentsDesc",
    to: "/responsable/incidents/1",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v2" />
        <path d="M5 21h14" />
        <path d="M6 21v-5a6 6 0 0 1 12 0v5" />
        <path d="M12 7v4" />
        <path d="M12 14h.01" />
      </svg>
    ),
  },
  {
    key: "chain",
    labelKey: "resp.dash.quick.chain",
    descKey: "resp.dash.quick.chainDesc",
    to: "/responsable/chaine",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="3" width="6" height="5" rx="1" />
        <rect x="2" y="16" width="6" height="5" rx="1" />
        <rect x="16" y="16" width="6" height="5" rx="1" />
        <path d="M12 8v4" />
        <path d="M5 16v-4h14v4" />
      </svg>
    ),
  },
  {
    key: "reports",
    labelKey: "resp.dash.quick.reports",
    descKey: "resp.dash.quick.reportsDesc",
    to: "/responsable/signalements",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    ),
  },
  {
    key: "broadcast",
    labelKey: "resp.dash.quick.broadcast",
    descKey: "resp.dash.quick.broadcastDesc",
    to: "/responsable/diffusion",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
        <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
      </svg>
    ),
  },
  {
    key: "resources",
    labelKey: "resp.dash.quick.resources",
    descKey: "resp.dash.quick.resourcesDesc",
    to: "/responsable/ressources",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" />
        <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
        <path d="M9 18h6" />
      </svg>
    ),
  },
  {
    key: "journal",
    labelKey: "resp.dash.quick.journal",
    descKey: "resp.dash.quick.journalDesc",
    to: "/responsable/journal",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M9 7h7" />
        <path d="M9 11h7" />
      </svg>
    ),
  },
];

/** Accueil du PC de crise : un accès rapide vers chaque page de l'espace. */
function CommandDashboard() {
  const { t } = useI18n();

  return (
    <main className="rc-page">
      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.dash.eyebrow")}</p>
          <h1>{t("resp.dash.title")}</h1>
          <p className="rc-hero__lead">{t("resp.dash.lead")}</p>
        </div>

        <div className="rc-hero__aside">
          <Link
            className="rc-btn rc-btn--primary"
            to="/responsable/diffusion"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              width="18"
              height="18"
            >
              <path d="m3 11 18-5v12L3 14v-3z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
            {t("resp.dash.broadcastAlert")}
          </Link>
        </div>
      </section>

      <section className="rc-quick" aria-labelledby="resp-quick-title">
        <div className="rc-quick__head">
          <h2 id="resp-quick-title" className="rc-quick__title">
            {t("resp.dash.quickTitle")}
          </h2>
          <p className="rc-quick__lead">{t("resp.dash.quickLead")}</p>
        </div>

        <div className="rc-quick__grid">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`rc-quick-card rc-quick-card--${link.key}`}
            >
              <span className="rc-quick-card__icon" aria-hidden="true">
                {link.icon}
              </span>
              <span className="rc-quick-card__label">{t(link.labelKey)}</span>
              <span className="rc-quick-card__desc">{t(link.descKey)}</span>
              <span className="rc-quick-card__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default CommandDashboard;

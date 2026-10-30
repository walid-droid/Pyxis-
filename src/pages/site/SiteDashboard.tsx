import "../command/resp-crise.css";
import "./site.css";
import type { ReactNode } from "react";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import {
  SITE_CONSIGNES_PATH,
  SITE_PLAN_PATH,
  SITE_SIMULATIONS_PATH,
} from "../../config";
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
    key: "plan",
    labelKey: "site.dash.quick.plan",
    descKey: "site.dash.quick.planDesc",
    to: SITE_PLAN_PATH,
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
        <path d="M9 3h6l1 3h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3l1-3Z" />
        <path d="M9 13l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "simulations",
    labelKey: "site.dash.quick.simulations",
    descKey: "site.dash.quick.simulationsDesc",
    to: SITE_SIMULATIONS_PATH,
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    key: "consignes",
    labelKey: "site.dash.quick.consignes",
    descKey: "site.dash.quick.consignesDesc",
    to: SITE_CONSIGNES_PATH,
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
        <path d="M12 3 3 7v5c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7l-9-4Z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
  },
];

const CONTACTS = [
  { key: "pcf", statusKey: "site.dash.contactJoined", tone: "low" },
  { key: "protection", statusKey: "site.dash.contactJoined", tone: "low" },
  { key: "apc", statusKey: "site.dash.contactJoined", tone: "low" },
  { key: "samu", statusKey: "site.dash.contactStandby", tone: "standby" },
];

/** Accueil de l'exploitant de site sensible. */
function SiteDashboard() {
  const { t } = useI18n();

  return (
    <main className="rc-page rc-page--site">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("site.dash.eyebrow")}</p>
          <h1>{t("site.dash.title")}</h1>
          <p className="rc-hero__lead">{t("site.dash.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--low" />
              {t("site.dash.chipSite")}
            </span>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {t("site.dash.chipPlan")}
            </span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <Link className="rc-btn rc-btn--primary" to={SITE_PLAN_PATH}>
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
              <path d="M9 3h6l1 3h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3l1-3Z" />
              <path d="M9 13l2 2 4-4" />
            </svg>
            {t("site.dash.openPlan")}
          </Link>
        </div>
      </section>

      <section className="stat-grid" aria-label={t("site.dash.statsLabel")}>
        <StatCard
          value={t("site.dash.statPlanValue")}
          label={t("site.dash.statPlan")}
          badge={t("site.dash.statPlanBadge")}
          badgeTone="success"
        />
        <StatCard
          value="2/4"
          label={t("site.dash.statSimulations")}
          badge={t("site.dash.statSimulationsBadge")}
          badgeTone="warning"
        />
        <StatCard
          value="1 240"
          label={t("site.dash.statPeople")}
          badge={t("site.dash.statPeopleBadge")}
          badgeTone="info"
        />
        <StatCard
          value={t("site.dash.statInspectionValue")}
          label={t("site.dash.statInspection")}
          badge={t("site.dash.statInspectionBadge")}
          badgeTone="success"
        />
      </section>

      <section className="rc-quick" aria-labelledby="site-quick-title">
        <div className="rc-quick__head">
          <h2 id="site-quick-title" className="rc-quick__title">
            {t("site.dash.quickTitle")}
          </h2>
          <p className="rc-quick__lead">{t("site.dash.quickLead")}</p>
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

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("site.dash.consignesTitle")}</h2>
            <Link className="rc-link" to={SITE_CONSIGNES_PATH}>
              {t("site.dash.viewAll")}
            </Link>
          </div>
          <p className="rc-card__lead">{t("site.dash.consignesLead")}</p>
          <ul className="rc-list">
            <li>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t("site.consignes.point1")}
                  </p>
                  <p className="rc-item__meta">
                    <span>{t("site.consignes.point1Meta")}</span>
                  </p>
                </div>
                <span className="rc-badge rc-badge--active">
                  {t("site.dash.active")}
                </span>
              </div>
            </li>
            <li>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t("site.consignes.point2")}
                  </p>
                  <p className="rc-item__meta">
                    <span>{t("site.consignes.point2Meta")}</span>
                  </p>
                </div>
                <span className="rc-badge rc-badge--active">
                  {t("site.dash.active")}
                </span>
              </div>
            </li>
            <li>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t("site.consignes.point3")}
                  </p>
                  <p className="rc-item__meta">
                    <span>{t("site.consignes.point3Meta")}</span>
                  </p>
                </div>
                <span className="rc-badge rc-badge--medium">
                  {t("site.dash.toReview")}
                </span>
              </div>
            </li>
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("site.dash.contactsTitle")}</h2>
            <span className="rc-card__hint">{t("site.dash.contactsHint")}</span>
          </div>
          <p className="rc-card__lead">{t("site.dash.contactsLead")}</p>
          <ul className="rc-list">
            {CONTACTS.map((contact) => (
              <li key={contact.key}>
                <div className="rc-item rc-item--static">
                  <div className="rc-item__body">
                    <p className="rc-item__title">
                      {t(`site.dash.contact.${contact.key}`)}
                    </p>
                    <p className="rc-item__meta">
                      <span>{t(`site.dash.contactPhone.${contact.key}`)}</span>
                    </p>
                  </div>
                  <span className={`rc-badge rc-badge--${contact.tone}`}>
                    {t(contact.statusKey)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default SiteDashboard;

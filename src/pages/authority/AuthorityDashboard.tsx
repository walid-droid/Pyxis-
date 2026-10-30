import "../command/resp-crise.css";
import "./authority.css";
import type { ReactNode } from "react";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import {
  AUTHORITY_ALERTS_PATH,
  AUTHORITY_CRISIS_PATH,
  AUTHORITY_DECISIONS_PATH,
  AUTHORITY_PLAN_PATH,
  AUTHORITY_SITUATION_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import { designatedCount, modulesForLevel } from "../shared/plan/orsecPlan";

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
    labelKey: "authority.dash.quick.plan",
    descKey: "authority.dash.quick.planDesc",
    to: AUTHORITY_PLAN_PATH,
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
    key: "situation",
    labelKey: "authority.dash.quick.situation",
    descKey: "authority.dash.quick.situationDesc",
    to: AUTHORITY_SITUATION_PATH,
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
        <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    key: "decisions",
    labelKey: "authority.dash.quick.decisions",
    descKey: "authority.dash.quick.decisionsDesc",
    to: AUTHORITY_DECISIONS_PATH,
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
  {
    key: "alerts",
    labelKey: "authority.dash.quick.alerts",
    descKey: "authority.dash.quick.alertsDesc",
    to: AUTHORITY_ALERTS_PATH,
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
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    key: "crisis",
    labelKey: "authority.dash.quick.crisis",
    descKey: "authority.dash.quick.crisisDesc",
    to: AUTHORITY_CRISIS_PATH,
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
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
];

const WILAYAS = [
  { key: "alger", levelKey: "authority.level.high", level: "high" },
  { key: "blida", levelKey: "authority.level.medium", level: "medium" },
  { key: "tipaza", levelKey: "authority.level.low", level: "low" },
  { key: "boumerdes", levelKey: "authority.level.low", level: "low" },
];

const DECISIONS = [
  { key: "d1", typeKey: "authority.decisions.type.diffusion", tone: "high" },
  { key: "d2", typeKey: "authority.decisions.type.requisition", tone: "critical" },
  { key: "d3", typeKey: "authority.decisions.type.activation", tone: "medium" },
];

/** Accueil de l'autorité compétente : situation, plan et décisions. */
function AuthorityDashboard() {
  const { t } = useI18n();
  const { plans } = useOrsecPlans();
  const designated = designatedCount(plans.wilaya);
  const missing = modulesForLevel("wilaya").length - designated;

  return (
    <main className="rc-page rc-page--authority">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("authority.dash.eyebrow")}</p>
          <h1>{t("authority.dash.title")}</h1>
          <p className="rc-hero__lead">{t("authority.dash.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t("authority.dash.chipScope")}
            </span>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--low" />
              {t("authority.dash.chipPlan")}
            </span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <Link className="rc-btn rc-btn--primary" to={AUTHORITY_PLAN_PATH}>
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
            {t("authority.dash.openPlan")}
          </Link>
        </div>
      </section>

      <section className="stat-grid" aria-label={t("authority.dash.statsLabel")}>
        <StatCard
          value={t("authority.dash.statLevelValue")}
          label={t("authority.dash.statLevel")}
          badge={t("authority.dash.statLevelBadge")}
          badgeTone="warning"
        />
        <StatCard
          value={`${designated}/${modulesForLevel("wilaya").length}`}
          label={t("authority.dash.statModules")}
          badge={
            missing > 0
              ? t("orsec.modules.missingShort", { count: missing })
              : t("orsec.modules.allDesignated")
          }
          badgeTone={missing > 0 ? "warning" : "success"}
        />
        <StatCard
          value="12"
          label={t("authority.dash.statDecisions")}
          badge={t("authority.dash.statDecisionsBadge")}
          badgeTone="success"
        />
        <StatCard
          value="38"
          label={t("authority.dash.statReports")}
          badge={t("authority.dash.statReportsBadge")}
          badgeTone="danger"
        />
      </section>

      <section className="rc-quick" aria-labelledby="authority-quick-title">
        <div className="rc-quick__head">
          <h2 id="authority-quick-title" className="rc-quick__title">
            {t("authority.dash.quickTitle")}
          </h2>
          <p className="rc-quick__lead">{t("authority.dash.quickLead")}</p>
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
            <h2 className="rc-card__title">
              {t("authority.dash.situationTitle")}
            </h2>
            <Link className="rc-link" to={AUTHORITY_SITUATION_PATH}>
              {t("authority.dash.viewAll")}
            </Link>
          </div>
          <p className="rc-card__lead">{t("authority.dash.situationLead")}</p>
          <ul className="rc-list">
            {WILAYAS.map((wilaya) => (
              <li key={wilaya.key}>
                <div className="rc-item rc-item--static">
                  <div className="rc-item__body">
                    <p className="rc-item__title">
                      {t(`authority.situation.${wilaya.key}`)}
                    </p>
                    <p className="rc-item__meta">
                      <span>
                        {t("authority.situation.incidents", { count: 3 })}
                      </span>
                      <span>{t("authority.situation.updated")}</span>
                    </p>
                  </div>
                  <span className={`rc-badge rc-badge--${wilaya.level}`}>
                    {t(wilaya.levelKey)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">
              {t("authority.dash.decisionsTitle")}
            </h2>
            <Link className="rc-link" to={AUTHORITY_DECISIONS_PATH}>
              {t("authority.dash.viewAll")}
            </Link>
          </div>
          <p className="rc-card__lead">{t("authority.dash.decisionsLead")}</p>
          <ul className="rc-list">
            {DECISIONS.map((decision) => (
              <li key={decision.key}>
                <div className="rc-item rc-item--static">
                  <div className="rc-item__body">
                    <p className="rc-item__title">
                      {t(`authority.decisions.${decision.key}`)}
                    </p>
                    <p className="rc-item__meta">
                      <span>{t("authority.decisions.today")}</span>
                      <span>{t("authority.decisions.authorValue")}</span>
                    </p>
                  </div>
                  <span className={`rc-badge rc-badge--${decision.tone}`}>
                    {t(decision.typeKey)}
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

export default AuthorityDashboard;

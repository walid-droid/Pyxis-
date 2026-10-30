import "../command/resp-crise.css";
import "./site.css";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import { SITE_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";

type Simulation = {
  key: string;
  date: string;
  status: "done" | "planned" | "todo";
  tone: "low" | "medium" | "standby";
};

const SIMULATIONS: Simulation[] = [
  { key: "s1", date: "12/03/2026", status: "done", tone: "low" },
  { key: "s2", date: "18/06/2026", status: "done", tone: "low" },
  { key: "s3", date: "22/09/2026", status: "planned", tone: "medium" },
  { key: "s4", date: "15/12/2026", status: "todo", tone: "standby" },
];

/** Programme annuel des simulations du site sensible. */
function SiteSimulationsPage() {
  const { t } = useI18n();

  return (
    <main className="rc-page rc-page--site">
      <Link className="rc-back-link" to={SITE_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("site.simulations.eyebrow")}</p>
          <h1>{t("site.simulations.title")}</h1>
          <p className="rc-hero__lead">{t("site.simulations.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {t("site.simulations.chip")}
            </span>
          </div>
        </div>
        <div className="rc-hero__aside">
          <button type="button" className="rc-btn rc-btn--ghost">
            {t("site.simulations.report")}
          </button>
        </div>
      </section>

      <section className="stat-grid" aria-label={t("site.simulations.statsLabel")}>
        <StatCard
          value="2"
          label={t("site.simulations.statDone")}
          badge={t("site.simulations.statDoneBadge")}
          badgeTone="success"
        />
        <StatCard
          value="1"
          label={t("site.simulations.statPlanned")}
          badge={t("site.simulations.statPlannedBadge")}
          badgeTone="warning"
        />
        <StatCard
          value="1"
          label={t("site.simulations.statTodo")}
          badge={t("site.simulations.statTodoBadge")}
          badgeTone="neutral"
        />
        <StatCard
          value="94 %"
          label={t("site.simulations.statParticipation")}
          badge={t("site.simulations.statParticipationBadge")}
          badgeTone="info"
        />
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("site.simulations.listTitle")}</h2>
          <span className="rc-card__hint">
            {t("site.simulations.listHint")}
          </span>
        </div>
        <p className="rc-card__lead">{t("site.simulations.listLead")}</p>

        <ul className="rc-list">
          {SIMULATIONS.map((simulation) => (
            <li key={simulation.key}>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t(`site.simulations.${simulation.key}`)}
                  </p>
                  <p className="rc-item__meta">
                    <span>{simulation.date}</span>
                    <span>{t(`site.simulations.scope.${simulation.key}`)}</span>
                  </p>
                </div>
                <span className={`rc-badge rc-badge--${simulation.tone}`}>
                  {t(`site.simulations.status.${simulation.status}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="rc-card__foot">
          <p className="site-note">{t("site.simulations.note")}</p>
        </div>
      </article>
    </main>
  );
}

export default SiteSimulationsPage;

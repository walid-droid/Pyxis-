import "../command/resp-crise.css";
import "./authority.css";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import { AUTHORITY_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";

type Wilaya = {
  key: string;
  level: "low" | "medium" | "high" | "critical";
  incidents: number;
  teams: number;
};

const WILAYAS: Wilaya[] = [
  { key: "alger", level: "high", incidents: 7, teams: 12 },
  { key: "blida", level: "medium", incidents: 4, teams: 6 },
  { key: "tipaza", level: "low", incidents: 1, teams: 2 },
  { key: "boumerdes", level: "low", incidents: 2, teams: 3 },
  { key: "tiziOuzou", level: "medium", incidents: 3, teams: 5 },
  { key: "chlef", level: "critical", incidents: 9, teams: 14 },
];

/** Situation opérationnelle du périmètre de l'autorité. */
function AuthoritySituationPage() {
  const { t } = useI18n();

  return (
    <main className="rc-page rc-page--authority">
      <Link className="rc-back-link" to={AUTHORITY_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("authority.situation.eyebrow")}</p>
          <h1>{t("authority.situation.title")}</h1>
          <p className="rc-hero__lead">{t("authority.situation.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t("authority.situation.chip")}
            </span>
          </div>
        </div>
      </section>

      <section className="stat-grid" aria-label={t("authority.situation.statsLabel")}>
        <StatCard
          value="26"
          label={t("authority.situation.statIncidents")}
          badge={t("authority.situation.statIncidentsBadge")}
          badgeTone="danger"
        />
        <StatCard
          value="42"
          label={t("authority.situation.statTeams")}
          badge={t("authority.situation.statTeamsBadge")}
          badgeTone="info"
        />
        <StatCard
          value="6"
          label={t("authority.situation.statWilayas")}
          badge={t("authority.situation.statWilayasBadge")}
          badgeTone="success"
        />
        <StatCard
          value="3"
          label={t("authority.situation.statAlerts")}
          badge={t("authority.situation.statAlertsBadge")}
          badgeTone="warning"
        />
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("authority.situation.tableTitle")}</h2>
          <span className="rc-card__hint">{t("authority.situation.tableHint")}</span>
        </div>
        <p className="rc-card__lead">{t("authority.situation.tableLead")}</p>

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
                      {t("authority.situation.incidents", {
                        count: wilaya.incidents,
                      })}
                    </span>
                    <span>
                      {t("authority.situation.teams", { count: wilaya.teams })}
                    </span>
                    <span>{t("authority.situation.updated")}</span>
                  </p>
                </div>
                <span className={`rc-badge rc-badge--${wilaya.level}`}>
                  {t(`authority.level.${wilaya.level}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="rc-card__foot">
          <p className="au-note">{t("authority.situation.note")}</p>
        </div>
      </article>
    </main>
  );
}

export default AuthoritySituationPage;

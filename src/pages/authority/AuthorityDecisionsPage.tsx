import "../command/resp-crise.css";
import "./authority.css";
import { Link } from "react-router";
import { AUTHORITY_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";

type Decision = {
  key: string;
  typeKey: string;
  tone: "critical" | "high" | "medium" | "low";
  time: string;
};

const DECISIONS: Decision[] = [
  {
    key: "d1",
    typeKey: "authority.decisions.type.diffusion",
    tone: "high",
    time: "14:32",
  },
  {
    key: "d2",
    typeKey: "authority.decisions.type.requisition",
    tone: "critical",
    time: "13:58",
  },
  {
    key: "d3",
    typeKey: "authority.decisions.type.activation",
    tone: "medium",
    time: "12:10",
  },
  {
    key: "d4",
    typeKey: "authority.decisions.type.coordination",
    tone: "low",
    time: "11:45",
  },
  {
    key: "d5",
    typeKey: "authority.decisions.type.lift",
    tone: "low",
    time: "10:20",
  },
];

/** Journal des décisions prises par l'autorité compétente. */
function AuthorityDecisionsPage() {
  const { t } = useI18n();

  return (
    <main className="rc-page rc-page--authority">
      <Link className="rc-back-link" to={AUTHORITY_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("authority.decisions.eyebrow")}</p>
          <h1>{t("authority.decisions.title")}</h1>
          <p className="rc-hero__lead">{t("authority.decisions.lead")}</p>
        </div>
        <div className="rc-hero__aside">
          <button type="button" className="rc-btn rc-btn--ghost">
            {t("authority.decisions.export")}
          </button>
        </div>
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">
            {t("authority.decisions.listTitle")}
          </h2>
          <span className="rc-card__hint">
            {t("authority.decisions.count", { count: DECISIONS.length })}
          </span>
        </div>
        <p className="rc-card__lead">{t("authority.decisions.listLead")}</p>

        <ul className="rc-list">
          {DECISIONS.map((decision) => (
            <li key={decision.key}>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t(`authority.decisions.${decision.key}`)}
                  </p>
                  <p className="rc-item__meta">
                    <span>{decision.time}</span>
                    <span>{t("authority.decisions.authorValue")}</span>
                    <span>{t("authority.decisions.trace")}</span>
                  </p>
                </div>
                <span className={`rc-badge rc-badge--${decision.tone}`}>
                  {t(decision.typeKey)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="rc-card__foot">
          <p className="au-note">{t("authority.decisions.note")}</p>
        </div>
      </article>
    </main>
  );
}

export default AuthorityDecisionsPage;

import "../command/resp-crise.css";
import "./site.css";
import { Link } from "react-router";
import { SITE_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";

const POINTS = ["point1", "point2", "point3", "point4"] as const;

/** Consignes de sécurité et points de rassemblement du site. */
function SiteConsignesPage() {
  const { t } = useI18n();

  return (
    <main className="rc-page rc-page--site">
      <Link className="rc-back-link" to={SITE_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("site.consignes.eyebrow")}</p>
          <h1>{t("site.consignes.title")}</h1>
          <p className="rc-hero__lead">{t("site.consignes.lead")}</p>
        </div>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("site.consignes.listTitle")}</h2>
            <span className="rc-card__hint">
              {t("site.consignes.listHint")}
            </span>
          </div>
          <p className="rc-card__lead">{t("site.consignes.listLead")}</p>

          <div className="rc-list">
            {POINTS.map((point, index) => (
              <div className="site-point" key={point}>
                <span className="site-point__index" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="site-point__body">
                  <strong>{t(`site.consignes.${point}`)}</strong>
                  <span>{t(`site.consignes.${point}Meta`)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">
              {t("site.consignes.assemblyTitle")}
            </h2>
          </div>
          <p className="rc-card__lead">{t("site.consignes.assemblyLead")}</p>

          <ul className="rc-list">
            <li>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t("site.consignes.assembly1")}
                  </p>
                  <p className="rc-item__meta">
                    <span>{t("site.consignes.assembly1Meta")}</span>
                  </p>
                </div>
                <span className="rc-badge rc-badge--low">
                  {t("site.consignes.assemblyOpen")}
                </span>
              </div>
            </li>
            <li>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t("site.consignes.assembly2")}
                  </p>
                  <p className="rc-item__meta">
                    <span>{t("site.consignes.assembly2Meta")}</span>
                  </p>
                </div>
                <span className="rc-badge rc-badge--low">
                  {t("site.consignes.assemblyOpen")}
                </span>
              </div>
            </li>
            <li>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t("site.consignes.assembly3")}
                  </p>
                  <p className="rc-item__meta">
                    <span>{t("site.consignes.assembly3Meta")}</span>
                  </p>
                </div>
                <span className="rc-badge rc-badge--medium">
                  {t("site.consignes.assemblyClosed")}
                </span>
              </div>
            </li>
          </ul>

          <div className="rc-card__foot">
            <p className="site-note">{t("site.consignes.note")}</p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default SiteConsignesPage;

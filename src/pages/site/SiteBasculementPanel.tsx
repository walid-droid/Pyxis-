import { useState, type FormEvent } from "react";
import { useI18n } from "../../i18n";
import { useOrsecOps } from "../../lib/orsecOps";
import { useOperator } from "../shared/ops/useOperator";
import "../shared/ops/ops.css";

/** Basculement PPI / PII du site sensible. */
export default function SiteBasculementPanel() {
  const { t } = useI18n();
  const operator = useOperator();
  const { siteBasculement, declareBasculement } = useOrsecOps();
  const [threshold, setThreshold] = useState("Rejet gazeux confirmé");
  const [people, setPeople] = useState("120");
  const [means, setMeans] = useState("Équipes interne + protection civile");
  const [toast, setToast] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (threshold.trim().length < 4 || means.trim().length < 4) return;
    declareBasculement(
      threshold.trim(),
      Number(people) || 0,
      means.trim(),
      operator.name,
    );
    setToast(t("ops.site.declared"));
  };

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.site.title")}</h2>
        <span
          className={`ops-badge ops-badge--${
            siteBasculement.active ? "danger" : "muted"
          }`}
        >
          {siteBasculement.active ? t("ops.site.active") : t("ops.site.inactive")}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.site.lead")}</p>
      <p className="ops-muted">{t("ops.site.hint")}</p>

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      {siteBasculement.active ? (
        <div className="ops-situation ops-situation--emergency">
          <div className="ops-situation__row">
            <span className="ops-situation__code" aria-hidden="true">
              PPI
            </span>
            <div className="ops-situation__body">
              <span className="ops-situation__name">{t("ops.site.basculement")}</span>
              <span className="ops-situation__meta">
                {t("ops.site.at")} · {siteBasculement.at}
              </span>
            </div>
          </div>
          <dl className="ops-kpis">
            <div className="ops-kpi">
              <span className="ops-kpi__value">{siteBasculement.people}</span>
              <span className="ops-kpi__label">{t("ops.site.people")}</span>
            </div>
            <div className="ops-kpi">
              <span className="ops-kpi__value">{siteBasculement.threshold}</span>
              <span className="ops-kpi__label">{t("ops.site.threshold")}</span>
            </div>
            <div className="ops-kpi">
              <span className="ops-kpi__value">{siteBasculement.by}</span>
              <span className="ops-kpi__label">{t("ops.site.who")}</span>
            </div>
          </dl>
          <p className="ops-muted">
            {t("ops.site.means")} · {siteBasculement.means}
          </p>
        </div>
      ) : (
        <form className="ops-form" onSubmit={submit}>
          <div className="ops-form__row">
            <label className="ops-field">
              <span>{t("ops.site.threshold")} *</span>
              <input
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                minLength={4}
                required
              />
            </label>
            <label className="ops-field">
              <span>{t("ops.site.people")}</span>
              <input
                type="number"
                min={0}
                value={people}
                onChange={(event) => setPeople(event.target.value)}
              />
            </label>
          </div>
          <label className="ops-field">
            <span>{t("ops.site.means")} *</span>
            <input
              value={means}
              onChange={(event) => setMeans(event.target.value)}
              minLength={4}
              required
            />
          </label>
          <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="ops-btn ops-btn--danger"
              disabled={threshold.trim().length < 4 || means.trim().length < 4}
            >
              {t("ops.site.declare")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

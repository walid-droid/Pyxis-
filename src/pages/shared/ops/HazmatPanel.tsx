import { useState, type CSSProperties, type FormEvent } from "react";
import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import "./ops.css";

export default function HazmatPanel() {
  const { t, tc } = useI18n();
  const { hazmat, updateHazmat, toggleHazmat } = useOrsecOps();
  const [product, setProduct] = useState(hazmat.product.fr);
  const [direction, setDirection] = useState(String(hazmat.windDirection));
  const [speed, setSpeed] = useState(String(hazmat.windSpeed));
  const [toast, setToast] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    updateHazmat(
      product.trim() || hazmat.product.fr,
      Number(direction) || 0,
      Number(speed) || 0,
    );
    setToast(t("ops.hazmat.saved"));
  };

  return (
    <section className="ops-hazmat">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.hazmat.title")}</h2>
        <span className={`ops-badge ops-badge--${hazmat.active ? "danger" : "muted"}`}>
          {hazmat.active ? t("ops.map.active") : t("ops.map.inactive")}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.hazmat.lead")}</p>

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <div
        className="ops-hazmat__plume"
        style={{ "--wind": hazmat.windDirection } as CSSProperties}
        aria-hidden="true"
      >
        <span className="ops-hazmat__source" />
      </div>

      <div className="ops-hazmat__legend">
        <span>
          <span className="ops-legend-dot" style={{ background: "#dc2626" }} />
          {t("ops.hazmat.zoneHot")} · {Math.round(hazmat.radius * 0.3)} m
        </span>
        <span>
          <span className="ops-legend-dot" style={{ background: "#d97706" }} />
          {t("ops.hazmat.zoneWarm")} · {Math.round(hazmat.radius * 0.65)} m
        </span>
        <span>
          <span className="ops-legend-dot" style={{ background: "#16a34a" }} />
          {t("ops.hazmat.zoneCold")} · {hazmat.radius} m
        </span>
      </div>

      <p className="ops-muted">
        <strong>{tc(hazmat.product.fr)}</strong> · {t("ops.map.wind")}{" "}
        {hazmat.windDirection}° / {hazmat.windSpeed} km/h ·{" "}
        {t("ops.map.radius")} {hazmat.radius} m
        <br />
        {t("ops.hazmat.updated")} · {hazmat.updatedAt}
      </p>

      <form className="ops-form" onSubmit={submit}>
        <div className="ops-form__row">
          <label className="ops-field">
            <span>{t("ops.hazmat.product")}</span>
            <input value={product} onChange={(event) => setProduct(event.target.value)} />
          </label>
          <label className="ops-field">
            <span>{t("ops.hazmat.windDirection")}</span>
            <input
              type="number"
              min={0}
              max={360}
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            />
          </label>
          <label className="ops-field">
            <span>{t("ops.hazmat.windSpeed")}</span>
            <input
              type="number"
              min={0}
              max={180}
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </label>
        </div>
        <div className="ops-btn-row">
          <button type="submit" className="ops-btn ops-btn--primary">
            {t("ops.hazmat.save")}
          </button>
          <button type="button" className="ops-btn" onClick={() => toggleHazmat()}>
            {hazmat.active ? t("ops.hazmat.deactivate") : t("ops.hazmat.activate")}
          </button>
        </div>
      </form>

      {hazmat.active ? <p className="ops-error">{t("ops.hazmat.warning")}</p> : null}
    </section>
  );
}

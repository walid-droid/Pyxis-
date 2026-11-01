import { useState } from "react";
import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import "./ops.css";

export default function SectorsPanel() {
  const { t, lang } = useI18n();
  const { sectors, consolidateSector, teams } = useOrsecOps();
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.sector.title")}</h2>
        <span className="ops-card__hint">
          {t("ops.common.count", { count: sectors.length })}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.sector.lead")}</p>

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <div className="ops-grid">
        {sectors.map((sector) => {
          const engaged = teams.filter(
            (team) => team.sectorId === sector.id && team.status === "engaged",
          ).length;
          return (
            <article key={sector.id} className="ops-sector">
              <div className="ops-sector__head">
                <strong>{sector.name[lang]}</strong>
                <span
                  className={`ops-badge ops-badge--${
                    sector.status === "open"
                      ? "warn"
                      : sector.status === "consolidated"
                        ? "ok"
                        : "muted"
                  }`}
                >
                  {t(`ops.sector.${sector.status}`)}
                </span>
              </div>
              <div className="ops-sector__metrics">
                <span>
                  {t("ops.sector.commander")} <strong>{sector.commander}</strong>
                </span>
                <span>
                  {t("ops.sector.teams")} <strong>{sector.teams}</strong>
                </span>
                <span>
                  {t("ops.means.engaged")} <strong>{engaged}</strong>
                </span>
                <span>
                  {t("ops.sector.victims")} <strong>{sector.victims}</strong>
                </span>
              </div>
              <div className="ops-inline" style={{ justifyContent: "space-between" }}>
                <span className="ops-list__meta">
                  {t("ops.sector.lastRollup")} · {sector.lastRollupAt}
                </span>
                <span className="ops-badge ops-badge--muted">
                  {t(`ops.sector.${sector.level}`)}
                </span>
              </div>
              {sector.status !== "consolidated" ? (
                <button
                  type="button"
                  className="ops-btn ops-btn--small"
                  onClick={() => {
                    consolidateSector(sector.id);
                    setToast(t("ops.sector.consolidatedToast"));
                  }}
                >
                  {t("ops.sector.consolidate")}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

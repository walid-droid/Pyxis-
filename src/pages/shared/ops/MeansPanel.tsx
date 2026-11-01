import { useState } from "react";
import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import "./ops.css";

export default function MeansPanel() {
  const { t, lang, tc } = useI18n();
  const { teams, incidents, allocate, releaseTeam } = useOrsecOps();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const incidentName = (id?: string) => {
    const incident = incidents.find((item) => item.id === id);
    return incident ? incident.name[lang] : undefined;
  };

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.means.title")}</h2>
        <span className="ops-card__hint">
          {t("ops.common.count", { count: teams.length })}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.means.lead")}</p>

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}
      {error ? <p className="ops-error">{error}</p> : null}

      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>{t("ops.means.team")}</th>
              <th>{t("ops.means.kind")}</th>
              <th>{t("ops.means.sector")}</th>
              <th>{t("ops.means.status")}</th>
              <th>{t("ops.means.incident")}</th>
              <th>{t("ops.common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>
                  <strong>{team.name}</strong>
                </td>
                <td>{tc(team.kind[lang])}</td>
                <td>{team.sectorId.replace("sector-", "")}</td>
                <td>
                  <span
                    className={`ops-badge ops-badge--${
                      team.status === "available"
                        ? "ok"
                        : team.status === "engaged"
                          ? "warn"
                          : "muted"
                    }`}
                  >
                    {t(`ops.means.${team.status}`)}
                  </span>
                </td>
                <td>{incidentName(team.incidentId) ?? t("ops.means.noIncident")}</td>
                <td>
                  <div className="ops-table__actions">
                    <select
                      className="ops-btn ops-btn--small"
                      defaultValue=""
                      aria-label={t("ops.means.assign")}
                      disabled={team.status === "out"}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        const result = allocate(team.id, event.target.value);
                        if (result.ok) {
                          setError(null);
                          setToast(t("ops.means.assigned"));
                        } else {
                          setToast(null);
                          setError(
                            t("ops.means.conflictDetail", {
                              incident:
                                incidentName(result.conflictIncident) ??
                                t("ops.means.noIncident"),
                            }),
                          );
                        }
                        event.target.value = "";
                      }}
                    >
                      <option value="">{t("ops.means.assign")}</option>
                      {incidents.map((incident) => (
                        <option key={incident.id} value={incident.id}>
                          P{incident.priority} · {incident.name[lang]}
                        </option>
                      ))}
                    </select>
                    {team.status === "engaged" ? (
                      <button
                        type="button"
                        className="ops-btn ops-btn--small"
                        onClick={() => {
                          releaseTeam(team.id);
                          setError(null);
                          setToast(t("ops.means.released"));
                        }}
                      >
                        {t("ops.means.release")}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ops-muted">{t("ops.means.hint")}</p>

      <div className="ops-grid">
        {incidents.map((incident) => {
          const assigned = teams.filter(
            (team) => team.incidentId === incident.id,
          );
          return (
            <div key={incident.id} className="ops-sector">
              <div className="ops-sector__head">
                <strong>{incident.name[lang]}</strong>
                <span className="ops-badge ops-badge--info">
                  {t("ops.means.priority")} {incident.priority}
                </span>
              </div>
              <div className="ops-sector__metrics">
                <span>
                  {t("ops.means.team")} <strong>{assigned.length}</strong>
                </span>
                <span>
                  {t("ops.means.sector")}{" "}
                  <strong>{incident.sectorId.replace("sector-", "")}</strong>
                </span>
              </div>
              <div className="ops-inline">
                {assigned.length === 0 ? (
                  <span className="ops-muted">{t("ops.means.noIncident")}</span>
                ) : (
                  assigned.map((team) => (
                    <span key={team.id} className="ops-badge ops-badge--warn">
                      {team.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

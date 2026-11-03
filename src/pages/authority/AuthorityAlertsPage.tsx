import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { alertsForSession } from "../../services/authority";
import { findPlan } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { useSessionScope } from "../../services/useSessionScope";
import { formatDateTime, territoryLabel } from "../shared/v3/helpers";

export default function AuthorityAlertsPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const scope = useSessionScope();

  if (!session || !scope) return null;
  const alerts = [...alertsForSession(db, scope)].sort(
    (a, b) => Date.parse(b.debut) - Date.parse(a.debut),
  );

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.alerts.title")}</p>
          <h1 className="v3-title">{t("authority.alerts.title")}</h1>
          <p className="v3-lead">{t("authority.alerts.lead")}</p>
        </div>
      </header>

      {alerts.length === 0 ? (
        <p className="v3-empty">{t("authority.alerts.empty")}</p>
      ) : (
        <div className="v3-table-wrap">
          <table className="v3-table">
            <thead>
              <tr>
                <th>{t("authority.alerts.territory")}</th>
                <th>{t("authority.alerts.reason")}</th>
                <th>{t("authority.alerts.source")}</th>
                <th>{t("authority.alerts.started")}</th>
                <th>{t("authority.alerts.lifted")}</th>
                <th>{t("authority.alerts.active")}</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const source = findPlan(db, alert.planSourceId);
                return (
                  <tr key={alert.id}>
                    <td className="v3-table__main">
                      {territoryLabel(db, alert.territoireId, lang)}
                    </td>
                    <td>{t(`authority.alerts.reason.${alert.raison}`)}</td>
                    <td>
                      {source
                        ? `${t(`authority.plans.level.${source.niveau}`)} · ${territoryLabel(
                            db,
                            source.territoireId,
                            lang,
                          )}`
                        : alert.planSourceId}
                    </td>
                    <td>{formatDateTime(alert.debut, lang)}</td>
                    <td>{alert.levee ? formatDateTime(alert.levee, lang) : "—"}</td>
                    <td>
                      <span
                        className={`v3-badge ${alert.levee ? "v3-badge--green" : "v3-badge--red"}`}
                      >
                        {alert.levee
                          ? t("authority.alerts.liftedState")
                          : t("authority.alerts.active")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { participationsForSession } from "../../services/authority";
import { moduleLabel } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { useSessionScope } from "../../services/useSessionScope";
import { formatDateTime, territoryLabel, userName } from "../shared/v3/helpers";

export default function AuthorityStaffPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const scope = useSessionScope();

  if (!session || !scope) return null;
  const rows = participationsForSession(db, scope);
  const called = rows.length;
  const confirmed = rows.filter((row) => row.participation.etat === "confirme").length;
  const freed = rows.filter((row) => row.participation.etat === "libere").length;
  const rate = called === 0 ? 0 : Math.round((confirmed / called) * 100);

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.staff.title")}</p>
          <h1 className="v3-title">{t("authority.staff.title")}</h1>
          <p className="v3-lead">{t("authority.staff.lead")}</p>
        </div>
        <div className="v3-actions">
          <span className="v3-badge v3-badge--brand">
            {t("authority.staff.confirmRate")} : {rate} %
          </span>
        </div>
      </header>

      <section className="v3-stats">
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.staff.called")}</span>
          <span className="v3-stat__value">{called}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.staff.confirmed")}</span>
          <span className="v3-stat__value">{confirmed}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.staff.freed")}</span>
          <span className="v3-stat__value">{freed}</span>
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="v3-empty">{t("authority.staff.empty")}</p>
      ) : (
        <div className="v3-table-wrap">
          <table className="v3-table">
            <thead>
              <tr>
                <th>{t("authority.staff.agent")}</th>
                <th>{t("authority.staff.module")}</th>
                <th>{t("authority.staff.plan")}</th>
                <th>{t("authority.staff.state")}</th>
                <th>{t("authority.staff.calledAt")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ participation, plan }) => (
                <tr key={participation.id}>
                  <td className="v3-table__main">
                    {userName(db, participation.agentId, lang)}
                  </td>
                  <td>{moduleLabel(db, participation.moduleId, lang)}</td>
                  <td>
                    {t(`authority.plans.level.${plan.niveau}`)} ·{" "}
                    {territoryLabel(db, plan.territoireId, lang)}
                  </td>
                  <td>
                    <span
                      className={`v3-badge ${
                        participation.etat === "confirme"
                          ? "v3-badge--green"
                          : participation.etat === "libere"
                            ? ""
                            : "v3-badge--amber"
                      }`}
                    >
                      {t(`authority.staff.state.${participation.etat}`)}
                    </span>
                  </td>
                  <td>{formatDateTime(participation.appeleLe, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

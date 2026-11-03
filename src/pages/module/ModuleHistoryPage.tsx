import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { interventionsForModule, moduleUsers } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { formatDateTime, userName } from "../shared/v3/helpers";

export default function ModuleHistoryPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();

  if (!session || !session.moduleId) return null;
  const moduleId = session.moduleId;
  const memberIds = new Set(moduleUsers(db, moduleId).map((user) => user.id));
  const closed = interventionsForModule(db, moduleId)
    .filter((intervention) => intervention.etat === "cloturee")
    .sort((a, b) => Date.parse(b.fin ?? b.debut) - Date.parse(a.fin ?? a.debut));
  const entries = db.journal
    .filter(
      (entry) =>
        memberIds.has(entry.acteurId) ||
        entry.objet.startsWith("int-") ||
        entry.objet.startsWith("sig-"),
    )
    .filter((entry) => memberIds.has(entry.acteurId))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.history.title")}</p>
          <h1 className="v3-title">{t("module.history.title")}</h1>
          <p className="v3-lead">{t("module.history.lead")}</p>
        </div>
      </header>

      <section className="v3-grid v3-grid--2">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("module.interventions.title")}</h2>
            <span className="v3-badge">{closed.length}</span>
          </header>
          {closed.length === 0 ? (
            <p className="v3-empty">{t("module.interventions.empty")}</p>
          ) : (
            <ul className="v3-list">
              {closed.map((intervention) => (
                <li key={intervention.id} className="v3-list__item">
                  <div className="v3-list__main">
                    <p className="v3-list__title">{intervention.signalementId}</p>
                    <p className="v3-list__meta">
                      {t("module.interventions.startedAt")} :{" "}
                      {formatDateTime(intervention.debut, lang)} ·{" "}
                      {t("module.interventions.endedAt")} :{" "}
                      {formatDateTime(intervention.fin, lang)}
                    </p>
                  </div>
                  <span className="v3-badge v3-badge--green">
                    {t("module.interventions.interventionState.cloturee")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("module.history.title")}</h2>
            <span className="v3-badge">{entries.length}</span>
          </header>
          {entries.length === 0 ? (
            <p className="v3-empty">{t("module.history.empty")}</p>
          ) : (
            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th>{t("module.history.date")}</th>
                    <th>{t("module.history.action")}</th>
                    <th>{t("module.history.author")}</th>
                    <th>{t("module.history.details")}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 40).map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDateTime(entry.date, lang)}</td>
                      <td>
                        <span className="v3-table__main">{entry.action}</span>
                        <span className="v3-table__sub">{entry.objet}</span>
                      </td>
                      <td>{userName(db, entry.acteurId, lang)}</td>
                      <td>{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

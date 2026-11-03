import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { journalEntries } from "../../services/journal";
import { useDb } from "../../services/useDb";
import { formatDateTime, userName } from "../shared/v3/helpers";

export default function AdminJournalPage() {
  const { lang, t } = useI18n();
  const db = useDb();
  const [action, setAction] = useState("all");
  const entries = useMemo(() => journalEntries(db), [db]);
  const actions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.action))).sort(),
    [entries],
  );
  const filtered =
    action === "all" ? entries : entries.filter((entry) => entry.action === action);

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.journal.title")}</p>
          <h1 className="v3-title">{t("admin.journal.title")}</h1>
          <p className="v3-lead">{t("admin.journal.lead")}</p>
        </div>
        <div className="v3-field" style={{ minWidth: 240 }}>
          <label htmlFor="journal-action">{t("admin.journal.filter")}</label>
          <select
            id="journal-action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          >
            <option value="all">{t("admin.journal.allActions")}</option>
            {actions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="v3-card">
        <header className="v3-card__head">
          <h2 className="v3-card__title">{t("admin.journal.title")}</h2>
          <span className="v3-badge">{filtered.length}</span>
        </header>
        {filtered.length === 0 ? (
          <p className="v3-empty">{t("admin.journal.empty")}</p>
        ) : (
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead>
                <tr>
                  <th>{t("admin.journal.date")}</th>
                  <th>{t("admin.journal.actor")}</th>
                  <th>{t("admin.journal.action")}</th>
                  <th>{t("admin.journal.object")}</th>
                  <th>{t("admin.journal.details")}</th>
                  <th>{t("admin.journal.assignment")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.date, lang)}</td>
                    <td>
                      {entry.acteurId === "systeme-horloge"
                        ? t("admin.journal.system")
                        : userName(db, entry.acteurId, lang)}
                    </td>
                    <td className="v3-table__main">{entry.action}</td>
                    <td>{entry.objet}</td>
                    <td>{entry.details}</td>
                    <td>{entry.assignmentId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import {
  ADMIN_ACCOUNTS_PATH,
  ADMIN_JOURNAL_PATH,
  ADMIN_MATRIX_PATH,
  ADMIN_MODULES_PATH,
  ADMIN_TYPES_PATH,
} from "../../config";
import { countTodo } from "../../data/moduleMatrix";
import { useI18n } from "../../i18n";
import { journalEntries } from "../../services/journal";
import { resetDb } from "../../services/store";
import { useDb } from "../../services/useDb";
import { formatDateTime, userName } from "../shared/v3/helpers";

export default function AdminDashboard() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [notice, setNotice] = useState<string | null>(null);
  const entries = journalEntries(db).slice(0, 8);
  const todoCount =
    countTodo(db.reference.matrix.URGENCE) + countTodo(db.reference.matrix.REHABILITATION);
  const activeAccounts = db.users.filter((user) => user.actif).length;

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.dashboard.title")}</p>
          <h1 className="v3-title">{t("admin.dashboard.title")}</h1>
          <p className="v3-lead">{t("admin.dashboard.lead")}</p>
        </div>
        <div className="v3-actions">
          <button
            type="button"
            className="v3-btn v3-btn--danger"
            onClick={() => {
              if (!window.confirm(t("admin.dashboard.resetConfirm"))) return;
              resetDb();
              setNotice(t("admin.dashboard.resetDone"));
            }}
          >
            {t("admin.dashboard.reset")}
          </button>
        </div>
      </header>

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      {todoCount > 0 ? (
        <div className="v3-banner" role="status">
          <span>{t("admin.dashboard.todoWarning", { count: todoCount })}</span>
          <Link className="v3-btn v3-btn--small" to={ADMIN_MATRIX_PATH}>
            {t("admin.nav.matrix")}
          </Link>
        </div>
      ) : null}

      <section className="v3-stats">
        <Link className="v3-stat" to={ADMIN_ACCOUNTS_PATH}>
          <span className="v3-stat__label">{t("admin.dashboard.statAccounts")}</span>
          <span className="v3-stat__value">{activeAccounts}</span>
        </Link>
        <Link className="v3-stat" to={ADMIN_MODULES_PATH}>
          <span className="v3-stat__label">{t("admin.dashboard.statModules")}</span>
          <span className="v3-stat__value">{db.reference.modules.length}</span>
        </Link>
        <Link className="v3-stat" to={ADMIN_TYPES_PATH}>
          <span className="v3-stat__label">{t("admin.dashboard.statTypes")}</span>
          <span className="v3-stat__value">{db.reference.types.length}</span>
        </Link>
        <Link className="v3-stat" to={ADMIN_JOURNAL_PATH}>
          <span className="v3-stat__label">{t("admin.dashboard.statJournal")}</span>
          <span className="v3-stat__value">{db.journal.length}</span>
        </Link>
      </section>

      <section className="v3-card">
        <header className="v3-card__head">
          <h2 className="v3-card__title">{t("admin.dashboard.recentJournal")}</h2>
          <Link className="v3-btn v3-btn--small" to={ADMIN_JOURNAL_PATH}>
            {t("admin.nav.journal")}
          </Link>
        </header>
        {entries.length === 0 ? (
          <p className="v3-empty">{t("admin.dashboard.noJournal")}</p>
        ) : (
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead>
                <tr>
                  <th>{t("admin.journal.date")}</th>
                  <th>{t("admin.journal.actor")}</th>
                  <th>{t("admin.journal.action")}</th>
                  <th>{t("admin.journal.details")}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.date, lang)}</td>
                    <td>
                      {entry.acteurId === "systeme-horloge"
                        ? t("admin.journal.system")
                        : userName(db, entry.acteurId, lang)}
                    </td>
                    <td>
                      <span className="v3-table__main">{entry.action}</span>
                      <span className="v3-table__sub">{entry.objet}</span>
                    </td>
                    <td>{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {session ? (
        <p className="v3-note">
          {t("admin.topbarRole")} · {session.email}
        </p>
      ) : null}
    </main>
  );
}

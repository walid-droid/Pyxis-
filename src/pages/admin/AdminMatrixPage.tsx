import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { countTodo, type MatrixCell, type MatrixPhase } from "../../data/moduleMatrix";
import { TYPE_CODES } from "../../data/types";
import { useI18n } from "../../i18n";
import { setMatrixCell } from "../../services/reference";
import { useDb } from "../../services/useDb";

const PHASES: MatrixPhase[] = ["URGENCE", "REHABILITATION"];

function nextCell(value: MatrixCell): MatrixCell {
  if (value === "TODO") return true;
  if (value === true) return false;
  return "TODO";
}

export default function AdminMatrixPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [phase, setPhase] = useState<MatrixPhase>("URGENCE");
  const [notice, setNotice] = useState<string | null>(null);
  const matrix = db.reference.matrix[phase];
  const todo = countTodo(matrix);
  const editable = can("GERER_REFERENTIELS");

  function label(value: MatrixCell): string {
    if (value === "TODO") return t("admin.matrix.todo");
    return value ? t("admin.matrix.yes") : t("admin.matrix.no");
  }

  function toggle(moduleNo: (typeof db.reference.modules)[number]["no"], type: string) {
    if (!session || !editable) return;
    setMatrixCell(
      phase,
      moduleNo,
      type as (typeof TYPE_CODES)[number],
      nextCell(matrix[moduleNo][type as (typeof TYPE_CODES)[number]]),
      session.userId,
    );
    setNotice(t("admin.matrix.updated"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.matrix.title")}</p>
          <h1 className="v3-title">{t("admin.matrix.title")}</h1>
          <p className="v3-lead">{t("admin.matrix.lead")}</p>
        </div>
        <div className="v3-actions">
          <div className="v3-tabs" role="tablist" aria-label={t("admin.matrix.title")}>
            {PHASES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={phase === item}
                className={`v3-tab${phase === item ? " is-active" : ""}`}
                onClick={() => setPhase(item)}
              >
                {item === "URGENCE" ? t("admin.matrix.urgence") : t("admin.matrix.rehabilitation")}
              </button>
            ))}
          </div>
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

      <p className={`v3-note${todo > 0 ? " v3-note--warn" : ""}`}>
        {t("admin.matrix.todoCount", { count: todo })} · {t("admin.matrix.legend")}
      </p>

      <div className="v3-table-wrap">
        <table className="v3-table">
          <thead>
            <tr>
              <th>{t("admin.matrix.module")}</th>
              {TYPE_CODES.map((code) => (
                <th key={code}>{code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {db.reference.modules.map((module) => (
              <tr key={module.id}>
                <td className="v3-table__main">
                  {module.no} · {module.nom[lang]}
                </td>
                {TYPE_CODES.map((code) => {
                  const value = matrix[module.no][code];
                  return (
                    <td key={code}>
                      <button
                        type="button"
                        className={`v3-matrix-cell v3-matrix-cell--${
                          value === "TODO" ? "todo" : value ? "yes" : "no"
                        }`}
                        disabled={!editable}
                        aria-label={`${module.nom[lang]} · ${code} · ${label(value)}`}
                        onClick={() => toggle(module.no, code)}
                      >
                        {value === "TODO" ? "…" : value ? "✓" : "✕"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

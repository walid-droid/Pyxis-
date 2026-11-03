import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { updateTask } from "../../services/interventions";
import {
  assignmentsForAgent,
  findIntervention,
  findSignalement,
  findType,
} from "../../services/selectors";
import { useDb } from "../../services/useDb";
import type { TaskState } from "../../services/model";
import { formatDateTime, territoryLabel } from "../shared/v3/helpers";

const STATES: TaskState[] = ["a_faire", "en_cours", "terminee"];
const STATE_KEY: Record<TaskState, string> = {
  a_faire: "module.interventions.task.a_faire",
  en_cours: "module.interventions.task.en_cours",
  terminee: "module.interventions.task.terminee",
};

export default function ModuleTasksPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [drafts, setDrafts] = useState<Record<string, { etat: TaskState; report: string }>>({});
  const [notice, setNotice] = useState<string | null>(null);

  if (!session) return null;
  const assignments = assignmentsForAgent(db, session.userId);

  function draftOf(id: string, fallbackState: TaskState, fallbackReport?: string) {
    return drafts[id] ?? { etat: fallbackState, report: fallbackReport ?? "" };
  }

  function setDraft(
    id: string,
    fallbackState: TaskState,
    fallbackReport: string | undefined,
    patch: Partial<{ etat: TaskState; report: string }>,
  ) {
    setDrafts((previous) => {
      const base =
        previous[id] ?? { etat: fallbackState, report: fallbackReport ?? "" };
      return { ...previous, [id]: { ...base, ...patch } };
    });
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.tasks.title")}</p>
          <h1 className="v3-title">{t("module.tasks.title")}</h1>
          <p className="v3-lead">{t("module.tasks.lead")}</p>
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

      {assignments.length === 0 ? (
        <p className="v3-empty">{t("module.tasks.empty")}</p>
      ) : (
        <ul className="v3-list">
          {assignments.map((assignment) => {
            const intervention = findIntervention(db, assignment.interventionId);
            const signalement = intervention
              ? findSignalement(db, intervention.signalementId)
              : undefined;
            const type = signalement ? findType(db, signalement.typeId) : undefined;
            const draft = draftOf(assignment.id, assignment.etatTache, assignment.compteRendu);
            return (
              <li key={assignment.id} className="v3-list__item">
                <div className="v3-list__main">
                  <p className="v3-list__title">
                    {type?.libelle[lang] ?? t("module.tasks.intervention")}{" "}
                    <span className="v3-badge v3-badge--amber">{t(STATE_KEY[assignment.etatTache])}</span>
                  </p>
                  <p className="v3-list__meta">
                    {t("module.tasks.intervention")} : {assignment.interventionId}
                    {signalement
                      ? ` · ${territoryLabel(db, signalement.communeId, lang)}`
                      : ""}
                  </p>
                  <p className="v3-list__meta">{formatDateTime(assignment.affecteLe, lang)}</p>
                  {assignment.compteRendu ? (
                    <p className="v3-note">{assignment.compteRendu}</p>
                  ) : null}

                  <div className="v3-form v3-form--2" style={{ marginTop: 12 }}>
                    <div className="v3-field">
                      <label htmlFor={`task-state-${assignment.id}`}>
                        {t("module.tasks.state")}
                      </label>
                      <select
                        id={`task-state-${assignment.id}`}
                        value={draft.etat}
                        onChange={(event) =>
                          setDraft(assignment.id, assignment.etatTache, assignment.compteRendu, { etat: event.target.value as TaskState })
                        }
                      >
                        {STATES.map((state) => (
                          <option key={state} value={state}>
                            {t(STATE_KEY[state])}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="v3-field" style={{ gridColumn: "1 / -1" }}>
                      <label htmlFor={`task-report-${assignment.id}`}>
                        {t("module.tasks.report")}
                      </label>
                      <textarea
                        id={`task-report-${assignment.id}`}
                        value={draft.report}
                        placeholder={t("module.tasks.reportPlaceholder")}
                        onChange={(event) =>
                          setDraft(assignment.id, assignment.etatTache, assignment.compteRendu, { report: event.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="v3-list__side">
                  <button
                    type="button"
                    className="v3-btn v3-btn--small v3-btn--primary"
                    onClick={() => {
                      updateTask(
                        assignment.id,
                        session.userId,
                        draft.etat,
                        draft.report.trim() || undefined,
                      );
                      setNotice(t("module.tasks.updated"));
                    }}
                  >
                    {t("module.tasks.save")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

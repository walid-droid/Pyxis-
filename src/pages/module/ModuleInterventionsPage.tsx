import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import {
  closeIntervention,
  declareOutOfControl,
  requestSupport,
  assignAgent,
} from "../../services/interventions";
import {
  activeInterventionsForModule,
  agentsOfModule,
  assignmentsForIntervention,
  findSignalement,
  findType,
  interventionForSignalementModule,
  interventionsForModule,
  signalementsForModule,
} from "../../services/selectors";
import { launchIntervention } from "../../services/interventions";
import { useDb } from "../../services/useDb";
import type { Intervention, TaskState } from "../../services/model";
import {
  formatDateTime,
  gravityTone,
  moduleLabel,
  territoryLabel,
  userName,
} from "../shared/v3/helpers";

const TASK_KEY: Record<TaskState, string> = {
  a_faire: "module.interventions.task.a_faire",
  en_cours: "module.interventions.task.en_cours",
  terminee: "module.interventions.task.terminee",
};

export default function ModuleInterventionsPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [outTarget, setOutTarget] = useState<Intervention | null>(null);
  const [motif, setMotif] = useState("");
  const [assignTarget, setAssignTarget] = useState<Intervention | null>(null);
  const [agentId, setAgentId] = useState("");
  const [supportTarget, setSupportTarget] = useState<Intervention | null>(null);
  const [supportModule, setSupportModule] = useState("");
  const [startSignalement, setStartSignalement] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!session || !session.moduleId) return null;
  const moduleId = session.moduleId;
  const canLaunch = can("LANCER_INTERVENTION", { moduleId });
  const canAssign = can("AFFECTER_AGENTS", { moduleId });
  const canClose = can("CLOTURER_INTERVENTION", { moduleId });
  const canOut = can("DECLARER_HORS_CONTROLE", { moduleId });

  const interventions = [...interventionsForModule(db, moduleId)].sort(
    (a, b) => Date.parse(b.debut) - Date.parse(a.debut),
  );
  const active = activeInterventionsForModule(db, moduleId);
  const availableAgents = agentsOfModule(db, moduleId).filter(
    (agent) => agent.disponible && agent.actif,
  );
  const confirmedWithoutIntervention = signalementsForModule(db, moduleId).filter(
    (signalement) =>
      signalement.etat === "confirme" &&
      !interventionForSignalementModule(db, signalement.id, moduleId),
  );

  function handleStart() {
    if (!startSignalement) return;
    launchIntervention(startSignalement, session!.userId, moduleId);
    setStartSignalement("");
    setNotice(t("module.interventions.start"));
  }

  function handleAssign() {
    if (!assignTarget || !agentId) return;
    assignAgent(assignTarget.id, agentId, session!.userId);
    setAssignTarget(null);
    setAgentId("");
    setNotice(t("module.interventions.assignedDone"));
  }

  function handleOut() {
    if (!outTarget || !motif.trim()) return;
    declareOutOfControl(outTarget.id, session!.userId, motif.trim());
    setOutTarget(null);
    setMotif("");
    setNotice(t("module.interventions.outDone"));
  }

  function handleSupport() {
    if (!supportTarget || !supportModule) return;
    requestSupport(supportTarget.id, supportModule, session!.userId);
    setSupportTarget(null);
    setSupportModule("");
    setNotice(t("module.interventions.supportDone"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.interventions.title")}</p>
          <h1 className="v3-title">{t("module.interventions.title")}</h1>
          <p className="v3-lead">{t("module.interventions.lead")}</p>
        </div>
        <div className="v3-actions">
          <span className="v3-badge v3-badge--brand">
            {t("module.dashboard.statInterventions")} : {active.length}
          </span>
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

      {canLaunch && confirmedWithoutIntervention.length > 0 ? (
        <section className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("module.interventions.selectSignalement")}</h2>
          </header>
          <div className="v3-inline">
            <div className="v3-field" style={{ flex: "1 1 320px" }}>
              <label htmlFor="start-signalement">{t("module.interventions.selectPlaceholder")}</label>
              <select
                id="start-signalement"
                value={startSignalement}
                onChange={(event) => setStartSignalement(event.target.value)}
              >
                <option value="">{t("module.interventions.selectPlaceholder")}</option>
                {confirmedWithoutIntervention.map((signalement) => (
                  <option key={signalement.id} value={signalement.id}>
                    {findType(db, signalement.typeId)?.libelle[lang] ?? signalement.typeId} ·{" "}
                    {territoryLabel(db, signalement.communeId, lang)} · {signalement.id}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="v3-btn v3-btn--primary"
              disabled={!startSignalement}
              onClick={handleStart}
            >
              {t("module.interventions.start")}
            </button>
          </div>
        </section>
      ) : null}

      {interventions.length === 0 ? (
        <p className="v3-empty">{t("module.interventions.empty")}</p>
      ) : (
        <ul className="v3-list">
          {interventions.map((intervention) => {
            const signalement = findSignalement(db, intervention.signalementId);
            const type = signalement ? findType(db, signalement.typeId) : undefined;
            const assignments = assignmentsForIntervention(db, intervention.id);
            const closed = intervention.etat === "cloturee";
            return (
              <li key={intervention.id} className="v3-list__item">
                <div className="v3-list__main">
                  <p className="v3-list__title">
                    {type?.code ?? signalement?.typeId ?? intervention.signalementId} ·{" "}
                    {type?.libelle[lang] ?? intervention.signalementId}
                    <span
                      className={`v3-badge ${
                        intervention.etat === "hors_de_controle"
                          ? "v3-badge--red"
                          : closed
                            ? "v3-badge--green"
                            : "v3-badge--amber"
                      }`}
                      style={{ marginInlineStart: 8 }}
                    >
                      {t(`module.interventions.interventionState.${intervention.etat}`)}
                    </span>
                  </p>
                  <p className="v3-list__meta">
                    {t("module.interventions.report")} : {intervention.signalementId} ·{" "}
                    {signalement ? territoryLabel(db, signalement.communeId, lang) : "—"}
                  </p>
                  <p className="v3-list__meta">
                    {t("module.interventions.responsible")} :{" "}
                    {userName(db, intervention.responsableId, lang)} ·{" "}
                    {t("module.interventions.startedAt")} :{" "}
                    {formatDateTime(intervention.debut, lang)}
                    {intervention.fin
                      ? ` · ${t("module.interventions.endedAt")} : ${formatDateTime(intervention.fin, lang)}`
                      : ""}
                  </p>
                  {signalement ? (
                    <p className="v3-list__meta">
                      {t("module.interventions.status")} :{" "}
                      <span className={`v3-badge v3-badge--${gravityTone(signalement.gravite)}`}>
                        {t(`module.state.${signalement.etat}`)}
                      </span>
                    </p>
                  ) : null}

                  <p className="v3-list__meta" style={{ marginTop: 10 }}>
                    <strong>{t("module.interventions.assigned")}</strong>
                  </p>
                  {assignments.length === 0 ? (
                    <p className="v3-list__meta">{t("module.interventions.noAssigned")}</p>
                  ) : (
                    <ul className="v3-list">
                      {assignments.map((assignment) => (
                        <li key={assignment.id} className="v3-list__item">
                          <div className="v3-list__main">
                            <p className="v3-list__title">
                              {userName(db, assignment.agentId, lang)}
                            </p>
                            <p className="v3-list__meta">
                              {t("module.interventions.task")} : {t(TASK_KEY[assignment.etatTache])}
                              {assignment.compteRendu ? ` · ${assignment.compteRendu}` : ""}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="v3-list__side">
                  {!closed && canAssign ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small"
                      onClick={() => {
                        setAgentId(availableAgents[0]?.id ?? "");
                        setAssignTarget(intervention);
                      }}
                    >
                      {t("module.interventions.assign")}
                    </button>
                  ) : null}
                  {!closed && canAssign ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small"
                      onClick={() => {
                        setSupportModule("");
                        setSupportTarget(intervention);
                      }}
                    >
                      {t("module.interventions.requestSupport")}
                    </button>
                  ) : null}
                  {!closed && canOut ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small v3-btn--danger"
                      onClick={() => {
                        setMotif("");
                        setOutTarget(intervention);
                      }}
                    >
                      {t("module.interventions.outOfControl")}
                    </button>
                  ) : null}
                  {!closed && canClose ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small v3-btn--primary"
                      onClick={() => {
                        closeIntervention(intervention.id, session.userId);
                        setNotice(t("module.interventions.closed"));
                      }}
                    >
                      {t("module.interventions.close")}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {assignTarget ? (
        <Modal title={t("module.interventions.assign")} onClose={() => setAssignTarget(null)}>
          <div className="v3-form">
            <div className="v3-field">
              <label htmlFor="agent-select">{t("module.interventions.chooseAgent")}</label>
              {availableAgents.length === 0 ? (
                <p className="v3-note">{t("module.interventions.noAvailableAgent")}</p>
              ) : (
                <select
                  id="agent-select"
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
                >
                  {availableAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {userName(db, agent.id, lang)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setAssignTarget(null)}>
                {t("module.interventions.cancel")}
              </button>
              <button
                type="button"
                className="v3-btn v3-btn--primary"
                disabled={!agentId}
                onClick={handleAssign}
              >
                {t("module.interventions.assignAction")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {supportTarget ? (
        <Modal
          title={t("module.interventions.requestSupport")}
          onClose={() => setSupportTarget(null)}
        >
          <div className="v3-form">
            <div className="v3-field">
              <label htmlFor="support-module">{t("module.interventions.supportModule")}</label>
              <select
                id="support-module"
                value={supportModule}
                onChange={(event) => setSupportModule(event.target.value)}
              >
                <option value="">—</option>
                {db.reference.modules
                  .filter((module) => module.id !== moduleId)
                  .map((module) => (
                    <option key={module.id} value={module.id}>
                      {moduleLabel(db, module.id, lang)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setSupportTarget(null)}>
                {t("module.interventions.cancel")}
              </button>
              <button
                type="button"
                className="v3-btn v3-btn--primary"
                disabled={!supportModule}
                onClick={handleSupport}
              >
                {t("module.interventions.supportSend")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {outTarget ? (
        <Modal
          title={t("module.interventions.motifTitle")}
          onClose={() => setOutTarget(null)}
        >
          <div className="v3-form">
            <p className="v3-note v3-note--warn">{t("module.interventions.motifLead")}</p>
            <div className="v3-field">
              <label htmlFor="out-motif">{t("module.interventions.motif")}</label>
              <textarea
                id="out-motif"
                value={motif}
                placeholder={t("module.interventions.motifPlaceholder")}
                onChange={(event) => setMotif(event.target.value)}
              />
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setOutTarget(null)}>
                {t("module.interventions.cancel")}
              </button>
              <button
                type="button"
                className="v3-btn v3-btn--danger"
                disabled={!motif.trim()}
                onClick={handleOut}
              >
                {t("module.interventions.confirmOut")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

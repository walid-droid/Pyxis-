import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { escalationProposals, requestSuperiorPlan, triggerPlan } from "../../services/plans";
import type { EscalationProposal } from "../../services/plans";
import { useDb } from "../../services/useDb";
import { useSessionScope } from "../../services/useSessionScope";
import { territoryLabel } from "../shared/v3/helpers";

export default function AuthorityEscalationPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const scope = useSessionScope();
  const [target, setTarget] = useState<EscalationProposal | null>(null);
  const [motif, setMotif] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!session || !scope) return null;
  const proposals = escalationProposals(db, scope);

  function handleTrigger(proposal: EscalationProposal) {
    triggerPlan({
      level: proposal.targetLevel,
      territoryId: proposal.targetTerritoryId,
      actorId: session!.userId,
    });
    setNotice(t("authority.escalation.triggered"));
  }

  function handleRequest() {
    if (!target?.sourcePlanId) return;
    requestSuperiorPlan(target.sourcePlanId, session!.userId, session!.role, motif.trim());
    setTarget(null);
    setMotif("");
    setNotice(t("authority.escalation.sent"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.escalation.title")}</p>
          <h1 className="v3-title">{t("authority.escalation.title")}</h1>
          <p className="v3-lead">{t("authority.escalation.lead")}</p>
        </div>
      </header>

      <p className="v3-note">{t("authority.escalation.nationalRule")}</p>

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      {proposals.length === 0 ? (
        <p className="v3-empty">{t("authority.escalation.empty")}</p>
      ) : (
        <ul className="v3-list">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="v3-list__item">
              <div className="v3-list__main">
                <p className="v3-list__title">
                  {t(`authority.plans.level.${proposal.targetLevel}`)} ·{" "}
                  {territoryLabel(db, proposal.targetTerritoryId, lang)}
                </p>
                <p className="v3-list__meta">
                  {t("authority.escalation.reason")} : {proposal.reason[lang]}
                </p>
                <p className="v3-list__meta">
                  {t("authority.escalation.target")} :{" "}
                  {t(`authority.plans.level.${proposal.targetLevel}`)}
                </p>
              </div>
              <div className="v3-list__side">
                {proposal.action === "trigger" && can("DECLENCHER_PLAN") ? (
                  <button
                    type="button"
                    className="v3-btn v3-btn--small v3-btn--primary"
                    onClick={() => handleTrigger(proposal)}
                  >
                    {t("authority.escalation.trigger")}
                  </button>
                ) : null}
                {proposal.action === "request" && can("DEMANDER_PLAN_SUPERIEUR") ? (
                  <button
                    type="button"
                    className="v3-btn v3-btn--small"
                    onClick={() => {
                      setMotif(proposal.reason.fr);
                      setTarget(proposal);
                    }}
                  >
                    {t("authority.escalation.request")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {target ? (
        <Modal
          title={t("authority.escalation.requestTitle")}
          onClose={() => setTarget(null)}
        >
          <div className="v3-form">
            <p className="v3-note">{t("authority.escalation.requestLead")}</p>
            <div className="v3-field">
              <label htmlFor="escalation-motif">{t("authority.escalation.motif")}</label>
              <textarea
                id="escalation-motif"
                value={motif}
                placeholder={t("authority.escalation.motifPlaceholder")}
                onChange={(event) => setMotif(event.target.value)}
              />
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setTarget(null)}>
                {t("authority.escalation.cancel")}
              </button>
              <button
                type="button"
                className="v3-btn v3-btn--primary"
                disabled={!motif.trim()}
                onClick={handleRequest}
              >
                {t("authority.escalation.send")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

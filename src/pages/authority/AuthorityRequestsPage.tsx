import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { canTreatDemande, demandesForSession } from "../../services/authority";
import { ESCALATION_REMINDER_MINUTES, minutesSince } from "../../services/clock";
import { handleTriggerRequest } from "../../services/plans";
import { useDb } from "../../services/useDb";
import { useSessionScope } from "../../services/useSessionScope";
import { formatDateTime, territoryLabel, userName } from "../shared/v3/helpers";

export default function AuthorityRequestsPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const scope = useSessionScope();
  const [refuseId, setRefuseId] = useState<string | null>(null);
  const [motif, setMotif] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!session || !scope) return null;
  const demandes = demandesForSession(db, scope);
  const refuseTarget = demandes.find((demande) => demande.id === refuseId);
  const canHandle = can("TRAITER_DEMANDE_DECLENCHEMENT");

  function trigger(demandeId: string) {
    handleTriggerRequest(demandeId, session!.userId, true);
    setNotice(t("authority.requests.triggeredDone"));
  }

  function refuse() {
    if (!refuseTarget) return;
    handleTriggerRequest(refuseTarget.id, session!.userId, false, motif.trim() || undefined);
    setRefuseId(null);
    setMotif("");
    setNotice(t("authority.requests.refusedDone"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.requests.title")}</p>
          <h1 className="v3-title">{t("authority.requests.title")}</h1>
          <p className="v3-lead">{t("authority.requests.lead")}</p>
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

      {demandes.length === 0 ? (
        <p className="v3-empty">{t("authority.requests.empty")}</p>
      ) : (
        <ul className="v3-list">
          {demandes.map((demande) => {
            const treatable = canHandle && canTreatDemande(scope, demande);
            const pending = demande.etat === "en_attente";
            const last = demande.relances.length
              ? demande.relances[demande.relances.length - 1]
              : demande.creeLe;
            const remaining = Math.max(0, ESCALATION_REMINDER_MINUTES - minutesSince(last));
            return (
              <li key={demande.id} className="v3-list__item">
                <div className="v3-list__main">
                  <p className="v3-list__title">
                    {t(`authority.requests.origin.${demande.origine}`)} ·{" "}
                    {territoryLabel(db, demande.territoireId, lang)}
                    <span
                      className={`v3-badge ${
                        demande.etat === "en_attente"
                          ? "v3-badge--amber"
                          : demande.etat === "traitee"
                            ? "v3-badge--green"
                            : "v3-badge--red"
                      }`}
                      style={{ marginInlineStart: 8 }}
                    >
                      {t(`authority.requests.state.${demande.etat}`)}
                    </span>
                  </p>
                  <p className="v3-list__meta">
                    {t("authority.requests.author")} :{" "}
                    {userName(db, demande.auteurId, lang)} ·{" "}
                    {t("authority.requests.createdAt")} :{" "}
                    {formatDateTime(demande.creeLe, lang)}
                  </p>
                  <p className="v3-list__meta">
                    {t("authority.requests.motif")} : {demande.motif}
                  </p>
                  {demande.interventionId ? (
                    <p className="v3-list__meta">
                      {t("authority.requests.intervention")} : {demande.interventionId}
                    </p>
                  ) : null}
                  <p className="v3-list__meta">
                    {t("authority.requests.relances")} :{" "}
                    {demande.relances.length === 0
                      ? t("authority.requests.noRelance")
                      : demande.relances.map((relance) => formatDateTime(relance, lang)).join(" · ")}
                  </p>
                  {pending ? (
                    <p className="v3-note">
                      {t("authority.requests.clock")} ·{" "}
                      {t("authority.requests.nextReminder", { minutes: remaining })}
                    </p>
                  ) : null}
                  {demande.reponse ? (
                    <p className="v3-list__meta">
                      {t("authority.requests.reply")} : {demande.reponse}
                    </p>
                  ) : null}
                  {!treatable && pending ? (
                    <p className="v3-note">{t("authority.requests.readOnly")}</p>
                  ) : null}
                </div>

                <div className="v3-list__side">
                  {pending && treatable ? (
                    <>
                      <button
                        type="button"
                        className="v3-btn v3-btn--small v3-btn--primary"
                        onClick={() => trigger(demande.id)}
                      >
                        {t("authority.requests.trigger")}
                      </button>
                      <button
                        type="button"
                        className="v3-btn v3-btn--small v3-btn--danger"
                        onClick={() => {
                          setMotif("");
                          setRefuseId(demande.id);
                        }}
                      >
                        {t("authority.requests.refuse")}
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {refuseTarget ? (
        <Modal
          title={t("authority.requests.refusalTitle")}
          onClose={() => setRefuseId(null)}
        >
          <div className="v3-form">
            <div className="v3-field">
              <label htmlFor="refuse-motif">{t("authority.requests.refusal")}</label>
              <textarea
                id="refuse-motif"
                value={motif}
                placeholder={t("authority.requests.refusalPlaceholder")}
                onChange={(event) => setMotif(event.target.value)}
              />
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setRefuseId(null)}>
                {t("authority.requests.cancel")}
              </button>
              <button type="button" className="v3-btn v3-btn--danger" onClick={refuse}>
                {t("authority.requests.refuse")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

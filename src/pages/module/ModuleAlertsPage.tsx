import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import {
  confirmSignalement,
  markRoutingRead,
  rejectSignalement,
} from "../../services/reports";
import { launchIntervention } from "../../services/interventions";
import {
  findType,
  interventionForSignalementModule,
  routagesForModule,
  signalementsForModule,
} from "../../services/selectors";
import { useDb } from "../../services/useDb";
import type { Gravity } from "../../services/model";
import { formatDateTime, gravityTone, territoryLabel, userName } from "../shared/v3/helpers";

const GRAVITIES: Gravity[] = ["faible", "moyenne", "elevee", "critique"];
const GRAVITY_KEY: Record<Gravity, string> = {
  faible: "severity.low",
  moyenne: "severity.medium",
  elevee: "severity.high",
  critique: "severity.critical",
};

export default function ModuleAlertsPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [gravity, setGravity] = useState<Gravity>("moyenne");
  const [motif, setMotif] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!session || !session.moduleId) return null;
  const moduleId = session.moduleId;
  const canConfirm = can("CONFIRMER_SIGNALEMENT", { moduleId });
  const canLaunch = can("LANCER_INTERVENTION", { moduleId });
  const signalements = signalementsForModule(db, moduleId);

  const confirmTarget = signalements.find((item) => item.id === confirmId);
  const rejectTarget = signalements.find((item) => item.id === rejectId);

  function readSignalement(signalementId: string) {
    routagesForModule(db, moduleId, session!.userId)
      .filter((routage) => routage.signalementId === signalementId && !routage.luLe)
      .forEach((routage) => markRoutingRead(routage.id));
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    confirmSignalement(confirmTarget.id, session!.userId, gravity, moduleId);
    setConfirmId(null);
    setNotice(t("module.alerts.confirm"));
  }

  function handleReject() {
    if (!rejectTarget) return;
    rejectSignalement(rejectTarget.id, session!.userId, moduleId, motif.trim() || undefined);
    setRejectId(null);
    setMotif("");
    setNotice(t("module.alerts.reject"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.alerts.title")}</p>
          <h1 className="v3-title">{t("module.alerts.title")}</h1>
          <p className="v3-lead">{t("module.alerts.lead")}</p>
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

      {signalements.length === 0 ? (
        <p className="v3-empty">{t("module.alerts.empty")}</p>
      ) : (
        <ul className="v3-list">
          {signalements.map((signalement) => {
            const type = findType(db, signalement.typeId);
            const intervention = interventionForSignalementModule(db, signalement.id, moduleId);
            const unread = routagesForModule(db, moduleId, session.userId).some(
              (routage) => routage.signalementId === signalement.id && !routage.luLe,
            );
            return (
              <li key={signalement.id} className="v3-list__item">
                <div className="v3-list__main">
                  <p className="v3-list__title">
                    <span className={`v3-badge v3-badge--${gravityTone(signalement.gravite)}`}>
                      {type?.code ?? signalement.typeId}
                    </span>{" "}
                    {type?.libelle[lang] ?? signalement.typeId}
                    {unread ? <span className="v3-badge v3-badge--brand"> •</span> : null}
                  </p>
                  <p className="v3-list__meta">
                    {t("module.alerts.commune")} : {territoryLabel(db, signalement.communeId, lang)} ·{" "}
                    {t("module.alerts.people")} : {signalement.personnesConcernees} ·{" "}
                    {t("module.alerts.from")} : {userName(db, signalement.auteurId, lang)}
                  </p>
                  <p className="v3-list__meta">{signalement.description}</p>
                  <p className="v3-list__meta">
                    {t("module.alerts.receivedAt")} : {formatDateTime(signalement.creeLe, lang)} ·{" "}
                    {t("module.alerts.state")} :{" "}
                    <strong>{t(`module.state.${signalement.etat}`)}</strong>
                    {signalement.gravite ? (
                      <>
                        {" "}· {t("module.alerts.gravity")} :{" "}
                        <strong>{t(GRAVITY_KEY[signalement.gravite])}</strong>
                      </>
                    ) : null}
                  </p>
                  {signalement.suggestion ? (
                    <p className="v3-note">
                      <strong>{t("module.alerts.suggestion")} :</strong>{" "}
                      {t("module.alerts.suggestionLead")}
                      <br />
                      {typeLabelFor(db, signalement.suggestion.typeId, lang)} ·{" "}
                      {t(GRAVITY_KEY[signalement.suggestion.gravite])} ·{" "}
                      {t("module.alerts.confidence")}{" "}
                      {Math.round(signalement.suggestion.confiance * 100)} %
                    </p>
                  ) : null}
                </div>

                <div className="v3-list__side">
                  {unread ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small v3-btn--ghost"
                      onClick={() => readSignalement(signalement.id)}
                    >
                      {t("module.alerts.read")}
                    </button>
                  ) : null}

                  {signalement.etat === "non_verifie" && canConfirm ? (
                    <>
                      <button
                        type="button"
                        className="v3-btn v3-btn--small v3-btn--primary"
                        onClick={() => {
                          setGravity(signalement.suggestion?.gravite ?? "moyenne");
                          setConfirmId(signalement.id);
                        }}
                      >
                        {t("module.alerts.confirm")}
                      </button>
                      <button
                        type="button"
                        className="v3-btn v3-btn--small v3-btn--danger"
                        onClick={() => setRejectId(signalement.id)}
                      >
                        {t("module.alerts.reject")}
                      </button>
                    </>
                  ) : null}

                  {signalement.etat === "confirme" && !intervention && canLaunch ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small v3-btn--primary"
                      onClick={() => {
                        launchIntervention(signalement.id, session.userId, moduleId);
                        setNotice(t("module.interventions.start"));
                      }}
                    >
                      {t("module.alerts.startIntervention")}
                    </button>
                  ) : null}

                  {intervention ? (
                    <span className="v3-badge v3-badge--green">
                      {t(`module.interventions.interventionState.${intervention.etat}`)}
                    </span>
                  ) : null}

                  {!canConfirm && signalement.etat === "non_verifie" ? (
                    <span className="v3-badge">{t("module.alerts.noAction")}</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {confirmTarget ? (
        <Modal title={t("module.alerts.confirmTitle")} onClose={() => setConfirmId(null)}>
          <div className="v3-form">
            <div className="v3-field">
              <label htmlFor="gravity">{t("module.alerts.gravity")}</label>
              <select
                id="gravity"
                value={gravity}
                onChange={(event) => setGravity(event.target.value as Gravity)}
              >
                {GRAVITIES.map((value) => (
                  <option key={value} value={value}>
                    {t(GRAVITY_KEY[value])}
                  </option>
                ))}
              </select>
            </div>
            {confirmTarget.suggestion ? (
              <p className="v3-note">
                {t("module.alerts.suggestion")} :{" "}
                {typeLabelFor(db, confirmTarget.suggestion.typeId, lang)} ·{" "}
                {t(GRAVITY_KEY[confirmTarget.suggestion.gravite])} ·{" "}
                {Math.round(confirmTarget.suggestion.confiance * 100)} %
              </p>
            ) : null}
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setConfirmId(null)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="v3-btn v3-btn--primary" onClick={handleConfirm}>
                {t("module.alerts.confirm")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {rejectTarget ? (
        <Modal title={t("module.alerts.rejectTitle")} onClose={() => setRejectId(null)}>
          <div className="v3-form">
            <div className="v3-field">
              <label htmlFor="reject-motif">{t("module.alerts.rejectMotif")}</label>
              <textarea
                id="reject-motif"
                value={motif}
                placeholder={t("module.alerts.rejectPlaceholder")}
                onChange={(event) => setMotif(event.target.value)}
              />
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn" onClick={() => setRejectId(null)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="v3-btn v3-btn--danger" onClick={handleReject}>
                {t("module.alerts.reject")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function typeLabelFor(
  db: ReturnType<typeof useDb>,
  code: string,
  lang: "fr" | "ar",
): string {
  return findType(db, code as never)?.libelle[lang] ?? code;
}

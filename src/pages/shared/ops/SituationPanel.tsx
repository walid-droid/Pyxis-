import { useMemo, useState, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../auth/AuthContext";
import { useI18n } from "../../../i18n";
import { hashText, useOrsecOps } from "../../../lib/orsecOps";
import { useOrsecPlans } from "../plan/PlanContext";
import {
  SITUATION_KEYS,
  SITUATION_ORDER,
  allowedSituationTransitions,
  type PlanLevel,
  type SituationCode,
} from "../plan/orsecPlan";
import { useOperator } from "./useOperator";
import "./ops.css";

type Props = {
  level?: PlanLevel;
  compact?: boolean;
};

/** Pilotage de la situation ORSEC A-E avec justification signée. */
export default function SituationPanel({ level = "wilaya", compact = false }: Props) {
  const { t, lang } = useI18n();
  const { can } = useAuth();
  const { plans, setSituation, closeRecovery } = useOrsecPlans();
  const { addEntry } = useOrsecOps();
  const operator = useOperator();
  const plan = plans[level];
  const [target, setTarget] = useState<SituationCode | null>(null);
  const [justification, setJustification] = useState("");
  const [source, setSource] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canPilot = can("PILOTER_SITUATION");
  const transitions = useMemo(
    () => allowedSituationTransitions(plan.situation),
    [plan.situation],
  );
  const current = SITUATION_KEYS[plan.situation];
  const canCloseRecovery = plan.situation === "E" && canPilot;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!target || justification.trim().length < 12) return;
    const transition = transitions.find((item) => item.to === target);
    if (!transition) {
      setError(t("ops.situation.forbidden"));
      return;
    }
    const signatureHash = hashText(
      `${plan.id}|${plan.situation}|${target}|${operator.assignmentId}|${justification}|${Date.now()}`,
    );
    setSituation(plan.id, target, {
      by: operator.name,
      role: operator.roleLabel,
      assignmentId: operator.assignmentId,
      justification: justification.trim(),
      signatureHash,
      source: source.trim() || undefined,
      emergency: transition.emergency,
      moduleIds: plan.activation?.moduleIds,
    });
    addEntry({
      authorName: operator.name,
      assignmentId: operator.assignmentId,
      role: operator.roleLabel,
      scope: "authority",
      category: "decision",
      message:
        lang === "ar"
          ? `تغيير الوضعية من ${plan.situation} إلى ${target} — ${justification.trim()}`
          : `Situation ${plan.situation} → ${target} — ${justification.trim()}`,
    });
    setTarget(null);
    setJustification("");
    setSource("");
    setError(null);
    setToast(t("ops.situation.signed"));
  };

  const close = () => {
    closeRecovery(plan.id, operator.name);
    addEntry({
      authorName: operator.name,
      assignmentId: operator.assignmentId,
      role: operator.roleLabel,
      scope: "authority",
      category: "rehabilitation",
      message:
        lang === "ar"
          ? "إغلاق إعادة التأهيل والعودة إلى الوضعية أ."
          : "Réhabilitation close, retour en situation A.",
    });
    setToast(t("ops.situation.recoveryClosed"));
  };

  return (
    <section className={`ops-situation ops-situation--${current.tone}`}>
      <div className="ops-situation__row">
        <span className="ops-situation__code" aria-hidden="true">
          {plan.situation}
        </span>
        <div className="ops-situation__body">
          <span className="ops-situation__name">{t(current.nameKey)}</span>
          <span className="ops-situation__meta">
            {t("ops.situation.current")} ·{" "}
            {plan.transitions[0]?.at ?? t("ops.situation.from")}
          </span>
        </div>
      </div>

      {!compact ? (
        <ol className="ops-situation__steps" aria-label={t("ops.situation.current")}>
          {SITUATION_ORDER.map((code) => {
            const isCurrent = code === plan.situation;
            const isPast =
              SITUATION_ORDER.indexOf(code) < SITUATION_ORDER.indexOf(plan.situation);
            return (
              <li
                key={code}
                className={`ops-situation__step${isCurrent ? " is-current" : ""}${
                  isPast ? " is-past" : ""
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {code} · {t(SITUATION_KEYS[code].shortKey).split("·")[1]?.trim() ?? code}
              </li>
            );
          })}
        </ol>
      ) : null}

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      {!canPilot ? (
        <p className="ops-muted">{t("ops.situation.authorityOnly")}</p>
      ) : (
        <div className="ops-btn-row">
          {transitions.map((transition) => (
            <button
              key={transition.to}
              type="button"
              className={`ops-btn ops-btn--small${
                transition.emergency ? " ops-btn--danger" : ""
              }`}
              onClick={() => {
                setTarget(transition.to);
                setError(null);
              }}
            >
              {transition.emergency
                ? t("ops.situation.emergency")
                : `→ ${transition.to} · ${t(SITUATION_KEYS[transition.to].shortKey)}`}
            </button>
          ))}
          {canCloseRecovery ? (
            <button type="button" className="ops-btn ops-btn--small" onClick={close}>
              {t("ops.situation.closeRecovery")}
            </button>
          ) : null}
        </div>
      )}

      {plan.transitions.length > 0 && !compact ? (
        <details>
          <summary className="ops-muted">{t("ops.situation.history")}</summary>
          <ul className="ops-list" style={{ marginTop: 8 }}>
            {plan.transitions.slice(0, 6).map((transition) => (
              <li key={transition.id} className="ops-list__item">
                <div className="ops-list__head">
                  <span className="ops-list__title">
                    {transition.from} → {transition.to}
                    {transition.emergency ? ` · ${t("ops.situation.emergencyTag")}` : ""}
                  </span>
                  <span className="ops-list__meta">{transition.at}</span>
                </div>
                <p className="ops-list__body">{transition.justification}</p>
                <p className="ops-list__meta">
                  {transition.by} · {transition.assignmentId} ·{" "}
                  <span className="ops-code">{transition.signatureHash}</span>
                </p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {target ? (
        <Modal
          title={`${plan.situation} → ${target} · ${t(SITUATION_KEYS[target].shortKey)}`}
          onClose={() => setTarget(null)}
        >
          <form className="ops-form" onSubmit={submit}>
            <p className="ops-card__lead">{t("ops.situation.justification")}</p>
            <label className="ops-field">
              <span>{t("ops.situation.justification")} *</span>
              <textarea
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                placeholder={t("ops.situation.justificationPlaceholder")}
                minLength={12}
                required
              />
              <small className={justification.trim().length < 12 ? "ops-field__error" : "ops-muted"}>
                {justification.trim().length < 12
                  ? `${t("ops.common.required")} (12)`
                  : "✓"}
              </small>
            </label>
            <label className="ops-field">
              <span>{t("ops.situation.source")}</span>
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder={t("ops.situation.sourcePlaceholder")}
              />
            </label>
            <p className="ops-muted">
              {t("ops.situation.assignment")} : {operator.assignmentId} ·{" "}
              {operator.roleLabel}
            </p>
            {error ? <p className="ops-error">{error}</p> : null}
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setTarget(null)}>
                {t("ops.common.cancel")}
              </button>
              <button
                type="submit"
                className="ops-btn ops-btn--primary"
                disabled={justification.trim().length < 12}
              >
                {t("ops.situation.sign")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

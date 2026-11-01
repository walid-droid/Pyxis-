import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { useOrsecOps } from "../../lib/orsecOps";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import OpsHero from "../shared/ops/OpsHero";
import SituationPanel from "../shared/ops/SituationPanel";
import "./authority.css";

export default function CompliancePage() {
  const { t, lang, tc } = useI18n();
  const { compliance, toggleCompliance, fiches, attachFiche } = useOrsecOps();
  const { plans } = useOrsecPlans();
  const [toast, setToast] = useState<string | null>(null);
  const transitions = useMemo(
    () => plans.wilaya.transitions,
    [plans.wilaya.transitions],
  );

  const done = compliance.filter((item) => item.status === "done").length;
  const score = compliance.length === 0 ? 0 : Math.round((done / compliance.length) * 100);
  const completeFiches = fiches.filter((fiche) => fiche.status === "complete").length;

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.compliance.title")}
        title={t("ops.compliance.title")}
        lead={t("ops.compliance.lead")}
        chips={
          <>
            <span className="ops-chip">
              {t("ops.compliance.score")} · {score}%
            </span>
            <span className="ops-chip">
              {t("ops.compliance.fiches")} · {completeFiches}/{fiches.length}
            </span>
            <span className="ops-chip">
              {t("ops.compliance.transitions")} · {transitions.length}
            </span>
          </>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <SituationPanel level="wilaya" compact />

      <div className="ops-kpis">
        <div className={`ops-kpi ${score >= 70 ? "ops-kpi--ok" : "ops-kpi--warn"}`}>
          <span className="ops-kpi__value">{score}%</span>
          <span className="ops-kpi__label">{t("ops.compliance.score")}</span>
        </div>
        <div className="ops-kpi ops-kpi--danger">
          <span className="ops-kpi__value">
            {compliance.filter((item) => item.status === "late").length}
          </span>
          <span className="ops-kpi__label">{t("ops.compliance.late")}</span>
        </div>
        <div className="ops-kpi">
          <span className="ops-kpi__value">{completeFiches}</span>
          <span className="ops-kpi__label">{t("ops.compliance.complete")}</span>
        </div>
        <div className="ops-kpi ops-kpi--warn">
          <span className="ops-kpi__value">{fiches.length - completeFiches}</span>
          <span className="ops-kpi__label">{t("ops.recovery.ficheMissing")}</span>
        </div>
      </div>

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.compliance.checklist")}</h2>
          <span className="ops-card__hint">{t("ops.compliance.exerciseHint")}</span>
        </div>
        <ul className="ops-list">
          {compliance.map((item) => (
            <li key={item.id}>
              <label className="ops-check">
                <input
                  type="checkbox"
                  checked={item.status === "done"}
                  onChange={() => {
                    toggleCompliance(item.id);
                    setToast(t("ops.compliance.saved"));
                  }}
                />
                <span className="ops-check__body">
                  <span className="ops-check__label">{tc(item.label[lang])}</span>
                  <span className="ops-check__meta">
                    {t("ops.compliance.due")} · {item.due}
                    {item.evidence ? ` · ${t("ops.compliance.evidence")} : ${item.evidence}` : ""}
                  </span>
                </span>
                <span
                  className={`ops-badge ops-badge--${
                    item.status === "done"
                      ? "ok"
                      : item.status === "late"
                        ? "danger"
                        : "muted"
                  }`}
                >
                  {t(`ops.compliance.${item.status}`)}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="ops-grid ops-grid--split">
        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.compliance.fiches")}</h2>
            <span className="ops-card__hint">{t("ops.compliance.ficheHint")}</span>
          </div>
          <ul className="ops-list ops-scroll">
            {fiches.map((fiche) => (
              <li key={fiche.id} className="ops-list__item">
                <div className="ops-list__head">
                  <span className="ops-list__title">{tc(fiche.name[lang])}</span>
                  <span
                    className={`ops-badge ops-badge--${
                      fiche.status === "complete"
                        ? "ok"
                        : fiche.status === "partial"
                          ? "warn"
                          : "danger"
                    }`}
                  >
                    {t(`ops.compliance.${fiche.status}`)}
                  </span>
                </div>
                <div className="ops-inline" style={{ justifyContent: "space-between" }}>
                  <span className="ops-list__meta">{fiche.updatedAt ?? "—"}</span>
                  {fiche.status !== "complete" ? (
                    <button
                      type="button"
                      className="ops-btn ops-btn--small"
                      onClick={() => {
                        attachFiche(fiche.id);
                        setToast(t("ops.recovery.attached"));
                      }}
                    >
                      {t("ops.recovery.attach")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.compliance.audit")}</h2>
            <span className="ops-card__hint">{t("ops.compliance.auditHint")}</span>
          </div>
          {transitions.length === 0 ? (
            <p className="ops-empty">{t("ops.compliance.noTransitions")}</p>
          ) : (
            <ul className="ops-list ops-scroll">
              {transitions.map((transition) => (
                <li key={transition.id} className="ops-list__item">
                  <div className="ops-list__head">
                    <span className="ops-list__title">
                      {transition.from} → {transition.to}
                      {transition.emergency
                        ? ` · ${t("ops.situation.emergencyTag")}`
                        : ""}
                    </span>
                    <span className="ops-list__meta">{transition.at}</span>
                  </div>
                  <p className="ops-list__body">{tc(transition.justification)}</p>
                  <p className="ops-list__meta">
                    {transition.by} · {transition.role} ·{" "}
                    {t("ops.situation.assignment")} {transition.assignmentId}
                  </p>
                  <p className="ops-list__meta">
                    {t("ops.situation.signature")} ·{" "}
                    <span className="ops-code">{transition.signatureHash}</span>
                    {transition.source ? ` · ${transition.source}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

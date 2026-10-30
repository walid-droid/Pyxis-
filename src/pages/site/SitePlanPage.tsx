import "../command/resp-crise.css";
import "./site.css";
import "../shared/plan/plan.css";
import { useState } from "react";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import { SITE_DASHBOARD_PATH, SITE_SIMULATIONS_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import PlanStepper from "../shared/plan/PlanStepper";
import PlanModuleList from "../shared/plan/PlanModuleList";
import {
  ActivationDialog,
  DesignationDialog,
  LiftDialog,
  PhaseDialog,
} from "../shared/plan/PlanDialogs";
import {
  designatedCount,
  modulesForLevel,
  type ModuleId,
  type PlanStatus,
} from "../shared/plan/orsecPlan";

const ACTOR = "Exploitant du site d'Arzew";

const BADGE_TONE: Record<PlanStatus, string> = {
  draft: "standby",
  pending: "medium",
  approved: "low",
  alert: "high",
  active: "critical",
};

const STAT_TONE: Record<
  PlanStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  alert: "warning",
  active: "danger",
};

type DialogState =
  | { kind: "activate" }
  | { kind: "lift" }
  | { kind: "phase" }
  | { kind: "designate"; moduleId: ModuleId }
  | null;

/** Plan ORSEC du site sensible : approbation du wali, déclenchement et levée. */
function SitePlanPage() {
  const { t } = useI18n();
  const { plans, sendReport } = useOrsecPlans();
  const [dialog, setDialog] = useState<DialogState>(null);

  const plan = plans.site;
  const designated = designatedCount(plan);
  const totalModules = modulesForLevel(plan.level).length;
  const missing = totalModules - designated;
  const drafts = plan.reports.filter((report) => report.status === "draft").length;
  const hintStatus =
    plan.status === "approved" && plan.liftedAt ? "lifted" : plan.status;
  const hintKey = hintStatus === "active" ? "activeNoPosts" : hintStatus;
  const close = () => setDialog(null);

  return (
    <main className="rc-page rc-page--site">
      <Link className="rc-back-link" to={SITE_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("site.plan.eyebrow")}</p>
          <h1>{t("site.plan.title")}</h1>
          <p className="rc-hero__lead">{t("site.plan.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--low" />
              {t(plan.scopeKey)}
            </span>
            <span className="rc-chip">{plan.reference}</span>
            <span className="rc-chip">{plan.version}</span>
            {plan.approvedBy ? (
              <span className="rc-chip">
                {t("site.plan.approvedChip", {
                  date: plan.approvedAt ?? "—",
                })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="rc-hero__aside">
          {plan.status === "approved" ? (
            <button
              type="button"
              className="rc-btn rc-btn--primary"
              onClick={() => setDialog({ kind: "activate" })}
            >
              {t("orsec.action.activate")}
            </button>
          ) : null}

          {plan.status === "active" ? (
            <>
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setDialog({ kind: "phase" })}
              >
                {t("orsec.action.changePhase")}
              </button>
              <button
                type="button"
                className="rc-btn rc-btn--ghost-danger"
                onClick={() => setDialog({ kind: "lift" })}
              >
                {t("orsec.action.lift")}
              </button>
            </>
          ) : null}
        </div>
      </section>

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("orsec.lifecycle.title")}</h2>
          <span className="rc-card__hint">{t("orsec.lifecycle.lead")}</span>
        </div>
        <PlanStepper plan={plan} />
      </section>

      <section className="stat-grid" aria-label={t("site.plan.statsLabel")}>
        <StatCard
          value={t(`orsec.statusShort.${plan.status}`)}
          label={t("site.plan.statState")}
          badge={
            plan.status === "active" && plan.phase
              ? t(`orsec.phase.${plan.phase}`)
              : t("orsec.level.site")
          }
          badgeTone={STAT_TONE[plan.status]}
        />
        <StatCard
          value={`${designated}/${totalModules}`}
          label={t("site.plan.statModules")}
          badge={
            missing > 0
              ? t("orsec.modules.missingShort", { count: missing })
              : t("orsec.modules.allDesignated")
          }
          badgeTone={missing > 0 ? "warning" : "success"}
        />
        <StatCard
          value={String(drafts)}
          label={t("site.plan.statReports")}
          badge={t(
            drafts > 0 ? "orsec.report.statBadge" : "orsec.report.allSent",
          )}
          badgeTone={drafts > 0 ? "warning" : "success"}
        />
        <StatCard
          value={t("site.plan.statSimulationsValue")}
          label={t("site.plan.statSimulations")}
          badge={t("site.plan.statSimulationsBadge")}
          badgeTone="info"
        />
      </section>

      <section className="rc-grid rc-grid--main">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("site.plan.modulesTitle")}</h2>
            <span className="rc-card__hint">
              {t("orsec.modules.count", {
                count: designated,
                total: totalModules,
              })}
            </span>
          </div>
          <p className="rc-card__lead">{t("site.plan.modulesLead")}</p>

          <PlanModuleList
            plan={plan}
            onDesignate={(moduleId) =>
              setDialog({ kind: "designate", moduleId })
            }
          />
        </article>

        <div className="rc-grid">
          <article className="rc-card">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("site.plan.stateTitle")}</h2>
              <span className={`rc-badge rc-badge--${BADGE_TONE[plan.status]}`}>
                {t(`orsec.statusShort.${plan.status}`)}
              </span>
            </div>
            <p className="rc-card__lead">{t(`orsec.hint.${hintKey}`)}</p>

            <dl className="orsec-facts">
              <div>
                <dt>{t("orsec.fact.approvedBy")}</dt>
                <dd>{plan.approvedBy ?? "—"}</dd>
              </div>
              <div>
                <dt>{t("orsec.fact.approvedAt")}</dt>
                <dd>{plan.approvedAt ?? "—"}</dd>
              </div>
              <div>
                <dt>{t("orsec.fact.revision")}</dt>
                <dd>{plan.revisionDue}</dd>
              </div>
              <div>
                <dt>{t("orsec.fact.incidents")}</dt>
                <dd>{plan.activation?.incidentIds.length ?? 0}</dd>
              </div>
            </dl>

            <div className="rc-card__foot">
              <p className="site-note">{t("site.plan.legalNote")}</p>
              <div className="rc-card-actions" style={{ marginTop: 12 }}>
                <Link
                  className="rc-btn rc-btn--soft rc-btn--small"
                  to={SITE_SIMULATIONS_PATH}
                >
                  {t("site.plan.openSimulations")}
                </Link>
              </div>
            </div>
          </article>

          <article className="rc-card">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("orsec.report.title")}</h2>
              <span className="rc-card__hint">
                {t("orsec.report.count", { count: plan.reports.length })}
              </span>
            </div>
            <p className="rc-card__lead">{t("orsec.report.lead")}</p>

            {plan.reports.length === 0 ? (
              <p className="orsec-empty">{t("orsec.report.empty")}</p>
            ) : (
              <ul className="orsec-reports">
                {plan.reports.map((report) => (
                  <li className="orsec-report" key={report.id}>
                    <div className="orsec-report__body">
                      <span className="orsec-report__ref">
                        {report.reference}
                      </span>
                      <span className="orsec-report__meta">
                        {t("orsec.report.created", {
                          date: report.createdAt,
                        })}
                        {" · "}
                        {t(report.recipientKey)}
                      </span>
                    </div>
                    <span
                      className={`rc-badge rc-badge--${
                        report.status === "sent" ? "low" : "medium"
                      }`}
                    >
                      {t(`orsec.report.status.${report.status}`)}
                    </span>
                    {report.status === "draft" ? (
                      <button
                        type="button"
                        className="rc-btn rc-btn--soft rc-btn--small"
                        onClick={() => sendReport(plan.id, report.id)}
                      >
                        {t("orsec.report.send")}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rc-card">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("orsec.log.title")}</h2>
              <span className="rc-card__hint">{t("orsec.log.lead")}</span>
            </div>
            <ul className="orsec-log">
              {plan.log.slice(0, 5).map((item) => (
                <li className="orsec-log__item" key={item.id}>
                  <span className="orsec-log__time">{item.at}</span>
                  <span>
                    {t(item.actionKey)}
                    {item.subjectKey ? (
                      <>
                        {" · "}
                        <span className="orsec-log__subject">
                          {t(item.subjectKey)}
                        </span>
                      </>
                    ) : null}
                    {item.subject ? (
                      <>
                        {" — "}
                        <span className="orsec-log__subject">
                          {item.subject}
                        </span>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {dialog?.kind === "activate" ? (
        <ActivationDialog plan={plan} by={ACTOR} onClose={close} />
      ) : null}
      {dialog?.kind === "lift" ? (
        <LiftDialog plan={plan} onClose={close} />
      ) : null}
      {dialog?.kind === "phase" ? (
        <PhaseDialog plan={plan} onClose={close} />
      ) : null}
      {dialog?.kind === "designate" ? (
        <DesignationDialog
          plan={plan}
          moduleId={dialog.moduleId}
          by={ACTOR}
          onClose={close}
        />
      ) : null}
    </main>
  );
}

export default SitePlanPage;

import "../command/resp-crise.css";
import "./authority.css";
import "../shared/plan/plan.css";
import { useState } from "react";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import {
  AUTHORITY_DASHBOARD_PATH,
  AUTHORITY_DECISIONS_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import PlanStepper from "../shared/plan/PlanStepper";
import PlanModuleList from "../shared/plan/PlanModuleList";
import {
  ActivationDialog,
  AlertDialog,
  ApprovalDialog,
  DesignationDialog,
  LiftDialog,
  PhaseDialog,
} from "../shared/plan/PlanDialogs";
import {
  designatedCount,
  levelOpensPosts,
  modulesForLevel,
  type ModuleId,
  type PlanStatus,
} from "../shared/plan/orsecPlan";

type AuthorityLevel = "commune" | "wilaya" | "national";

const LEVELS: AuthorityLevel[] = ["commune", "wilaya", "national"];

const ACTOR: Record<AuthorityLevel, string> = {
  commune: "Président de l'APC de Béjaïa",
  wilaya: "Wali de Béjaïa",
  national: "Ministre de l'Intérieur",
};

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
  | { kind: "approve" }
  | { kind: "alert" }
  | { kind: "activate" }
  | { kind: "lift" }
  | { kind: "phase" }
  | { kind: "designate"; moduleId: ModuleId }
  | null;

type Attachment = {
  id: string;
  key: string;
  date: string | null;
  status: "present" | "missing";
};

const ATTACHMENTS: Attachment[] = [
  {
    id: "deliberation",
    key: "authority.plan.attachment.deliberation",
    date: "08/01/2026",
    status: "present",
  },
  {
    id: "arrete",
    key: "authority.plan.attachment.arrete",
    date: "12/01/2026",
    status: "present",
  },
  {
    id: "intervention",
    key: "authority.plan.attachment.intervention",
    date: "12/01/2026",
    status: "present",
  },
  {
    id: "alert",
    key: "authority.plan.attachment.alert",
    date: null,
    status: "missing",
  },
  {
    id: "risk",
    key: "authority.plan.attachment.risk",
    date: null,
    status: "missing",
  },
];

type Escalation = {
  id: string;
  proposal: string;
  from: string;
  at: string;
  status: "pending" | "accepted" | "refused";
};

const ESCALATIONS: Escalation[] = [
  {
    id: "esc1",
    proposal: "authority.plan.escalation.flood",
    from: "Cellule de veille · ANRH",
    at: "30/10/2026 · 08:55",
    status: "pending",
  },
  {
    id: "esc2",
    proposal: "authority.plan.escalation.forest",
    from: "Conservation des forêts",
    at: "30/10/2026 · 08:10",
    status: "pending",
  },
];

type WilayaState = "normal" | "alert" | "active" | "lifted";

const NATIONAL_WILAYAS: { name: string; state: WilayaState; at: string }[] = [
  { name: "Béjaïa", state: "active", at: "30/10/2026 · 08:20" },
  { name: "Tizi Ouzou", state: "alert", at: "30/10/2026 · 09:05" },
  { name: "Sétif", state: "normal", at: "29/10/2026 · 17:40" },
  { name: "Jijel", state: "lifted", at: "28/10/2026 · 12:15" },
  { name: "Bouira", state: "normal", at: "29/10/2026 · 16:00" },
];

/** Plan ORSEC de l'autorité compétente : commune, wilaya ou national. */
function AuthorityPlanPage() {
  const { t } = useI18n();
  const { plans, sendReport } = useOrsecPlans();
  const [level, setLevel] = useState<AuthorityLevel>("wilaya");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [attachments, setAttachments] = useState<Attachment[]>(ATTACHMENTS);
  const [escalations, setEscalations] =
    useState<Escalation[]>(ESCALATIONS);
  const [toast, setToast] = useState<string | null>(null);

  const plan = plans[level];
  const actor = ACTOR[level];
  const designated = designatedCount(plan);
  const totalModules = modulesForLevel(plan.level).length;
  const missing = totalModules - designated;
  const drafts = plan.reports.filter((report) => report.status === "draft").length;
  const hintStatus =
    plan.status === "approved" && plan.liftedAt ? "lifted" : plan.status;
  const hintKey =
    level === "national" && hintStatus === "approved"
      ? "nationalReady"
      : hintStatus === "active" && !levelOpensPosts(plan.level)
        ? "activeNoPosts"
        : hintStatus;
  const close = () => setDialog(null);

  const deposit = (id: string) => {
    setAttachments((current) =>
      current.map((attachment) =>
        attachment.id === id
          ? {
              ...attachment,
              status: "present",
              date: "30/10/2026",
            }
          : attachment,
      ),
    );
    setToast(t("authority.plan.attachment.deposited"));
  };

  const decide = (id: string, decision: "accepted" | "refused") => {
    setEscalations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: decision } : item,
      ),
    );
    setToast(
      t(
        decision === "accepted"
          ? "authority.plan.escalation.accepted"
          : "authority.plan.escalation.refused",
      ),
    );
  };

  return (
    <main className="rc-page rc-page--authority">
      <Link className="rc-back-link" to={AUTHORITY_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("authority.plan.eyebrow")}</p>
          <h1>{t("authority.plan.title")}</h1>
          <p className="rc-hero__lead">{t("authority.plan.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t(plan.scopeKey)}
            </span>
            <span className="rc-chip">{plan.reference}</span>
            <span className="rc-chip">{plan.version}</span>
          </div>
        </div>

        <div className="rc-hero__aside">
          {plan.status === "pending" ? (
            <button
              type="button"
              className="rc-btn rc-btn--primary"
              onClick={() => setDialog({ kind: "approve" })}
            >
              {t("orsec.action.approve")}
            </button>
          ) : null}

          {plan.status === "approved" ? (
            <>
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setDialog({ kind: "alert" })}
              >
                {t("orsec.action.setAlert")}
              </button>
              <button
                type="button"
                className="rc-btn rc-btn--primary"
                onClick={() => setDialog({ kind: "activate" })}
              >
                {t("orsec.action.activate")}
              </button>
            </>
          ) : null}

          {plan.status === "alert" ? (
            <button
              type="button"
              className="rc-btn rc-btn--danger"
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

      <section className="orsec-toolbar">
        <div
          className="orsec-levels"
          role="group"
          aria-label={t("orsec.level.switchLabel")}
        >
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              className={`orsec-levels__btn${value === level ? " is-active" : ""}`}
              aria-pressed={value === level}
              onClick={() => {
                setLevel(value);
                setDialog(null);
              }}
            >
              {t(`orsec.level.${value}`)}
            </button>
          ))}
        </div>
        <p className="orsec-toolbar__hint">{t("authority.plan.levelHint")}</p>
      </section>

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("orsec.lifecycle.title")}</h2>
          <span className="rc-card__hint">{t("orsec.lifecycle.lead")}</span>
        </div>
        <PlanStepper plan={plan} />
      </section>

      <section className="stat-grid" aria-label={t("authority.plan.statsLabel")}>
        <StatCard
          value={t(`orsec.statusShort.${plan.status}`)}
          label={t("authority.plan.statState")}
          badge={
            plan.status === "active" && plan.phase
              ? t(`orsec.phase.${plan.phase}`)
              : t(`orsec.level.${level}`)
          }
          badgeTone={STAT_TONE[plan.status]}
        />
        <StatCard
          value={
            level === "national"
              ? "—"
              : `${designated}/${totalModules}`
          }
          label={t("authority.plan.statModules")}
          badge={
            level === "national"
              ? t("orsec.status.notApplicable")
              : missing > 0
                ? t("orsec.modules.missingShort", { count: missing })
                : t("orsec.modules.allDesignated")
          }
          badgeTone={
            level === "national"
              ? "neutral"
              : missing > 0
                ? "warning"
                : "success"
          }
        />
        <StatCard
          value={String(drafts)}
          label={t("authority.plan.statReports")}
          badge={t(
            drafts > 0 ? "orsec.report.statBadge" : "orsec.report.allSent",
          )}
          badgeTone={drafts > 0 ? "warning" : "success"}
        />
        <StatCard
          value={plan.revisionDue}
          label={t("authority.plan.statReview")}
          badge={t("orsec.fact.revisionBadge")}
          badgeTone="neutral"
        />
      </section>

      <section className="rc-grid rc-grid--main">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.plan.modulesTitle")}</h2>
            <span className="rc-card__hint">
              {level === "national"
                ? t("orsec.status.notApplicable")
                : t("orsec.modules.count", {
                    count: designated,
                    total: totalModules,
                  })}
            </span>
          </div>
          <p className="rc-card__lead">{t("authority.plan.modulesLead")}</p>

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
              <h2 className="rc-card__title">{t("authority.plan.stateTitle")}</h2>
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
                <dt>{t("orsec.fact.posts")}</dt>
                <dd>
                  {!levelOpensPosts(plan.level)
                    ? "—"
                    : plan.status === "active"
                      ? t("orsec.fact.postsOpen")
                      : t("orsec.fact.postsClosed")}
                </dd>
              </div>
              <div>
                <dt>{t("orsec.fact.revision")}</dt>
                <dd>{plan.revisionDue}</dd>
              </div>
            </dl>

            <div className="rc-card__foot">
              <p className="au-note">{t("authority.plan.legalNote")}</p>
              <div className="rc-card-actions" style={{ marginTop: 12 }}>
                <Link
                  className="rc-btn rc-btn--soft rc-btn--small"
                  to={AUTHORITY_DECISIONS_PATH}
                >
                  {t("authority.plan.openDecisions")}
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

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">
              {t("authority.plan.attachmentsTitle")}
            </h2>
            <span className="rc-card__hint">
              {attachments.filter((item) => item.status === "present").length}/
              {attachments.length}
            </span>
          </div>
          <p className="rc-card__lead">
            {t("authority.plan.attachmentsLead")}
          </p>
          <ul className="org-signal-list">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="org-signal">
                <div className="org-signal__head">
                  <strong>{t(attachment.key)}</strong>
                  <span
                    className={`rc-badge rc-badge--${
                      attachment.status === "present" ? "low" : "medium"
                    }`}
                  >
                    {t(
                      attachment.status === "present"
                        ? "authority.plan.attachment.present"
                        : "authority.plan.attachment.missing",
                    )}
                  </span>
                </div>
                <div className="org-signal__foot">
                  <span className="org-muted">
                    {attachment.date ?? t("authority.plan.attachment.noDate")}
                  </span>
                  {attachment.status === "missing" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--soft rc-btn--small"
                      onClick={() => deposit(attachment.id)}
                    >
                      {t("authority.plan.attachment.deposit")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">
              {t("authority.plan.escalationsTitle")}
            </h2>
            <span className="rc-card__hint">
              {t("authority.plan.escalationsLead")}
            </span>
          </div>
          <p className="rc-card__lead">
            {t("authority.plan.escalationsRule")}
          </p>
          {level === "national" ? (
            <p className="au-note">{t("authority.crisis.nationalOnly")}</p>
          ) : (
            <ul className="org-signal-list">
              {escalations.map((item) => (
                <li key={item.id} className="org-signal">
                  <div className="org-signal__head">
                    <strong>
                      {t("authority.plan.escalation.prefix")}{" "}
                      {t(item.proposal)}
                    </strong>
                    <span
                      className={`rc-badge rc-badge--${
                        item.status === "pending"
                          ? "medium"
                          : item.status === "accepted"
                            ? "low"
                            : "critical"
                      }`}
                    >
                      {t(
                        `authority.plan.escalation.status.${item.status}`,
                      )}
                    </span>
                  </div>
                  <p className="org-signal__meta">
                    <span>{item.from}</span>
                    <span>{item.at}</span>
                  </p>
                  {item.status === "pending" ? (
                    <div className="org-signal__foot">
                      <button
                        type="button"
                        className="rc-btn rc-btn--primary rc-btn--small"
                        onClick={() => decide(item.id, "accepted")}
                      >
                        {t("authority.plan.escalation.accept")}
                      </button>
                      <button
                        type="button"
                        className="rc-btn rc-btn--ghost-danger rc-btn--small"
                        onClick={() => decide(item.id, "refused")}
                      >
                        {t("authority.plan.escalation.refuse")}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {level === "national" ? (
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">
              {t("authority.plan.nationalTitle")}
            </h2>
            <span className="rc-card__hint">
              {t("authority.plan.nationalLead")}
            </span>
          </div>
          <div className="rc-table-wrap">
            <table className="rc-table org-table">
              <thead>
                <tr>
                  <th>{t("authority.plan.wilaya")}</th>
                  <th>{t("org.common.status")}</th>
                  <th>{t("org.common.updated")}</th>
                </tr>
              </thead>
              <tbody>
                {NATIONAL_WILAYAS.map((wilaya) => (
                  <tr key={wilaya.name}>
                    <td>
                      <strong>{wilaya.name}</strong>
                    </td>
                    <td>
                      <span
                        className={`rc-badge rc-badge--${
                          wilaya.state === "active"
                            ? "critical"
                            : wilaya.state === "alert"
                              ? "high"
                              : wilaya.state === "lifted"
                                ? "low"
                                : "standby"
                        }`}
                      >
                        {t(`authority.plan.wilayaState.${wilaya.state}`)}
                      </span>
                    </td>
                    <td>{wilaya.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {dialog?.kind === "approve" ? (
        <ApprovalDialog plan={plan} onClose={close} />
      ) : null}
      {dialog?.kind === "alert" ? (
        <AlertDialog plan={plan} onClose={close} />
      ) : null}
      {dialog?.kind === "activate" ? (
        <ActivationDialog plan={plan} by={actor} onClose={close} />
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
          by={actor}
          onClose={close}
        />
      ) : null}
    </main>
  );
}

export default AuthorityPlanPage;

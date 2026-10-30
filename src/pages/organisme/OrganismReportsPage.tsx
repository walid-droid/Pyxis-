import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import OrgHero from "./OrgHero";
import {
  REPORTS,
  loc,
  type OrgReport,
  type ReportStatus,
  type Severity,
} from "./organismeData";

type ReportModal =
  | { kind: "detail"; id: string }
  | { kind: "reject"; id: string }
  | { kind: "severity"; id: string }
  | null;

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];
const STATUS_TONE: Record<ReportStatus, string> = {
  received: "medium",
  confirmed: "low",
  rejected: "high",
};

function severityTone(severity: Severity): string {
  return severity;
}

/** Signalements reçus : confirmation, rejet motivé, gravité justifiée. */
export default function OrganismReportsPage() {
  const { t, lang } = useI18n();
  const [reports, setReports] = useState<OrgReport[]>(REPORTS);
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");
  const [modal, setModal] = useState<ReportModal>(null);
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [justification, setJustification] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const active = modal ? reports.find((report) => report.id === modal.id) : null;
  const visible = reports.filter(
    (report) => filter === "all" || report.status === filter,
  );

  const openReject = (report: OrgReport) => {
    setReason("");
    setModal({ kind: "reject", id: report.id });
  };

  const openSeverity = (report: OrgReport) => {
    setSeverity(report.severity);
    setJustification("");
    setModal({ kind: "severity", id: report.id });
  };

  const confirmReport = (report: OrgReport) => {
    setReports((current) =>
      current.map((item) =>
        item.id === report.id
          ? {
              ...item,
              status: "confirmed",
              history: [
                ...item.history,
                {
                  at: "30/10/2026 · maintenant",
                  action: {
                    fr: "Confirmé par l'organisme",
                    ar: "أكدته الهيئة",
                  },
                  by: "Colonel A. Mansouri",
                },
              ],
            }
          : item,
      ),
    );
    setToast(t("org.reports.confirmed"));
  };

  const rejectReport = () => {
    if (!active || reason.trim().length < 8) return;
    setReports((current) =>
      current.map((item) =>
        item.id === active.id
          ? {
              ...item,
              status: "rejected",
              reason: { fr: reason, ar: reason },
              history: [
                ...item.history,
                {
                  at: "30/10/2026 · maintenant",
                  action: { fr: "Rejeté avec motif", ar: "رُفض مع السبب" },
                  by: "Colonel A. Mansouri",
                },
              ],
            }
          : item,
      ),
    );
    setModal(null);
    setToast(t("org.reports.rejected"));
  };

  const updateSeverity = () => {
    if (!active || justification.trim().length < 8) return;
    setReports((current) =>
      current.map((item) =>
        item.id === active.id
          ? {
              ...item,
              severity,
              history: [
                ...item.history,
                {
                  at: "30/10/2026 · maintenant",
                  action: {
                    fr: `Gravité fixée à « ${t(`severity.${severity}`)} » — ${justification}`,
                    ar: `حُددت الخطورة « ${t(`severity.${severity}`)} » — ${justification}`,
                  },
                  by: "Colonel A. Mansouri",
                },
              ],
            }
          : item,
      ),
    );
    setModal(null);
    setToast(t("org.reports.severityUpdated"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.reports.eyebrow")}
        title={t("org.reports.title")}
        lead={t("org.reports.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t("org.reports.tab.received")} · {reports.filter((r) => r.status === "received").length}
            </span>
            <span className="rc-chip">{t("org.reports.rule")}</span>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.reports.title")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.common.status")}>
            {(["all", "received", "confirmed", "rejected"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${filter === value ? " is-active" : ""}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {t(`org.reports.tab.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="rc-card__lead">{t("org.reports.lead")}</p>

        {visible.length === 0 ? (
          <p className="rc-empty">{t("org.reports.empty")}</p>
        ) : (
          <div className="rc-table-wrap">
            <table className="rc-table org-table">
              <thead>
                <tr>
                  <th>{t("org.reports.table.report")}</th>
                  <th>{t("org.reports.table.source")}</th>
                  <th>{t("org.reports.table.severity")}</th>
                  <th>{t("org.reports.table.receivedAt")}</th>
                  <th>{t("org.reports.table.status")}</th>
                  <th>{t("org.reports.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div className="org-cell">
                        <span className="org-cell__ref">{report.ref}</span>
                        <strong>{loc(lang, report.title)}</strong>
                        <span className="org-cell__meta">{loc(lang, report.place)}</span>
                      </div>
                    </td>
                    <td>{loc(lang, report.source)}</td>
                    <td>
                      <span
                        className={`rc-badge rc-badge--${severityTone(report.severity)}`}
                      >
                        {t(`severity.${report.severity}`)}
                      </span>
                    </td>
                    <td className="rc-table__date">{report.receivedAt}</td>
                    <td>
                      <span className={`rc-badge rc-badge--${STATUS_TONE[report.status]}`}>
                        {t(`org.reports.status.${report.status}`)}
                      </span>
                    </td>
                    <td>
                      <div className="org-actions">
                        <button
                          type="button"
                          className="rc-btn rc-btn--soft rc-btn--small"
                          onClick={() => setModal({ kind: "detail", id: report.id })}
                        >
                          {t("org.reports.detail")}
                        </button>
                        {report.status === "received" ? (
                          <>
                            <button
                              type="button"
                              className="rc-btn rc-btn--primary rc-btn--small"
                              onClick={() => confirmReport(report)}
                            >
                              {t("org.reports.confirm")}
                            </button>
                            <button
                              type="button"
                              className="rc-btn rc-btn--ghost-danger rc-btn--small"
                              onClick={() => openReject(report)}
                            >
                              {t("org.reports.reject")}
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className="rc-btn rc-btn--soft rc-btn--small"
                          onClick={() => openSeverity(report)}
                        >
                          {t("org.reports.adjust")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rc-card__foot">
          <p className="org-note">{t("org.reports.rule")}</p>
        </div>
      </article>

      {modal?.kind === "detail" && active ? (
        <Modal title={active.ref} onClose={() => setModal(null)}>
          <div className="org-stack">
            <div>
              <p className="rc-eyebrow">{t("org.reports.summary")}</p>
              <h3>{loc(lang, active.title)}</h3>
              <p className="org-muted">{loc(lang, active.summary)}</p>
            </div>

            <dl className="org-facts">
              <div>
                <dt>{t("org.common.place")}</dt>
                <dd>{loc(lang, active.place)}</dd>
              </div>
              <div>
                <dt>{t("org.reports.reporter")}</dt>
                <dd>{active.reporter}</dd>
              </div>
              <div>
                <dt>{t("org.common.severity")}</dt>
                <dd>{t(`severity.${active.severity}`)}</dd>
              </div>
              <div>
                <dt>{t("org.common.status")}</dt>
                <dd>{t(`org.reports.status.${active.status}`)}</dd>
              </div>
            </dl>

            {active.reason ? (
              <p className="org-note">
                <strong>{t("org.common.reason")} :</strong> {loc(lang, active.reason)}
              </p>
            ) : null}

            <div>
              <h4>{t("org.reports.history")}</h4>
              <ul className="org-history">
                {active.history.map((item) => (
                  <li key={`${item.at}-${item.action.fr}`}>
                    <span className="org-history__time">{item.at}</span>
                    <span>{loc(lang, item.action)}</span>
                    <span className="org-history__by">{item.by}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      ) : null}

      {modal?.kind === "reject" && active ? (
        <Modal title={t("org.reports.rejectTitle")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              rejectReport();
            }}
          >
            <p className="org-muted">{t("org.reports.rejectLead")}</p>
            <div className="rc-field">
              <label htmlFor="reject-reason">{t("org.common.reason")} *</label>
              <textarea
                id="reject-reason"
                value={reason}
                placeholder={t("org.reports.reasonPlaceholder")}
                onChange={(event) => setReason(event.target.value)}
                required
                minLength={8}
              />
              <span className="org-field-hint">
                {reason.trim().length < 8 ? t("org.common.required") : "✓"}
              </span>
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--danger"
                disabled={reason.trim().length < 8}
              >
                {t("org.common.reject")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal?.kind === "severity" && active ? (
        <Modal title={t("org.reports.severityTitle")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              updateSeverity();
            }}
          >
            <p className="org-muted">{t("org.reports.severityLead")}</p>
            <div className="rc-field">
              <label htmlFor="severity-value">{t("org.common.severity")} *</label>
              <select
                id="severity-value"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as Severity)}
              >
                {SEVERITIES.map((value) => (
                  <option key={value} value={value}>
                    {t(`severity.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="rc-field">
              <label htmlFor="severity-justification">
                {t("org.common.justification")} *
              </label>
              <textarea
                id="severity-justification"
                value={justification}
                placeholder={t("org.reports.justificationPlaceholder")}
                onChange={(event) => setJustification(event.target.value)}
                required
                minLength={8}
              />
              <span className="org-field-hint">
                {justification.trim().length < 8 ? t("org.common.required") : "✓"}
              </span>
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={justification.trim().length < 8}
              >
                {t("org.common.save")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

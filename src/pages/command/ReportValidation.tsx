import "./resp-crise.css";
import { useState } from "react";
import { Link } from "react-router";
import { useI18n } from "../../i18n";
import { mockIncidents } from "../../mockdata/incident";
import { mockWarnings, type Warning } from "../../mockdata/warning";
import WarningCard from "../../components/WarningCard";
import ConfirmDialog from "./ConfirmDialog";

import photoAccident from "../../assets/svg/accident-route.svg";
import photoHeat from "../../assets/svg/canicule.svg";
import photoGas from "../../assets/svg/fuite-de-gaz.svg";
import photoFire from "../../assets/svg/incendie.svg";
import photoFlood from "../../assets/svg/inondation.svg";
import photoQuake from "../../assets/svg/seisme.svg";
import photoStorm from "../../assets/svg/tempete.svg";

type ReportState = "pending" | "accepted" | "rejected" | "info";

type Report = Warning & {
  state: ReportState;
  incidentId: number;
  linked?: boolean;
  reasonKey?: string;
  infoMessage?: string;
};

type Reliability = { score: number; corroborations: number };

const SIGNALS: Record<number, Reliability> = {
  11: { score: 62, corroborations: 4 },
  12: { score: 78, corroborations: 3 },
  13: { score: 84, corroborations: 2 },
  14: { score: 88, corroborations: 5 },
  15: { score: 46, corroborations: 1 },
  16: { score: 54, corroborations: 2 },
  17: { score: 70, corroborations: 2 },
  18: { score: 60, corroborations: 1 },
};

/** Signalements considérés comme des doublons d'un signalement antérieur. */
const DUPLICATES: Record<number, number> = { 15: 11 };

const REJECT_REASONS = [
  "duplicate",
  "unverifiable",
  "outOfZone",
  "incomplete",
] as const;

const FALLBACK_SIGNAL: Reliability = { score: 60, corroborations: 1 };

function buildQueue(): Report[] {
  return mockWarnings
    .filter((warning) => warning.verification === "unverified")
    .map((warning) => ({
      ...warning,
      state: "pending" as ReportState,
      incidentId: 100 + warning.id,
    }));
}

/** Illustration utilisée comme photo du signalement citoyen. */
function reportPhoto(title: string): string {
  const value = title.toLowerCase();

  if (
    value.includes("fumée") ||
    value.includes("incendie") ||
    value.includes("feu")
  ) {
    return photoFire;
  }
  if (
    value.includes("inondation") ||
    value.includes("eau") ||
    value.includes("caniveau")
  ) {
    return photoFlood;
  }
  if (
    value.includes("fissure") ||
    value.includes("sismique") ||
    value.includes("secousse")
  ) {
    return photoQuake;
  }
  if (
    value.includes("électrique") ||
    value.includes("tempête") ||
    value.includes("randonneur")
  ) {
    return photoStorm;
  }
  if (value.includes("odeur") || value.includes("chimique")) {
    return photoGas;
  }
  if (value.includes("canicule")) {
    return photoHeat;
  }
  return photoAccident;
}

function reliabilityLevel(score: number): "high" | "medium" | "low" {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function sigRef(id: number): string {
  return `SIG-${String(id).padStart(3, "0")}`;
}

function incidentRef(id: number): string {
  return `INC-${String(id).padStart(3, "0")}`;
}

/** Statut de traitement du signalement, affiché comme la vérification citoyenne. */
function StateIcon({ state }: { state: ReportState }) {
  return (
    <svg
      className="rc-report__state-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {state === "pending" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {state === "info" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </>
      )}
      {state === "accepted" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </>
      )}
      {state === "rejected" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6" />
          <path d="m15 9-6 6" />
        </>
      )}
    </svg>
  );
}

function RefIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

/** Écran 4 — file de validation des signalements citoyens. */
function ReportValidation() {
  const { t, tc } = useI18n();
  const [reports, setReports] = useState<Report[]>(buildQueue);
  const [filter, setFilter] = useState<ReportState | "all">("pending");
  const [notice, setNotice] = useState<string | null>(null);

  const [accepting, setAccepting] = useState<Report | null>(null);
  const [acceptMode, setAcceptMode] = useState<"create" | "link">("create");
  const [linkTarget, setLinkTarget] = useState("");

  const [rejecting, setRejecting] = useState<Report | null>(null);
  const [rejectReason, setRejectReason] = useState<string>(REJECT_REASONS[0]);

  const [asking, setAsking] = useState<Report | null>(null);
  const [askMessage, setAskMessage] = useState("");

  const activeIncidents = mockIncidents.filter(
    (incident) =>
      incident.status === "Responding" || incident.status === "Reported",
  );

  const counts = {
    pending: reports.filter((report) => report.state === "pending").length,
    info: reports.filter((report) => report.state === "info").length,
    accepted: reports.filter((report) => report.state === "accepted").length,
    rejected: reports.filter((report) => report.state === "rejected").length,
  };

  const visible = reports.filter(
    (report) => filter === "all" || report.state === filter,
  );

  function openAccept(report: Report) {
    setAcceptMode("create");
    setLinkTarget(String(activeIncidents[0]?.id ?? ""));
    setAccepting(report);
  }

  function acceptReport() {
    if (!accepting) return;
    const linked = acceptMode === "link" && Boolean(linkTarget);
    const incidentId = linked ? Number(linkTarget) : 100 + accepting.id;

    setReports((current) =>
      current.map((report) =>
        report.id === accepting.id
          ? { ...report, state: "accepted", incidentId, linked }
          : report,
      ),
    );
    setNotice(
      linked
        ? t("resp.rep.noticeLinked", { ref: incidentRef(incidentId) })
        : t("resp.rep.noticeAccepted", { ref: incidentRef(incidentId) }),
    );
    setAccepting(null);
  }

  function openReject(report: Report) {
    setRejectReason(REJECT_REASONS[0]);
    setRejecting(report);
  }

  function rejectReport() {
    if (!rejecting) return;
    setReports((current) =>
      current.map((report) =>
        report.id === rejecting.id
          ? { ...report, state: "rejected", reasonKey: rejectReason }
          : report,
      ),
    );
    setNotice(
      t("resp.rep.noticeRejectedReason", {
        reason: t(`resp.rep.reason.${rejectReason}`),
      }),
    );
    setRejecting(null);
  }

  function openAsk(report: Report) {
    setAskMessage("");
    setAsking(report);
  }

  function askInfo() {
    if (!asking) return;
    const message = askMessage.trim() || t("resp.rep.askInfoDefault");

    setReports((current) =>
      current.map((report) =>
        report.id === asking.id
          ? { ...report, state: "info", infoMessage: message }
          : report,
      ),
    );
    setNotice(t("resp.rep.noticeInfo", { ref: sigRef(asking.id) }));
    setAsking(null);
    setAskMessage("");
  }

  return (
    <main className="rc-page">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.rep.eyebrow")}</p>
          <h1>{t("resp.rep.title")}</h1>
          <p className="rc-hero__lead">{t("resp.rep.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <i className="rc-chip__dot" aria-hidden="true" />
              {t("resp.rep.pendingCount", { count: counts.pending })}
            </span>
            <span className="rc-chip">
              {t("resp.rep.infoCount", { count: counts.info })}
            </span>
            <span className="rc-chip">
              {t("resp.rep.acceptedCount", { count: counts.accepted })}
            </span>
            <span className="rc-chip">
              {t("resp.rep.rejectedCount", { count: counts.rejected })}
            </span>
          </div>
        </div>
      </section>

      {notice && (
        <p className="rc-toast" role="status">
          {notice}
        </p>
      )}

      <div className="rc-tabs" role="group" aria-label={t("resp.rep.tabsAria")}>
        {(
          [
            { id: "pending", label: t("resp.rep.tabPending") },
            { id: "info", label: t("resp.rep.tabInfo") },
            { id: "accepted", label: t("resp.rep.tabAccepted") },
            { id: "rejected", label: t("resp.rep.tabRejected") },
            { id: "all", label: t("resp.rep.tabAll") },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={filter === tab.id}
            className={`rc-tab${filter === tab.id ? " is-active" : ""}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            {tab.id !== "all" && ` · ${counts[tab.id]}`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rc-empty">{t("resp.rep.empty")}</p>
      ) : (
        <div className="rc-grid rc-grid--split">
          {visible.map((report) => {
            const signal = SIGNALS[report.id] ?? FALLBACK_SIGNAL;
            const level = reliabilityLevel(signal.score);
            const duplicateOf = DUPLICATES[report.id];

            return (
              <WarningCard
                key={report.id}
                warning={report}
                className={`rc-report rc-report--${report.state}`}
                media={
                  <img
                    className="rc-report__photo"
                    src={reportPhoto(report.title)}
                    alt={t("resp.rep.photoAlt")}
                    loading="lazy"
                  />
                }
                status={{
                  label: t(`resp.rep.state.${report.state}`),
                  className: `rc-report__state rc-report__state--${report.state}`,
                  icon: <StateIcon state={report.state} />,
                }}
                metaExtra={
                  <span className="warning-card__meta-item rc-report__ref">
                    <RefIcon />
                    {sigRef(report.id)}
                  </span>
                }
                sourceLabelKey="resp.rep.sourceLabel"
                extra={
                  <div className="rc-report__signals">
                    <div className={`rc-reliability rc-reliability--${level}`}>
                      <span className="rc-reliability__label">
                        <span>
                          {t("resp.rep.reliability")} ·{" "}
                          {t(`resp.rep.reliability.${level}`)}
                        </span>
                        <span>{signal.score}%</span>
                      </span>
                      <span className="rc-reliability__track">
                        <span
                          className="rc-reliability__fill"
                          style={{ width: `${signal.score}%` }}
                        />
                      </span>
                      <span className="rc-reliability__label">
                        <span>
                          {t("resp.rep.corroborations", {
                            count: signal.corroborations,
                          })}
                        </span>
                      </span>
                    </div>

                    {duplicateOf && (
                      <span className="rc-badge rc-badge--high">
                        {t("resp.rep.duplicate", {
                          ref: sigRef(duplicateOf),
                        })}
                      </span>
                    )}
                  </div>
                }
                actions={
                  <>
                    {report.state === "info" && (
                      <p className="rc-report__reason">
                        {t("resp.rep.infoRequested")} · {report.infoMessage}
                      </p>
                    )}

                    {(report.state === "pending" ||
                      report.state === "info") && (
                      <div className="rc-report__actions">
                        <button
                          type="button"
                          className="rc-btn rc-btn--green rc-btn--small"
                          onClick={() => openAccept(report)}
                        >
                          {t("resp.rep.accept")}
                        </button>
                        <button
                          type="button"
                          className="rc-btn rc-btn--outline-danger rc-btn--small"
                          onClick={() => openReject(report)}
                        >
                          {t("resp.rep.reject")}
                        </button>
                        <button
                          type="button"
                          className="rc-btn rc-btn--soft rc-btn--small"
                          onClick={() => openAsk(report)}
                        >
                          {t("resp.rep.askInfo")}
                        </button>
                      </div>
                    )}

                    {report.state === "accepted" && (
                      <div className="rc-report__actions">
                        {report.linked && (
                          <span className="rc-badge">
                            {t("resp.rep.linkedTo", {
                              ref: incidentRef(report.incidentId),
                            })}
                          </span>
                        )}
                        <Link
                          className="rc-btn rc-btn--soft rc-btn--small"
                          to={`/responsable/incidents/${report.incidentId}`}
                          state={{
                            event: report.title,
                            severity: report.severity,
                            location: report.location,
                          }}
                        >
                          {t("resp.rep.openIncident")}
                        </Link>
                      </div>
                    )}

                    {report.state === "rejected" && report.reasonKey && (
                      <p className="rc-report__reason">
                        {t("resp.rep.rejectedReason", {
                          reason: t(`resp.rep.reason.${report.reasonKey}`),
                        })}
                      </p>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      {accepting && (
        <ConfirmDialog
          title={t("resp.rep.acceptTitle")}
          confirmLabel={t("resp.rep.acceptConfirm")}
          tone="green"
          onConfirm={acceptReport}
          onClose={() => setAccepting(null)}
        >
          <p>{t("resp.rep.acceptLead")}</p>

          <div className="rc-choice">
            <label className="rc-choice__option">
              <input
                type="radio"
                name="accept-mode"
                checked={acceptMode === "create"}
                onChange={() => setAcceptMode("create")}
              />
              <span>
                {t("resp.rep.acceptCreate")}
                <small>{t("resp.rep.acceptCreateHint")}</small>
              </span>
            </label>
            <label className="rc-choice__option">
              <input
                type="radio"
                name="accept-mode"
                checked={acceptMode === "link"}
                onChange={() => setAcceptMode("link")}
              />
              <span>
                {t("resp.rep.acceptLink")}
                <small>{t("resp.rep.acceptLinkHint")}</small>
              </span>
            </label>
          </div>

          {acceptMode === "link" && (
            <div className="rc-field">
              <label htmlFor="link-incident">
                {t("resp.rep.linkIncident")}
              </label>
              <select
                id="link-incident"
                value={linkTarget}
                onChange={(event) => setLinkTarget(event.target.value)}
              >
                {activeIncidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incidentRef(incident.id)} · {tc(incident.event)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </ConfirmDialog>
      )}

      {rejecting && (
        <ConfirmDialog
          title={t("resp.rep.rejectTitle")}
          confirmLabel={t("resp.rep.rejectConfirm")}
          tone="danger"
          onConfirm={rejectReport}
          onClose={() => setRejecting(null)}
        >
          <p>{t("resp.rep.rejectLead")}</p>

          <div className="rc-field">
            <label htmlFor="reject-reason">
              {t("resp.rep.rejectReasonLabel")}
            </label>
            <select
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            >
              {REJECT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {t(`resp.rep.reason.${reason}`)}
                </option>
              ))}
            </select>
          </div>
        </ConfirmDialog>
      )}

      {asking && (
        <ConfirmDialog
          title={t("resp.rep.askInfoTitle")}
          confirmLabel={t("resp.rep.askInfoSend")}
          onConfirm={askInfo}
          onClose={() => setAsking(null)}
        >
          <p>{t("resp.rep.askInfoLead")}</p>

          <div className="rc-field">
            <label htmlFor="info-message">
              {t("resp.rep.askInfoMessage")}
            </label>
            <textarea
              id="info-message"
              value={askMessage}
              placeholder={t("resp.rep.askInfoDefault")}
              onChange={(event) => setAskMessage(event.target.value)}
            />
          </div>
        </ConfirmDialog>
      )}
    </main>
  );
}

export default ReportValidation;

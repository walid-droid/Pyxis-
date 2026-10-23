import "./resp-crise.css";
import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useI18n } from "../../i18n";
import type { Severity } from "../../mockdata/warning";
import ConfirmDialog from "./ConfirmDialog";
import { tone } from "./utils";

const ZONES = [
  "Béjaïa",
  "Skikda",
  "Tizi Ouzou",
  "Alger",
  "Oran",
  "Mila",
  "Jijel",
  "Constantine",
];

const AUDIENCES = [
  { id: "citizens", labelKey: "resp.bc.audCitizens", reach: 128400 },
  { id: "teams", labelKey: "resp.bc.audTeams", reach: 640 },
  { id: "media", labelKey: "resp.bc.audMedia", reach: 45 },
  { id: "communes", labelKey: "resp.bc.audCommunes", reach: 154 },
];

const CHANNELS = [
  { id: "sms", labelKey: "resp.bc.chSms" },
  { id: "push", labelKey: "resp.bc.chPush" },
  { id: "radio", labelKey: "resp.bc.chRadio" },
];

const ALERT_TYPES = [
  { id: "fire", labelKey: "resp.bc.typeFire" },
  { id: "flood", labelKey: "resp.bc.typeFlood" },
  { id: "quake", labelKey: "resp.bc.typeQuake" },
  { id: "storm", labelKey: "resp.bc.typeStorm" },
  { id: "heat", labelKey: "resp.bc.typeHeat" },
  { id: "chemical", labelKey: "resp.bc.typeChemical" },
  { id: "other", labelKey: "resp.bc.typeOther" },
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;

const ALL_ZONES = "__all__";

type AlertStatus = "active" | "scheduled" | "lifted";

type HistoryAlert = {
  id: number;
  type: string;
  title?: string;
  titleKey?: string;
  message?: string;
  messageKey?: string;
  severity: Severity;
  zone: string;
  status: AlertStatus;
  date: string;
  reach: number;
};

const INITIAL_HISTORY: HistoryAlert[] = [
  {
    id: 1,
    type: "fire",
    titleKey: "resp.bc.h1",
    messageKey: "resp.bc.h1msg",
    severity: "Critical",
    zone: "Béjaïa",
    status: "active",
    date: "23/10 · 14:12",
    reach: 128400,
  },
  {
    id: 2,
    type: "flood",
    titleKey: "resp.bc.h2",
    messageKey: "resp.bc.h2msg",
    severity: "High",
    zone: "Skikda",
    status: "active",
    date: "23/10 · 11:40",
    reach: 92400,
  },
  {
    id: 3,
    type: "storm",
    titleKey: "resp.bc.h3",
    messageKey: "resp.bc.h3msg",
    severity: "Medium",
    zone: "Jijel",
    status: "scheduled",
    date: "23/10 · 18:00",
    reach: 43100,
  },
  {
    id: 4,
    type: "quake",
    titleKey: "resp.bc.h4",
    messageKey: "resp.bc.h4msg",
    severity: "High",
    zone: "Tizi Ouzou",
    status: "lifted",
    date: "22/10 · 09:15",
    reach: 76500,
  },
];

function formatDateTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·");
}

/** Horodatage courant au format « 23/10 · 14:12 ». */
function nowStamp(): string {
  return formatDateTime(new Date().toISOString());
}

/** Écran 5 — rédaction et diffusion d'une alerte officielle. */
function AlertBroadcast() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(ALERT_TYPES[0].id);
  const [severity, setSeverity] = useState<Severity>("High");
  const [zone, setZone] = useState(ZONES[0]);
  const [audiences, setAudiences] = useState<string[]>(["citizens"]);
  const [channels, setChannels] = useState<string[]>(["sms", "push"]);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [history, setHistory] = useState<HistoryAlert[]>(INITIAL_HISTORY);
  const [lifting, setLifting] = useState<HistoryAlert | null>(null);

  const reach = AUDIENCES.filter((audience) =>
    audiences.includes(audience.id),
  ).reduce((total, audience) => total + audience.reach, 0);

  const zoneLabel = zone === ALL_ZONES ? t("resp.bc.allTerritory") : zone;
  const typeLabel = t(
    ALERT_TYPES.find((item) => item.id === type)?.labelKey ??
      ALERT_TYPES[0].labelKey,
  );
  const scheduleLabel = formatDateTime(scheduledAt);

  function toggle(list: string[], id: string): string[] {
    return list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id];
  }

  function resetFeedback() {
    setNotice(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError(t("resp.bc.required"));
      return;
    }
    if (audiences.length === 0 || channels.length === 0) {
      setError(t("resp.bc.requiredTargets"));
      return;
    }
    if (mode === "schedule" && !scheduledAt) {
      setError(t("resp.bc.scheduleRequired"));
      return;
    }
    setError(null);
    setConfirming(true);
  }

  function confirmSend() {
    const count = reach.toLocaleString("fr-FR");
    const dateLabel = mode === "schedule" ? scheduleLabel : "—";
    const status: AlertStatus = mode === "schedule" ? "scheduled" : "active";
    const entry = {
      type,
      title,
      message,
      severity,
      zone,
      status,
      date: mode === "schedule" ? dateLabel : nowStamp(),
      reach,
    };

    if (editingId) {
      setHistory((current) =>
        current.map((alert) =>
          alert.id === editingId
            ? {
                ...alert,
                ...entry,
                titleKey: undefined,
                messageKey: undefined,
              }
            : alert,
        ),
      );
      setNotice(t("resp.bc.noticeUpdated", { count }));
    } else {
      setHistory((current) => [{ id: Date.now(), ...entry }, ...current]);
      setNotice(
        mode === "schedule"
          ? t("resp.bc.noticeScheduled", { date: dateLabel, count })
          : t("resp.bc.sent", { count }),
      );
    }

    setEditingId(null);
    setConfirming(false);
  }

  function startEdit(alert: HistoryAlert) {
    setEditingId(alert.id);
    setType(alert.type);
    setTitle(alert.titleKey ? t(alert.titleKey) : (alert.title ?? ""));
    setMessage(alert.messageKey ? t(alert.messageKey) : (alert.message ?? ""));
    setSeverity(alert.severity);
    setZone(alert.zone);
    setMode(alert.status === "scheduled" ? "schedule" : "now");
    setScheduledAt("");
    setNotice(null);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setNotice(null);
  }

  function confirmLift() {
    if (!lifting) return;
    const wasScheduled = lifting.status === "scheduled";
    setHistory((current) =>
      current.map((alert) =>
        alert.id === lifting.id ? { ...alert, status: "lifted" } : alert,
      ),
    );
    setNotice(
      wasScheduled ? t("resp.bc.noticeCancelled") : t("resp.bc.noticeLifted"),
    );
    setLifting(null);
  }

  return (
    <main className="rc-page">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.bc.eyebrow")}</p>
          <h1>{t("resp.bc.title")}</h1>
          <p className="rc-hero__lead">{t("resp.bc.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <i className="rc-chip__dot" aria-hidden="true" />
              {t("resp.bc.reachChip", {
                count: reach.toLocaleString("fr-FR"),
              })}
            </span>
            <span className="rc-chip">
              {t("resp.bc.zoneChip", { zone: zoneLabel })}
            </span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <Link className="rc-btn rc-btn--ghost" to="/responsable/journal">
            {t("resp.bc.history")}
          </Link>
        </div>
      </section>

      {notice && (
        <p className="rc-toast" role="status">
          {notice}
        </p>
      )}

      {error && (
        <p className="rc-toast rc-toast--warn" role="alert">
          {error}
        </p>
      )}

      <div className="rc-alert-layout">
        <form
          ref={formRef}
          className="rc-card rc-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("resp.bc.formTitle")}</h2>
            <span className="rc-card__hint">{t("resp.bc.step")}</span>
          </div>

          {editingId && (
            <div className="rc-edit-banner">
              <span>{t("resp.bc.editing", { title })}</span>
              <button
                type="button"
                className="rc-btn rc-btn--soft rc-btn--small"
                onClick={cancelEdit}
              >
                {t("resp.bc.cancelEdit")}
              </button>
            </div>
          )}

          <div className="rc-field">
            <label htmlFor="alert-title">{t("resp.bc.titleLabel")}</label>
            <input
              id="alert-title"
              value={title}
              maxLength={80}
              placeholder={t("resp.bc.titlePlaceholder")}
              onChange={(event) => {
                setTitle(event.target.value);
                resetFeedback();
              }}
            />
          </div>

          <div className="rc-field">
            <label htmlFor="alert-message">{t("resp.bc.messageLabel")}</label>
            <textarea
              id="alert-message"
              value={message}
              maxLength={400}
              placeholder={t("resp.bc.messagePlaceholder")}
              onChange={(event) => {
                setMessage(event.target.value);
                resetFeedback();
              }}
            />
          </div>

          <div className="rc-form__row">
            <div className="rc-field">
              <label htmlFor="alert-type">{t("resp.bc.typeLabel")}</label>
              <select
                id="alert-type"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  resetFeedback();
                }}
              >
                {ALERT_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(item.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="rc-field">
              <label htmlFor="alert-severity">
                {t("resp.bc.severityLabel")}
              </label>
              <select
                id="alert-severity"
                value={severity}
                onChange={(event) => {
                  setSeverity(event.target.value as Severity);
                  resetFeedback();
                }}
              >
                {SEVERITIES.map((level) => (
                  <option key={level} value={level}>
                    {t(`severity.${tone(level)}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rc-field">
            <label htmlFor="alert-zone">{t("resp.bc.zoneLabel")}</label>
            <select
              id="alert-zone"
              value={zone}
              onChange={(event) => {
                setZone(event.target.value);
                resetFeedback();
              }}
            >
              {ZONES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value={ALL_ZONES}>{t("resp.bc.allTerritory")}</option>
            </select>
          </div>

          <div className="rc-field">
            <span>{t("resp.bc.modeLabel")}</span>
            <div className="rc-checks">
              <label className="rc-check">
                <input
                  type="radio"
                  name="alert-mode"
                  checked={mode === "now"}
                  onChange={() => {
                    setMode("now");
                    resetFeedback();
                  }}
                />
                {t("resp.bc.modeNow")}
              </label>
              <label className="rc-check">
                <input
                  type="radio"
                  name="alert-mode"
                  checked={mode === "schedule"}
                  onChange={() => {
                    setMode("schedule");
                    resetFeedback();
                  }}
                />
                {t("resp.bc.modeSchedule")}
              </label>
            </div>
          </div>

          {mode === "schedule" && (
            <div className="rc-field">
              <label htmlFor="alert-schedule">
                {t("resp.bc.scheduleLabel")}
              </label>
              <input
                id="alert-schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => {
                  setScheduledAt(event.target.value);
                  resetFeedback();
                }}
              />
            </div>
          )}

          <div className="rc-field">
            <span>{t("resp.bc.audienceLabel")}</span>
            <div className="rc-checks">
              {AUDIENCES.map((audience) => (
                <label key={audience.id} className="rc-check">
                  <input
                    type="checkbox"
                    checked={audiences.includes(audience.id)}
                    onChange={() => {
                      setAudiences((current) => toggle(current, audience.id));
                      resetFeedback();
                    }}
                  />
                  {t(audience.labelKey)}
                </label>
              ))}
            </div>
          </div>

          <div className="rc-field">
            <span>{t("resp.bc.channelsLabel")}</span>
            <div className="rc-checks">
              {CHANNELS.map((channel) => (
                <label key={channel.id} className="rc-check">
                  <input
                    type="checkbox"
                    checked={channels.includes(channel.id)}
                    onChange={() => {
                      setChannels((current) => toggle(current, channel.id));
                      resetFeedback();
                    }}
                  />
                  {t(channel.labelKey)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="rc-btn rc-btn--primary">
            {mode === "schedule"
              ? t("resp.bc.scheduleAction")
              : editingId
                ? t("resp.bc.updateAction")
                : t("resp.bc.send")}
          </button>
        </form>
      </div>

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("resp.bc.historyTitle")}</h2>
          <span className="rc-card__hint">
            {t("resp.bc.historyHint", { count: history.length })}
          </span>
        </div>

        <ul className="rc-alerts">
          {history.map((alert) => (
            <li key={alert.id} className={`rc-alert rc-alert--${alert.status}`}>
              <div className="rc-alert__main">
                <div className="rc-alert__head">
                  <strong>
                    {alert.titleKey ? t(alert.titleKey) : alert.title}
                  </strong>
                  <span
                    className={`rc-badge rc-badge--${tone(alert.severity)}`}
                  >
                    {t(`severity.${tone(alert.severity)}`)}
                  </span>
                  <span className={`rc-badge rc-badge--${alert.status}`}>
                    {t(`resp.bc.${alert.status}`)}
                  </span>
                </div>

                <p>
                  {alert.messageKey ? t(alert.messageKey) : alert.message}
                </p>

                <div className="rc-alert__meta">
                  <span>
                    {alert.zone === ALL_ZONES
                      ? t("resp.bc.allTerritory")
                      : alert.zone}
                  </span>
                  <span>{alert.date}</span>
                  <span>
                    {t("resp.bc.reachChip", {
                      count: alert.reach.toLocaleString("fr-FR"),
                    })}
                  </span>
                </div>
              </div>

              <div className="rc-alert__actions">
                {alert.status !== "lifted" && (
                  <button
                    type="button"
                    className="rc-btn rc-btn--soft rc-btn--small"
                    onClick={() => startEdit(alert)}
                  >
                    {t("resp.bc.update")}
                  </button>
                )}
                {alert.status === "active" && (
                  <button
                    type="button"
                    className="rc-btn rc-btn--outline-danger rc-btn--small"
                    onClick={() => setLifting(alert)}
                  >
                    {t("resp.bc.lift")}
                  </button>
                )}
                {alert.status === "scheduled" && (
                  <button
                    type="button"
                    className="rc-btn rc-btn--outline-danger rc-btn--small"
                    onClick={() => setLifting(alert)}
                  >
                    {t("resp.bc.cancel")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {confirming && (
        <ConfirmDialog
          title={
            mode === "schedule"
              ? t("resp.bc.confirmScheduleTitle")
              : t("resp.bc.confirmTitle")
          }
          confirmLabel={
            mode === "schedule"
              ? t("resp.bc.confirmSchedule")
              : t("resp.bc.confirmSend")
          }
          tone="danger"
          onConfirm={confirmSend}
          onClose={() => setConfirming(false)}
        >
          <p>
            {mode === "schedule"
              ? t("resp.bc.confirmScheduleLead", {
                  date: scheduleLabel,
                  count: reach.toLocaleString("fr-FR"),
                })
              : t("resp.bc.confirmLead", {
                  count: reach.toLocaleString("fr-FR"),
                })}
          </p>

          <dl className="rc-facts">
            <div>
              <dt>{t("resp.bc.typeLabel")}</dt>
              <dd>{typeLabel}</dd>
            </div>
            <div>
              <dt>{t("resp.bc.severityLabel")}</dt>
              <dd>{t(`severity.${tone(severity)}`)}</dd>
            </div>
            <div>
              <dt>{t("resp.bc.zoneLabel")}</dt>
              <dd>{zoneLabel}</dd>
            </div>
            {mode === "schedule" && (
              <div>
                <dt>{t("resp.bc.scheduleLabel")}</dt>
                <dd>{scheduleLabel}</dd>
              </div>
            )}
          </dl>
        </ConfirmDialog>
      )}

      {lifting && (
        <ConfirmDialog
          title={
            lifting.status === "scheduled"
              ? t("resp.bc.cancelTitle")
              : t("resp.bc.liftTitle")
          }
          confirmLabel={
            lifting.status === "scheduled"
              ? t("resp.bc.cancelConfirm")
              : t("resp.bc.liftConfirm")
          }
          tone="danger"
          onConfirm={confirmLift}
          onClose={() => setLifting(null)}
        >
          <p>
            {lifting.status === "scheduled"
              ? t("resp.bc.cancelLead", {
                  title: lifting.titleKey
                    ? t(lifting.titleKey)
                    : (lifting.title ?? ""),
                })
              : t("resp.bc.liftLead", {
                  title: lifting.titleKey
                    ? t(lifting.titleKey)
                    : (lifting.title ?? ""),
                })}
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}

export default AlertBroadcast;

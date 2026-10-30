import "../command/resp-crise.css";
import "../organisme/organisme.css";
import "./authority.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import {
  loc,
  type Localized,
  type Severity,
} from "../organisme/organismeData";

type AlertType = "flood" | "weather" | "forest";
type AlertStatus = "proposed" | "validated" | "rejected" | "delegated";

type AuthorityAlert = {
  id: string;
  type: AlertType;
  title: Localized;
  zone: Localized;
  source: Localized;
  level: Severity;
  proposedAt: string;
  status: AlertStatus;
  delegatedTo?: string;
};

const ALERTS: AuthorityAlert[] = [
  {
    id: "aa1",
    type: "flood",
    title: {
      fr: "Crue de l'oued Soummam · seuil dépassé",
      ar: "فيضان واد سومام · تجاوز العتبة",
    },
    zone: { fr: "Akbou et communes aval", ar: "أقبو والبلديات السفلى" },
    source: { fr: "Prévisionniste · ANRH", ar: "المتنبئ · الوكالة الوطنية للموارد المائية" },
    level: "critical",
    proposedAt: "30/10/2026 · 08:50",
    status: "proposed",
  },
  {
    id: "aa2",
    type: "weather",
    title: {
      fr: "Pluies orageuses intenses",
      ar: "أمطار عاصفية غزيرة",
    },
    zone: { fr: "Béjaïa · littoral", ar: "بجاية · الساحل" },
    source: { fr: "Office national de météorologie", ar: "الديوان الوطني للأرصاد الجوية" },
    level: "high",
    proposedAt: "30/10/2026 · 06:10",
    status: "proposed",
  },
  {
    id: "aa3",
    type: "forest",
    title: {
      fr: "Risque très élevé · massif de Gouraya",
      ar: "خطر مرتفع جداً · غابة قورايا",
    },
    zone: { fr: "Béjaïa · Gouraya", ar: "بجاية · قورايا" },
    source: { fr: "Agent forestier", ar: "عون غابي" },
    level: "high",
    proposedAt: "30/10/2026 · 07:58",
    status: "proposed",
  },
  {
    id: "aa4",
    type: "flood",
    title: {
      fr: "Surveillance renforcée du barrage de Tichy Haf",
      ar: "مراقبة معززة لسد تيشي حاف",
    },
    zone: { fr: "Tichy · bassin versant", ar: "تيشي · الحوض" },
    source: { fr: "Prévisionniste · ANRH", ar: "المتنبئ · الوكالة الوطنية للموارد المائية" },
    level: "medium",
    proposedAt: "29/10/2026 · 17:30",
    status: "validated",
  },
  {
    id: "aa5",
    type: "weather",
    title: {
      fr: "Vents forts sur les crêtes",
      ar: "رياح قوية على القمم",
    },
    zone: { fr: "Massifs de Béjaïa", ar: "غابات بجاية" },
    source: { fr: "Office national de météorologie", ar: "الديوان الوطني للأرصاد الجوية" },
    level: "medium",
    proposedAt: "29/10/2026 · 12:00",
    status: "delegated",
    delegatedTo: "Capitaine S. Haddad",
  },
];

const DELEGATES = [
  "Capitaine S. Haddad",
  "Commandant R. Amrani",
  "Dr L. Meziane",
  "Mme H. Taleb",
];

/** S7 : validation des alertes par l'autorité ou son délégataire. */
export default function AuthorityAlertsPage() {
  const { t, lang } = useI18n();
  const [alerts, setAlerts] = useState<AuthorityAlert[]>(ALERTS);
  const [filter, setFilter] = useState<"all" | AlertType>("all");
  const [delegateFor, setDelegateFor] = useState<AuthorityAlert | null>(null);
  const [delegate, setDelegate] = useState(DELEGATES[0]);
  const [toast, setToast] = useState<string | null>(null);

  const visible = alerts.filter(
    (alert) => filter === "all" || alert.type === filter,
  );
  const proposed = alerts.filter((alert) => alert.status === "proposed").length;
  const validated = alerts.filter((alert) => alert.status === "validated").length;
  const delegated = alerts.filter((alert) => alert.status === "delegated").length;

  const setStatus = (id: string, status: AlertStatus, message: string, person?: string) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? { ...alert, status, delegatedTo: person ?? alert.delegatedTo }
          : alert,
      ),
    );
    setToast(message);
  };

  const confirmDelegate = () => {
    if (!delegateFor) return;
    setStatus(
      delegateFor.id,
      "delegated",
      t("authority.alerts.delegated"),
      delegate,
    );
    setDelegateFor(null);
  };

  return (
    <main className="rc-page rc-page--authority">
      <div className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("authority.alerts.eyebrow")}</p>
          <h1>{t("authority.alerts.title")}</h1>
          <p className="rc-hero__lead">{t("authority.alerts.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--critical" />
              {proposed} {t("authority.alerts.status.proposed").toLowerCase()}
            </span>
            <span className="rc-chip">{t("authority.alerts.rule")}</span>
          </div>
        </div>
      </div>

      {toast ? (
        <p className="au-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="stat-grid" aria-label={t("authority.alerts.title")}>
        <StatCard
          value={String(proposed)}
          label={t("authority.alerts.statProposed")}
          badge={t("authority.alerts.statProposedBadge")}
          badgeTone={proposed > 0 ? "warning" : "success"}
        />
        <StatCard
          value={String(validated)}
          label={t("authority.alerts.statValidated")}
          badge={t("authority.alerts.statValidatedBadge")}
          badgeTone="success"
        />
        <StatCard
          value={String(delegated)}
          label={t("authority.alerts.statDelegated")}
          badge={t("authority.alerts.statDelegatedBadge")}
          badgeTone="info"
        />
        <StatCard
          value={String(alerts.length)}
          label={t("authority.alerts.title")}
          badge={t("authority.alerts.eyebrow")}
          badgeTone="neutral"
        />
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("authority.alerts.title")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.common.all")}>
            {(["all", "flood", "weather", "forest"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${filter === value ? " is-active" : ""}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value === "all"
                  ? t("org.common.all")
                  : t(`authority.alerts.type.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="rc-card__lead">{t("authority.alerts.lead")}</p>

        {visible.length === 0 ? (
          <p className="rc-empty">{t("authority.alerts.empty")}</p>
        ) : (
          <ul className="org-alert-list">
            {visible.map((alert) => (
              <li key={alert.id} className="org-alert">
                <div className="org-alert__main">
                  <div className="org-alert__head">
                    <span className="rc-badge rc-badge--low">
                      {t(`authority.alerts.type.${alert.type}`)}
                    </span>
                    <span className={`rc-badge rc-badge--${alert.level}`}>
                      {t(`severity.${alert.level}`)}
                    </span>
                    <span
                      className={`rc-badge rc-badge--${
                        alert.status === "validated"
                          ? "low"
                          : alert.status === "rejected"
                            ? "critical"
                            : "medium"
                      }`}
                    >
                      {t(`authority.alerts.status.${alert.status}`)}
                    </span>
                  </div>
                  <h3 className="org-alert__title">{loc(lang, alert.title)}</h3>
                  <p className="org-alert__meta">
                    <span>{loc(lang, alert.zone)}</span>
                    <span>{loc(lang, alert.source)}</span>
                    <span>{alert.proposedAt}</span>
                    {alert.delegatedTo ? (
                      <span>
                        {t("authority.alerts.person")} : {alert.delegatedTo}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="org-alert__actions">
                  {alert.status === "proposed" ? (
                    <>
                      <button
                        type="button"
                        className="rc-btn rc-btn--primary rc-btn--small"
                        onClick={() =>
                          setStatus(
                            alert.id,
                            "validated",
                            t("authority.alerts.validated"),
                          )
                        }
                      >
                        {t("authority.alerts.validate")}
                      </button>
                      <button
                        type="button"
                        className="rc-btn rc-btn--ghost-danger rc-btn--small"
                        onClick={() =>
                          setStatus(
                            alert.id,
                            "rejected",
                            t("authority.alerts.rejected"),
                          )
                        }
                      >
                        {t("org.common.reject")}
                      </button>
                      <button
                        type="button"
                        className="rc-btn rc-btn--soft rc-btn--small"
                        onClick={() => {
                          setDelegate(DELEGATES[0]);
                          setDelegateFor(alert);
                        }}
                      >
                        {t("authority.alerts.delegate")}
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="rc-card__foot">
          <p className="au-note">{t("authority.alerts.rule")}</p>
        </div>
      </article>

      {delegateFor ? (
        <Modal
          title={t("authority.alerts.delegationTitle")}
          onClose={() => setDelegateFor(null)}
        >
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              confirmDelegate();
            }}
          >
            <p className="org-muted">{t("authority.alerts.delegationLead")}</p>
            <div className="rc-field">
              <label htmlFor="delegate-person">{t("authority.alerts.person")} *</label>
              <select
                id="delegate-person"
                value={delegate}
                onChange={(event) => setDelegate(event.target.value)}
              >
                {DELEGATES.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            <p className="au-note">{t("authority.alerts.delegationNote")}</p>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setDelegateFor(null)}>
                {t("org.common.cancel")}
              </button>
              <button type="submit" className="rc-btn rc-btn--primary">
                {t("authority.alerts.delegate")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  MISSIONS,
  loc,
  type Localized,
  type Mission,
  type MissionPriority,
  type MissionStatus,
} from "./organismeData";

const AGENTS: Localized[] = [
  { fr: "Capitaine S. Haddad", ar: "النقيب س. حداد" },
  { fr: "Agent Y. Meziane", ar: "العون ي. مزيان" },
  { fr: "Sgt B. Saidi", ar: "الرقيب ب. سعيدي" },
  { fr: "Dr S. Kaci", ar: "الدكتورة س. قاسي" },
  { fr: "Cne N. Cherif", ar: "النقيب ن. شريف" },
];

type ModalState =
  | { kind: "create" }
  | { kind: "report"; id: string }
  | null;

function priorityTone(priority: MissionPriority): string {
  if (priority === "high") return "critical";
  if (priority === "medium") return "medium";
  return "low";
}

function statusTone(status: MissionStatus): string {
  if (status === "active") return "deployed";
  if (status === "done") return "resolved";
  return "standby";
}

/** Missions : création, affectation, exécution et compte rendu hors ligne. */
export default function MissionsPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [filter, setFilter] = useState<"all" | MissionStatus>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [unit, setUnit] = useState("");
  const [priority, setPriority] = useState<MissionPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportPosition, setReportPosition] = useState("");
  const [reportPhotos, setReportPhotos] = useState(0);
  const [offline, setOffline] = useState(false);

  const active = modal?.kind === "report"
    ? missions.find((mission) => mission.id === modal.id)
    : null;
  const visible = missions.filter(
    (mission) => filter === "all" || mission.status === filter,
  );

  const openCreate = () => {
    setTitle("");
    setPlace("");
    setUnit(loc(lang, persona.org));
    setPriority("medium");
    setAssignee(loc(lang, persona.name));
    setModal({ kind: "create" });
  };

  const openReport = (mission: Mission) => {
    setReportText(mission.report ? loc(lang, mission.report) : "");
    setReportPosition(mission.reportPosition ?? "");
    setReportPhotos(mission.reportPhotos ?? 0);
    setOffline(false);
    setModal({ kind: "report", id: mission.id });
  };

  const createMission = () => {
    if (title.trim().length < 4) return;
    const created: Mission = {
      id: `m-${Date.now()}`,
      ref: `MIS-2026-${312 + missions.length}`,
      title: { fr: title, ar: title },
      place: { fr: place || "Béjaïa", ar: place || "بجاية" },
      unit: { fr: unit || loc(lang, persona.org), ar: unit || loc(lang, persona.org) },
      assignee: assignee ? { fr: assignee, ar: assignee } : null,
      priority,
      status: assignee ? "active" : "todo",
      due: "30/10/2026 · 18:00",
    };
    setMissions((current) => [created, ...current]);
    setModal(null);
    setToast(t("org.missions.created"));
  };

  const updateMission = (id: string, patch: Partial<Mission>) => {
    setMissions((current) =>
      current.map((mission) => (mission.id === id ? { ...mission, ...patch } : mission)),
    );
  };

  const saveReport = () => {
    if (!active || reportText.trim().length < 8) return;
    updateMission(active.id, {
      status: "done",
      report: { fr: reportText, ar: reportText },
      reportPosition,
      reportPhotos,
      offline,
    });
    setModal(null);
    setToast(
      t(offline ? "org.missions.queued" : "org.missions.reported"),
    );
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.missions.eyebrow")}
        title={t("org.missions.title")}
        lead={t("org.missions.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {missions.filter((mission) => mission.status === "active").length}{" "}
              {t("org.missions.status.active").toLowerCase()}
            </span>
            <span className="rc-chip">{t("org.missions.availableOffline")}</span>
          </>
        }
        aside={
          <button type="button" className="rc-btn rc-btn--primary" onClick={openCreate}>
            + {t("org.missions.new")}
          </button>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.missions.title")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.missions.filter")}>
            {(["all", "todo", "active", "done"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${filter === value ? " is-active" : ""}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value === "all"
                  ? t("org.common.all")
                  : t(`org.missions.status.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="rc-card__lead">{t("org.missions.lead")}</p>

        {visible.length === 0 ? (
          <p className="rc-empty">{t("org.missions.empty")}</p>
        ) : (
          <ul className="org-mission-list">
            {visible.map((mission) => (
              <li key={mission.id} className={`org-mission org-mission--${mission.status}`}>
                <div className="org-mission__main">
                  <div className="org-mission__head">
                    <span className="org-cell__ref">{mission.ref}</span>
                    <span className={`rc-badge rc-badge--${priorityTone(mission.priority)}`}>
                      {t(`org.missions.priority.${mission.priority}`)}
                    </span>
                    {mission.offline ? (
                      <span className="rc-badge rc-badge--standby">
                        {t("org.common.offline")}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="org-mission__title">{loc(lang, mission.title)}</h3>
                  <p className="org-mission__meta">
                    <span>{loc(lang, mission.place)}</span>
                    <span>{loc(lang, mission.unit)}</span>
                    <span>{t("org.missions.table.due")} · {mission.due}</span>
                  </p>
                  {mission.report ? (
                    <p className="org-mission__report">{loc(lang, mission.report)}</p>
                  ) : null}
                  {mission.reportPosition || mission.reportPhotos ? (
                    <p className="org-mission__meta">
                      {mission.reportPosition ? (
                        <span>
                          {t("org.missions.positionField")} ·{" "}
                          {mission.reportPosition}
                        </span>
                      ) : null}
                      {mission.reportPhotos ? (
                        <span>
                          {t("org.missions.reportPhotos")} ·{" "}
                          {mission.reportPhotos}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>

                <div className="org-mission__side">
                  <span className={`rc-badge rc-badge--${statusTone(mission.status)}`}>
                    {t(`org.missions.status.${mission.status}`)}
                  </span>

                  {mission.status === "todo" ? (
                    <>
                      <select
                        className="org-select"
                        aria-label={t("org.missions.assigneeField")}
                        value={mission.assignee ? loc(lang, mission.assignee) : ""}
                        onChange={(event) =>
                          updateMission(mission.id, {
                            assignee: event.target.value
                              ? { fr: event.target.value, ar: event.target.value }
                              : null,
                            status: event.target.value ? "active" : "todo",
                          })
                        }
                      >
                        <option value="">{t("org.missions.unassigned")}</option>
                        {AGENTS.map((agent) => (
                          <option key={agent.fr} value={loc(lang, agent)}>
                            {loc(lang, agent)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rc-btn rc-btn--soft rc-btn--small"
                        onClick={() => {
                          updateMission(mission.id, {
                            assignee: { fr: loc(lang, persona.name), ar: loc(lang, persona.name) },
                            status: "active",
                          });
                          setToast(t("org.missions.assigned"));
                        }}
                      >
                        {t("org.common.take")}
                      </button>
                    </>
                  ) : null}

                  {mission.status === "active" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--primary rc-btn--small"
                      onClick={() => openReport(mission)}
                    >
                      {t("org.common.report")}
                    </button>
                  ) : null}

                  {mission.status === "done" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--soft rc-btn--small"
                      onClick={() => openReport(mission)}
                    >
                      {t("org.reports.detail")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      {modal?.kind === "create" ? (
        <Modal title={t("org.missions.createTitle")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              createMission();
            }}
          >
            <p className="org-muted">{t("org.missions.createLead")}</p>
            <div className="rc-field">
              <label htmlFor="mission-title">{t("org.missions.titleField")} *</label>
              <input
                id="mission-title"
                value={title}
                placeholder={t("org.missions.titlePlaceholder")}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={4}
              />
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="mission-place">{t("org.common.place")}</label>
                <input
                  id="mission-place"
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                />
              </div>
              <div className="rc-field">
                <label htmlFor="mission-unit">{t("org.missions.table.unit")}</label>
                <input
                  id="mission-unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                />
              </div>
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="mission-priority">{t("org.common.priority")}</label>
                <select
                  id="mission-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as MissionPriority)
                  }
                >
                  <option value="low">{t("org.missions.priority.low")}</option>
                  <option value="medium">{t("org.missions.priority.medium")}</option>
                  <option value="high">{t("org.missions.priority.high")}</option>
                </select>
              </div>
              <div className="rc-field">
                <label htmlFor="mission-assignee">{t("org.missions.assigneeField")}</label>
                <select
                  id="mission-assignee"
                  value={assignee}
                  onChange={(event) => setAssignee(event.target.value)}
                >
                  <option value="">{t("org.missions.unassigned")}</option>
                  {AGENTS.map((agent) => (
                    <option key={agent.fr} value={loc(lang, agent)}>
                      {loc(lang, agent)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button type="submit" className="rc-btn rc-btn--primary" disabled={title.trim().length < 4}>
                {t("org.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal?.kind === "report" && active ? (
        <Modal title={t("org.missions.reportTitle")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              saveReport();
            }}
          >
            <p className="org-muted">{t("org.missions.reportLead")}</p>
            <div className="rc-field">
              <label htmlFor="mission-report">{t("org.missions.reportField")} *</label>
              <textarea
                id="mission-report"
                value={reportText}
                placeholder={t("org.missions.reportPlaceholder")}
                onChange={(event) => setReportText(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="mission-position">
                  {t("org.missions.positionField")}
                </label>
                <input
                  id="mission-position"
                  value={reportPosition}
                  placeholder={t("org.missions.positionPlaceholder")}
                  onChange={(event) => setReportPosition(event.target.value)}
                />
              </div>
              <div className="rc-field">
                <label>{t("org.missions.reportPhotos")}</label>
                <div className="org-actions">
                  <span className="org-meta">
                    {reportPhotos} {t("org.missions.reportPhotos").toLowerCase()}
                  </span>
                  <button
                    type="button"
                    className="rc-btn rc-btn--soft rc-btn--small"
                    onClick={() => {
                      setReportPhotos((current) => current + 1);
                      setToast(t("org.missions.photoAdded"));
                    }}
                  >
                    + {t("org.missions.addPhoto")}
                  </button>
                </div>
              </div>
            </div>
            <label className="rc-check">
              <input
                type="checkbox"
                checked={offline}
                onChange={(event) => setOffline(event.target.checked)}
              />
              {t("org.missions.offlineField")}
            </label>
            <p className="org-field-hint">{t("org.missions.offlineHint")}</p>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={reportText.trim().length < 8}
              >
                {t("org.common.send")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

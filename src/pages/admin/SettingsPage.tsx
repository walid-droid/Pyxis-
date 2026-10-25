import "./admin.css";
import { useState } from "react";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  type AdminModule,
  type EventType,
  type SeverityLevel,
} from "./adminData";
import {
  AdminBadge,
  AdminField,
  AdminHero,
  AdminIcon,
  AdminModal,
  AdminModalActions,
  AdminToast,
  AdminToggle,
} from "./AdminUI";

type Tab = "severity" | "events" | "modules" | "general";

const CHANNELS = ["push", "sms", "radio", "email"] as const;
type Channel = (typeof CHANNELS)[number];

type SeverityDraft = Omit<SeverityLevel, "id">;
type EventDraft = Omit<EventType, "id">;

const LEVEL_TONE: Record<AdminModule["level"], "green" | "blue" | "slate"> = {
  core: "green",
  standard: "blue",
  optional: "slate",
};

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Gravité                                                             */
/* ------------------------------------------------------------------ */

function SeverityModal({
  level,
  onSave,
  onClose,
}: {
  level?: SeverityLevel;
  onSave: (draft: SeverityDraft) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(level?.name ?? "");
  const [nameAr, setNameAr] = useState(level?.nameAr ?? "");
  const [color, setColor] = useState(level?.color ?? "#16704a");
  const [min, setMin] = useState(level?.min ?? 1);
  const [max, setMax] = useState(level?.max ?? 25);
  const [slaMinutes, setSlaMinutes] = useState(level?.slaMinutes ?? 120);
  const [description, setDescription] = useState(level?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    level?.descriptionAr ?? "",
  );
  const [channels, setChannels] = useState<string[]>(
    level?.channels ?? ["push"],
  );
  const [active, setActive] = useState(level?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  function toggleChannel(channel: Channel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError(t("admin.common.required"));
      return;
    }
    const scoreMin = Number(min);
    const scoreMax = Number(max);
    if (
      !Number.isInteger(scoreMin) ||
      !Number.isInteger(scoreMax) ||
      scoreMin < 0 ||
      scoreMax > 100 ||
      scoreMin > scoreMax
    ) {
      setError(t("admin.set.scoreError"));
      return;
    }
    onSave({
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      color,
      min: scoreMin,
      max: scoreMax,
      slaMinutes: Math.max(0, Number(slaMinutes) || 0),
      channels,
      active,
      description: description.trim(),
      descriptionAr: descriptionAr.trim() || description.trim(),
    });
  }

  return (
    <AdminModal
      title={t(
        level ? "admin.set.editSeverityTitle" : "admin.set.addSeverityTitle",
      )}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">
        {t(
          level ? "admin.set.editSeverityLead" : "admin.set.addSeverityLead",
        )}
      </p>

      <div className="ad-modal__form">
        <div className="ad-form-grid">
          <AdminField label={t("admin.set.name")} htmlFor="sev-name">
            <input
              id="sev-name"
              value={name}
              placeholder="ex. Élevée"
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.set.nameAr")} htmlFor="sev-name-ar">
            <input
              id="sev-name-ar"
              value={nameAr}
              placeholder="مثال: مرتفعة"
              dir="rtl"
              onChange={(event) => setNameAr(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.set.color")} htmlFor="sev-color">
            <input
              id="sev-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.set.sla")} htmlFor="sev-sla">
            <input
              id="sev-sla"
              type="number"
              min="0"
              value={slaMinutes}
              onChange={(event) =>
                setSlaMinutes(Number(event.target.value))
              }
            />
          </AdminField>

          <AdminField
            label={t("admin.set.min")}
            hint={t("admin.set.scoreHint")}
            htmlFor="sev-min"
          >
            <input
              id="sev-min"
              type="number"
              min="0"
              max="100"
              step="1"
              value={min}
              onChange={(event) => setMin(Number(event.target.value))}
            />
          </AdminField>

          <AdminField
            label={t("admin.set.max")}
            hint={t("admin.set.scoreHint")}
            htmlFor="sev-max"
          >
            <input
              id="sev-max"
              type="number"
              min="0"
              max="100"
              step="1"
              value={max}
              onChange={(event) => setMax(Number(event.target.value))}
            />
          </AdminField>

          <div className="is-full">
            <AdminField
              label={t("admin.set.description")}
              htmlFor="sev-description"
            >
              <textarea
                id="sev-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </AdminField>
          </div>

          <div className="is-full">
            <AdminField
              label={t("admin.set.descriptionAr")}
              htmlFor="sev-description-ar"
            >
              <textarea
                id="sev-description-ar"
                value={descriptionAr}
                dir="rtl"
                onChange={(event) => setDescriptionAr(event.target.value)}
              />
            </AdminField>
          </div>
        </div>

        <div>
          <p className="ad-section-title">{t("admin.set.channels")}</p>
          <div className="ad-channels">
            {CHANNELS.map((channel) => {
              const on = channels.includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  className={`ad-channel${on ? " is-on" : ""}`}
                  aria-pressed={on}
                  onClick={() => toggleChannel(channel)}
                >
                  {t(`admin.set.channel.${channel}`)}
                </button>
              );
            })}
          </div>
          <p className="ad-field__hint">{t("admin.set.channelsHint")}</p>
        </div>

        <AdminToggle
          checked={active}
          onChange={setActive}
          label={t("admin.common.active")}
        />

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.set.saveSeverity")}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Type d'événement                                                    */
/* ------------------------------------------------------------------ */

function EventModal({
  event,
  severities,
  modules,
  onSave,
  onClose,
}: {
  event?: EventType;
  severities: SeverityLevel[];
  modules: AdminModule[];
  onSave: (draft: EventDraft) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(event?.name ?? "");
  const [nameAr, setNameAr] = useState(event?.nameAr ?? "");
  const [severity, setSeverity] = useState(
    event?.severity ?? severities[0]?.id ?? "",
  );
  const [moduleId, setModuleId] = useState(
    event?.moduleId ?? modules[0]?.id ?? "",
  );
  const [active, setActive] = useState(event?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim()) {
      setError(t("admin.common.required"));
      return;
    }
    onSave({
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      severity,
      moduleId,
      active,
      incidents: event?.incidents ?? 0,
    });
  }

  return (
    <AdminModal
      title={t(
        event ? "admin.set.editEventTitle" : "admin.set.addEventTitle",
      )}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">
        {t(event ? "admin.set.editEventLead" : "admin.set.addEventLead")}
      </p>

      <div className="ad-modal__form">
        <div className="ad-form-grid">
          <AdminField label={t("admin.set.eventName")} htmlFor="evt-name">
            <input
              id="evt-name"
              value={name}
              placeholder="ex. Inondation"
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.set.eventNameAr")}
            htmlFor="evt-name-ar"
          >
            <input
              id="evt-name-ar"
              value={nameAr}
              placeholder="مثال: فيضان"
              dir="rtl"
              onChange={(event) => setNameAr(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.set.defaultSeverity")}
            htmlFor="evt-severity"
          >
            <select
              id="evt-severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
            >
              {severities.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.set.moduleLabel")}
            htmlFor="evt-module"
          >
            <select
              id="evt-module"
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {t(module.nameKey)}
                </option>
              ))}
            </select>
          </AdminField>
        </div>

        <AdminToggle
          checked={active}
          onChange={setActive}
          label={t("admin.common.active")}
        />

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.set.saveEvent")}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Général                                                             */
/* ------------------------------------------------------------------ */

type GeneralState = {
  platformName: string;
  defaultLanguage: "fr" | "ar" | "en";
  timezone: string;
  sessionTimeout: number;
  maintenance: boolean;
  publicRegistration: boolean;
  aiAssistant: boolean;
  notifEmail: boolean;
  notifSms: boolean;
  notifPush: boolean;
  mfaRequired: boolean;
  passwordPolicy: boolean;
};

const INITIAL_GENERAL: GeneralState = {
  platformName: "CADM",
  defaultLanguage: "fr",
  timezone: "Africa/Algiers",
  sessionTimeout: 30,
  maintenance: false,
  publicRegistration: true,
  aiAssistant: true,
  notifEmail: true,
  notifSms: true,
  notifPush: false,
  mfaRequired: true,
  passwordPolicy: true,
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function SettingsPage() {
  const { t } = useI18n();
  const {
    state,
    addSeverity,
    updateSeverity,
    addEventType,
    updateEventType,
    toggleModule,
  } = useAdmin();

  const [tab, setTab] = useState<Tab>("severity");
  const [severityModal, setSeverityModal] = useState<{
    levelId?: string;
  } | null>(null);
  const [eventModal, setEventModal] = useState<{
    eventId?: string;
  } | null>(null);
  const [general, setGeneral] = useState<GeneralState>(INITIAL_GENERAL);
  const [disableLevel, setDisableLevel] = useState<SeverityLevel | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const editingLevel = severityModal?.levelId
    ? state.severities.find((level) => level.id === severityModal.levelId)
    : undefined;
  const editingEvent = eventModal?.eventId
    ? state.eventTypes.find((type) => type.id === eventModal.eventId)
    : undefined;

  const enabledModules = state.modules.filter((module) => module.enabled);
  const activeSeverities = state.severities.filter((level) => level.active);
  const activeEvents = state.eventTypes.filter((type) => type.active);
  const platformModules = state.modules.filter(
    (module) => module.scope === "platform",
  );
  const siteModules = state.modules.filter(
    (module) => module.scope === "site",
  );

  function severityUsage(levelId: string): number {
    return state.eventTypes.filter((type) => type.severity === levelId).length;
  }

  function toggleSeverity(level: SeverityLevel) {
    if (level.active && severityUsage(level.id) > 0) {
      setDisableLevel(level);
      return;
    }
    updateSeverity(level.id, { active: !level.active });
    setNotice(
      t(
        level.active
          ? "admin.set.severityDisabled"
          : "admin.set.severityEnabled",
      ),
    );
  }

  function confirmDisableSeverity() {
    if (!disableLevel) return;
    updateSeverity(disableLevel.id, { active: false });
    setNotice(t("admin.set.severityDisabled"));
    setDisableLevel(null);
  }

  const TABS: { id: Tab; labelKey: string; icon: "alert" | "activity" | "layers" | "settings" }[] = [
    { id: "severity", labelKey: "admin.set.tabSeverity", icon: "alert" },
    { id: "events", labelKey: "admin.set.tabEvents", icon: "activity" },
    { id: "modules", labelKey: "admin.set.tabModules", icon: "layers" },
    { id: "general", labelKey: "admin.set.tabGeneral", icon: "settings" },
  ];

  function handleSeverity(draft: SeverityDraft) {
    if (editingLevel) {
      updateSeverity(editingLevel.id, draft);
      setNotice(t("admin.set.severityUpdated"));
    } else {
      addSeverity(draft);
      setNotice(t("admin.set.severityCreated"));
    }
    setSeverityModal(null);
  }

  function handleEvent(draft: EventDraft) {
    if (editingEvent) {
      updateEventType(editingEvent.id, draft);
      setNotice(t("admin.set.eventUpdated"));
    } else {
      addEventType(draft);
      setNotice(t("admin.set.eventCreated"));
    }
    setEventModal(null);
  }

  function setAllModules(enabled: boolean) {
    state.modules
      .filter((module) => module.enabled !== enabled)
      .forEach((module) => toggleModule(module.id));
    setNotice(
      t(
        enabled
          ? "admin.set.moduleEnabledNotice"
          : "admin.set.moduleDisabledNotice",
      ),
    );
  }

  function exportConfig() {
    downloadFile(
      "cadm-configuration.json",
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          general,
          severities: state.severities,
          eventTypes: state.eventTypes,
          modules: state.modules,
        },
        null,
        2,
      ),
      "application/json",
    );
    setNotice(t("admin.set.exportDone"));
  }

  function patchGeneral(patch: Partial<GeneralState>) {
    setGeneral((current) => ({ ...current, ...patch }));
  }

  function renderModules(modules: AdminModule[]) {
    return (
      <div className="ad-module-grid">
        {modules.map((module) => (
          <article
            key={module.id}
            className={`ad-module${module.enabled ? "" : " is-off"}`}
          >
            <div className="ad-module__head">
              <span className="ad-module__index">{module.index}</span>
              <span className="ad-module__title">
                <strong>{t(module.nameKey)}</strong>
                <AdminBadge tone={LEVEL_TONE[module.level]}>
                  {t(`admin.set.moduleLevel.${module.level}`)}
                </AdminBadge>
              </span>
              <AdminToggle
                checked={module.enabled}
                onChange={() => toggleModule(module.id)}
              />
            </div>

            <p>{t(module.descriptionKey)}</p>

            <div className="ad-module__foot">
              <span className="ad-muted">
                {t("admin.set.moduleRoles", {
                  count: module.roles,
                })}
              </span>
              <AdminBadge tone={module.enabled ? "green" : "slate"}>
                {t(
                  module.enabled
                    ? "admin.common.active"
                    : "admin.common.inactive",
                )}
              </AdminBadge>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.set.eyebrow")}
        title={t("admin.set.title")}
        lead={t("admin.set.lead")}
        chips={
          <>
            <span className="ad-chip">
              <AdminIcon name="layers" />
              {t("admin.set.severityChip", {
                count: activeSeverities.length,
              })}
            </span>
            <span className="ad-chip">
              <AdminIcon name="activity" />
              {t("admin.set.modulesActive", {
                enabled: enabledModules.length,
                total: state.modules.length,
              })}
            </span>
            <span className="ad-chip ad-chip--ok">
              <AdminIcon name="check" />
              {t("admin.set.eventsChip", { count: activeEvents.length })}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={exportConfig}
          >
            <AdminIcon name="download" />
            {t("admin.set.exportConfig")}
          </button>
        }
      />

      {notice && <AdminToast message={notice} />}

      <div className="ad-tabs" role="tablist" aria-label={t("admin.set.eyebrow")}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`ad-tab${tab === item.id ? " is-active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <AdminIcon name={item.icon} />
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {tab === "severity" && (
        <section className="ad-card">
          <div className="ad-card__head">
            <div>
              <h2 className="ad-card__title">
                {t("admin.set.severityTitle")}
              </h2>
              <p className="ad-card__lead">
                {t("admin.set.severityLead")}
              </p>
            </div>
            <button
              type="button"
              className="ad-btn ad-btn--green ad-btn--small"
              onClick={() => setSeverityModal({})}
            >
              <AdminIcon name="plus" />
              {t("admin.set.addSeverity")}
            </button>
          </div>

          <p className="ad-inline-note">
            <AdminIcon name="shield" />
            {t("admin.set.severityChannelsNote")}
          </p>

          <div className="ad-severity-list">
            {state.severities.map((level) => {
              const usage = severityUsage(level.id);
              return (
                <article
                  key={level.id}
                  className={`ad-severity${level.active ? "" : " is-off"}`}
                >
                  <span
                    className="ad-severity__swatch"
                    style={{ background: level.color }}
                    aria-hidden="true"
                  />

                  <span className="ad-severity__main">
                    <strong>{level.name}</strong>
                    <span>{level.description}</span>
                    <span className="ad-channels">
                      {level.channels.length === 0 ? (
                        <span className="ad-channel">
                          {t("admin.set.noChannels")}
                        </span>
                      ) : (
                        level.channels.map((channel) => (
                          <span key={channel} className="ad-channel is-on">
                            {t(`admin.set.channel.${channel}`)}
                          </span>
                        ))
                      )}
                    </span>
                  </span>

                  <span className="ad-severity__side">
                    <span className="ad-severity__metrics">
                      <AdminBadge tone="slate">
                        {t("admin.set.scoreRange", {
                          min: level.min,
                          max: level.max,
                        })}
                      </AdminBadge>
                      <AdminBadge tone="blue">
                        {t("admin.set.slaUnit", {
                          count: level.slaMinutes,
                        })}
                      </AdminBadge>
                      <AdminBadge tone={usage > 0 ? "amber" : "slate"}>
                        {t(
                          usage === 1
                            ? "admin.set.severityUsageOne"
                            : "admin.set.severityUsage",
                          { count: usage },
                        )}
                      </AdminBadge>
                      <AdminBadge tone={level.active ? "green" : "slate"}>
                        {t(
                          level.active
                            ? "admin.common.active"
                            : "admin.set.inactiveLabel",
                        )}
                      </AdminBadge>
                    </span>

                    <span className="ad-actions">
                      <AdminToggle
                        checked={level.active}
                        onChange={() => toggleSeverity(level)}
                      />
                      <button
                        type="button"
                        className="ad-icon-btn"
                        title={t("admin.common.edit")}
                        aria-label={t("admin.common.edit")}
                        onClick={() => setSeverityModal({ levelId: level.id })}
                      >
                        <AdminIcon name="edit" />
                      </button>
                    </span>
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "events" && (
        <section className="ad-card">
          <div className="ad-card__head">
            <div>
              <h2 className="ad-card__title">
                {t("admin.set.eventsTitle")}
              </h2>
              <p className="ad-card__lead">{t("admin.set.eventsLead")}</p>
            </div>
            <button
              type="button"
              className="ad-btn ad-btn--green ad-btn--small"
              onClick={() => setEventModal({})}
            >
              <AdminIcon name="plus" />
              {t("admin.set.addEvent")}
            </button>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>{t("admin.set.colEvent")}</th>
                  <th>{t("admin.set.colDefaultSeverity")}</th>
                  <th>{t("admin.set.colModule")}</th>
                  <th>{t("admin.set.colIncidents")}</th>
                  <th>{t("admin.set.colStatus")}</th>
                  <th>{t("admin.set.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {state.eventTypes.map((event) => {
                  const severity = state.severities.find(
                    (level) => level.id === event.severity,
                  );
                  const module = state.modules.find(
                    (item) => item.id === event.moduleId,
                  );
                  return (
                    <tr key={event.id}>
                      <td>
                        <span className="ad-territory">
                          <strong>{event.name}</strong>
                          <span>{event.nameAr}</span>
                        </span>
                      </td>
                      <td>
                        {severity ? (
                          <AdminBadge
                            tone={
                              severity.id === "critical"
                                ? "red"
                                : severity.id === "high"
                                  ? "amber"
                                  : severity.id === "medium"
                                    ? "blue"
                                    : "green"
                            }
                          >
                            <span
                              className="ad-dot"
                              style={{ background: severity.color }}
                            />
                            {severity.name}
                          </AdminBadge>
                        ) : (
                          <span className="ad-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className="ad-muted">
                          {module ? t(module.nameKey) : "—"}
                        </span>
                      </td>
                      <td className="ad-table__num">{event.incidents}</td>
                      <td>
                        <AdminToggle
                          checked={event.active}
                          onChange={(next) =>
                            updateEventType(event.id, { active: next })
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ad-icon-btn"
                          title={t("admin.common.edit")}
                          aria-label={t("admin.common.edit")}
                          onClick={() =>
                            setEventModal({ eventId: event.id })
                          }
                        >
                          <AdminIcon name="edit" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "modules" && (
        <section className="ad-card">
          <div className="ad-card__head">
            <div>
              <h2 className="ad-card__title">
                {t("admin.set.modulesTitle")}
              </h2>
              <p className="ad-card__lead">{t("admin.set.modulesLead")}</p>
              <p className="ad-card__hint">
                {t("admin.set.modulesActive", {
                  enabled: enabledModules.length,
                  total: state.modules.length,
                })}
              </p>
            </div>
            <span className="ad-actions">
              <button
                type="button"
                className="ad-btn ad-btn--soft ad-btn--small"
                onClick={() => setAllModules(true)}
              >
                <AdminIcon name="check" />
                {t("admin.set.enableAll")}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--soft ad-btn--small"
                onClick={() => setAllModules(false)}
              >
                <AdminIcon name="close" />
                {t("admin.set.disableAll")}
              </button>
            </span>
          </div>

          <div className="ad-module-group">
            <div className="ad-module-group__head">
              <h3>{t("admin.set.platformModulesTitle")}</h3>
              <span>
                {t("admin.set.moduleGroupCount", {
                  enabled: platformModules.filter((module) => module.enabled)
                    .length,
                  total: platformModules.length,
                })}
              </span>
            </div>
            {renderModules(platformModules)}
          </div>

          <div className="ad-module-group">
            <div className="ad-module-group__head">
              <h3>{t("admin.set.siteModulesTitle")}</h3>
              <span>
                {t("admin.set.moduleGroupCount", {
                  enabled: siteModules.filter((module) => module.enabled)
                    .length,
                  total: siteModules.length,
                })}
              </span>
            </div>
            <p className="ad-card__lead">{t("admin.set.siteModulesLead")}</p>
            {renderModules(siteModules)}
          </div>
        </section>
      )}

      {tab === "general" && (
        <div className="ad-settings-grid">
          <div className="ad-stack">
            <section className="ad-card">
              <div className="ad-card__head">
                <div>
                  <h2 className="ad-card__title">
                    {t("admin.set.generalTitle")}
                  </h2>
                  <p className="ad-card__lead">
                    {t("admin.set.generalLead")}
                  </p>
                </div>
                <AdminIcon name="settings" />
              </div>

              <div className="ad-form-grid">
                <AdminField
                  label={t("admin.set.platformName")}
                  htmlFor="set-platform"
                >
                  <input
                    id="set-platform"
                    value={general.platformName}
                    onChange={(event) =>
                      patchGeneral({ platformName: event.target.value })
                    }
                  />
                </AdminField>

                <AdminField
                  label={t("admin.set.defaultLanguage")}
                  htmlFor="set-language"
                >
                  <select
                    id="set-language"
                    value={general.defaultLanguage}
                    onChange={(event) =>
                      patchGeneral({
                        defaultLanguage: event.target
                          .value as GeneralState["defaultLanguage"],
                      })
                    }
                  >
                    <option value="fr">
                      {t("admin.set.language.fr")}
                    </option>
                    <option value="ar">
                      {t("admin.set.language.ar")}
                    </option>
                    <option value="en">
                      {t("admin.set.language.en")}
                    </option>
                  </select>
                </AdminField>

                <AdminField
                  label={t("admin.set.timezone")}
                  htmlFor="set-timezone"
                >
                  <select
                    id="set-timezone"
                    value={general.timezone}
                    onChange={(event) =>
                      patchGeneral({ timezone: event.target.value })
                    }
                  >
                    <option value="Africa/Algiers">Africa/Algiers</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                  </select>
                </AdminField>

                <AdminField
                  label={t("admin.set.sessionTimeout")}
                  htmlFor="set-timeout"
                >
                  <select
                    id="set-timeout"
                    value={general.sessionTimeout}
                    onChange={(event) =>
                      patchGeneral({
                        sessionTimeout: Number(event.target.value),
                      })
                    }
                  >
                    {[15, 30, 60, 120].map((value) => (
                      <option key={value} value={value}>
                        {t("admin.set.timeoutUnit", { count: value })}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>

              <p className="ad-field__hint">
                {t("admin.set.generalHint")}
              </p>

              <div className="ad-stack" style={{ gap: 12, marginTop: 8 }}>
                <AdminToggle
                  checked={general.maintenance}
                  onChange={(next) => patchGeneral({ maintenance: next })}
                  label={t("admin.set.maintenance")}
                />
                <p className="ad-field__hint">
                  {t("admin.set.maintenanceHint")}
                </p>

                <AdminToggle
                  checked={general.publicRegistration}
                  onChange={(next) =>
                    patchGeneral({ publicRegistration: next })
                  }
                  label={t("admin.set.publicRegistration")}
                />
                <p className="ad-field__hint">
                  {t("admin.set.publicRegistrationHint")}
                </p>

                <AdminToggle
                  checked={general.aiAssistant}
                  onChange={(next) => patchGeneral({ aiAssistant: next })}
                  label={t("admin.set.aiAssistant")}
                />
                <p className="ad-field__hint">
                  {t("admin.set.aiAssistantHint")}
                </p>
              </div>

              <div className="ad-modal__actions">
                <button
                  type="button"
                  className="ad-btn ad-btn--green"
                  onClick={() => setNotice(t("admin.set.saved"))}
                >
                  <AdminIcon name="check" />
                  {t("admin.set.saveSettings")}
                </button>
              </div>
            </section>

            <section className="ad-card ad-danger-zone">
              <div className="ad-card__head">
                <div>
                  <h2 className="ad-card__title">
                    {t("admin.set.dangerTitle")}
                  </h2>
                  <p className="ad-card__lead">
                    {t("admin.set.dangerLead")}
                  </p>
                </div>
                <AdminIcon name="database" />
              </div>

              <button
                type="button"
                className="ad-btn ad-btn--outline"
                onClick={exportConfig}
              >
                <AdminIcon name="download" />
                {t("admin.set.exportConfig")}
              </button>
            </section>
          </div>

          <div className="ad-stack">
            <section className="ad-card">
              <div className="ad-card__head">
                <div>
                  <h2 className="ad-card__title">
                    {t("admin.set.notificationsTitle")}
                  </h2>
                  <p className="ad-card__lead">
                    {t("admin.set.notificationsLead")}
                  </p>
                </div>
                <AdminIcon name="mail" />
              </div>

              <div className="ad-stack" style={{ gap: 12 }}>
                <AdminToggle
                  checked={general.notifEmail}
                  onChange={(next) => patchGeneral({ notifEmail: next })}
                  label={t("admin.set.notifEmail")}
                />
                <AdminToggle
                  checked={general.notifSms}
                  onChange={(next) => patchGeneral({ notifSms: next })}
                  label={t("admin.set.notifSms")}
                />
                <AdminToggle
                  checked={general.notifPush}
                  onChange={(next) => patchGeneral({ notifPush: next })}
                  label={t("admin.set.notifPush")}
                />
              </div>
            </section>

            <section className="ad-card">
              <div className="ad-card__head">
                <div>
                  <h2 className="ad-card__title">
                    {t("admin.set.securityTitle")}
                  </h2>
                  <p className="ad-card__lead">
                    {t("admin.set.securityLead")}
                  </p>
                </div>
                <AdminIcon name="shield" />
              </div>

              <div className="ad-stack" style={{ gap: 12 }}>
                <AdminToggle
                  checked={general.mfaRequired}
                  onChange={(next) =>
                    patchGeneral({ mfaRequired: next })
                  }
                  label={t("admin.set.mfaRequired")}
                />
                <p className="ad-field__hint">
                  {t("admin.set.mfaRequiredHint")}
                </p>

                <AdminToggle
                  checked={general.passwordPolicy}
                  onChange={(next) =>
                    patchGeneral({ passwordPolicy: next })
                  }
                  label={t("admin.set.passwordPolicy")}
                />
                <p className="ad-field__hint">
                  {t("admin.set.passwordPolicyHint")}
                </p>
              </div>

              <div className="ad-detail-facts">
                <span className="ad-fact">
                  <span>{t("admin.set.auditRetention")}</span>
                  <strong>{t("admin.set.auditRetentionValue")}</strong>
                </span>
              </div>
              <p className="ad-field__hint">
                {t("admin.set.retentionHint")}
              </p>
            </section>
          </div>
        </div>
      )}

      {severityModal !== null && (
        <SeverityModal
          level={editingLevel}
          onSave={handleSeverity}
          onClose={() => setSeverityModal(null)}
        />
      )}

      {eventModal !== null && (
        <EventModal
          event={editingEvent}
          severities={state.severities}
          modules={state.modules}
          onSave={handleEvent}
          onClose={() => setEventModal(null)}
        />
      )}

      {disableLevel && (
        <AdminModal
          title={t("admin.set.disableSeverityTitle")}
          onClose={() => setDisableLevel(null)}
        >
          <p className="ad-modal__warning">
            {t(
              severityUsage(disableLevel.id) === 1
                ? "admin.set.disableSeverityLeadOne"
                : "admin.set.disableSeverityLead",
              {
                name: disableLevel.name,
                count: severityUsage(disableLevel.id),
              },
            )}
          </p>
          <p className="ad-field__hint">
            {t("admin.set.disableSeverityHint")}
          </p>
          <div className="ad-modal__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={() => setDisableLevel(null)}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--danger"
              onClick={confirmDisableSeverity}
            >
              {t("admin.set.disableSeverityConfirm")}
            </button>
          </div>
        </AdminModal>
      )}
    </main>
  );
}

export default SettingsPage;

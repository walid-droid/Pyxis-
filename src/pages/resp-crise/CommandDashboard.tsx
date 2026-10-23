import "./resp-crise.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import {
  countAssignedTeams,
  INITIAL_ASSIGNMENTS,
} from "../../mockdata/assignments";
import { mockIncidents, type Incident } from "../../mockdata/incident";
import { resolveCoords } from "../../mockdata/locations";
import { mockTeams } from "../../mockdata/teams";
import { mockWarnings } from "../../mockdata/warning";
import BadgeIcon from "./BadgeIcon";
import CrisisMap, { type MapPin } from "./CrisisMap";
import { tone } from "./utils";

type Level = "low" | "medium" | "high" | "critical";

type FeedType =
  | "operation"
  | "report"
  | "alert"
  | "reinforcement"
  | "containment";

type FeedEntry = {
  id: number;
  time: string;
  type: FeedType;
  textKey: string;
  incidentId: number;
  action?: boolean;
};

const FEED: FeedEntry[] = [
  {
    id: 1,
    time: "14:38",
    type: "operation",
    textKey: "resp.feed.1",
    incidentId: 1,
  },
  {
    id: 2,
    time: "14:21",
    type: "report",
    textKey: "resp.feed.2",
    incidentId: 24,
  },
  {
    id: 3,
    time: "14:05",
    type: "alert",
    textKey: "resp.feed.3",
    incidentId: 1,
  },
  {
    id: 4,
    time: "13:47",
    type: "reinforcement",
    textKey: "resp.feed.4",
    incidentId: 2,
    action: true,
  },
  {
    id: 5,
    time: "13:12",
    type: "containment",
    textKey: "resp.feed.5",
    incidentId: 4,
  },
];

const LEVEL_RANK: Record<Level, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const SEVERITY_LEVEL: Record<Incident["severity"], Level> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Critical: "critical",
};

const SEVERITY_ORDER: Incident["severity"][] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

type SeverityFilter = "all" | Incident["severity"];

const SEVERITY_FILTERS: { id: SeverityFilter; labelKey: string }[] = [
  { id: "all", labelKey: "resp.dash.filterAll" },
  { id: "Critical", labelKey: "severity.critical" },
  { id: "High", labelKey: "severity.high" },
  { id: "Medium", labelKey: "severity.medium" },
  { id: "Low", labelKey: "severity.low" },
];

type WilayaLevel = {
  name: string;
  level: Level;
  openCount: number;
};

/** "Béjaïa, Gouraya" → "Béjaïa". */
function cityOf(location: string): string {
  return location.split(",")[0].trim();
}

/** Référence affichable d'un incident : INC-024. */
function incidentRef(incidentId: number): string {
  return `INC-${String(incidentId).padStart(3, "0")}`;
}

/** Classement national : niveau d'alerte par wilaya, du plus grave au plus calme. */
const WILAYA_LEVELS: WilayaLevel[] = (() => {
  const byWilaya = new Map<string, WilayaLevel>();

  for (const incident of mockIncidents) {
    const name = cityOf(incident.location);
    const entry = byWilaya.get(name) ?? {
      name,
      level: "low" as Level,
      openCount: 0,
    };

    if (incident.status !== "Resolved") {
      entry.openCount += 1;
      const next = SEVERITY_LEVEL[incident.severity];
      if (LEVEL_RANK[next] > LEVEL_RANK[entry.level]) {
        entry.level = next;
      }
    }

    byWilaya.set(name, entry);
  }

  return Array.from(byWilaya.values()).sort(
    (a, b) =>
      LEVEL_RANK[b.level] - LEVEL_RANK[a.level] ||
      b.openCount - a.openCount ||
      a.name.localeCompare(b.name, "fr"),
  );
})();

const DEFAULT_WILAYA = WILAYA_LEVELS[0]?.name ?? "Béjaïa";

function FeedIcon({ type }: { type: FeedType }) {
  const common = {
    className: "rc-feed__glyph",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (type) {
    case "alert":
      return (
        <svg {...common}>
          <path d="m3 11 18-5v12L3 14v-3Z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case "report":
      return (
        <svg {...common}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z" />
          <path d="M4 22v-7" />
        </svg>
      );
    case "reinforcement":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
    case "containment":
      return (
        <svg {...common}>
          <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
  }
}

function ClockGlyph() {
  return (
    <svg
      className="rc-inline-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function TeamGlyph() {
  return (
    <svg
      className="rc-inline-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg
      className="rc-inline-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/** Écran 1 — vue d'ensemble du commandement. */
function CommandDashboard() {
  const { t, tc } = useI18n();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilter>("all");
  const [wilaya, setWilaya] = useState(DEFAULT_WILAYA);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<number | null>(
    null,
  );
  const [replied, setReplied] = useState(false);

  const activeIncidents = mockIncidents.filter(
    (incident) =>
      incident.status === "Reported" || incident.status === "Responding",
  );
  const deployedTeams = mockTeams.filter((team) => team.status === "Deployed");
  const pendingReports = mockWarnings.filter(
    (warning) => warning.verification === "unverified",
  );

  const sortedActiveIncidents = [...activeIncidents].sort(
    (a, b) =>
      LEVEL_RANK[SEVERITY_LEVEL[b.severity]] -
        LEVEL_RANK[SEVERITY_LEVEL[a.severity]] || a.id - b.id,
  );
  const visibleIncidents =
    severityFilter === "all"
      ? sortedActiveIncidents
      : sortedActiveIncidents.filter(
          (incident) => incident.severity === severityFilter,
        );

  const selectedWilaya =
    WILAYA_LEVELS.find((item) => item.name === wilaya) ?? WILAYA_LEVELS[0];
  const selectedLevel = selectedWilaya?.level ?? "low";
  const wilayaTeams = deployedTeams.filter(
    (team) => cityOf(team.location) === selectedWilaya?.name,
  );

  const plural = (count: number, oneKey: string, manyKey: string) =>
    t(count === 1 ? oneKey : manyKey, { count });

  const formatElapsed = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) {
      return t("common.durationM", { minutes: rest });
    }
    if (rest === 0) {
      return t("common.durationH", { hours });
    }
    return t("common.durationHM", {
      hours,
      minutes: String(rest).padStart(2, "0"),
    });
  };

  const goToIncidents = (next: SeverityFilter) => {
    setSeverityFilter(next);
    setHoveredIncidentId(null);
    window.requestAnimationFrame(() => {
      document
        .getElementById("dash-incidents")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const mapPins: MapPin[] = visibleIncidents.map((incident) => ({
    id: String(incident.id),
    position: resolveCoords(incident.location),
    title: `${incidentRef(incident.id)} · ${tc(incident.event)}`,
    subtitle: `${t(`severity.${tone(incident.severity)}`)} · ${t(
      `resp.st.${tone(incident.status)}`,
    )} · ${tc(incident.location)}`,
    tone: "incident",
    severity: incident.severity,
    highlighted: incident.id === hoveredIncidentId,
    href: `/responsable/incidents/${incident.id}`,
  }));

  return (
    <main className="rc-page rc-dash">
      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.dash.eyebrow")}</p>
          <h1>{t("resp.dash.title")}</h1>
          <p className="rc-hero__lead">{t("resp.dash.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              {t("resp.dash.updated")} 14:38
            </span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <Link className="rc-btn rc-btn--primary" to="/responsable/diffusion">
            {t("resp.dash.broadcast")}
          </Link>
          <Link className="rc-btn rc-btn--ghost" to="/responsable/chaine">
            {t("resp.dash.chain")}
          </Link>
        </div>
      </section>

      <div className="rc-grid rc-grid--stats">
        <StatCard
          tone="incident"
          value={activeIncidents.length}
          label={t("resp.dash.activeIncidents")}
          onClick={() => goToIncidents("all")}
        />
        <StatCard
          tone="ongoing"
          value={deployedTeams.length}
          label={t("resp.dash.deployedTeams")}
          onClick={() => navigate("/responsable/ressources")}
        />
        <StatCard
          tone="unverified"
          value={pendingReports.length}
          label={t("resp.dash.pendingReports")}
          badge={t("resp.dash.pendingBadge")}
          onClick={() => navigate("/responsable/signalements")}
        />
        <StatCard
          tone="high"
          value={
            activeIncidents.filter(
              (incident) => incident.severity === "Critical",
            ).length
          }
          label={t("resp.dash.criticalIncidents")}
          onClick={() => goToIncidents("Critical")}
        />
      </div>

      <div className="rc-grid rc-grid--main">
        <div className="rc-stack">
          <section className="rc-card rc-dash-map">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.dash.mapTitle")}</h2>
              <span className="rc-card__hint">{t("resp.dash.mapHint")}</span>
            </div>
            <CrisisMap
              pins={mapPins}
              variant="mini"
              interactive={false}
              onPinHover={(pinId) =>
                setHoveredIncidentId(pinId === null ? null : Number(pinId))
              }
            />
            <div
              className="rc-map-legend"
              role="group"
              aria-label={t("resp.dash.mapLegend")}
            >
              <span className="rc-map-legend__label">
                {t("resp.dash.mapLegend")}
              </span>
              {SEVERITY_ORDER.map((severity) => (
                <span key={severity} className="rc-map-legend__item">
                  <i
                    className={`rc-map-legend__dot rc-map-legend__dot--${tone(
                      severity,
                    )}`}
                    aria-hidden="true"
                  />
                  {t(`severity.${tone(severity)}`)}
                </span>
              ))}
            </div>
          </section>

          <section className="rc-card rc-dash-incidents" id="dash-incidents">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.dash.incidentsTitle")}</h2>
              <span className="rc-card__hint">
                {t("resp.dash.incidentsCount", {
                  count: visibleIncidents.length,
                })}
              </span>
            </div>

            <div
              className="rc-tabs rc-dash-filters"
              role="group"
              aria-label={t("resp.dash.filterSeverity")}
            >
              {SEVERITY_FILTERS.map((item) => {
                const count =
                  item.id === "all"
                    ? activeIncidents.length
                    : activeIncidents.filter(
                        (incident) => incident.severity === item.id,
                      ).length;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`rc-tab${
                      severityFilter === item.id ? " is-active" : ""
                    }`}
                    aria-pressed={severityFilter === item.id}
                    onClick={() => {
                      setSeverityFilter(item.id);
                      setHoveredIncidentId(null);
                    }}
                  >
                    {item.id !== "all" && <BadgeIcon tone={tone(item.id)} />}
                    {t(item.labelKey)} ({count})
                  </button>
                );
              })}
            </div>

            {visibleIncidents.length === 0 ? (
              <p className="rc-empty rc-empty--spaced">
                {t("resp.dash.noIncidents")}
              </p>
            ) : (
              <ul className="rc-list">
                {visibleIncidents.map((incident) => {
                  const assigned = countAssignedTeams(incident.id);
                  const assignedLabel =
                    assigned === 0
                      ? t("resp.dash.noTeams")
                      : plural(
                          assigned,
                          "resp.dash.assignedTeamsOne",
                          "resp.dash.assignedTeams",
                        );

                  return (
                    <li
                      key={incident.id}
                      className={
                        hoveredIncidentId === incident.id
                          ? "is-highlighted"
                          : undefined
                      }
                    >
                      <Link
                        className="rc-item rc-incident"
                        to={`/responsable/incidents/${incident.id}`}
                        onMouseEnter={() =>
                          setHoveredIncidentId(incident.id)
                        }
                        onMouseLeave={() => setHoveredIncidentId(null)}
                        onFocus={() => setHoveredIncidentId(incident.id)}
                        onBlur={() => setHoveredIncidentId(null)}
                      >
                        <div className="rc-item__body">
                          <div className="rc-incident__head">
                            <span className="rc-incident__ref">
                              {incidentRef(incident.id)}
                            </span>
                            <p className="rc-item__title">
                              {tc(incident.event)}
                            </p>
                          </div>
                          <div className="rc-item__meta">
                            <span
                              className={`rc-badge rc-badge--${tone(
                                incident.severity,
                              )}`}
                            >
                              <BadgeIcon tone={tone(incident.severity)} />
                              {t(`severity.${tone(incident.severity)}`)}
                            </span>
                            <span
                              className={`rc-badge rc-badge--${tone(
                                incident.status,
                              )}`}
                            >
                              <BadgeIcon tone={tone(incident.status)} />
                              {t(`resp.st.${tone(incident.status)}`)}
                            </span>
                            <span className="rc-incident__place">
                              {tc(incident.location)}
                            </span>
                            <span className="rc-incident__detail">
                              <ClockGlyph />
                              {t("resp.dash.since", {
                                duration: formatElapsed(
                                  incident.ageMinutes ?? 0,
                                ),
                              })}
                            </span>
                            <span className="rc-incident__detail">
                              <TeamGlyph />
                              {assignedLabel}
                            </span>
                          </div>
                        </div>
                        <span className="rc-item__arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="rc-card__foot">
              <Link className="rc-link" to="/responsable/signalements">
                {t("resp.dash.validateReports")}
              </Link>
            </div>
          </section>
        </div>

        <div className="rc-stack">
          <section className="rc-card rc-alert-board">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.dash.levelTitle")}</h2>
              <span className="rc-card__hint">{t("resp.dash.levelHint")}</span>
            </div>

            <div
              className="rc-alert-board__chips"
              role="group"
              aria-label={t("resp.dash.levelTitle")}
            >
              {WILAYA_LEVELS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`rc-alert-chip${
                    wilaya === item.name ? " is-active" : ""
                  }`}
                  aria-pressed={wilaya === item.name}
                  aria-label={`${tc(item.name)} · ${t(
                    `resp.dash.level.${item.level}`,
                  )} · ${plural(
                    item.openCount,
                    "resp.dash.levelIncidentsOne",
                    "resp.dash.levelIncidents",
                  )}`}
                  onClick={() => setWilaya(item.name)}
                >
                  <span className="rc-alert-chip__name">{tc(item.name)}</span>
                  <span className={`rc-badge rc-badge--${item.level}`}>
                    <BadgeIcon tone={item.level} />
                    {t(`resp.dash.level.${item.level}`)}
                  </span>
                </button>
              ))}
            </div>

            <div className="rc-alert-board__detail" aria-live="polite">
              <p className="rc-alert-board__note">
                <strong>{selectedWilaya ? tc(selectedWilaya.name) : ""}</strong>{" "}
                · {t(`resp.dash.levelNote.${selectedLevel}`)}
              </p>
              <div className="rc-level__stats">
                <span>
                  {plural(
                    selectedWilaya?.openCount ?? 0,
                    "resp.dash.levelIncidentsOne",
                    "resp.dash.levelIncidents",
                  )}
                </span>
                <span>
                  {plural(
                    wilayaTeams.length,
                    "resp.dash.levelTeamsOne",
                    "resp.dash.levelTeams",
                  )}
                </span>
              </div>
            </div>
          </section>

          <section className="rc-card rc-dash-feed">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.dash.feedTitle")}</h2>
              <span className="rc-card__hint">{t("resp.dash.feedHint")}</span>
            </div>
            <ol className="rc-feed">
              {FEED.map((entry) => (
                <li
                  key={entry.id}
                  className={`rc-feed__item${
                    entry.action ? " is-attention" : ""
                  }`}
                >
                  <Link
                    className="rc-feed__link"
                    to={`/responsable/incidents/${entry.incidentId}`}
                  >
                    <span
                      className={`rc-feed__icon rc-feed__icon--${entry.type}`}
                      aria-hidden="true"
                    >
                      <FeedIcon type={entry.type} />
                    </span>
                    <span className="rc-feed__content">
                      <time className="rc-feed__time">{entry.time}</time>
                      {entry.action && (
                        <span className="rc-feed__tag">
                          {t("resp.feed.actionRequired")}
                        </span>
                      )}
                      <span className="rc-feed__text">
                        {t(entry.textKey)}
                      </span>
                    </span>
                  </Link>

                  {entry.action &&
                    (replied ? (
                      <span className="rc-feed__done" role="status">
                        <CheckGlyph />
                        {t("resp.feed.replied")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="rc-btn rc-btn--small rc-btn--danger rc-feed__reply"
                        onClick={() => setReplied(true)}
                      >
                        {t("resp.feed.reply")}
                      </button>
                    ))}
                </li>
              ))}
            </ol>
          </section>

          <section className="rc-card rc-dash-teams">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.dash.teamsTitle")}</h2>
              <Link className="rc-link" to="/responsable/ressources">
                {t("resp.dash.allTeams")}
              </Link>
            </div>
            <ul className="rc-list rc-list--compact">
              {deployedTeams.map((team) => {
                const incident = mockIncidents.find(
                  (item) => item.id === INITIAL_ASSIGNMENTS[team.id],
                );

                return (
                  <li key={team.id} className="rc-item rc-item--static">
                    <div className="rc-item__body">
                      <div className="rc-team__head">
                        <p className="rc-item__title">{tc(team.name)}</p>
                        <span
                          className={`rc-badge rc-badge--${tone(
                            team.status,
                          )}`}
                        >
                          <BadgeIcon tone={tone(team.status)} />
                          {t(`resp.st.${tone(team.status)}`)}
                        </span>
                      </div>
                      <div className="rc-item__meta">
                        <span>{tc(team.location)}</span>
                        <span>
                          {t("resp.res.membersCount", {
                            count: team.members,
                          })}
                        </span>
                      </div>
                      {incident ? (
                        <Link
                          className="rc-team__incident"
                          to={`/responsable/incidents/${incident.id}`}
                        >
                          <span className="rc-team__ref">
                            {incidentRef(incident.id)}
                          </span>
                          <span>{tc(incident.event)}</span>
                        </Link>
                      ) : (
                        <span className="rc-team__unassigned">
                          {t("resp.dash.noAssignment")}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

export default CommandDashboard;

import "./resp-crise.css";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { mockIncidents, type Incident } from "../../mockdata/incident";
import { resolveCoords } from "../../mockdata/locations";
import { generateSafetyData } from "../../mockdata/safety";
import { mockTeams, type Team } from "../../mockdata/teams";
import { mockWarnings } from "../../mockdata/warning";
import BadgeIcon from "./BadgeIcon";
import ConfirmDialog from "./ConfirmDialog";
import CrisisMap, { type MapPin } from "./CrisisMap";
import { tone } from "./utils";

type StepKind = "alert" | "team" | "decision" | "communication";

type Step = {
  id: number;
  time: string;
  key?: string;
  text?: string;
  author?: string;
  authorKey?: string;
  kind: StepKind;
  status?: Incident["status"];
  fromStatus?: Incident["status"];
  level?: EscLevel;
  name?: string;
  team?: string;
  reason?: string;
};

const BASE_TIMELINE: Step[] = [
  {
    id: 1,
    time: "13:58",
    key: "resp.inc.tl.1",
    authorKey: "resp.inc.author.ops",
    kind: "alert",
  },
  {
    id: 2,
    time: "14:04",
    key: "resp.inc.tl.2",
    authorKey: "resp.inc.author.alpha",
    kind: "team",
  },
  {
    id: 3,
    time: "14:11",
    key: "resp.inc.tl.3",
    authorKey: "resp.inc.author.civil",
    kind: "decision",
  },
  {
    id: 4,
    time: "14:26",
    key: "resp.inc.tl.4",
    authorKey: "resp.inc.author.commander",
    kind: "communication",
  },
];

const SEVERITY_LADDER: Incident["severity"][] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const STATUSES: Incident["status"][] = [
  "Reported",
  "Responding",
  "Contained",
  "Resolved",
];

const ESC_LEVELS = ["regional", "inter", "national"] as const;
type EscLevel = (typeof ESC_LEVELS)[number];

/** Heure d'ouverture de la fiche de démonstration (cf. bloc « Fiche incident »). */
const DEMO_OPENED_MINUTES = 13 * 60 + 56;

function formatClock(totalMinutes: number): string {
  const minutesInDay = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(minutesInDay / 60);
  const minutes = minutesInDay % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const COMMANDERS = [
  "R. Amrani",
  "S. Kaci",
  "N. Belkacem",
  "Cdt. A. Bensalem",
  "Cne. S. Haddad",
];

const RESOURCE_TYPES = [
  "Fire",
  "Rescue",
  "Medical",
  "Police",
  "Logistics",
] as const;

const REINFORCE_URGENCIES = ["routine", "urgent", "critical"] as const;
type ReinforceUrgency = (typeof REINFORCE_URGENCIES)[number];

type ReinforcementRequest = {
  id: number;
  time: string;
  type: (typeof RESOURCE_TYPES)[number];
  count: number;
  urgency: ReinforceUrgency;
  status: "pending";
};

type NewStep = Omit<Step, "id" | "time" | "author"> & { author?: string };

function groupResources(teams: Team[]) {
  return RESOURCE_TYPES.map((type) => ({
    type,
    teams: teams.filter((team) => team.type === type),
  })).filter((resource) => resource.teams.length > 0);
}

function TimelineIcon({ kind }: { kind: StepKind }) {
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
      {kind === "alert" && (
        <>
          <path d="m10.29 3.86-8.1 14.14A2 2 0 0 0 3.9 21h16.2a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      )}
      {kind === "team" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {kind === "decision" && (
        <>
          <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}
      {kind === "communication" && (
        <>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </>
      )}
    </svg>
  );
}

function ActionReason({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="rc-field">
      <label htmlFor={id}>{t("resp.inc.reasonLabel")}</label>
      <textarea
        id={id}
        rows={3}
        required
        maxLength={280}
        value={value}
        placeholder={t("resp.inc.reasonPlaceholder")}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Écran 2 — détail et pilotage d'un incident (réinitialisé par incident). */
function IncidentDetail({ id }: { id?: string }) {
  const { t, tc } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  // Un signalement accepté ouvre un incident créé à la volée (transmis par la
  // file de validation) ; les incidents de démonstration viennent du mock.
  const created = location.state as {
    event?: string;
    severity?: Incident["severity"];
    location?: string;
  } | null;

  const found = mockIncidents.find((item) => String(item.id) === id);
  const incident: Incident =
    found ??
    (created?.event
      ? {
          id: Number(id),
          event: created.event,
          severity: created.severity ?? "Medium",
          location: created.location ?? "—",
          status: "Reported",
        }
      : mockIncidents[0]);

  const [status, setStatus] = useState<Incident["status"]>(incident.status);
  const [severity, setSeverity] = useState<Incident["severity"]>(
    incident.severity,
  );
  const [commander, setCommander] = useState("R. Amrani");
  const [steps, setSteps] = useState<Step[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [clockMinutes, setClockMinutes] = useState(
    DEMO_OPENED_MINUTES + (incident.ageMinutes ?? 0),
  );

  // Équipes : on part des unités présentes sur la commune, puis on pilote
  // l'affectation localement.
  const city = incident.location.split(",")[0].trim();
  const localTeams = mockTeams.filter(
    (team) => team.location.split(",")[0].trim() === city,
  );
  const initialTeams =
    localTeams.length > 0 ? localTeams.slice(0, 3) : mockTeams.slice(0, 3);

  const [teamIds, setTeamIds] = useState<number[]>(
    initialTeams.map((team) => team.id),
  );
  const [teamPick, setTeamPick] = useState("");

  const [escalating, setEscalating] = useState(false);
  const [escLevel, setEscLevel] = useState<EscLevel>("regional");
  const [transferring, setTransferring] = useState(false);
  const [transferStage, setTransferStage] = useState<"choose" | "pending">(
    "choose",
  );
  const [transferTo, setTransferTo] = useState("S. Kaci");
  const [statusChange, setStatusChange] = useState<Incident["status"] | null>(
    null,
  );
  const [closing, setClosing] = useState(false);
  const [removingTeamId, setRemovingTeamId] = useState<number | null>(null);
  const [actionReason, setActionReason] = useState("");

  const [reinforcing, setReinforcing] = useState(false);
  const [reinforceType, setReinforceType] =
    useState<(typeof RESOURCE_TYPES)[number]>("Medical");
  const [reinforceCount, setReinforceCount] = useState(1);
  const [reinforceUrgency, setReinforceUrgency] =
    useState<ReinforceUrgency>("urgent");
  const [requests, setRequests] = useState<ReinforcementRequest[]>([]);

  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState(commander);

  // Sélecteur : tous les incidents, plus celui créé depuis un signalement.
  // Le filtre « actifs » garde le compteur aligné avec le tableau de bord.
  const allIncidents = mockIncidents.some((item) => item.id === incident.id)
    ? mockIncidents
    : [incident, ...mockIncidents];
  const currentIsActive = status === "Reported" || status === "Responding";
  const activeIncidents = allIncidents.filter((item) => {
    const itemStatus = item.id === incident.id ? status : item.status;
    return itemStatus === "Reported" || itemStatus === "Responding";
  });
  const activeScopeItems = currentIsActive
    ? activeIncidents
    : [incident, ...activeIncidents];
  const [scope, setScope] = useState<"active" | "all">(
    currentIsActive ? "active" : "all",
  );
  const scopedIncidents = scope === "active" ? activeScopeItems : allIncidents;
  const position = Math.max(
    1,
    scopedIncidents.findIndex((item) => item.id === incident.id) + 1,
  );

  // Pop-up « Tous les incidents » : actifs d'abord, puis par gravité.
  const pickerIncidents = [...allIncidents].sort((a, b) => {
    const aStatus = a.id === incident.id ? status : a.status;
    const bStatus = b.id === incident.id ? status : b.status;
    const aActive = aStatus === "Reported" || aStatus === "Responding";
    const bActive = bStatus === "Reported" || bStatus === "Responding";
    if (aActive !== bActive) return aActive ? -1 : 1;
    return (
      SEVERITY_LADDER.indexOf(b.severity) -
        SEVERITY_LADDER.indexOf(a.severity) || a.id - b.id
    );
  });

  const closed = status === "Resolved";
  const assignedTeams = mockTeams.filter((team) => teamIds.includes(team.id));
  const availableTeams = mockTeams.filter(
    (team) => !teamIds.includes(team.id),
  );
  const assignedAgents = assignedTeams.reduce(
    (total, team) => total + team.members,
    0,
  );
  const onSiteTeams = assignedTeams.filter((team) => team.status === "Deployed");
  const enRouteTeams = assignedTeams.filter(
    (team) => team.status === "En route",
  );
  const standbyTeams = assignedTeams.filter((team) => team.status === "Standby");

  const incidentPosition = resolveCoords(incident.location);
  const safety = generateSafetyData(incidentPosition, String(incident.id));
  const linkedReports = mockWarnings.filter(
    (report) =>
      report.verification === "unverified" && report.location === city,
  );
  const mapPins: MapPin[] = [
    {
      id: `incident-${incident.id}`,
      position: incidentPosition,
      title: `INC-${String(incident.id).padStart(3, "0")} · ${tc(
        incident.event,
      )}`,
      subtitle: tc(incident.location),
      tone: "incident",
      severity,
    },
    ...assignedTeams.map((team) => ({
      id: `team-${team.id}`,
      position: resolveCoords(team.location),
      title: tc(team.name),
      subtitle: `${t(`resp.st.${tone(team.status)}`)} · ${tc(team.location)}`,
      tone: "team" as const,
    })),
  ];
  const resourceGroups = [
    {
      key: "onsite",
      label: t("resp.inc.onSite"),
      tone: "deployed",
      teams: onSiteTeams,
      groups: groupResources(onSiteTeams),
      emptyKey: "resp.inc.noOnSite",
    },
    {
      key: "enroute",
      label: t("resp.inc.enRoute"),
      tone: "enroute",
      teams: enRouteTeams,
      groups: groupResources(enRouteTeams),
      emptyKey: "resp.inc.noEnRoute",
    },
    ...(standbyTeams.length > 0
      ? [
          {
            key: "standby",
            label: t("resp.inc.standby"),
            tone: "standby",
            teams: standbyTeams,
            groups: groupResources(standbyTeams),
            emptyKey: "resp.inc.noStandby",
          },
        ]
      : []),
  ];
  const removingTeam =
    mockTeams.find((team) => team.id === removingTeamId) ?? null;
  const statusChangeLabel = statusChange
    ? t(`resp.st.${tone(statusChange)}`)
    : "";

  function durationLabel(totalMinutes: number) {
    const minutes = Math.max(0, totalMinutes);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours > 0 && rest > 0) {
      return t("common.durationHM", { hours, minutes: rest });
    }
    if (hours > 0) return t("common.durationH", { hours });
    return t("common.durationM", { minutes: rest });
  }

  function unitsLabel(count: number) {
    return count === 1
      ? t("resp.inc.unitsOne")
      : t("resp.inc.units", { count });
  }

  function resourceLine(units: number, agents: number) {
    return units === 1
      ? t("resp.inc.resourceLineOne", { agents })
      : t("resp.inc.resourceLine", { units, agents });
  }

  function pushStep(step: NewStep) {
    const time = formatClock(clockMinutes);
    setClockMinutes((current) => current + 1);
    setSteps((current) => [
      ...current,
      {
        ...step,
        author: step.author ?? commander,
        id: Date.now() + current.length,
        time,
      },
    ]);
    return time;
  }

  function stepText(step: Step): string {
    if (step.text) return step.text;
    if (!step.key) return "";
    if (step.key === "resp.inc.tl.statusChange" && step.status) {
      return t(step.key, {
        from: step.fromStatus
          ? t(`resp.st.${tone(step.fromStatus)}`)
          : t("resp.inc.previousStatus"),
        to: t(`resp.st.${tone(step.status)}`),
      });
    }
    if (step.key === "resp.inc.tl.status" && step.status) {
      return t(step.key, { status: t(`resp.st.${tone(step.status)}`) });
    }
    if (step.key === "resp.inc.tl.escalatedLevel" && step.level) {
      return t(step.key, { level: t(`resp.inc.escLevel.${step.level}`) });
    }
    if (step.name) {
      return t(step.key, { name: step.name });
    }
    if (step.team) {
      return t(step.key, { team: step.team });
    }
    return t(step.key);
  }

  function requestStatusChange(next: Incident["status"]) {
    if (next === status) return;
    setActionReason("");
    setStatusChange(next);
  }

  function confirmStatusChange() {
    if (!statusChange || !actionReason.trim()) return;
    const reason = actionReason.trim();
    setStatus(statusChange);
    pushStep({
      key: "resp.inc.tl.statusChange",
      kind: "decision",
      status: statusChange,
      fromStatus: status,
      reason,
    });
    setNotice(
      t("resp.inc.noticeStatus", {
        status: t(`resp.st.${tone(statusChange)}`),
      }),
    );
    setStatusChange(null);
    setActionReason("");
  }

  function openEscalate() {
    setActionReason("");
    setEscLevel("regional");
    setEscalating(true);
  }

  function confirmEscalate() {
    if (!actionReason.trim()) return;
    const index = SEVERITY_LADDER.indexOf(severity);
    setSeverity(SEVERITY_LADDER[Math.min(index + 1, SEVERITY_LADDER.length - 1)]);
    setStatus("Responding");
    pushStep({
      key: "resp.inc.tl.escalatedLevel",
      kind: "decision",
      level: escLevel,
      reason: actionReason.trim(),
    });
    setNotice(
      t("resp.inc.noticeEscalatedTo", {
        level: t(`resp.inc.escLevel.${escLevel}`),
      }),
    );
    setEscalating(false);
    setActionReason("");
  }

  function openClose() {
    setActionReason("");
    setClosing(true);
  }

  function confirmClose() {
    if (!actionReason.trim()) return;
    setStatus("Resolved");
    pushStep({
      key: "resp.inc.tl.closed",
      kind: "decision",
      reason: actionReason.trim(),
    });
    setNotice(t("resp.inc.noticeClosed"));
    setClosing(false);
    setActionReason("");
  }

  function openTransfer() {
    setTransferTo(
      COMMANDERS.find((name) => name !== commander) ?? COMMANDERS[0],
    );
    setTransferStage("choose");
    setTransferring(true);
  }

  function requestTransfer() {
    if (!transferTo) return;
    setTransferStage("pending");
  }

  function confirmTransfer() {
    setCommander(transferTo);
    setNoteAuthor((current) => (current === commander ? transferTo : current));
    pushStep({ key: "resp.inc.tl.transfer", kind: "decision", name: transferTo });
    setNotice(t("resp.inc.noticeTransferred", { name: transferTo }));
    setTransferring(false);
    setTransferStage("choose");
  }

  function closeTransfer() {
    setTransferring(false);
    setTransferStage("choose");
  }

  function assignTeam() {
    if (closed) return;
    const team = mockTeams.find((item) => item.id === Number(teamPick));
    if (!team) return;
    setTeamIds((current) => [...current, team.id]);
    setTeamPick("");
    pushStep({ key: "resp.inc.tl.team", kind: "team", team: tc(team.name) });
    setNotice(t("resp.inc.noticeTeam", { team: tc(team.name) }));
  }

  function requestRemoveTeam(teamId: number) {
    setActionReason("");
    setRemovingTeamId(teamId);
  }

  function confirmRemoveTeam() {
    if (removingTeamId === null || !actionReason.trim()) return;
    const team = mockTeams.find((item) => item.id === removingTeamId);
    if (!team) return;
    setTeamIds((current) => current.filter((item) => item !== removingTeamId));
    pushStep({
      key: "resp.inc.tl.teamRemoved",
      kind: "team",
      team: tc(team.name),
      reason: actionReason.trim(),
    });
    setNotice(t("resp.inc.noticeTeamRemoved", { team: tc(team.name) }));
    setRemovingTeamId(null);
    setActionReason("");
  }

  function openReinforcement() {
    setReinforcing(true);
  }

  function sendReinforcement() {
    const units = unitsLabel(reinforceCount);
    const typeLabel = t(`resp.res.type${reinforceType}`);
    const urgencyLabel = t(`resp.inc.urgency.${reinforceUrgency}`);
    const requestTime = pushStep({
      kind: "communication",
      text: t("resp.inc.tl.reinforceRequest", {
        units,
        type: typeLabel,
        urgency: urgencyLabel,
      }),
    });
    const request: ReinforcementRequest = {
      id: Date.now(),
      time: requestTime,
      type: reinforceType,
      count: reinforceCount,
      urgency: reinforceUrgency,
      status: "pending",
    };
    setRequests((current) => [request, ...current]);
    setNotice(
      t("resp.inc.noticeReinforceRequest", {
        units,
        type: typeLabel,
        urgency: urgencyLabel,
      }),
    );
    setReinforcing(false);
    setReinforceCount(1);
  }

  function addNote() {
    const text = noteText.trim();
    if (!text) return;
    pushStep({
      kind: "communication",
      text,
      author: noteAuthor.trim() || commander,
    });
    setNoteText("");
    setNotice(t("resp.inc.noticeNote"));
  }

  return (
    <main className="rc-page">


      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.inc.eyebrow")}</p>
          <h1>{tc(incident.event)}</h1>
          <p className="rc-hero__lead rc-incident-summary">
            <span>
              {t("resp.inc.openFor", {
                duration: durationLabel(incident.ageMinutes ?? 0),
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {assignedTeams.length === 1
                ? t("resp.inc.summaryTeamsOne")
                : t("resp.inc.summaryTeams", { count: assignedTeams.length })}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t("resp.res.agentsChip", { count: assignedAgents })}
            </span>
          </p>
          <div className="rc-hero__meta">
            <span className={`rc-badge rc-badge--${tone(severity)}`}>
              <BadgeIcon tone={tone(severity)} />
              {t(`severity.${tone(severity)}`)}
            </span>
            <span className={`rc-badge rc-badge--${tone(status)}`}>
              <BadgeIcon tone={tone(status)} />
              {t(`resp.st.${tone(status)}`)}
            </span>
            <span className="rc-chip">{tc(incident.location)}</span>
            <span className="rc-chip">
              {t("resp.inc.reference", {
                ref: String(incident.id).padStart(3, "0"),
              })}
            </span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={() => setPickerOpen(true)}
          >
            {t("resp.inc.allIncidents")}
          </button>
          <button
            type="button"
            className="rc-btn rc-btn--ghost-danger"
            onClick={openEscalate}
            disabled={closed}
          >
            {t("resp.inc.escalate")}
          </button>
          <button
            type="button"
            className="rc-btn rc-btn--green"
            onClick={openReinforcement}
            disabled={closed}
          >
            {t("resp.inc.reinforce")}
          </button>
          <button
            type="button"
            className="rc-btn rc-btn--danger"
            onClick={openClose}
            disabled={closed}
          >
            {t("resp.inc.close")}
          </button>
        </div>
      </section>

      <div className="rc-switcher">
        <label className="rc-switcher__label" htmlFor="incident-switch">
          {t("resp.inc.switchLabel")}
        </label>

        <div
          className="rc-switcher__scope"
          role="group"
          aria-label={t("resp.inc.scopeAria")}
        >
          <button
            type="button"
            className={`rc-scope-btn${scope === "active" ? " is-active" : ""}`}
            aria-pressed={scope === "active"}
            onClick={() => setScope("active")}
          >
            {currentIsActive
              ? t("resp.inc.scopeActive", { count: activeIncidents.length })
              : t("resp.inc.scopeActiveWithCurrent", {
                  count: activeScopeItems.length,
                })}
          </button>
          <button
            type="button"
            className={`rc-scope-btn${scope === "all" ? " is-active" : ""}`}
            aria-pressed={scope === "all"}
            onClick={() => setScope("all")}
          >
            {t("resp.inc.scopeAll", { count: allIncidents.length })}
          </button>
        </div>

        <select
          id="incident-switch"
          className="rc-switcher__select"
          value={incident.id}
          onChange={(event) =>
            navigate(`/responsable/incidents/${event.target.value}`)
          }
        >
          {scopedIncidents.map((item) => {
            const itemStatus = item.id === incident.id ? status : item.status;
            return (
              <option key={item.id} value={item.id}>
                {`INC-${String(item.id).padStart(3, "0")} · ${tc(
                  item.event,
                )} · ${t(`resp.st.${tone(itemStatus)}`)}`}
              </option>
            );
          })}
        </select>

        <span className="rc-switcher__count">
          {t(
            scope === "active"
              ? currentIsActive
                ? "resp.inc.positionActive"
                : "resp.inc.positionActiveWithCurrent"
              : "resp.inc.positionAll",
            { index: position, total: scopedIncidents.length },
          )}
        </span>
      </div>

      {notice && (
        <p className="rc-toast" role="status">
          {notice}
        </p>
      )}

      <div className="rc-grid rc-grid--main rc-incident-grid">
        <div className="rc-stack">
          <section className="rc-card rc-incident-timeline">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.timeline")}</h2>
              <span className="rc-card__hint">
                {t("resp.inc.timelineHint")}
              </span>
            </div>

            <form className="rc-timeline-add" onSubmit={(event) => {
              event.preventDefault();
              addNote();
            }}>
              <div className="rc-timeline-add__fields">
                <input
                  className="rc-timeline-add__author"
                  type="text"
                  value={noteAuthor}
                  maxLength={60}
                  aria-label={t("resp.inc.noteAuthor")}
                  placeholder={t("resp.inc.noteAuthor")}
                  onChange={(event) => setNoteAuthor(event.target.value)}
                />
                <input
                  className="rc-timeline-add__text"
                  type="text"
                  value={noteText}
                  maxLength={500}
                  aria-label={t("resp.inc.notePlaceholder")}
                  placeholder={t("resp.inc.notePlaceholder")}
                  onChange={(event) => setNoteText(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="rc-btn rc-btn--green rc-btn--small"
                disabled={!noteText.trim()}
              >
                {t("resp.inc.addEntry")}
              </button>
            </form>

            <ol className="rc-timeline">
              {[...BASE_TIMELINE, ...steps].map((step) => {
                const author = step.authorKey
                  ? t(step.authorKey)
                  : step.author ?? commander;
                return (
                  <li
                    key={step.id}
                    className={`rc-timeline__item rc-timeline__item--${step.kind}`}
                  >
                    <span className="rc-timeline__icon">
                      <TimelineIcon kind={step.kind} />
                    </span>
                    <div className="rc-timeline__body">
                      <div className="rc-timeline__meta">
                        <time>{step.time}</time>
                        <span className="rc-timeline__author">{author}</span>
                      </div>
                      <p>{stepText(step)}</p>
                      {step.reason && (
                        <span className="rc-timeline__reason">
                          {t("resp.inc.reasonSuffix", { reason: step.reason })}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rc-card rc-incident-map">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.map")}</h2>
              <span className="rc-card__hint">{t("resp.inc.mapHint")}</span>
            </div>
            <CrisisMap
              pins={mapPins}
              variant="mini"
              interactive={false}
              perimeter={{ center: incidentPosition, radius: 900 }}
            />
            <div className="rc-map-legend">
              <span className="rc-map-legend__item">
                <span className="rc-map-legend__dot" />
                {t("resp.inc.mapLegendIncident")}
              </span>
              <span className="rc-map-legend__item">
                <span className="rc-map-legend__dot rc-map-legend__dot--team" />
                {t("resp.inc.mapLegendTeam")}
              </span>
              <span className="rc-map-legend__item">
                <span className="rc-map-legend__dot rc-map-legend__dot--perimeter" />
                {t("resp.inc.mapLegendPerimeter")}
              </span>
            </div>
          </section>

          <section className="rc-card rc-incident-situation">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.situation")}</h2>
              <span className="rc-card__hint">{tc(incident.location)}</span>
            </div>

            <div className="rc-situation-stats">
              <div className="rc-situation-stat">
                <span>{t("resp.inc.affected")}</span>
                <strong>{incident.affected ?? 0}</strong>
              </div>
              <div className="rc-situation-stat">
                <span>{t("resp.inc.evacuated")}</span>
                <strong>{incident.evacuated ?? 0}</strong>
              </div>
              <div className="rc-situation-stat">
                <span>{t("resp.inc.linkedReports")}</span>
                <strong>{linkedReports.length}</strong>
              </div>
            </div>

            <h3 className="rc-subtitle">{t("resp.inc.shelters")}</h3>
            <ul className="rc-shelter-list">
              {safety.shelters.slice(0, 2).map((shelter, index) => {
                const load = [62, 91][index] ?? 60;
                return (
                  <li key={shelter.id} className="rc-shelter">
                    <div className="rc-shelter__head">
                      <strong>{tc(shelter.name)}</strong>
                      <span>{t("resp.inc.shelterLoad", { load })}</span>
                    </div>
                    <div
                      className="rc-shelter__track"
                      role="progressbar"
                      aria-label={tc(shelter.name)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={load}
                    >
                      <span style={{ width: `${load}%` }} />
                    </div>
                    <span className="rc-shelter__capacity">
                      {t("resp.inc.shelterCapacity", {
                        capacity: shelter.capacity,
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rc-card rc-incident-reports">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.linkedReports")}</h2>
              <span className="rc-card__hint">{linkedReports.length}</span>
            </div>

            {linkedReports.length === 0 ? (
              <p className="rc-empty">{t("resp.inc.noLinkedReports")}</p>
            ) : (
              <>
                <ul className="rc-linked-reports">
                  {linkedReports.slice(0, 3).map((report) => (
                    <li key={report.id} className="rc-linked-report">
                      <div className="rc-linked-report__body">
                        <strong>{tc(report.title)}</strong>
                        <span>
                          {tc(report.source)} · {tc(report.issuedAt)} ·{" "}
                          {t(`verification.${report.verification}`)}
                        </span>
                      </div>
                      <span
                        className={`rc-badge rc-badge--${tone(
                          report.severity,
                        )}`}
                      >
                        <BadgeIcon tone={tone(report.severity)} />
                        {t(`severity.${tone(report.severity)}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link className="rc-link" to="/responsable/signalements">
                  {t("resp.inc.viewReports")}
                </Link>
              </>
            )}
          </section>
        </div>

        <div className="rc-stack">
          <section className="rc-card rc-incident-facts">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.facts")}</h2>
            </div>
            <dl className="rc-facts">
              <div>
                <dt>{t("resp.inc.type")}</dt>
                <dd>{tc(incident.event)}</dd>
              </div>
              <div>
                <dt>{t("resp.inc.status")}</dt>
                <dd>
                  <select
                    value={status}
                    aria-label={t("resp.inc.status")}
                    disabled={closed}
                    onChange={(event) =>
                      requestStatusChange(
                        event.target.value as Incident["status"],
                      )
                    }
                  >
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {t(`resp.st.${tone(item)}`)}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt>{t("resp.inc.severity")}</dt>
                <dd>
                  <span className={`rc-badge rc-badge--${tone(severity)}`}>
                    <BadgeIcon tone={tone(severity)} />
                    {t(`severity.${tone(severity)}`)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>{t("resp.inc.location")}</dt>
                <dd>{tc(incident.location)}</dd>
              </div>
              <div>
                <dt>{t("resp.inc.commander")}</dt>
                <dd>{commander}</dd>
              </div>
              <div>
                <dt>{t("resp.inc.openedAt")}</dt>
                <dd>{formatClock(DEMO_OPENED_MINUTES)}</dd>
              </div>
            </dl>

            <div className="rc-card__foot">
              <button
                type="button"
                className="rc-btn rc-btn--soft"
                onClick={openTransfer}
                disabled={closed}
              >
                {t("resp.inc.transfer")}
              </button>
            </div>
          </section>

          <section className="rc-card rc-incident-teams">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.teams")}</h2>
              <span className="rc-card__hint">{assignedTeams.length}</span>
            </div>

            {assignedTeams.length === 0 ? (
              <p className="rc-empty">{t("resp.inc.noTeams")}</p>
            ) : (
              <ul className="rc-list">
                {assignedTeams.map((team) => (
                  <li
                    key={team.id}
                    className="rc-team-line rc-team-line--detailed"
                  >
                    <div className="rc-team-line__body">
                      <strong>{tc(team.name)}</strong>
                      <span>
                        {tc(team.location)} ·{" "}
                        {t("resp.res.membersCount", { count: team.members })}
                      </span>
                      {team.contact && (
                        <span className="rc-team-line__contact">
                          {t("resp.inc.contact")} :{" "}
                          <a
                            href={`tel:${team.contact.replace(/\s/g, "")}`}
                            dir="ltr"
                          >
                            {team.contact}
                          </a>
                        </span>
                      )}
                      {team.status === "En route" && team.etaMinutes && (
                        <span className="rc-team-line__eta">
                          <BadgeIcon tone="enroute" />
                          {t("resp.inc.eta", {
                            minutes: team.etaMinutes,
                          })}
                        </span>
                      )}
                    </div>
                    <span
                      className={`rc-badge rc-badge--${tone(team.status)}`}
                    >
                      <BadgeIcon tone={tone(team.status)} />
                      {t(`resp.st.${tone(team.status)}`)}
                    </span>
                    {!closed && (
                      <button
                        type="button"
                        className="rc-icon-btn"
                        aria-label={t("resp.inc.removeTeamNamed", {
                          team: tc(team.name),
                        })}
                        title={t("resp.inc.removeTeamNamed", {
                          team: tc(team.name),
                        })}
                        onClick={() => requestRemoveTeam(team.id)}
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {!closed && availableTeams.length > 0 && (
              <div className="rc-team-add">
                <select
                  value={teamPick}
                  aria-label={t("resp.inc.assignTeam")}
                  onChange={(event) => setTeamPick(event.target.value)}
                >
                  <option value="">{t("resp.inc.chooseTeam")}</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {tc(team.name)} · {tc(team.location)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rc-btn rc-btn--green rc-btn--small"
                  disabled={!teamPick}
                  onClick={assignTeam}
                >
                  {t("resp.inc.assign")}
                </button>
              </div>
            )}
          </section>

          <section className="rc-card rc-incident-resources">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.inc.resources")}</h2>
              <span className="rc-card__hint">
                {t("resp.inc.resourcesHint", {
                  onSite: onSiteTeams.length,
                  enRoute: enRouteTeams.length,
                })}
                {standbyTeams.length > 0 &&
                  ` · ${t("resp.inc.reserveHint", {
                    count: standbyTeams.length,
                  })}`}
              </span>
            </div>

            {assignedTeams.length === 0 ? (
              <p className="rc-empty">{t("resp.inc.noResources")}</p>
            ) : (
              <div className="rc-res-groups">
                {resourceGroups.map((group) => {
                  const agents = group.teams.reduce(
                    (total, team) => total + team.members,
                    0,
                  );
                  return (
                    <div
                      key={group.key}
                      className={`rc-res-group rc-res-group--${group.key}`}
                    >
                      <h3 className="rc-res-group__title">
                        <BadgeIcon tone={group.tone} />
                        <span>{group.label}</span>
                        <span className="rc-res-group__count">
                          {t("resp.res.agentsChip", { count: agents })}
                        </span>
                      </h3>
                      {group.groups.length === 0 ? (
                        <p className="rc-res-group__empty">
                          {t(group.emptyKey)}
                        </p>
                      ) : (
                        <div className="rc-res-chips">
                          {group.groups.map((resource) => {
                            const resourceAgents = resource.teams.reduce(
                              (total, team) => total + team.members,
                              0,
                            );
                            return (
                              <span
                                key={resource.type}
                                className="rc-res-chip"
                              >
                                <span className="rc-badge">
                                  {t(`resp.res.type${resource.type}`)}
                                </span>
                                {resourceLine(
                                  resource.teams.length,
                                  resourceAgents,
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {requests.length > 0 && (
            <section className="rc-card rc-incident-requests">
              <div className="rc-card__head">
                <h2 className="rc-card__title">
                  {t("resp.inc.reinforcements")}
                </h2>
                <span className="rc-card__hint">{requests.length}</span>
              </div>
              <ul className="rc-reinforce-list">
                {requests.map((request) => (
                  <li key={request.id} className="rc-reinforce-item">
                    <div className="rc-reinforce-item__body">
                      <strong>
                        {t("resp.inc.reinforceLine", {
                          units: unitsLabel(request.count),
                          type: t(`resp.res.type${request.type}`),
                        })}
                      </strong>
                      <span>
                        {request.time} ·{" "}
                        {t(`resp.inc.urgency.${request.urgency}`)}
                      </span>
                    </div>
                    <span className="rc-badge rc-badge--reported">
                      <BadgeIcon tone="reported" />
                      {t("resp.inc.reinforcementPending")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {escalating && (
        <ConfirmDialog
          title={t("resp.inc.escalateTitle")}
          confirmLabel={t("resp.inc.escalateConfirm")}
          tone="danger"
          confirmDisabled={!actionReason.trim()}
          onConfirm={confirmEscalate}
          onClose={() => setEscalating(false)}
        >
          <p>{t("resp.inc.escalateLead")}</p>

          <div className="rc-choice">
            {ESC_LEVELS.map((level) => (
              <label key={level} className="rc-choice__option">
                <input
                  type="radio"
                  name="escalation-level"
                  checked={escLevel === level}
                  onChange={() => setEscLevel(level)}
                />
                <span>
                  {t(`resp.inc.escLevel.${level}`)}
                  <small>{t(`resp.inc.escLevel.${level}Hint`)}</small>
                </span>
              </label>
            ))}
          </div>

          <ActionReason
            id="escalate-reason"
            value={actionReason}
            onChange={setActionReason}
          />
        </ConfirmDialog>
      )}

      {statusChange && (
        <ConfirmDialog
          title={t("resp.inc.statusTitle")}
          confirmLabel={t("resp.inc.statusConfirm")}
          tone="primary"
          confirmDisabled={!actionReason.trim()}
          onConfirm={confirmStatusChange}
          onClose={() => {
            setStatusChange(null);
            setActionReason("");
          }}
        >
          <p>
            {t("resp.inc.statusLead", {
              from: t(`resp.st.${tone(status)}`),
              to: statusChangeLabel,
            })}
          </p>
          <ActionReason
            id="status-reason"
            value={actionReason}
            onChange={setActionReason}
          />
        </ConfirmDialog>
      )}

      {closing && (
        <ConfirmDialog
          title={t("resp.inc.closeTitle")}
          confirmLabel={t("resp.inc.closeConfirm")}
          tone="danger"
          confirmDisabled={!actionReason.trim()}
          onConfirm={confirmClose}
          onClose={() => {
            setClosing(false);
            setActionReason("");
          }}
        >
          <p>{t("resp.inc.closeLead")}</p>
          <ActionReason
            id="close-reason"
            value={actionReason}
            onChange={setActionReason}
          />
        </ConfirmDialog>
      )}

      {removingTeam && (
        <ConfirmDialog
          title={t("resp.inc.removeTeamTitle", {
            team: tc(removingTeam.name),
          })}
          confirmLabel={t("resp.inc.removeTeamConfirm")}
          tone="danger"
          confirmDisabled={!actionReason.trim()}
          onConfirm={confirmRemoveTeam}
          onClose={() => {
            setRemovingTeamId(null);
            setActionReason("");
          }}
        >
          <p>{t("resp.inc.removeTeamLead")}</p>
          <ActionReason
            id="remove-team-reason"
            value={actionReason}
            onChange={setActionReason}
          />
        </ConfirmDialog>
      )}

      {transferring && (
        <ConfirmDialog
          title={t("resp.inc.transferTitle")}
          confirmLabel={
            transferStage === "choose"
              ? t("resp.inc.transferRequest")
              : t("resp.inc.transferAccept")
          }
          tone="green"
          confirmDisabled={!transferTo}
          onConfirm={
            transferStage === "choose" ? requestTransfer : confirmTransfer
          }
          onClose={closeTransfer}
        >
          {transferStage === "choose" ? (
            <>
              <p>{t("resp.inc.transferLead", { name: commander })}</p>

              <div className="rc-field">
                <label htmlFor="transfer-commander">
                  {t("resp.inc.transferLabel")}
                </label>
                <select
                  id="transfer-commander"
                  value={transferTo}
                  onChange={(event) => setTransferTo(event.target.value)}
                >
                  {COMMANDERS.filter((name) => name !== commander).map(
                    (name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </>
          ) : (
            <>
              <p>
                {t("resp.inc.transferPending", { name: transferTo })}
              </p>
              <div className="rc-confirm__pending" role="status">
                <BadgeIcon tone="reported" />
                <span>{t("resp.inc.transferAwaiting")}</span>
              </div>
              <p className="rc-confirm__hint">
                {t("resp.inc.transferSimulation")}
              </p>
            </>
          )}
        </ConfirmDialog>
      )}

      {reinforcing && (
        <ConfirmDialog
          title={t("resp.inc.reinforceTitle")}
          confirmLabel={t("resp.inc.reinforceSend")}
          tone="green"
          confirmDisabled={reinforceCount < 1}
          onConfirm={sendReinforcement}
          onClose={() => setReinforcing(false)}
        >
          <p>{t("resp.inc.reinforceLead")}</p>

          <div className="rc-field">
            <label htmlFor="reinforce-type">
              {t("resp.inc.reinforceType")}
            </label>
            <select
              id="reinforce-type"
              value={reinforceType}
              onChange={(event) =>
                setReinforceType(
                  event.target.value as (typeof RESOURCE_TYPES)[number],
                )
              }
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`resp.res.type${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="rc-field">
            <label htmlFor="reinforce-count">
              {t("resp.inc.reinforceCount")}
            </label>
            <input
              id="reinforce-count"
              type="number"
              min={1}
              max={20}
              value={reinforceCount}
              onChange={(event) => {
                const next = Number(event.target.value);
                setReinforceCount(
                  Number.isFinite(next)
                    ? Math.min(20, Math.max(1, Math.round(next)))
                    : 1,
                );
              }}
            />
          </div>

          <fieldset className="rc-field rc-choice-field">
            <legend>{t("resp.inc.reinforceUrgency")}</legend>
            <div className="rc-choice rc-choice--inline">
              {REINFORCE_URGENCIES.map((urgency) => (
                <label key={urgency} className="rc-choice__option">
                  <input
                    type="radio"
                    name="reinforce-urgency"
                    checked={reinforceUrgency === urgency}
                    onChange={() => setReinforceUrgency(urgency)}
                  />
                  <span>{t(`resp.inc.urgency.${urgency}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </ConfirmDialog>
      )}

      {pickerOpen && (
        <Modal
          title={t("resp.inc.allIncidentsTitle")}
          onClose={() => setPickerOpen(false)}
          className="rc-incident-picker"
        >
          <div className="rc-incident-picker__head">
            <p className="rc-incident-picker__lead">
              {t("resp.inc.allIncidentsLead")}
            </p>
            <span className="rc-incident-picker__count">
              {pickerIncidents.length === 1
                ? t("resp.inc.allIncidentsCountOne")
                : t("resp.inc.allIncidentsCount", {
                    count: pickerIncidents.length,
                  })}
            </span>
          </div>

          <ul className="rc-incident-picker__list">
            {pickerIncidents.map((item) => {
              const itemStatus =
                item.id === incident.id ? status : item.status;
              const isCurrent = item.id === incident.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`rc-incident-picker__item${
                      isCurrent ? " is-current" : ""
                    }`}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => {
                      setPickerOpen(false);
                      if (!isCurrent) {
                        navigate(`/responsable/incidents/${item.id}`);
                      }
                    }}
                  >
                    <span className="rc-incident-picker__body">
                      <span className="rc-incident-picker__line">
                        <span className="rc-incident-picker__ref">
                          INC-{String(item.id).padStart(3, "0")}
                        </span>
                        <span className="rc-incident-picker__title">
                          {tc(item.event)}
                        </span>
                        {isCurrent && (
                          <span className="rc-incident-picker__current">
                            {t("resp.inc.currentIncident")}
                          </span>
                        )}
                      </span>
                      <span className="rc-incident-picker__meta">
                        <span
                          className={`rc-badge rc-badge--${tone(
                            item.severity,
                          )}`}
                        >
                          <BadgeIcon tone={tone(item.severity)} />
                          {t(`severity.${tone(item.severity)}`)}
                        </span>
                        <span
                          className={`rc-badge rc-badge--${tone(itemStatus)}`}
                        >
                          <BadgeIcon tone={tone(itemStatus)} />
                          {t(`resp.st.${tone(itemStatus)}`)}
                        </span>
                        <span className="rc-incident-picker__place">
                          {tc(item.location)}
                        </span>
                      </span>
                    </span>
                    {!isCurrent && (
                      <span className="rc-incident-picker__open">
                        {t("resp.inc.openIncident")}
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </main>
  );
}

function IncidentManagement() {
  const { id } = useParams();

  return <IncidentDetail key={id ?? "1"} id={id} />;
}

export default IncidentManagement;

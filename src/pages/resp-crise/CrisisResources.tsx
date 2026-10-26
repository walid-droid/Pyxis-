import "./resp-crise.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useI18n } from "../../i18n";
import { INITIAL_ASSIGNMENTS } from "../../mockdata/assignments";
import { mockIncidents, type Incident } from "../../mockdata/incident";
import {
  distanceKm,
  resolveCoords,
  type Coords,
} from "../../mockdata/locations";
import { generateSafetyData } from "../../mockdata/safety";
import { mockTeams, type Team } from "../../mockdata/teams";
import ConfirmDialog from "./ConfirmDialog";
import CrisisMap, { type MapPin } from "./CrisisMap";
import { tone } from "./utils";

const STATUS_FILTERS = [
  { id: "all", labelKey: "resp.res.filterAll" },
  { id: "Deployed", labelKey: "resp.res.deployed" },
  { id: "En route", labelKey: "resp.st.enroute" },
  { id: "Standby", labelKey: "resp.st.standby" },
];

const TYPE_FILTERS = [
  { id: "all", labelKey: "resp.res.typeAll" },
  { id: "Fire", labelKey: "resp.res.typeFire" },
  { id: "Rescue", labelKey: "resp.res.typeRescue" },
  { id: "Medical", labelKey: "resp.res.typeMedical" },
  { id: "Police", labelKey: "resp.res.typePolice" },
  { id: "Logistics", labelKey: "resp.res.typeLogistics" },
];

type SortMode = "distance" | "availability" | "name";

const SORT_OPTIONS: { id: SortMode; labelKey: string }[] = [
  { id: "distance", labelKey: "resp.res.sortDistance" },
  { id: "availability", labelKey: "resp.res.sortAvailability" },
  { id: "name", labelKey: "resp.res.sortName" },
];

const NEIGHBOURS = ["Skikda", "Jijel", "Tizi Ouzou", "Bouira", "Sétif", "Mila"];

const CENTER: Coords = resolveCoords("Béjaïa, Gouraya");

const STATUS_ORDER: Record<Team["status"], number> = {
  Standby: 0,
  "En route": 1,
  Deployed: 2,
};

const PROVINCES = new Set([
  "Adrar",
  "Alger",
  "Annaba",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Bouira",
  "Constantine",
  "El Oued",
  "El Tarf",
  "Jijel",
  "Médéa",
  "Mila",
  "Mostaganem",
  "Oran",
  "Ouargla",
  "Sétif",
  "Skikda",
  "Tamanrasset",
  "Tizi Ouzou",
]);

const WILAYA_ALIASES: Record<string, string> = {
  Azzaba: "Skikda",
  "Bab Ezzouar": "Alger",
  Berrouaghia: "Médéa",
  Chelia: "Batna",
  "Es Sénia": "Oran",
  Gouraya: "Béjaïa",
  Grarem: "Mila",
  Kherrata: "Béjaïa",
  RN12: "Tizi Ouzou",
  Taher: "Jijel",
  Tikjda: "Bouira",
};

type Structure = {
  id: string;
  name: string;
  kind: "shelter" | "hospital" | "post";
  position: Coords;
  /** Places disponibles. 0 pour un poste sans hébergement. */
  capacity: number;
  occupied: number;
  available: boolean;
};

type AppuiRequest = {
  id: number;
  wilaya: string;
  type: string;
};

/** Wilaya de rattachement d'une localisation libre ("Azzaba" → Skikda). */
function wilayaOf(location: string): string {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const alias = WILAYA_ALIASES[part];
    if (alias) return alias;
    if (PROVINCES.has(part)) return part;
  }

  return parts[0] ?? "";
}

const WILAYA_OPTIONS = Array.from(
  new Set([
    ...mockTeams.map((team) => wilayaOf(team.location)),
    ...mockIncidents
      .filter((incident) => incident.status !== "Resolved")
      .map((incident) => wilayaOf(incident.location)),
  ]),
)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, "fr"));

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Référence affichable d'un incident : INC-001. */
function incidentRef(incidentId: number): string {
  return `INC-${String(incidentId).padStart(3, "0")}`;
}

/** Dernier niveau de la localisation : "Béjaïa, Gouraya" → "Gouraya". */
function incidentPlace(location: string): string {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? location;
}

function formatKm(km: number): string {
  return String(Math.max(1, Math.round(km)));
}

function formatEta(minutes: number, lang: string): string {
  const hourUnit = lang === "ar" ? "س" : "h";
  const minuteUnit = lang === "ar" ? "د" : "min";
  if (minutes < 60) return `${minutes} ${minuteUnit}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${hours} ${hourUnit}`
    : `${hours} ${hourUnit} ${String(rest).padStart(2, "0")} ${minuteUnit}`;
}

/** Construit les hébergements et postes autour du secteur affiché. */
function buildStructures(center: Coords, seed: string): Structure[] {
  const data = generateSafetyData(center, seed);
  const shelterLoad = [0.62, 0.91, 1];

  const shelters: Structure[] = data.shelters.map((shelter, index) => {
    const ratio = shelterLoad[index % shelterLoad.length] ?? 1;
    const occupied = Math.round(shelter.capacity * ratio);
    return {
      id: shelter.id,
      name: shelter.name,
      kind: "shelter",
      position: shelter.position,
      capacity: shelter.capacity,
      occupied,
      available: occupied < shelter.capacity,
    };
  });

  const posts: Structure[] = data.posts.map((post) => {
    const isHospital = post.kind === "Hôpital";
    const capacity = isHospital ? 180 : 0;
    const occupied = isHospital ? 142 : 0;
    return {
      id: post.id,
      name: post.name,
      kind: isHospital ? "hospital" : "post",
      position: post.position,
      capacity,
      occupied,
      available: capacity === 0 || occupied < capacity,
    };
  });

  return [...shelters, ...posts];
}

/** Écran 6 — disponibilité, localisation et affectation des moyens. */
function CrisisResources() {
  const { t, tc, lang } = useI18n();
  const [wilaya, setWilaya] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("distance");
  const [assigned, setAssigned] =
    useState<Record<number, number>>({ ...INITIAL_ASSIGNMENTS });
  const [drawerTeam, setDrawerTeam] = useState<Team | null>(null);

  const [notice, setNotice] = useState<string | null>(null);
  const [appuiOpen, setAppuiOpen] = useState(false);
  const [appuiWilaya, setAppuiWilaya] = useState(NEIGHBOURS[0]);
  const [appuiType, setAppuiType] = useState("Fire");
  const [requests, setRequests] = useState<AppuiRequest[]>([]);

  const scopeTeams = useMemo(
    () =>
      wilaya === "all"
        ? mockTeams
        : mockTeams.filter((team) => wilayaOf(team.location) === wilaya),
    [wilaya],
  );

  const scopeIncidents = useMemo(
    () =>
      mockIncidents.filter(
        (incident) =>
          wilaya === "all" || wilayaOf(incident.location) === wilaya,
      ),
    [wilaya],
  );

  const activeIncidents = useMemo(
    () =>
      scopeIncidents.filter(
        (incident) =>
          incident.status === "Responding" || incident.status === "Reported",
      ),
    [scopeIncidents],
  );

  const focusIncident: Incident | undefined =
    activeIncidents[0] ??
    scopeIncidents.find((incident) => incident.status !== "Resolved");

  const scopeCenter = useMemo<Coords>(() => {
    if (focusIncident) return resolveCoords(focusIncident.location);
    if (wilaya !== "all") return resolveCoords(wilaya);
    return CENTER;
  }, [focusIncident, wilaya]);

  // Hôpitaux et centres d'hébergement générés autour du secteur affiché.
  const structures = useMemo<Structure[]>(
    () =>
      buildStructures(
        scopeCenter,
        wilaya === "all" ? "cadm-ressources" : `cadm-ressources-${wilaya}`,
      ),
    [scopeCenter, wilaya],
  );

  const nearestAvailable = useMemo(() => {
    const available = structures.filter(
      (structure) => structure.capacity > 0 && structure.available,
    );
    const result: Record<string, { name: string; km: number }> = {};

    structures.forEach((structure) => {
      if (structure.capacity === 0 || structure.available) return;

      let best: { name: string; km: number } | undefined;
      available.forEach((candidate) => {
        if (candidate.id === structure.id) return;
        const km = distanceKm(structure.position, candidate.position);
        if (!best || km < best.km) {
          best = { name: candidate.name, km };
        }
      });

      if (best) result[structure.id] = best;
    });

    return result;
  }, [structures]);

  const normalizedQuery = normalizeSearch(query.trim());

  const searchedTeams = scopeTeams.filter((team) => {
    if (!normalizedQuery) return true;
    const currentIncident = assigned[team.id]
      ? mockIncidents.find((incident) => incident.id === assigned[team.id])
      : undefined;
    const haystack = [
      team.name,
      team.location,
      t(`resp.res.type${team.type}`),
      t(`resp.st.${tone(team.status)}`),
      currentIncident
        ? `${incidentRef(currentIncident.id)} ${currentIncident.event} ${currentIncident.location}`
        : "",
    ].join(" ");
    return normalizeSearch(haystack).includes(normalizedQuery);
  });

  const statusCounts = STATUS_FILTERS.map((item) => ({
    ...item,
    count: searchedTeams.filter(
      (team) =>
        (type === "all" || team.type === type) &&
        (item.id === "all" || team.status === item.id),
    ).length,
  }));

  const typeCounts = TYPE_FILTERS.map((item) => ({
    ...item,
    count: searchedTeams.filter(
      (team) =>
        (status === "all" || team.status === status) &&
        (item.id === "all" || team.type === item.id),
    ).length,
  }));

  function teamDistance(team: Team): number {
    return distanceKm(resolveCoords(team.location), scopeCenter);
  }

  const visible = [...searchedTeams]
    .filter(
      (team) =>
        (status === "all" || team.status === status) &&
        (type === "all" || team.type === type),
    )
    .sort((a, b) => {
      if (sort === "name") return tc(a.name).localeCompare(tc(b.name), lang);
      if (sort === "availability") {
        return (
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          teamDistance(a) - teamDistance(b)
        );
      }
      return teamDistance(a) - teamDistance(b);
    });

  const saturatedCount = structures.filter(
    (structure) => structure.capacity > 0 && !structure.available,
  ).length;

  const drawerCurrent = drawerTeam
    ? mockIncidents.find(
        (incident) => incident.id === assigned[drawerTeam.id],
      )
    : undefined;

  const drawerSuggestions = useMemo(() => {
    if (!drawerTeam) return [];
    const from = resolveCoords(drawerTeam.location);
    return activeIncidents
      .map((incident) => {
        const km = distanceKm(from, resolveCoords(incident.location));
        return {
          incident,
          km,
          eta: Math.max(4, Math.round((km / 55) * 60 + 5)),
        };
      })
      .sort((a, b) => a.km - b.km);
  }, [drawerTeam, activeIncidents]);

  useEffect(() => {
    if (!drawerTeam) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerTeam(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerTeam]);

  function typeLabel(value: string): string {
    return value === "all"
      ? t("resp.res.typeAll")
      : t(`resp.res.type${value}`);
  }

  function kindLabel(kind: Structure["kind"]): string {
    if (kind === "shelter") return t("resp.res.shelter");
    if (kind === "hospital") return t("resp.res.hospital");
    return t("resp.res.post");
  }

  function structureSubtitle(structure: Structure): string {
    const parts = [kindLabel(structure.kind)];
    if (structure.capacity > 0) {
      parts.push(`${structure.occupied}/${structure.capacity}`);
      parts.push(
        t(
          structure.available ? "resp.res.available" : "resp.res.saturated",
        ),
      );
    }
    return parts.join(" · ");
  }

  function assign(team: Team, incident: Incident) {
    setAssigned((current) => ({ ...current, [team.id]: incident.id }));
    setNotice(
      t("resp.res.noticeAssigned", {
        team: tc(team.name),
        ref: incidentRef(incident.id),
        event: tc(incident.event),
      }),
    );
    setDrawerTeam(null);
  }

  function release(team: Team) {
    setAssigned((current) => {
      const next = { ...current };
      delete next[team.id];
      return next;
    });
    setNotice(t("resp.res.noticeReleased", { team: tc(team.name) }));
  }

  function sendAppui() {
    setRequests((current) => [
      ...current,
      { id: Date.now(), wilaya: appuiWilaya, type: appuiType },
    ]);
    setNotice(t("resp.res.noticeAppui", { wilaya: appuiWilaya }));
    setAppuiOpen(false);
  }

  const mapPins: MapPin[] = [
    ...visible.map((team) => ({
      id: `team-${team.id}`,
      position: resolveCoords(team.location),
      title: tc(team.name),
      subtitle: `${t(`resp.res.type${team.type}`)} · ${t(
        `resp.st.${tone(team.status)}`,
      )} · ${tc(team.location)}`,
      tone: "team" as const,
    })),
    ...structures.map((structure) => ({
      id: `structure-${structure.id}`,
      position: structure.position,
      title: tc(structure.name),
      subtitle: structureSubtitle(structure),
      tone:
        structure.kind === "shelter"
          ? ("shelter" as const)
          : structure.kind === "hospital"
            ? ("hospital" as const)
            : ("police" as const),
    })),
    ...(focusIncident
      ? [
          {
            id: `incident-${focusIncident.id}`,
            position: scopeCenter,
            title: `${incidentRef(focusIncident.id)} · ${tc(
              focusIncident.event,
            )}`,
            subtitle: t("resp.res.focusPin"),
            tone: "incident" as const,
            href: `/responsable/incidents/${focusIncident.id}`,
          },
        ]
      : []),
  ];

  return (
    <main className="rc-page">
      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.res.eyebrow")}</p>
          <h1>{t("resp.res.title")}</h1>
          <p className="rc-hero__lead">{t("resp.res.lead")}</p>
          <div className="rc-hero__meta">
            <label className="rc-scope">
              <span className="rc-scope__label">
                {t("resp.res.scopeLabel")}
              </span>
              <select
                className="rc-scope__select"
                value={wilaya}
                aria-label={t("resp.res.scopeLabel")}
                onChange={(event) => setWilaya(event.target.value)}
              >
                <option value="all">{t("resp.res.scopeNational")}</option>
                {WILAYA_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {t("resp.res.scopeWilaya", { wilaya: item })}
                  </option>
                ))}
              </select>
            </label>

            <span className="rc-chip">
              <svg
                className="rc-chip__icon"
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
              {t("resp.res.updated")}
            </span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <button
            type="button"
            className="rc-btn rc-btn--primary"
            onClick={() => setAppuiOpen(true)}
          >
            {t("resp.res.appui")}
          </button>
        </div>
      </section>

      {notice && (
        <p className="rc-toast" role="status">
          {notice}
        </p>
      )}

      <div className="rc-grid rc-grid--main">
        <div className="rc-stack">
          <section className="rc-card">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("resp.res.mapTitle")}</h2>
              <span className="rc-card__hint">{t("resp.res.mapHint")}</span>
            </div>

            <CrisisMap pins={mapPins} variant="full" />

            <div className="rc-legend">
              <span className="rc-legend__item">
                <i className="rc-legend__dot rc-legend__dot--incident" />
                {t("resp.res.legendIncident")}
              </span>
              <span className="rc-legend__item">
                <i className="rc-legend__dot rc-legend__dot--team" />
                {t("resp.res.legendTeam")}
              </span>
              <span className="rc-legend__item">
                <i className="rc-legend__dot rc-legend__dot--shelter" />
                {t("resp.res.legendShelter")}
              </span>
              <span className="rc-legend__item">
                <i className="rc-legend__dot rc-legend__dot--hospital" />
                {t("resp.res.legendHospital")}
              </span>
              <span className="rc-legend__item">
                <i className="rc-legend__dot rc-legend__dot--post" />
                {t("resp.res.post")}
              </span>
            </div>
          </section>

          <section
            className={`rc-card rc-requests${
              requests.length > 0
                ? " rc-requests--active"
                : " rc-requests--empty"
            }`}
          >
            <div className="rc-requests__row">
              <div className="rc-requests__title">
                <h2 className="rc-card__title">
                  {t("resp.res.requestsTitle")}
                </h2>
                {requests.length > 0 && (
                  <span className="rc-badge rc-badge--critical">
                    {requests.length}
                  </span>
                )}
              </div>

              {requests.length === 0 ? (
                <p className="rc-requests__empty">
                  {t("resp.res.noRequests")}
                </p>
              ) : (
                <span className="rc-card__hint">
                  {t("resp.res.requestsHint", { count: requests.length })}
                </span>
              )}
            </div>

            {requests.length > 0 && (
              <ul className="rc-structures rc-structures--requests">
                {requests.map((request) => (
                  <li key={request.id} className="rc-request">
                    <span>
                      {request.wilaya} · {typeLabel(request.type)}
                    </span>
                    <span className="rc-badge rc-badge--scheduled">
                      {t("resp.res.requestPending")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="rc-card rc-structures-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">
              {t("resp.res.structuresTitle")}
            </h2>
            <span className="rc-card__hint">
              {saturatedCount > 0
                ? t("resp.res.structuresHintSaturated", {
                    count: structures.length,
                    saturated: saturatedCount,
                  })
                : t("resp.res.structuresHint", {
                    count: structures.length,
                  })}
            </span>
          </div>

          <ul className="rc-structures">
            {structures.map((structure) => {
              const suggestion = nearestAvailable[structure.id];
              const percent =
                structure.capacity > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (structure.occupied / structure.capacity) * 100,
                      ),
                    )
                  : 0;

              return (
                <li
                  key={structure.id}
                  className={`rc-structure${
                    structure.available ? "" : " is-saturated"
                  }`}
                >
                  <div className="rc-structure__body">
                    <div className="rc-structure__top">
                      <strong>{tc(structure.name)}</strong>
                      <span
                        className={`rc-badge rc-badge--${
                          structure.available ? "available" : "critical"
                        }`}
                      >
                        {t(
                          structure.available
                            ? "resp.res.available"
                            : "resp.res.saturated",
                        )}
                      </span>
                    </div>

                    <span className="rc-structure__meta">
                      {kindLabel(structure.kind)}
                      {focusIncident && (
                        <>
                          {" · "}
                          <Link
                            className="rc-structure__incident"
                            to={`/responsable/incidents/${focusIncident.id}`}
                          >
                            {tc(focusIncident.event)} ·{" "}
                            {incidentPlace(focusIncident.location)}
                          </Link>
                        </>
                      )}
                    </span>

                    {structure.capacity > 0 && (
                      <div className="rc-occupancy">
                        <span className="rc-occupancy__track">
                          <span
                            className={`rc-occupancy__fill${
                              percent >= 100
                                ? " is-full"
                                : percent >= 80
                                  ? " is-warn"
                                  : ""
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                        <span className="rc-occupancy__value">
                          {structure.occupied}/{structure.capacity}
                        </span>
                      </div>
                    )}

                    {!structure.available && suggestion && (
                      <p className="rc-structure__suggest">
                        {t("resp.res.nearest", {
                          name: tc(suggestion.name),
                          km: formatKm(suggestion.km),
                        })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("resp.res.listTitle")}</h2>
          <span className="rc-card__hint">
            {visible.length === 1
              ? t("resp.res.visibleCountOne")
              : t("resp.res.visibleCount", { count: visible.length })}
          </span>
        </div>

        <div className="rc-teams-toolbar">
          <div className="rc-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              placeholder={t("resp.res.searchPlaceholder")}
              aria-label={t("resp.res.searchPlaceholder")}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <label className="rc-filter">
            <span>{t("resp.res.sortLabel")}</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortMode)
              }
            >
              {SORT_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {t(item.labelKey)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rc-stack">
          <div
            className="rc-tabs"
            role="group"
            aria-label={t("resp.res.statusFilter")}
          >
            {statusCounts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rc-tab${status === item.id ? " is-active" : ""}`}
                aria-pressed={status === item.id}
                onClick={() => setStatus(item.id)}
              >
                {t(item.labelKey)} ({item.count})
              </button>
            ))}
          </div>

          <div
            className="rc-tabs"
            role="group"
            aria-label={t("resp.res.typeFilter")}
          >
            {typeCounts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rc-tab${type === item.id ? " is-active" : ""}`}
                aria-pressed={type === item.id}
                onClick={() => setType(item.id)}
              >
                {t(item.labelKey)} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rc-empty rc-empty--spaced">{t("resp.res.empty")}</p>
        ) : (
          <div className="rc-teams rc-teams--spaced">
            {visible.map((team) => {
              const currentIncident = assigned[team.id]
                ? mockIncidents.find(
                    (incident) => incident.id === assigned[team.id],
                  )
                : undefined;
              const km = formatKm(teamDistance(team));

              return (
                <article key={team.id} className="rc-team">
                  <div className="rc-team__head">
                    <span className="rc-team__name">{tc(team.name)}</span>
                    <span className={`rc-badge rc-badge--${tone(team.status)}`}>
                      {t(`resp.st.${tone(team.status)}`)}
                    </span>
                  </div>

                  <div className="rc-team__meta">
                    <span className="rc-badge">
                      {t(`resp.res.type${team.type}`)}
                    </span>
                    <span>
                      {t("resp.res.membersCount", {
                        count: team.members,
                      })}
                    </span>
                    <span>{tc(team.location)}</span>
                    <span>{t("resp.res.fromPc", { km })}</span>
                  </div>

                  <div className="rc-team__assignment">
                    <span className="rc-team__assignment-label">
                      {currentIncident
                        ? t("resp.res.currentAssignment")
                        : t("resp.res.noAssignment")}
                    </span>
                    {currentIncident && (
                      <Link
                        className="rc-team__assignment-link"
                        to={`/responsable/incidents/${currentIncident.id}`}
                      >
                        <span className="rc-badge rc-badge--active">
                          {incidentRef(currentIncident.id)}
                        </span>
                        <span>{tc(currentIncident.event)}</span>
                      </Link>
                    )}
                  </div>

                  <div className="rc-team__actions">
                    <button
                      type="button"
                      className={`rc-btn rc-btn--small ${
                        currentIncident ? "rc-btn--soft" : "rc-btn--green"
                      }`}
                      onClick={() => setDrawerTeam(team)}
                    >
                      {currentIncident
                        ? t("resp.res.reassign")
                        : t("resp.res.assign")}
                    </button>
                    {currentIncident && (
                      <button
                        type="button"
                        className="rc-btn rc-btn--soft rc-btn--small"
                        onClick={() => release(team)}
                      >
                        {t("resp.res.release")}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {drawerTeam && (
        <div className="rc-drawer-layer">
          <div
            className="rc-drawer__backdrop"
            onClick={() => setDrawerTeam(null)}
            aria-hidden="true"
          />

          <aside
            className="rc-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rc-drawer-title"
          >
            <header className="rc-drawer__head">
              <div className="rc-drawer__heading">
                <p className="rc-eyebrow rc-eyebrow--drawer">
                  {t("resp.res.drawerEyebrow")}
                </p>
                <h2 id="rc-drawer-title">{tc(drawerTeam.name)}</h2>
                <p className="rc-drawer__meta">
                  {t(`resp.res.type${drawerTeam.type}`)} ·{" "}
                  {t("resp.res.membersCount", {
                    count: drawerTeam.members,
                  })}{" "}
                  · {tc(drawerTeam.location)}
                </p>
              </div>

              <button
                type="button"
                className="rc-drawer__close"
                aria-label={t("common.close")}
                onClick={() => setDrawerTeam(null)}
              >
                ×
              </button>
            </header>

            <div className="rc-drawer__body">
              {drawerCurrent && (
                <div className="rc-drawer__current">
                  <div className="rc-drawer__current-text">
                    <span className="rc-drawer__section-label">
                      {t("resp.res.currentAssignment")}
                    </span>
                    <Link
                      to={`/responsable/incidents/${drawerCurrent.id}`}
                      onClick={() => setDrawerTeam(null)}
                    >
                      <span className="rc-badge rc-badge--active">
                        {incidentRef(drawerCurrent.id)}
                      </span>
                      {tc(drawerCurrent.event)}
                    </Link>
                    <span>{tc(drawerCurrent.location)}</span>
                  </div>
                  <button
                    type="button"
                    className="rc-btn rc-btn--outline-danger rc-btn--small"
                    onClick={() => {
                      release(drawerTeam);
                      setDrawerTeam(null);
                    }}
                  >
                    {t("resp.res.release")}
                  </button>
                </div>
              )}

              <div className="rc-drawer__section">
                <h3 className="rc-drawer__section-title">
                  {t("resp.res.suggestedIncidents")}
                </h3>
                <p className="rc-drawer__hint">
                  {t("resp.res.drawerHint")}
                </p>
              </div>

              {drawerSuggestions.length === 0 ? (
                <p className="rc-empty">{t("resp.res.noIncident")}</p>
              ) : (
                <ul className="rc-suggest">
                  {drawerSuggestions.map(({ incident, km, eta }) => {
                    const isCurrent =
                      assigned[drawerTeam.id] === incident.id;
                    return (
                      <li key={incident.id}>
                        <button
                          type="button"
                          className="rc-suggest__item"
                          disabled={isCurrent}
                          onClick={() => assign(drawerTeam, incident)}
                        >
                          <span className="rc-suggest__head">
                            <span
                              className={`rc-badge rc-badge--${tone(
                                incident.severity,
                              )}`}
                            >
                              {incidentRef(incident.id)}
                            </span>
                            <strong>{tc(incident.event)}</strong>
                            {isCurrent && (
                              <span className="rc-badge rc-badge--active">
                                {t("resp.res.currentBadge")}
                              </span>
                            )}
                          </span>
                          <span className="rc-suggest__location">
                            {tc(incident.location)} ·{" "}
                            {t(`severity.${tone(incident.severity)}`)} ·{" "}
                            {t(`resp.st.${tone(incident.status)}`)}
                          </span>
                          <span className="rc-suggest__metrics">
                            <span>
                              {t("resp.res.distance", {
                                km: formatKm(km),
                              })}
                            </span>
                            <span className="rc-suggest__eta">
                              {t("resp.res.eta", {
                                eta: formatEta(eta, lang),
                              })}
                            </span>
                            {!isCurrent && (
                              <span className="rc-suggest__cta">
                                {t("resp.res.assign")}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      {appuiOpen && (
        <ConfirmDialog
          title={t("resp.res.appuiTitle")}
          confirmLabel={t("resp.res.appuiSend")}
          onConfirm={sendAppui}
          onClose={() => setAppuiOpen(false)}
        >
          <p>{t("resp.res.appuiLead")}</p>

          <div className="rc-field">
            <label htmlFor="appui-wilaya">{t("resp.res.appuiWilaya")}</label>
            <select
              id="appui-wilaya"
              value={appuiWilaya}
              onChange={(event) => setAppuiWilaya(event.target.value)}
            >
              {NEIGHBOURS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="rc-field">
            <label htmlFor="appui-type">{t("resp.res.appuiType")}</label>
            <select
              id="appui-type"
              value={appuiType}
              onChange={(event) => setAppuiType(event.target.value)}
            >
              {TYPE_FILTERS.filter((item) => item.id !== "all").map(
                (item) => (
                  <option key={item.id} value={item.id}>
                    {t(item.labelKey)}
                  </option>
                ),
              )}
            </select>
          </div>
        </ConfirmDialog>
      )}
    </main>
  );
}

export default CrisisResources;

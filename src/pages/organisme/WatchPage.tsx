import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  FOREST_MEANS,
  FOREST_SIGNALS,
  HYDRO_STATIONS,
  ROAD_CLOSURES,
  WEATHER_ALERTS,
  loc,
  type ForestMean,
  type ForestSignal,
  type HydroStation,
  type ResourceStatus,
  type RoadClosure,
  type WeatherAlert,
} from "./organismeData";

type Tab = "hydro" | "forest" | "roads" | "weather";

type ModalState = "station" | "signal" | "mean" | "road" | null;

function riskTone(risk: ForestSignal["risk"] | WeatherAlert["level"]): string {
  if (risk === "critical") return "critical";
  if (risk === "high") return "high";
  if (risk === "medium") return "medium";
  return "low";
}

/** Cellule de veille : hydrologie, risques forestiers et météo. */
export default function WatchPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const [tab, setTab] = useState<Tab>(persona.id === "forestier" ? "forest" : "hydro");
  const [stations, setStations] = useState<HydroStation[]>(HYDRO_STATIONS);
  const [signals, setSignals] = useState<ForestSignal[]>(FOREST_SIGNALS);
  const [means, setMeans] = useState<ForestMean[]>(FOREST_MEANS);
  const [weather, setWeather] = useState<WeatherAlert[]>(WEATHER_ALERTS);
  const [roads, setRoads] = useState<RoadClosure[]>(ROAD_CLOSURES);
  const [selectedStation, setSelectedStation] = useState(
    HYDRO_STATIONS[0].id,
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [stationName, setStationName] = useState("");
  const [stationKind, setStationKind] = useState<HydroStation["kind"]>("oued");
  const [level, setLevel] = useState(3);
  const [vigilance, setVigilance] = useState(3);
  const [threshold, setThreshold] = useState(3.5);
  const [release, setRelease] = useState(0);

  const [roadName, setRoadName] = useState("");
  const [roadKind, setRoadKind] = useState<RoadClosure["kind"]>("road");
  const [roadReason, setRoadReason] = useState("");
  const [roadAlternate, setRoadAlternate] = useState("");

  const [signalName, setSignalName] = useState("");
  const [signalPlace, setSignalPlace] = useState("");
  const [signalRisk, setSignalRisk] = useState<ForestSignal["risk"]>("medium");
  const [signalArea, setSignalArea] = useState("");

  const [meanName, setMeanName] = useState("");
  const [meanQty, setMeanQty] = useState(1);

  const proposeFlood = (id: string) => {
    setStations((current) =>
      current.map((station) =>
        station.id === id ? { ...station, alertProposed: true } : station,
      ),
    );
    setToast(t("org.watch.floodProposed"));
  };

  const addStation = () => {
    if (stationName.trim().length < 3) return;
    const history = [level - 0.8, level - 0.6, level - 0.4, level - 0.3, level - 0.1, level];
    setStations((current) => [
      {
        id: `h-${Date.now()}`,
        name: { fr: stationName, ar: stationName },
        kind: stationKind,
        level,
        vigilance,
        threshold,
        trend: "stable",
        updated: "30/10/2026 · maintenant",
        alertProposed: false,
        release,
        history,
        floodZones: [],
      },
      ...current,
    ]);
    setModal(null);
    setToast(t("org.watch.stationAdded"));
  };

  const addRoad = () => {
    if (roadName.trim().length < 3) return;
    setRoads((current) => [
      {
        id: `rc-${Date.now()}`,
        name: {
          fr: roadName,
          ar: roadName,
        },
        kind: roadKind,
        reason: {
          fr: roadReason || "Cause à préciser",
          ar: roadReason || "السبب غير محدد",
        },
        alternate: {
          fr: roadAlternate || "—",
          ar: roadAlternate || "—",
        },
        reportedBy: loc(lang, persona.name),
        updated: "30/10/2026 · maintenant",
        status: "blocked",
      },
      ...current,
    ]);
    setModal(null);
    setRoadName("");
    setRoadReason("");
    setRoadAlternate("");
    setToast(t("org.watch.roadAdded"));
  };

  const confirmReopen = (road: RoadClosure) => {
    setRoads((current) =>
      current.map((item) =>
        item.id === road.id
          ? {
              ...item,
              status: "reopened",
              updated: "30/10/2026 · maintenant",
              confirmedBy: loc(lang, persona.name),
            }
          : item,
      ),
    );
    setToast(t("org.watch.reopened"));
  };

  const addSignal = () => {
    if (signalName.trim().length < 3) return;
    setSignals((current) => [
      {
        id: `f-${Date.now()}`,
        name: { fr: signalName, ar: signalName },
        place: { fr: signalPlace || "Béjaïa", ar: signalPlace || "بجاية" },
        risk: signalRisk,
        area: signalArea || "—",
        detected: "30/10/2026 · maintenant",
        status: "watching",
      },
      ...current,
    ]);
    setModal(null);
    setToast(t("org.watch.signalAdded"));
  };

  const addMean = () => {
    if (meanName.trim().length < 3) return;
    setMeans((current) => [
      {
        id: `fm-${Date.now()}`,
        name: { fr: meanName, ar: meanName },
        quantity: meanQty,
        status: "available",
      },
      ...current,
    ]);
    setModal(null);
    setToast(t("org.watch.meansAdded"));
  };

  const proposeWeather = () => {
    setWeather((current) => [
      {
        id: `w-${Date.now()}`,
        name: { fr: "Orages violents et grêle", ar: "عواصف عنيفة وبرد" },
        level: "high",
        zone: { fr: "Béjaïa · littoral", ar: "بجاية · الساحل" },
        validity: "30/10 · 15:00 → 31/10 · 06:00",
        status: "proposed",
      },
      ...current,
    ]);
    setToast(t("org.watch.weatherProposed"));
  };

  const updateMean = (id: string, status: ResourceStatus) => {
    setMeans((current) =>
      current.map((mean) => (mean.id === id ? { ...mean, status } : mean)),
    );
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.watch.eyebrow")}
        title={t("org.watch.title")}
        lead={t("org.watch.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--critical" />
              {stations.filter((station) => station.level > station.threshold).length}{" "}
              {t("org.watch.exceeded").toLowerCase()}
            </span>
            <span className="rc-chip">{t("org.watch.rule")}</span>
          </>
        }
        aside={
          <>
            {tab === "hydro" ? (
              <button
                type="button"
                className="rc-btn rc-btn--primary"
                onClick={() => setModal("station")}
              >
                + {t("org.watch.addStation")}
              </button>
            ) : null}
            {tab === "forest" ? (
              <button
                type="button"
                className="rc-btn rc-btn--primary"
                onClick={() => setModal("signal")}
              >
                + {t("org.watch.signal")}
              </button>
            ) : null}
            {tab === "weather" ? (
              <button
                type="button"
                className="rc-btn rc-btn--primary"
                onClick={proposeWeather}
              >
                {t("org.watch.weatherPropose")}
              </button>
            ) : null}
            {tab === "roads" ? (
              <button
                type="button"
                className="rc-btn rc-btn--primary"
                onClick={() => setModal("road")}
              >
                + {t("org.watch.addRoad")}
              </button>
            ) : null}
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.watch.title")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.watch.title")}>
            {(["hydro", "forest", "roads", "weather"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${tab === value ? " is-active" : ""}`}
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
              >
                {t(`org.watch.tab.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="rc-card__lead">{t("org.watch.lead")}</p>

        {tab === "hydro" ? (
          <>
            <div className="rc-table-wrap">
              <table className="rc-table org-table">
                <thead>
                  <tr>
                    <th>{t("org.watch.station")}</th>
                    <th>{t("org.watch.level")}</th>
                    <th>{t("org.watch.vigilance")}</th>
                    <th>{t("org.watch.threshold")}</th>
                    <th>{t("org.watch.release")}</th>
                    <th>{t("org.watch.trend")}</th>
                    <th>{t("org.common.status")}</th>
                    <th>{t("org.common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station) => {
                    const exceeded = station.level >= station.threshold;
                    const watching = station.level >= station.vigilance;
                    const statusKey = exceeded
                      ? "exceeded"
                      : watching
                        ? "vigilanceLevel"
                        : "normal";
                    return (
                      <tr
                        key={station.id}
                        className={
                          selectedStation === station.id ? "is-selected" : undefined
                        }
                        onClick={() => setSelectedStation(station.id)}
                      >
                        <td>
                          <div className="org-cell">
                            <strong>{loc(lang, station.name)}</strong>
                            <span className="org-cell__meta">
                              {t(`org.watch.kind.${station.kind}`)} · {station.updated}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong>{station.level.toFixed(1)} m</strong>
                        </td>
                        <td>{station.vigilance.toFixed(1)} m</td>
                        <td>{station.threshold.toFixed(1)} m</td>
                        <td>
                          {station.release
                            ? `${station.release} ${t("org.watch.m3s")}`
                            : "—"}
                        </td>
                        <td>{t(`org.watch.trend.${station.trend}`)}</td>
                        <td>
                          <span
                            className={`rc-badge rc-badge--${
                              exceeded ? "critical" : watching ? "medium" : "low"
                            }`}
                          >
                            {t(`org.watch.${statusKey}`)}
                          </span>
                        </td>
                        <td>
                          {exceeded && !station.alertProposed ? (
                            <button
                              type="button"
                              className="rc-btn rc-btn--danger rc-btn--small"
                              onClick={() => proposeFlood(station.id)}
                            >
                              {t("org.watch.proposeFlood")}
                            </button>
                          ) : station.alertProposed ? (
                            <span className="org-inline-ok">{t("org.watch.proposed")}</span>
                          ) : (
                            <span className="org-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(() => {
              const station =
                stations.find((item) => item.id === selectedStation) ??
                stations[0];
              if (!station) return null;
              const max = Math.max(...station.history, station.threshold);
              const min = Math.min(...station.history, station.vigilance);
              const span = max - min || 1;
              const points = station.history
                .map((value, index) => {
                  const x = (index / (station.history.length - 1)) * 100;
                  const y = 40 - ((value - min) / span) * 36;
                  return `${x},${y}`;
                })
                .join(" ");
              return (
                <div className="org-split" style={{ marginTop: 16 }}>
                  <div>
                    <div className="org-subhead">
                      <h3>{t("org.watch.graph")}</h3>
                      <span className="rc-card__hint">
                        {loc(lang, station.name)}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 100 44"
                      role="img"
                      aria-label={`${t("org.watch.graph")} — ${loc(lang, station.name)}`}
                      style={{ width: "100%", height: 140 }}
                    >
                      <line
                        x1="0"
                        y1={40 - ((station.threshold - min) / span) * 36}
                        x2="100"
                        y2={40 - ((station.threshold - min) / span) * 36}
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        opacity="0.55"
                      />
                      <line
                        x1="0"
                        y1={40 - ((station.vigilance - min) / span) * 36}
                        x2="100"
                        y2={40 - ((station.vigilance - min) / span) * 36}
                        stroke="currentColor"
                        strokeDasharray="1 3"
                        opacity="0.35"
                      />
                      <polyline
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      {station.history.map((value, index) => (
                        <circle
                          key={`${station.id}-${index}`}
                          cx={(index / (station.history.length - 1)) * 100}
                          cy={40 - ((value - min) / span) * 36}
                          r="1.1"
                          fill="currentColor"
                        />
                      ))}
                    </svg>
                    <p className="org-meta">
                      {t("org.watch.threshold")} · {station.threshold.toFixed(1)} m ·{" "}
                      {t("org.watch.vigilance")} · {station.vigilance.toFixed(1)} m
                    </p>
                  </div>

                  <div>
                    <div className="org-subhead">
                      <h3>{t("org.watch.floodZones")}</h3>
                    </div>
                    {station.floodZones && station.floodZones.length > 0 ? (
                      <ul className="org-signal-list">
                        {station.floodZones.map((zone) => (
                          <li key={zone.fr} className="org-signal">
                            <div className="org-signal__head">
                              <strong>{loc(lang, zone)}</strong>
                              <span className="rc-badge rc-badge--high">
                                {t("org.watch.floodZones")}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="org-note">{t("org.watch.noFloodZone")}</p>
                    )}
                    <p className="org-note">{t("org.watch.ruleShort")}</p>
                  </div>
                </div>
              );
            })()}
            <div className="rc-card__foot">
              <p className="org-note">{t("org.watch.rule")}</p>
            </div>
          </>
        ) : null}

        {tab === "forest" ? (
          <div className="org-split">
            <div>
              <div className="org-subhead">
                <h3>{t("org.watch.forestSignal")}</h3>
                <span className="rc-card__hint">
                  {signals.filter((signal) => signal.status === "proposed").length}{" "}
                  {t("org.watch.proposed").toLowerCase()}
                </span>
              </div>
              <ul className="org-signal-list">
                {signals.map((signal) => (
                  <li key={signal.id} className="org-signal">
                    <div className="org-signal__head">
                      <strong>{loc(lang, signal.name)}</strong>
                      <span className={`rc-badge rc-badge--${riskTone(signal.risk)}`}>
                        {t(`org.watch.forestRisk.${signal.risk}`)}
                      </span>
                    </div>
                    <p className="org-signal__meta">
                      <span>{loc(lang, signal.place)}</span>
                      <span>{signal.area}</span>
                      <span>{signal.detected}</span>
                    </p>
                    <div className="org-signal__foot">
                      <span className="org-muted">
                        {t(
                          signal.status === "proposed"
                            ? "org.watch.proposed"
                            : "org.watch.forestSignal",
                        )}
                      </span>
                      {signal.status === "watching" ? (
                        <button
                          type="button"
                          className="rc-btn rc-btn--soft rc-btn--small"
                          onClick={() => {
                            setSignals((current) =>
                              current.map((item) =>
                                item.id === signal.id
                                  ? { ...item, status: "proposed" }
                                  : item,
                              ),
                            );
                            setToast(t("org.watch.proposed"));
                          }}
                        >
                          {t("org.watch.proposeFlood")}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="org-subhead">
                <h3>{t("org.watch.forestMeans")}</h3>
                <button
                  type="button"
                  className="rc-btn rc-btn--soft rc-btn--small"
                  onClick={() => setModal("mean")}
                >
                  + {t("org.watch.meansTitle")}
                </button>
              </div>
              <ul className="org-mean-list">
                {means.map((mean) => (
                  <li key={mean.id} className="org-mean">
                    <div>
                      <strong>{loc(lang, mean.name)}</strong>
                      <p className="org-meta">
                        {t("org.common.quantity")} : {mean.quantity}
                      </p>
                    </div>
                    <select
                      className="org-select"
                      value={mean.status}
                      aria-label={t("org.common.status")}
                      onChange={(event) =>
                        updateMean(mean.id, event.target.value as ResourceStatus)
                      }
                    >
                      <option value="available">{t("org.resources.status.available")}</option>
                      <option value="engaged">{t("org.resources.status.engaged")}</option>
                      <option value="maintenance">
                        {t("org.resources.status.maintenance")}
                      </option>
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {tab === "roads" ? (
          <>
            <div className="org-subhead">
              <h3>{t("org.watch.roadsTitle")}</h3>
              <span className="rc-card__hint">
                {roads.filter((road) => road.status === "blocked").length}{" "}
                {t("org.watch.blocked").toLowerCase()}
              </span>
            </div>
            <p className="org-note">{t("org.watch.roadsLead")}</p>
            <div className="rc-table-wrap">
              <table className="rc-table org-table">
                <thead>
                  <tr>
                    <th>{t("org.watch.roadName")}</th>
                    <th>{t("org.common.type")}</th>
                    <th>{t("org.watch.reason")}</th>
                    <th>{t("org.evac.alternate")}</th>
                    <th>{t("org.watch.reportedBy")}</th>
                    <th>{t("org.common.status")}</th>
                    <th>{t("org.common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {roads.map((road) => (
                    <tr key={road.id}>
                      <td>
                        <div className="org-cell">
                          <strong>{loc(lang, road.name)}</strong>
                          <span className="org-cell__meta">
                            {road.updated}
                            {road.confirmedBy ? ` · ${road.confirmedBy}` : ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        {t(
                          road.kind === "bridge"
                            ? "org.watch.bridge"
                            : "org.watch.road",
                        )}
                      </td>
                      <td>{loc(lang, road.reason)}</td>
                      <td>{loc(lang, road.alternate)}</td>
                      <td>{road.reportedBy}</td>
                      <td>
                        <span
                          className={`rc-badge rc-badge--${
                            road.status === "blocked" ? "critical" : "low"
                          }`}
                        >
                          {t(
                            road.status === "blocked"
                              ? "org.watch.blocked"
                              : "org.watch.reopened",
                          )}
                        </span>
                      </td>
                      <td>
                        {road.status === "blocked" ? (
                          <button
                            type="button"
                            className="rc-btn rc-btn--primary rc-btn--small"
                            onClick={() => confirmReopen(road)}
                          >
                            {t("org.watch.reopen")}
                          </button>
                        ) : (
                          <span className="org-inline-ok">
                            {t("org.watch.reopened")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {tab === "weather" ? (
          <ul className="org-signal-list">
            {weather.map((alert) => (
              <li key={alert.id} className="org-signal">
                <div className="org-signal__head">
                  <strong>{loc(lang, alert.name)}</strong>
                  <span className={`rc-badge rc-badge--${riskTone(alert.level)}`}>
                    {t(`severity.${alert.level}`)}
                  </span>
                  <span
                    className={`rc-badge rc-badge--${
                      alert.status === "validated" ? "low" : "medium"
                    }`}
                  >
                    {t(
                      alert.status === "validated"
                        ? "authority.alerts.status.validated"
                        : "authority.alerts.status.proposed",
                    )}
                  </span>
                </div>
                <p className="org-signal__meta">
                  <span>{loc(lang, alert.zone)}</span>
                  <span>{t("org.watch.validity")} : {alert.validity}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {modal === "station" ? (
        <Modal title={t("org.watch.addStation")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addStation();
            }}
          >
            <div className="rc-field">
              <label htmlFor="station-name">{t("org.watch.stationName")} *</label>
              <input
                id="station-name"
                value={stationName}
                onChange={(event) => setStationName(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="station-kind">{t("org.watch.kind")}</label>
                <select
                  id="station-kind"
                  value={stationKind}
                  onChange={(event) =>
                    setStationKind(event.target.value as HydroStation["kind"])
                  }
                >
                  <option value="dam">{t("org.watch.kind.dam")}</option>
                  <option value="oued">{t("org.watch.kind.oued")}</option>
                  <option value="station">{t("org.watch.kind.station")}</option>
                </select>
              </div>
              <div className="rc-field">
                <label htmlFor="station-level">{t("org.watch.levelField")}</label>
                <input
                  id="station-level"
                  type="number"
                  step="0.1"
                  value={level}
                  onChange={(event) => setLevel(Number(event.target.value))}
                />
              </div>
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="station-vigilance">
                  {t("org.watch.vigilanceField")}
                </label>
                <input
                  id="station-vigilance"
                  type="number"
                  step="0.1"
                  value={vigilance}
                  onChange={(event) => setVigilance(Number(event.target.value))}
                />
              </div>
              <div className="rc-field">
                <label htmlFor="station-threshold">
                  {t("org.watch.thresholdField")}
                </label>
                <input
                  id="station-threshold"
                  type="number"
                  step="0.1"
                  value={threshold}
                  onChange={(event) => setThreshold(Number(event.target.value))}
                />
              </div>
            </div>
            <div className="rc-field">
              <label htmlFor="station-release">{t("org.watch.release")}</label>
              <input
                id="station-release"
                type="number"
                min={0}
                value={release}
                onChange={(event) => setRelease(Number(event.target.value))}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={stationName.trim().length < 3}
              >
                {t("org.common.save")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal === "signal" ? (
        <Modal title={t("org.watch.signalTitle")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addSignal();
            }}
          >
            <div className="rc-field">
              <label htmlFor="signal-name">{t("org.watch.forestSignal")} *</label>
              <input
                id="signal-name"
                value={signalName}
                onChange={(event) => setSignalName(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="signal-place">{t("org.common.place")}</label>
                <input
                  id="signal-place"
                  value={signalPlace}
                  onChange={(event) => setSignalPlace(event.target.value)}
                />
              </div>
              <div className="rc-field">
                <label htmlFor="signal-risk">{t("org.watch.risk")}</label>
                <select
                  id="signal-risk"
                  value={signalRisk}
                  onChange={(event) =>
                    setSignalRisk(event.target.value as ForestSignal["risk"])
                  }
                >
                  <option value="low">{t("org.watch.forestRisk.low")}</option>
                  <option value="medium">{t("org.watch.forestRisk.medium")}</option>
                  <option value="high">{t("org.watch.forestRisk.high")}</option>
                  <option value="critical">{t("org.watch.forestRisk.critical")}</option>
                </select>
              </div>
            </div>
            <div className="rc-field">
              <label htmlFor="signal-area">{t("org.watch.area")}</label>
              <input
                id="signal-area"
                value={signalArea}
                placeholder="12 ha"
                onChange={(event) => setSignalArea(event.target.value)}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={signalName.trim().length < 3}
              >
                {t("org.common.save")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal === "mean" ? (
        <Modal title={t("org.watch.meansTitle")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addMean();
            }}
          >
            <div className="rc-field">
              <label htmlFor="mean-name">{t("org.resources.equipment")} *</label>
              <input
                id="mean-name"
                value={meanName}
                onChange={(event) => setMeanName(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="mean-qty">{t("org.common.quantity")}</label>
              <input
                id="mean-qty"
                type="number"
                min={1}
                value={meanQty}
                onChange={(event) => setMeanQty(Number(event.target.value))}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(null)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={meanName.trim().length < 3}
              >
                {t("org.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal === "road" ? (
        <Modal title={t("org.watch.addRoad")} onClose={() => setModal(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addRoad();
            }}
          >
            <div className="rc-field">
              <label htmlFor="road-name">{t("org.watch.roadName")} *</label>
              <input
                id="road-name"
                value={roadName}
                onChange={(event) => setRoadName(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="road-kind">{t("org.common.type")}</label>
              <select
                id="road-kind"
                value={roadKind}
                onChange={(event) =>
                  setRoadKind(event.target.value as RoadClosure["kind"])
                }
              >
                <option value="road">{t("org.watch.road")}</option>
                <option value="bridge">{t("org.watch.bridge")}</option>
              </select>
            </div>
            <div className="rc-field">
              <label htmlFor="road-reason">{t("org.watch.reason")} *</label>
              <input
                id="road-reason"
                value={roadReason}
                onChange={(event) => setRoadReason(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="road-alternate">{t("org.evac.alternate")}</label>
              <input
                id="road-alternate"
                value={roadAlternate}
                onChange={(event) => setRoadAlternate(event.target.value)}
              />
            </div>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setModal(null)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={
                  roadName.trim().length < 3 || roadReason.trim().length < 3
                }
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

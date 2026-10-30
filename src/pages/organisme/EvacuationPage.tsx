import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  EVAC_ROUTES,
  EVAC_ZONES,
  MOVEMENTS,
  loc,
  type EvacRoute,
  type Movement,
} from "./organismeData";

function routeTone(status: EvacRoute["status"]): string {
  if (status === "blocked") return "critical";
  if (status === "restricted") return "medium";
  return "low";
}

function movementTone(status: Movement["status"]): string {
  if (status === "running") return "deployed";
  if (status === "done") return "low";
  return "standby";
}

/** Itinéraires, zones de rassemblement et déplacements. */
export default function EvacuationPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const [routes, setRoutes] = useState<EvacRoute[]>(EVAC_ROUTES);
  const [movements, setMovements] = useState<Movement[]>(MOVEMENTS);
  const [toast, setToast] = useState<string | null>(null);

  const allowed = ["security", "evacuation", "pc", "directeur"].includes(persona.id);

  const confirmReopen = (route: EvacRoute) => {
    setRoutes((current) =>
      current.map((item) =>
        item.id === route.id
          ? {
              ...item,
              status: "open",
              updated: "30/10/2026 · maintenant",
              confirmedBy: loc(lang, persona.name),
            }
          : item,
      ),
    );
    setToast(
      t("org.evac.confirmedBy", { name: loc(lang, persona.name) }),
    );
  };

  const updateMovement = (id: string, status: Movement["status"]) => {
    setMovements((current) =>
      current.map((movement) =>
        movement.id === id ? { ...movement, status } : movement,
      ),
    );
    setToast(t("org.common.saved"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.evac.eyebrow")}
        title={t("org.evac.title")}
        lead={t("org.evac.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {routes.filter((route) => route.status !== "open").length}{" "}
              {t("org.evac.disrupted").toLowerCase()}
            </span>
            <span className="rc-chip">
              {allowed ? t("org.evac.authorized") : t("org.evac.notAuthorized")}
            </span>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      {EVAC_ZONES.some(
        (zone) => zone.occupancy / zone.capacity >= 0.9,
      ) ? (
        <p className="orsec-alert orsec-alert--warn" role="alert">
          <strong>{t("org.evac.thresholdAlert")}</strong>
          <span>{t("org.evac.thresholdHint")}</span>
        </p>
      ) : null}

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.evac.routes")}</h2>
          <span className="rc-card__hint">{t("org.evac.authorized")}</span>
        </div>
        <div className="rc-table-wrap">
          <table className="rc-table org-table">
            <thead>
              <tr>
                <th>{t("org.evac.route")}</th>
                <th>{t("org.common.status")}</th>
                <th>{t("org.evac.alternate")}</th>
                <th>{t("org.common.updated")}</th>
                <th>{t("org.common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id}>
                  <td>
                    <strong>{loc(lang, route.name)}</strong>
                  </td>
                  <td>
                    <span className={`rc-badge rc-badge--${routeTone(route.status)}`}>
                      {t(`org.evac.routeStatus.${route.status}`)}
                    </span>
                  </td>
                  <td>{loc(lang, route.alternate)}</td>
                  <td>
                    <div className="org-cell">
                      <span>{route.updated}</span>
                      {route.confirmedBy ? (
                        <span className="org-cell__meta">{route.confirmedBy}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {route.status !== "open" && allowed ? (
                      <button
                        type="button"
                        className="rc-btn rc-btn--primary rc-btn--small"
                        onClick={() => confirmReopen(route)}
                      >
                        {t("org.evac.confirmOpen")}
                      </button>
                    ) : route.status === "open" ? (
                      <span className="org-inline-ok">
                        {t("org.evac.routeStatus.open")}
                      </span>
                    ) : (
                      <span className="org-muted">{t("org.evac.notAuthorized")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.evac.zones")}</h2>
            <span className="rc-card__hint">{t("org.common.occupancy")}</span>
          </div>

          <ul className="org-zone-list">
            {EVAC_ZONES.map((zone) => {
              const ratio = Math.round((zone.occupancy / zone.capacity) * 100);
              return (
                <li key={zone.id} className="org-zone">
                  <div className="org-zone__head">
                    <strong>{loc(lang, zone.name)}</strong>
                    <span
                      className={`rc-badge rc-badge--${
                        zone.status === "full"
                          ? "critical"
                          : zone.status === "open"
                            ? "low"
                            : "standby"
                      }`}
                    >
                      {zone.status === "full"
                        ? t("org.evac.routeStatus.blocked")
                        : zone.status === "open"
                          ? t("org.pco.open")
                          : t("org.resources.status.available")}
                    </span>
                  </div>
                  <div className="org-meter">
                    <div className="org-meter__label">
                      <span>
                        {t("org.common.capacity")} : {zone.capacity}
                      </span>
                      <strong>
                        {zone.occupancy} / {zone.capacity} · {ratio} %
                      </strong>
                    </div>
                    <div className="org-meter__track">
                      <span
                        className={`org-meter__fill${ratio > 90 ? " is-low" : ""}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.evac.movements")}</h2>
            <span className="rc-card__hint">{t("org.common.updated")}</span>
          </div>

          <ul className="org-move-list">
            {movements.map((movement) => (
              <li key={movement.id} className="org-move">
                <div>
                  <p className="org-move__route">
                    {loc(lang, movement.from)} → {loc(lang, movement.to)}
                  </p>
                  <p className="org-meta">
                    {movement.people} {t("org.evac.people").toLowerCase()} ·{" "}
                    {t("org.evac.eta")} {movement.eta}
                  </p>
                </div>
                <div className="org-move__side">
                  <span className={`rc-badge rc-badge--${movementTone(movement.status)}`}>
                    {t(`org.evac.movementStatus.${movement.status}`)}
                  </span>
                  <select
                    className="org-select"
                    value={movement.status}
                    aria-label={t("org.common.status")}
                    onChange={(event) =>
                      updateMovement(
                        movement.id,
                        event.target.value as Movement["status"],
                      )
                    }
                  >
                    <option value="planned">
                      {t("org.evac.movementStatus.planned")}
                    </option>
                    <option value="running">
                      {t("org.evac.movementStatus.running")}
                    </option>
                    <option value="done">{t("org.evac.movementStatus.done")}</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

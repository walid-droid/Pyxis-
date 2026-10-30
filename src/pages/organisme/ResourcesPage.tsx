import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import { ORG_VEHICLE_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  EQUIPMENT,
  TEAMS,
  VEHICLES,
  loc,
  type Equipment,
  type ResourceStatus,
  type Team,
  type Vehicle,
} from "./organismeData";

type Tab = "teams" | "vehicles" | "equipment";

function tone(status: ResourceStatus): string {
  if (status === "available") return "available";
  if (status === "engaged") return "engaged";
  return "standby";
}

/** Moyens de l'organisme : équipes, véhicules et équipements. */
export default function ResourcesPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const [tab, setTab] = useState<Tab>("teams");
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [toast, setToast] = useState<string | null>(null);
  const [exceptionTeam, setExceptionTeam] = useState<Team | null>(null);
  const [exceptionReason, setExceptionReason] = useState("");

  const updateTeam = (id: string, status: ResourceStatus) => {
    setTeams((current) =>
      current.map((team) => (team.id === id ? { ...team, status } : team)),
    );
    setToast(t("org.resources.updated"));
  };

  const updateVehicle = (id: string, status: ResourceStatus) => {
    setVehicles((current) =>
      current.map((vehicle) => (vehicle.id === id ? { ...vehicle, status } : vehicle)),
    );
    setToast(t("org.resources.updated"));
  };

  const updateEquipment = (id: string, status: ResourceStatus) => {
    setEquipment((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setToast(t("org.resources.updated"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.resources.eyebrow")}
        title={t("org.resources.title")}
        lead={t("org.resources.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--low" />
              {teams.filter((team) => team.status === "available").length}{" "}
              {t("org.resources.status.available").toLowerCase()}
            </span>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {teams.filter((team) => team.status === "engaged").length}{" "}
              {t("org.resources.status.engaged").toLowerCase()}
            </span>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.resources.title")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.resources.title")}>
            {(["teams", "vehicles", "equipment"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${tab === value ? " is-active" : ""}`}
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
              >
                {t(`org.resources.tab.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <p className="rc-card__lead">{t("org.resources.lead")}</p>

        {tab === "teams" ? (
          <ul className="org-res-list">
            {teams.map((team) => (
              <li key={team.id} className="org-res">
                <div className="org-res__main">
                  <div className="org-res__head">
                    <h3>{loc(lang, team.name)}</h3>
                    <span className={`rc-badge rc-badge--${tone(team.status)}`}>
                      {t(`org.resources.status.${team.status}`)}
                    </span>
                  </div>
                  <p className="org-res__meta">
                    <span>{loc(lang, team.type)}</span>
                    <span>
                      {t("org.resources.members")} : {team.members}
                    </span>
                    <span>
                      {t("org.resources.contact")} : {team.contact}
                    </span>
                  </p>
                  <p className="org-res__mission">
                    {team.mission
                      ? `${t("org.resources.currentMission")} : ${loc(lang, team.mission)}`
                      : t("org.missions.unassigned")}
                  </p>
                </div>
                <label className="org-res__action">
                  <span>{t("org.common.status")}</span>
                  <select
                    className="org-select"
                    value={team.status}
                    onChange={(event) =>
                      updateTeam(team.id, event.target.value as ResourceStatus)
                    }
                  >
                    <option value="available">{t("org.resources.status.available")}</option>
                    <option value="engaged">{t("org.resources.status.engaged")}</option>
                    <option value="maintenance">
                      {t("org.resources.status.maintenance")}
                    </option>
                  </select>
                  {team.status === "engaged" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--ghost-danger rc-btn--small"
                      onClick={() => {
                        setExceptionTeam(team);
                        setExceptionReason("");
                      }}
                    >
                      {t("org.resources.exception")}
                    </button>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "vehicles" ? (
          <ul className="org-res-list">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="org-res">
                <div className="org-res__main">
                  <div className="org-res__head">
                    <h3>{loc(lang, vehicle.name)}</h3>
                    <span className={`rc-badge rc-badge--${tone(vehicle.status)}`}>
                      {t(`org.resources.status.${vehicle.status}`)}
                    </span>
                  </div>
                  <p className="org-res__meta">
                    <span>{loc(lang, vehicle.type)}</span>
                    <span>
                      {t("org.resources.driver")} : {vehicle.driver}
                    </span>
                    <span>{loc(lang, vehicle.position)}</span>
                  </p>
                  <div className="org-meter" aria-label={`${t("org.resources.fuel")} ${vehicle.fuel}%`}>
                    <div className="org-meter__label">
                      <span>{t("org.resources.fuel")}</span>
                      <strong>{vehicle.fuel} %</strong>
                    </div>
                    <div className="org-meter__track">
                      <span
                        className={`org-meter__fill${vehicle.fuel < 40 ? " is-low" : ""}`}
                        style={{ width: `${vehicle.fuel}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="org-res__action">
                  <label>
                    <span>{t("org.common.status")}</span>
                    <select
                      className="org-select"
                      value={vehicle.status}
                      onChange={(event) =>
                        updateVehicle(vehicle.id, event.target.value as ResourceStatus)
                      }
                    >
                      <option value="available">{t("org.resources.status.available")}</option>
                      <option value="engaged">{t("org.resources.status.engaged")}</option>
                      <option value="maintenance">
                        {t("org.resources.status.maintenance")}
                      </option>
                    </select>
                  </label>
                  {persona.pages.includes("vehicle") ? (
                    <Link className="rc-btn rc-btn--soft rc-btn--small" to={ORG_VEHICLE_PATH}>
                      {t("org.resources.track")}
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "equipment" ? (
          <div className="rc-table-wrap">
            <table className="rc-table org-table">
              <thead>
                <tr>
                  <th>{t("org.resources.equipment")}</th>
                  <th>{t("org.resources.stock")}</th>
                  <th>{t("org.common.status")}</th>
                  <th>{t("org.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{loc(lang, item.name)}</strong>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`rc-badge rc-badge--${tone(item.status)}`}>
                        {t(`org.resources.status.${item.status}`)}
                      </span>
                    </td>
                    <td>
                      <select
                        className="org-select"
                        value={item.status}
                        aria-label={t("org.common.update")}
                        onChange={(event) =>
                          updateEquipment(item.id, event.target.value as ResourceStatus)
                        }
                      >
                        <option value="available">{t("org.resources.status.available")}</option>
                        <option value="engaged">{t("org.resources.status.engaged")}</option>
                        <option value="maintenance">
                          {t("org.resources.status.maintenance")}
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>

      {exceptionTeam ? (
        <Modal
          title={t("org.resources.exceptionTitle")}
          onClose={() => setExceptionTeam(null)}
        >
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              setExceptionTeam(null);
              setToast(t("org.resources.exceptionGranted"));
            }}
          >
            <p className="org-muted">{t("org.resources.exceptionLead")}</p>
            <p className="org-note">
              {loc(lang, exceptionTeam.name)} ·{" "}
              {t(`org.resources.status.${exceptionTeam.status}`)}
            </p>
            <div className="rc-field">
              <label htmlFor="exception-reason">
                {t("org.resources.exceptionReason")} *
              </label>
              <textarea
                id="exception-reason"
                value={exceptionReason}
                onChange={(event) => setExceptionReason(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setExceptionTeam(null)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--danger"
                disabled={exceptionReason.trim().length < 8}
              >
                {t("org.resources.exceptionBadge")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import OrgHero from "./OrgHero";
import {
  AMBULANCES,
  HEALTH_FACILITIES,
  VICTIMS,
  loc,
  type Triage,
  type Victim,
  type VictimStatus,
} from "./organismeData";

const TRIAGES: Triage[] = ["absolute", "relative", "urgent", "deceased"];
const STATUSES: VictimStatus[] = [
  "waiting",
  "treating",
  "evacuated",
  "hospitalized",
];

function triageTone(triage: Triage): string {
  if (triage === "absolute") return "critical";
  if (triage === "relative") return "high";
  if (triage === "urgent") return "medium";
  return "low";
}

function statusTone(status: VictimStatus): string {
  if (status === "hospitalized") return "low";
  if (status === "evacuated") return "deployed";
  if (status === "treating") return "medium";
  return "standby";
}

/** Bilan des victimes, urgences et ambulances (responsable médical / urgentiste). */
export default function VictimsPage() {
  const { t, lang } = useI18n();
  const [victims, setVictims] = useState<Victim[]>(VICTIMS);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState(30);
  const [triage, setTriage] = useState<Triage>("relative");
  const [hospital, setHospital] = useState("");

  const urgent = victims.filter((victim) => victim.triage === "absolute").length;
  const hospitalized = victims.filter(
    (victim) => victim.status === "hospitalized" || victim.status === "evacuated",
  ).length;
  const freeAmbulances = AMBULANCES.filter(
    (ambulance) => ambulance.status === "available",
  ).length;

  const updateVictim = (id: string, patch: Partial<Victim>) => {
    setVictims((current) =>
      current.map((victim) => (victim.id === id ? { ...victim, ...patch } : victim)),
    );
    setToast(t("org.victims.updated"));
  };

  const addVictim = () => {
    if (name.trim().length < 2) return;
    setVictims((current) => [
      {
        id: `p-${Date.now()}`,
        name,
        age,
        triage,
        status: "waiting",
        hospital: {
          fr: hospital || "Poste médical avancé",
          ar: hospital || "المركز الطبي المتقدم",
        },
        team: { fr: "Équipe médicale mobile", ar: "الفريق الطبي المتنقل" },
        updated: "30/10/2026 · maintenant",
      },
      ...current,
    ]);
    setModal(false);
    setName("");
    setHospital("");
    setToast(t("org.victims.added"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.victims.eyebrow")}
        title={t("org.victims.title")}
        lead={t("org.victims.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--critical" />
              {urgent} {t("org.victims.statUrgent").toLowerCase()}
            </span>
            <span className="rc-chip">
              {freeAmbulances} {t("org.victims.statAmbulances").toLowerCase()}
            </span>
          </>
        }
        aside={
          <>
            <button
              type="button"
              className="rc-btn rc-btn--ghost"
              onClick={() => setToast(t("org.victims.medicalRequested"))}
            >
              {t("org.victims.requestMedical")}
            </button>
            <button
              type="button"
              className="rc-btn rc-btn--primary"
              onClick={() => setModal(true)}
            >
              + {t("org.victims.add")}
            </button>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="stat-grid" aria-label={t("org.victims.title")}>
        <StatCard
          value={String(victims.length)}
          label={t("org.victims.statTotal")}
          badge={t("org.victims.eyebrow")}
          badgeTone="info"
        />
        <StatCard
          value={String(urgent)}
          label={t("org.victims.statUrgent")}
          badge={t("org.victims.triage.absolute")}
          badgeTone={urgent > 0 ? "danger" : "success"}
        />
        <StatCard
          value={String(hospitalized)}
          label={t("org.victims.statHospital")}
          badge={t("org.victims.status.evacuated")}
          badgeTone="success"
        />
        <StatCard
          value={String(freeAmbulances)}
          label={t("org.victims.statAmbulances")}
          badge={t("org.resources.status.available")}
          badgeTone={freeAmbulances > 0 ? "success" : "warning"}
        />
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.victims.title")}</h2>
          <span className="rc-card__hint">{t("org.victims.lead")}</span>
        </div>

        {victims.length === 0 ? (
          <p className="rc-empty">{t("org.victims.empty")}</p>
        ) : (
          <div className="rc-table-wrap">
            <table className="rc-table org-table">
              <thead>
                <tr>
                  <th>{t("org.victims.table.name")}</th>
                  <th>{t("org.victims.table.age")}</th>
                  <th>{t("org.victims.table.triage")}</th>
                  <th>{t("org.victims.table.status")}</th>
                  <th>{t("org.victims.table.hospital")}</th>
                  <th>{t("org.victims.table.team")}</th>
                  <th>{t("org.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {victims.map((victim) => (
                  <tr key={victim.id}>
                    <td>
                      <div className="org-cell">
                        <strong>{victim.name}</strong>
                        <span className="org-cell__meta">{victim.updated}</span>
                      </div>
                    </td>
                    <td>{victim.age}</td>
                    <td>
                      <select
                        className="org-select"
                        value={victim.triage}
                        aria-label={t("org.victims.triageField")}
                        onChange={(event) =>
                          updateVictim(victim.id, {
                            triage: event.target.value as Triage,
                          })
                        }
                      >
                        {TRIAGES.map((value) => (
                          <option key={value} value={value}>
                            {t(`org.victims.triage.${value}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="org-select"
                        value={victim.status}
                        aria-label={t("org.victims.table.status")}
                        onChange={(event) =>
                          updateVictim(victim.id, {
                            status: event.target.value as VictimStatus,
                          })
                        }
                      >
                        {STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {t(`org.victims.status.${value}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{loc(lang, victim.hospital)}</td>
                    <td>{loc(lang, victim.team)}</td>
                    <td>
                      <div className="org-actions">
                        <span className={`rc-badge rc-badge--${triageTone(victim.triage)}`}>
                          {t(`org.victims.triage.${victim.triage}`)}
                        </span>
                        <span className={`rc-badge rc-badge--${statusTone(victim.status)}`}>
                          {t(`org.victims.status.${victim.status}`)}
                        </span>
                        {victim.triage !== "absolute" ? (
                          <button
                            type="button"
                            className="rc-btn rc-btn--ghost-danger rc-btn--small"
                            onClick={() => {
                              updateVictim(victim.id, { triage: "absolute" });
                              setToast(t("org.victims.urgentSignaled"));
                            }}
                          >
                            {t("org.victims.signalUrgent")}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.victims.ambulances")}</h2>
          <span className="rc-card__hint">{t("org.resources.tab.vehicles")}</span>
        </div>
        <ul className="org-res-list">
          {AMBULANCES.map((ambulance) => (
            <li key={ambulance.id} className="org-res">
              <div className="org-res__main">
                <div className="org-res__head">
                  <h3>{ambulance.callSign}</h3>
                  <span
                    className={`rc-badge rc-badge--${
                      ambulance.status === "available"
                        ? "available"
                        : ambulance.status === "engaged"
                          ? "engaged"
                          : "standby"
                    }`}
                  >
                    {t(`org.resources.status.${ambulance.status}`)}
                  </span>
                </div>
                <p className="org-res__meta">
                  <span>{loc(lang, ambulance.position)}</span>
                  <span>{t("org.victims.crew")} : {ambulance.crew}</span>
                  <span>
                    {t("org.victims.assignedVictim")} : {ambulance.victim}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.victims.healthTitle")}</h2>
          <span className="rc-card__hint">{t("org.victims.healthLead")}</span>
        </div>
        <ul className="org-zone-list">
          {HEALTH_FACILITIES.map((facility) => {
            const ratio = Math.round((facility.occupied / facility.beds) * 100);
            return (
              <li key={facility.id} className="org-zone">
                <div className="org-zone__head">
                  <strong>{loc(lang, facility.name)}</strong>
                  <span
                    className={`rc-badge rc-badge--${
                      ratio >= 95 ? "critical" : ratio >= 80 ? "medium" : "low"
                    }`}
                  >
                    {ratio} % {t("org.victims.occupancyRate").toLowerCase()}
                  </span>
                </div>
                <div className="org-meter">
                  <div className="org-meter__label">
                    <span>
                      {t("org.victims.beds")} : {facility.beds} ·{" "}
                      {t("org.victims.emergencies")} : {facility.emergencies}
                    </span>
                    <strong>
                      {facility.occupied} / {facility.beds}
                    </strong>
                  </div>
                  <div className="org-meter__track">
                    <span
                      className={`org-meter__fill${ratio > 90 ? " is-low" : ""}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
                <p className="org-meta">
                  {t("org.victims.orientation")} :{" "}
                  {loc(lang, facility.orientation)}
                </p>
              </li>
            );
          })}
        </ul>
      </article>

      {modal ? (
        <Modal title={t("org.victims.addTitle")} onClose={() => setModal(false)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addVictim();
            }}
          >
            <p className="org-muted">{t("org.victims.addLead")}</p>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="victim-name">{t("org.victims.nameField")} *</label>
                <input
                  id="victim-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="rc-field">
                <label htmlFor="victim-age">{t("org.victims.ageField")}</label>
                <input
                  id="victim-age"
                  type="number"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(event) => setAge(Number(event.target.value))}
                />
              </div>
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="victim-triage">{t("org.victims.triageField")}</label>
                <select
                  id="victim-triage"
                  value={triage}
                  onChange={(event) => setTriage(event.target.value as Triage)}
                >
                  {TRIAGES.map((value) => (
                    <option key={value} value={value}>
                      {t(`org.victims.triage.${value}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rc-field">
                <label htmlFor="victim-hospital">{t("org.victims.hospitalField")}</label>
                <input
                  id="victim-hospital"
                  value={hospital}
                  onChange={(event) => setHospital(event.target.value)}
                />
              </div>
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(false)}>
                {t("org.common.cancel")}
              </button>
              <button type="submit" className="rc-btn rc-btn--primary" disabled={name.trim().length < 2}>
                {t("org.common.save")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

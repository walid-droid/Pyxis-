import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  ENGIN_EQUIPMENT,
  VEHICLES,
  loc,
  type ResourceStatus,
  type Vehicle,
  type VehicleEquipment,
} from "./organismeData";

/** Suivi de l'engin par son chef d'engin. */
export default function VehiclePage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const [vehicle, setVehicle] = useState<Vehicle>(VEHICLES[0]);
  const [equipment, setEquipment] = useState<VehicleEquipment[]>(ENGIN_EQUIPMENT);
  const [modal, setModal] = useState(false);
  const [breakdown, setBreakdown] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const checked = equipment.filter((item) => item.checked).length;
  const fuel = Math.max(0, Math.min(100, vehicle.fuel));

  const updateStatus = (status: ResourceStatus) => {
    setVehicle((current) => ({ ...current, status }));
    setToast(t("org.common.saved"));
  };

  const updatePosition = () => {
    setVehicle((current) => ({
      ...current,
      position: {
        fr: "RN26 · Akbou (position actualisée)",
        ar: "الطريق الوطنية 26 · أقبو (موقع محدث)",
      },
    }));
    setToast(t("org.vehicle.positionUpdated"));
  };

  const reportBreakdown = () => {
    if (breakdown.trim().length < 8) return;
    setVehicle((current) => ({ ...current, status: "maintenance" }));
    setModal(false);
    setBreakdown("");
    setToast(t("org.vehicle.breakdownReported"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.vehicle.eyebrow")}
        title={t("org.vehicle.title")}
        lead={t("org.vehicle.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {loc(lang, vehicle.name)} · {loc(lang, vehicle.type)}
            </span>
            <span className="rc-chip">{loc(lang, persona.name)}</span>
          </>
        }
        aside={
          <>
            <button
              type="button"
              className="rc-btn rc-btn--soft"
              onClick={updatePosition}
            >
              {t("org.vehicle.updatePosition")}
            </button>
            <button
              type="button"
              className="rc-btn rc-btn--ghost-danger"
              onClick={() => setModal(true)}
            >
              {t("org.vehicle.reportBreakdown")}
            </button>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{loc(lang, vehicle.name)}</h2>
            <span
              className={`rc-badge rc-badge--${
                vehicle.status === "available"
                  ? "available"
                  : vehicle.status === "engaged"
                    ? "engaged"
                    : "standby"
              }`}
            >
              {t(`org.vehicle.${vehicle.status}`)}
            </span>
          </div>

          <dl className="org-facts">
            <div>
              <dt>{t("org.vehicle.callSign")}</dt>
              <dd>{vehicle.id.toUpperCase()} · FPT-03</dd>
            </div>
            <div>
              <dt>{t("org.vehicle.type")}</dt>
              <dd>{loc(lang, vehicle.type)}</dd>
            </div>
            <div>
              <dt>{t("org.resources.driver")}</dt>
              <dd>{vehicle.driver}</dd>
            </div>
            <div>
              <dt>{t("org.vehicle.position")}</dt>
              <dd>{loc(lang, vehicle.position)}</dd>
            </div>
          </dl>

          <div className="org-meter">
            <div className="org-meter__label">
              <span>{t("org.vehicle.fuel")}</span>
              <strong>{fuel} %</strong>
            </div>
            <div className="org-meter__track">
              <span
                className={`org-meter__fill${fuel < 40 ? " is-low" : ""}`}
                style={{ width: `${fuel}%` }}
              />
            </div>
          </div>

          <div className="rc-card__foot">
            <div className="org-inline-field">
              <label htmlFor="engin-status">{t("org.vehicle.status")}</label>
              <select
                id="engin-status"
                className="org-select"
                value={vehicle.status}
                onChange={(event) =>
                  updateStatus(event.target.value as ResourceStatus)
                }
              >
                <option value="available">{t("org.vehicle.available")}</option>
                <option value="engaged">{t("org.vehicle.engaged")}</option>
                <option value="maintenance">{t("org.vehicle.maintenance")}</option>
              </select>
            </div>
            <button
              type="button"
              className="rc-btn rc-btn--soft rc-btn--small"
              onClick={() =>
                setVehicle((current) => ({
                  ...current,
                  fuel: Math.max(0, current.fuel - 5),
                }))
              }
            >
              - 5 %
            </button>
          </div>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.vehicle.equipment")}</h2>
            <span className="rc-card__hint">
              {checked} / {equipment.length}
            </span>
          </div>
          <p className="rc-card__lead">{t("org.vehicle.toggleHint")}</p>

          <ul className="org-checklist">
            {equipment.map((item) => (
              <li key={item.id}>
                <label className="rc-check">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(event) =>
                      setEquipment((current) =>
                        current.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, checked: event.target.checked }
                            : entry,
                        ),
                      )
                    }
                  />
                  {loc(lang, item.name)}
                </label>
                <span
                  className={`rc-badge rc-badge--${
                    item.checked ? "low" : "medium"
                  }`}
                >
                  {t(
                    item.checked
                      ? "org.vehicle.equipmentOk"
                      : "org.vehicle.equipmentMissing",
                  )}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {modal ? (
        <Modal title={t("org.vehicle.breakdownTitle")} onClose={() => setModal(false)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              reportBreakdown();
            }}
          >
            <p className="org-muted">{t("org.vehicle.breakdownLead")}</p>
            <div className="rc-field">
              <label htmlFor="breakdown">{t("org.vehicle.breakdownField")} *</label>
              <textarea
                id="breakdown"
                value={breakdown}
                placeholder={t("org.vehicle.breakdownPlaceholder")}
                onChange={(event) => setBreakdown(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(false)}>
                {t("org.common.cancel")}
              </button>
              <button type="submit" className="rc-btn rc-btn--danger" disabled={breakdown.trim().length < 8}>
                {t("org.common.send")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

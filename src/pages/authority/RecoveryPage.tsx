import { useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrsecOps } from "../../lib/orsecOps";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import OpsHero from "../shared/ops/OpsHero";
import SituationPanel from "../shared/ops/SituationPanel";
import { useOperator } from "../shared/ops/useOperator";
import "./authority.css";

type Tab = "damages" | "debris" | "fiches";

export default function RecoveryPage() {
  const { t, lang, tc } = useI18n();
  const {
    damages,
    addDamage,
    validateDamage,
    transmitDamage,
    debris,
    addDebris,
    updateDebris,
    fiches,
    attachFiche,
    compliance,
    toggleCompliance,
  } = useOrsecOps();
  const { plans, closeRecovery } = useOrsecPlans();
  const operator = useOperator();
  const plan = plans.wilaya;
  const [tab, setTab] = useState<Tab>("damages");
  const [toast, setToast] = useState<string | null>(null);
  const [damageModal, setDamageModal] = useState(false);
  const [debrisModal, setDebrisModal] = useState(false);

  const [commune, setCommune] = useState("");
  const [building, setBuilding] = useState("");
  const [inspection, setInspection] = useState<"green" | "orange" | "red">("orange");
  const [households, setHouseholds] = useState("0");
  const [amount, setAmount] = useState("0");

  const [debrisName, setDebrisName] = useState("");
  const [debrisZone, setDebrisZone] = useState("");
  const [tonnage, setTonnage] = useState("0");
  const [scheduled, setScheduled] = useState("");

  const close = () => {
    if (plan.situation !== "E") {
      setToast(t("ops.recovery.notInE"));
      return;
    }
    closeRecovery(plan.id, operator.name);
    setToast(t("ops.recovery.closed"));
  };

  const submitDamage = (event: FormEvent) => {
    event.preventDefault();
    if (commune.trim().length < 2 || building.trim().length < 3) return;
    addDamage({
      commune: { fr: commune, ar: commune },
      building: building.trim(),
      inspection,
      households: Number(households) || 0,
      amount: Number(amount) || 0,
    });
    setDamageModal(false);
    setCommune("");
    setBuilding("");
    setToast(t("ops.recovery.damageAdded"));
  };

  const submitDebris = (event: FormEvent) => {
    event.preventDefault();
    if (debrisName.trim().length < 3 || debrisZone.trim().length < 2) return;
    addDebris({
      name: { fr: debrisName.trim(), ar: debrisName.trim() },
      kind: "collection",
      zone: { fr: debrisZone, ar: debrisZone },
      tonnage: Number(tonnage) || 0,
      scheduled: scheduled || "—",
      status: "planned",
      environment: "watch",
    });
    setDebrisModal(false);
    setDebrisName("");
    setDebrisZone("");
    setToast(t("ops.recovery.debrisAdded"));
  };

  const money = (value: number) =>
    `${value.toLocaleString("fr-FR")} DA`;
  const totalAmount = damages.reduce((total, damage) => total + damage.amount, 0);
  const totalTonnage = debris.reduce((total, site) => total + site.tonnage, 0);
  const missingFiches = fiches.filter((fiche) => fiche.status !== "complete").length;

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.recovery.title")}
        title={t("ops.recovery.title")}
        lead={t("ops.recovery.lead")}
        chips={
          <>
            <span className="ops-chip">{t(`ops.situation.short.${plan.situation}`)}</span>
            <span className="ops-chip">
              {t("ops.recovery.damages")} · {damages.length}
            </span>
            <span className="ops-chip">
              {t("ops.recovery.debris")} · {totalTonnage} t
            </span>
            <span className="ops-chip">
              {t("ops.recovery.fiches")} · {missingFiches} {t("ops.recovery.ficheMissing").toLowerCase()}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            className="ops-btn ops-btn--primary"
            onClick={close}
            disabled={plan.situation !== "E"}
          >
            {t("ops.recovery.close")}
          </button>
        }
      />

      {toast ? (
        <p className={plan.situation === "E" ? "ops-toast" : "ops-error"} role="status">
          {toast}
        </p>
      ) : null}

      <SituationPanel level="wilaya" compact />

      <div className="ops-kpis">
        <div className="ops-kpi">
          <span className="ops-kpi__value">{money(totalAmount)}</span>
          <span className="ops-kpi__label">{t("ops.recovery.amount")}</span>
        </div>
        <div className="ops-kpi">
          <span className="ops-kpi__value">{damages.filter((item) => item.status === "transmitted").length}</span>
          <span className="ops-kpi__label">{t("ops.recovery.transmitted")}</span>
        </div>
        <div className="ops-kpi ops-kpi--warn">
          <span className="ops-kpi__value">{totalTonnage} t</span>
          <span className="ops-kpi__label">{t("ops.recovery.tonnage")}</span>
        </div>
        <div className="ops-kpi ops-kpi--danger">
          <span className="ops-kpi__value">{missingFiches}</span>
          <span className="ops-kpi__label">{t("ops.recovery.ficheMissing")}</span>
        </div>
      </div>

      <nav className="ops-tabs" aria-label={t("ops.recovery.title")}>
        {(
          [
            ["damages", t("ops.recovery.damages")],
            ["debris", t("ops.recovery.debris")],
            ["fiches", t("ops.recovery.fiches")],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`ops-tab${tab === id ? " is-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "damages" ? (
        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.recovery.damages")}</h2>
            <button
              type="button"
              className="ops-btn ops-btn--small ops-btn--primary"
              onClick={() => setDamageModal(true)}
            >
              {t("ops.recovery.addDamage")}
            </button>
          </div>
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("ops.req.ref")}</th>
                  <th>{t("ops.recovery.commune")}</th>
                  <th>{t("ops.recovery.building")}</th>
                  <th>{t("ops.recovery.status")}</th>
                  <th>{t("ops.recovery.amount")}</th>
                  <th>{t("ops.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {damages.map((damage) => (
                  <tr key={damage.id}>
                    <td>
                      <strong>{damage.ref}</strong>
                      <div className="ops-list__meta">{damage.at}</div>
                    </td>
                    <td>{tc(damage.commune.fr)}</td>
                    <td>
                      {tc(damage.building)}
                      <div className="ops-list__meta">
                        {damage.households > 0
                          ? `${damage.households} ${t("ops.recovery.households").toLowerCase()}`
                          : "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`ops-badge ops-badge--${damage.inspection === "red" ? "danger" : damage.inspection === "orange" ? "warn" : "ok"}`}>
                        {t(`ops.recovery.inspection.${damage.inspection}`)}
                      </span>
                      <div className="ops-list__meta">
                        {t(`ops.status.${damage.status === "draft" ? "draft" : damage.status}`)}
                      </div>
                    </td>
                    <td>{money(damage.amount)}</td>
                    <td>
                      <div className="ops-table__actions">
                        {damage.status === "draft" ? (
                          <button
                            type="button"
                            className="ops-btn ops-btn--small"
                            onClick={() => {
                              validateDamage(damage.id);
                              setToast(t("ops.recovery.validated"));
                            }}
                          >
                            {t("ops.recovery.validate")}
                          </button>
                        ) : null}
                        {damage.status === "validated" ? (
                          <button
                            type="button"
                            className="ops-btn ops-btn--small ops-btn--primary"
                            onClick={() => {
                              transmitDamage(damage.id);
                              setToast(t("ops.recovery.transmitted"));
                            }}
                          >
                            {t("ops.recovery.transmit")}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "debris" ? (
        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.recovery.debris")}</h2>
            <button
              type="button"
              className="ops-btn ops-btn--small ops-btn--primary"
              onClick={() => setDebrisModal(true)}
            >
              {t("ops.recovery.addDebris")}
            </button>
          </div>
          <div className="ops-grid">
            {debris.map((site) => (
              <article key={site.id} className="ops-sector">
                <div className="ops-sector__head">
                  <strong>{tc(site.name[lang])}</strong>
                  <span className={`ops-badge ops-badge--${site.status === "done" ? "ok" : site.status === "in_progress" ? "warn" : "muted"}`}>
                    {t(`ops.recovery.${site.status === "in_progress" ? "inProgress" : site.status}`)}
                  </span>
                </div>
                <div className="ops-sector__metrics">
                  <span>{tc(site.zone[lang])}</span>
                  <span>
                    {t("ops.recovery.tonnage")} <strong>{site.tonnage} t</strong>
                  </span>
                  <span>{site.scheduled}</span>
                  <span>
                    {t("ops.recovery.environment")}{" "}
                    <strong>{t(`ops.recovery.${site.environment}`)}</strong>
                  </span>
                </div>
                <select
                  className="ops-btn ops-btn--small"
                  value={site.status}
                  aria-label={t("ops.recovery.status")}
                  onChange={(event) => {
                    updateDebris(
                      site.id,
                      event.target.value as typeof site.status,
                    );
                    setToast(t("ops.common.save"));
                  }}
                >
                  <option value="planned">{t("ops.recovery.plan")}</option>
                  <option value="in_progress">{t("ops.recovery.inProgress")}</option>
                  <option value="done">{t("ops.recovery.done")}</option>
                </select>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "fiches" ? (
        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.recovery.fiches")}</h2>
            <span className="ops-card__hint">{t("ops.compliance.ficheHint")}</span>
          </div>
          <ul className="ops-list">
            {fiches.map((fiche) => (
              <li key={fiche.id} className="ops-list__item">
                <div className="ops-list__head">
                  <span className="ops-list__title">{tc(fiche.name[lang])}</span>
                  <span className={`ops-badge ops-badge--${fiche.status === "complete" ? "ok" : fiche.status === "partial" ? "warn" : "danger"}`}>
                    {t(`ops.recovery.fiche${fiche.status === "complete" ? "Complete" : fiche.status === "partial" ? "Partial" : "Missing"}`)}
                  </span>
                </div>
                <div className="ops-inline" style={{ justifyContent: "space-between" }}>
                  <span className="ops-list__meta">
                    {fiche.updatedAt ?? "—"}
                  </span>
                  {fiche.status !== "complete" ? (
                    <button
                      type="button"
                      className="ops-btn ops-btn--small"
                      onClick={() => {
                        attachFiche(fiche.id);
                        setToast(t("ops.recovery.attached"));
                      }}
                    >
                      {t("ops.recovery.attach")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <div className="ops-split-line" />
          <h3 className="ops-card__title" style={{ fontSize: "0.9rem" }}>
            {t("ops.compliance.checklist")}
          </h3>
          {compliance.slice(0, 3).map((item) => (
            <label key={item.id} className="ops-check">
              <input
                type="checkbox"
                checked={item.status === "done"}
                onChange={() => {
                  toggleCompliance(item.id);
                  setToast(t("ops.compliance.saved"));
                }}
              />
              <span className="ops-check__body">
                <span className="ops-check__label">{tc(item.label[lang])}</span>
                <span className="ops-check__meta">
                  {t("ops.compliance.due")} · {item.due}
                </span>
              </span>
            </label>
          ))}
        </section>
      ) : null}

      {damageModal ? (
        <Modal title={t("ops.recovery.addDamage")} onClose={() => setDamageModal(false)}>
          <form className="ops-form" onSubmit={submitDamage}>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.recovery.commune")} *</span>
                <input value={commune} onChange={(event) => setCommune(event.target.value)} required />
              </label>
              <label className="ops-field">
                <span>{t("ops.recovery.building")} *</span>
                <input value={building} onChange={(event) => setBuilding(event.target.value)} required />
              </label>
            </div>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.recovery.inspection.orange")}</span>
                <select
                  value={inspection}
                  onChange={(event) =>
                    setInspection(event.target.value as typeof inspection)
                  }
                >
                  <option value="green">{t("ops.recovery.inspection.green")}</option>
                  <option value="orange">{t("ops.recovery.inspection.orange")}</option>
                  <option value="red">{t("ops.recovery.inspection.red")}</option>
                </select>
              </label>
              <label className="ops-field">
                <span>{t("ops.recovery.households")}</span>
                <input type="number" min={0} value={households} onChange={(event) => setHouseholds(event.target.value)} />
              </label>
              <label className="ops-field">
                <span>{t("ops.recovery.amount")}</span>
                <input type="number" min={0} value={amount} onChange={(event) => setAmount(event.target.value)} />
              </label>
            </div>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setDamageModal(false)}>
                {t("ops.common.cancel")}
              </button>
              <button type="submit" className="ops-btn ops-btn--primary">
                {t("ops.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {debrisModal ? (
        <Modal title={t("ops.recovery.addDebris")} onClose={() => setDebrisModal(false)}>
          <form className="ops-form" onSubmit={submitDebris}>
            <label className="ops-field">
              <span>{t("ops.recovery.building")} *</span>
              <input value={debrisName} onChange={(event) => setDebrisName(event.target.value)} required />
            </label>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.recovery.commune")} *</span>
                <input value={debrisZone} onChange={(event) => setDebrisZone(event.target.value)} required />
              </label>
              <label className="ops-field">
                <span>{t("ops.recovery.tonnage")}</span>
                <input type="number" min={0} value={tonnage} onChange={(event) => setTonnage(event.target.value)} />
              </label>
              <label className="ops-field">
                <span>{t("ops.recovery.scheduled")}</span>
                <input value={scheduled} onChange={(event) => setScheduled(event.target.value)} />
              </label>
            </div>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setDebrisModal(false)}>
                {t("ops.common.cancel")}
              </button>
              <button type="submit" className="ops-btn ops-btn--primary">
                {t("ops.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

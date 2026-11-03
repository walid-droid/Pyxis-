import { useState } from "react";
import { useI18n } from "../../i18n";
import { useDb } from "../../services/useDb";
import { territoryLabel } from "../shared/v3/helpers";
import type { Plan } from "../../services/model";
import "../shared/v3/v3.css";

const EMERGENCY_KEYS = [
  { key: "publicInfo.emergency.protectiveCivil", number: "1021" },
  { key: "publicInfo.emergency.police", number: "17" },
  { key: "publicInfo.emergency.gendarmerie", number: "1055" },
  { key: "publicInfo.emergency.samu", number: "115" },
] as const;

export default function PublicInformationPage() {
  const { lang, t } = useI18n();
  const db = useDb();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const plans = db.plans.filter((plan) => !plan.exercice && plan.etat !== "leve");
  const alerts = db.misesEnAlerte.filter((alert) => !alert.levee);
  const types = db.reference.types;
  const selected = types.find((type) => type.code === selectedType) ?? null;

  const PLAN_LEVEL_KEYS: Record<Plan["niveau"], string> = {
    commune: "authority.plans.level.commune",
    wilaya: "authority.plans.level.wilaya",
    national: "authority.plans.level.national",
  };
  const PLAN_PHASE_KEYS: Record<Plan["phase"], string> = {
    urgence: "authority.plans.phase.urgence",
    evaluation_controle: "authority.plans.phase.evaluation_controle",
    rehabilitation: "authority.plans.phase.rehabilitation",
  };
  const PLAN_STATE_KEYS: Record<Plan["etat"], string> = {
    en_alerte: "authority.plans.state.en_alerte",
    declenche: "authority.plans.state.declenche",
    leve: "authority.plans.state.leve",
  };
  const ALERT_REASON_KEYS: Record<string, string> = {
    limitrophe: "authority.alerts.reason.limitrophe",
    niveau_superieur: "authority.alerts.reason.niveau_superieur",
  };

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("publicInfo.eyebrow")}</p>
          <h1 className="v3-title">{t("publicInfo.title")}</h1>
          <p className="v3-lead">{t("publicInfo.lead")}</p>
        </div>
        <div className="v3-actions">
          <span className="v3-badge">{t("publicInfo.official")}</span>
        </div>
      </header>

      <section className="v3-stats">
        <div className="v3-stat">
          <span className="v3-stat__label">{t("publicInfo.plans")}</span>
          <span className="v3-stat__value">{plans.length}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("publicInfo.alerts")}</span>
          <span className="v3-stat__value">{alerts.length}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("publicInfo.consignes")}</span>
          <span className="v3-stat__value">{types.length}</span>
        </div>
      </section>

      <section className="v3-grid v3-grid--2">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("publicInfo.plans")}</h2>
            <span className="v3-badge">{plans.length}</span>
          </header>
          {plans.length === 0 ? (
            <p className="v3-empty">{t("publicInfo.noPlans")}</p>
          ) : (
            <ul className="v3-list">
              {plans.map((plan: Plan) => (
                <li key={plan.id} className="v3-list__item">
                  <div className="v3-list__main">
                    <p className="v3-list__title">
                      {t(PLAN_LEVEL_KEYS[plan.niveau])} ·{" "}
                      {territoryLabel(db, plan.territoireId, lang)}
                    </p>
                    <p className="v3-list__meta">
                      {t(PLAN_PHASE_KEYS[plan.phase])} · {t(PLAN_STATE_KEYS[plan.etat])}
                    </p>
                    <p className="v3-list__meta">
                      {t("publicInfo.updated")} : {new Date(plan.majLe).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
                    </p>
                  </div>
                  <span
                    className={
                      plan.etat === "declenche"
                        ? "v3-badge v3-badge--red"
                        : "v3-badge v3-badge--amber"
                    }
                  >
                    {t(PLAN_STATE_KEYS[plan.etat])}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("publicInfo.alerts")}</h2>
            <span className="v3-badge">{alerts.length}</span>
          </header>
          {alerts.length === 0 ? (
            <p className="v3-empty">{t("publicInfo.noAlerts")}</p>
          ) : (
            <ul className="v3-list">
              {alerts.map((alert) => (
                <li key={alert.id} className="v3-list__item">
                  <div className="v3-list__main">
                    <p className="v3-list__title">
                      {territoryLabel(db, alert.territoireId, lang)}
                    </p>
                    <p className="v3-list__meta">
                      {t(ALERT_REASON_KEYS[alert.raison] ?? "authority.alerts.reason.limitrophe")} ·{" "}
                      {t("publicInfo.state")} : {t("publicInfo.active")}
                    </p>
                    <p className="v3-list__meta">
                      {t("publicInfo.updated")} : {new Date(alert.debut).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
                    </p>
                  </div>
                  <span className="v3-badge v3-badge--red">{t("publicInfo.active")}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="v3-grid">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("publicInfo.consignes")}</h2>
            <span className="v3-badge">{types.length}</span>
          </header>
          <div className="v3-inline">
            <select
              aria-label={t("publicInfo.consignesLead")}
              value={selectedType ?? ""}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              <option value="">—</option>
              {types.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.code} — {type.libelle[lang]}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="v3-note">{selected.consignes[lang]}</p>
            ) : null}
          </div>
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("publicInfo.emergency")}</h2>
          </header>
          <p className="v3-list__meta">{t("publicInfo.emergencyLead")}</p>
          <ul className="v3-list">
            {EMERGENCY_KEYS.map((item) => (
              <li key={item.key} className="v3-list__item">
                <div className="v3-list__main">
                  <p className="v3-list__title">{t(item.key)}</p>
                </div>
                <span className="v3-badge">{item.number}</span>
              </li>
            ))}
          </ul>
          <p className="v3-list__meta">
            {t("dashboard.emergency.call")} {t("publicInfo.emergency.protectiveCivil")}
          </p>
        </article>
      </section>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import { useOrsecPlans } from "../plan/PlanContext";
import {
  ORSEC_MODULES,
  SITUATION_KEYS,
  responsibleFor,
} from "../plan/orsecPlan";
import "./ops.css";

const READINESS_BADGE: Record<string, string> = {
  ready: "ok",
  partial: "warn",
  missing: "danger",
};

/** Mur d'images du PCF : situation, modules, main courante et indicateurs. */
export default function PcfWallPage({ exitTo }: { exitTo: string }) {
  const { t, tc, lang } = useI18n();
  const { plans } = useOrsecPlans();
  const {
    entries,
    patients,
    teams,
    requisitions,
    hazmat,
    shelters,
    messages,
  } = useOrsecOps();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const plan = plans.wilaya;
  const situation = SITUATION_KEYS[plan.situation];
  const activeEntries = useMemo(
    () => entries.slice(0, 8),
    [entries],
  );
  const triage = useMemo(
    () => ({
      red: patients.filter((patient) => patient.triage === "red").length,
      yellow: patients.filter((patient) => patient.triage === "yellow").length,
      green: patients.filter((patient) => patient.triage === "green").length,
      black: patients.filter((patient) => patient.triage === "black").length,
    }),
    [patients],
  );
  const pendingRequisitions = requisitions.filter(
    (item) =>
      item.status === "signed" ||
      item.status === "notified" ||
      item.status === "acknowledged",
  ).length;

  return (
    <div className="ops-wall" role="region" aria-label={t("ops.wall.title")}>
      <div className="ops-wall__head">
        <div className="ops-inline">
          <h1 className="ops-wall__title">{t("ops.wall.title")}</h1>
          <span className="ops-badge ops-badge--danger">{t("ops.wall.live")}</span>
        </div>
        <div className="ops-inline">
          <span className="ops-wall__clock">
            {now.toLocaleTimeString(lang === "ar" ? "ar-DZ" : "fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <Link className="ops-btn ops-btn--small" to={exitTo}>
            {t("ops.wall.exit")}
          </Link>
        </div>
      </div>

      <div className="ops-wall__grid">
        <section className="ops-wall__cell ops-wall__cell--situation">
          <h2>{t("ops.wall.situation")}</h2>
          <span className="ops-wall__big">
            {plan.situation} · {t(situation.shortKey)}
          </span>
          <span className="ops-muted">{t(situation.nameKey)}</span>
          <span className="ops-muted">
            {t("ops.pcf.transitions")} · {plan.transitions.length}
          </span>
          {plan.transitions[0] ? (
            <span className="ops-muted">{plan.transitions[0].at}</span>
          ) : null}
        </section>

        <section className="ops-wall__cell ops-wall__cell--modules">
          <h2>{t("ops.wall.modules")}</h2>
          <div className="ops-wall__module-grid">
            {ORSEC_MODULES.map((module) => {
              const readiness =
                plan.modules.find((item) => item.id === module.id)?.readiness ??
                "missing";
              const designation = responsibleFor(plan, module.id);
              return (
                <div key={module.id} className="ops-wall__module">
                  <strong>
                    {module.index}. {t(module.nameKey)}
                  </strong>
                  <span
                    className={`ops-badge ops-badge--${READINESS_BADGE[readiness]}`}
                  >
                    {t(`ops.modules.readiness.${readiness}`)}
                  </span>
                  <span className="ops-muted">
                    {designation ? designation.personName : t("ops.modules.noOwner")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ops-wall__cell ops-wall__cell--main">
          <h2>{t("ops.wall.mainCourante")}</h2>
          <div className="ops-mc">
            {activeEntries.length === 0 ? (
              <p className="ops-empty">{t("ops.mc.empty")}</p>
            ) : (
              activeEntries.map((entry) => (
                <article key={entry.id} className="ops-mc__item">
                  <div className="ops-mc__top">
                    <span className="ops-mc__at">{entry.at}</span>
                    <span className="ops-muted">{entry.scope}</span>
                  </div>
                  <p className="ops-mc__msg">{tc(entry.message)}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="ops-wall__cell ops-wall__cell--side">
          <h2>{t("ops.wall.pma")}</h2>
          <span className="ops-wall__big">{patients.length}</span>
          <ul className="ops-list">
            <li className="ops-inline" style={{ justifyContent: "space-between" }}>
              <span>{t("ops.pma.red")}</span>
              <strong>{triage.red}</strong>
            </li>
            <li className="ops-inline" style={{ justifyContent: "space-between" }}>
              <span>{t("ops.pma.yellow")}</span>
              <strong>{triage.yellow}</strong>
            </li>
            <li className="ops-inline" style={{ justifyContent: "space-between" }}>
              <span>{t("ops.pma.green")}</span>
              <strong>{triage.green}</strong>
            </li>
            <li className="ops-inline" style={{ justifyContent: "space-between" }}>
              <span>{t("ops.pma.black")}</span>
              <strong>{triage.black}</strong>
            </li>
          </ul>
        </section>

        <section className="ops-wall__cell ops-wall__cell--side">
          <h2>{t("ops.wall.means")}</h2>
          <span className="ops-wall__big">{teams.length}</span>
          <span className="ops-muted">
            {t("ops.means.engaged")} ·{" "}
            {teams.filter((team) => team.status === "engaged").length}
          </span>
          <span className="ops-muted">
            {t("ops.means.available")} ·{" "}
            {teams.filter((team) => team.status === "available").length}
          </span>
        </section>

        <section className="ops-wall__cell ops-wall__cell--side">
          <h2>{t("ops.wall.requisitions")}</h2>
          <span className="ops-wall__big">{pendingRequisitions}</span>
          <span className="ops-muted">
            {t("ops.common.total")} · {requisitions.length}
          </span>
        </section>

        <section className="ops-wall__cell ops-wall__cell--side">
          <h2>{t("ops.wall.hazmat")}</h2>
          <span className="ops-wall__big">
            {hazmat.active ? t("ops.map.active") : t("ops.map.inactive")}
          </span>
          <span className="ops-muted">
            {hazmat.product[lang]} · {hazmat.radius} m
          </span>
          <span className="ops-muted">
            {t("ops.map.wind")} {hazmat.windDirection}° / {hazmat.windSpeed} km/h
          </span>
        </section>

        <section className="ops-wall__cell ops-wall__cell--side">
          <h2>{t("ops.wall.shelters")}</h2>
          <span className="ops-wall__big">
            {shelters.open} / {shelters.capacity}
          </span>
          <span className="ops-muted">
            {t("ops.pcf.victims")} · {shelters.occupied}
          </span>
        </section>

        <section className="ops-wall__cell ops-wall__cell--side">
          <h2>{t("ops.pcf.communication")}</h2>
          <span className="ops-wall__big">
            {messages.filter((message) => message.status === "published").length}
          </span>
          <span className="ops-muted">
            {t("ops.comm.messages")} · {messages.length}
          </span>
        </section>
      </div>
    </div>
  );
}

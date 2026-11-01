import { useState } from "react";
import { Link } from "react-router";
import {
  AUTHORITY_COMMUNICATION_PATH,
  AUTHORITY_COMPLIANCE_PATH,
  AUTHORITY_PCF_WALL_PATH,
  AUTHORITY_RECOVERY_PATH,
  AUTHORITY_REQUISITIONS_PATH,
  ORG_PCO_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecOps } from "../../lib/orsecOps";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import {
  ORSEC_MODULES,
  modulesForLevel,
  responsibleFor,
} from "../shared/plan/orsecPlan";
import MainCourantePanel from "../shared/ops/MainCourantePanel";
import OpsHero from "../shared/ops/OpsHero";
import SituationPanel from "../shared/ops/SituationPanel";
import { useOperator } from "../shared/ops/useOperator";
import "./authority.css";

/** Espace autorité : console de commandement du PCF (situation + modules). */
export default function AuthorityPcfPage() {
  const { t, lang, tc } = useI18n();
  const { plans } = useOrsecPlans();
  const { addEntry, requisitions, victims, shelters, hazmat, entries, conflicts } =
    useOrsecOps();
  const operator = useOperator();
  const [toast, setToast] = useState<string | null>(null);
  const plan = plans.wilaya;

  const moduleIds =
    plan.activation?.moduleIds ??
    modulesForLevel(plan.level).map((module) => module.id);
  const modules = ORSEC_MODULES.filter((module) => moduleIds.includes(module.id));
  const assigned = modules.filter((module) => responsibleFor(plan, module.id)).length;
  const pendingRequests = requisitions.filter(
    (item) => item.status !== "completed" && item.status !== "cancelled",
  );
  const lastEntries = entries.filter((entry) => entry.scope === "pcf").slice(0, 3);

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.pcf.title")}
        title={t("ops.pcf.title")}
        lead={t("ops.pcf.lead")}
        chips={
          <>
            <span className="ops-chip">
              {t(`ops.situation.short.${plan.situation}`)}
            </span>
            <span className="ops-chip">
              {assigned}/{modules.length} {t("ops.pcf.assigned").toLowerCase()}
            </span>
            <span className="ops-chip">
              {t("ops.pcf.transitions")} · {plan.transitions.length}
            </span>
          </>
        }
        actions={
          <>
            <Link className="ops-btn" to={AUTHORITY_PCF_WALL_PATH}>
              {t("ops.pcf.wall")}
            </Link>
            <Link className="ops-btn" to={ORG_PCO_PATH}>
              {t("ops.pcf.openPco")}
            </Link>
          </>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <div className="ops-grid ops-grid--main">
        <div style={{ display: "grid", gap: 16 }}>
          <SituationPanel level="wilaya" />

          <section className="ops-card">
            <div className="ops-card__head">
              <h2 className="ops-card__title">{t("ops.pcf.modules")}</h2>
              <span className="ops-card__hint">
                {t("ops.common.count", { count: modules.length })}
              </span>
            </div>
            <div className="ops-grid">
              {modules.map((module) => {
                const designation = responsibleFor(plan, module.id);
                return (
                  <div key={module.id} className="ops-list__item">
                    <div className="ops-list__head">
                      <span className="ops-list__title">
                        {module.index}. {t(module.nameKey)}
                      </span>
                      <span
                        className={`ops-badge ops-badge--${
                          designation ? "ok" : "warn"
                        }`}
                      >
                        {designation
                          ? t("ops.pcf.assigned")
                          : t("ops.pcf.unassigned")}
                      </span>
                    </div>
                    <p className="ops-list__meta">
                      {designation
                        ? `${designation.personName} · ${t(designation.orgKey)}`
                        : t("ops.modules.noOwner")}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="ops-btn-row">
              <button
                type="button"
                className="ops-btn ops-btn--small"
                onClick={() => {
                  addEntry({
                    authorName: operator.name,
                    assignmentId: operator.assignmentId,
                    role: operator.roleLabel,
                    scope: "pcf",
                    category: "decision",
                    message:
                      lang === "ar"
                        ? "تم إشعار الوحدات 13 بالوضعية الحالية وطلب تأكيد الوسائل."
                        : "Les 13 modules sont notifiés de la situation et invités à confirmer leurs moyens.",
                  });
                  setToast(t("ops.pcf.contacted"));
                }}
              >
                {t("ops.pcf.contactModules")}
              </button>
              <Link className="ops-btn ops-btn--small" to={AUTHORITY_REQUISITIONS_PATH}>
                {t("ops.pcf.requisitions")} · {pendingRequests.length}
              </Link>
              <Link className="ops-btn ops-btn--small" to={AUTHORITY_COMMUNICATION_PATH}>
                {t("ops.pcf.communication")}
              </Link>
            </div>
          </section>

          <MainCourantePanel scope="pcf" compact limit={6} showConflicts />
        </div>

        <aside style={{ display: "grid", gap: 16 }}>
          <section className="ops-card">
            <div className="ops-card__head">
              <h2 className="ops-card__title">{t("ops.pcf.quickActions")}</h2>
            </div>
            <div className="ops-kpis">
              <div className="ops-kpi ops-kpi--danger">
                <span className="ops-kpi__value">{pendingRequests.length}</span>
                <span className="ops-kpi__label">{t("ops.pcf.requisitions")}</span>
              </div>
              <div className="ops-kpi ops-kpi--warn">
                <span className="ops-kpi__value">{victims.dead}</span>
                <span className="ops-kpi__label">{t("ops.pcf.victims")}</span>
              </div>
              <div className="ops-kpi ops-kpi--ok">
                <span className="ops-kpi__value">
                  {shelters.capacity - shelters.occupied}
                </span>
                <span className="ops-kpi__label">{t("ops.pcf.shelters")}</span>
              </div>
              <div className="ops-kpi ops-kpi--warn">
                <span className="ops-kpi__value">
                  {conflicts.filter((item) => item.status === "open").length}
                </span>
                <span className="ops-kpi__label">{t("ops.mc.conflicts")}</span>
              </div>
            </div>
            <p className="ops-muted">
              {t("ops.pcf.hazmat")} :{" "}
              <strong>{hazmat.active ? t("ops.map.active") : t("ops.map.inactive")}</strong>{" "}
              · {hazmat.radius} m
            </p>
            <div className="ops-btn-row">
              <Link className="ops-btn ops-btn--small" to={AUTHORITY_RECOVERY_PATH}>
                {t("ops.pcf.recovery")}
              </Link>
              <Link className="ops-btn ops-btn--small" to={AUTHORITY_COMPLIANCE_PATH}>
                {t("ops.pcf.compliance")}
              </Link>
            </div>
          </section>

          <section className="ops-card">
            <div className="ops-card__head">
              <h2 className="ops-card__title">{t("ops.pcf.lastTransition")}</h2>
            </div>
            {plan.transitions[0] ? (
              <div className="ops-list__item">
                <div className="ops-list__head">
                  <strong>
                    {plan.transitions[0].from} → {plan.transitions[0].to}
                  </strong>
                  <span className="ops-list__meta">{plan.transitions[0].at}</span>
                </div>
                <p className="ops-list__body">
                  {tc(plan.transitions[0].justification)}
                </p>
                <p className="ops-list__meta">
                  {plan.transitions[0].by} ·{" "}
                  <span className="ops-code">
                    {plan.transitions[0].signatureHash}
                  </span>
                </p>
              </div>
            ) : (
              <p className="ops-empty">{t("ops.pcf.noTransition")}</p>
            )}
          </section>

          <section className="ops-card">
            <div className="ops-card__head">
              <h2 className="ops-card__title">{t("ops.pcf.mainCourante")}</h2>
              <span className="ops-card__hint">{t("ops.pcf.readonly")}</span>
            </div>
            <ul className="ops-list">
              {lastEntries.map((entry) => (
                <li key={entry.id} className="ops-list__item">
                  <div className="ops-list__head">
                    <span className="ops-list__meta">{entry.at}</span>
                    <span className="ops-badge ops-badge--muted">
                      {t(`ops.mc.category.${entry.category}`)}
                    </span>
                  </div>
                  <p className="ops-list__body">{tc(entry.message)}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}

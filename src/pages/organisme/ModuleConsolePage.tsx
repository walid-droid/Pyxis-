import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useParams } from "react-router";
import { ORG_MODULES_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecOps } from "../../lib/orsecOps";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import {
  ORSEC_MODULES,
  responsibleFor,
  type ModuleId,
} from "../shared/plan/orsecPlan";
import MainCourantePanel from "../shared/ops/MainCourantePanel";
import { useOperator } from "../shared/ops/useOperator";
import OrgHero from "./OrgHero";

/** Console d'un module : moyens, réquisitions, ordres et comptes rendus. */
export default function ModuleConsolePage() {
  const { moduleId } = useParams();
  const { t, lang } = useI18n();
  const operator = useOperator();
  const { plans } = useOrsecPlans();
  const { requisitions, addEntry, teams } = useOrsecOps();
  const [order, setOrder] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const module = ORSEC_MODULES.find((item) => item.id === moduleId);

  const plan = plans.wilaya;
  const moduleRequisitions = useMemo(
    () => requisitions.filter((item) => item.moduleId === moduleId),
    [requisitions, moduleId],
  );

  if (!module) {
    return <Navigate to={ORG_MODULES_PATH} replace />;
  }

  const readiness =
    plan.modules.find((item) => item.id === (module.id as ModuleId))?.readiness ??
    "missing";
  const designation = responsibleFor(plan, module.id);
  const activeRequisitions = moduleRequisitions.filter(
    (item) => item.status !== "completed" && item.status !== "cancelled",
  ).length;
  const engagedTeams = teams.filter((team) => team.status === "engaged").length;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (order.trim().length < 8) return;
    addEntry({
      authorName: operator.name,
      assignmentId: operator.assignmentId,
      role: operator.roleLabel,
      scope: "module",
      category: "decision",
      message:
        lang === "ar"
          ? `[${t(module.nameKey)}] ${order.trim()}`
          : `[${t(module.nameKey)}] ${order.trim()}`,
    });
    setOrder("");
    setToast(t("ops.modules.orderSent"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={`${t("ops.modules.title")} · ${module.index}`}
        title={t(module.nameKey)}
        lead={t(module.orgKey)}
        backTo={ORG_MODULES_PATH}
        chips={
          <>
            <span className="rc-chip">
              {t(`ops.modules.readiness.${readiness}`)}
            </span>
            <span className="rc-chip">
              {t("ops.modules.owner")} ·{" "}
              {designation ? designation.personName : t("ops.modules.noOwner")}
            </span>
            <span className="rc-chip">
              {t("ops.modules.assignedTeams")} · {engagedTeams}
            </span>
          </>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <div className="ops-kpis">
        <div className={`ops-kpi ${readiness === "ready" ? "ops-kpi--ok" : "ops-kpi--warn"}`}>
          <span className="ops-kpi__value">
            {t(`ops.modules.readiness.${readiness}`)}
          </span>
          <span className="ops-kpi__label">{t("ops.modules.status")}</span>
        </div>
        <div className="ops-kpi">
          <span className="ops-kpi__value">{moduleRequisitions.length}</span>
          <span className="ops-kpi__label">{t("ops.modules.requisitions")}</span>
        </div>
        <div className="ops-kpi ops-kpi--warn">
          <span className="ops-kpi__value">{activeRequisitions}</span>
          <span className="ops-kpi__label">{t("ops.pcf.requisitions")}</span>
        </div>
        <div className="ops-kpi ops-kpi--ok">
          <span className="ops-kpi__value">{engagedTeams}</span>
          <span className="ops-kpi__label">{t("ops.modules.means")}</span>
        </div>
      </div>

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.modules.orders")}</h2>
          <span className="ops-card__hint">{t("ops.modules.roleManager")}</span>
        </div>
        <form className="ops-form" onSubmit={submit}>
          <label className="ops-field">
            <span>{t("ops.modules.order")} *</span>
            <textarea
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              placeholder={t("ops.modules.orderPlaceholder")}
              minLength={8}
              required
            />
          </label>
          <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="ops-btn ops-btn--primary"
              disabled={order.trim().length < 8}
            >
              {t("ops.modules.report")}
            </button>
          </div>
        </form>
      </section>

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.modules.requisitions")}</h2>
          <span className="ops-card__hint">
            {t("ops.common.count", { count: moduleRequisitions.length })}
          </span>
        </div>
        {moduleRequisitions.length === 0 ? (
          <p className="ops-empty">{t("ops.modules.emptyRequisitions")}</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("ops.req.ref")}</th>
                  <th>{t("ops.req.resource")}</th>
                  <th>{t("ops.req.owner")}</th>
                  <th>{t("ops.req.status")}</th>
                </tr>
              </thead>
              <tbody>
                {moduleRequisitions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.ref}</strong>
                      <div className="ops-list__meta">{item.createdAt}</div>
                    </td>
                    <td>
                      {item.resource[lang]}
                      <div className="ops-list__meta">{item.location[lang]}</div>
                    </td>
                    <td>{item.owner[lang]}</td>
                    <td>
                      <span className={`ops-badge ops-badge--${item.status === "completed" ? "ok" : item.status === "refused" || item.status === "timeout" ? "danger" : "warn"}`}>
                        {t(`ops.req.status.${item.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <MainCourantePanel scope="module" compact limit={8} />
    </main>
  );
}

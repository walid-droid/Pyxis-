import { Link } from "react-router";
import { ORG_MODULES_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import { ORSEC_MODULES, responsibleFor } from "../shared/plan/orsecPlan";
import OrgHero from "./OrgHero";

const READINESS_BADGE: Record<string, string> = {
  ready: "ok",
  partial: "warn",
  missing: "danger",
};

/** Liste des 13 modules d'intervention et accès à leur console. */
export default function ModulesPage() {
  const { t } = useI18n();
  const { plans } = useOrsecPlans();
  const plan = plans.wilaya;

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("ops.modules.title")}
        title={t("ops.modules.title")}
        lead={t("ops.modules.lead")}
        chips={
          <>
            <span className="rc-chip">
              {t("ops.modules.viewAll")} · {ORSEC_MODULES.length}
            </span>
            <span className="rc-chip">
              {t("ops.pcf.assigned")} · {plan.designations.length}
            </span>
          </>
        }
      />

      <p className="rc-card__lead">{t("ops.modules.hint")}</p>

      <div className="ops-grid">
        {ORSEC_MODULES.map((module) => {
          const readiness =
            plan.modules.find((item) => item.id === module.id)?.readiness ??
            "missing";
          const designation = responsibleFor(plan, module.id);
          return (
            <article key={module.id} className="ops-card">
              <div className="ops-card__head">
                <h2 className="ops-card__title">
                  {module.index}. {t(module.nameKey)}
                </h2>
                <span className={`ops-badge ops-badge--${READINESS_BADGE[readiness]}`}>
                  {t(`ops.modules.readiness.${readiness}`)}
                </span>
              </div>
              <p className="ops-card__lead">{t(module.orgKey)}</p>
              <p className="ops-list__meta">
                {t("ops.modules.owner")} ·{" "}
                <strong>
                  {designation ? designation.personName : t("ops.modules.noOwner")}
                </strong>
              </p>
              <div className="ops-card__foot">
                <Link
                  className="ops-btn ops-btn--small ops-btn--primary"
                  to={`${ORG_MODULES_PATH}/${module.id}`}
                >
                  {t("ops.modules.open")}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

import { useI18n } from "../../../i18n";
import {
  levelSelectsModules,
  modulesForLevel,
  responsibleFor,
  type ModuleId,
  type OrsecPlan,
  type Readiness,
} from "./orsecPlan";

const READINESS_TONE: Record<Readiness, string> = {
  ready: "low",
  partial: "medium",
  missing: "critical",
};

type Props = {
  plan: OrsecPlan;
  onDesignate: (moduleId: ModuleId) => void;
};

/** Modules d'intervention du décret (art. 43) et leur responsable. */
function PlanModuleList({ plan, onDesignate }: Props) {
  const { t } = useI18n();
  const modules = modulesForLevel(plan.level);

  if (!levelSelectsModules(plan.level)) {
    return (
      <p className="orsec-alert orsec-alert--info">
        {t("orsec.modules.nationalNotice")}
      </p>
    );
  }

  return (
    <ul className="rc-list orsec-modules">
      {modules.map((module) => {
        const responsible = responsibleFor(plan, module.id);
        const readiness =
          plan.modules.find((item) => item.id === module.id)?.readiness ??
          "missing";
        const engaged =
          plan.status === "active" &&
          Boolean(plan.activation?.moduleIds.includes(module.id));

        return (
          <li key={module.id}>
            <div className="rc-item rc-item--static orsec-module">
              <span className="orsec-module__index" aria-hidden="true">
                {module.index}
              </span>

              <div className="rc-item__body">
                <p className="rc-item__title">{t(module.nameKey)}</p>
                <p className="rc-item__meta">
                  <span>{t(module.orgKey)}</span>
                  <span
                    className={
                      responsible
                        ? "orsec-module__owner"
                        : "orsec-module__owner is-empty"
                    }
                  >
                    {responsible
                      ? responsible.personName
                      : t("orsec.modules.noOwner")}
                  </span>
                </p>
              </div>

              {engaged ? (
                <span className="rc-badge rc-badge--critical">
                  {t("orsec.modules.engaged")}
                </span>
              ) : (
                <span
                  className={`rc-badge rc-badge--${READINESS_TONE[readiness]}`}
                >
                  {t(`orsec.readiness.${readiness}`)}
                </span>
              )}

              <button
                type="button"
                className="rc-btn rc-btn--soft rc-btn--small"
                onClick={() => onDesignate(module.id)}
              >
                {responsible
                  ? t("orsec.action.reassign")
                  : t("orsec.action.designate")}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PlanModuleList;

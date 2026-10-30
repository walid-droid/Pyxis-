import { useI18n } from "../../../i18n";
import {
  currentStepIndex,
  isStepSkipped,
  type OrsecPlan,
} from "./orsecPlan";
import "./plan.css";

const STEPS = ["draft", "approved", "alert", "active", "lifted"] as const;

/** Frise du cycle de vie d'un plan ORSEC (BF17, RG-O13, RG-O14). */
function PlanStepper({ plan }: { plan: OrsecPlan }) {
  const { t } = useI18n();
  const current = currentStepIndex(plan);

  return (
    <ol className="orsec-steps" aria-label={t("orsec.step.label")}>
      {STEPS.map((step, index) => {
        const skipped = isStepSkipped(plan, index);
        const done = !skipped && index < current;
        const isCurrent = !skipped && index === current;
        const classes = [
          "orsec-step",
          skipped ? "is-skipped" : "",
          done ? "is-done" : "",
          isCurrent ? "is-current" : "",
        ]
          .filter(Boolean)
          .join(" ");

        let hint: string | null = null;
        if (skipped) hint = t("orsec.status.notRequired");
        else if (index === 0 && plan.status === "pending")
          hint = t("orsec.status.pending");
        else if (index === 3 && plan.status === "active" && plan.phase)
          hint = t(`orsec.phase.${plan.phase}`);
        else if (index === 4 && plan.liftedAt) hint = plan.liftedAt;

        return (
          <li
            key={step}
            className={classes}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="orsec-step__dot" aria-hidden="true">
              {done ? "✓" : skipped ? "–" : index + 1}
            </span>
            <span className="orsec-step__body">
              <span className="orsec-step__label">
                {t(`orsec.step.${step}`)}
              </span>
              {hint ? <span className="orsec-step__hint">{hint}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default PlanStepper;

import { useState, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import { useI18n } from "../../../i18n";
import { useOrsecPlans } from "./PlanContext";
import {
  DEMO_INCIDENTS,
  PEOPLE,
  designatedCount,
  levelOpensPosts,
  levelSelectsModules,
  modulesForLevel,
  recipientsFor,
  responsibleFor,
  type ActivationReason,
  type ModuleId,
  type OrsecPlan,
  type PlanPhase,
} from "./orsecPlan";
import "./plan.css";

/* ------------------------------------------------------------------ */
/* Approbation (RG-O14)                                                */
/* ------------------------------------------------------------------ */

export function ApprovalDialog({
  plan,
  onClose,
}: {
  plan: OrsecPlan;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { approve } = useOrsecPlans();
  const designated = designatedCount(plan);
  const totalModules = modulesForLevel(plan.level).length;
  const missing = totalModules - designated;
  const approver =
    plan.level === "commune"
      ? "Président de l'APC de Béjaïa"
      : "Wali de Béjaïa";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    approve(plan.id, approver);
    onClose();
  };

  return (
    <Modal title={t("orsec.approve.title")} onClose={onClose}>
      <form className="orsec-form" onSubmit={onSubmit}>
        <p className="orsec-form__lead">{t("orsec.approve.lead")}</p>

        <dl className="orsec-facts">
          <div>
            <dt>{t("orsec.fact.reference")}</dt>
            <dd>{plan.reference}</dd>
          </div>
          <div>
            <dt>{t("orsec.fact.version")}</dt>
            <dd>{plan.version}</dd>
          </div>
          <div>
            <dt>{t("orsec.fact.scope")}</dt>
            <dd>{t(plan.scopeKey)}</dd>
          </div>
          <div>
            <dt>{t("orsec.fact.approvedBy")}</dt>
            <dd>{approver}</dd>
          </div>
        </dl>

        {missing > 0 ? (
          <p className="orsec-alert orsec-alert--warn">
            {t("orsec.modules.missing", { count: missing })}
          </p>
        ) : null}

        <p className="orsec-alert orsec-alert--info">
          {t("orsec.approve.rule")}
        </p>

        <div className="orsec-dialog__foot">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={onClose}
          >
            {t("orsec.action.cancel")}
          </button>
          <button type="submit" className="rc-btn rc-btn--primary">
            {t("orsec.approve.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Mise en état d'alerte (RG-O02)                                      */
/* ------------------------------------------------------------------ */

export function AlertDialog({
  plan,
  onClose,
}: {
  plan: OrsecPlan;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { setAlert } = useOrsecPlans();
  const recipients = recipientsFor(plan.level);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setAlert(plan.id);
    onClose();
  };

  return (
    <Modal title={t("orsec.alert.title")} onClose={onClose}>
      <form className="orsec-form" onSubmit={onSubmit}>
        <p className="orsec-form__lead">{t("orsec.alert.lead")}</p>

        <p className="orsec-alert orsec-alert--warn">{t("orsec.alert.rule")}</p>

        <div className="orsec-alert orsec-alert--info">
          <strong>{t("orsec.activate.recipients")}</strong>
          <span className="orsec-chips">
            {recipients.map((key) => (
              <span className="orsec-chip" key={key}>
                {t(key)}
              </span>
            ))}
          </span>
        </div>

        <div className="orsec-dialog__foot">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={onClose}
          >
            {t("orsec.action.cancel")}
          </button>
          <button type="submit" className="rc-btn rc-btn--primary">
            {t("orsec.alert.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Déclenchement (UC-03, RG-O17)                                       */
/* ------------------------------------------------------------------ */

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function ActivationDialog({
  plan,
  by,
  onClose,
}: {
  plan: OrsecPlan;
  by: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { activate } = useOrsecPlans();
  const [reason, setReason] = useState<ActivationReason>("occurrence");
  const [incidentIds, setIncidentIds] = useState<number[]>([1]);
  const [moduleIds, setModuleIds] = useState<ModuleId[]>(["secours"]);
  const [error, setError] = useState<string | null>(null);

  const selectsModules = levelSelectsModules(plan.level);
  const modules = modulesForLevel(plan.level);
  const recipients = recipientsFor(plan.level);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (incidentIds.length === 0) {
      setError("orsec.activate.errorIncidents");
      return;
    }
    if (selectsModules && moduleIds.length === 0) {
      setError("orsec.activate.errorModules");
      return;
    }
    activate(plan.id, {
      reason,
      incidentIds,
      moduleIds: selectsModules ? moduleIds : [],
    }, by);
    onClose();
  };

  return (
    <Modal title={t("orsec.activate.title")} onClose={onClose}>
      <form className="orsec-form" onSubmit={onSubmit}>
        <p className="orsec-form__lead">{t("orsec.activate.lead")}</p>

        <fieldset className="orsec-field">
          <legend>{t("orsec.activate.reason")}</legend>
          <div className="orsec-choices">
            {(
              [
                "occurrence",
                "insufficient",
                "complementary",
              ] as ActivationReason[]
            ).map((value) => (
              <label className="orsec-check" key={value}>
                <input
                  type="radio"
                  name="activation-reason"
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                />
                <span>{t(`orsec.activate.reason.${value}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="orsec-field">
          <legend>{t("orsec.activate.incidents")}</legend>
          <p className="orsec-field__hint">
            {t("orsec.activate.incidentsHint")}
          </p>
          <div className="orsec-checks">
            {DEMO_INCIDENTS.map((incident) => (
              <label className="orsec-check" key={incident.id}>
                <input
                  type="checkbox"
                  checked={incidentIds.includes(incident.id)}
                  onChange={() =>
                    setIncidentIds((current) => toggle(current, incident.id))
                  }
                />
                <span>
                  <strong>{t(incident.key)}</strong>
                  <small>{incident.place}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {selectsModules ? (
          <fieldset className="orsec-field">
            <legend>
              {t("orsec.activate.modules")}
              <span className="orsec-field__count">
                {t("orsec.activate.modulesCount", {
                  count: moduleIds.length,
                  total: modules.length,
                })}
              </span>
            </legend>
            <p className="orsec-field__hint">
              {t("orsec.activate.modulesHint")}
            </p>
            <div className="orsec-checks orsec-checks--grid">
              {modules.map((module) => (
                <label className="orsec-check" key={module.id}>
                  <input
                    type="checkbox"
                    checked={moduleIds.includes(module.id)}
                    onChange={() =>
                      setModuleIds((current) => toggle(current, module.id))
                    }
                  />
                  <span>
                    <strong>{t(module.nameKey)}</strong>
                    <small>{t(module.orgKey)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="orsec-alert orsec-alert--info">
            {t("orsec.modules.nationalNotice")}
          </p>
        )}

        <div className="orsec-alert orsec-alert--info">
          <strong>{t("orsec.activate.recipients")}</strong>
          <span className="orsec-chips">
            {recipients.map((key) => (
              <span className="orsec-chip" key={key}>
                {t(key)}
              </span>
            ))}
          </span>
        </div>

        {levelOpensPosts(plan.level) ? (
          <p className="orsec-field__hint">{t("orsec.activate.posts")}</p>
        ) : null}

        {error ? (
          <p className="orsec-alert orsec-alert--danger" role="alert">
            {t(error)}
          </p>
        ) : null}

        <div className="orsec-dialog__foot">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={onClose}
          >
            {t("orsec.action.cancel")}
          </button>
          <button type="submit" className="rc-btn rc-btn--danger">
            {t("orsec.activate.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Levée (UC-04, RG-O07)                                               */
/* ------------------------------------------------------------------ */

export function LiftDialog({
  plan,
  onClose,
}: {
  plan: OrsecPlan;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { lift } = useOrsecPlans();
  const activation = plan.activation;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    lift(plan.id);
    onClose();
  };

  return (
    <Modal title={t("orsec.lift.title")} onClose={onClose}>
      <form className="orsec-form" onSubmit={onSubmit}>
        <p className="orsec-form__lead">{t("orsec.lift.lead")}</p>

        {activation ? (
          <dl className="orsec-facts">
            <div>
              <dt>{t("orsec.lift.startedAt")}</dt>
              <dd>{activation.at}</dd>
            </div>
            <div>
              <dt>{t("orsec.fact.phase")}</dt>
              <dd>{t(`orsec.phase.${activation.phase}`)}</dd>
            </div>
            <div>
              <dt>{t("orsec.lift.engaged")}</dt>
              <dd>
                {t("orsec.lift.engagedValue", {
                  count: activation.moduleIds.length,
                })}
              </dd>
            </div>
            <div>
              <dt>{t("orsec.fact.decidedBy")}</dt>
              <dd>{activation.by}</dd>
            </div>
          </dl>
        ) : null}

        <p className="orsec-alert orsec-alert--warn">
          {t("orsec.lift.pending")}
        </p>
        <p className="orsec-alert orsec-alert--info">
          {t("orsec.lift.reportNotice")}
        </p>

        <div className="orsec-dialog__foot">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={onClose}
          >
            {t("orsec.action.cancel")}
          </button>
          <button type="submit" className="rc-btn rc-btn--ghost-danger">
            {t("orsec.lift.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Changement de phase (RG-O13)                                        */
/* ------------------------------------------------------------------ */

const PHASES: PlanPhase[] = ["urgence", "evaluation", "rehabilitation"];

export function PhaseDialog({
  plan,
  onClose,
}: {
  plan: OrsecPlan;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { setPhase } = useOrsecPlans();
  const [phase, setPhaseValue] = useState<PlanPhase>(plan.phase ?? "urgence");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPhase(plan.id, phase);
    onClose();
  };

  return (
    <Modal title={t("orsec.phase.title")} onClose={onClose}>
      <form className="orsec-form" onSubmit={onSubmit}>
        <p className="orsec-form__lead">{t("orsec.phase.lead")}</p>

        <fieldset className="orsec-field">
          <legend>{t("orsec.phase.label")}</legend>
          <div className="orsec-choices">
            {PHASES.map((value) => (
              <label className="orsec-check" key={value}>
                <input
                  type="radio"
                  name="plan-phase"
                  value={value}
                  checked={phase === value}
                  onChange={() => setPhaseValue(value)}
                />
                <span>{t(`orsec.phase.${value}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="orsec-dialog__foot">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={onClose}
          >
            {t("orsec.action.cancel")}
          </button>
          <button type="submit" className="rc-btn rc-btn--primary">
            {t("orsec.phase.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Désignation d'un responsable de module (UC-02, RG-O04)              */
/* ------------------------------------------------------------------ */

export function DesignationDialog({
  plan,
  moduleId,
  by,
  onClose,
}: {
  plan: OrsecPlan;
  moduleId: ModuleId;
  by: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { designate } = useOrsecPlans();
  const module = modulesForLevel(plan.level).find(
    (item) => item.id === moduleId,
  );
  const current = responsibleFor(plan, moduleId);
  const [personId, setPersonId] = useState(current?.personId ?? "");
  const [error, setError] = useState<string | null>(null);
  const history = plan.designations
    .filter((item) => item.moduleId === moduleId)
    .slice(0, 4);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!personId) {
      setError("orsec.designate.error");
      return;
    }
    designate(plan.id, moduleId, personId, by);
    onClose();
  };

  if (!module) return null;

  return (
    <Modal title={t("orsec.designate.title")} onClose={onClose}>
      <form className="orsec-form" onSubmit={onSubmit}>
        <p className="orsec-form__lead">{t("orsec.designate.lead")}</p>

        <p className="orsec-designate__module">
          <span className="orsec-module__index" aria-hidden="true">
            {module.index}
          </span>
          <span>
            <strong>{t(module.nameKey)}</strong>
            <small>{t(module.orgKey)}</small>
          </span>
        </p>

        {current ? (
          <p className="orsec-alert orsec-alert--warn">
            {t("orsec.designate.endNotice", {
              name: current.personName,
              date: current.since,
            })}
          </p>
        ) : null}

        <label className="orsec-field">
          <span>{t("orsec.designate.person")}</span>
          <select
            value={personId}
            onChange={(event) => setPersonId(event.target.value)}
          >
            <option value="">{t("orsec.designate.choose")}</option>
            {PEOPLE.map((person) => (
              <option value={person.id} key={person.id}>
                {person.name} — {t(person.orgKey)}
              </option>
            ))}
          </select>
        </label>

        <p className="orsec-field__hint">{t("orsec.designate.territory")}</p>

        {history.length > 0 ? (
          <div className="orsec-field">
            <span className="orsec-field__label">
              {t("orsec.modules.history")}
            </span>
            <ul className="orsec-history">
              {history.map((item) => (
                <li key={item.id}>
                  <span>{item.personName}</span>
                  <span>{item.since}</span>
                  <span>{item.by}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="orsec-field__hint">{t("orsec.modules.noHistory")}</p>
        )}

        {error ? (
          <p className="orsec-alert orsec-alert--danger" role="alert">
            {t(error)}
          </p>
        ) : null}

        <div className="orsec-dialog__foot">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={onClose}
          >
            {t("orsec.action.cancel")}
          </button>
          <button type="submit" className="rc-btn rc-btn--primary">
            {t("orsec.designate.confirm")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

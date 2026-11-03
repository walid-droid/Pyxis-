import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { planLevelForRole } from "../../auth/access";
import { useI18n } from "../../i18n";
import { AUTHORITY_ESCALATION_PATH } from "../../config";
import { plansForSession } from "../../services/authority";
import { canTriggerNational, changePlanPhase, liftPlan, triggerPlan } from "../../services/plans";
import { moduleLabel, planModules } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { useSessionScope } from "../../services/useSessionScope";
import { formatDateTime, territoryLabel } from "../shared/v3/helpers";
import type { Plan, PlanPhase } from "../../services/model";

const PHASES: PlanPhase[] = ["urgence", "evaluation_controle", "rehabilitation"];

export default function AuthorityPlansPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const scope = useSessionScope();
  const [notice, setNotice] = useState<string | null>(null);

  if (!session || !scope) return null;
  const level = planLevelForRole(session.role);
  const territoryId =
    level === "national" ? "dz" : session.territory?.id ?? "";
  const plans = plansForSession(db, scope);
  const ownPlans = plans.filter((plan) => plan.niveau === level);
  const activeOwn = ownPlans.find((plan) => plan.etat !== "leve");
  const canTrigger = can("DECLENCHER_PLAN") && Boolean(level);
  const nationalReady = canTriggerNational(db);
  const triggerBlocked =
    level === "national" && !nationalReady && (!activeOwn || activeOwn.etat === "en_alerte");

  function isOwnPlan(plan: Plan): boolean {
    if (plan.niveau !== level) return false;
    if (level === "national") return true;
    return plan.territoireId === session!.territory?.id;
  }

  function handleTrigger() {
    if (!level || !territoryId) return;
    triggerPlan({ level, territoryId, actorId: session!.userId });
    setNotice(t("authority.plans.triggerDone"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.plans.title")}</p>
          <h1 className="v3-title">{t("authority.plans.title")}</h1>
          <p className="v3-lead">{t("authority.plans.lead")}</p>
        </div>
        <div className="v3-actions">
          {canTrigger && level ? (
            <button
              type="button"
              className="v3-btn v3-btn--primary"
              disabled={triggerBlocked || Boolean(activeOwn && activeOwn.etat === "declenche")}
              title={triggerBlocked ? t("authority.plans.nationalLocked") : undefined}
              onClick={handleTrigger}
            >
              {activeOwn && activeOwn.etat === "en_alerte"
                ? t("authority.plans.triggerPlan")
                : t("authority.plans.newPlan")}
            </button>
          ) : null}
          <Link className="v3-btn" to={AUTHORITY_ESCALATION_PATH}>
            {t("authority.nav.escalation")}
          </Link>
        </div>
      </header>

      {level === "national" && !nationalReady ? (
        <p className="v3-note">{t("authority.plans.nationalLocked")}</p>
      ) : null}

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      {plans.length === 0 ? (
        <p className="v3-empty">{t("authority.plans.empty")}</p>
      ) : (
        <div className="v3-grid">
          {plans.map((plan) => {
            const modules = planModules(db, plan.id);
            const englobed = db.plans.filter((item) => item.planEnglobantId === plan.id);
            const own = isOwnPlan(plan);
            const editable = own && plan.etat !== "leve";
            const canPhase = editable && can("CHANGER_PHASE");
            const canLift = editable && can("LEVER_PLAN");
            return (
              <article key={plan.id} className="v3-card">
                <header className="v3-card__head">
                  <div>
                    <h2 className="v3-card__title">
                      {t(`authority.plans.level.${plan.niveau}`)} ·{" "}
                      {territoryLabel(db, plan.territoireId, lang)}
                      {plan.exercice ? (
                        <span className="v3-badge v3-badge--brand" style={{ marginInlineStart: 8 }}>
                          {t("authority.plans.exerciseBadge")}
                        </span>
                      ) : null}
                    </h2>
                    <p className="v3-card__hint">
                      {t("authority.plans.createdAt")} : {formatDateTime(plan.creeLe, lang)} ·{" "}
                      {t("authority.plans.updatedAt")} : {formatDateTime(plan.majLe, lang)}
                    </p>
                  </div>
                  <span
                    className={`v3-badge ${
                      plan.etat === "declenche"
                        ? "v3-badge--red"
                        : plan.etat === "en_alerte"
                          ? "v3-badge--amber"
                          : "v3-badge--green"
                    }`}
                  >
                    {t(`authority.plans.state.${plan.etat}`)}
                  </span>
                </header>

                <div className="v3-row" style={{ alignItems: "flex-end" }}>
                  <div className="v3-field" style={{ flex: "0 1 240px" }}>
                    <label htmlFor={`phase-${plan.id}`}>{t("authority.plans.phase")}</label>
                    <select
                      id={`phase-${plan.id}`}
                      value={plan.phase}
                      disabled={!canPhase}
                      onChange={(event) => {
                        changePlanPhase(plan.id, event.target.value as PlanPhase, session.userId);
                        setNotice(t("authority.plans.phaseChanged"));
                      }}
                    >
                      {PHASES.map((phase) => (
                        <option key={phase} value={phase}>
                          {t(`authority.plans.phase.${phase}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="v3-actions" style={{ marginInlineStart: "auto" }}>
                    {canPhase ? (
                      <span className="v3-badge">
                        {t("authority.plans.changePhase")}
                      </span>
                    ) : null}
                    {canLift ? (
                      <button
                        type="button"
                        className="v3-btn v3-btn--small v3-btn--danger"
                        onClick={() => {
                          if (!window.confirm(t("authority.plans.liftConfirm"))) return;
                          liftPlan(plan.id, session.userId);
                          setNotice(t("authority.plans.liftDone"));
                        }}
                      >
                        {t("authority.plans.lift")}
                      </button>
                    ) : null}
                    {editable && plan.niveau !== "national" && can("DEMANDER_PLAN_SUPERIEUR") ? (
                      <Link className="v3-btn v3-btn--small" to={AUTHORITY_ESCALATION_PATH}>
                        {t("authority.plans.requestSuperior")}
                      </Link>
                    ) : null}
                  </div>
                </div>

                <hr className="v3-sep" style={{ margin: "14px 0" }} />

                <div className="v3-grid v3-grid--2">
                  <div>
                    <p className="v3-card__title">{t("authority.plans.modules")}</p>
                    {modules.length === 0 ? (
                      <p className="v3-empty">{t("authority.plans.noModules")}</p>
                    ) : (
                      <ul className="v3-list">
                        {modules.map((module) => (
                          <li key={module.moduleId} className="v3-list__item">
                            <span className="v3-list__title">
                              {moduleLabel(db, module.moduleId, lang)}
                            </span>
                            <span className="v3-badge">
                              {formatDateTime(module.mobiliseLe, lang)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="v3-card__title">{t("authority.plans.englobed")}</p>
                    {englobed.length === 0 ? (
                      <p className="v3-empty">{t("authority.plans.noEnglobed")}</p>
                    ) : (
                      <ul className="v3-list">
                        {englobed.map((child) => (
                          <li key={child.id} className="v3-list__item">
                            <span className="v3-list__title">
                              {t(`authority.plans.level.${child.niveau}`)} ·{" "}
                              {territoryLabel(db, child.territoireId, lang)}
                            </span>
                            <span className="v3-badge">
                              {t(`authority.plans.state.${child.etat}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

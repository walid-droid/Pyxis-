import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { planLevelForRole } from "../../auth/access";
import { useI18n } from "../../i18n";
import { closeExercise, triggerPlan } from "../../services/plans";
import { moduleLabel, planModules } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { formatDateTime, territoryLabel } from "../shared/v3/helpers";

export default function AuthorityExercisesPage() {
  const { session, can } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [notice, setNotice] = useState<string | null>(null);

  if (!session) return null;
  const level = planLevelForRole(session.role);
  const territoryId = level === "national" ? "dz" : session.territory?.id;
  const exercises = db.plans
    .filter(
      (plan) =>
        plan.exercice &&
        (session.role === "minister" || plan.territoireId === session.territory?.id),
    )
    .sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));

  function launch() {
    if (!level || !territoryId) return;
    triggerPlan({ level, territoryId, actorId: session!.userId, exercise: true });
    setNotice(t("authority.exercises.launched"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.exercises.title")}</p>
          <h1 className="v3-title">{t("authority.exercises.title")}</h1>
          <p className="v3-lead">{t("authority.exercises.lead")}</p>
        </div>
        {can("LANCER_EXERCICE") ? (
          <div className="v3-actions">
            <button type="button" className="v3-btn v3-btn--primary" onClick={launch}>
              {t("authority.exercises.launch")}
            </button>
          </div>
        ) : null}
      </header>

      <p className="v3-note v3-note--warn">{t("authority.exercises.warning")}</p>

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      {exercises.length === 0 ? (
        <p className="v3-empty">{t("authority.exercises.empty")}</p>
      ) : (
        <div className="v3-grid">
          {exercises.map((plan) => {
            const modules = planModules(db, plan.id);
            return (
              <article key={plan.id} className="v3-card">
                <header className="v3-card__head">
                  <div>
                    <h2 className="v3-card__title">
                      {t("authority.exercises.plan")} ·{" "}
                      {t(`authority.plans.level.${plan.niveau}`)} ·{" "}
                      {territoryLabel(db, plan.territoireId, lang)}
                    </h2>
                    <p className="v3-card__hint">
                      {t("authority.exercises.createdAt")} :{" "}
                      {formatDateTime(plan.creeLe, lang)}
                    </p>
                  </div>
                  <span
                    className={`v3-badge ${
                      plan.etat === "leve" ? "v3-badge--green" : "v3-badge--red"
                    }`}
                  >
                    {t(`authority.plans.state.${plan.etat}`)}
                  </span>
                </header>

                <p className="v3-list__meta">
                  {t("authority.exercises.phase")} :{" "}
                  {t(`authority.plans.phase.${plan.phase}`)}
                </p>
                <p className="v3-list__meta">
                  {t("authority.exercises.modules")} :{" "}
                  {modules.map((module) => moduleLabel(db, module.moduleId, lang)).join(" · ") ||
                    "—"}
                </p>

                {plan.etat !== "leve" ? (
                  <div className="v3-form__actions">
                    <button
                      type="button"
                      className="v3-btn v3-btn--small v3-btn--danger"
                      onClick={() => {
                        closeExercise(plan.id, session.userId);
                        setNotice(t("authority.exercises.lifted"));
                      }}
                    >
                      {t("authority.exercises.lift")}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

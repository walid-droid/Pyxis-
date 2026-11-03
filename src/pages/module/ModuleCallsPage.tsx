import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { confirmParticipation } from "../../services/interventions";
import { participationsForAgent, findPlan } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { formatDateTime, moduleLabel, territoryLabel } from "../shared/v3/helpers";

export default function ModuleCallsPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [notice, setNotice] = useState<string | null>(null);

  if (!session) return null;
  const participations = participationsForAgent(db, session.userId).sort(
    (a, b) => Date.parse(b.appeleLe) - Date.parse(a.appeleLe),
  );

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.calls.title")}</p>
          <h1 className="v3-title">{t("module.calls.title")}</h1>
          <p className="v3-lead">{t("module.calls.lead")}</p>
        </div>
      </header>

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      {participations.length === 0 ? (
        <p className="v3-empty">{t("module.calls.empty")}</p>
      ) : (
        <ul className="v3-list">
          {participations.map((participation) => {
            const plan = findPlan(db, participation.planId);
            return (
              <li key={participation.id} className="v3-list__item">
                <div className="v3-list__main">
                  <p className="v3-list__title">
                    {t("module.calls.plan")} :{" "}
                    {plan
                      ? `${t(`authority.plans.level.${plan.niveau}`)} · ${territoryLabel(db, plan.territoireId, lang)}`
                      : participation.planId}
                    <span
                      className={`v3-badge ${
                        participation.etat === "confirme"
                          ? "v3-badge--green"
                          : participation.etat === "libere"
                            ? ""
                            : "v3-badge--amber"
                      }`}
                      style={{ marginInlineStart: 8 }}
                    >
                      {t(`module.calls.state.${participation.etat}`)}
                    </span>
                  </p>
                  <p className="v3-list__meta">
                    {t("authority.staff.module")} : {moduleLabel(db, participation.moduleId, lang)}
                  </p>
                  <p className="v3-list__meta">
                    {t("module.calls.calledAt")} : {formatDateTime(participation.appeleLe, lang)}
                    {participation.confirmeLe
                      ? ` · ${t("module.calls.state.confirme")} : ${formatDateTime(participation.confirmeLe, lang)}`
                      : ""}
                  </p>
                </div>
                <div className="v3-list__side">
                  {participation.etat === "appele" ? (
                    <button
                      type="button"
                      className="v3-btn v3-btn--small v3-btn--primary"
                      onClick={() => {
                        confirmParticipation(participation.id, session.userId);
                        setNotice(t("module.calls.confirmed"));
                      }}
                    >
                      {t("module.calls.confirm")}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

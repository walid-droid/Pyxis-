import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import {
  activeInterventionsForModule,
  agentsOfModule,
  assignmentsForAgent,
  findModuleDef,
  findType,
  plansVisibleTo,
  routagesForModule,
  signalementsForModule,
} from "../../services/selectors";
import { useDb } from "../../services/useDb";
import CrisisMap, { type MapPin } from "../shared/crisis/CrisisMap";
import { gravityTone, moduleLabel, territoryLabel, typeLabel, userName } from "../shared/v3/helpers";
import "../shared/crisis/resp-crise.css";

const ROLE_KEY: Record<string, string> = {
  module_agent: "module.dashboard.roleAgent",
  module_manager: "module.dashboard.roleManager",
  module_director: "module.dashboard.roleDirector",
};

export default function ModuleDashboard() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();

  if (!session || !session.moduleId) return null;
  const moduleId = session.moduleId;
  const module = findModuleDef(db, moduleId);

  const routages = routagesForModule(db, moduleId, session.userId);
  const unread = routages.filter((routage) => !routage.luLe);
  const interventions = activeInterventionsForModule(db, moduleId);
  const agents = agentsOfModule(db, moduleId);
  const availableAgents = agents.filter((agent) => agent.disponible);
  const openTasks = assignmentsForAgent(db, session.userId).filter(
    (assignment) => assignment.etatTache !== "terminee",
  );

  const signalements = signalementsForModule(db, moduleId);
  const pinpointed = signalements.filter(
    (signalement) => signalement.latitude !== undefined && signalement.longitude !== undefined,
  );

  const pins: MapPin[] = pinpointed.map((signalement) => ({
    id: signalement.id,
    position: [signalement.latitude!, signalement.longitude!],
    title: typeLabel(db, signalement.typeId, lang),
    subtitle: `${territoryLabel(db, signalement.communeId, lang)} · ${signalement.id}`,
    tone: "incident",
    severity:
      signalement.gravite === "critique"
        ? "Critical"
        : signalement.gravite === "elevee"
          ? "High"
          : signalement.gravite === "moyenne"
            ? "Medium"
            : "Low",
  }));

  const plans = plansVisibleTo(db, session.territory?.level ?? "commune", session.territory?.id ?? "")
    .filter((plan) => db.modulesMobilises.some((m) => m.planId === plan.id && m.moduleId === moduleId))
    .filter((plan) => plan.etat !== "leve");

  const recent = signalements.slice(0, 5);

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.dashboard.module")}</p>
          <h1 className="v3-title">{module?.nom[lang] ?? t("module.dashboard.title")}</h1>
          <p className="v3-lead">{t("module.dashboard.lead")}</p>
        </div>
        <div className="v3-actions">
          <span className="v3-badge v3-badge--brand">
            {t(ROLE_KEY[session.role] ?? "module.dashboard.roleAgent")}
          </span>
          <span className="v3-badge">
            {territoryLabel(db, session.territory?.id, lang)}
          </span>
        </div>
      </header>

      <section className="v3-stats" aria-label={t("module.dashboard.title")}>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("module.dashboard.statAlerts")}</span>
          <span className="v3-stat__value">{unread.length}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("module.dashboard.statInterventions")}</span>
          <span className="v3-stat__value">{interventions.length}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("module.dashboard.statAvailable")}</span>
          <span className="v3-stat__value">
            {availableAgents.length}/{agents.length}
          </span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("module.dashboard.statTasks")}</span>
          <span className="v3-stat__value">{openTasks.length}</span>
        </div>
      </section>

      <section className="v3-grid v3-grid--2">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("module.dashboard.mapTitle")}</h2>
            <span className="v3-badge">{pinpointed.length}</span>
          </header>
          {pins.length > 0 ? (
            <div className="v3-map">
              <CrisisMap pins={pins} variant="mini" interactive={false} />
            </div>
          ) : (
            <p className="v3-empty">{t("module.dashboard.noMap")}</p>
          )}
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("module.dashboard.activePlan")}</h2>
          </header>
          {plans.length === 0 ? (
            <p className="v3-empty">{t("module.dashboard.noPlan")}</p>
          ) : (
            <ul className="v3-list">
              {plans.map((plan) => (
                <li key={plan.id} className="v3-list__item">
                  <div className="v3-list__main">
                    <p className="v3-list__title">
                      {t(`authority.plans.level.${plan.niveau}`)} ·{" "}
                      {territoryLabel(db, plan.territoireId, lang)}
                    </p>
                    <p className="v3-list__meta">
                      {t(`authority.plans.phase.${plan.phase}`)} ·{" "}
                      {t(`authority.plans.state.${plan.etat}`)}
                    </p>
                  </div>
                  <span
                    className={`v3-badge ${
                      plan.etat === "declenche" ? "v3-badge--red" : "v3-badge--amber"
                    }`}
                  >
                    {t(`authority.plans.state.${plan.etat}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="v3-card">
        <header className="v3-card__head">
          <h2 className="v3-card__title">{t("module.dashboard.staffTitle")}</h2>
          <span className="v3-badge">{t("module.dashboard.staffLead")}</span>
        </header>
        <div className="v3-table-wrap">
          <table className="v3-table">
            <thead>
              <tr>
                <th>{t("admin.accounts.name")}</th>
                <th>{t("authority.staff.module")}</th>
                <th>{t("authority.staff.state")}</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{userName(db, agent.id, lang)}</td>
                  <td>{moduleLabel(db, agent.moduleId, lang)}</td>
                  <td>
                    <span
                      className={`v3-badge ${
                        agent.disponible ? "v3-badge--green" : "v3-badge--amber"
                      }`}
                    >
                      {agent.disponible
                        ? t("module.dashboard.available")
                        : t("module.dashboard.unavailable")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="v3-card">
        <header className="v3-card__head">
          <h2 className="v3-card__title">{t("module.alerts.title")}</h2>
          <span className="v3-badge">{signalements.length}</span>
        </header>
        {recent.length === 0 ? (
          <p className="v3-empty">{t("module.dashboard.noAlerts")}</p>
        ) : (
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead>
                <tr>
                  <th>{t("module.alerts.type")}</th>
                  <th>{t("module.alerts.commune")}</th>
                  <th>{t("module.alerts.people")}</th>
                  <th>{t("module.alerts.state")}</th>
                  <th>{t("reports.confirmedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((signalement) => {
                  const type = findType(db, signalement.typeId);
                  return (
                    <tr key={signalement.id}>
                      <td>
                        <span className="v3-table__main">
                          {type?.code} · {type?.libelle[lang] ?? signalement.typeId}
                        </span>
                        <span className="v3-table__sub">{userName(db, signalement.auteurId, lang)}</span>
                      </td>
                      <td>{territoryLabel(db, signalement.communeId, lang)}</td>
                      <td>{signalement.personnesConcernees}</td>
                      <td>
                        <span className={`v3-badge v3-badge--${gravityTone(signalement.gravite)}`}>
                          {t(`module.state.${signalement.etat}`)}
                        </span>
                      </td>
                      <td>{signalement.confirmeLe ? "—" : t("reports.notVerifiedYet")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

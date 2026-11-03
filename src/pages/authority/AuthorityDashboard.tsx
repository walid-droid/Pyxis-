import { useMemo, useState } from "react";
import { Link } from "react-router";
import { planLevelForRole } from "../../auth/access";
import { useAuth } from "../../auth/AuthContext";
import Modal from "../../components/Modal";
import {
  AUTHORITY_COMMUNICATION_PATH,
  AUTHORITY_MAIN_COURANTE_PATH,
  AUTHORITY_PLANS_PATH,
  AUTHORITY_REQUESTS_PATH,
  AUTHORITY_REQUISITIONS_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import {
  alertsForSession,
  demandesForSession,
  plansForSession,
} from "../../services/authority";
import { mainCouranteForScope } from "../../services/mainCourante";
import {
  communiquesForScope,
  moduleStatusRows,
  orsecStats,
  pendingRequisitions,
} from "../../services/orsec";
import { signalementsForPlan } from "../../services/plans";
import { currentSituation, allowedSituationTargets, transitionSituation } from "../../services/situation";
import type { SituationCode } from "../../services/model";
import { useDb } from "../../services/useDb";
import { useSessionScope } from "../../services/useSessionScope";
import CrisisMap, { type MapPin } from "../shared/crisis/CrisisMap";
import MainCouranteFeed from "../shared/orsec/MainCouranteFeed";
import ModuleStatusGrid from "../shared/orsec/ModuleStatusGrid";
import { formatDateTime, territoryLabel, typeLabel, userName } from "../shared/v3/helpers";

const GRAVITY_SEVERITY: Record<string, MapPin["severity"]> = {
  faible: "Low",
  moyenne: "Medium",
  elevee: "High",
  critique: "Critical",
};

export default function AuthorityDashboard() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const scope = useSessionScope();
  const [target, setTarget] = useState<SituationCode | null>(null);
  const [justification, setJustification] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!session || !scope) return null;

  const situation = currentSituation(db, scope);
  const level = planLevelForRole(session.role);
  const ownTerritoryId = level === "national" ? "dz" : session.territory?.id;
  const targets = allowedSituationTargets(situation.code, session.role);
  const demandes = demandesForSession(db, scope);
  const pendingDemandes = demandes.filter((demande) => demande.etat === "en_attente");
  const plans = plansForSession(db, scope);
  const focusPlan =
    plans.find((plan) => plan.etat === "declenche") ?? plans.find((plan) => plan.etat === "en_alerte");
  const alerts = alertsForSession(db, scope).filter((alert) => !alert.levee);
  const stats = orsecStats(db, scope);
  const moduleRows = moduleStatusRows(db, focusPlan?.id);
  const requisitions = pendingRequisitions(db, scope);
  const communiques = communiquesForScope(db, scope);
  const latestPublished = communiques.find((communique) => communique.etat === "publie");
  const mainCourante = mainCouranteForScope(db, scope);

  const mapSignalements = useMemo(() => {
    if (!focusPlan) {
      return db.signalements.filter(
        (signalement) => signalement.etat !== "rejete" && signalement.latitude !== undefined,
      );
    }
    return signalementsForPlan(db, focusPlan.niveau, focusPlan.territoireId);
  }, [db, focusPlan]);

  const pins: MapPin[] = mapSignalements
    .filter(
      (signalement) =>
        signalement.latitude !== undefined && signalement.longitude !== undefined,
    )
    .map((signalement) => ({
      id: signalement.id,
      position: [signalement.latitude!, signalement.longitude!],
      title: typeLabel(db, signalement.typeId, lang),
      subtitle: `${territoryLabel(db, signalement.communeId, lang)} · ${signalement.id}`,
      tone: "incident",
      severity: signalement.gravite ? GRAVITY_SEVERITY[signalement.gravite] : "Medium",
    }));

  const shelterRate =
    stats.shelterCapacity > 0
      ? Math.round((stats.shelterOccupancy / stats.shelterCapacity) * 100)
      : 0;

  function submitTransition() {
    if (!target) return;
    const text = justification.trim();
    if (!text) return;
    const result = transitionSituation({
      planId: situation.plan?.id,
      level: level ?? undefined,
      territoryId: ownTerritoryId,
      from: situation.code,
      to: target,
      actorId: session!.userId,
      role: session!.role,
      justification: { fr: text, ar: text },
    });
    setTarget(null);
    setJustification("");
    setNotice(
      result
        ? t("situation.transitionDone", {
            from: situation.code,
            to: result.to,
          })
        : t("situation.transitionFailed"),
    );
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("authority.pcf.eyebrow")}</p>
          <h1 className="v3-title">{t("authority.pcf.title")}</h1>
          <p className="v3-lead">{t("authority.pcf.lead")}</p>
        </div>
        <div className="v3-actions">
          <Link className="v3-btn" to={AUTHORITY_REQUESTS_PATH}>
            {t("authority.dashboard.statRequests")} ({pendingDemandes.length})
          </Link>
          <Link className="v3-btn" to={AUTHORITY_REQUISITIONS_PATH}>
            {t("authority.nav.requisitions")} ({requisitions.length})
          </Link>
          <Link className="v3-btn" to={AUTHORITY_COMMUNICATION_PATH}>
            {t("authority.nav.communication")}
          </Link>
          <Link className="v3-btn v3-btn--primary" to={AUTHORITY_PLANS_PATH}>
            {t("authority.nav.plans")}
          </Link>
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

      <section
        className={`v3-situation-command v3-situation-command--${situation.code.toLowerCase()}`}
        aria-label={t("situation.current")}
      >
        <div className="v3-situation-command__badge" aria-hidden="true">
          {situation.code}
        </div>
        <div className="v3-situation-command__body">
          <p className="v3-situation-command__eyebrow">{t("situation.current")}</p>
          <h2 className="v3-situation-command__title">
            {t(`situation.${situation.code}.label`)}
          </h2>
          <p className="v3-situation-command__meta">
            {situation.plan
              ? [
                  t(`authority.plans.level.${situation.plan.niveau}`),
                  territoryLabel(db, situation.plan.territoireId, lang),
                  t(`authority.plans.phase.${situation.plan.phase}`),
                  situation.since
                    ? `${t("situation.since")} ${formatDateTime(situation.since, lang)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : t("situation.none")}
          </p>
          {situation.transition ? (
            <p className="v3-situation-command__proof">
              {t("situation.sealed")} #{situation.transition.signatureHash.slice(0, 8)} ·{" "}
              {userName(db, situation.transition.byId, lang)} ·{" "}
              {formatDateTime(situation.transition.at, lang)}
            </p>
          ) : null}
        </div>
        <div className="v3-situation-command__actions">
          {targets.length === 0 ? (
            <p className="v3-note">{t("situation.noTransition")}</p>
          ) : (
            targets.map((code) => (
              <button
                key={code}
                type="button"
                className="v3-btn v3-btn--primary"
                onClick={() => setTarget(code)}
              >
                {t("situation.transitionTo", { code })}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="v3-stats" aria-label={t("authority.pcf.statsLabel")}>
        <div className="v3-stat v3-stat--brand">
          <span className="v3-stat__label">{t("authority.pcf.statVictims")}</span>
          <span className="v3-stat__value">
            {stats.victimsDead}
            <span className="v3-stat__unit"> / {stats.victimsInjured}</span>
          </span>
          <span className="v3-stat__hint">
            {t("authority.pcf.victimsDetail", {
              dead: stats.victimsDead,
              injured: stats.victimsInjured,
              missing: stats.victimsMissing,
            })}
          </span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.pcf.statShelters")}</span>
          <span className="v3-stat__value">{stats.sheltersOpen}</span>
          <span className="v3-stat__hint">
            {t("authority.pcf.shelterDetail", {
              occupancy: stats.shelterOccupancy,
              capacity: stats.shelterCapacity,
              rate: shelterRate,
            })}
          </span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.pcf.statModules")}</span>
          <span className="v3-stat__value">{stats.modulesEngaged}/13</span>
          <span className="v3-stat__hint">
            {t("authority.pcf.modulesSaturated", { count: stats.modulesSaturated })}
          </span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.pcf.statPeople")}</span>
          <span className="v3-stat__value">{stats.personnesConcernees}</span>
          <span className="v3-stat__hint">
            {t("authority.pcf.peopleDetail", { count: stats.signalements })}
          </span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.pcf.statAlerts")}</span>
          <span className="v3-stat__value">{alerts.length}</span>
          <span className="v3-stat__hint">{t("authority.pcf.alertsDetail")}</span>
        </div>
        <div className="v3-stat">
          <span className="v3-stat__label">{t("authority.pcf.statRequisitions")}</span>
          <span className="v3-stat__value">{requisitions.length}</span>
          <span className="v3-stat__hint">{t("authority.pcf.requisitionsDetail")}</span>
        </div>
      </section>

      <section className="v3-grid v3-grid--2">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("authority.pcf.mapTitle")}</h2>
            <span className="v3-badge">{pins.length}</span>
          </header>
          {pins.length > 0 ? (
            <div className="v3-map">
              <CrisisMap pins={pins} variant="mini" interactive={false} />
            </div>
          ) : (
            <p className="v3-empty">{t("authority.pcf.noMap")}</p>
          )}
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("authority.pcf.queueTitle")}</h2>
            <span className="v3-badge v3-badge--amber">{requisitions.length}</span>
          </header>
          {requisitions.length === 0 ? (
            <p className="v3-empty">{t("authority.pcf.noRequisition")}</p>
          ) : (
            <ul className="v3-list">
              {requisitions.slice(0, 4).map((requisition) => (
                <li key={requisition.id} className="v3-list__item">
                  <div className="v3-list__main">
                    <p className="v3-list__title">{requisition.nature[lang]}</p>
                    <p className="v3-list__meta">
                      {requisition.moyen} · {requisition.proprietaire}
                    </p>
                    <p className="v3-list__meta">
                      {requisition.lieu[lang]} · {requisition.identifiant}
                    </p>
                  </div>
                  <div className="v3-list__side">
                    <span className={`v3-badge v3-badge--${requisition.urgence === "critique" ? "red" : "amber"}`}>
                      {t(`orsec.requisition.urgency.${requisition.urgence}`)}
                    </span>
                    <Link className="v3-btn v3-btn--small" to={AUTHORITY_REQUISITIONS_PATH}>
                      {t("authority.pcf.openQueue")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="v3-card">
        <header className="v3-card__head">
          <h2 className="v3-card__title">{t("orsec.modules.title")}</h2>
          <span className="v3-badge">{t("orsec.modules.engaged", { count: stats.modulesEngaged })}</span>
        </header>
        <ModuleStatusGrid rows={moduleRows} />
      </section>

      <section className="v3-grid v3-grid--2">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("authority.pcf.communicationTitle")}</h2>
            <Link className="v3-btn v3-btn--small" to={AUTHORITY_COMMUNICATION_PATH}>
              {t("authority.nav.communication")}
            </Link>
          </header>
          {latestPublished ? (
            <div className="v3-communique">
              <span className="v3-badge v3-badge--green">
                {t("orsec.communique.state.publie")}
              </span>
              <h3 className="v3-communique__title">{latestPublished.titre[lang]}</h3>
              <p className="v3-communique__message">{latestPublished.message[lang]}</p>
              <p className="v3-list__meta">
                {t("orsec.communique.coverage", { rate: latestPublished.couverture })} ·{" "}
                {formatDateTime(latestPublished.publieLe, lang)}
              </p>
            </div>
          ) : (
            <p className="v3-empty">{t("authority.pcf.noCommunique")}</p>
          )}
          <p className="v3-note">
            {t("authority.pcf.drafts", { count: stats.draftCommuniques })}
          </p>
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("authority.pcf.mainCouranteTitle")}</h2>
            <Link className="v3-btn v3-btn--small" to={AUTHORITY_MAIN_COURANTE_PATH}>
              {t("authority.nav.mainCourante")}
            </Link>
          </header>
          <MainCouranteFeed entries={mainCourante} limit={5} />
        </article>
      </section>

      {target ? (
        <Modal
          title={t("situation.transitionTitle", { from: situation.code, to: target })}
          onClose={() => {
            setTarget(null);
            setJustification("");
          }}
        >
          <div className="v3-form">
            <p className="v3-note v3-note--warn">{t("situation.justificationHelp")}</p>
            <label className="v3-field">
              <span>{t("situation.justification")}</span>
              <textarea
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                placeholder={t("situation.justificationPlaceholder")}
                required
              />
            </label>
            <div className="v3-form__actions">
              <button
                type="button"
                className="v3-btn"
                onClick={() => {
                  setTarget(null);
                  setJustification("");
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="v3-btn v3-btn--primary"
                disabled={justification.trim().length === 0}
                onClick={submitTransition}
              >
                {t("situation.confirm", { code: target })}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

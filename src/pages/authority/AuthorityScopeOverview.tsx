import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";

/** Wilayas agrégées pour la vue nationale du ministre (P1). */
const NATIONAL_WILAYAS = [
  { key: "alger", level: "high", incidents: 7, teams: 12, plans: 2, victims: 4 },
  { key: "blida", level: "medium", incidents: 4, teams: 6, plans: 1, victims: 1 },
  { key: "tipaza", level: "low", incidents: 1, teams: 2, plans: 0, victims: 0 },
  { key: "boumerdes", level: "low", incidents: 2, teams: 3, plans: 0, victims: 0 },
  { key: "tiziOuzou", level: "medium", incidents: 3, teams: 5, plans: 1, victims: 2 },
  { key: "chlef", level: "critical", incidents: 9, teams: 14, plans: 3, victims: 7 },
];

/** Quartiers, établissements sensibles et abris du périmètre communal (APC). */
const COMMUNE_AREAS = [
  { key: "centre", households: 1240, risk: "high" },
  { key: "frontDeMer", households: 860, risk: "critical" },
  { key: "hautsPlateaux", households: 430, risk: "medium" },
  { key: "zoneIndustrielle", households: 210, risk: "low" },
];

const COMMUNE_SHELTERS = [
  { key: "shelterSchool", capacity: 240, occupied: 168 },
  { key: "shelterHall", capacity: 180, occupied: 92 },
  { key: "shelterStadium", capacity: 600, occupied: 410 },
];

const COMMUNE_FACILITIES = [
  "schools",
  "healthCentre",
  "waterPlant",
  "market",
];

/** Tableau de bord national : état agrégé des wilayas et des plans. */
export function NationalOverview() {
  const { t } = useI18n();

  const activePlans = NATIONAL_WILAYAS.reduce((sum, item) => sum + item.plans, 0);
  const victims = NATIONAL_WILAYAS.reduce((sum, item) => sum + item.victims, 0);
  const teams = NATIONAL_WILAYAS.reduce((sum, item) => sum + item.teams, 0);
  const alerts = NATIONAL_WILAYAS.filter(
    (item) => item.level === "high" || item.level === "critical",
  ).length;

  return (
    <section className="au-scope" aria-labelledby="national-title">
      <div className="au-scope__head">
        <h2 id="national-title">{t("authority.national.title")}</h2>
        <p>{t("authority.national.lead")}</p>
      </div>

      <div className="au-scope__stats">
        <StatCard
          value={String(alerts).padStart(2, "0")}
          label={t("authority.national.statAlerts")}
          badge={t("authority.national.statAlertsBadge")}
          badgeTone="danger"
        />
        <StatCard
          value={String(activePlans).padStart(2, "0")}
          label={t("authority.national.statPlans")}
          badge={t("authority.national.statPlansBadge")}
          badgeTone="warning"
        />
        <StatCard
          value={String(teams)}
          label={t("authority.national.statTeams")}
          badge={t("authority.national.statTeamsBadge")}
          badgeTone="info"
        />
        <StatCard
          value={String(victims)}
          label={t("authority.national.statVictims")}
          badge={t("authority.national.statVictimsBadge")}
          badgeTone="danger"
        />
      </div>

      <div className="rc-table-wrap">
        <table className="rc-table">
          <thead>
            <tr>
              <th>{t("authority.national.wilaya")}</th>
              <th>{t("authority.national.incidents")}</th>
              <th>{t("authority.national.plans")}</th>
              <th>{t("authority.national.teams")}</th>
              <th>{t("authority.national.victims")}</th>
              <th>{t("authority.national.level")}</th>
            </tr>
          </thead>
          <tbody>
            {NATIONAL_WILAYAS.map((wilaya) => (
              <tr key={wilaya.key}>
                <td>{t(`authority.situation.${wilaya.key}`)}</td>
                <td>{wilaya.incidents}</td>
                <td>{wilaya.plans}</td>
                <td>{wilaya.teams}</td>
                <td>{wilaya.victims}</td>
                <td>
                  <span className={`rc-badge rc-badge--${wilaya.level}`}>
                    {t(`authority.level.${wilaya.level}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="au-note">{t("authority.national.note")}</p>
    </section>
  );
}

/** Vue communale : quartiers exposés, abris et établissements sensibles (APC). */
export function CommunalOverview() {
  const { t } = useI18n();

  const capacity = COMMUNE_SHELTERS.reduce((sum, item) => sum + item.capacity, 0);
  const occupied = COMMUNE_SHELTERS.reduce((sum, item) => sum + item.occupied, 0);
  const households = COMMUNE_AREAS.reduce((sum, item) => sum + item.households, 0);

  return (
    <section className="au-scope" aria-labelledby="communal-title">
      <div className="au-scope__head">
        <h2 id="communal-title">{t("authority.communal.title")}</h2>
        <p>{t("authority.communal.lead")}</p>
      </div>

      <div className="au-scope__stats">
        <StatCard
          value={String(COMMUNE_AREAS.length).padStart(2, "0")}
          label={t("authority.communal.statAreas")}
          badge={t("authority.communal.statAreasBadge")}
          badgeTone="info"
        />
        <StatCard
          value={households.toLocaleString("fr-DZ")}
          label={t("authority.communal.statHouseholds")}
          badge={t("authority.communal.statHouseholdsBadge")}
          badgeTone="warning"
        />
        <StatCard
          value={`${occupied}/${capacity}`}
          label={t("authority.communal.statShelters")}
          badge={t("authority.communal.statSheltersBadge")}
          badgeTone="success"
        />
        <StatCard
          value={String(COMMUNE_FACILITIES.length).padStart(2, "0")}
          label={t("authority.communal.statFacilities")}
          badge={t("authority.communal.statFacilitiesBadge")}
          badgeTone="neutral"
        />
      </div>

      <div className="au-scope__grid">
        <article className="rc-card">
          <div className="rc-card__head">
            <h3 className="rc-card__title">{t("authority.communal.areas")}</h3>
            <span className="rc-card__hint">
              {t("authority.communal.areasHint")}
            </span>
          </div>
          <ul className="rc-list">
            {COMMUNE_AREAS.map((area) => (
              <li key={area.key}>
                <div className="rc-item rc-item--static">
                  <div className="rc-item__body">
                    <p className="rc-item__title">
                      {t(`authority.communal.area.${area.key}`)}
                    </p>
                    <p className="rc-item__meta">
                      <span>
                        {t("authority.communal.households", {
                          count: area.households,
                        })}
                      </span>
                    </p>
                  </div>
                  <span className={`rc-badge rc-badge--${area.risk}`}>
                    {t(`authority.level.${area.risk}`)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h3 className="rc-card__title">
              {t("authority.communal.shelters")}
            </h3>
            <span className="rc-card__hint">
              {t("authority.communal.sheltersHint")}
            </span>
          </div>
          <ul className="au-capacity-list">
            {COMMUNE_SHELTERS.map((shelter) => (
              <li key={shelter.key}>
                <div className="au-capacity__head">
                  <strong>{t(`authority.communal.shelter.${shelter.key}`)}</strong>
                  <span>
                    {shelter.occupied} / {shelter.capacity}
                  </span>
                </div>
                <div className="au-capacity__track">
                  <span
                    className={`au-capacity__fill${
                      shelter.occupied / shelter.capacity > 0.8 ? " is-high" : ""
                    }`}
                    style={{
                      width: `${Math.round(
                        (shelter.occupied / shelter.capacity) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="rc-card__foot">
            <p className="au-note">{t("authority.communal.facilitiesNote")}</p>
            <ul className="au-facilities">
              {COMMUNE_FACILITIES.map((facility) => (
                <li key={facility}>
                  {t(`authority.communal.facility.${facility}`)}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

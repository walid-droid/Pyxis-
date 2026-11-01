import "../shared/crisis/resp-crise.css";
import "./organisme.css";
import { useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import { useNotifications } from "../../lib/notificationsContext";
import CrisisMap, { type MapPin } from "../shared/crisis/CrisisMap";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import { loc, type Localized } from "./organismeData";

type MaritimeZone = {
  id: string;
  name: Localized;
  kind: "beach" | "port" | "intervention";
  position: [number, number];
  status: "open" | "restricted" | "closed";
  note: Localized;
};

type NauticalMean = {
  id: string;
  name: Localized;
  type: Localized;
  crew: number;
  autonomy: string;
  fuel: number;
  status: "available" | "engaged" | "maintenance";
};

const ZONES: MaritimeZone[] = [
  {
    id: "mz1",
    name: { fr: "Baie de Béjaïa — zone de baignade", ar: "خليج بجاية — منطقة السباحة" },
    kind: "beach",
    position: [36.755, 5.085],
    status: "restricted",
    note: {
      fr: "Baignade déconseillée : houle de 1,2 m et courant d'ouest.",
      ar: "السباحة غير مستحسنة: موج 1.2 م وتيار غربي.",
    },
  },
  {
    id: "mz2",
    name: { fr: "Port de pêche d'Aiguades", ar: "ميناء صيد الأغياد" },
    kind: "port",
    position: [36.744, 5.077],
    status: "open",
    note: {
      fr: "Sorties autorisées jusqu'à 16:00, retour obligatoire avant la nuit.",
      ar: "الخروج مسموح إلى غاية 16:00، والعودة إلزامية قبل الليل.",
    },
  },
  {
    id: "mz3",
    name: { fr: "Cap Carbon — zone d'intervention", ar: "رأس كربون — منطقة التدخل" },
    kind: "intervention",
    position: [36.775, 5.105],
    status: "closed",
    note: {
      fr: "Zone réservée aux moyens nautiques engagés dans la recherche.",
      ar: "منطقة مخصصة للوسائل البحرية المشاركة في البحث.",
    },
  },
];

const MEANS: NauticalMean[] = [
  {
    id: "nm1",
    name: { fr: "Vedette SNS 212", ar: "زورق SNS 212" },
    type: { fr: "Vedette de sauvetage", ar: "زورق إنقاذ" },
    crew: 4,
    autonomy: "6 h",
    fuel: 72,
    status: "available",
  },
  {
    id: "nm2",
    name: { fr: "Semi-rigide SNS 07", ar: "قارب مطاطي SNS 07" },
    type: { fr: "Semi-rigide rapide", ar: "قارب سريع" },
    crew: 3,
    autonomy: "4 h",
    fuel: 48,
    status: "engaged",
  },
  {
    id: "nm3",
    name: { fr: "Zodiac SNS 19", ar: "زودياك SNS 19" },
    type: { fr: "Pneumatique léger", ar: "قارب مطاطي خفيف" },
    crew: 2,
    autonomy: "3 h",
    fuel: 25,
    status: "maintenance",
  },
];

const WEATHER = [
  { key: "wind", value: "18 kn · NE" },
  { key: "sea", value: "3 · agitée" },
  { key: "swell", value: "1,2 m" },
  { key: "visibility", value: "8 km" },
] as const;

const TONE: Record<NauticalMean["status"], string> = {
  available: "low",
  engaged: "medium",
  maintenance: "standby",
};

/**
 * Écran maritime du garde-côte : zones de baignade, ports, moyens nautiques,
 * météo marine et alerte de sauvetage en mer.
 */
export default function MaritimePage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const { push } = useNotifications();

  const [zones, setZones] = useState<MaritimeZone[]>(ZONES);
  const [means] = useState<NauticalMean[]>(MEANS);
  const [sosOpen, setSosOpen] = useState(false);
  const [sos, setSos] = useState({ position: "", nature: "drowning", notes: "" });
  const [alerts, setAlerts] = useState<
    Array<{ id: string; position: string; nature: string; mean: string }>
  >([]);
  const [toast, setToast] = useState<string | null>(null);

  const available = means.filter((mean) => mean.status === "available").length;

  const pins: MapPin[] = zones.map((zone) => ({
    id: zone.id,
    position: zone.position,
    title: loc(lang, zone.name),
    subtitle: loc(lang, zone.note),
    tone: zone.kind === "port" ? "shelter" : "team",
    severity: zone.status === "closed" ? "Critical" : "Medium",
  }));

  const declareSos = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mean = means.find((item) => item.status === "available") ?? means[0];
    setAlerts((current) => [
      {
        id: `sos-${Date.now()}`,
        position: sos.position,
        nature: sos.nature,
        mean: loc(lang, mean.name),
      },
      ...current,
    ]);
    push({
      kind: "alert",
      titleKey: "notif.maritime.title",
      detailKey: "notif.maritime.detail",
    });
    setToast(t("org.maritime.sosSent"));
    setSosOpen(false);
    setSos({ position: "", nature: "drowning", notes: "" });
  };

  const toggleZone = (id: string) => {
    setZones((current) =>
      current.map((zone) =>
        zone.id === id
          ? {
              ...zone,
              status: zone.status === "closed" ? "open" : "closed",
            }
          : zone,
      ),
    );
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.maritime.eyebrow")}
        title={t("org.maritime.title")}
        lead={t("org.maritime.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {t("org.maritime.chip", { count: available })}
            </span>
            <span className="rc-chip">{loc(lang, persona.scope)}</span>
          </>
        }
        aside={
          <button
            type="button"
            className="rc-btn rc-btn--danger"
            onClick={() => setSosOpen(true)}
          >
            {t("org.maritime.sos")}
          </button>
        }
        stats={
          <section className="stat-grid" aria-label={t("org.maritime.statsLabel")}>
            <StatCard
              value={String(zones.filter((zone) => zone.status !== "open").length).padStart(2, "0")}
              label={t("org.maritime.statZones")}
              badge={t("org.maritime.statZonesBadge")}
              badgeTone="warning"
            />
            <StatCard
              value={String(available).padStart(2, "0")}
              label={t("org.maritime.statMeans")}
              badge={t("org.maritime.statMeansBadge")}
              badgeTone="success"
            />
            <StatCard
              value="18 kn"
              label={t("org.maritime.statWind")}
              badge={t("org.maritime.statWindBadge")}
              badgeTone="info"
            />
            <StatCard
              value={String(alerts.length).padStart(2, "0")}
              label={t("org.maritime.statSos")}
              badge={t("org.maritime.statSosBadge")}
              badgeTone="danger"
            />
          </section>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.maritime.zones")}</h2>
            <span className="rc-card__hint">{t("org.maritime.zonesHint")}</span>
          </div>
          <p className="rc-card__lead">{t("org.maritime.zonesLead")}</p>

          <ul className="org-signal-list">
            {zones.map((zone) => (
              <li key={zone.id} className="org-signal">
                <div className="org-signal__head">
                  <strong>{loc(lang, zone.name)}</strong>
                  <span
                    className={`rc-badge rc-badge--${
                      zone.status === "closed"
                        ? "critical"
                        : zone.status === "restricted"
                          ? "medium"
                          : "low"
                    }`}
                  >
                    {t(`org.maritime.zoneStatus.${zone.status}`)}
                  </span>
                </div>
                <p className="org-signal__meta">{loc(lang, zone.note)}</p>
                <div className="org-signal__foot">
                  <span className="org-cell__meta">
                    {t(`org.maritime.zoneKind.${zone.kind}`)}
                  </span>
                  <button
                    type="button"
                    className="rc-btn rc-btn--soft rc-btn--small"
                    onClick={() => toggleZone(zone.id)}
                  >
                    {t(
                      zone.status === "closed"
                        ? "org.maritime.zoneOpen"
                        : "org.maritime.zoneClose",
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="org-map-block">
            <CrisisMap pins={pins} variant="mini" interactive={false} />
          </div>
        </article>

        <div className="rc-grid">
          <article className="rc-card">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("org.maritime.means")}</h2>
              <span className="rc-card__hint">
                {available} / {means.length}
              </span>
            </div>
            <p className="rc-card__lead">{t("org.maritime.meansLead")}</p>
            <ul className="org-signal-list">
              {means.map((mean) => (
                <li key={mean.id} className="org-signal">
                  <div className="org-signal__head">
                    <strong>{loc(lang, mean.name)}</strong>
                    <span className={`rc-badge rc-badge--${TONE[mean.status]}`}>
                      {t(`org.maritime.meanStatus.${mean.status}`)}
                    </span>
                  </div>
                  <p className="org-signal__meta">
                    {loc(lang, mean.type)} · {t("org.maritime.crew", { count: mean.crew })} ·{" "}
                    {t("org.maritime.autonomy", { value: mean.autonomy })}
                  </p>
                  <div className="org-meter">
                    <div className="org-meter__label">
                      <span>{t("org.vehicle.fuel")}</span>
                      <strong>{mean.fuel} %</strong>
                    </div>
                    <div className="org-meter__track">
                      <span
                        className={`org-meter__fill${mean.fuel < 40 ? " is-low" : ""}`}
                        style={{ width: `${mean.fuel}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rc-card">
            <div className="rc-card__head">
              <h2 className="rc-card__title">{t("org.maritime.weather")}</h2>
              <span className="rc-card__hint">{t("org.maritime.weatherHint")}</span>
            </div>
            <dl className="org-facts">
              {WEATHER.map((item) => (
                <div key={item.key}>
                  <dt>{t(`org.maritime.weather.${item.key}`)}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="org-note">{t("org.maritime.weatherNote")}</p>
          </article>

          {alerts.length > 0 ? (
            <article className="rc-card">
              <div className="rc-card__head">
                <h2 className="rc-card__title">{t("org.maritime.sosList")}</h2>
                <span className="rc-card__hint">
                  {t("org.maritime.sosCount", { count: alerts.length })}
                </span>
              </div>
              <ul className="org-signal-list">
                {alerts.map((alert) => (
                  <li key={alert.id} className="org-signal">
                    <div className="org-signal__head">
                      <strong>{alert.position}</strong>
                      <span className="rc-badge rc-badge--critical">
                        {t("org.maritime.sos")}
                      </span>
                    </div>
                    <p className="org-signal__meta">
                      {t(`org.maritime.nature.${alert.nature}`)} ·{" "}
                      {t("org.maritime.assigned", { mean: alert.mean })}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </section>

      {sosOpen ? (
        <Modal title={t("org.maritime.sosTitle")} onClose={() => setSosOpen(false)}>
          <form className="rc-form" onSubmit={declareSos}>
            <p className="org-muted">{t("org.maritime.sosLead")}</p>
            <div className="rc-field">
              <label htmlFor="sos-position">{t("org.maritime.position")} *</label>
              <input
                id="sos-position"
                value={sos.position}
                placeholder={t("org.maritime.positionPlaceholder")}
                onChange={(event) =>
                  setSos((current) => ({ ...current, position: event.target.value }))
                }
                required
                minLength={4}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="sos-nature">{t("org.maritime.natureLabel")}</label>
              <select
                id="sos-nature"
                className="org-select"
                value={sos.nature}
                onChange={(event) =>
                  setSos((current) => ({ ...current, nature: event.target.value }))
                }
              >
                <option value="drowning">{t("org.maritime.nature.drowning")}</option>
                <option value="vessel">{t("org.maritime.nature.vessel")}</option>
                <option value="pollution">{t("org.maritime.nature.pollution")}</option>
                <option value="swimmer">{t("org.maritime.nature.swimmer")}</option>
              </select>
            </div>
            <div className="rc-field">
              <label htmlFor="sos-notes">{t("org.common.note")}</label>
              <textarea
                id="sos-notes"
                value={sos.notes}
                placeholder={t("org.maritime.notesPlaceholder")}
                onChange={(event) =>
                  setSos((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setSosOpen(false)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--danger"
                disabled={sos.position.trim().length < 4}
              >
                {t("org.maritime.sosSubmit")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

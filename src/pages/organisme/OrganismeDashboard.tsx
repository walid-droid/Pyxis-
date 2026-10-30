import "../command/resp-crise.css";
import "./organisme.css";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import {
  ORG_DASHBOARD_PATH,
  ORG_EVACUATION_PATH,
  ORG_HISTORY_PATH,
  ORG_MISSIONS_PATH,
  ORG_PCF_PATH,
  ORG_PCO_PATH,
  ORG_REINFORCEMENTS_PATH,
  ORG_REPORTS_PATH,
  ORG_RESOURCES_PATH,
  ORG_VEHICLE_PATH,
  ORG_VICTIMS_PATH,
  ORG_WATCH_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import {
  FOREST_SIGNALS,
  HYDRO_STATIONS,
  MISSIONS,
  PERSONAS,
  PCO_FEED,
  REPORTS,
  TEAMS,
  WEATHER_ALERTS,
  loc,
  type Localized,
  type OrgPage,
} from "./organismeData";

type PageMeta = {
  path: string;
  labelKey: string;
  desc: Localized;
};

const PAGE_META: Record<OrgPage, PageMeta> = {
  reports: {
    path: ORG_REPORTS_PATH,
    labelKey: "org.nav.reports",
    desc: {
      fr: "Confirmer, rejeter et fixer la gravité avec justification.",
      ar: "تأكيد أو رفض التبليغ وتحديد الخطورة بتبرير.",
    },
  },
  missions: {
    path: ORG_MISSIONS_PATH,
    labelKey: "org.nav.missions",
    desc: {
      fr: "Créer, affecter et exécuter les missions, avec compte rendu hors ligne.",
      ar: "إنشاء المهام وإسنادها وتنفيذها مع تقرير دون اتصال.",
    },
  },
  resources: {
    path: ORG_RESOURCES_PATH,
    labelKey: "org.nav.resources",
    desc: {
      fr: "Suivre les équipes, véhicules et équipements de l'organisme.",
      ar: "متابعة فرق الهيئة ومركباتها وتجهيزاتها.",
    },
  },
  reinforcements: {
    path: ORG_REINFORCEMENTS_PATH,
    labelKey: "org.nav.reinforcements",
    desc: {
      fr: "Demander, autoriser, transmettre et traiter les renforts.",
      ar: "طلب التعزيزات وترخيصها وإحالتها ومعالجتها.",
    },
  },
  watch: {
    path: ORG_WATCH_PATH,
    labelKey: "org.nav.watch",
    desc: {
      fr: "Saisir les niveaux d'eau, les seuils et les risques forestiers.",
      ar: "تسجيل مناسيب المياه والعتبات والمخاطر الغابية.",
    },
  },
  victims: {
    path: ORG_VICTIMS_PATH,
    labelKey: "org.nav.victims",
    desc: {
      fr: "Bilan des victimes, urgences, ambulances et renforts médicaux.",
      ar: "حصيلة الضحايا والاستعجالات والإسعاف والتعزيزات الطبية.",
    },
  },
  evacuation: {
    path: ORG_EVACUATION_PATH,
    labelKey: "org.nav.evacuation",
    desc: {
      fr: "Itinéraires, zones de rassemblement et déplacements.",
      ar: "المسارات ونقاط التجمع والتنقلات.",
    },
  },
  pco: {
    path: ORG_PCO_PATH,
    labelKey: "org.nav.pco",
    desc: {
      fr: "Diriger le PCO, demander le plan et rendre compte au PCF.",
      ar: "قيادة مركز العمليات وطلب الخطة ورفع التقرير.",
    },
  },
  pcf: {
    path: ORG_PCF_PATH,
    labelKey: "org.nav.pcf",
    desc: {
      fr: "Phase d'activation, modules, renforts et habilitation.",
      ar: "مرحلة التفعيل والوحدات والتعزيزات والتأهيل.",
    },
  },
  history: {
    path: ORG_HISTORY_PATH,
    labelKey: "org.nav.history",
    desc: {
      fr: "Journal chronologique et retours d'expérience.",
      ar: "السجل الزمني والعودة التجريبية.",
    },
  },
  vehicle: {
    path: ORG_VEHICLE_PATH,
    labelKey: "org.nav.vehicle",
    desc: {
      fr: "Suivre son véhicule, son équipement et signaler une panne.",
      ar: "متابعة المركبة والتجهيزات والإبلاغ عن عطب.",
    },
  },
};

function Glyph({ page }: { page: OrgPage }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (page) {
    case "reports":
      return (
        <svg {...common}>
          <path d="M12 3 3 7v5c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7l-9-4Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "missions":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h10" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );
    case "resources":
      return (
        <svg {...common}>
          <path d="M3 13h18M5 13V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
          <path d="M5 13v5h14v-5" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="16" cy="18" r="1.5" />
        </svg>
      );
    case "reinforcements":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "watch":
      return (
        <svg {...common}>
          <path d="M2 12h4l2-4 4 8 2-4h8" />
          <path d="M4 20h16" />
        </svg>
      );
    case "victims":
      return (
        <svg {...common}>
          <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      );
    case "evacuation":
      return (
        <svg {...common}>
          <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z" />
          <path d="M9 7v13M15 4v13" />
        </svg>
      );
    case "pco":
      return (
        <svg {...common}>
          <path d="M4 21V8l8-5 8 5v13" />
          <path d="M9 21v-6h6v6" />
          <path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" />
        </svg>
      );
    case "pcf":
      return (
        <svg {...common}>
          <path d="M3 21h18M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-5h6v5" />
          <path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "vehicle":
      return (
        <svg {...common}>
          <path d="M3 16V9l3-4h12l3 4v7" />
          <path d="M3 16h18v3h-3M3 19h3" />
          <circle cx="7.5" cy="18.5" r="1.5" />
          <circle cx="16.5" cy="18.5" r="1.5" />
        </svg>
      );
  }
}

/** Accueil de l'espace organisme, filtré selon le rôle sélectionné. */
export default function OrganismeDashboard() {
  const { t, lang } = useI18n();
  const { persona, setPersonaId } = useOrganisme();

  const openReports = REPORTS.filter((report) => report.status === "received").length;
  const activeMissions = MISSIONS.filter((mission) => mission.status === "active").length;
  const engagedTeams = TEAMS.filter((team) => team.status === "engaged").length;
  const alerts =
    HYDRO_STATIONS.filter((station) => station.level > station.threshold).length +
    FOREST_SIGNALS.filter((signal) => signal.status === "proposed").length +
    WEATHER_ALERTS.filter((alert) => alert.status === "proposed").length;

  return (
    <main className="rc-page rc-page--org">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("org.dash.eyebrow")}</p>
          <h1>{t("org.dash.title")}</h1>
          <p className="rc-hero__lead">{t("org.dash.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t("org.dash.chipRole", { role: loc(lang, persona.role) })}
            </span>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--low" />
              {loc(lang, persona.scope)}
            </span>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--critical" />
              {t("org.dash.chipCrisis")}
            </span>
          </div>
        </div>
        {persona.pages.includes("pco") ? (
          <div className="rc-hero__aside">
            <Link className="rc-btn rc-btn--primary" to={ORG_PCO_PATH}>
              {t("org.dash.openCrisis")}
            </Link>
          </div>
        ) : null}
      </section>

      <section className="stat-grid" aria-label={t("org.dash.quickTitle")}>
        <StatCard
          value={String(openReports)}
          label={t("org.dash.statReports")}
          badge={t("org.dash.statReportsBadge", { count: openReports })}
          badgeTone={openReports > 0 ? "warning" : "success"}
        />
        <StatCard
          value={String(activeMissions)}
          label={t("org.dash.statMissions")}
          badge={t("org.dash.statMissionsBadge", { count: activeMissions })}
          badgeTone="danger"
        />
        <StatCard
          value={String(TEAMS.length - engagedTeams)}
          label={t("org.dash.statMeans")}
          badge={t("org.dash.statMeansBadge", { count: engagedTeams })}
          badgeTone="info"
        />
        <StatCard
          value={String(alerts)}
          label={t("org.dash.statAlerts")}
          badge={t("org.dash.statAlertsBadge", { count: alerts })}
          badgeTone={alerts > 0 ? "warning" : "success"}
        />
      </section>

      <section className="rc-quick" aria-labelledby="org-quick-title">
        <div className="rc-quick__head">
          <h2 id="org-quick-title" className="rc-quick__title">
            {t("org.dash.quickTitle")}
          </h2>
          <p className="rc-quick__lead">{t("org.dash.quickLead")}</p>
        </div>

        <div className="rc-quick__grid">
          {persona.pages.map((page) => {
            const meta = PAGE_META[page];
            return (
              <Link
                key={page}
                to={meta.path}
                className={`rc-quick-card org-quick-card org-quick-card--${page}`}
              >
                <span className="rc-quick-card__icon" aria-hidden="true">
                  <Glyph page={page} />
                </span>
                <span className="rc-quick-card__label">{t(meta.labelKey)}</span>
                <span className="rc-quick-card__desc">{loc(lang, meta.desc)}</span>
                <span className="rc-quick-card__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.dash.dutiesTitle")}</h2>
            <span className="rc-card__hint">{t("org.demo")}</span>
          </div>
          <p className="rc-card__lead">{t("org.dash.dutiesLead")}</p>

          <div className="org-persona">
            <div className="org-persona__id">
              <span className="org-persona__avatar" aria-hidden="true">
                {loc(lang, persona.name).slice(0, 1)}
              </span>
              <div>
                <p className="org-persona__name">{loc(lang, persona.name)}</p>
                <p className="org-persona__role">{loc(lang, persona.role)}</p>
                <p className="org-persona__org">{loc(lang, persona.org)}</p>
              </div>
            </div>

            <ul className="org-duties">
              {persona.duties.map((duty) => (
                <li key={duty.fr}>
                  <span aria-hidden="true">✓</span>
                  {loc(lang, duty)}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.dash.crisisTitle")}</h2>
            <span className="rc-badge rc-badge--critical">
              {t("org.dash.chipCrisis")}
            </span>
          </div>
          <p className="rc-card__lead">{t("org.dash.crisisLead")}</p>

          <dl className="org-facts">
            <div>
              <dt>{t("org.pco.status")}</dt>
              <dd>{t("org.pco.open")}</dd>
            </div>
            <div>
              <dt>{t("org.pco.modules")}</dt>
              <dd>Secours · Santé · Sécurité</dd>
            </div>
            <div>
              <dt>{t("org.evac.zones")}</dt>
              <dd>2 / 3 {t("org.pco.open").toLowerCase()}</dd>
            </div>
            <div>
              <dt>{t("org.victims.statUrgent")}</dt>
              <dd>2</dd>
            </div>
          </dl>

          <div className="rc-card__foot">
            {persona.pages.includes("missions") ? (
              <Link className="rc-btn rc-btn--soft rc-btn--small" to={ORG_MISSIONS_PATH}>
                {t("org.nav.missions")}
              </Link>
            ) : null}
            {persona.pages.includes("reports") ? (
              <Link className="rc-btn rc-btn--soft rc-btn--small" to={ORG_REPORTS_PATH}>
                {t("org.nav.reports")}
              </Link>
            ) : null}
          </div>
        </article>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.dash.activityTitle")}</h2>
            <span className="rc-card__hint">{t("org.dash.activityLead")}</span>
          </div>
          <ul className="rc-timeline">
            {PCO_FEED.slice(0, 4).map((item) => (
              <li className="rc-timeline__item" key={item.at}>
                <span className="rc-timeline__icon" aria-hidden="true">
                  •
                </span>
                <div className="rc-timeline__body">
                  <p className="rc-timeline__reason">{loc(lang, item.text)}</p>
                  <p className="rc-timeline__meta">{item.at}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.dash.personaTitle")}</h2>
            <span className="rc-card__hint">{t("org.role.label")}</span>
          </div>
          <p className="rc-card__lead">{t("org.dash.personaLead")}</p>

          <div className="org-persona-grid">
            {PERSONAS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`org-persona-card${
                  item.id === persona.id ? " is-active" : ""
                }`}
                aria-pressed={item.id === persona.id}
                onClick={() => setPersonaId(item.id)}
              >
                <span className="org-persona-card__role">
                  {loc(lang, item.role)}
                </span>
                <span className="org-persona-card__name">
                  {loc(lang, item.name)}
                </span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <p className="org-demo-note" role="note">
        {t("org.demo")} · {ORG_DASHBOARD_PATH}
      </p>
    </main>
  );
}

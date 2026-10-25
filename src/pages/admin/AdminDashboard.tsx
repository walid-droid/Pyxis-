import "./admin.css";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import {
  ADMIN_DOCUMENTS_PATH,
  ADMIN_JOURNAL_PATH,
  ADMIN_ORGANISATIONS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_TERRITORIES_PATH,
  ADMIN_USERS_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  ROLE_FAMILIES,
  formatDateTime,
  formatPopulation,
  initials,
  type ActivityTone,
} from "./adminData";
import {
  AdminBadge,
  AdminHero,
  AdminIcon,
  AdminProgress,
} from "./AdminUI";
import type { IconName } from "./AdminUI";

const QUICK_LINKS: {
  to: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
}[] = [
  {
    to: ADMIN_USERS_PATH,
    icon: "users",
    titleKey: "admin.dash.quick.users",
    descKey: "admin.dash.quick.usersDesc",
  },
  {
    to: `${ADMIN_USERS_PATH}?tab=roles`,
    icon: "key",
    titleKey: "admin.dash.quick.roles",
    descKey: "admin.dash.quick.rolesDesc",
  },
  {
    to: ADMIN_TERRITORIES_PATH,
    icon: "map",
    titleKey: "admin.dash.quick.territories",
    descKey: "admin.dash.quick.territoriesDesc",
  },
  {
    to: ADMIN_ORGANISATIONS_PATH,
    icon: "building",
    titleKey: "admin.dash.quick.orgs",
    descKey: "admin.dash.quick.orgsDesc",
  },
  {
    to: ADMIN_SETTINGS_PATH,
    icon: "settings",
    titleKey: "admin.dash.quick.settings",
    descKey: "admin.dash.quick.settingsDesc",
  },
  {
    to: ADMIN_DOCUMENTS_PATH,
    icon: "document",
    titleKey: "admin.dash.quick.docs",
    descKey: "admin.dash.quick.docsDesc",
  },
  {
    to: ADMIN_JOURNAL_PATH,
    icon: "activity",
    titleKey: "admin.dash.quick.journal",
    descKey: "admin.dash.quick.journalDesc",
  },
];

function activityIcon(tone: ActivityTone): IconName {
  if (tone === "red") return "alert";
  if (tone === "amber") return "settings";
  if (tone === "violet") return "layers";
  if (tone === "blue") return "document";
  return "check";
}

/** Écran d'accueil de l'administrateur système. */
function AdminDashboard() {
  const { t, lang } = useI18n();
  const { state } = useAdmin();

  const activeUsers = state.users.filter((user) => user.status === "active");
  const invitedUsers = state.users.filter((user) => user.status === "invited");
  const communes = state.wilayas.flatMap((wilaya) => wilaya.communes);
  const activeCommunes = communes.filter((commune) => commune.active);
  const population = communes.reduce(
    (total, commune) => total + commune.population,
    0,
  );
  const enabledModules = state.modules.filter((module) => module.enabled);
  const platformModules = state.modules.filter(
    (module) => module.scope === "platform",
  );
  const publishedDocs = state.documents.filter((document) => document.published);
  const indexedDocs = state.documents.filter(
    (document) => document.status === "indexed",
  );
  const activeOrgs = state.organisations.filter(
    (organisation) => organisation.status === "active",
  );
  const pendingOrgs = state.organisations.filter(
    (organisation) => organisation.status === "pending",
  );
  const permissions = new Set(
    state.roles.flatMap((role) => role.permissions),
  ).size;
  const vacantWilayas = state.wilayas.filter((wilaya) => !wilaya.wali).length;
  const vacantCommunes = communes.filter(
    (commune) => !commune.apcPresident,
  ).length;

  const health = [
    {
      key: "accounts",
      label: t("admin.dash.health.accounts"),
      value: (activeUsers.length / Math.max(1, state.users.length)) * 100,
      valueLabel: t("admin.dash.health.valueUsers", {
        count: state.users.length,
      }),
      done: activeUsers.length > 0,
    },
    {
      key: "roles",
      label: t("admin.dash.health.roles"),
      value: (state.roles.length / 18) * 100,
      valueLabel: t("admin.dash.health.valueRoles", {
        count: state.roles.length,
      }),
      done: state.roles.length >= 18,
    },
    {
      key: "territories",
      label: t("admin.dash.health.territories"),
      value: Math.min(100, (communes.length / 40) * 100),
      valueLabel: t("admin.dash.health.valueTerr", {
        wilayas: state.wilayas.length,
        communes: communes.length,
      }),
      done: state.wilayas.length > 0 && communes.length > 0,
    },
    {
      key: "settings",
      label: t("admin.dash.health.settings"),
      value:
        (state.severities.filter((level) => level.active).length /
          Math.max(1, state.severities.length)) *
        100,
      valueLabel: t("admin.dash.health.valueSettings", {
        count: state.severities.length,
      }),
      done: state.severities.some((level) => level.active),
    },
    {
      key: "modules",
      label: t("admin.dash.health.modules"),
      value: (enabledModules.length / Math.max(1, state.modules.length)) * 100,
      valueLabel: t("admin.dash.health.valueModules", {
        enabled: enabledModules.length,
        total: state.modules.length,
      }),
      done: enabledModules.length === state.modules.length,
    },
    {
      key: "docs",
      label: t("admin.dash.health.docs"),
      value:
        (indexedDocs.length / Math.max(1, state.documents.length)) * 100,
      valueLabel: t("admin.dash.health.valueDocs", {
        count: indexedDocs.length,
      }),
      done: indexedDocs.length > 0,
    },
    {
      key: "assistant",
      label: t("admin.dash.health.assistant"),
      value:
        publishedDocs.length > 0
          ? (publishedDocs.filter((doc) => doc.status === "indexed").length /
              publishedDocs.length) *
            100
          : 0,
      valueLabel: t("admin.dash.health.valueAssistant", {
        count: state.documents.reduce(
          (total, document) => total + document.chunks,
          0,
        ),
      }),
      done:
        publishedDocs.length > 0 &&
        publishedDocs.every((doc) => doc.status === "indexed"),
    },
  ];

  const recentUsers = state.users.slice(0, 5);

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.dash.eyebrow")}
        title={t("admin.dash.title")}
        lead={t("admin.dash.lead")}
        chips={
          <>
            <span className="ad-chip">
              <span className="ad-dot" />
              {t("admin.dash.chip.platform")}
            </span>
            <span className="ad-chip">
              <AdminIcon name="layers" />
              {t("admin.dash.chip.modules", {
                count: enabledModules.length,
              })}
            </span>
            {pendingOrgs.length > 0 ? (
              <span className="ad-chip ad-chip--warn">
                <AdminIcon name="alert" />
                {t("admin.dash.chip.pendingOrgs", {
                  count: pendingOrgs.length,
                })}
              </span>
            ) : (
              <span className="ad-chip ad-chip--ok">
                <AdminIcon name="check" />
                {t("admin.dash.chip.noPending")}
              </span>
            )}
          </>
        }
        actions={
          <>
            <Link
              className="ad-btn ad-btn--green"
              to={`${ADMIN_USERS_PATH}?new=1`}
            >
              <AdminIcon name="userPlus" />
              {t("admin.dash.action.newUser")}
            </Link>
            <Link className="ad-btn ad-btn--ghost" to={ADMIN_SETTINGS_PATH}>
              <AdminIcon name="settings" />
              {t("admin.dash.action.settings")}
            </Link>
          </>
        }
      />

      <div className="ad-stat-grid">
        <StatCard
          tone="verified"
          value={state.users.length}
          label={t("admin.dash.users")}
          badge={t("admin.dash.usersHint", { count: activeUsers.length })}
          badgeTone="success"
        />
        <StatCard
          tone="ongoing"
          value={state.roles.length}
          label={t("admin.dash.roles")}
          badge={t("admin.dash.rolesHint", {
            count: permissions,
            families: ROLE_FAMILIES.length,
          })}
          badgeTone="info"
        />
        <StatCard
          tone="crisis"
          value={state.wilayas.length}
          label={t("admin.dash.wilayas")}
          badge={t("admin.dash.wilayasHint", {
            count: vacantWilayas,
          })}
          badgeTone={vacantWilayas > 0 ? "warning" : "neutral"}
        />
        <StatCard
          tone="upcoming"
          value={communes.length}
          label={t("admin.dash.communes")}
          badge={t("admin.dash.communesHint", {
            count: activeCommunes.length,
          })}
          badgeTone="success"
        />
        <StatCard
          tone="upcoming"
          value={`${platformModules.filter((module) => module.enabled).length}/${
            platformModules.length
          }`}
          label={t("admin.dash.modules")}
          badge={t("admin.dash.modulesHint", {
            count: state.modules.length,
          })}
          badgeTone="info"
        />
        <StatCard
          tone="verified"
          value={indexedDocs.length}
          label={t("admin.dash.docs")}
          badge={t("admin.dash.docsHint", { count: publishedDocs.length })}
          badgeTone="success"
        />
      </div>

      <div className="ad-grid--main">
        <div className="ad-stack">
          <section className="ad-card">
            <div className="ad-card__head">
              <div>
                <h2 className="ad-card__title">{t("admin.dash.quickTitle")}</h2>
                <p className="ad-card__lead">
                  {t("admin.dash.quickLead")}
                </p>
              </div>
            </div>

            <div className="ad-quick-grid">
              {QUICK_LINKS.map((link) => (
                <Link key={link.to} className="ad-quick" to={link.to}>
                  <span className="ad-quick__top">
                    <span className="ad-quick__icon">
                      <AdminIcon name={link.icon} />
                    </span>
                    <AdminIcon name="arrow" />
                  </span>
                  <strong>{t(link.titleKey)}</strong>
                  <p>{t(link.descKey)}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="ad-card">
            <div className="ad-card__head">
              <h2 className="ad-card__title">
                {t("admin.dash.recentTitle")}
              </h2>
              <Link className="ad-link" to={ADMIN_USERS_PATH}>
                {t("admin.dash.viewAll")}
                <AdminIcon name="arrow" />
              </Link>
            </div>

            <ul className="ad-mini-list">
              {recentUsers.map((user) => {
                const role = state.roles.find(
                  (item) => item.id === user.roleId,
                );
                return (
                  <li key={user.id}>
                    <span className="ad-mini-list__label">
                      <span className="ad-avatar">{initials(user.name)}</span>
                      <span className="ad-user-cell__text">
                        <span className="ad-user-cell__name">
                          {user.name}
                        </span>
                        <span className="ad-user-cell__mail">
                          {user.email}
                        </span>
                      </span>
                    </span>
                    <span className="ad-mini-list__value">
                      <AdminBadge tone={role?.tone ?? "neutral"}>
                        {lang === "ar" ? role?.nameAr : role?.name}
                      </AdminBadge>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="ad-card__foot">
              <span className="ad-muted">
                {t("admin.dash.recentHint", { count: invitedUsers.length })}
              </span>
              <Link className="ad-link" to={ADMIN_USERS_PATH}>
                {t("admin.dash.viewAll")}
                <AdminIcon name="arrow" />
              </Link>
            </div>
          </section>
        </div>

        <div className="ad-stack">
          <section className="ad-card ad-card--accent">
            <div className="ad-card__head">
              <h2 className="ad-card__title">
                {t("admin.dash.healthTitle")}
              </h2>
              <span className="ad-card__hint">
                {t("admin.dash.healthHint")}
              </span>
            </div>

            <div className="ad-health">
              {health.map((item) => (
                <div key={item.key} className="ad-health__row">
                  <span className="ad-progress__label">{item.label}</span>
                  <span
                    className={`ad-health__state ad-health__state--${
                      item.done ? "ok" : "todo"
                    }`}
                  >
                    <AdminIcon name={item.done ? "check" : "alert"} />
                    {t(
                      item.done
                        ? "admin.dash.health.ok"
                        : "admin.dash.health.todo",
                    )}
                  </span>
                  <AdminProgress
                    value={item.value}
                    label={item.label}
                    valueLabel={item.valueLabel}
                    tone={item.done ? "green" : "amber"}
                    showHeader={false}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="ad-card">
            <div className="ad-card__head">
              <h2 className="ad-card__title">
                {t("admin.dash.coverageTitle")}
              </h2>
              <span className="ad-card__hint">
                {t("admin.dash.coverageHint")}
              </span>
            </div>

            <div className="ad-detail-facts">
              <span className="ad-fact">
                <span>{t("admin.dash.coverage.wilayas")}</span>
                <strong>{state.wilayas.length}</strong>
              </span>
              <span className="ad-fact">
                <span>{t("admin.dash.coverage.communes")}</span>
                <strong>{communes.length}</strong>
              </span>
              <span className="ad-fact">
                <span>{t("admin.dash.coverage.population")}</span>
                <strong>{formatPopulation(population, lang)}</strong>
              </span>
              <span className="ad-fact">
                <span>{t("admin.dash.coverage.orgs")}</span>
                <strong>{activeOrgs.length}</strong>
              </span>
            </div>

            {(vacantWilayas > 0 || vacantCommunes > 0) && (
              <p className="ad-inline-note ad-inline-note--warn">
                <AdminIcon name="alert" />
                {t("admin.dash.vacancies", {
                  wilayas: vacantWilayas,
                  communes: vacantCommunes,
                })}
              </p>
            )}
          </section>

          <section className="ad-card">
            <div className="ad-card__head">
              <div>
                <h2 className="ad-card__title">
                  {t("admin.dash.activityTitle")}
                </h2>
                <p className="ad-card__lead">
                  {t("admin.dash.activityHint")}
                </p>
              </div>
              <Link className="ad-link" to={ADMIN_JOURNAL_PATH}>
                {t("admin.dash.openJournal")}
                <AdminIcon name="arrow" />
              </Link>
            </div>

            {state.activity.length === 0 ? (
              <p className="ad-muted">{t("admin.dash.noActivity")}</p>
            ) : (
              <ul className="ad-activity">
                {state.activity.slice(0, 7).map((entry) => (
                  <li key={entry.id} className="ad-activity__item">
                    <span
                      className={`ad-activity__icon ad-activity__icon--${entry.tone}`}
                    >
                      <AdminIcon name={activityIcon(entry.tone)} />
                    </span>
                    <span className="ad-activity__body">
                      <p>
                        {t(entry.actionKey, {
                          target: entry.target.startsWith("admin.")
                            ? t(entry.target)
                            : entry.target,
                        })}
                      </p>
                      <span
                        title={
                          entry.detail
                            ? `${entry.author} · ${entry.detail}`
                            : entry.author
                        }
                      >
                        {entry.author} · {formatDateTime(entry.at, lang)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;

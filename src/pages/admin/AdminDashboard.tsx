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
import { ROLE_FAMILIES } from "./adminData";
import { AdminHero, AdminIcon } from "./AdminUI";
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

/** Écran d'accueil de l'administrateur système. */
function AdminDashboard() {
  const { t } = useI18n();
  const { state } = useAdmin();

  const activeUsers = state.users.filter((user) => user.status === "active");
  const communes = state.wilayas.flatMap((wilaya) => wilaya.communes);
  const enabledModules = state.modules.filter((module) => module.enabled);
  const publishedDocs = state.documents.filter((document) => document.published);
  const indexedDocs = state.documents.filter(
    (document) => document.status === "indexed",
  );
  const permissions = new Set(
    state.roles.flatMap((role) => role.permissions),
  ).size;
  const pendingOrgs = state.organisations.filter(
    (organisation) => organisation.status === "pending",
  );
  const vacantWilayas = state.wilayas.filter((wilaya) => !wilaya.wali).length;
  const vacantCommunes = communes.filter(
    (commune) => !commune.apcPresident,
  ).length;

  const hasTodo =
    pendingOrgs.length > 0 || vacantWilayas > 0 || vacantCommunes > 0;
  const todoLink = pendingOrgs.length > 0
    ? {
        to: ADMIN_ORGANISATIONS_PATH,
        label: t("admin.dash.quick.orgs"),
      }
    : {
        to: ADMIN_TERRITORIES_PATH,
        label: t("admin.dash.quick.territories"),
      };

  return (
    <main className="ad-page ad-page--home">
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

      <div className="ad-stat-grid ad-stat-grid--home">
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
          tone="upcoming"
          value={state.wilayas.length}
          label={t("admin.dash.territories")}
          badge={t("admin.dash.territoriesHint", {
            count: communes.length,
          })}
          badgeTone="neutral"
        />
        <StatCard
          tone="verified"
          value={indexedDocs.length}
          label={t("admin.dash.docs")}
          badge={t("admin.dash.docsHint", { count: publishedDocs.length })}
          badgeTone="success"
        />
      </div>

      <section className="ad-card">
        <div className="ad-card__head">
          <div>
            <h2 className="ad-card__title">{t("admin.dash.quickTitle")}</h2>
            <p className="ad-card__lead">{t("admin.dash.quickLead")}</p>
          </div>
        </div>

        <div className="ad-quick-grid ad-quick-grid--home">
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

      <section
        className={`ad-todo${hasTodo ? " ad-todo--warn" : " ad-todo--ok"}`}
        aria-labelledby="ad-todo-title"
      >
        <span className="ad-todo__icon" aria-hidden="true">
          <AdminIcon name={hasTodo ? "alert" : "check"} />
        </span>

        <div className="ad-todo__body">
          <strong id="ad-todo-title">{t("admin.dash.todoTitle")}</strong>
          <p>
            {hasTodo
              ? t("admin.dash.todoLead")
              : t("admin.dash.todoNone")}
          </p>
          {hasTodo && (
            <ul className="ad-todo__list">
              {pendingOrgs.length > 0 && (
                <li>
                  {t("admin.dash.todoOrgs", {
                    count: pendingOrgs.length,
                  })}
                </li>
              )}
              {(vacantWilayas > 0 || vacantCommunes > 0) && (
                <li>
                  {t("admin.dash.todoVacancies", {
                    wilayas: vacantWilayas,
                    communes: vacantCommunes,
                  })}
                </li>
              )}
            </ul>
          )}
        </div>

        {hasTodo && (
          <Link className="ad-btn ad-btn--outline" to={todoLink.to}>
            {todoLink.label}
            <AdminIcon name="arrow" />
          </Link>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;

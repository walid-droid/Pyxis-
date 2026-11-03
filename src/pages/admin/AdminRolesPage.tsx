import { ROLE_DEFS, ROLES, roleName } from "../../auth/roles";
import { PERMISSION_LABELS, ROLE_PERMISSIONS } from "../../auth/permissions";
import { useI18n } from "../../i18n";

export default function AdminRolesPage() {
  const { lang, t } = useI18n();

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.roles.title")}</p>
          <h1 className="v3-title">{t("admin.roles.title")}</h1>
          <p className="v3-lead">{t("admin.roles.lead")}</p>
        </div>
      </header>

      <div className="v3-card v3-table-wrap">
        <table className="v3-table">
          <thead>
            <tr>
              <th>{t("admin.roles.role")}</th>
              <th>{t("admin.roles.family")}</th>
              <th>{t("admin.roles.sprint")}</th>
              <th>{t("admin.roles.description")}</th>
              <th>{t("admin.roles.permissions")}</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => {
              const definition = ROLE_DEFS[role];
              return (
                <tr key={role}>
                  <td className="v3-table__main">{roleName(role, lang)}</td>
                  <td>{t(`admin.roles.family.${definition.family}`)}</td>
                  <td>{definition.sprint}</td>
                  <td>{definition.description[lang]}</td>
                  <td>
                    {ROLE_PERMISSIONS[role].length === 0 ? (
                      <span className="v3-muted">{t("admin.roles.noPermission")}</span>
                    ) : (
                      <div className="v3-inline">
                        {ROLE_PERMISSIONS[role].map((permission) => (
                          <span key={permission} className="v3-badge v3-badge--brand">
                            {PERMISSION_LABELS[permission][lang]}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

import { useState } from "react";

import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  ROLE_FAMILIES,
  communeNames,
  permissionLabelKey,
  roleRequiresCommune,
  roleRequiresWilaya,
  type AdminUser,
  type UserStatus,
} from "./adminData";
import {
  AdminBadge,
  AdminField,
  AdminIcon,
  AdminModal,
  AdminModalActions,
  AdminToggle,
  PermissionMatrix,
} from "./AdminUI";

import { type UserDraft, type UserSaveMeta } from "./usersRolesShared";

/* ------------------------------------------------------------------ */
/* Formulaire de compte                                                */
/* ------------------------------------------------------------------ */

export default function UserEditorModal({
  user,
  takenEmails,
  onSave,
  onClose,
}: {
  user?: AdminUser;
  takenEmails: string[];
  onSave: (draft: UserDraft, meta: UserSaveMeta) => void;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const { state } = useAdmin();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [roleId, setRoleId] = useState(user?.roleId ?? "citizen");
  const [organisationId, setOrganisationId] = useState(
    user?.organisationId ?? "",
  );
  const [wilaya, setWilaya] = useState(user?.wilaya ?? "");
  const [commune, setCommune] = useState(user?.commune ?? "");
  const [status, setStatus] = useState<UserStatus>(
    user?.status ?? "invited",
  );
  const [permissions, setPermissions] = useState<string[]>(
    user?.permissions ?? [],
  );
  const [mfa, setMfa] = useState(user?.mfa ?? false);
  const [justification, setJustification] = useState("");
  const [error, setError] = useState<string | null>(null);

  const role = state.roles.find((item) => item.id === roleId);
  const basePermissions = role?.permissions ?? [];
  const communes = communeNames(state.wilayas, wilaya);
  const needsWilaya = roleRequiresWilaya(role);
  const needsCommune = roleRequiresCommune(role);

  const roleChanged = Boolean(user) && user?.roleId !== roleId;
  const suspended = Boolean(user) && status === "suspended" && user?.status !== "suspended";
  const needsReason = roleChanged || suspended;

  function handleRoleChange(value: string) {
    setRoleId(value);
    const next = state.roles.find((item) => item.id === value);
    if (next?.territoryScope === "none") {
      setWilaya("");
      setCommune("");
    } else if (next?.territoryScope === "wilaya") {
      setCommune("");
    }
  }

  function handleOrganisationChange(value: string) {
    setOrganisationId(value);
    const organisation = state.organisations.find(
      (item) => item.id === value,
    );
    if (organisation) {
      setWilaya(organisation.wilaya);
      setCommune(organisation.commune);
    }
  }

  function togglePermission(id: string) {
    setPermissions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError(t("admin.users.required"));
      return;
    }

    if (!role) {
      setError(t("admin.users.roleRequired"));
      return;
    }

    if (
      takenEmails.some(
        (item) => item.toLowerCase() === email.trim().toLowerCase(),
      )
    ) {
      setError(t("admin.users.emailTaken"));
      return;
    }

    if (needsWilaya && !wilaya) {
      setError(t("admin.users.territoryRequired"));
      return;
    }

    if (needsCommune && !commune) {
      setError(t("admin.users.communeRequired"));
      return;
    }

    if (needsReason && !justification.trim()) {
      setError(t("admin.users.reasonRequired"));
      return;
    }

    const extra = permissions.filter(
      (permission) => !basePermissions.includes(permission),
    );

    onSave(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        roleId,
        permissions: extra,
        organisationId: organisationId || null,
        wilaya: needsWilaya ? wilaya : "",
        commune: needsCommune ? commune : "",
        status,
        mfa,
      },
      {
        detail: justification.trim() || undefined,
        actionKey: roleChanged
          ? "admin.act.userRoleChanged"
          : suspended
            ? "admin.act.userSuspended"
            : undefined,
      },
    );
  }

  return (
    <AdminModal
      title={t(user ? "admin.users.editTitle" : "admin.users.createTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">
        {t(user ? "admin.users.editLead" : "admin.users.createLead")}
      </p>

      <div className="ad-modal__form">
        <section className="ad-form-section">
          <div className="ad-form-section__head">
            <AdminIcon name="users" />
            <div>
              <h3>{t("admin.users.sectionIdentity")}</h3>
              <p>{t("admin.users.sectionIdentityLead")}</p>
            </div>
          </div>

          <div className="ad-form-grid">
            <AdminField label={t("admin.users.name")} htmlFor="admin-user-name">
              <input
                id="admin-user-name"
                value={name}
                placeholder={t("admin.users.namePlaceholder")}
                onChange={(event) => setName(event.target.value)}
              />
            </AdminField>

            <AdminField
              label={t("admin.users.email")}
              htmlFor="admin-user-email"
            >
              <input
                id="admin-user-email"
                type="email"
                value={email}
                placeholder={t("admin.users.emailPlaceholder")}
                onChange={(event) => setEmail(event.target.value)}
              />
            </AdminField>

            <AdminField
              label={t("admin.users.phone")}
              htmlFor="admin-user-phone"
            >
              <input
                id="admin-user-phone"
                value={phone}
                placeholder={t("admin.users.phonePlaceholder")}
                onChange={(event) => setPhone(event.target.value)}
              />
            </AdminField>

            <AdminField
              label={t("admin.users.statusLabel")}
              htmlFor="admin-user-status"
            >
              <select
                id="admin-user-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as UserStatus)
                }
              >
                <option value="active">
                  {t("admin.users.status.active")}
                </option>
                <option value="invited">
                  {t("admin.users.status.invited")}
                </option>
                <option value="suspended">
                  {t("admin.users.status.suspended")}
                </option>
              </select>
            </AdminField>
          </div>
        </section>

        <section className="ad-form-section">
          <div className="ad-form-section__head">
            <AdminIcon name="building" />
            <div>
              <h3>{t("admin.users.sectionAccess")}</h3>
              <p>{t("admin.users.sectionAccessLead")}</p>
            </div>
          </div>

          <div className="ad-form-grid">
            <AdminField
              label={t("admin.users.role")}
              hint={t("admin.users.roleHint")}
              htmlFor="admin-user-role"
            >
              <select
                id="admin-user-role"
                value={roleId}
                onChange={(event) => handleRoleChange(event.target.value)}
              >
                {ROLE_FAMILIES.map((family) => (
                  <optgroup
                    key={family}
                    label={t(`admin.users.family.${family}`)}
                  >
                    {state.roles
                      .filter((item) => item.family === family)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {lang === "ar" ? item.nameAr : item.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </AdminField>

            <AdminField
              label={t("admin.users.organisation")}
              htmlFor="admin-user-org"
            >
              <select
                id="admin-user-org"
                value={organisationId}
                onChange={(event) =>
                  handleOrganisationChange(event.target.value)
                }
              >
                <option value="">{t("admin.users.noOrganisation")}</option>
                {state.organisations.map((organisation) => (
                  <option key={organisation.id} value={organisation.id}>
                    {lang === "ar"
                      ? organisation.nameAr
                      : organisation.name}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField
              label={
                needsWilaya
                  ? t("admin.users.wilayaRequired")
                  : t("admin.users.wilaya")
              }
              htmlFor="admin-user-wilaya"
            >
              <select
                id="admin-user-wilaya"
                value={wilaya}
                onChange={(event) => {
                  setWilaya(event.target.value);
                  setCommune("");
                }}
                required={needsWilaya}
              >
                <option value="">{t("admin.users.selectWilaya")}</option>
                {state.wilayas.map((item) => (
                  <option key={item.code} value={item.name}>
                    {lang === "ar" ? item.nameAr : item.name}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField
              label={
                needsCommune
                  ? t("admin.users.communeRequiredLabel")
                  : t("admin.users.commune")
              }
              htmlFor="admin-user-commune"
            >
              <select
                id="admin-user-commune"
                value={commune}
                onChange={(event) => setCommune(event.target.value)}
                disabled={!wilaya}
                required={needsCommune}
              >
                <option value="">{t("admin.users.selectCommune")}</option>
                {communes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>

          <p className="ad-field__hint">
            {t(
              needsCommune
                ? "admin.users.scopeCommune"
                : needsWilaya
                  ? "admin.users.scopeWilaya"
                  : "admin.users.scopeNone",
            )}
          </p>

          <AdminToggle
            checked={mfa}
            onChange={setMfa}
            label={t("admin.set.mfaRequired")}
          />
        </section>

        <section className="ad-form-section">
          <div className="ad-form-section__head">
            <AdminIcon name="key" />
            <div>
              <h3>{t("admin.users.sectionPermissions")}</h3>
              <p>{t("admin.users.sectionPermissionsLead")}</p>
            </div>
          </div>

          <div>
            <p className="ad-section-title">{t("admin.users.inherited")}</p>
            <div className="ad-role-summary">
              {basePermissions.map((permission) => (
                <AdminBadge key={permission} tone="green">
                  {t(permissionLabelKey(permission))}
                </AdminBadge>
              ))}
            </div>
            <p className="ad-muted">{t("admin.users.inheritedHint")}</p>
          </div>

          <div>
            <p className="ad-section-title">{t("admin.users.extra")}</p>
            <PermissionMatrix
              selected={permissions}
              excluded={basePermissions}
              onToggle={togglePermission}
            />
            <p className="ad-field__hint">{t("admin.users.extraHint")}</p>
          </div>
        </section>

        {needsReason && (
          <AdminField
            label={t("admin.users.justification")}
            hint={t("admin.users.justificationHint")}
            htmlFor="admin-user-reason"
          >
            <textarea
              id="admin-user-reason"
              value={justification}
              placeholder={t("admin.users.justificationPlaceholder")}
              onChange={(event) => setJustification(event.target.value)}
            />
          </AdminField>
        )}

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t(
            user ? "admin.users.save" : "admin.users.create",
          )}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire de rôle                                                  */
/* ------------------------------------------------------------------ */


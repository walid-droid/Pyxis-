import { useState } from "react";

import { useI18n } from "../../i18n";

import {
  type AdminRole,
  type BadgeTone,
} from "./adminData";
import {
  AdminBadge,
  AdminField,
  AdminIcon,
  AdminModal,
  AdminModalActions,
  PermissionMatrix,
} from "./AdminUI";

import { TONES } from "./usersRolesShared";

export default function RoleEditorModal({
  role,
  onSave,
  onClose,
}: {
  role: AdminRole;
  onSave: (patch: {
    name: string;
    description: string;
    tone: BadgeTone;
    permissions: string[];
  }) => void;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [tone, setTone] = useState<BadgeTone>(role.tone);
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const [error, setError] = useState<string | null>(null);

  function togglePermission(id: string) {
    setPermissions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError(t("admin.users.required"));
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      tone,
      permissions,
    });
  }

  return (
    <AdminModal
      title={t("admin.users.roleModalTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">{t("admin.users.roleModalLead")}</p>

      <div className="ad-modal__form">
        <div className="ad-role-summary">
          <AdminBadge tone={role.tone}>
            {t(`admin.users.family.${role.family}`)}
          </AdminBadge>
          <AdminBadge tone="slate">
            {t(`admin.users.scope.${role.territoryScope}`)}
          </AdminBadge>
          {role.locked && (
            <AdminBadge tone="violet">
              {t("admin.users.systemRole")}
            </AdminBadge>
          )}
        </div>

        <div className="ad-form-grid">
          <AdminField label={t("admin.users.roleName")} htmlFor="role-name">
            <input
              id="role-name"
              value={name}
              placeholder={t("admin.users.roleNamePlaceholder")}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.users.roleTone")} htmlFor="role-tone">
            <select
              id="role-tone"
              value={tone}
              onChange={(event) => setTone(event.target.value as BadgeTone)}
            >
              {TONES.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.users.tone.${item}`)}
                </option>
              ))}
            </select>
          </AdminField>

          <div className="is-full">
            <AdminField label={t("admin.users.roleDesc")} htmlFor="role-desc">
              <textarea
                id="role-desc"
                value={description}
                placeholder={t("admin.users.roleDescPlaceholder")}
                onChange={(event) => setDescription(event.target.value)}
              />
            </AdminField>
          </div>
        </div>

        <p className="ad-field__hint">
          {lang === "ar" ? role.descriptionAr : role.description}
        </p>

        {role.locked && (
          <p className="ad-inline-note">
            <AdminIcon name="lock" />
            {t("admin.users.roleLocked")}
          </p>
        )}

        <div>
          <p className="ad-section-title">{t("admin.users.permissionsFor")}</p>
          <PermissionMatrix
            selected={permissions}
            onToggle={togglePermission}
            disabled={role.locked}
          />
        </div>

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("common.save")}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */


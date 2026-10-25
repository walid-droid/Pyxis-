import "./admin.css";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  ROLE_FAMILIES,
  communeNames,
  initials,
  permissionLabelKey,
  roleRequiresCommune,
  roleRequiresWilaya,
  type AdminRole,
  type AdminUser,
  type BadgeTone,
  type Organisation,
  type RoleFamily,
  type UserStatus,
} from "./adminData";
import {
  AdminActionMenu,
  AdminBadge,
  AdminEmpty,
  AdminField,
  AdminHero,
  AdminIcon,
  AdminModal,
  AdminModalActions,
  AdminSearch,
  AdminSortHeader,
  AdminToast,
  AdminToggle,
  PermissionMatrix,
  type SortDirection,
} from "./AdminUI";

type Tab = "accounts" | "roles";
type SortKey = "name" | "role" | "status";

const PAGE_SIZE = 8;

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  active: "green",
  invited: "amber",
  suspended: "red",
};

const TONES: BadgeTone[] = [
  "green",
  "blue",
  "amber",
  "violet",
  "slate",
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function userMatches(
  user: AdminUser,
  query: string,
  role: AdminRole | undefined,
  org: Organisation | undefined,
): boolean {
  if (!query) return true;
  const haystack = normalize(
    [
      user.name,
      user.email,
      user.phone,
      user.wilaya,
      user.commune,
      role?.name ?? "",
      role?.nameAr ?? "",
      org?.name ?? "",
      org?.code ?? "",
    ].join(" "),
  );
  return haystack.includes(query);
}

function downloadCsv(name: string, rows: (string | number)[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Formulaire de compte                                                */
/* ------------------------------------------------------------------ */

type UserDraft = Omit<AdminUser, "id" | "createdAt" | "lastLogin">;

type UserSaveMeta = { detail?: string; actionKey?: string };

function UserEditorModal({
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

function RoleEditorModal({
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

function UsersRolesPage() {
  const { t, lang } = useI18n();
  const {
    state,
    addUser,
    updateUser,
    removeUser,
    resendInvitation,
    setUsersStatus,
    updateRole,
  } = useAdmin();
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "roles" ? "roles" : "accounts",
  );
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") ?? "all",
  );
  const [orgFilter, setOrgFilter] = useState(
    searchParams.get("org") ?? "all",
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDirection }>({
    key: "name",
    dir: "asc",
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editor, setEditor] = useState<{ userId?: string } | null>(
    searchParams.get("new") === "1" ? {} : null,
  );
  const [roleEditor, setRoleEditor] = useState<{ roleId: string } | null>(
    null,
  );
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [reasonModal, setReasonModal] = useState<{
    ids: string[];
    title: string;
    lead: string;
    action: "suspend" | "resend";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const tabParam = searchParams.get("tab");
  const newParam = searchParams.get("new");
  const orgParam = searchParams.get("org");
  const roleParam = searchParams.get("role");

  // Re-apply deep links (tab, new-account modal, organisation/role filter) when
  // the URL changes while the page stays mounted, e.g. browser back/forward.
  const [syncedParams, setSyncedParams] = useState({
    tab: tabParam,
    isNew: newParam,
    org: orgParam,
    role: roleParam,
  });
  if (
    tabParam !== syncedParams.tab ||
    newParam !== syncedParams.isNew ||
    orgParam !== syncedParams.org ||
    roleParam !== syncedParams.role
  ) {
    setSyncedParams({
      tab: tabParam,
      isNew: newParam,
      org: orgParam,
      role: roleParam,
    });
    if (tabParam !== syncedParams.tab && tabParam === "roles") setTab("roles");
    if (newParam !== syncedParams.isNew && newParam === "1") setEditor({});
    if (orgParam !== syncedParams.org && orgParam) setOrgFilter(orgParam);
    if (roleParam !== syncedParams.role && roleParam) setRoleFilter(roleParam);
  }

  const normalizedQuery = normalize(query.trim());

  const filteredUsers = useMemo(
    () =>
      state.users.filter((user) => {
        const role = state.roles.find((item) => item.id === user.roleId);
        const org = state.organisations.find(
          (item) => item.id === user.organisationId,
        );
        return (
          (roleFilter === "all" || user.roleId === roleFilter) &&
          (orgFilter === "all" ||
            (orgFilter === "none"
              ? user.organisationId === null
              : user.organisationId === orgFilter)) &&
          (statusFilter === "all" || user.status === statusFilter) &&
          userMatches(user, normalizedQuery, role, org)
        );
      }),
    [
      state.users,
      state.roles,
      state.organisations,
      roleFilter,
      orgFilter,
      statusFilter,
      normalizedQuery,
    ],
  );

  const sortedUsers = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    const statusRank: Record<UserStatus, number> = {
      active: 0,
      invited: 1,
      suspended: 2,
    };
    return [...filteredUsers].sort((a, b) => {
      if (sort.key === "status") {
        return (statusRank[a.status] - statusRank[b.status]) * factor;
      }
      if (sort.key === "role") {
        const roleA = state.roles.find((role) => role.id === a.roleId);
        const roleB = state.roles.find((role) => role.id === b.roleId);
        return (
          ((lang === "ar" ? roleA?.nameAr : roleA?.name) ?? "").localeCompare(
            (lang === "ar" ? roleB?.nameAr : roleB?.name) ?? "",
            lang,
          ) * factor
        );
      }
      return a.name.localeCompare(b.name, lang) * factor;
    });
  }, [filteredUsers, sort, state.roles, lang]);

  const pageCount = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedUsers = sortedUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const editingUser = editor?.userId
    ? state.users.find((user) => user.id === editor.userId)
    : undefined;
  const editingRole = roleEditor
    ? state.roles.find((role) => role.id === roleEditor.roleId)
    : undefined;

  const activeCount = state.users.filter(
    (user) => user.status === "active",
  ).length;
  const invitedCount = state.users.filter(
    (user) => user.status === "invited",
  ).length;

  function updateSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function resetPage() {
    setPage(1);
  }

  function handleSaveUser(draft: UserDraft, meta: UserSaveMeta) {
    if (editingUser) {
      updateUser(editingUser.id, draft, {
        actionKey: meta.actionKey,
        detail: meta.detail,
      });
      setNotice(
        t(
          meta.actionKey === "admin.act.userRoleChanged"
            ? "admin.users.roleChangedNotice"
            : meta.actionKey === "admin.act.userSuspended"
              ? "admin.users.suspendedNotice"
              : "admin.users.updated",
        ),
      );
    } else {
      addUser(draft);
      setNotice(t("admin.users.created"));
    }
    setEditor(null);
  }

  function handleSaveRole(patch: {
    name: string;
    description: string;
    tone: BadgeTone;
    permissions: string[];
  }) {
    if (!editingRole) return;
    updateRole(editingRole.id, patch);
    setNotice(t("admin.users.roleUpdated"));
    setRoleEditor(null);
  }

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function togglePage() {
    const ids = pagedUsers.map((user) => user.id);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  }

  function runBulkStatus(status: UserStatus) {
    const ids = selected.filter((id) => {
      const user = state.users.find((item) => item.id === id);
      return user && user.status !== status;
    });
    if (ids.length === 0) {
      setNotice(t("admin.users.noChange"));
      return;
    }
    if (status === "suspended") {
      setReasonModal({
        ids,
        title: t("admin.users.confirmSuspendTitle"),
        lead: t(
          ids.length === 1
            ? "admin.users.bulkSuspendLeadOne"
            : "admin.users.bulkSuspendLead",
          { count: ids.length },
        ),
        action: "suspend",
      });
      return;
    }
    setUsersStatus(ids, status, t("admin.users.bulkActivateReason"));
    setSelected([]);
    setNotice(t("admin.users.activatedNotice"));
  }

  function runBulkResend() {
    const ids = selected.filter((id) => {
      const user = state.users.find((item) => item.id === id);
      return user?.status === "invited";
    });
    if (ids.length === 0) {
      setNotice(t("admin.users.noInvitation"));
      return;
    }
    ids.forEach((id) => resendInvitation(id));
    setSelected([]);
    setNotice(t("admin.users.resent"));
  }

  function runReasonAction() {
    if (!reasonModal) return;
    if (reasonModal.action === "suspend") {
      if (!reason.trim()) return;
      setUsersStatus(reasonModal.ids, "suspended", reason.trim());
      setNotice(t("admin.users.suspendedNotice"));
    } else {
      reasonModal.ids.forEach((id) => resendInvitation(id));
      setNotice(t("admin.users.resent"));
    }
    setReason("");
    setReasonModal(null);
    setSelected([]);
  }

  function runDelete() {
    if (!deleteUser) return;
    removeUser(deleteUser.id);
    setDeleteUser(null);
    setNotice(t("admin.users.deleted"));
  }

  function exportCsv() {
    downloadCsv("cadm-comptes.csv", [
      [
        "nom",
        "email",
        "telephone",
        "role",
        "organisation",
        "wilaya",
        "commune",
        "statut",
        "mfa",
        "derniere_connexion",
      ],
      ...sortedUsers.map((user) => {
        const role = state.roles.find((item) => item.id === user.roleId);
        const org = state.organisations.find(
          (item) => item.id === user.organisationId,
        );
        return [
          user.name,
          user.email,
          user.phone,
          role?.name ?? "",
          org?.name ?? "",
          user.wilaya,
          user.commune,
          user.status,
          user.mfa ? "oui" : "non",
          user.lastLogin,
        ];
      }),
    ]);
    setNotice(t("admin.users.exportDone"));
  }

  const takenEmails = state.users
    .filter((user) => user.id !== editingUser?.id)
    .map((user) => user.email);

  const allPageSelected =
    pagedUsers.length > 0 &&
    pagedUsers.every((user) => selected.includes(user.id));

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.users.eyebrow")}
        title={t("admin.users.title")}
        lead={t("admin.users.lead")}
        chips={
          <>
            <span className="ad-chip">
              <AdminIcon name="users" />
              {t("admin.users.count", { count: state.users.length })}
            </span>
            <span className="ad-chip ad-chip--ok">
              <AdminIcon name="shield" />
              {t("admin.users.activeHint", { count: activeCount })}
            </span>
            <span className="ad-chip ad-chip--warn">
              <AdminIcon name="mail" />
              {t("admin.users.invitedHint", { count: invitedCount })}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            className="ad-btn ad-btn--green"
            onClick={() => {
              setTab("accounts");
              setEditor({});
            }}
          >
            <AdminIcon name="userPlus" />
            {t("admin.users.new")}
          </button>
        }
      />

      {notice && <AdminToast message={notice} />}

      <div className="ad-tabs" role="tablist" aria-label={t("admin.users.eyebrow")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "accounts"}
          className={`ad-tab${tab === "accounts" ? " is-active" : ""}`}
          onClick={() => setTab("accounts")}
        >
          <AdminIcon name="users" />
          {t("admin.users.tabAccounts")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "roles"}
          className={`ad-tab${tab === "roles" ? " is-active" : ""}`}
          onClick={() => setTab("roles")}
        >
          <AdminIcon name="key" />
          {t("admin.users.tabRoles")}
        </button>
      </div>

      {tab === "accounts" ? (
        <>
          <div className="ad-stat-grid">
            <StatCard
              tone="verified"
              value={state.users.length}
              label={t("admin.users.statsTotal")}
              badge={t("admin.users.statsTotalHint")}
              badgeTone="neutral"
            />
            <StatCard
              tone="ongoing"
              value={activeCount}
              label={t("admin.users.status.active")}
              badge={t("admin.users.activeHint", { count: activeCount })}
              badgeTone="success"
            />
            <StatCard
              tone="upcoming"
              value={invitedCount}
              label={t("admin.users.status.invited")}
              badge={t("admin.users.statsInvitedHint")}
              badgeTone="warning"
            />
            <StatCard
              tone="crisis"
              value={state.roles.length}
              label={t("admin.users.tabRoles")}
              badge={t("admin.users.statsRolesHint")}
              badgeTone="info"
            />
          </div>

          <section className="ad-card">
            <div className="ad-toolbar">
              <AdminSearch
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  resetPage();
                }}
                placeholder={t("admin.users.searchPlaceholder")}
                label={t("admin.users.filtersAria")}
              />

              <label className="ad-filter">
                <span>{t("admin.users.filterRole")}</span>
                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="all">{t("admin.users.allRoles")}</option>
                  {state.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {lang === "ar" ? role.nameAr : role.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ad-filter">
                <span>{t("admin.users.filterOrg")}</span>
                <select
                  value={orgFilter}
                  onChange={(event) => {
                    setOrgFilter(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="all">{t("admin.users.allOrgs")}</option>
                  <option value="none">
                    {t("admin.users.noOrganisation")}
                  </option>
                  {state.organisations.map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>
                      {lang === "ar"
                        ? organisation.nameAr
                        : organisation.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ad-filter">
                <span>{t("admin.users.filterStatus")}</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="all">
                    {t("admin.users.allStatuses")}
                  </option>
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
              </label>

              <span className="ad-toolbar__spacer" />
              <span className="ad-toolbar__count">
                {filteredUsers.length === 1
                  ? t("admin.users.countOne")
                  : t("admin.users.count", { count: filteredUsers.length })}
              </span>
              <button
                type="button"
                className="ad-btn ad-btn--soft ad-btn--small"
                onClick={exportCsv}
              >
                <AdminIcon name="download" />
                {t("admin.users.export")}
              </button>
            </div>

            {selected.length > 0 && (
              <div className="ad-bulk-bar">
                <AdminIcon name="check" />
                <strong>
                  {t(
                    selected.length === 1
                      ? "admin.users.selectedOne"
                      : "admin.users.selected",
                    { count: selected.length },
                  )}
                </strong>
                <span className="ad-bulk-bar__spacer" />
                <button
                  type="button"
                  className="ad-btn ad-btn--soft ad-btn--small"
                  onClick={() => runBulkStatus("active")}
                >
                  <AdminIcon name="power" />
                  {t("admin.users.activate")}
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn--soft ad-btn--small"
                  onClick={runBulkResend}
                >
                  <AdminIcon name="mail" />
                  {t("admin.users.resend")}
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn--outline-danger ad-btn--small"
                  onClick={() => runBulkStatus("suspended")}
                >
                  <AdminIcon name="lock" />
                  {t("admin.users.suspend")}
                </button>
                <button
                  type="button"
                  className="ad-icon-btn"
                  title={t("admin.users.clearSelection")}
                  aria-label={t("admin.users.clearSelection")}
                  onClick={() => setSelected([])}
                >
                  <AdminIcon name="close" />
                </button>
              </div>
            )}

            {filteredUsers.length === 0 ? (
              <AdminEmpty
                title={t("admin.users.empty")}
                text={t("admin.users.emptyText")}
                action={
                  <button
                    type="button"
                    className="ad-btn ad-btn--green ad-btn--small"
                    onClick={() => setEditor({})}
                  >
                    <AdminIcon name="plus" />
                    {t("admin.users.new")}
                  </button>
                }
              />
            ) : (
              <>
                <div className="ad-table-wrap">
                  <table className="ad-table ad-table--accounts">
                    <thead>
                      <tr>
                        <th className="ad-table__checkbox">
                          <input
                            type="checkbox"
                            className="ad-check"
                            checked={allPageSelected}
                            aria-label={t("admin.users.selectPage")}
                            onChange={togglePage}
                          />
                        </th>
                        <AdminSortHeader
                          label={t("admin.users.colUser")}
                          active={sort.key === "name"}
                          direction={sort.dir}
                          onClick={() => updateSort("name")}
                        />
                        <AdminSortHeader
                          label={t("admin.users.colRole")}
                          active={sort.key === "role"}
                          direction={sort.dir}
                          onClick={() => updateSort("role")}
                        />
                        <th>{t("admin.users.colOrg")}</th>
                        <th>{t("admin.users.colTerritory")}</th>
                        <AdminSortHeader
                          label={t("admin.users.colStatus")}
                          active={sort.key === "status"}
                          direction={sort.dir}
                          onClick={() => updateSort("status")}
                        />
                        <th>{t("admin.users.colLastLogin")}</th>
                        <th>{t("admin.users.colActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map((user) => {
                        const role = state.roles.find(
                          (item) => item.id === user.roleId,
                        );
                        const org = state.organisations.find(
                          (item) => item.id === user.organisationId,
                        );
                        const isSelected = selected.includes(user.id);

                        return (
                          <tr
                            key={user.id}
                            className={isSelected ? "is-selected" : undefined}
                          >
                            <td className="ad-table__checkbox">
                              <input
                                type="checkbox"
                                className="ad-check"
                                checked={isSelected}
                                aria-label={t("admin.users.selectRow", {
                                  name: user.name,
                                })}
                                onChange={() => toggleSelected(user.id)}
                              />
                            </td>
                            <td>
                              <span className="ad-user-cell">
                                <span className="ad-avatar">
                                  {initials(user.name)}
                                </span>
                                <span className="ad-user-cell__text">
                                  <span className="ad-user-cell__name">
                                    {user.name}
                                  </span>
                                  <span className="ad-user-cell__mail">
                                    {user.email}
                                  </span>
                                </span>
                              </span>
                            </td>
                            <td>
                              <AdminBadge tone={role?.tone ?? "neutral"}>
                                {lang === "ar" ? role?.nameAr : role?.name}
                              </AdminBadge>
                            </td>
                            <td>
                              {org ? (
                                <span className="ad-territory">
                                  <strong>
                                    {lang === "ar" ? org.nameAr : org.name}
                                  </strong>
                                  <span>{org.code}</span>
                                </span>
                              ) : (
                                <span className="ad-muted">
                                  {t("admin.users.noOrganisation")}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="ad-territory">
                                <strong>{user.wilaya || "—"}</strong>
                                <span>{user.commune || "—"}</span>
                              </span>
                            </td>
                            <td>
                              <AdminBadge tone={STATUS_TONE[user.status]}>
                                {t(`admin.users.status.${user.status}`)}
                              </AdminBadge>
                            </td>
                            <td className="ad-table__num">
                              {user.lastLogin}
                            </td>
                            <td>
                              <span className="ad-actions">
                                <button
                                  type="button"
                                  className="ad-icon-btn"
                                  title={t("admin.users.edit")}
                                  aria-label={t("admin.users.edit")}
                                  onClick={() =>
                                    setEditor({ userId: user.id })
                                  }
                                >
                                  <AdminIcon name="edit" />
                                </button>

                                <AdminActionMenu
                                  label={t("admin.common.actions")}
                                  items={[
                                    ...(user.status === "invited"
                                      ? [
                                          {
                                            id: "resend",
                                            label: t("admin.users.resend"),
                                            icon: "mail" as const,
                                            onSelect: () =>
                                              setReasonModal({
                                                ids: [user.id],
                                                title: t(
                                                  "admin.users.resendTitle",
                                                ),
                                                lead: t(
                                                  "admin.users.resendLead",
                                                  { name: user.name },
                                                ),
                                                action: "resend" as const,
                                              }),
                                          },
                                        ]
                                      : [
                                          {
                                            id: "toggle",
                                            label:
                                              user.status === "suspended"
                                                ? t("admin.users.activate")
                                                : t("admin.users.suspend"),
                                            icon:
                                              user.status === "suspended"
                                                ? ("power" as const)
                                                : ("lock" as const),
                                            onSelect: () => {
                                              if (
                                                user.status === "suspended"
                                              ) {
                                                updateUser(user.id, {
                                                  status: "active",
                                                });
                                                setNotice(
                                                  t(
                                                    "admin.users.activatedNotice",
                                                  ),
                                                );
                                              } else {
                                                setReasonModal({
                                                  ids: [user.id],
                                                  title: t(
                                                    "admin.users.confirmSuspendTitle",
                                                  ),
                                                  lead: t(
                                                    "admin.users.confirmSuspendLead",
                                                    { name: user.name },
                                                  ),
                                                  action: "suspend",
                                                });
                                              }
                                            },
                                          },
                                        ]),
                                    {
                                      id: "delete",
                                      label: t("admin.users.delete"),
                                      icon: "trash",
                                      tone: "danger",
                                      onSelect: () => {
                                        if (user.id === "u-1") {
                                          setNotice(
                                            t("admin.users.cannotDeleteSelf"),
                                          );
                                          return;
                                        }
                                        setDeleteUser(user);
                                      },
                                    },
                                  ]}
                                />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {pageCount > 1 && (
                  <div className="ad-pagination">
                    <span className="ad-toolbar__count">
                      {t("admin.users.page", {
                        page: safePage,
                        total: pageCount,
                      })}
                    </span>
                    <span className="ad-pagination__pages">
                      <button
                        type="button"
                        className="ad-page-btn"
                        disabled={safePage === 1}
                        onClick={() => setPage(safePage - 1)}
                      >
                        <AdminIcon name="arrow" />
                      </button>
                      {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                        (value) => (
                          <button
                            key={value}
                            type="button"
                            className={`ad-page-btn${
                              value === safePage ? " is-active" : ""
                            }`}
                            aria-current={value === safePage ? "page" : undefined}
                            onClick={() => setPage(value)}
                          >
                            {value}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        className="ad-page-btn"
                        disabled={safePage === pageCount}
                        onClick={() => setPage(safePage + 1)}
                      >
                        <AdminIcon name="arrow" />
                      </button>
                    </span>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      ) : (
        <section className="ad-card">
          <div className="ad-card__head">
            <div>
              <h2 className="ad-card__title">
                {t("admin.users.rolesTitle")}
              </h2>
              <p className="ad-card__lead">{t("admin.users.rolesLead")}</p>
            </div>
            <AdminBadge tone="violet">
              {t("admin.users.catalogue", { count: state.roles.length })}
            </AdminBadge>
          </div>

          {ROLE_FAMILIES.map((family: RoleFamily) => {
            const roles = state.roles.filter(
              (role) => role.family === family,
            );
            if (roles.length === 0) return null;
            return (
              <div key={family} className="ad-family-group">
                <div className="ad-family-head">
                  <h3>{t(`admin.users.family.${family}`)}</h3>
                  <span>
                    {t("admin.users.familyCount", { count: roles.length })}
                  </span>
                </div>

                <div className="ad-role-grid">
                  {roles.map((role) => {
                    const users = state.users.filter(
                      (user) => user.roleId === role.id,
                    );
                    const extra = role.permissions.slice(0, 6);

                    return (
                      <article key={role.id} className="ad-role-card">
                        <div className="ad-role-card__head">
                          <div className="ad-role-card__title">
                            <strong>
                              {lang === "ar" ? role.nameAr : role.name}
                            </strong>
                            <span>
                              {t(
                                users.length === 1
                                  ? "admin.users.roleUsersOne"
                                  : "admin.users.roleUsers",
                                { count: users.length },
                              )}
                            </span>
                          </div>
                          <AdminBadge tone={role.tone}>
                            {t(
                              role.permissions.length === 1
                                ? "admin.users.rolePermsOne"
                                : "admin.users.rolePerms",
                              { count: role.permissions.length },
                            )}
                          </AdminBadge>
                        </div>

                        <p>
                          {lang === "ar"
                            ? role.descriptionAr
                            : role.description}
                        </p>

                        <div className="ad-role-card__perms">
                          {extra.map((permission) => (
                            <span key={permission} className="ad-badge">
                              {t(permissionLabelKey(permission))}
                            </span>
                          ))}
                          {role.permissions.length > extra.length && (
                            <span className="ad-badge">
                              +{role.permissions.length - extra.length}
                            </span>
                          )}
                        </div>

                        <div className="ad-role-card__foot">
                          <span className="ad-role-card__meta">
                            <AdminBadge tone="slate">
                              {t(
                                `admin.users.scope.${role.territoryScope}`,
                              )}
                            </AdminBadge>
                            {role.locked && (
                              <AdminBadge tone="violet">
                                {t("admin.users.systemRole")}
                              </AdminBadge>
                            )}
                          </span>
                          <button
                            type="button"
                            className="ad-btn ad-btn--soft ad-btn--small"
                            onClick={() =>
                              setRoleEditor({ roleId: role.id })
                            }
                          >
                            <AdminIcon name="edit" />
                            {t("admin.users.editRole")}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {editor !== null && (
        <UserEditorModal
          user={editingUser}
          takenEmails={takenEmails}
          onSave={handleSaveUser}
          onClose={() => setEditor(null)}
        />
      )}

      {editingRole && (
        <RoleEditorModal
          role={editingRole}
          onSave={handleSaveRole}
          onClose={() => setRoleEditor(null)}
        />
      )}

      {deleteUser && (
        <AdminModal
          title={t("admin.users.confirmDeleteTitle")}
          onClose={() => setDeleteUser(null)}
        >
          <p className="ad-modal__warning">
            {t("admin.users.confirmDeleteLead", { name: deleteUser.name })}
          </p>
          <div className="ad-modal__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={() => setDeleteUser(null)}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--danger"
              onClick={runDelete}
            >
              {t("admin.users.confirmDelete")}
            </button>
          </div>
        </AdminModal>
      )}

      {reasonModal && (
        <AdminModal
          title={reasonModal.title}
          onClose={() => {
            setReason("");
            setReasonModal(null);
          }}
        >
          <p>{reasonModal.lead}</p>
          {reasonModal.action === "suspend" ? (
            <>
              <AdminField
                label={t("admin.users.justification")}
                hint={t("admin.users.justificationHint")}
                htmlFor="bulk-reason"
              >
                <textarea
                  id="bulk-reason"
                  value={reason}
                  placeholder={t("admin.users.justificationPlaceholder")}
                  onChange={(event) => setReason(event.target.value)}
                />
              </AdminField>
              {!reason.trim() && (
                <p className="ad-field__hint">
                  {t("admin.users.reasonRequired")}
                </p>
              )}
            </>
          ) : (
            <p className="ad-field__hint">{t("admin.users.resendHint")}</p>
          )}
          <div className="ad-modal__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={() => {
                setReason("");
                setReasonModal(null);
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className={`ad-btn ${
                reasonModal.action === "suspend"
                  ? "ad-btn--danger"
                  : "ad-btn--green"
              }`}
              disabled={
                reasonModal.action === "suspend" && !reason.trim()
              }
              onClick={runReasonAction}
            >
              {t(
                reasonModal.action === "suspend"
                  ? "admin.users.confirmSuspend"
                  : "admin.users.resend",
              )}
            </button>
          </div>
        </AdminModal>
      )}
    </main>
  );
}

export default UsersRolesPage;

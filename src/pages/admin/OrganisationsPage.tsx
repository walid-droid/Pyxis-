import "./admin.css";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import StatCard from "../../components/StatCard";
import { ADMIN_USERS_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useAdmin } from "./adminStore";
import {
  ORSEC_MODULE_IDS,
  initials,
  type OrgKind,
  type OrgStatus,
  type Organisation,
} from "./adminData";
import {
  AdminBadge,
  AdminEmpty,
  AdminField,
  AdminHero,
  AdminIcon,
  AdminModal,
  AdminModalActions,
  AdminSearch,
  AdminToast,
  type IconName,
} from "./AdminUI";

type OrgDraft = Omit<Organisation, "id" | "createdAt">;

const ORG_KINDS: OrgKind[] = [
  "administration",
  "protection",
  "health",
  "redcrescent",
  "security",
  "meteo",
  "publicworks",
  "media",
  "ngo",
];

const STATUS_TONE: Record<OrgStatus, "green" | "amber" | "red"> = {
  active: "green",
  pending: "amber",
  suspended: "red",
};

function kindIcon(kind: OrgKind): IconName {
  switch (kind) {
    case "protection":
      return "shield";
    case "health":
      return "activity";
    case "redcrescent":
      return "sparkles";
    case "security":
      return "lock";
    case "meteo":
      return "globe";
    case "publicworks":
      return "layers";
    case "media":
      return "mail";
    case "ngo":
      return "users";
    default:
      return "building";
  }
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ------------------------------------------------------------------ */
/* Formulaire organisation                                             */
/* ------------------------------------------------------------------ */

function OrganisationModal({
  takenCodes,
  onSave,
  onClose,
}: {
  takenCodes: string[];
  onSave: (draft: OrgDraft) => void;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const { state } = useAdmin();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [kind, setKind] = useState<OrgKind>("administration");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<OrgStatus>("pending");
  const [moduleId, setModuleId] = useState(ORSEC_MODULE_IDS[0]);
  const [error, setError] = useState<string | null>(null);

  const communes =
    state.wilayas.find((item) => item.name === wilaya)?.communes ?? [];
  const modules = state.modules.filter((module) =>
    ORSEC_MODULE_IDS.includes(module.id),
  );

  function handleSubmit() {
    if (!name.trim() || !code.trim()) {
      setError(t("admin.terr.required"));
      return;
    }
    if (
      takenCodes.some(
        (item) => item.toLowerCase() === code.trim().toLowerCase(),
      )
    ) {
      setError(t("admin.terr.codeTaken"));
      return;
    }
    if (!moduleId) {
      setError(t("admin.org.moduleRequired"));
      return;
    }
    onSave({
      code: code.trim(),
      name: name.trim(),
      nameAr: nameAr.trim() || name.trim(),
      kind,
      wilaya,
      commune,
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      moduleId,
    });
  }

  return (
    <AdminModal
      title={t("admin.org.createTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">{t("admin.org.createLead")}</p>

      <div className="ad-modal__form">
        <div className="ad-form-grid">
          <AdminField label={t("admin.org.code")} htmlFor="org-code">
            <input
              id="org-code"
              value={code}
              placeholder="ex. PC-19"
              onChange={(event) => setCode(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.org.kindLabel")} htmlFor="org-kind">
            <select
              id="org-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as OrgKind)}
            >
              {ORG_KINDS.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.org.kind.${item}`)}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label={t("admin.org.name")} htmlFor="org-name">
            <input
              id="org-name"
              value={name}
              placeholder="ex. Protection civile · Sétif"
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.org.nameAr")} htmlFor="org-name-ar">
            <input
              id="org-name-ar"
              value={nameAr}
              placeholder="مثال: الحماية المدنية · سطيف"
              dir="rtl"
              onChange={(event) => setNameAr(event.target.value)}
            />
          </AdminField>

          <AdminField
            label={t("admin.org.selectWilaya")}
            htmlFor="org-wilaya"
          >
            <select
              id="org-wilaya"
              value={wilaya}
              onChange={(event) => {
                setWilaya(event.target.value);
                setCommune("");
              }}
            >
              <option value="">{t("admin.users.selectWilaya")}</option>
              {state.wilayas.map((item) => (
                <option key={item.code} value={item.name}>
                  {lang === "ar" ? item.nameAr : item.name}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label={t("admin.users.commune")} htmlFor="org-commune">
            <select
              id="org-commune"
              value={commune}
              disabled={!wilaya}
              onChange={(event) => setCommune(event.target.value)}
            >
              <option value="">{t("admin.users.selectCommune")}</option>
              {communes.map((item) => (
                <option key={item.id} value={item.name}>
                  {lang === "ar" ? item.nameAr : item.name}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.org.module")}
            hint={t("admin.org.moduleHint")}
            htmlFor="org-module"
          >
            <select
              id="org-module"
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {t(module.nameKey)}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.common.status")}
            htmlFor="org-status"
          >
            <select
              id="org-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as OrgStatus)
              }
            >
              <option value="active">
                {t("admin.org.status.active")}
              </option>
              <option value="pending">
                {t("admin.org.status.pending")}
              </option>
              <option value="suspended">
                {t("admin.org.status.suspended")}
              </option>
            </select>
          </AdminField>

          <AdminField
            label={t("admin.org.contactLabel")}
            htmlFor="org-contact"
          >
            <input
              id="org-contact"
              value={contact}
              placeholder="ex. Leïla Haddad"
              onChange={(event) => setContact(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.org.email")} htmlFor="org-email">
            <input
              id="org-email"
              type="email"
              value={email}
              placeholder="contact@organisation.dz"
              onChange={(event) => setEmail(event.target.value)}
            />
          </AdminField>

          <AdminField label={t("admin.org.phone")} htmlFor="org-phone">
            <input
              id="org-phone"
              value={phone}
              placeholder="021 00 00 00"
              onChange={(event) => setPhone(event.target.value)}
            />
          </AdminField>
        </div>

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.org.create")}
          submitType="button"
          onConfirm={handleSubmit}
        />
      </div>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Rattachement d'un compte                                            */
/* ------------------------------------------------------------------ */

function LinkAccountModal({
  defaultUserId,
  defaultOrganisationId,
  onSave,
  onClose,
}: {
  defaultUserId?: string;
  defaultOrganisationId?: string;
  onSave: (payload: {
    userId: string;
    organisationId: string;
    wilaya: string;
    commune: string;
  }) => void;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const { state } = useAdmin();

  const [userId, setUserId] = useState(
    defaultUserId ?? state.users[0]?.id ?? "",
  );
  const [organisationId, setOrganisationId] = useState(
    defaultOrganisationId ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const organisation = state.organisations.find(
    (item) => item.id === organisationId,
  );

  function handleSubmit() {
    if (!userId || !organisation) {
      setError(t("admin.org.required"));
      return;
    }
    onSave({
      userId,
      organisationId,
      wilaya: organisation.wilaya,
      commune: organisation.commune,
    });
  }

  return (
    <AdminModal
      title={t("admin.org.linkTitle")}
      onClose={onClose}
      className="ad-modal--wide"
    >
      <p className="ad-card__lead">{t("admin.org.linkLead")}</p>

      <div className="ad-modal__form">
        <div className="ad-form-grid">
          <AdminField
            label={t("admin.org.selectUser")}
            htmlFor="link-user"
          >
            <select
              id="link-user"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            >
              {state.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} · {user.email}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            label={t("admin.org.selectOrg")}
            htmlFor="link-org"
          >
            <select
              id="link-org"
              value={organisationId}
              onChange={(event) => {
                setOrganisationId(event.target.value);
                setError(null);
              }}
            >
              <option value="">{t("admin.org.selectOrg")}</option>
              {state.organisations.map((item) => (
                <option key={item.id} value={item.id}>
                  {lang === "ar" ? item.nameAr : item.name}
                </option>
              ))}
            </select>
          </AdminField>
        </div>

        {organisation ? (
          <div className="ad-detail-facts">
            <span className="ad-fact">
              <span>{t("admin.org.colTerritory")}</span>
              <strong>
                {organisation.wilaya || "—"}
                {organisation.commune ? ` · ${organisation.commune}` : ""}
              </strong>
            </span>
            <span className="ad-fact">
              <span>{t("admin.org.module")}</span>
              <strong>
                {t(
                  state.modules.find(
                    (module) => module.id === organisation.moduleId,
                  )?.nameKey ?? "",
                )}
              </strong>
            </span>
          </div>
        ) : (
          <p className="ad-inline-note">
            <AdminIcon name="link" />
            {t("admin.org.linkTerritoryHint")}
          </p>
        )}

        {error && <p className="ad-modal__warning">{error}</p>}

        <AdminModalActions
          onClose={onClose}
          submitLabel={t("admin.org.link")}
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

function OrganisationsPage() {
  const { t, lang } = useI18n();
  const {
    state,
    addOrganisation,
    approveOrganisation,
    rejectOrganisation,
    linkAccount,
    unlinkAccount,
  } = useAdmin();

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [linkModal, setLinkModal] = useState<{
    organisationId?: string;
  } | null>(null);
  const [rejectOrg, setRejectOrg] = useState<Organisation | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [unlinkId, setUnlinkId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const linkedUsers = state.users.filter((user) => user.organisationId);

  const filteredOrganisations = useMemo(() => {
    const needle = normalize(query.trim());
    return state.organisations.filter((organisation) => {
      const matchesQuery =
        !needle ||
        normalize(
          [
            organisation.name,
            organisation.nameAr,
            organisation.code,
            organisation.contact,
            organisation.email,
            organisation.wilaya,
            organisation.commune,
          ].join(" "),
        ).includes(needle);

      return (
        matchesQuery &&
        (kindFilter === "all" || organisation.kind === kindFilter) &&
        (statusFilter === "all" || organisation.status === statusFilter)
      );
    });
  }, [state.organisations, query, kindFilter, statusFilter]);

  const coveredWilayas = new Set(
    state.organisations
      .filter((organisation) => organisation.status === "active")
      .map((organisation) => organisation.wilaya)
      .filter(Boolean),
  ).size;

  const pendingOrgs = state.organisations.filter(
    (organisation) => organisation.status === "pending",
  );

  const unlinkUser = unlinkId
    ? state.users.find((user) => user.id === unlinkId)
    : undefined;

  function moduleName(moduleId: string): string {
    const module = state.modules.find((item) => item.id === moduleId);
    return module ? t(module.nameKey) : "—";
  }

  function handleCreate(draft: OrgDraft) {
    addOrganisation(draft);
    setCreateModal(false);
    setNotice(t("admin.org.created"));
  }

  function handleLink(payload: {
    userId: string;
    organisationId: string;
    wilaya: string;
    commune: string;
  }) {
    linkAccount(payload.userId, {
      organisationId: payload.organisationId,
      wilaya: payload.wilaya,
      commune: payload.commune,
    });
    setLinkModal(null);
    setNotice(t("admin.org.linked"));
  }

  function handleApprove(organisation: Organisation) {
    approveOrganisation(organisation.id);
    setNotice(t("admin.org.approved", { name: organisation.name }));
  }

  function handleReject() {
    if (!rejectOrg || !rejectReason.trim()) return;
    rejectOrganisation(rejectOrg.id, rejectReason.trim());
    setNotice(t("admin.org.rejected", { name: rejectOrg.name }));
    setRejectOrg(null);
    setRejectReason("");
  }

  function handleUnlink() {
    if (!unlinkUser) return;
    unlinkAccount(unlinkUser.id);
    setUnlinkId(null);
    setNotice(t("admin.org.unlinked"));
  }

  return (
    <main className="ad-page">
      <AdminHero
        eyebrow={t("admin.org.eyebrow")}
        title={t("admin.org.title")}
        lead={t("admin.org.lead")}
        chips={
          <>
            <span className="ad-chip">
              <AdminIcon name="building" />
              {t("admin.org.count", { count: state.organisations.length })}
            </span>
            <span className="ad-chip">
              <AdminIcon name="link" />
              {t(
                linkedUsers.length === 1
                  ? "admin.org.linkCountOne"
                  : "admin.org.linkCount",
                { count: linkedUsers.length },
              )}
            </span>
            {pendingOrgs.length > 0 ? (
              <span className="ad-chip ad-chip--warn">
                <AdminIcon name="alert" />
                {t("admin.org.pendingCount", { count: pendingOrgs.length })}
              </span>
            ) : (
              <span className="ad-chip ad-chip--ok">
                <AdminIcon name="check" />
                {t("admin.org.noPending")}
              </span>
            )}
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn--green"
              onClick={() => setCreateModal(true)}
            >
              <AdminIcon name="plus" />
              {t("admin.org.new")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--ghost"
              onClick={() => setLinkModal({})}
            >
              <AdminIcon name="link" />
              {t("admin.org.linkAccount")}
            </button>
          </>
        }
      />

      {notice && <AdminToast message={notice} />}

      <div className="ad-stat-grid">
        <StatCard
          tone="verified"
          value={linkedUsers.length}
          label={t("admin.org.accounts")}
          badge={t("admin.org.accountsHint", {
            count: linkedUsers.length,
          })}
          badgeTone="success"
        />
        <StatCard
          tone="ongoing"
          value={coveredWilayas}
          label={t("admin.org.wilayas")}
          badge={t("admin.org.wilayasHint", {
            count: state.organisations.length,
          })}
          badgeTone="neutral"
        />
        <StatCard
          tone="crisis"
          value={pendingOrgs.length}
          label={t("admin.org.pending")}
          badge={t("admin.org.pendingHint")}
          badgeTone={pendingOrgs.length > 0 ? "warning" : "neutral"}
        />
        <StatCard
          tone="upcoming"
          value={state.organisations.length}
          label={t("admin.org.listTitle")}
          badge={t("admin.org.listHint", {
            count: state.organisations.length,
          })}
          badgeTone="info"
        />
      </div>

      <section className="ad-card">
        <div className="ad-toolbar">
          <AdminSearch
            value={query}
            onChange={setQuery}
            placeholder={t("admin.org.searchPlaceholder")}
            label={t("admin.org.searchPlaceholder")}
          />

          <label className="ad-filter">
            <span>{t("admin.org.filterKind")}</span>
            <select
              value={kindFilter}
              onChange={(event) => setKindFilter(event.target.value)}
            >
              <option value="all">{t("admin.org.kindAll")}</option>
              {ORG_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`admin.org.kind.${kind}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="ad-filter">
            <span>{t("admin.org.filterStatus")}</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">{t("admin.common.allF")}</option>
              <option value="active">
                {t("admin.org.status.active")}
              </option>
              <option value="pending">
                {t("admin.org.status.pending")}
              </option>
              <option value="suspended">
                {t("admin.org.status.suspended")}
              </option>
            </select>
          </label>

          <span className="ad-toolbar__spacer" />
          <span className="ad-toolbar__count">
            {filteredOrganisations.length === 1
              ? t("admin.org.countOne")
              : t("admin.org.count", {
                  count: filteredOrganisations.length,
                })}
          </span>
        </div>

        {filteredOrganisations.length === 0 ? (
          <AdminEmpty
            title={t("admin.org.emptyFilter")}
            text={t("admin.org.createLead")}
            action={
              <button
                type="button"
                className="ad-btn ad-btn--green ad-btn--small"
                onClick={() => setCreateModal(true)}
              >
                <AdminIcon name="plus" />
                {t("admin.org.new")}
              </button>
            }
          />
        ) : (
          <div className="ad-org-grid">
            {filteredOrganisations.map((organisation) => {
              const count = state.users.filter(
                (user) => user.organisationId === organisation.id,
              ).length;

              return (
                <article key={organisation.id} className="ad-org-card">
                  <div className="ad-org-card__head">
                    <span className="ad-org-card__icon">
                      <AdminIcon name={kindIcon(organisation.kind)} />
                    </span>
                    <span className="ad-org-card__title">
                      <strong>
                        {lang === "ar"
                          ? organisation.nameAr
                          : organisation.name}
                      </strong>
                      <span>
                        {organisation.code} ·{" "}
                        {t(`admin.org.kind.${organisation.kind}`)}
                      </span>
                    </span>
                    <AdminBadge tone={STATUS_TONE[organisation.status]}>
                      {t(`admin.org.status.${organisation.status}`)}
                    </AdminBadge>
                  </div>

                  <p className="ad-org-card__module">
                    <AdminIcon name="layers" />
                    <span>
                      <span>{t("admin.org.module")}</span>
                      <strong>{moduleName(organisation.moduleId)}</strong>
                    </span>
                  </p>

                  <div className="ad-org-card__meta">
                    <span>
                      <AdminIcon name="map" />
                      {organisation.wilaya || "—"}
                      {organisation.commune
                        ? ` · ${organisation.commune}`
                        : ""}
                    </span>
                    <span>
                      <AdminIcon name="mail" />
                      {organisation.email || "—"}
                    </span>
                    <span>
                      <AdminIcon name="phone" />
                      {organisation.phone || "—"}
                    </span>
                    <span>
                      <AdminIcon name="users" />
                      {organisation.contact || "—"}
                    </span>
                  </div>

                  {organisation.status === "pending" && (
                    <p className="ad-inline-note ad-inline-note--warn">
                      <AdminIcon name="clock" />
                      {t("admin.org.pendingNotice")}
                    </p>
                  )}

                  <div className="ad-org-card__foot">
                    <span className="ad-org-card__accounts">
                      <AdminIcon name="users" />
                      {t(
                        count === 1
                          ? "admin.org.linkedAccountsOne"
                          : "admin.org.linkedAccounts",
                        { count },
                      )}
                    </span>
                    {organisation.status === "pending" ? (
                      <span className="ad-actions">
                        <button
                          type="button"
                          className="ad-btn ad-btn--green ad-btn--small"
                          onClick={() => handleApprove(organisation)}
                        >
                          <AdminIcon name="check" />
                          {t("admin.org.approve")}
                        </button>
                        <button
                          type="button"
                          className="ad-btn ad-btn--soft ad-btn--small"
                          onClick={() => setRejectOrg(organisation)}
                        >
                          <AdminIcon name="reject" />
                          {t("admin.org.reject")}
                        </button>
                      </span>
                    ) : (
                      <span className="ad-actions">
                        <button
                          type="button"
                          className="ad-icon-btn"
                          title={t("admin.org.linkAccount")}
                          aria-label={t("admin.org.linkAccount")}
                          onClick={() =>
                            setLinkModal({
                              organisationId: organisation.id,
                            })
                          }
                        >
                          <AdminIcon name="link" />
                        </button>
                        <Link
                          className="ad-icon-btn"
                          title={t("admin.org.viewAccounts")}
                          aria-label={t("admin.org.viewAccounts")}
                          to={`${ADMIN_USERS_PATH}?org=${organisation.id}`}
                        >
                          <AdminIcon name="eye" />
                        </Link>
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="ad-card">
        <div className="ad-card__head">
          <div>
            <h2 className="ad-card__title">
              {t("admin.org.linksTitle")}
            </h2>
            <p className="ad-card__lead">
              {t(
                linkedUsers.length === 1
                  ? "admin.org.linksHintOne"
                  : "admin.org.linksHint",
                { count: linkedUsers.length },
              )}
            </p>
          </div>
          <AdminIcon name="link" />
        </div>

        {linkedUsers.length === 0 ? (
          <AdminEmpty
            title={t("admin.org.noLinks")}
            text={t("admin.org.noLinksText")}
            action={
              <button
                type="button"
                className="ad-btn ad-btn--green ad-btn--small"
                onClick={() => setLinkModal({})}
              >
                <AdminIcon name="link" />
                {t("admin.org.linkAccount")}
              </button>
            }
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>{t("admin.org.colAccount")}</th>
                  <th>{t("admin.org.colOrg")}</th>
                  <th>{t("admin.org.colModule")}</th>
                  <th>{t("admin.org.colTerritory")}</th>
                  <th>{t("admin.org.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {linkedUsers.map((user) => {
                  const organisation = state.organisations.find(
                    (item) => item.id === user.organisationId,
                  );
                  return (
                    <tr key={user.id}>
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
                        <span className="ad-territory">
                          <strong>
                            {lang === "ar"
                              ? organisation?.nameAr
                              : organisation?.name}
                          </strong>
                          <span>{organisation?.code ?? "—"}</span>
                        </span>
                      </td>
                      <td>
                        <AdminBadge tone="blue">
                          {organisation
                            ? moduleName(organisation.moduleId)
                            : "—"}
                        </AdminBadge>
                      </td>
                      <td>
                        <span className="ad-territory">
                          <strong>{user.wilaya || "—"}</strong>
                          <span>{user.commune || "—"}</span>
                        </span>
                      </td>
                      <td>
                        <span className="ad-actions">
                          <Link
                            className="ad-icon-btn"
                            title={t("admin.org.viewAccounts")}
                            aria-label={t("admin.org.viewAccounts")}
                            to={`${ADMIN_USERS_PATH}?org=${user.organisationId}`}
                          >
                            <AdminIcon name="eye" />
                          </Link>
                          <button
                            type="button"
                            className="ad-icon-btn ad-icon-btn--danger"
                            title={t("admin.org.unlink")}
                            aria-label={t("admin.org.unlink")}
                            onClick={() => setUnlinkId(user.id)}
                          >
                            <AdminIcon name="unlink" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {createModal && (
        <OrganisationModal
          takenCodes={state.organisations.map(
            (organisation) => organisation.code,
          )}
          onSave={handleCreate}
          onClose={() => setCreateModal(false)}
        />
      )}

      {linkModal && (
        <LinkAccountModal
          defaultOrganisationId={linkModal.organisationId}
          onSave={handleLink}
          onClose={() => setLinkModal(null)}
        />
      )}

      {rejectOrg && (
        <AdminModal
          title={t("admin.org.rejectTitle")}
          onClose={() => {
            setRejectOrg(null);
            setRejectReason("");
          }}
        >
          <p>
            {t("admin.org.rejectLead", { name: rejectOrg.name })}
          </p>
          <AdminField
            label={t("admin.org.rejectReason")}
            hint={t("admin.org.rejectReasonHint")}
            htmlFor="org-reject-reason"
          >
            <textarea
              id="org-reject-reason"
              value={rejectReason}
              placeholder={t("admin.org.rejectReasonPlaceholder")}
              onChange={(event) => setRejectReason(event.target.value)}
            />
          </AdminField>
          {!rejectReason.trim() && (
            <p className="ad-field__hint">{t("admin.users.reasonRequired")}</p>
          )}
          <div className="ad-modal__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={() => {
                setRejectOrg(null);
                setRejectReason("");
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--danger"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
            >
              {t("admin.org.rejectConfirm")}
            </button>
          </div>
        </AdminModal>
      )}

      {unlinkUser && (
        <AdminModal
          title={t("admin.org.unlinkTitle")}
          onClose={() => setUnlinkId(null)}
        >
          <p>
            {t("admin.org.unlinkLead", { name: unlinkUser.name })}
          </p>
          <div className="ad-modal__actions">
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={() => setUnlinkId(null)}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn--danger"
              onClick={handleUnlink}
            >
              {t("admin.org.unlinkConfirm")}
            </button>
          </div>
        </AdminModal>
      )}
    </main>
  );
}

export default OrganisationsPage;

import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DEFS, ROLES, roleName, type Role } from "../../auth/roles";
import { useI18n } from "../../i18n";
import type { User } from "../../services/model";
import { createUser, setUserActive, updateUser } from "../../services/users";
import { useDb } from "../../services/useDb";
import { formatDateTime, moduleLabel, territoryLabel, userName } from "../shared/v3/helpers";

type FormState = {
  prenomFr: string;
  prenomAr: string;
  nomFr: string;
  nomAr: string;
  email: string;
  role: Role;
  moduleId: string;
  territoryId: string;
  actif: boolean;
};

const EMPTY_FORM: FormState = {
  prenomFr: "",
  prenomAr: "",
  nomFr: "",
  nomAr: "",
  email: "",
  role: "citizen",
  moduleId: "",
  territoryId: "",
  actif: true,
};

function formFromUser(user: User): FormState {
  return {
    prenomFr: user.prenom.fr,
    prenomAr: user.prenom.ar,
    nomFr: user.nom.fr,
    nomAr: user.nom.ar,
    email: user.email,
    role: user.role,
    moduleId: user.moduleId ?? "",
    territoryId: user.territoryId ?? "",
    actif: user.actif,
  };
}

export default function AdminAccountsPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [editing, setEditing] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const roleDef = ROLE_DEFS[form.role];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setOpen(true);
  }

  function startEdit(user: User) {
    setEditing(user);
    setForm(formFromUser(user));
    setError(null);
    setOpen(true);
  }

  function save() {
    if (!session) return;
    if (!form.prenomFr.trim() || !form.nomFr.trim() || !form.email.trim()) {
      setError(t("admin.accounts.required"));
      return;
    }
    if (roleDef.needsModule && !form.moduleId) {
      setError(t("admin.accounts.moduleRequired"));
      return;
    }
    if (form.role !== "citizen" && roleDef.territoryScope !== "none" && !form.territoryId) {
      setError(t("admin.accounts.territoryRequired"));
      return;
    }

    const input = {
      prenom: { fr: form.prenomFr.trim(), ar: form.prenomAr.trim() || form.prenomFr.trim() },
      nom: { fr: form.nomFr.trim(), ar: form.nomAr.trim() || form.nomFr.trim() },
      email: form.email.trim(),
      role: form.role,
      moduleId: roleDef.needsModule ? form.moduleId : undefined,
      territoryId: form.territoryId || undefined,
      actif: form.actif,
    };

    if (editing) {
      updateUser(editing.id, input, session.userId);
      setNotice(t("admin.accounts.updated"));
    } else {
      const created = createUser(input, session.userId);
      if (!created) {
        setError(t("admin.accounts.duplicateEmail"));
        return;
      }
      setNotice(t("admin.accounts.created"));
    }
    setOpen(false);
    setForm(EMPTY_FORM);
    setEditing(null);
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.accounts.title")}</p>
          <h1 className="v3-title">{t("admin.accounts.title")}</h1>
          <p className="v3-lead">{t("admin.accounts.lead")}</p>
        </div>
        <div className="v3-actions">
          <button type="button" className="v3-btn v3-btn--primary" onClick={startCreate}>
            {t("admin.accounts.add")}
          </button>
        </div>
      </header>

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      {db.users.length === 0 ? (
        <p className="v3-empty">{t("admin.accounts.empty")}</p>
      ) : (
        <div className="v3-table-wrap">
          <table className="v3-table">
            <thead>
              <tr>
                <th>{t("admin.accounts.name")}</th>
                <th>{t("admin.accounts.email")}</th>
                <th>{t("admin.accounts.role")}</th>
                <th>{t("admin.accounts.module")}</th>
                <th>{t("admin.accounts.territory")}</th>
                <th>{t("admin.accounts.status")}</th>
                <th>{t("admin.accounts.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {db.users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="v3-table__main">{userName(db, user.id, lang)}</span>
                    <span className="v3-table__sub">{formatDateTime(user.createdAt, lang)}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{roleName(user.role, lang)}</td>
                  <td>
                    {user.moduleId
                      ? moduleLabel(db, user.moduleId, lang)
                      : t("admin.accounts.noModule")}
                  </td>
                  <td>
                    {user.territoryId
                      ? territoryLabel(db, user.territoryId, lang)
                      : t("admin.accounts.noTerritory")}
                  </td>
                  <td>
                    <span
                      className={`v3-badge ${user.actif ? "v3-badge--green" : "v3-badge--red"}`}
                    >
                      {user.actif
                        ? t("admin.accounts.activate")
                        : t("admin.accounts.deactivate")}
                    </span>
                  </td>
                  <td>
                    <div className="v3-inline">
                      <button
                        type="button"
                        className="v3-btn v3-btn--small"
                        onClick={() => startEdit(user)}
                      >
                        {t("admin.accounts.edit")}
                      </button>
                      <button
                        type="button"
                        className={`v3-btn v3-btn--small ${
                          user.actif ? "v3-btn--danger" : ""
                        }`}
                        onClick={() => {
                          if (!session) return;
                          setUserActive(user.id, !user.actif, session.userId);
                        }}
                      >
                        {user.actif
                          ? t("admin.accounts.deactivate")
                          : t("admin.accounts.activate")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <Modal
          title={editing ? t("admin.accounts.edit") : t("admin.accounts.add")}
          onClose={() => setOpen(false)}
          className="v3-modal-wide"
        >
          <div className="v3-form v3-form--2">
            <div className="v3-field">
              <label htmlFor="account-first-fr">{t("admin.accounts.firstNameFr")}</label>
              <input
                id="account-first-fr"
                value={form.prenomFr}
                onChange={(event) => update("prenomFr", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="account-first-ar">{t("admin.accounts.firstNameAr")}</label>
              <input
                id="account-first-ar"
                value={form.prenomAr}
                onChange={(event) => update("prenomAr", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="account-last-fr">{t("admin.accounts.nameFr")}</label>
              <input
                id="account-last-fr"
                value={form.nomFr}
                onChange={(event) => update("nomFr", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="account-last-ar">{t("admin.accounts.nameAr")}</label>
              <input
                id="account-last-ar"
                value={form.nomAr}
                onChange={(event) => update("nomAr", event.target.value)}
              />
            </div>
            <div className="v3-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="account-email">{t("admin.accounts.email")}</label>
              <input
                id="account-email"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="account-role">{t("admin.accounts.role")}</label>
              <select
                id="account-role"
                value={form.role}
                onChange={(event) => update("role", event.target.value as Role)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleName(role, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div className="v3-field">
              <label htmlFor="account-module">{t("admin.accounts.module")}</label>
              <select
                id="account-module"
                value={form.moduleId}
                disabled={!roleDef.needsModule}
                onChange={(event) => update("moduleId", event.target.value)}
              >
                <option value="">{t("admin.accounts.noModule")}</option>
                {db.reference.modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.nom[lang]}
                  </option>
                ))}
              </select>
            </div>
            <div className="v3-field">
              <label htmlFor="account-territory">{t("admin.accounts.territory")}</label>
              <select
                id="account-territory"
                value={form.territoryId}
                onChange={(event) => update("territoryId", event.target.value)}
              >
                <option value="">{t("admin.accounts.noTerritory")}</option>
                {db.reference.territories.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.nom[lang]}
                  </option>
                ))}
              </select>
            </div>
            <label className="v3-inline" htmlFor="account-active">
              <input
                id="account-active"
                type="checkbox"
                checked={form.actif}
                onChange={(event) => update("actif", event.target.checked)}
              />
              <span>{t("admin.accounts.active")}</span>
            </label>
            {!editing ? <p className="v3-note">{t("admin.accounts.passwordHint")}</p> : null}
            {error ? <p className="v3-note v3-note--danger">{error}</p> : null}
          </div>
          <div className="v3-form__actions">
            <button type="button" className="v3-btn" onClick={() => setOpen(false)}>
              {t("admin.accounts.cancel")}
            </button>
            <button type="button" className="v3-btn v3-btn--primary" onClick={save}>
              {t("admin.accounts.save")}
            </button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

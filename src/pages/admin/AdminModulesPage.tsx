import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import type { ModuleDef } from "../../data/modules";
import { useI18n } from "../../i18n";
import { updateModuleRef } from "../../services/reference";
import { useDb } from "../../services/useDb";

type FormState = {
  nomFr: string;
  nomAr: string;
  missionFr: string;
  missionAr: string;
  organismesFr: string;
  organismesAr: string;
  rehabilitation: boolean;
};

function formFrom(module: ModuleDef): FormState {
  return {
    nomFr: module.nom.fr,
    nomAr: module.nom.ar,
    missionFr: module.mission.fr,
    missionAr: module.mission.ar,
    organismesFr: module.organismes.map((organism) => organism.fr).join("\n"),
    organismesAr: module.organismes.map((organism) => organism.ar).join("\n"),
    rehabilitation: module.rehabilitation,
  };
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminModulesPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [editing, setEditing] = useState<ModuleDef | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function startEdit(module: ModuleDef) {
    setEditing(module);
    setForm(formFrom(module));
  }

  function save() {
    if (!session || !editing || !form) return;
    const fr = lines(form.organismesFr);
    const ar = lines(form.organismesAr);
    updateModuleRef(
      editing.id,
      {
        nom: { fr: form.nomFr.trim(), ar: form.nomAr.trim() || form.nomFr.trim() },
        mission: {
          fr: form.missionFr.trim(),
          ar: form.missionAr.trim() || form.missionFr.trim(),
        },
        organismes: fr.map((name, index) => ({ fr: name, ar: ar[index] ?? name })),
        rehabilitation: form.rehabilitation,
      },
      session.userId,
    );
    setNotice(t("admin.modules.updated"));
    setEditing(null);
    setForm(null);
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.modules.title")}</p>
          <h1 className="v3-title">{t("admin.modules.title")}</h1>
          <p className="v3-lead">{t("admin.modules.lead")}</p>
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

      <div className="v3-table-wrap">
        <table className="v3-table">
          <thead>
            <tr>
              <th>{t("admin.modules.number")}</th>
              <th>{t("admin.modules.name")}</th>
              <th>{t("admin.modules.organisms")}</th>
              <th>{t("admin.modules.mission")}</th>
              <th>{t("admin.modules.rehabilitation")}</th>
              <th>{t("admin.accounts.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {db.reference.modules.map((module) => (
              <tr key={module.id}>
                <td className="v3-table__main">{module.no}</td>
                <td>
                  <span className="v3-table__main">{module.nom[lang]}</span>
                  <span className="v3-table__sub">{module.id}</span>
                </td>
                <td>{module.organismes.map((organism) => organism[lang]).join(" · ")}</td>
                <td>{module.mission[lang]}</td>
                <td>
                  <span
                    className={`v3-badge ${module.rehabilitation ? "v3-badge--green" : "v3-badge--amber"}`}
                  >
                    {module.rehabilitation
                      ? t("admin.modules.present")
                      : t("admin.modules.absent")}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="v3-btn v3-btn--small"
                    onClick={() => startEdit(module)}
                  >
                    {t("admin.modules.edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && form ? (
        <Modal
          title={`${t("admin.modules.edit")} — ${editing.no}`}
          onClose={() => {
            setEditing(null);
            setForm(null);
          }}
          className="v3-modal-wide"
        >
          <div className="v3-form v3-form--2">
            <div className="v3-field">
              <label htmlFor="module-name-fr">{t("admin.modules.nameFr")}</label>
              <input
                id="module-name-fr"
                value={form.nomFr}
                onChange={(event) => setForm({ ...form, nomFr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="module-name-ar">{t("admin.modules.nameAr")}</label>
              <input
                id="module-name-ar"
                value={form.nomAr}
                onChange={(event) => setForm({ ...form, nomAr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="module-mission-fr">{t("admin.modules.missionFr")}</label>
              <textarea
                id="module-mission-fr"
                value={form.missionFr}
                onChange={(event) => setForm({ ...form, missionFr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="module-mission-ar">{t("admin.modules.missionAr")}</label>
              <textarea
                id="module-mission-ar"
                value={form.missionAr}
                onChange={(event) => setForm({ ...form, missionAr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="module-organisms-fr">{t("admin.modules.organismesFr")}</label>
              <textarea
                id="module-organisms-fr"
                value={form.organismesFr}
                onChange={(event) => setForm({ ...form, organismesFr: event.target.value })}
              />
              <p className="v3-field__hint">{t("admin.modules.organismesHint")}</p>
            </div>
            <div className="v3-field">
              <label htmlFor="module-organisms-ar">{t("admin.modules.organismesAr")}</label>
              <textarea
                id="module-organisms-ar"
                value={form.organismesAr}
                onChange={(event) => setForm({ ...form, organismesAr: event.target.value })}
              />
            </div>
            <label className="v3-inline" htmlFor="module-rehabilitation">
              <input
                id="module-rehabilitation"
                type="checkbox"
                checked={form.rehabilitation}
                onChange={(event) => setForm({ ...form, rehabilitation: event.target.checked })}
              />
              <span>{t("admin.modules.rehabilitation")}</span>
            </label>
          </div>
          <div className="v3-form__actions">
            <button
              type="button"
              className="v3-btn"
              onClick={() => {
                setEditing(null);
                setForm(null);
              }}
            >
              {t("admin.modules.cancel")}
            </button>
            <button type="button" className="v3-btn v3-btn--primary" onClick={save}>
              {t("admin.modules.save")}
            </button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

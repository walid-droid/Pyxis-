import { useState } from "react";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import type { TypeCatastrophe } from "../../data/types";
import { updateTypeRef } from "../../services/reference";
import { useDb } from "../../services/useDb";

type FormState = {
  labelFr: string;
  labelAr: string;
  consignesFr: string;
  consignesAr: string;
};

function formFrom(type: TypeCatastrophe): FormState {
  return {
    labelFr: type.libelle.fr,
    labelAr: type.libelle.ar,
    consignesFr: type.consignes.fr,
    consignesAr: type.consignes.ar,
  };
}

export default function AdminTypesPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [editing, setEditing] = useState<TypeCatastrophe | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function startEdit(type: TypeCatastrophe) {
    setEditing(type);
    setForm(formFrom(type));
  }

  function save() {
    if (!session || !editing || !form) return;
    updateTypeRef(
      editing.code,
      {
        libelle: {
          fr: form.labelFr.trim(),
          ar: form.labelAr.trim() || form.labelFr.trim(),
        },
        consignes: {
          fr: form.consignesFr.trim(),
          ar: form.consignesAr.trim() || form.consignesFr.trim(),
        },
      },
      session.userId,
    );
    setNotice(t("admin.types.updated"));
    setEditing(null);
    setForm(null);
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.types.title")}</p>
          <h1 className="v3-title">{t("admin.types.title")}</h1>
          <p className="v3-lead">{t("admin.types.lead")}</p>
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

      <div className="v3-grid">
        {db.reference.types.map((type) => (
          <article key={type.code} className="v3-card">
            <header className="v3-card__head">
              <div>
                <h2 className="v3-card__title">
                  <span className="v3-badge v3-badge--brand" style={{ marginInlineEnd: 8 }}>
                    {type.code}
                  </span>
                  {type.libelle[lang]}
                </h2>
                <p className="v3-card__hint">{type.libelle.fr} · {type.libelle.ar}</p>
              </div>
              <button type="button" className="v3-btn v3-btn--small" onClick={() => startEdit(type)}>
                {t("admin.types.edit")}
              </button>
            </header>
            <p className="v3-list__meta">{t("admin.types.consignes")}</p>
            <p className="v3-note">{type.consignes[lang]}</p>
          </article>
        ))}
      </div>

      {editing && form ? (
        <Modal
          title={`${t("admin.types.edit")} — ${editing.code}`}
          onClose={() => {
            setEditing(null);
            setForm(null);
          }}
          className="v3-modal-wide"
        >
          <div className="v3-form v3-form--2">
            <div className="v3-field">
              <label htmlFor="type-label-fr">{t("admin.types.labelFr")}</label>
              <input
                id="type-label-fr"
                value={form.labelFr}
                onChange={(event) => setForm({ ...form, labelFr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="type-label-ar">{t("admin.types.labelAr")}</label>
              <input
                id="type-label-ar"
                value={form.labelAr}
                onChange={(event) => setForm({ ...form, labelAr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="type-consignes-fr">{t("admin.types.consignesFr")}</label>
              <textarea
                id="type-consignes-fr"
                value={form.consignesFr}
                onChange={(event) => setForm({ ...form, consignesFr: event.target.value })}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="type-consignes-ar">{t("admin.types.consignesAr")}</label>
              <textarea
                id="type-consignes-ar"
                value={form.consignesAr}
                onChange={(event) => setForm({ ...form, consignesAr: event.target.value })}
              />
            </div>
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
              {t("admin.types.cancel")}
            </button>
            <button type="button" className="v3-btn v3-btn--primary" onClick={save}>
              {t("admin.types.save")}
            </button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

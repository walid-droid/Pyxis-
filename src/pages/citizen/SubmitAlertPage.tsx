import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import type { TypeCode } from "../../data/types";
import { suggestCatastrophe } from "../../services/ai";
import { createSignalement } from "../../services/reports";
import { useDb } from "../../services/useDb";
import { useNotifications } from "../../lib/notificationsContext";
import { SUBMIT_ALERT_PATH, MY_REPORTS_PATH } from "../../config";
import type { Gravity } from "../../services/model";
import "./SubmitAlertPage.css";

type SubmitForm = {
  title: string;
  type: TypeCode;
  description: string;
  communeId: string;
  latitude: string;
  longitude: string;
  photo: string;
  photoName: string;
  people: string;
  severity: Gravity;
};

const GRAVITIES: Gravity[] = ["faible", "moyenne", "elevee", "critique"];

export default function SubmitAlertPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { session } = useAuth();
  const { push } = useNotifications();
  const db = useDb();
  const [form, setForm] = useState<SubmitForm>({
    title: "",
    type: "C2",
    description: "",
    communeId: "",
    latitude: "",
    longitude: "",
    photo: "",
    photoName: "",
    people: "1",
    severity: "moyenne",
  });
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestion = useMemo(() => suggestCatastrophe(form.description), [
    form.description,
  ]);
  const suggestionType = suggestion
    ? db.reference.types.find((type) => type.code === suggestion.typeId)
    : undefined;
  const communeOptions = useMemo(
    () =>
      db.reference.territories.filter(
        (territory) => territory.niveau === "commune",
      ),
    [db.reference.territories],
  );

  function update<K extends keyof SubmitForm>(key: K, value: SubmitForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("photo", reader.result);
        update("photoName", file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    update("photo", "");
    update("photoName", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      window.alert(t("submit.geoUnsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update("latitude", position.coords.latitude.toFixed(6));
        update("longitude", position.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        window.alert(t("submit.geoFailed"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const signalement = createSignalement({
      auteurId: session.userId,
      typeId: form.type,
      description: form.description.trim(),
      communeId: form.communeId,
      latitude: form.latitude.trim() === "" ? undefined : Number(form.latitude),
      longitude: form.longitude.trim() === "" ? undefined : Number(form.longitude),
      photo: form.photo || undefined,
      personnesConcernees: Math.max(1, Number(form.people) || 1),
      suggestion: suggestion
        ? { typeId: suggestion.typeId, gravite: suggestion.gravite, confiance: suggestion.confiance }
        : undefined,
    });

    push({
      kind: "mission",
      titleKey: "notif.report.title",
      detailKey: "notif.report.detail",
    });

    navigate(MY_REPORTS_PATH, { state: { submitted: signalement.id } });
  }

  if (!session) {
    return (
      <main className="submit-alert-page">
        <section className="submit-alert-section">
          <h2>{t("submit.loginRequired")}</h2>
          <p>{t("submit.loginLead")}</p>
          <div className="submit-alert-buttons">
            <button type="button" className="submit-alert-cancel" onClick={() => navigate("/login")}>
              {t("login.submit")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="submit-alert-page">
      <header className="submit-alert-hero">
        <div className="submit-alert-hero-text">
          <span className="submit-alert-badge">
            <i className="submit-alert-badge-dot" aria-hidden="true" />
            {t("submit.badge")}
          </span>
          <p className="submit-alert-eyebrow">{t("submit.eyebrow")}</p>
          <h1>{t("submit.title")}</h1>
          <p className="submit-alert-lead">{t("submit.lead")}</p>
        </div>
        <span className="submit-alert-hero-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <path d="M3 8h18" />
            <path d="M5 8v4" />
            <path d="M15 8v4" />
          </svg>
        </span>
      </header>

      <form className="submit-alert-form" onSubmit={handleSubmit}>
        <section className="submit-alert-section">
          <div className="submit-alert-section-head">
            <span className="submit-alert-step">01</span>
            <div className="submit-alert-section-title">
              <h2>{t("submit.section1")}</h2>
              <p>{t("submit.section1Lead")}</p>
            </div>
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-title">
              {t("submit.titleLabel")} <span className="submit-alert-req">*</span>
            </label>
            <input
              id="alert-title"
              required
              maxLength={120}
              placeholder={t("submit.titlePlaceholder")}
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </div>

          <div className="submit-alert-grid">
            <div className="submit-alert-field">
              <label htmlFor="alert-type">
                {t("submit.typeLabel")} <span className="submit-alert-req">*</span>
              </label>
              <select
                id="alert-type"
                required
                value={form.type}
                onChange={(event) => update("type", event.target.value as TypeCode)}
              >
                <option value="">{t("submit.typePlaceholder")}</option>
                {db.reference.types.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.code} — {type.libelle[lang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="submit-alert-field submit-alert-severity-field">
              <span className="submit-alert-legend">
                {t("submit.severity")} <span className="submit-alert-req">*</span>
              </span>
              <div className="submit-alert-severity">
                {GRAVITIES.map((gravity) => (
                  <label key={gravity} className={`severity-chip severity-chip--${gravity}`}>
                    <input
                      type="radio"
                      name="severity"
                      value={gravity}
                      checked={form.severity === gravity}
                      onChange={() => update("severity", gravity)}
                    />
                    <span>{t(`alerts.gravity.${gravity}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {suggestion ? (
            <div className="submit-alert-ai" role="note">
              <span className="submit-alert-ai__badge">
                <i aria-hidden="true" />
                {t("submit.aiTitle")}
              </span>
              <p className="submit-alert-ai__text">
                {t("submit.aiSuggestion", {
                  type: `${suggestion.typeId} · ${suggestionType?.libelle[lang] ?? suggestion.typeId}`,
                  gravity: t(`alerts.gravity.${suggestion.gravite}`),
                })}
              </p>
              <p className="submit-alert-ai__meta">
                {t("submit.aiConfidence", { value: Math.round(suggestion.confiance * 100) })}
              </p>
              <button
                type="button"
                className="submit-alert-ai__apply"
                onClick={() => suggestion && update("type", suggestion.typeId)}
              >
                {t("submit.aiApply")}
              </button>
            </div>
          ) : (
            <p className="submit-alert-ai__meta">{t("submit.aiNone")}</p>
          )}
        </section>

        <section className="submit-alert-section">
          <div className="submit-alert-section-head">
            <span className="submit-alert-step">02</span>
            <div className="submit-alert-section-title">
              <h2>{t("submit.section2")}</h2>
              <p>{t("submit.section2Lead")}</p>
            </div>
          </div>

          <div className="submit-alert-grid">
            <div className="submit-alert-field">
              <label htmlFor="alert-wilaya">
                {t("submit.wilaya")} <span className="submit-alert-req">*</span>
              </label>
              <select
                id="alert-wilaya"
                required
                value={db.reference.territories.find((territory) => territory.id === form.communeId)?.parentId ?? ""}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    communeId: event.target.value,
                  }))
                }
              >
                <option value="">—</option>
                {db.reference.territories
                  .filter((territory) => territory.niveau === "wilaya")
                  .map((territory) => (
                    <option key={territory.id} value={territory.id}>
                      {territory.nom[lang]}
                    </option>
                  ))}
              </select>
            </div>

            <div className="submit-alert-field">
              <label htmlFor="alert-commune">
                {t("submit.commune")} <span className="submit-alert-req">*</span>
              </label>
              <select
                id="alert-commune"
                required
                value={form.communeId}
                onChange={(event) => update("communeId", event.target.value)}
              >
                <option value="">—</option>
                {communeOptions.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.nom[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="submit-alert-grid">
            <div className="submit-alert-field">
              <label htmlFor="alert-latitude">{t("submit.latitude")}</label>
              <input
                id="alert-latitude"
                type="number"
                step="any"
                inputMode="decimal"
                placeholder={t("submit.latitudePlaceholder")}
                value={form.latitude}
                onChange={(event) => update("latitude", event.target.value)}
              />
            </div>
            <div className="submit-alert-field">
              <label htmlFor="alert-longitude">{t("submit.longitude")}</label>
              <input
                id="alert-longitude"
                type="number"
                step="any"
                inputMode="decimal"
                placeholder={t("submit.longitudePlaceholder")}
                value={form.longitude}
                onChange={(event) => update("longitude", event.target.value)}
              />
            </div>
          </div>

          <div className="submit-alert-position">
            <div className="submit-alert-position-head">
              <div>
                <p className="submit-alert-sublabel">{t("submit.gps")}</p>
                <p className="submit-alert-sublabel-hint">{t("submit.gpsHint")}</p>
              </div>
              <button
                type="button"
                className="submit-alert-locate"
                onClick={useMyLocation}
                disabled={locating}
              >
                <span aria-hidden="true">◎</span>
                {locating ? t("submit.locating") : t("submit.useLocation")}
              </button>
            </div>
          </div>
        </section>

        <section className="submit-alert-section">
          <div className="submit-alert-section-head">
            <span className="submit-alert-step">03</span>
            <div className="submit-alert-section-title">
              <h2>{t("submit.section3")}</h2>
              <p>{t("submit.section3Lead")}</p>
            </div>
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-description">
              {t("submit.description")} <span className="submit-alert-req">*</span>
            </label>
            <textarea
              id="alert-description"
              required
              rows={5}
              maxLength={2000}
              placeholder={t("submit.descriptionPlaceholder")}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-image">{t("submit.photo")}</label>
            {form.photo ? (
              <div className="submit-alert-photo">
                <img src={form.photo} alt={t("submit.photoAlt")} />
                <div className="submit-alert-photo-bar">
                  <span className="submit-alert-photo-name">{form.photoName}</span>
                  <button type="button" className="submit-alert-photo-remove" onClick={clearImage}>
                    {t("submit.remove")}
                  </button>
                </div>
              </div>
            ) : (
              <label className="submit-alert-upload" htmlFor="alert-image">
                <span className="submit-alert-upload-icon" aria-hidden="true">⬆</span>
                <span className="submit-alert-upload-title">{t("submit.upload")}</span>
                <span className="submit-alert-upload-hint">{t("submit.uploadHint")}</span>
                <input
                  ref={fileInputRef}
                  id="alert-image"
                  className="submit-alert-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </section>

        <div className="submit-alert-actions">
          <p className="submit-alert-note">
            <span className="submit-alert-req">*</span> {t("submit.required")}
          </p>
          <div className="submit-alert-buttons">
            <button type="button" className="submit-alert-cancel" onClick={() => navigate(SUBMIT_ALERT_PATH)}>
              {t("submit.cancel")}
            </button>
            <button type="submit" className="submit-alert-primary">
              {t("submit.send")}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

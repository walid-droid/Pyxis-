import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import { useI18n } from "../../i18n";
import { createReport, saveReport } from "../../lib/reports";
import type { ReportSeverity, ReportType } from "../../mockdata/report";
import "./SubmitAlertPage.css";

const SEVERITIES = [
  { value: "low", labelKey: "severity.low" },
  { value: "medium", labelKey: "severity.medium" },
  { value: "high", labelKey: "severity.high" },
  { value: "critical", labelKey: "severity.critical" },
] as const;

export default function SubmitAlertPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [form, setForm] = useState({
    title: "",
    type: "",
    wilaya: "",
    commune: "",
    location: "",
    latitude: "",
    longitude: "",
    description: "",
    severity: "medium",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [locating, setLocating] = useState(false);

  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImagePreview(url);
    setImageName(file.name);
  }

  function clearImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagePreview(null);
    setImageName("");
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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const latitude = form.latitude.trim() === "" ? undefined : Number(form.latitude);
    const longitude = form.longitude.trim() === "" ? undefined : Number(form.longitude);

    const report = createReport({
      title: form.title.trim(),
      description: form.description.trim(),
      type: (form.type || "other") as ReportType,
      severity: form.severity as ReportSeverity,
      wilaya: form.wilaya.trim(),
      commune: form.commune.trim(),
      place: form.location.trim() || undefined,
      latitude: Number.isFinite(latitude) ? latitude : undefined,
      longitude: Number.isFinite(longitude) ? longitude : undefined,
    });

    saveReport(report);
    // Le suivi du signalement se poursuit dans l'espace « Mes signalements ».
    navigate("/my-reports", { state: { submitted: report.id } });
  }

  return (
    <main className="submit-alert-page">
      <header className="submit-alert-hero">
        <div className="submit-alert-hero-text">
          <span className="submit-alert-badge">
            <i className="submit-alert-badge-dot" /> {t("submit.badge")}
          </span>
          <p className="submit-alert-eyebrow">{t("submit.eyebrow")}</p>
          <h1>{t("submit.title")}</h1>
          <p className="submit-alert-lead">{t("submit.lead")}</p>
        </div>

        <span className="submit-alert-hero-icon" aria-hidden="true">!</span>
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
              onChange={(e) => update("title", e.target.value)}
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
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="">{t("submit.typePlaceholder")}</option>
                <option value="flood">{t("submit.type.flood")}</option>
                <option value="fire">{t("submit.type.fire")}</option>
                <option value="earthquake">{t("submit.type.earthquake")}</option>
                <option value="accident">{t("submit.type.accident")}</option>
                <option value="storm">{t("submit.type.storm")}</option>
                <option value="landslide">{t("submit.type.landslide")}</option>
                <option value="other">{t("submit.type.other")}</option>
              </select>
            </div>

            <div className="submit-alert-field submit-alert-severity-field">
              <span className="submit-alert-legend">
                {t("submit.severity")} <span className="submit-alert-req">*</span>
              </span>
              <div className="submit-alert-severity">
                {SEVERITIES.map((option) => (
                  <label
                    key={option.value}
                    className={`severity-chip severity-chip--${option.value}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={option.value}
                      required
                      checked={form.severity === option.value}
                      onChange={() => update("severity", option.value)}
                    />
                    <span>{t(option.labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
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
              <input
                id="alert-wilaya"
                required
                placeholder={t("submit.wilayaPlaceholder")}
                value={form.wilaya}
                onChange={(e) => update("wilaya", e.target.value)}
              />
            </div>

            <div className="submit-alert-field">
              <label htmlFor="alert-commune">
                {t("submit.commune")} <span className="submit-alert-req">*</span>
              </label>
              <input
                id="alert-commune"
                required
                placeholder={t("submit.communePlaceholder")}
                value={form.commune}
                onChange={(e) => update("commune", e.target.value)}
              />
            </div>
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-location">{t("submit.location")}</label>
            <input
              id="alert-location"
              placeholder={t("submit.locationPlaceholder")}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="submit-alert-position">
            <div className="submit-alert-position-head">
              <div>
                <p className="submit-alert-sublabel">{t("submit.gps")}</p>
                <p className="submit-alert-sublabel-hint">
                  {t("submit.gpsHint")}
                </p>
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
                  onChange={(e) => update("latitude", e.target.value)}
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
                  onChange={(e) => update("longitude", e.target.value)}
                />
              </div>
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
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-image">{t("submit.photo")}</label>

            {imagePreview ? (
              <div className="submit-alert-photo">
                <img src={imagePreview} alt={t("submit.photoAlt")} />
                <div className="submit-alert-photo-bar">
                  <span className="submit-alert-photo-name">{imageName}</span>
                  <button
                    type="button"
                    className="submit-alert-photo-remove"
                    onClick={clearImage}
                  >
                    {t("submit.remove")}
                  </button>
                </div>
              </div>
            ) : (
              <label className="submit-alert-upload" htmlFor="alert-image">
                <span className="submit-alert-upload-icon" aria-hidden="true">⬆</span>
                <span className="submit-alert-upload-title">
                  {t("submit.upload")}
                </span>
                <span className="submit-alert-upload-hint">
                  {t("submit.uploadHint")}
                </span>
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
            <button
              type="button"
              className="submit-alert-cancel"
              onClick={() => navigate("/alerts")}
            >
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

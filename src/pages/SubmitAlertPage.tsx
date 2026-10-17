import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import "./SubmitAlertPage.css";

const SEVERITIES = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Élevée" },
  { value: "critical", label: "Critique" },
] as const;

export default function SubmitAlertPage() {
  const navigate = useNavigate();

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
      window.alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
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
        window.alert("Impossible d'obtenir votre position. Saisissez-la manuellement.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Connect this to your backend API to save the alert.
    console.log("Alerte soumise :", {
      ...form,
      image: imageName || null,
    });
    alert("Formulaire validé. Connectez le backend pour enregistrer l'alerte.");
  }

  return (
    <main className="submit-alert-page">
      <header className="submit-alert-hero">
        <div className="submit-alert-hero-text">
          <span className="submit-alert-badge">
            <i className="submit-alert-badge-dot" /> Signalement citoyen
          </span>
          <p className="submit-alert-eyebrow">SAFEDZ · SIGNALEMENT CITOYEN</p>
          <h1>Créer une alerte</h1>
          <p className="submit-alert-lead">
            Décrivez la situation. Votre signalement sera vérifié par nos
            équipes avant toute diffusion.
          </p>
        </div>

        <span className="submit-alert-hero-icon" aria-hidden="true">!</span>
      </header>

      <form className="submit-alert-form" onSubmit={handleSubmit}>
        <section className="submit-alert-section">
          <div className="submit-alert-section-head">
            <span className="submit-alert-step">01</span>
            <div className="submit-alert-section-title">
              <h2>Informations sur l'alerte</h2>
              <p>Donnez un titre clair et précisez la nature de l'urgence.</p>
            </div>
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-title">
              Titre de l'alerte <span className="submit-alert-req">*</span>
            </label>
            <input
              id="alert-title"
              required
              maxLength={120}
              placeholder="ex. Inondation dans un quartier résidentiel"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="submit-alert-grid">
            <div className="submit-alert-field">
              <label htmlFor="alert-type">
                Type d'incident <span className="submit-alert-req">*</span>
              </label>
              <select
                id="alert-type"
                required
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="">Sélectionnez le type d'incident</option>
                <option value="flood">Inondation</option>
                <option value="fire">Incendie</option>
                <option value="earthquake">Séisme</option>
                <option value="accident">Accident</option>
                <option value="storm">Tempête</option>
                <option value="landslide">Glissement de terrain</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="submit-alert-field submit-alert-severity-field">
              <span className="submit-alert-legend">
                Gravité <span className="submit-alert-req">*</span>
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
                    <span>{option.label}</span>
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
              <h2>Localisation</h2>
              <p>Indiquez où se situe l'incident le plus précisément possible.</p>
            </div>
          </div>

          <div className="submit-alert-grid">
            <div className="submit-alert-field">
              <label htmlFor="alert-wilaya">
                Wilaya <span className="submit-alert-req">*</span>
              </label>
              <input
                id="alert-wilaya"
                required
                placeholder="ex. Béjaïa"
                value={form.wilaya}
                onChange={(e) => update("wilaya", e.target.value)}
              />
            </div>

            <div className="submit-alert-field">
              <label htmlFor="alert-commune">
                Commune <span className="submit-alert-req">*</span>
              </label>
              <input
                id="alert-commune"
                required
                placeholder="Nom de la commune"
                value={form.commune}
                onChange={(e) => update("commune", e.target.value)}
              />
            </div>
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-location">Localisation exacte</label>
            <input
              id="alert-location"
              placeholder="Rue, quartier ou point de repère"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="submit-alert-position">
            <div className="submit-alert-position-head">
              <div>
                <p className="submit-alert-sublabel">Position (coordonnées GPS)</p>
                <p className="submit-alert-sublabel-hint">
                  Facultatif — aide les secours à vous localiser.
                </p>
              </div>
              <button
                type="button"
                className="submit-alert-locate"
                onClick={useMyLocation}
                disabled={locating}
              >
                <span aria-hidden="true">◎</span>
                {locating ? "Localisation…" : "Utiliser ma position"}
              </button>
            </div>

            <div className="submit-alert-grid">
              <div className="submit-alert-field">
                <label htmlFor="alert-latitude">Latitude</label>
                <input
                  id="alert-latitude"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="ex. 36.7538"
                  value={form.latitude}
                  onChange={(e) => update("latitude", e.target.value)}
                />
              </div>

              <div className="submit-alert-field">
                <label htmlFor="alert-longitude">Longitude</label>
                <input
                  id="alert-longitude"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="ex. 3.0588"
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
              <h2>Détails de l'incident</h2>
              <p>Décrivez la situation et ajoutez une photo si possible.</p>
            </div>
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-description">
              Description <span className="submit-alert-req">*</span>
            </label>
            <textarea
              id="alert-description"
              required
              rows={5}
              maxLength={2000}
              placeholder="Décrivez l'incident, son impact et tout danger immédiat..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="submit-alert-field">
            <label htmlFor="alert-image">Photo de l'incident</label>

            {imagePreview ? (
              <div className="submit-alert-photo">
                <img src={imagePreview} alt="Incident sélectionné" />
                <div className="submit-alert-photo-bar">
                  <span className="submit-alert-photo-name">{imageName}</span>
                  <button
                    type="button"
                    className="submit-alert-photo-remove"
                    onClick={clearImage}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <label className="submit-alert-upload" htmlFor="alert-image">
                <span className="submit-alert-upload-icon" aria-hidden="true">⬆</span>
                <span className="submit-alert-upload-title">
                  Cliquez pour ajouter une photo
                </span>
                <span className="submit-alert-upload-hint">
                  PNG, JPG ou WEBP · max 5 Mo
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
            <span className="submit-alert-req">*</span> Champs obligatoires
          </p>

          <div className="submit-alert-buttons">
            <button
              type="button"
              className="submit-alert-cancel"
              onClick={() => navigate("/alerts")}
            >
              Annuler
            </button>
            <button type="submit" className="submit-alert-primary">
              Soumettre l'alerte →
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

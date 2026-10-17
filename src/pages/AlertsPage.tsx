import { useState } from "react";
import { useNavigate } from "react-router";
import WarningCard from "../components/WarningCard";
import { mockWarnings, type Severity } from "../mockdata/warning";
import "./AlertsPage.css";

const SEVERITY_FR: Record<Severity, string> = {
  Low: "Faible",
  Medium: "Moyenne",
  High: "Élevée",
  Critical: "Critique",
};

const SEVERITY_ORDER: Severity[] = ["Low", "Medium", "High", "Critical"];

const VERIFICATION_ORDER = ["verified", "unverified"] as const;

const VERIFICATION_FR: Record<(typeof VERIFICATION_ORDER)[number], string> = {
  verified: "Vérifiées",
  unverified: "Non vérifiées",
};

function AlertsPage() {
  const navigate = useNavigate();
  const [verification, setVerification] = useState<"all" | "verified" | "unverified">("all");
  const [severity, setSeverity] = useState<"all" | Severity>("all");

  const filteredWarnings = mockWarnings.filter(
    (warning) =>
      (verification === "all" || warning.verification === verification) &&
      (severity === "all" || warning.severity === severity),
  );

  return (
    <main className="alerts-page">
      <header className="alerts-hero">
        <div className="alerts-hero-text">
          <p className="alerts-hero-eyebrow">Veille &amp; sécurité</p>
          <h1>Alertes</h1>
          <p className="alerts-hero-lead">Surveillez et gérez les urgences signalées.</p>
        </div>

        <div className="alerts-hero-aside">
          <button
            type="button"
            className="alerts-hero-cta"
            onClick={() => navigate("/submit-alert")}
          >
            + Créer une alerte
          </button>
        </div>
      </header>

      <div className="alerts-layout">
        <aside className="alerts-filter" aria-label="Filtrer les alertes">
          <div className="alerts-filter-group">
            <p className="alerts-filter-title">État</p>
            <ul className="alerts-filter-list">
              <li>
                <button
                  type="button"
                  className={`alerts-filter-btn${verification === "all" ? " is-active" : ""}`}
                  onClick={() => setVerification("all")}
                >
                  Toutes les alertes
                  <span className="alerts-filter-count">{mockWarnings.length}</span>
                </button>
              </li>
              {VERIFICATION_ORDER.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    className={`alerts-filter-btn${verification === value ? " is-active" : ""}`}
                    onClick={() => setVerification(value)}
                  >
                    {VERIFICATION_FR[value]}
                    <span className="alerts-filter-count">
                      {mockWarnings.filter((warning) => warning.verification === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="alerts-filter-group">
            <p className="alerts-filter-title">Gravité</p>
            <ul className="alerts-filter-list">
              <li>
                <button
                  type="button"
                  className={`alerts-filter-btn${severity === "all" ? " is-active" : ""}`}
                  onClick={() => setSeverity("all")}
                >
                  Toutes les gravités
                  <span className="alerts-filter-count">{mockWarnings.length}</span>
                </button>
              </li>
              {SEVERITY_ORDER.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    className={`alerts-filter-btn${severity === value ? " is-active" : ""}`}
                    onClick={() => setSeverity(value)}
                  >
                    {SEVERITY_FR[value]}
                    <span className="alerts-filter-count">
                      {mockWarnings.filter((warning) => warning.severity === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="alerts-content">
          <p className="alerts-summary">
            {filteredWarnings.length} alerte{filteredWarnings.length > 1 ? "s" : ""}
          </p>

          {filteredWarnings.length > 0 ? (
            <div className="alerts-grid">
              {filteredWarnings.map((warning) => (
                <WarningCard key={warning.id} warning={warning} />
              ))}
            </div>
          ) : (
            <p className="alerts-empty">Aucune alerte ne correspond à ce filtre.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default AlertsPage;

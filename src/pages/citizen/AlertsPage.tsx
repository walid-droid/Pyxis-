import { useState } from "react";
import { useNavigate } from "react-router";
import WarningCard from "../../components/WarningCard";
import IncidentMapModal from "../../components/IncidentMapModal";
import type { MapItem } from "../../components/IncidentMapModal";
import { mockWarnings, type Severity, type Warning } from "../../mockdata/warning";
import { resolveCoords } from "../../mockdata/locations";
import { useI18n } from "../../i18n";
import "./AlertsPage.css";

const SEVERITY_ORDER: Severity[] = ["Low", "Medium", "High", "Critical"];

// Citizen view: only the alerts checked and confirmed by the teams are listed.
// Unverified reports stay out of this page to avoid spreading misinformation.
const verifiedWarnings = mockWarnings.filter(
  (warning) => warning.verification === "verified",
);

function AlertsPage() {
  const navigate = useNavigate();
  const { t, tc } = useI18n();
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapItem, setMapItem] = useState<MapItem | null>(null);

  const buildWarningItem = (warning: Warning): MapItem => ({
    id: `warning-${warning.id}`,
    title: tc(warning.title),
    meta: `${tc(warning.location)} · ${tc(warning.issuedAt)}`,
    tone: warning.verification,
    position: resolveCoords(warning.location),
    description: tc(warning.description),
    source: tc(warning.source),
    badges: [
      {
        label: t("alerts.mapBadge", {
          level: t(`severity.${warning.severity.toLowerCase()}`),
        }),
        className: `sev-${warning.severity.toLowerCase()}`,
      },
      {
        label:
          warning.verification === "verified"
            ? t("verification.verified")
            : t("verification.unverified"),
        className: warning.verification === "verified" ? "pill--ok" : "pill--warn",
      },
    ],
  });

  const filteredWarnings = verifiedWarnings.filter(
    (warning) => severity === "all" || warning.severity === severity,
  );

  const openWarning = (warning: Warning) => {
    setSelectedId(`warning-${warning.id}`);
    setMapItem(buildWarningItem(warning));
  };

  const closeMap = () => {
    setSelectedId(null);
    setMapItem(null);
  };

  return (
    <main className="alerts-page">
      <header className="alerts-hero">
        <div className="alerts-hero-text">
          <p className="alerts-hero-eyebrow">{t("alerts.eyebrow")}</p>
          <h1>{t("alerts.title")}</h1>
          <p className="alerts-hero-lead">{t("alerts.lead")}</p>
        </div>

        <div className="alerts-hero-aside">
          <button
            type="button"
            className="alerts-hero-cta"
            onClick={() => navigate("/submit-alert")}
          >
            {t("alerts.create")}
          </button>
        </div>
      </header>

      <div className="alerts-layout">
        <aside className="alerts-filter" aria-label={t("alerts.filterAria")}>
          <div className="alerts-filter-group">
            <p className="alerts-filter-title">{t("alerts.severity")}</p>
            <ul className="alerts-filter-list">
              <li>
                <button
                  type="button"
                  className={`alerts-filter-btn${severity === "all" ? " is-active" : ""}`}
                  onClick={() => setSeverity("all")}
                >
                  {t("alerts.allSeverities")}
                  <span className="alerts-filter-count">{verifiedWarnings.length}</span>
                </button>
              </li>
              {SEVERITY_ORDER.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    className={`alerts-filter-btn${severity === value ? " is-active" : ""}`}
                    onClick={() => setSeverity(value)}
                  >
                    {t(`severity.${value.toLowerCase()}`)}
                    <span className="alerts-filter-count">
                      {verifiedWarnings.filter((warning) => warning.severity === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="alerts-content">
          <p className="alerts-summary">
            {t(
              filteredWarnings.length > 1 ? "alerts.countPlural" : "alerts.count",
              { count: filteredWarnings.length },
            )}
          </p>

          {filteredWarnings.length > 0 ? (
            <div className="alerts-grid">
              {filteredWarnings.map((warning) => (
                <WarningCard
                  key={warning.id}
                  warning={warning}
                  active={selectedId === `warning-${warning.id}`}
                  onClick={() => openWarning(warning)}
                />
              ))}
            </div>
          ) : (
            <p className="alerts-empty">{t("alerts.empty")}</p>
          )}

          <p className="alerts-note">{t("alerts.note")}</p>
        </section>
      </div>

      {mapItem && <IncidentMapModal item={mapItem} onClose={closeMap} />}
    </main>
  );
}

export default AlertsPage;

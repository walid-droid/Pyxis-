import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
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

/** Recherche insensible aux accents : « bejaia » retrouve « Béjaïa ». */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

function AlertsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, tc } = useI18n();
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapItem, setMapItem] = useState<MapItem | null>(null);

  const query = (searchParams.get("q") ?? "").trim();
  const normalizedQuery = normalizeText(query);

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

  // La recherche de la landing arrive ici sous la forme /alerts?q=…
  const matchesQuery = (warning: Warning) => {
    if (!normalizedQuery) return true;
    return normalizeText(
      [
        warning.title,
        warning.location,
        warning.source,
        warning.description,
        tc(warning.title),
        tc(warning.location),
        tc(warning.source),
        tc(warning.description),
      ].join(" "),
    ).includes(normalizedQuery);
  };

  const searchWarnings = verifiedWarnings.filter(matchesQuery);
  const filteredWarnings = searchWarnings.filter(
    (warning) => severity === "all" || warning.severity === severity,
  );

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next, { replace: true });
  };

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
                  <span className="alerts-filter-count">{searchWarnings.length}</span>
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
                      {searchWarnings.filter((warning) => warning.severity === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="alerts-content">
          {query && (
            <div className="alerts-search">
              <span role="status">{t("alerts.searchNote", { query })}</span>
              <button type="button" className="alerts-search-clear" onClick={clearSearch}>
                {t("alerts.clearSearch")}
              </button>
            </div>
          )}

          <p className="alerts-summary">
            {t(
              filteredWarnings.length === 1 ? "alerts.count" : "alerts.countPlural",
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
            <div className="alerts-empty">
              <p>
                {query && severity === "all"
                  ? t("alerts.emptySearch", { query })
                  : t("alerts.empty")}
              </p>
              {query && (
                <button type="button" className="alerts-search-clear" onClick={clearSearch}>
                  {t("alerts.clearSearch")}
                </button>
              )}
            </div>
          )}

          <p className="alerts-note">{t("alerts.note")}</p>
        </section>
      </div>

      {mapItem && <IncidentMapModal item={mapItem} onClose={closeMap} />}
    </main>
  );
}

export default AlertsPage;

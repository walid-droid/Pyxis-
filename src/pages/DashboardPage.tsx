import "./DashboardPage.css";
import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import AlertRow from "../components/AlertRow";
import type { AlertRowTone } from "../components/AlertRow";
import IncidentMapModal from "../components/IncidentMapModal";
import type { MapItem } from "../components/IncidentMapModal";
import { mockWarnings } from "../mockdata/warning";
import type { Warning } from "../mockdata/warning";
import { mockCrisis } from "../mockdata/crisis";
import type { Crisis } from "../mockdata/crisis";
import { mockIncidents } from "../mockdata/incident";
import type { Incident } from "../mockdata/incident";
import { resolveCoords } from "../mockdata/locations";

const SEVERITY_FR: Record<string, string> = {
  Low: "Faible",
  Medium: "Moyenne",
  High: "Élevée",
  Critical: "Critique",
};

const INCIDENT_STATUS_FR: Record<string, string> = {
  Reported: "Signalé",
  Responding: "En intervention",
  Contained: "Maîtrisé",
  Resolved: "Résolu",
};

const CRISIS_STATUS_FR: Record<string, string> = {
  Active: "Active",
  Escalating: "En escalade",
  Stabilising: "En stabilisation",
  Recovery: "Rétablissement",
};

type SectionKey = "alerts" | "incidents" | "crisis";

const SECTION_TITLES: Record<SectionKey, string> = {
  alerts: "Alertes autour de moi",
  incidents: "Ce qui se passe",
  crisis: "Alerte majeure",
};

const SECTION_ICONS: Record<SectionKey, ReactNode> = {
  alerts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  incidents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  ),
  crisis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
};

/** Default display area while real geolocation is not wired up. */
const VIEW_ZONE = "Sétif";

const QUICK_LINKS: { key: string; label: string; to: string; icon: ReactNode }[] = [
  {
    key: "resources",
    label: "Abris & secours",
    to: "/resources",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9.5 9-7 9 7" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    ),
  },
  {
    key: "consignes",
    label: "Consignes de sécurité",
    to: "/consignes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "contacts",
    label: "Numéros d'urgence",
    to: "/contacts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
];

/** Keep the first screen light: at most this many rows before "Afficher les autres". */
const LIST_LIMIT = 5;

const SEVERITY_TONE: Record<Warning["severity"], AlertRowTone> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Critical: "critical",
};

const CRISIS_TONE: Record<Crisis["status"], AlertRowTone> = {
  Active: "active",
  Escalating: "escalating",
  Stabilising: "stabilising",
  Recovery: "recovery",
};

type ListRow = {
  key: string;
  tone: AlertRowTone;
  title: string;
  label: string;
  meta: string;
  ariaLabel: string;
  open: () => void;
};

function buildWarningItem(warning: Warning): MapItem {
  return {
    id: `warning-${warning.id}`,
    title: warning.title,
    meta: `${warning.location} · ${warning.issuedAt}`,
    tone: warning.verification,
    position: resolveCoords(warning.location),
    description: warning.description,
    source: warning.source,
    badges: [
      {
        label: `Gravité ${SEVERITY_FR[warning.severity]}`,
        className: `sev-${warning.severity.toLowerCase()}`,
      },
      {
        label: warning.verification === "verified" ? "Vérifiée" : "Non vérifiée",
        className: warning.verification === "verified" ? "pill--ok" : "pill--warn",
      },
    ],
  };
}

function buildIncidentItem(incident: Incident): MapItem {
  return {
    id: `incident-${incident.id}`,
    title: incident.event,
    meta: `${incident.location} · ${INCIDENT_STATUS_FR[incident.status]}`,
    tone: "incident",
    position: resolveCoords(incident.location),
    badges: [
      {
        label: `Gravité ${SEVERITY_FR[incident.severity]}`,
        className: `sev-${incident.severity.toLowerCase()}`,
      },
      {
        label: INCIDENT_STATUS_FR[incident.status],
        className: `st-${incident.status.toLowerCase()}`,
      },
    ],
  };
}

function buildCrisisItem(crisis: Crisis): MapItem {
  return {
    id: `crisis-${crisis.id}`,
    title: crisis.event,
    meta: crisis.location,
    tone: "crisis",
    position: resolveCoords(crisis.location),
    badges: [
      {
        label: CRISIS_STATUS_FR[crisis.status],
        className: `st-${crisis.status.toLowerCase()}`,
      },
    ],
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapItem, setMapItem] = useState<MapItem | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Citizens only see verified information: unverified reports stay out of this view.
  const alerts = mockWarnings.filter(
    (warning) => warning.verification === "verified",
  );
  // "Alerte majeure" only exists while a crisis is actually running.
  const activeCrises = mockCrisis.filter(
    (crisis) => crisis.status === "Active" || crisis.status === "Escalating",
  );

  const sections: {
    key: SectionKey;
    label: string;
    value: number;
    tone: string;
  }[] = [
    { key: "alerts", label: "Alertes autour de moi", value: alerts.length, tone: "alerts" },
    { key: "incidents", label: "Ce qui se passe", value: mockIncidents.length, tone: "incident" },
  ];

  if (activeCrises.length > 0) {
    sections.push({ key: "crisis", label: "Alerte majeure", value: activeCrises.length, tone: "crisis" });
  }

  const activeCount = sections.find((section) => section.key === activeSection)?.value;

  const openItem = (item: MapItem) => {
    setSelectedId(item.id);
    setMapItem(item);
  };

  const closeMap = () => {
    setSelectedId(null);
    setMapItem(null);
  };

  const rows: ListRow[] = (() => {
    if (activeSection === "alerts") {
      return alerts.map((warning) => ({
        key: `warning-${warning.id}`,
        tone: SEVERITY_TONE[warning.severity],
        title: warning.title,
        label: SEVERITY_FR[warning.severity],
        meta: `${warning.location} · ${warning.issuedAt}`,
        ariaLabel: `Alerte ${warning.title}. Gravité ${SEVERITY_FR[warning.severity]}. ${warning.location}, ${warning.issuedAt}`,
        open: () => openItem(buildWarningItem(warning)),
      }));
    }

    if (activeSection === "incidents") {
      return mockIncidents.map((incident) => ({
        key: `incident-${incident.id}`,
        tone: SEVERITY_TONE[incident.severity],
        title: incident.event,
        label: SEVERITY_FR[incident.severity],
        meta: `${incident.location} · ${INCIDENT_STATUS_FR[incident.status]}`,
        ariaLabel: `Incident ${incident.event}. Gravité ${SEVERITY_FR[incident.severity]}. ${incident.location}. ${INCIDENT_STATUS_FR[incident.status]}`,
        open: () => openItem(buildIncidentItem(incident)),
      }));
    }

    if (activeSection === "crisis") {
      return activeCrises.map((crisis) => ({
        key: `crisis-${crisis.id}`,
        tone: CRISIS_TONE[crisis.status],
        title: crisis.event,
        label: CRISIS_STATUS_FR[crisis.status],
        meta: crisis.location,
        ariaLabel: `Crise ${crisis.event}. ${CRISIS_STATUS_FR[crisis.status]}. ${crisis.location}`,
        open: () => openItem(buildCrisisItem(crisis)),
      }));
    }

    return [];
  })();

  const visibleRows = expanded ? rows : rows.slice(0, LIST_LIMIT);
  const hiddenCount = rows.length - LIST_LIMIT;

  return (
  <main className="page-container dashboard-page">

    <section className="alert cardSec">
      <div className="hero-text">
        <span className="live-badge">
          <i className="live-dot" /> Suivi en direct
        </span>
        <h2>Restez informé. Restez en sécurité.</h2>
      </div>

      <button
        className="btn-primary"
        onClick={() => navigate("/submit-alert")}
      >
        Créer une alerte
      </button>
    </section>

    <div className="dashboard-body">
      <aside className="dashboard-sidebar">
        <section className="dashboard-menu cardSec" aria-label="Ma sécurité">
          <header className="dashboard-menu__head">
            <h2 className="dashboard-menu__title">Ma sécurité</h2>
            <span className="dashboard-menu__live">Temps réel</span>
          </header>

          <p className="dashboard-menu__zone" title="Zone utilisée pour situer les alertes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Autour de moi
            <span className="dashboard-menu__zone-name">· {VIEW_ZONE}</span>
          </p>

          <div className="dashboard-menu__list">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`dashboard-menu__item ${section.tone}${activeSection === section.key ? " is-active" : ""}`}
                aria-pressed={activeSection === section.key}
                onClick={() => {
                  setActiveSection((prev) =>
                    prev === section.key ? null : section.key,
                  );
                  setExpanded(false);
                  closeMap();
                }}
              >
                <span className="dashboard-menu__icon" aria-hidden="true">
                  {SECTION_ICONS[section.key]}
                </span>
                <span className="dashboard-menu__label">{section.label}</span>
                <span className="dashboard-menu__count">{section.value}</span>
              </button>
            ))}
          </div>

          <nav className="dashboard-menu__quick" aria-label="Liens utiles">
            {QUICK_LINKS.map((link) => (
              <Link key={link.key} className="dashboard-menu__quick-item" to={link.to}>
                <span className="dashboard-menu__quick-icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span className="dashboard-menu__label">{link.label}</span>
                <span className="dashboard-menu__quick-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </section>
      </aside>

      <div className="dashboard-content">
        {activeSection ? (
          <section className="detail cardSec">
            <div className="detail__head">
              <h2>{SECTION_TITLES[activeSection]}</h2>
              <div className="detail__actions">
                <span className="detail__count">{activeCount}</span>
                <button
                  type="button"
                  className="detail__close"
                  aria-label="Masquer la liste"
                  title="Masquer la liste"
                  onClick={() => {
                    setActiveSection(null);
                    closeMap();
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <ul className="alert-list">
              {visibleRows.map((row) => (
                <AlertRow
                  key={row.key}
                  tone={row.tone}
                  title={row.title}
                  label={row.label}
                  meta={row.meta}
                  ariaLabel={row.ariaLabel}
                  selected={selectedId === row.key}
                  onClick={row.open}
                />
              ))}
            </ul>

            {hiddenCount > 0 && (
              <button
                type="button"
                className="alert-list__more"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded
                  ? "Réduire la liste"
                  : `Afficher les ${hiddenCount} autres`}
              </button>
            )}
          </section>
        ) : (
          <section className="detail detail--empty cardSec">
            <p>
              Sélectionnez une rubrique dans le menu pour afficher les
              informations.
            </p>
            <p className="detail--empty__call">
              En cas de danger immédiat, appelez le <a href="tel:14">14</a>.
            </p>
          </section>
        )}
      </div>
    </div>

    {mapItem && <IncidentMapModal item={mapItem} onClose={closeMap} />}
  </main>);
}

export default DashboardPage;

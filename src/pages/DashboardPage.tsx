import "./DashboardPage.css"
import { useState } from "react";
import { useNavigate } from "react-router";
import WarningCard from "../components/WarningCard";
import { mockWarnings } from "../mockdata/warning";
import CrisisMap from "../components/CrisisMap";
import { mockCrisis } from "../mockdata/crisis";
import { mockIncidents } from "../mockdata/incident";

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

type DetailKey = "verified" | "unverified" | "incidents" | "crisis";

const DETAIL_LABELS: Record<DetailKey, string> = {
  verified: "Alertes vérifiées",
  unverified: "Signalements non vérifiés",
  incidents: "Incidents en cours",
  crisis: "Crise en cours",
};

const DETAIL_ORDER: DetailKey[] = ["verified", "unverified", "incidents", "crisis"];

function DashboardPage() {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<DetailKey>("verified");

  const verifiedWarnings = mockWarnings.filter(
    (warning) => warning.verification === "verified",
  );
  const unverifiedWarnings = mockWarnings.filter(
    (warning) => warning.verification === "unverified",
  );

  const counts: Record<DetailKey, number> = {
    verified: verifiedWarnings.length,
    unverified: unverifiedWarnings.length,
    incidents: mockIncidents.length,
    crisis: mockCrisis.length,
  };

  return (
  <main className="page-container dashboard-page">

    <section className="alert cardSec">
      <div className="hero-text">
        <span className="live-badge">
          <i className="live-dot" /> Suivi en direct
        </span>

        <h2>Restez informé. Restez en sécurité.</h2>
        <p>
          Recevez des alertes vérifiées et signalez les incidents près de chez
          vous, pour que les secours arrivent plus vite.
        </p>

        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/submit-alert")}
          >
            Créer une alerte
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigate("/alerts")}
          >
            Voir les alertes actives
          </button>
        </div>
      </div>
    </section>

    <section className="details">
      <aside className="dashboard-filter" aria-label="Filtrer les détails">
        <ul className="dashboard-filter-list">
          {DETAIL_ORDER.map((key) => (
            <li key={key}>
              <button
                type="button"
                className={`dashboard-filter-btn${detail === key ? " is-active" : ""}`}
                onClick={() => setDetail(key)}
              >
                <span>{DETAIL_LABELS[key]}</span>
                <span className="dashboard-filter-count">{counts[key]}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="dashboard-detail">
        {(detail === "verified" || detail === "unverified") && (
          <div className="dashboard-warning-grid">
            {(detail === "verified" ? verifiedWarnings : unverifiedWarnings).map(
              (warning) => (
                <WarningCard key={warning.id} warning={warning} />
              ),
            )}
          </div>
        )}

        {detail === "incidents" && (
          <table>
            <thead>
              <tr>
                <th>Événement</th>
                <th>Gravité</th>
                <th>Lieu</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {mockIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.event}</td>
                  <td>
                    <span className={`pill sev-${incident.severity.toLowerCase()}`}>
                      {SEVERITY_FR[incident.severity]}
                    </span>
                  </td>
                  <td>{incident.location}</td>
                  <td>
                    <span className={`pill st-${incident.status.toLowerCase()}`}>
                      {INCIDENT_STATUS_FR[incident.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {detail === "crisis" && (
          <table>
            <thead>
              <tr>
                <th>Événement</th>
                <th>Lieu</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {mockCrisis.map((crisis) => (
                <tr key={crisis.id}>
                  <td>{crisis.event}</td>
                  <td>{crisis.location}</td>
                  <td>
                    <span className={`pill st-${crisis.status.toLowerCase()}`}>
                      {CRISIS_STATUS_FR[crisis.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>

    <section className="map cardSec">
      <h2>Carte</h2>
      <CrisisMap/>
    </section>
  </main>);
}

export default DashboardPage;

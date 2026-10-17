import "./DashboardPage.css"
import { useState } from "react";
import { useNavigate } from "react-router";
import WarningCard from "../components/WarningCard";
import Modal from "../components/Modal";
import StatCard from "../components/StatCard";
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

type ModalKey = "verified" | "unverified" | "incidents" | "crisis";

const MODAL_TITLES: Record<ModalKey, string> = {
  verified: "Alertes vérifiées",
  unverified: "Signalements non vérifiés",
  incidents: "Incidents en cours",
  crisis: "Crise en cours",
};

function DashboardPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);

  const verifiedWarnings = mockWarnings.filter(
    (warning) => warning.verification === "verified",
  );
  const unverifiedWarnings = mockWarnings.filter(
    (warning) => warning.verification === "unverified",
  );

  const counters: {
    key: ModalKey;
    label: string;
    value: number;
    tone: string;
  }[] = [
    { key: "verified", label: "Alertes vérifiées", value: verifiedWarnings.length, tone: "verified" },
    { key: "unverified", label: "Signalements non vérifiés", value: unverifiedWarnings.length, tone: "unverified" },
    { key: "incidents", label: "Incidents en cours", value: mockIncidents.length, tone: "incident" },
    { key: "crisis", label: "Crise en cours", value: mockCrisis.length, tone: "crisis" },
  ];

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

    <section className="stats stat-grid">
      {counters.map((counter) => (
        <StatCard
          key={counter.key}
          value={counter.value}
          label={counter.label}
          tone={counter.tone}
          onClick={() => setActiveModal(counter.key)}
        />
      ))}
    </section>

    <section className="map cardSec">
      <h2>Carte</h2>
      <CrisisMap/>
    </section>

    {activeModal && (
      <Modal
        title={MODAL_TITLES[activeModal]}
        onClose={() => setActiveModal(null)}
      >
        {(activeModal === "verified" || activeModal === "unverified") && (
          <div className="modal-warning-grid">
            {(activeModal === "verified" ? verifiedWarnings : unverifiedWarnings).map(
              (warning) => (
                <WarningCard key={warning.id} warning={warning} />
              ),
            )}
          </div>
        )}

        {activeModal === "incidents" && (
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

        {activeModal === "crisis" && (
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
      </Modal>
    )}
  </main>);
}

export default DashboardPage;

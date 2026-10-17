import { useState } from "react";
import { useNavigate } from "react-router";
import WarningCard from "../components/WarningCard";
import Modal from "../components/Modal";
import StatCard from "../components/StatCard";
import { mockWarnings } from "../mockdata/warning";
import "./AlertsPage.css";

type ModalKey = "total" | "verified" | "unverified" | "high";

const MODAL_TITLES: Record<ModalKey, string> = {
  total: "Toutes les alertes",
  verified: "Alertes vérifiées",
  unverified: "Signalements non vérifiés",
  high: "Alertes à gravité élevée",
};

function AlertsPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);

  const verified = mockWarnings.filter((w) => w.verification === "verified");
  const unverified = mockWarnings.filter((w) => w.verification === "unverified");
  const highSeverity = mockWarnings.filter(
    (w) => w.severity === "High" || w.severity === "Critical",
  );

  const counters = [
    { key: "total", label: "Total des alertes", value: mockWarnings.length, tone: "total" },
    { key: "verified", label: "Vérifiées", value: verified.length, tone: "verified" },
    { key: "unverified", label: "Non vérifiées", value: unverified.length, tone: "unverified" },
    { key: "high", label: "Gravité élevée", value: highSeverity.length, tone: "high" },
  ] as const;

  const currentList =
    activeModal === "verified"
      ? verified
      : activeModal === "unverified"
        ? unverified
        : activeModal === "high"
          ? highSeverity
          : mockWarnings;

  return (
    <main className="alerts-page">
      <header className="page-header">
        <div>
          <h1>Alertes</h1>
          <p>Surveillez et gérez les urgences signalées.</p>
        </div>

        <button type="button" onClick={() => navigate("/submit-alert")}>
          + Créer une alerte
        </button>
      </header>

      <section className="stat-grid">
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

      {activeModal && (
        <Modal title={MODAL_TITLES[activeModal]} onClose={() => setActiveModal(null)}>
          <div className="modal-warning-grid">
            {currentList.map((warning) => (
              <WarningCard key={warning.id} warning={warning} />
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}

export default AlertsPage;

import { useState } from "react";
import { Link } from "react-router";
import Modal from "../components/Modal";
import { mockConsignes, type Consigne } from "../mockdata/consigne";
import "./ConsignesPage.css";

function ConsignesPage() {
  const [selected, setSelected] = useState<Consigne | null>(null);

  return (
    <main className="consignes-page">
      <header className="consignes-hero">
        <div className="consignes-hero-text">
          <p className="consignes-hero-eyebrow">Consignes de sécurité</p>
          <h1>Les bons réflexes face aux situations d'urgence.</h1>
          <p className="consignes-hero-lead">
            Sélectionnez une situation pour découvrir les étapes à suivre, pas à pas.
          </p>
        </div>

        <div className="consignes-hero-aside">
          <p className="consignes-hero-alert">
            <span className="consignes-hero-alert-dot" aria-hidden="true" />
            En cas de danger immédiat, appelez d'abord les secours
          </p>

          <Link className="consignes-hero-link" to="/contacts">
            Voir tous les numéros
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <section className="consignes-grid">
        {mockConsignes.map((consigne) => (
          <button
            key={consigne.id}
            type="button"
            className={`consigne-card cardSec consigne-card--${consigne.variant}`}
            onClick={() => setSelected(consigne)}
          >
            <span className="consigne-card__title">{consigne.risk}</span>
            <span className="consigne-intro">{consigne.intro}</span>
            <span className="consigne-card__meta">
              {consigne.steps.length} étapes · Voir les consignes
              <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </section>

      {selected && (
        <Modal
          title={selected.risk}
          onClose={() => setSelected(null)}
          className={`consigne-modal consigne-modal--${selected.variant}`}
        >
          <p className="consigne-modal-intro">{selected.intro}</p>

          <ol className="consigne-steps">
            {selected.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </Modal>
      )}
    </main>
  );
}

export default ConsignesPage;

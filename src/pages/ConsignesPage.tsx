import { useState } from "react";
import { Link } from "react-router";
import Modal from "../components/Modal";
import { mockConsignes, type Consigne } from "../mockdata/consigne";
import "./ConsignesPage.css";

function ConsignesPage() {
  const [selected, setSelected] = useState<Consigne | null>(null);

  return (
    <main className="consignes-page">
      <header className="page-header">
        <div>
          <h1>Consignes de sécurité</h1>
          <p>Les bons réflexes à adopter face aux principales situations d'urgence.</p>
        </div>
      </header>

      <aside className="consignes-callout cardSec">
        <div>
          <strong>En cas de danger immédiat, appelez d'abord les secours.</strong>
          <p>Protection civile : 14 · 1021</p>
        </div>
        <Link className="consignes-callout-link" to="/contacts">
          Voir tous les numéros →
        </Link>
      </aside>

      <section className="consignes-grid">
        {mockConsignes.map((consigne) => (
          <button
            key={consigne.id}
            type="button"
            className="consigne-card cardSec"
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
        <Modal title={selected.risk} onClose={() => setSelected(null)}>
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

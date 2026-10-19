import { useState } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import { mockConsignes, type Consigne } from "../../mockdata/consigne";
import { useI18n } from "../../i18n";
import "./ConsignesPage.css";

function ConsignesPage() {
  const { t, tc } = useI18n();
  const [selected, setSelected] = useState<Consigne | null>(null);

  return (
    <main className="consignes-page">
      <header className="consignes-hero">
        <div className="consignes-hero-text">
          <p className="consignes-hero-eyebrow">{t("consignes.eyebrow")}</p>
          <h1>{t("consignes.title")}</h1>
          <p className="consignes-hero-lead">{t("consignes.lead")}</p>
        </div>

        <div className="consignes-hero-aside">
          <p className="consignes-hero-alert">
            <span className="consignes-hero-alert-dot" aria-hidden="true" />
            {t("consignes.emergency")}
          </p>

          <Link className="consignes-hero-link" to="/contacts">
            {t("consignes.allNumbers")}
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
            <span className="consigne-card__title">{tc(consigne.risk)}</span>
            <span className="consigne-intro">{tc(consigne.intro)}</span>
            <span className="consigne-card__meta">
              {t("consignes.steps", { count: consigne.steps.length })}
              <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </section>

      {selected && (
        <Modal
          title={tc(selected.risk)}
          onClose={() => setSelected(null)}
          className={`consigne-modal consigne-modal--${selected.variant}`}
        >
          <p className="consigne-modal-intro">{tc(selected.intro)}</p>

          <ol className="consigne-steps">
            {selected.steps.map((step, index) => (
              <li key={index}>{tc(step)}</li>
            ))}
          </ol>
        </Modal>
      )}
    </main>
  );
}

export default ConsignesPage;

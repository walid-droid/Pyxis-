import { useState } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useDb } from "../../services/useDb";
import type { TypeCatastrophe } from "../../data/types";
import "./ConsignesPage.css";

const VARIANT_BY_CODE: Record<string, string> = {
  C1: "seismic",
  C2: "flood",
  C3: "storm",
  C4: "fire",
  C5: "gas",
  C6: "heat",
  C7: "road",
  C8: "heat",
  C9: "flood",
  C10: "road",
};

function ConsigneCard({
  type,
  onSelect,
}: {
  type: TypeCatastrophe;
  onSelect: (type: TypeCatastrophe) => void;
}) {
  const { lang, t } = useI18n();
  const variant = VARIANT_BY_CODE[type.code] ?? "road";

  return (
    <button
      type="button"
      className={`consigne-card consigne-card--${variant}`}
      onClick={() => onSelect(type)}
    >
      <span className="consigne-card__title">{type.libelle[lang]}</span>
      <span className="consigne-intro">{type.consignes[lang]}</span>
      <span className="consigne-card__meta">
        {t("consignes.view")}
        <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}

function ConsignesPage() {
  const { lang, t } = useI18n();
  const db = useDb();
  const [selected, setSelected] = useState<TypeCatastrophe | null>(null);

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
        {db.reference.types.map((type) => (
          <ConsigneCard key={type.code} type={type} onSelect={setSelected} />
        ))}
      </section>

      {selected ? (
        <Modal
          title={selected.libelle[lang]}
          onClose={() => setSelected(null)}
          className={`consigne-modal consigne-modal--${VARIANT_BY_CODE[selected.code] ?? "road"}`}
        >
          <p className="consigne-modal-intro">{selected.consignes[lang]}</p>
        </Modal>
      ) : null}
    </main>
  );
}

export default ConsignesPage;

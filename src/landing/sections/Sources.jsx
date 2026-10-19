import { Fragment, useRef, useState } from "react";
import { useRafScroll } from "../hooks";
import { clamp } from "../utils";

const QUOTE = "Les décisions concernant les alertes et les interventions restent du ressort des services compétents.";
const WORDS = QUOTE.split(" ");

// Les mots s'allument au fil du scroll.
function Quote() {
  const ref = useRef(null);
  const [on, setOn] = useState(0);

  useRafScroll(() => {
    if (!ref.current) return;
    const qr = ref.current.getBoundingClientRect();
    const qp = clamp((window.innerHeight * 0.85 - qr.top) / (window.innerHeight * 0.5), 0, 1);
    setOn(Math.min(WORDS.length, Math.ceil(qp * WORDS.length)));
  });

  return (
    <p className="quote" id="q" ref={ref}>
      {WORDS.map((w, i) => (
        <Fragment key={i}>
          <span className={i < on ? "on" : undefined}>{w}</span>
          {i < WORDS.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}

export default function Sources() {
  return (
    <section className="src">
      <div className="wrap">
        <p className="eyebrow rv">Sources et responsabilité</p>
        <h2 className="rv">Des informations claires, des décisions humaines</h2>
        <div className="cols">
          <div className="rv">
            <span className="big">01</span>
            <h3>Pourquoi CADM ?</h3>
            <p>
              L'Algérie est exposée à plusieurs risques naturels et technologiques. CADM facilite l'accès aux informations sur les risques et vise à améliorer la transmission des signalements entre les citoyens et les services concernés.
            </p>
          </div>
          <div className="rv" style={{ "--d": ".1s" }}>
            <span className="big">02</span>
            <h3>Le cadre réglementaire</h3>
            <p>
              CADM est conçu en tenant compte de la réglementation algérienne relative à la prévention des risques de catastrophes et à la protection des données personnelles.
            </p>
          </div>
          <div className="rv" style={{ "--d": ".2s" }}>
            <span className="big">03</span>
            <h3>Le rôle de l'intelligence artificielle</h3>
            <p>
              L'intelligence artificielle peut aider à analyser les signalements et à repérer les informations qui nécessitent une attention particulière.
            </p>
            <p>Les informations importantes doivent être vérifiées par les personnes habilitées.</p>
          </div>
        </div>
        <Quote />
      </div>
    </section>
  );
}

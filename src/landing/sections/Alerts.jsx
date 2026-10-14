import { useEffect, useRef, useState } from "react";
import { noop } from "../utils";

const STEPS = [
  {
    title: "Niveau de vigilance",
    text: "La couleur permet d'identifier rapidement le niveau de vigilance.",
    levels: true,
  },
  { title: "Source de l'alerte", text: "L'autorité à l'origine de l'alerte est clairement indiquée." },
  { title: "Zone et durée", text: "Vous savez où l'alerte s'applique et jusqu'à quand elle est valable." },
  { title: "Les consignes", text: "Les actions à suivre sont présentées simplement, par ordre de priorité." },
  {
    title: "Où aller",
    text: "Lorsque c'est nécessaire, les abris et les itinéraires sont accessibles depuis la carte.",
  },
];

export default function Alerts({ reducedMotion }) {
  const [step, setStep] = useState(reducedMotion ? STEPS.length : 0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (reducedMotion) {
      setStep(STEPS.length);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStep(+e.target.dataset.s);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reducedMotion]);

  // Les éléments de la carte apparaissent un par un ; le titre est visible dès le début.
  const pt = (n) => "pt" + (n <= Math.max(step, 1) ? " on" : "");

  return (
    <section className="alert" id="alerte">
      <div className="wrap">
        <p className="eyebrow rv">Comprendre les alertes</p>
        <h2 className="rv">Une alerte, des informations claires</h2>
        <p className="allp rv">
          Chaque alerte présente les mêmes informations essentielles pour vous permettre de comprendre rapidement la situation et de savoir quoi faire.
        </p>
        <div className="agrid">
          <div className="acard">
            <div className="card" id="card">
              <div className={pt(1)}>
                <span className="tag">Niveau orange</span>
                <span className="tm">Exemple fictif · démonstration</span>
              </div>
              <h3 className={pt(1)}>Alerte orange : risque d'incendie de forêt</h3>
              <p className={"by " + pt(2)}>
                Émise par : <b style={{ fontWeight: 500, color: "var(--ink)" }}>Cellule de crise de la wilaya (exemple)</b>
              </p>
              <div className={"two " + pt(3)}>
                <div>
                  <small>Zone concernée</small>
                  <b>Secteur forestier d'exemple</b>
                </div>
                <div>
                  <small>Valable jusqu'au</small>
                  <b>14 août, 20 h (exemple)</b>
                </div>
              </div>
              <ol className={pt(4)}>
                <li>Évitez les zones boisées concernées par l'alerte.</li>
                <li>N'allumez pas de feu en plein air.</li>
                <li>Si vous apercevez un départ de feu, éloignez-vous et alertez les secours.</li>
                <li>En cas d'ordre d'évacuation, suivez les indications des autorités.</li>
              </ol>
              <a className={"lk " + pt(5)} href="#" onClick={noop}>
                Voir les abris ouverts et l'itinéraire d'évacuation
              </a>
            </div>
            <p className="cap">Exemple fictif présenté à titre d'illustration, sans valeur opérationnelle.</p>
          </div>
          <div className="exp" id="exp">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => (stepRefs.current[i] = el)}
                data-s={i + 1}
                className={reducedMotion || step === i + 1 ? "on" : undefined}
              >
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {s.levels && (
                  <>
                    <div className="lvl">
                      <i style={{ background: "var(--yellow)" }} />
                      <i style={{ background: "var(--amber)" }} />
                      <i style={{ background: "var(--red)" }} />
                    </div>
                    <div className="lvlt">
                      <span>Jaune</span>
                      <span>Orange</span>
                      <span>Rouge</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

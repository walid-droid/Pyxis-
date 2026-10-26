import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useLandingCopy } from "../landingCopy";

export default function Alerts({ reducedMotion }) {
  const copy = useLandingCopy();
  const alerts = copy.alerts;
  const STEPS = alerts.steps;
  const card = alerts.card;
  const [step, setStep] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (reducedMotion) return;
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
  }, [alerts, reducedMotion]);

  // Les éléments de la carte apparaissent un par un ; le titre est visible dès le début.
  const shownStep = reducedMotion ? STEPS.length : step;
  const pt = (n) => "pt" + (n <= Math.max(shownStep, 1) ? " on" : "");

  return (
    <section className="alert" id="alerte">
      <div className="wrap">
        <p className="eyebrow rv">{alerts.eyebrow}</p>
        <h2 className="rv">{alerts.title}</h2>
        <p className="allp rv">{alerts.lead}</p>
        <div className="agrid">
          <div className="acard">
            <div className="card" id="card">
              <div className={pt(1)}>
                <span className="tag">{card.tag}</span>
                <span className="tm">{card.fictional}</span>
              </div>
              <h3 className={pt(1)}>{card.title}</h3>
              <p className={"by " + pt(2)}>
                {card.byLabel}{" "}
                <b style={{ fontWeight: 500, color: "var(--ink)" }}>{card.byValue}</b>
              </p>
              <div className={"two " + pt(3)}>
                <div>
                  <small>{card.zoneLabel}</small>
                  <b>{card.zoneValue}</b>
                </div>
                <div>
                  <small>{card.validLabel}</small>
                  <b>{card.validValue}</b>
                </div>
              </div>
              <ol className={pt(4)}>
                {card.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
              <Link className={"lk " + pt(5)} to="/resources">
                {card.link}
              </Link>
            </div>
            <p className="cap">{card.caption}</p>
          </div>
          <div className="exp" id="exp">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => (stepRefs.current[i] = el)}
                data-s={i + 1}
                className={reducedMotion || shownStep === i + 1 ? "on" : undefined}
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
                      {alerts.levels.map((level) => (
                        <span key={level}>{level}</span>
                      ))}
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

import { useRef, useState } from "react";
import { useRafScroll } from "../hooks";
import { clamp, noop } from "../utils";

const STEPS = [
  ["Reçu", "Votre signalement a été enregistré."],
  ["En cours de vérification", "Les informations sont en cours d'examen."],
  ["Équipe mobilisée", "Une équipe a été envoyée sur les lieux."],
  ["Intervention en cours", "Les équipes interviennent sur place."],
  ["Clôturé", "Le traitement du signalement est terminé."],
];

export default function Tracking() {
  const tlRef = useRef(null);
  const fillRef = useRef(null);
  const stepRefs = useRef([]);
  const [state, setState] = useState({ done: [true, true, false, false, false], cur: 2 });

  // La frise se remplit au fil du scroll (horizontale sur desktop, verticale sur mobile).
  useRafScroll(() => {
    const tl = tlRef.current;
    const tf = fillRef.current;
    const sts = stepRefs.current;
    if (!tl || !tf || sts.length < STEPS.length) return;

    const vh = window.innerHeight;
    const r = tl.getBoundingClientRect();
    const vert = window.innerWidth <= 900;
    const p = clamp((0.75 * vh - r.top) / (vert ? r.height : 0.4 * vh), 0, 1);
    const P = sts.map((e) => (vert ? e.offsetTop : e.offsetLeft));
    const len = p * P[STEPS.length - 1];

    tl.style.setProperty("--rail", P[STEPS.length - 1] + 15 + "px");
    if (vert) {
      tf.style.height = len + "px";
      tf.style.width = "";
    } else {
      tf.style.width = len + "px";
      tf.style.height = "";
    }

    let last = -1;
    const done = sts.map((_, i) => {
      const d = i === 0 ? p > 0 : len >= P[i] - 0.5;
      if (d) last = i;
      return d;
    });
    const cur = p < 1 ? last : -1;

    setState((prev) =>
      prev.cur === cur && prev.done.every((d, i) => d === done[i]) ? prev : { done, cur }
    );
  });

  return (
    <section className="track" id="suivi">
      <div className="wrap">
        <p className="eyebrow rv">Suivi des signalements</p>
        <h2 className="rv">Que devient votre signalement ?</h2>
        <p className="allp rv">
          Chaque signalement peut être suivi depuis son enregistrement jusqu'à sa clôture. Consultez les étapes de son traitement pour savoir où en est votre demande.
        </p>
        <div className="tl" id="tl" ref={tlRef}>
          <div className="fill" id="tf" ref={fillRef} />
          {STEPS.map(([title, text], i) => (
            <div
              key={title}
              ref={(el) => (stepRefs.current[i] = el)}
              className={"st" + (state.done[i] ? " done" : "") + (state.cur === i ? " cur" : "")}
              style={{ "--k": i }}
            >
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="btns">
          <a className="btn" href="#" onClick={noop}>Signaler un incident</a>
          <a className="btn out" href="#" onClick={noop}>Suivre mon signalement</a>
        </div>
      </div>
    </section>
  );
}

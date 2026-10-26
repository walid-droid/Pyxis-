import { useRef, useState } from "react";
import { Link } from "react-router";
import { useRafScroll } from "../hooks";
import { clamp } from "../utils";
import { useLandingCopy } from "../landingCopy";

export default function Tracking({ onRequestSubmit, onOpenTracking }) {
  const copy = useLandingCopy();
  const tracking = copy.tracking;
  const STEPS = tracking.steps;
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
    const rtl = document.documentElement.dir === "rtl";
    const p = clamp((0.75 * vh - r.top) / (vert ? r.height : 0.4 * vh), 0, 1);
    const P = sts.map((e) =>
      vert ? e.offsetTop : rtl ? tl.clientWidth - (e.offsetLeft + e.offsetWidth) : e.offsetLeft
    );
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
        <p className="eyebrow rv">{tracking.eyebrow}</p>
        <h2 className="rv">{tracking.title}</h2>
        <p className="allp rv">{tracking.lead}</p>
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
          <Link className="btn" to="/submit-alert" onClick={onRequestSubmit}>
            {tracking.report}
          </Link>
          <button className="btn out" type="button" onClick={onOpenTracking}>
            {tracking.follow}
          </button>
        </div>
      </div>
    </section>
  );
}

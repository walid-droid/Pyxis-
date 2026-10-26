import { Fragment, useRef, useState } from "react";
import { useRafScroll } from "../hooks";
import { clamp } from "../utils";
import { useLandingCopy } from "../landingCopy";

// Les mots s'allument au fil du scroll.
function Quote({ text }) {
  const ref = useRef(null);
  const [on, setOn] = useState(0);
  const words = text.split(" ");

  useRafScroll(() => {
    if (!ref.current) return;
    const qr = ref.current.getBoundingClientRect();
    const qp = clamp((window.innerHeight * 0.85 - qr.top) / (window.innerHeight * 0.5), 0, 1);
    setOn(Math.min(words.length, Math.ceil(qp * words.length)));
  });

  return (
    <p className="quote" id="q" ref={ref}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className={i < on ? "on" : undefined}>{w}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}

export default function Sources() {
  const copy = useLandingCopy();
  const sources = copy.sources;

  return (
    <section className="src" id="sources">
      <div className="wrap">
        <p className="eyebrow rv">{sources.eyebrow}</p>
        <h2 className="rv">{sources.title}</h2>
        <div className="cols">
          {sources.columns.map((column, index) => (
            <div key={column.number} className="rv" style={{ "--d": `${index * 0.1}s` }}>
              <span className="big">{column.number}</span>
              <h3>{column.title}</h3>
              {column.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
        <Quote text={sources.quote} />
      </div>
    </section>
  );
}

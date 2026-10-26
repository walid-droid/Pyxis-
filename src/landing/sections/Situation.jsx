import { useRef, useState } from "react";
import { Link } from "react-router";
import { useLandingCopy } from "../landingCopy";

export default function Situation({ onRequestSubmit, onOpenTracking }) {
  const copy = useLandingCopy();
  const situation = copy.situation;
  const TABS = situation.tabs;
  const PANELS = situation.panels;
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);

  const onKeyDown = (e, i) => {
    const rtl = document.documentElement.dir === "rtl";
    const n =
      e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    if (!n) return;
    e.preventDefault();
    const j = (i + n + TABS.length) % TABS.length;
    tabRefs.current[j]?.focus();
    setActive(j);
  };

  return (
    <section className="sit" id="sit">
      <div className="wrap">
        <div className="head">
          <p className="eyebrow rv">{situation.eyebrow}</p>
          <h2 className="rv">{situation.title}</h2>
          <p className="rv">{situation.lead}</p>
        </div>
        <div
          className="tabs rv"
          data-a={active}
          role="tablist"
          aria-label={situation.tablistLabel}
        >
          {TABS.map((label, i) => (
            <button
              key={label}
              ref={(el) => (tabRefs.current[i] = el)}
              role="tab"
              id={`t${i}`}
              type="button"
              aria-selected={active === i}
              aria-controls={`p${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <small>{`0${i + 1}`}</small>
              {label}
            </button>
          ))}
          <i className="ind" />
        </div>
        {PANELS.map((p, i) => (
          <div
            key={p.title}
            className={"tp" + (active === i ? " on" : "")}
            role="tabpanel"
            id={`p${i}`}
            aria-labelledby={`t${i}`}
            hidden={active !== i}
          >
            <div className="tl2">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
            <ul>
              {p.items.map((item, k) => (
                <li key={item.label} style={{ "--k": k }}>
                  {item.tracking ? (
                    <a
                      href="#suivi"
                      onClick={(event) => {
                        event.preventDefault();
                        onOpenTracking();
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} onClick={item.auth ? onRequestSubmit : undefined}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

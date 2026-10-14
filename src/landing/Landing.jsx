import { useEffect, useLayoutEffect, useRef } from "react";
// Le CSS est injecté seulement tant que la landing est affichée,
// pour que ses règles globales (body, header, h1…) ne touchent pas le dashboard.
import css from "./landing.css?inline";
import { useReducedMotion, useReveal, useRafScroll } from "./hooks";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Situation from "./sections/Situation";
import Risks from "./sections/Risks";
import Alerts from "./sections/Alerts";
import Tracking from "./sections/Tracking";
import Pro from "./sections/Pro";
import Sources from "./sections/Sources";
import Footer from "./sections/Footer";

const TITLE = "SafeDZ — L'information fiable, quand elle compte vraiment";

function ScrollProgress() {
  const ref = useRef(null);
  useRafScroll(() => {
    const m = document.documentElement.scrollHeight - window.innerHeight;
    if (ref.current) ref.current.style.width = (m > 0 ? (window.scrollY / m) * 100 : 0) + "%";
  });
  return <div id="pb" ref={ref} />;
}

export default function Landing() {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-safedz-landing", "");
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  useReveal(rootRef);

  return (
    <div ref={rootRef}>
      <a className="skip" href="#top">Aller au contenu</a>
      <div id="ld" aria-hidden="true">
        <svg viewBox="0 0 28 28">
          <path d="M14 2 26 14 14 26 2 14Z" />
          <path d="M5.5 5.5h17v17h-17Z" />
          <circle cx="14" cy="14" r="2.6" />
        </svg>
      </div>
      <ScrollProgress />
      <Header />
      <main id="top" tabIndex={-1}>
        <Hero reducedMotion={reducedMotion} />
        <Situation />
        <Risks />
        <Alerts reducedMotion={reducedMotion} />
        <Tracking />
        <Pro />
        <Sources />
      </main>
      <Footer />
      <a className="call" href="tel:14">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
        Appeler le 14
      </a>
    </div>
  );
}

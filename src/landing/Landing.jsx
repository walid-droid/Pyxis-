import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
// Le CSS est injecté seulement tant que la landing est affichée,
// pour que ses règles globales (body, header, h1…) ne touchent pas le dashboard.
import css from "./landing.css?inline";
import { useReducedMotion, useReveal, useRafScroll } from "./hooks";
import logo from "../assets/Logo CADM.png";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Situation from "./sections/Situation";
import Risks from "./sections/Risks";
import Alerts from "./sections/Alerts";
import Tracking from "./sections/Tracking";
import Sources from "./sections/Sources";
import Footer from "./sections/Footer";
import RequireAuthModal from "./sections/RequireAuthModal";
import { isAuthenticated } from "../lib/session";

const TITLE = "CADM — L'information fiable, quand elle compte vraiment";

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
  const [requireAuth, setRequireAuth] = useState(false);

  const requestSubmit = useCallback((event) => {
    // Le signalement est réservé aux membres connectés.
    if (isAuthenticated()) return;
    event.preventDefault();
    setRequireAuth(true);
  }, []);

  const closeRequireAuth = useCallback(() => setRequireAuth(false), []);

  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-cadm-landing", "");
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
        <img src={logo} alt="" />
      </div>
      <ScrollProgress />
      <Header onRequestSubmit={requestSubmit} />
      <main id="top" tabIndex={-1}>
        <Hero reducedMotion={reducedMotion} onRequestSubmit={requestSubmit} />
        <Situation />
        <Risks />
        <Alerts reducedMotion={reducedMotion} />
        <Tracking onRequestSubmit={requestSubmit} />
        <Sources />
      </main>
      <Footer />
      {requireAuth && <RequireAuthModal onClose={closeRequireAuth} />}
      <a className="call" href="tel:14">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
        Appeler le 14
      </a>
    </div>
  );
}

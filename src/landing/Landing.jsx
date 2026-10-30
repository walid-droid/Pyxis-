import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
// Le CSS est injecté seulement tant que la landing est affichée,
// pour que ses règles globales (body, header, h1…) ne touchent pas le dashboard.
import css from "./landing.css?inline";
import { useReducedMotion, useReveal, useRafScroll } from "./hooks";
import logo from "../assets/Logo CADM.png";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Situation from "./sections/Situation";
import Alerts from "./sections/Alerts";
import Tracking from "./sections/Tracking";
import Footer from "./sections/Footer";
import RequireAuthModal from "./sections/RequireAuthModal";
import TrackingModal from "./sections/TrackingModal";
import PrivacyModal from "./sections/PrivacyModal";
import { isAuthenticated } from "../lib/session";
import { useLandingCopy } from "./landingCopy";

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
  const copy = useLandingCopy();
  const [requireAuth, setRequireAuth] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const requestSubmit = useCallback((event) => {
    // Le signalement est réservé aux membres connectés.
    if (isAuthenticated()) return;
    event.preventDefault();
    setRequireAuth(true);
  }, []);

  const closeRequireAuth = useCallback(() => setRequireAuth(false), []);
  const openTracking = useCallback(() => setTrackingOpen(true), []);
  const closeTracking = useCallback(() => setTrackingOpen(false), []);
  const openPrivacy = useCallback(() => setPrivacyOpen(true), []);
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);

  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-cadm-landing", "");
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = copy.title;
    return () => {
      document.title = previous;
    };
  }, [copy.title]);

  useReveal(rootRef);

  return (
    <div ref={rootRef}>
      <a className="skip" href="#top">{copy.skip}</a>
      <div id="ld" aria-hidden="true">
        <img src={logo} alt="" />
      </div>
      <ScrollProgress />
      <Header onRequestSubmit={requestSubmit} />
      <main id="top" tabIndex={-1}>
        <Hero reducedMotion={reducedMotion} onRequestSubmit={requestSubmit} />
        <Situation onRequestSubmit={requestSubmit} onOpenTracking={openTracking} />
        <Alerts reducedMotion={reducedMotion} />
        <Tracking onRequestSubmit={requestSubmit} onOpenTracking={openTracking} />
      </main>
      <Footer onRequestSubmit={requestSubmit} onOpenPrivacy={openPrivacy} />
      {requireAuth && <RequireAuthModal onClose={closeRequireAuth} />}
      {trackingOpen && <TrackingModal onClose={closeTracking} />}
      {privacyOpen && <PrivacyModal onClose={closePrivacy} />}
      <a className="call" href="tel:14">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
        {copy.call}
      </a>
    </div>
  );
}

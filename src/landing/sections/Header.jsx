import { useState } from "react";
import { Link } from "react-router";
import { DASHBOARD_PATH } from "../../config";
import { useRafScroll } from "../hooks";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  useRafScroll(() => setScrolled(window.scrollY > 60));

  return (
    <header id="hd" className={scrolled ? "s" : undefined}>
      <div className="wrap">
        <a className="logo" href="#top" aria-label="SafeDZ, accueil">
          <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2 26 14 14 26 2 14Z" />
            <path d="M5.5 5.5h17v17h-17Z" />
            <circle cx="14" cy="14" r="2.6" fill="#D92D20" stroke="none" />
          </svg>
          SafeDZ
        </a>
        <nav aria-label="Principal">
          <a href="#risques">Carte des risques</a>
          <a href="#alerte">Alertes en cours</a>
          <a href="#risques">Consignes</a>
          <a href="#pro">Aider</a>
        </nav>
        <div className="hr">
          <Link className="tx" to={DASHBOARD_PATH}>Se connecter</Link>
          <a className="btn red" href="#signalement">Signaler un incident</a>
        </div>
      </div>
    </header>
  );
}

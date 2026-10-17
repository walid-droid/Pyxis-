import { useState } from "react";
import { Link } from "react-router";
import { LOGIN_PATH } from "../../config";
import { useRafScroll } from "../hooks";
import logo from "../../assets/Logo SafeDZ.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  useRafScroll(() => setScrolled(window.scrollY > 60));

  return (
    <header id="hd" className={scrolled ? "s" : undefined}>
      <div className="wrap">
        <a className="logo" href="#top" aria-label="SafeDZ, accueil">
          <img src={logo} alt="" />
          <span>SafeDZ</span>
        </a>
        <nav aria-label="Principal">
          <a href="#risques">Carte des risques</a>
          <a href="#alerte">Alertes en cours</a>
          <a href="#risques">Consignes</a>
          <a href="#pro">Aider</a>
        </nav>
        <div className="hr">
          <Link className="tx" to={LOGIN_PATH}>Se connecter</Link>
          <a className="btn red" href="#signalement">Signaler un incident</a>
        </div>
      </div>
    </header>
  );
}

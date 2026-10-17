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
          <Link to="/consignes">Consignes</Link>
        </nav>
        <div className="hr">
          <Link className="tx" to={LOGIN_PATH}>Se connecter</Link>
          <Link className="btn red" to="/submit-alert">Signaler un incident</Link>
        </div>
      </div>
    </header>
  );
}

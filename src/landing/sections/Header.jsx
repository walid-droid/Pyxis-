import { useState } from "react";
import { Link } from "react-router";
import { DASHBOARD_PATH, LOGIN_PATH } from "../../config";
import { useRafScroll } from "../hooks";
import { isAuthenticated } from "../../lib/session";
import logo from "../../assets/Logo SafeDZ.png";

export default function Header({ onRequestSubmit }) {
  const [scrolled, setScrolled] = useState(false);
  useRafScroll(() => setScrolled(window.scrollY > 60));

  const connected = isAuthenticated();

  return (
    <header id="hd" className={scrolled ? "s" : undefined}>
      <div className="wrap">
        <a className="logo" href="#top" aria-label="SafeDZ, accueil">
          <img src={logo} alt="" />
          <span>SafeDZ</span>
        </a>
        <div className="hr">
          {connected ? (
            <Link className="tx" to={DASHBOARD_PATH}>Mon espace</Link>
          ) : (
            <Link className="tx" to={LOGIN_PATH}>Se connecter</Link>
          )}
          <Link className="btn red" to="/submit-alert" onClick={onRequestSubmit}>
            Signaler un incident
          </Link>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { LOGIN_PATH } from "../../config";
import { useRafScroll } from "../hooks";
import logo from "../../assets/Logo CADM.png";

export default function Header({ onRequestSubmit }) {
  const [scrolled, setScrolled] = useState(false);
  useRafScroll(() => setScrolled(window.scrollY > 60));

  return (
    <header id="hd" className={scrolled ? "s" : undefined}>
      <div className="wrap">
        <a className="logo" href="#top" aria-label="CADM, accueil">
          <img src={logo} alt="" />
          <span>CADM</span>
        </a>
        <div className="hr">
          <Link className="tx" to={LOGIN_PATH}>
            Se connecter
          </Link>
          <Link className="btn red" to="/submit-alert" onClick={onRequestSubmit}>
            Signaler un incident
          </Link>
        </div>
      </div>
    </header>
  );
}

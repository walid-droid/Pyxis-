import { useState } from "react";
import { Link } from "react-router";
import { LOGIN_PATH } from "../../config";
import { useRafScroll } from "../hooks";
import { useLandingCopy } from "../landingCopy";
import logo from "../../assets/Logo CADM.png";
import LanguageMenu from "./LanguageMenu";

export default function Header({ onRequestSubmit }) {
  const [scrolled, setScrolled] = useState(false);
  const copy = useLandingCopy();
  useRafScroll(() => setScrolled(window.scrollY > 60));

  return (
    <header id="hd" className={scrolled ? "s" : undefined}>
      <div className="wrap">
        <a className="logo" href="#top" aria-label={copy.header.home}>
          <img src={logo} alt="" />
          <span>CADM</span>
        </a>
        <div className="hr">
          <LanguageMenu />
          <Link className="tx" to={LOGIN_PATH}>
            {copy.header.login}
          </Link>
          <Link className="btn red" to="/submit-alert" onClick={onRequestSubmit}>
            {copy.header.report}
          </Link>
        </div>
      </div>
    </header>
  );
}

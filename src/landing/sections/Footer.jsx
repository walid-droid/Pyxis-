import { Link } from "react-router";
import { LOGIN_PATH, REGISTER_PATH, RESP_LOGIN_PATH } from "../../config";
import { useLandingCopy } from "../landingCopy";
import logo from "../../assets/Logo CADM.png";

export default function Footer({ onRequestSubmit, onOpenPrivacy }) {
  const copy = useLandingCopy();
  const footer = copy.footer;
  const sources = copy.sources;

  return (
    <footer className="dark" id="sources">
      <div className="wrap">
        <div className="fsrc">
          <p className="eyebrow">{sources.eyebrow}</p>
          <h2>{sources.title}</h2>
          <p>{sources.summary}</p>
        </div>
        <div className="top">
          <div>
            <div className="logo" style={{ marginBottom: 28 }}>
              <img src={logo} alt="CADM" />
            </div>
            <h2>{footer.tagline}</h2>
          </div>
          <div>
            <h4>{footer.emergencyTitle}</h4>
            <a className="n" href="tel:14">
              <small>{footer.civil}</small>
              <span className="num">14 · 1021</span>
            </a>
            <a className="n" href="tel:1055">
              <small>{footer.gendarmerie}</small>
              <span className="num">1055</span>
            </a>
          </div>
          <div className="fl">
            <div>
              <h4>{footer.citizens}</h4>
              <Link to="/alerts">{footer.riskMap}</Link>
              <Link to="/consignes">{footer.consignes}</Link>
              <Link to="/submit-alert" onClick={onRequestSubmit}>
                {footer.report}
              </Link>
            </div>
            <div>
              <h4>{footer.account}</h4>
              <Link to={LOGIN_PATH}>{footer.login}</Link>
              <Link to={REGISTER_PATH}>{footer.register}</Link>
              <Link to={RESP_LOGIN_PATH}>{footer.resp}</Link>
            </div>
            <div>
              <h4>{footer.info}</h4>
              <a href="#sources">{footer.about}</a>
              <a href="#sources">{footer.sources}</a>
              <button type="button" onClick={onOpenPrivacy}>
                {footer.privacy}
              </button>
            </div>
          </div>
        </div>
        <p className="copy">{footer.copy}</p>
      </div>
    </footer>
  );
}

import { Link } from "react-router";
import { LOGIN_PATH, REGISTER_PATH, RESP_LOGIN_PATH } from "../../config";
import { noop } from "../utils";
import logo from "../../assets/Logo CADM.png";

export default function Footer() {
  return (
    <footer className="dark">
      <div className="wrap">
        <div className="top">
          <div>
            <div className="logo" style={{ marginBottom: 28 }}>
              <img src={logo} alt="CADM" />
            </div>
            <h2>L'information fiable, quand elle compte vraiment.</h2>
          </div>
          <div>
            <h4>En cas de danger immédiat</h4>
            <a className="n" href="tel:14">
              <small>Protection civile</small>
              <span className="num">14 · 1021</span>
            </a>
            <a className="n" href="tel:1055">
              <small>Gendarmerie nationale</small>
              <span className="num">1055</span>
            </a>
          </div>
          <div className="fl">
            <div>
              <h4>Citoyens</h4>
              <a href="#risques">Carte des risques</a>
              <a href="#risques">Consignes</a>
              <a href="#suivi">Signaler un incident</a>
            </div>
            <div>
              <h4>Compte</h4>
              <Link to={LOGIN_PATH}>Se connecter</Link>
              <Link to={REGISTER_PATH}>Créer un compte</Link>
              <Link to={RESP_LOGIN_PATH}>Espace responsable</Link>
            </div>
            <div>
              <h4>Informations</h4>
              <a href="#" onClick={noop}>À propos</a>
              <a href="#" onClick={noop}>Sources</a>
              <a href="#" onClick={noop}>Confidentialité</a>
            </div>
          </div>
        </div>
        <p className="copy">© 2026 CADM · Pensé pour les citoyens en Algérie</p>
      </div>
    </footer>
  );
}

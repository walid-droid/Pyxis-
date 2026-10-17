import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import logo from "../assets/Logo SafeDZ.png";
import { DASHBOARD_PATH } from "../config";
import "./AuthPage.css";

type AuthMode = "login" | "register";

const COPY: Record<
  AuthMode,
  { title: string; subtitle: string; farTitle: string; farText: string; submit: string }
> = {
  login: {
    title: "Se connecter",
    subtitle: "Accédez à votre espace SafeDZ.",
    farTitle: "Bon retour.",
    farText:
      "Retrouvez votre tableau de bord, les alertes vérifiées et l'état des interventions en temps réel.",
    submit: "Se connecter",
  },
  register: {
    title: "Créer un compte",
    subtitle: "Quelques informations et c'est parti.",
    farTitle: "Rejoignez SafeDZ.",
    farText:
      "Créez votre compte pour signaler des incidents, suivre les alertes et recevoir des consignes de sécurité.",
    submit: "Créer mon compte",
  },
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";
  const copy = COPY[mode];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Connect this to your authentication backend.
    navigate(DASHBOARD_PATH);
  }

  return (
    <main className="auth-page">
      <aside className="auth-aside">
        <Link to="/" className="auth-brand" aria-label="SafeDZ, accueil">
          <img src={logo} alt="" />
          <span>SafeDZ</span>
        </Link>

        <div className="auth-aside-body">
          <h1>{copy.farTitle}</h1>
          <p>{copy.farText}</p>

          <ul className="auth-points">
            <li>Alertes vérifiées en temps réel</li>
            <li>Signalement d'incidents en un instant</li>
            <li>Coordination avec les services de secours</li>
          </ul>
        </div>

        <p className="auth-aside-foot">
          © 2026 SafeDZ · Plateforme intelligente de gestion des catastrophes
        </p>
      </aside>

      <section className="auth-main">
        <div className="auth-card">
          <header className="auth-card-head">
            <h2>{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="auth-name">Nom complet</label>
                <input
                  id="auth-name"
                  required
                  autoComplete="name"
                  placeholder="ex. Amine Bensalem"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Adresse e-mail</label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@exemple.dz"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Mot de passe</label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="auth-confirm">Confirmer le mot de passe</label>
                <input
                  id="auth-confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                />
              </div>
            )}

            {isLogin ? (
              <div className="auth-row">
                <label className="auth-check">
                  <input type="checkbox" defaultChecked />
                  <span>Se souvenir de moi</span>
                </label>
                <a className="auth-link" href="#mdp">
                  Mot de passe oublié ?
                </a>
              </div>
            ) : (
              <label className="auth-check">
                <input type="checkbox" required />
                <span>
                  J'accepte les <a className="auth-link" href="#cg">conditions</a> et la{" "}
                  <a className="auth-link" href="#conf">politique de confidentialité</a>.
                </span>
              </label>
            )}

            <button type="submit" className="auth-submit">
              {copy.submit}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? (
              <>
                Pas encore de compte ? <Link to="/register">Créer un compte</Link>
              </>
            ) : (
              <>
                Déjà un compte ? <Link to="/login">Se connecter</Link>
              </>
            )}
          </p>
        </div>

        <Link to="/" className="auth-back">
          ← Retour à l'accueil
        </Link>
      </section>
    </main>
  );
}

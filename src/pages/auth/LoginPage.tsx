import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { DASHBOARD_PATH, ADMIN_LOGIN_PATH, RESP_LOGIN_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { signIn } from "../../lib/session";
import AuthLayout from "./AuthLayout";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Connect this to your authentication backend.
    signIn(email);
    // Redirige vers la page demandée (ex. /submit-alert) si elle a été bloquée.
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from ?? DASHBOARD_PATH);
  }

  return (
    <AuthLayout
      farTitle={t("login.farTitle")}
      farText={t("login.farText")}
    >
      <header className="auth-card-head">
        <h2>{t("login.title")}</h2>
        <p>{t("login.lead")}</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">{t("login.email")}</label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("login.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">{t("login.password")}</label>
          <input
            id="login-password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="auth-row">
          <label className="auth-check">
            <input type="checkbox" defaultChecked />
            <span>{t("login.remember")}</span>
          </label>
          <a className="auth-link" href="#mdp">
            {t("login.forgot")}
          </a>
        </div>

        <button type="submit" className="auth-submit">
          {t("login.submit")}
        </button>
      </form>

      <p className="auth-switch">
        {t("login.switch")} <Link to="/register">{t("login.create")}</Link>
      </p>

      <p className="auth-switch auth-switch--resp">
        {t("login.respPrompt")}{" "}
        <Link to={RESP_LOGIN_PATH}>{t("login.respLink")}</Link>
      </p>

      <p className="auth-switch auth-switch--resp">
        {t("login.adminPrompt")}{" "}
        <Link to={ADMIN_LOGIN_PATH}>{t("login.adminLink")}</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;

import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { RESP_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { signInResp } from "../../lib/session";
import AuthLayout from "../auth/AuthLayout";

/** Connexion dédiée à l'espace responsable de crise (PC national). */
function RespLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leaving, setLeaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leaving) return;
    // Connect this to your authentication backend.
    signInResp(email);
    const from = (location.state as { from?: string } | null)?.from;
    setLeaving(true);
    window.setTimeout(() => navigate(from ?? RESP_DASHBOARD_PATH), 220);
  }

  return (
    <AuthLayout
      variant="crisis"
      leaving={leaving}
    >
      <header className="auth-card-head auth-card-head--resp">
        <span className="auth-kicker">{t("resp.login.kicker")}</span>
        <h1>{t("resp.login.title")}</h1>
        <p>{t("resp.login.lead")}</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="resp-email">{t("resp.login.email")}</label>
          <input
            id="resp-email"
            type="email"
            required
            autoComplete="username"
            placeholder={t("resp.login.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="resp-password">{t("resp.login.password")}</label>
          <input
            id="resp-password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="auth-row">
          <label className="auth-check">
            <input type="checkbox" defaultChecked />
            <span>{t("resp.login.remember")}</span>
          </label>
          <a className="auth-link" href="#mdp">
            {t("resp.login.forgot")}
          </a>
        </div>

        <button type="submit" className="auth-submit">
          {t("resp.login.submit")}
        </button>

        <p className="auth-notice">{t("resp.login.notice")}</p>
      </form>

      <p className="auth-switch">
        {t("resp.login.switch")}{" "}
        <Link to="/login">{t("resp.login.citizenLink")}</Link>
      </p>
    </AuthLayout>
  );
}

export default RespLoginPage;

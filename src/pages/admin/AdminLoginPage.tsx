import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ADMIN_DASHBOARD_PATH, LOGIN_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { signInAdmin } from "../../lib/session";
import AuthLayout from "../auth/AuthLayout";

/** Connexion dédiée à l'espace administrateur système (S1). */
function AdminLoginPage() {
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
    signInAdmin(email);
    const from = (location.state as { from?: string } | null)?.from;
    setLeaving(true);
    window.setTimeout(() => navigate(from ?? ADMIN_DASHBOARD_PATH), 220);
  }

  return (
    <AuthLayout
      variant="admin"
      leaving={leaving}
    >
      <header className="auth-card-head auth-card-head--resp">
        <span className="auth-kicker">{t("admin.login.kicker")}</span>
        <h1>{t("admin.login.title")}</h1>
        <p>{t("admin.login.lead")}</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="admin-email">{t("admin.login.email")}</label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            placeholder="prenom.nom@cadm.dz"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="admin-password">{t("admin.login.password")}</label>
          <input
            id="admin-password"
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
            <span>{t("admin.login.remember")}</span>
          </label>
          <a className="auth-link" href="#mdp">
            {t("admin.login.forgot")}
          </a>
        </div>

        <button type="submit" className="auth-submit">
          {t("admin.login.submit")}
        </button>

        <p className="auth-notice">{t("admin.login.notice")}</p>
      </form>

      <p className="auth-switch">
        {t("admin.login.switch")}{" "}
        <Link to={LOGIN_PATH}>{t("admin.login.citizenLink")}</Link>
      </p>
    </AuthLayout>
  );
}

export default AdminLoginPage;

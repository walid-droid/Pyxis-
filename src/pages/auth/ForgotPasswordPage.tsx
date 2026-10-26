import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { LOGIN_PATH } from "../../config";
import { useI18n } from "../../i18n";
import AuthLayout from "./AuthLayout";

/** Demande de réinitialisation du mot de passe (même habillage que la connexion). */
function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Connect this to your authentication backend.
    setSent(true);
  }

  return (
    <AuthLayout>
      <header className="auth-card-head">
        <h1>{t("forgot.title")}</h1>
        <p>{t("forgot.lead")}</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="forgot-email">{t("forgot.email")}</label>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("forgot.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {sent && (
          <p className="auth-notice auth-notice--success" role="status">
            {t("forgot.success")}
          </p>
        )}

        <button type="submit" className="auth-submit">
          {t("forgot.submit")}
        </button>
      </form>

      <p className="auth-switch">
        {t("forgot.remember")} <Link to={LOGIN_PATH}>{t("forgot.login")}</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { DASHBOARD_PATH } from "../config";
import { useI18n } from "../i18n";
import AuthLayout from "./AuthLayout";

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
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
    // Connect this to your registration backend.
    navigate(DASHBOARD_PATH);
  }

  return (
    <AuthLayout
      farTitle={t("register.farTitle")}
      farText={t("register.farText")}
    >
      <header className="auth-card-head">
        <h2>{t("register.title")}</h2>
        <p>{t("register.lead")}</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="register-name">{t("register.name")}</label>
          <input
            id="register-name"
            required
            autoComplete="name"
            placeholder={t("register.namePlaceholder")}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">{t("register.email")}</label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("register.emailPlaceholder")}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">{t("register.password")}</label>
          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-confirm">{t("register.confirm")}</label>
          <input
            id="register-confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
          />
        </div>

        <label className="auth-check">
          <input type="checkbox" required />
          <span>
            {t("register.terms1")}{" "}
            <a className="auth-link" href="#cg">{t("register.terms2")}</a>{" "}
            {t("register.terms3")}{" "}
            <a className="auth-link" href="#conf">{t("register.terms4")}</a>
            {t("register.terms5")}
          </span>
        </label>

        <button type="submit" className="auth-submit">
          {t("register.submit")}
        </button>
      </form>

      <p className="auth-switch">
        {t("register.switch")} <Link to="/login">{t("register.login")}</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;

import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AUTHORITY_DEMO_ACCOUNTS, type DemoAccount } from "../../auth/demoAccounts";
import { homeForRole } from "../../auth/roles";
import { DEMO_MODE } from "../../config";
import { useI18n } from "../../i18n";
import { signInResp } from "../../lib/session";
import { PERSONAS } from "../organisme/organismeData";
import { DEMO_ORGANISM, DEMO_COMMUNE } from "../../auth/demoAccounts";
import AuthLayout from "./AuthLayout";

/** Comptes de démonstration du personnel : autorités, puis organismes. */
function buildAccounts(): DemoAccount[] {
  const staff: DemoAccount[] = PERSONAS.map((persona) => ({
    id: persona.id,
    label: {
      fr: `${persona.role.fr} — ${persona.name.fr}`,
      ar: `${persona.role.ar} — ${persona.name.ar}`,
    },
    role: persona.accountRole,
    designations: persona.designations,
    organismId: DEMO_ORGANISM,
    territory: DEMO_COMMUNE,
  }));
  return [...AUTHORITY_DEMO_ACCOUNTS, ...staff];
}

/**
 * Connexion unique du personnel (autorités, organismes, exploitants).
 * Le rôle vient du compte : en démo, on choisit un compte de démonstration.
 */
function StaffLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useI18n();
  const accounts = useMemo(buildAccounts, []);
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leaving, setLeaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leaving) return;
    // Connect this to your authentication backend.
    const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
    signInResp(email, account);
    const from = (location.state as { from?: string } | null)?.from;
    setLeaving(true);
    window.setTimeout(() => navigate(from ?? homeForRole(account.role)), 220);
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
        {DEMO_MODE ? (
          <div className="auth-field">
            <label htmlFor="resp-account">
              {lang === "ar" ? "حساب تجريبي (الدور)" : "Compte de démonstration (rôle)"}
            </label>
            <select
              id="resp-account"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label[lang]}
                </option>
              ))}
            </select>
          </div>
        ) : null}

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

export default StaffLoginPage;

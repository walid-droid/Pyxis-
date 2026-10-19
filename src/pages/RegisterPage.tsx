import { useState, type ChangeEvent, type ClipboardEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { DASHBOARD_PATH } from "../config";
import { useI18n } from "../i18n";
import { signIn } from "../lib/session";
import AuthLayout from "./AuthLayout";

// Un numéro algérien fait 10 chiffres : 0 + 5/6/7 + 8 chiffres.
const MAX_PHONE_DIGITS = 10;
const ALGERIAN_PHONE = /^0[567]\d{8}$/;

// Convertit un numéro international collé (+213, 00213, 213 05…) en format local.
function toLocalDigits(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("213")) return "0" + digits.slice(3);
  if (digits.length === 13 && digits.startsWith("2130")) return "0" + digits.slice(4);
  if (digits.length === 14 && digits.startsWith("00213")) return "0" + digits.slice(5);
  return digits;
}

// Affichage par groupes : 0555 12 34 56 (10 chiffres au maximum).
function formatPhone(digits: string) {
  const d = digits.slice(0, MAX_PHONE_DIGITS);
  return [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean).join(" ");
}

// Position du curseur après regroupement : on saute les espaces insérés.
function countDigitsBefore(formatted: string, digits: number) {
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === digits) return i + 1;
    }
  }
  return formatted.length;
}

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    // Seuls les chiffres sont retenus, et le numéro est regroupé automatiquement.
    const input = e.target;
    const digitsBefore = input.value.slice(0, input.selectionStart ?? 0).replace(/\D/g, "").length;
    const formatted = formatPhone(input.value.replace(/\D/g, ""));
    setPhoneError(null);
    update("phone", formatted);

    // Le curseur est replacé sur le même chiffre, malgré les espaces ajoutés.
    const caret = countDigitsBefore(formatted, digitsBefore);
    requestAnimationFrame(() => {
      input.setSelectionRange(caret, caret);
    });
  }

  // Un numéro international collé est converti au format local avant l'affichage.
  function handlePhonePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;
    e.preventDefault();
    setPhoneError(null);
    update("phone", formatPhone(toLocalDigits(pasted)));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const digits = form.phone.replace(/\D/g, "");
    if (!ALGERIAN_PHONE.test(digits)) {
      setPhoneError(t("register.phoneInvalid"));
      return;
    }

    // Connect this to your registration backend.
    signIn(form.email, form.phone);
    // Redirige vers la page demandée (ex. /submit-alert) si elle a été bloquée.
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from ?? DASHBOARD_PATH);
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
          <label htmlFor="register-phone">{t("register.phone")}</label>
          <input
            id="register-phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            maxLength={13}
            placeholder={t("register.phonePlaceholder")}
            value={form.phone}
            onChange={handlePhoneChange}
            onPaste={handlePhonePaste}
            aria-describedby="register-phone-hint"
            aria-invalid={phoneError ? true : undefined}
          />
          {phoneError ? (
            <p className="auth-field-error" id="register-phone-hint" role="alert">
              {phoneError}
            </p>
          ) : (
            <p className="auth-field-hint" id="register-phone-hint">
              {t("register.phoneHint")}
            </p>
          )}
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

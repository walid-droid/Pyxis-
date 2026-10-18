import { useI18n } from "../i18n";

export default function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();
  const label = t("lang.switch");

  return (
    <button
      type="button"
      className="app-lang-toggle"
      aria-label={label}
      title={label}
      lang={lang === "fr" ? "ar" : "fr"}
      onClick={toggleLang}
    >
      {t("lang.code")}
    </button>
  );
}

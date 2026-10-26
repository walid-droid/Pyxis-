import { useState } from "react";
import { applyTheme, saveTheme, type Theme } from "../theme";
import { useI18n } from "../i18n";

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? t("theme.toDark") : t("theme.toLight");
  const shortLabel = next === "dark" ? t("theme.dark") : t("theme.light");

  function toggleTheme() {
    setTheme(next);
    applyTheme(next);
    saveTheme(next);
  }

  return (
    <button
      type="button"
      className="app-theme-toggle"
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      <span className="app-control-label">{shortLabel}</span>
    </button>
  );
}

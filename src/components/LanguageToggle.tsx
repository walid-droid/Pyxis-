import { useEffect, useRef, useState } from "react";
import { useI18n, type Lang } from "../i18n";

const LANGUAGES: { code: Lang; labelKey: string; short: string }[] = [
  { code: "fr", labelKey: "lang.fr", short: "FR" },
  { code: "ar", labelKey: "lang.ar", short: "AR" },
];

export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic extérieur ou avec Échap.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const chooseLanguage = (next: Lang) => {
    setLang(next);
    setOpen(false);
  };

  return (
    <div className={`app-lang${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="app-lang-toggle"
        aria-label={t("lang.choose")}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t("lang.choose")}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
        <span className="app-control-label">{t("lang.label")}</span>
      </button>

      <div className="app-lang-menu" role="listbox" aria-label={t("lang.choose")}>
        {LANGUAGES.map((item) => {
          const active = item.code === lang;
          return (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={active}
              className={`app-lang-option${active ? " is-active" : ""}`}
              onClick={() => chooseLanguage(item.code)}
            >
              <span>{t(item.labelKey)}</span>
              <small aria-hidden="true">{item.short}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

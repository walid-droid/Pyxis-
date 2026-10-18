import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CONTENT_AR } from "../i18n-content";
import {
  applyLanguage,
  getInitialLanguage,
  I18nContext,
  STORAGE_KEY,
  translate,
  type I18nContextValue,
  type Lang,
} from "./index";

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLanguage);

  useEffect(() => {
    applyLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures (private mode, etc.).
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const toggleLang = useCallback(() => {
    setLangState((current) => (current === "fr" ? "ar" : "fr"));
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars);
    const tc = (text: string) =>
      lang === "ar" ? CONTENT_AR[text] ?? text : text;

    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      toggleLang,
      t,
      tc,
    };
  }, [lang, setLang, toggleLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

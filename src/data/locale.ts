/** Texte bilingue FR/AR : toute donnée visible est stockée dans les deux langues. */
export type Localized = { fr: string; ar: string };

export type Lang = "fr" | "ar";

export function localized(value: Localized, lang: Lang): string {
  return value[lang];
}

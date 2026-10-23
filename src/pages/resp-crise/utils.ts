/** Normalises a mock value ("En route", "Critical"…) into a CSS/i18n suffix. */
export function tone(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Short "14:32" time used by the incident timeline. */
export function nowLabel(): string {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

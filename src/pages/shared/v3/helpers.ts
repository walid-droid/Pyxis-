import type { Lang } from "../../../i18n";
import type { Db, Gravity } from "../../../services/model";

export function typeLabel(db: Db, code: string, lang: Lang): string {
  return db.reference.types.find((type) => type.code === code)?.libelle[lang] ?? code;
}

export function territoryLabel(db: Db, id: string | undefined, lang: Lang): string {
  if (!id) return "—";
  return db.reference.territories.find((territory) => territory.id === id)?.nom[lang] ?? id;
}

export function moduleLabel(db: Db, id: string | undefined, lang: Lang): string {
  if (!id) return "—";
  return db.reference.modules.find((module) => module.id === id)?.nom[lang] ?? id;
}

export function userName(
  db: Db,
  id: string | undefined,
  lang: Lang,
): string {
  const user = id ? db.users.find((item) => item.id === id) : undefined;
  return user ? `${user.prenom[lang]} ${user.nom[lang]}` : (id ?? "—");
}

export function formatDateTime(iso: string | undefined, lang: Lang): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function gravityTone(gravity: Gravity | undefined): "red" | "amber" | "green" | "blue" {
  if (gravity === "critique") return "red";
  if (gravity === "elevee") return "amber";
  if (gravity === "moyenne") return "blue";
  return "green";
}

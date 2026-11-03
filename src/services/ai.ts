import type { TypeCode } from "../data/types";
import type { Gravity } from "./model";

type Rule = {
  typeId: TypeCode;
  keywords: string[];
  gravity: Gravity;
};

const RULES: Rule[] = [
  {
    typeId: "C1",
    gravity: "elevee",
    keywords: ["séisme", "seisme", "tremblement", "fissure", "زلزال", "هزة", "تشقق"],
  },
  {
    typeId: "C2",
    gravity: "elevee",
    keywords: ["inondation", "oued", "crue", "eau", "pluie", "فيضان", "وادي", "مياه", "أمطار"],
  },
  {
    typeId: "C3",
    gravity: "moyenne",
    keywords: ["neige", "vent", "tempête", "tempete", "canicule", "ثلج", "رياح", "عاصفة", "حرارة"],
  },
  {
    typeId: "C4",
    gravity: "elevee",
    keywords: ["feu", "incendie", "forêt", "foret", "fumée", "fumee", "حريق", "غابة", "دخان"],
  },
  {
    typeId: "C5",
    gravity: "critique",
    keywords: ["gaz", "industrie", "industriel", "chimique", "fuite", "غاز", "صناعة", "كيميائي", "تسرب"],
  },
  {
    typeId: "C6",
    gravity: "critique",
    keywords: ["radio", "nucléaire", "nucleaire", "radiation", "إشعاع", "نووي"],
  },
  {
    typeId: "C7",
    gravity: "elevee",
    keywords: ["santé", "sante", "épidémie", "epidemie", "maladie", "gastro", "صحة", "وباء", "مرض"],
  },
  {
    typeId: "C8",
    gravity: "moyenne",
    keywords: ["animal", "bétail", "betail", "végétal", "vegetal", "récolte", "recolte", "حيوان", "نبات", "محصول"],
  },
  {
    typeId: "C9",
    gravity: "elevee",
    keywords: ["pollution", "mer", "littoral", "atmosphère", "atmosphere", "تلوث", "بحر", "ساحل"],
  },
  {
    typeId: "C10",
    gravity: "moyenne",
    keywords: ["foule", "rassemblement", "stade", "marché", "marche", "إزدحام", "تجمع", "ملعب", "سوق"],
  },
];

const HIGH_GRAVITY = ["mort", "morts", "blessé", "blesse", "victime", "urgence", "évacuation", "evacuation", "قتلى", "جرحى", "إخلاء"];

export type AiSuggestion = {
  typeId: TypeCode;
  gravite: Gravity;
  confiance: number;
};

/**
 * Suggestion locale, déterministe et explicable. Elle ne décide jamais :
 * l'interface l'affiche comme proposition à valider par l'humain.
 */
export function suggestCatastrophe(description: string): AiSuggestion | null {
  const text = description.toLocaleLowerCase("fr");
  if (text.trim().length < 8) return null;

  let best: { rule: Rule; score: number } | null = null;
  for (const rule of RULES) {
    const score = rule.keywords.reduce(
      (total, keyword) => (text.includes(keyword.toLocaleLowerCase("fr")) ? total + 1 : total),
      0,
    );
    if (score > 0 && (!best || score > best.score)) best = { rule, score };
  }

  if (!best) return null;

  const severe = HIGH_GRAVITY.some((keyword) => text.includes(keyword.toLocaleLowerCase("fr")));
  const confidence = Math.min(0.95, 0.55 + best.score * 0.12 + (severe ? 0.08 : 0));
  return {
    typeId: best.rule.typeId,
    gravite: severe ? "critique" : best.rule.gravity,
    confiance: Number(confidence.toFixed(2)),
  };
}

import type { Localized } from "./locale";

export type TerritoryLevel = "commune" | "wilaya" | "national";

export type Territory = {
  id: string;
  code: string;
  nom: Localized;
  niveau: TerritoryLevel;
  parentId?: string;
};

export type Voisinage = { territoireA: string; territoireB: string };

export const NATIONAL_ID = "dz";

export const TERRITORIES: Territory[] = [
  {
    id: NATIONAL_ID,
    code: "DZ",
    nom: { fr: "Territoire national", ar: "التراب الوطني" },
    niveau: "national",
  },
  {
    id: "wilaya-bejaia",
    code: "06",
    nom: { fr: "Wilaya de Béjaïa", ar: "ولاية بجاية" },
    niveau: "wilaya",
    parentId: NATIONAL_ID,
  },
  {
    id: "wilaya-jijel",
    code: "18",
    nom: { fr: "Wilaya de Jijel", ar: "ولاية جيجل" },
    niveau: "wilaya",
    parentId: NATIONAL_ID,
  },
  {
    id: "wilaya-setif",
    code: "19",
    nom: { fr: "Wilaya de Sétif", ar: "ولاية سطيف" },
    niveau: "wilaya",
    parentId: NATIONAL_ID,
  },
  {
    id: "wilaya-bouira",
    code: "10",
    nom: { fr: "Wilaya de Bouira", ar: "ولاية البويرة" },
    niveau: "wilaya",
    parentId: NATIONAL_ID,
  },
  {
    id: "wilaya-tizi-ouzou",
    code: "15",
    nom: { fr: "Wilaya de Tizi Ouzou", ar: "ولاية تيزي وزو" },
    niveau: "wilaya",
    parentId: NATIONAL_ID,
  },
  {
    id: "wilaya-bba",
    code: "34",
    nom: { fr: "Wilaya de Bordj Bou Arreridj", ar: "ولاية برج بوعريريج" },
    niveau: "wilaya",
    parentId: NATIONAL_ID,
  },
  {
    id: "commune-bejaia",
    code: "0601",
    nom: { fr: "Commune de Béjaïa", ar: "بلدية بجاية" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-akbou",
    code: "0602",
    nom: { fr: "Commune d'Akbou", ar: "بلدية أقبو" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-tichy",
    code: "0603",
    nom: { fr: "Commune de Tichy", ar: "بلدية تيشي" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-aokas",
    code: "0604",
    nom: { fr: "Commune d'Aokas", ar: "بلدية أوقاس" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-kherrata",
    code: "0605",
    nom: { fr: "Commune de Kherrata", ar: "بلدية خراطة" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-el-kseur",
    code: "0606",
    nom: { fr: "Commune d'El Kseur", ar: "بلدية القصر" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-amizour",
    code: "0607",
    nom: { fr: "Commune d'Amizour", ar: "بلدية أميزور" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
  {
    id: "commune-sidi-aich",
    code: "0608",
    nom: { fr: "Commune de Sidi Aïch", ar: "بلدية سيدي عيش" },
    niveau: "commune",
    parentId: "wilaya-bejaia",
  },
];

/**
 * Voisinage symétrique : même niveau uniquement.
 * Les communes de Béjaïa sont reliées entre elles ; la wilaya de Béjaïa est
 * reliée aux wilayas limitrophes.
 */
export const VOISINAGE: Voisinage[] = [
  { territoireA: "commune-bejaia", territoireB: "commune-tichy" },
  { territoireA: "commune-bejaia", territoireB: "commune-aokas" },
  { territoireA: "commune-bejaia", territoireB: "commune-el-kseur" },
  { territoireA: "commune-bejaia", territoireB: "commune-amizour" },
  { territoireA: "commune-akbou", territoireB: "commune-sidi-aich" },
  { territoireA: "commune-akbou", territoireB: "commune-el-kseur" },
  { territoireA: "commune-tichy", territoireB: "commune-aokas" },
  { territoireA: "commune-aokas", territoireB: "commune-kherrata" },
  { territoireA: "commune-kherrata", territoireB: "commune-sidi-aich" },
  { territoireA: "commune-el-kseur", territoireB: "commune-amizour" },
  { territoireA: "wilaya-bejaia", territoireB: "wilaya-jijel" },
  { territoireA: "wilaya-bejaia", territoireB: "wilaya-setif" },
  { territoireA: "wilaya-bejaia", territoireB: "wilaya-bouira" },
  { territoireA: "wilaya-bejaia", territoireB: "wilaya-tizi-ouzou" },
  { territoireA: "wilaya-bejaia", territoireB: "wilaya-bba" },
  { territoireA: "wilaya-jijel", territoireB: "wilaya-setif" },
  { territoireA: "wilaya-setif", territoireB: "wilaya-bouira" },
  { territoireA: "wilaya-bouira", territoireB: "wilaya-tizi-ouzou" },
];

export function territoryById(id: string, territories: Territory[] = TERRITORIES): Territory | undefined {
  return territories.find((territory) => territory.id === id);
}

export function communesOf(wilayaId: string, territories: Territory[] = TERRITORIES): Territory[] {
  return territories.filter(
    (territory) => territory.niveau === "commune" && territory.parentId === wilayaId,
  );
}

export function neighboursOf(
  id: string,
  voisinage: Voisinage[] = VOISINAGE,
): string[] {
  return voisinage.flatMap((pair) => {
    if (pair.territoireA === id) return [pair.territoireB];
    if (pair.territoireB === id) return [pair.territoireA];
    return [];
  });
}

/** Vrai si `territoireId` est le territoire cible, un de ses enfants ou son parent. */
export function territoryCovers(
  scopeId: string,
  targetId: string,
  territories: Territory[] = TERRITORIES,
): boolean {
  if (scopeId === targetId) return true;
  const scope = territoryById(scopeId, territories);
  const target = territoryById(targetId, territories);
  if (!scope || !target) return false;
  if (scope.niveau === "national") return true;
  if (scope.niveau === "wilaya" && target.niveau === "commune") {
    return target.parentId === scope.id;
  }
  return false;
}

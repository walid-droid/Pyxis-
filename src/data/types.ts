import type { Localized } from "./locale";

/** Codes officiels des types de catastrophe (guide master v3.0, §3.1). */
export type TypeCode =
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "C5"
  | "C6"
  | "C7"
  | "C8"
  | "C9"
  | "C10";

export const TYPE_CODES: TypeCode[] = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "C10",
];

export type TypeCatastrophe = {
  id: TypeCode;
  code: TypeCode;
  libelle: Localized;
  /** Consignes aux citoyens, éditables par l'administrateur. */
  consignes: Localized;
};

export const TYPES_CATASTROPHE: TypeCatastrophe[] = [
  {
    id: "C1",
    code: "C1",
    libelle: { fr: "Séismes et risques géologiques", ar: "الزلازل والمخاطر الجيولوجية" },
    consignes: {
      fr: "Éloignez-vous des bâtiments endommagés. Ne prenez pas l'ascenseur. Suivez les itinéraires d'évacuation indiqués et attendez les consignes officielles.",
      ar: "ابتعدوا عن المباني المتضررة. لا تستعملوا المصاعد. اتبعوا مسارات الإخلاء المحددة وانتظروا التعليمات الرسمية.",
    },
  },
  {
    id: "C2",
    code: "C2",
    libelle: { fr: "Inondations", ar: "الفيضانات" },
    consignes: {
      fr: "Ne traversez pas un oued en crue, même en véhicule. Montez vers les hauteurs et coupez l'électricité si l'eau atteint votre habitation.",
      ar: "لا تعبروا وادياً في حالة فيضان حتى بالمركبة. اصعدوا نحو المرتفعات واقطعوا الكهرباء إذا وصل الماء إلى مسكنكم.",
    },
  },
  {
    id: "C3",
    code: "C3",
    libelle: { fr: "Risques climatiques", ar: "المخاطر المناخية" },
    consignes: {
      fr: "Restez à l'abri pendant les vents violents ou les chutes de neige. Évitez les routes exposées et protégez les personnes vulnérables.",
      ar: "ابقوا في مأمن أثناء الرياح القوية أو تساقط الثلوج. تجنبوا الطرق المكشوفة واحموا الفئات الهشة.",
    },
  },
  {
    id: "C4",
    code: "C4",
    libelle: { fr: "Feux de forêts", ar: "حرائق الغابات" },
    consignes: {
      fr: "Ne pénétrez pas dans la zone boisée. Fermez les fenêtres face à la fumée et dégagez les voies d'accès pour les secours.",
      ar: "لا تدخلوا إلى المنطقة الغابية. أغلقوا النوافذ في مواجهة الدخان وافسحوا طرق الوصول لفرق الإنقاذ.",
    },
  },
  {
    id: "C5",
    code: "C5",
    libelle: { fr: "Risques industriels et énergétiques", ar: "المخاطر الصناعية والطاقوية" },
    consignes: {
      fr: "Éloignez-vous de la zone industrielle et respectez le périmètre de sécurité. En cas de fuite de gaz, ne produisez aucune flamme ni étincelle.",
      ar: "ابتعدوا عن المنطقة الصناعية واحترموا محيط الأمن. في حالة تسرب الغاز لا تُحدثوا أي لهب أو شرارة.",
    },
  },
  {
    id: "C6",
    code: "C6",
    libelle: { fr: "Risques radiologiques et nucléaires", ar: "المخاطر الإشعاعية والنووية" },
    consignes: {
      fr: "Confinez-vous à l'intérieur, fermez la ventilation et restez à l'écoute des consignes des autorités. Ne manipulez aucun objet abandonné.",
      ar: "الزموا المساكن وأغلقوا التهوية وابقوا على اطلاع بتعليمات السلطات. لا تلمسوا أي جسم متروك.",
    },
  },
  {
    id: "C7",
    code: "C7",
    libelle: { fr: "Risques pour la santé humaine", ar: "المخاطر على صحة الإنسان" },
    consignes: {
      fr: "Respectez les gestes barrières et les mesures d'hygiène. Signalez les symptômes inhabituels et ne consommez pas d'eau non contrôlée.",
      ar: "احترموا التدابير الوقائية والنظافة. أبلغوا عن الأعراض غير العادية ولا تستهلكوا مياه غير مراقبة.",
    },
  },
  {
    id: "C8",
    code: "C8",
    libelle: { fr: "Risques pour la santé animale et végétale", ar: "المخاطر على صحة الحيوان والنبات" },
    consignes: {
      fr: "Isolez les animaux suspects et signalez toute mortalité anormale. N'introduisez pas de végétaux ou d'animaux dans la zone réglementée.",
      ar: "اعزلوا الحيوانات المشتبه بها وأبلغوا عن أي نفوق غير عادي. لا تُدخلوا نباتات أو حيوانات إلى المنطقة الخاضعة للتنظيم.",
    },
  },
  {
    id: "C9",
    code: "C9",
    libelle: { fr: "Pollutions atmosphérique, terrestre, marine ou hydrique", ar: "التلوث الجوي والأرضي والبحري والمائي" },
    consignes: {
      fr: "Évitez la zone polluée et ne consommez ni l'eau ni les produits exposés. Signalez les rejets ou dépôts suspects aux autorités.",
      ar: "تجنبوا المنطقة الملوثة ولا تستهلكوا المياه أو المنتجات المكشوفة. أبلغوا السلطات عن التصريفات أو الترسبات المشبوهة.",
    },
  },
  {
    id: "C10",
    code: "C10",
    libelle: { fr: "Catastrophes liées aux grands rassemblements humains", ar: "الكوارث المرتبطة بالتجمعات البشرية الكبرى" },
    consignes: {
      fr: "Gardez votre calme, ne poussez pas et suivez les issues indiquées. Une fois dégagé, signalez votre position aux équipes de secours.",
      ar: "حافظوا على الهدوء ولا تدفعوا واتبعوا المخارج المحددة. بعد الخروج أبلغوا فرق الإنقاذ عن موقعكم.",
    },
  },
];

import type { Localized } from "./locale";

/** Numéros officiels des 13 modules ORSEC (guide master v3.0, §3.2). */
export type ModuleNo =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13;

export type ModuleDef = {
  id: string;
  no: ModuleNo;
  nom: Localized;
  mission: Localized;
  organismes: Localized[];
  /** `false` : module absent de la phase de réhabilitation (marqué * dans la spec). */
  rehabilitation: boolean;
};

export const MODULES: ModuleDef[] = [
  {
    id: "module-1",
    no: 1,
    nom: { fr: "Secours, sauvetage et évacuation", ar: "الإغاثة والإنقاذ والإخلاء" },
    mission: {
      fr: "Recherche, secours, sauvetage et évacuation des victimes vers les hôpitaux ; protection des personnes et des biens.",
      ar: "البحث والإنقاذ وإخلاء الضحايا نحو المستشفيات؛ حماية الأشخاص والممتلكات.",
    },
    organismes: [
      { fr: "Direction de la protection civile", ar: "مديرية الحماية المدنية" },
    ],
    rehabilitation: false,
  },
  {
    id: "module-2",
    no: 2,
    nom: { fr: "Sécurité et ordre public", ar: "الأمن والنظام العام" },
    mission: {
      fr: "Protection du dispositif de secours, ordre public, lutte contre les infractions et contrôle des déplacements dans la zone sinistrée ; identification des victimes blessées et décédées.",
      ar: "حماية جهاز الإغاثة والنظام العام ومكافحة الجرائم ومراقبة التنقلات في المنطقة المنكوبة؛ تحديد هوية الضحايا.",
    },
    organismes: [
      { fr: "Groupement territorial de la Gendarmerie nationale", ar: "القيادة الإقليمية للدرك الوطني" },
      { fr: "Sûreté nationale", ar: "الأمن الوطني" },
      { fr: "Délégation à la sécurité publique", ar: "مندوبية الأمن العمومي" },
    ],
    rehabilitation: false,
  },
  {
    id: "module-3",
    no: 3,
    nom: { fr: "Santé, hygiène et prise en charge psychologique", ar: "الصحة والنظافة والتكفل النفسي" },
    mission: {
      fr: "Santé publique : prise en charge médicale et psychologique des sinistrés et des lieux ; contrôle sanitaire des aliments ; prévention des épidémies.",
      ar: "الصحة العمومية: التكفل الطبي والنفسي بالمنكوبين والأماكن؛ المراقبة الصحية للأغذية؛ الوقاية من الأوبئة.",
    },
    organismes: [
      { fr: "Direction de la santé et de la population", ar: "مديرية الصحة والسكان" },
      { fr: "Direction de l'environnement", ar: "مديرية البيئة" },
      { fr: "Direction des services agricoles (services vétérinaires)", ar: "مديرية المصالح الفلاحية (الخدمات البيطرية)" },
    ],
    rehabilitation: false,
  },
  {
    id: "module-4",
    no: 4,
    nom: { fr: "Communication et information", ar: "الاتصال والإعلام" },
    mission: {
      fr: "Continuité de l'information ; sensibilisation des sinistrés et du public ; collecte et diffusion des informations ; riposte à la désinformation.",
      ar: "استمرارية الإعلام؛ توعية المنكوبين والجمهور؛ جمع المعلومات وبثها؛ التصدي للمعلومات المضللة.",
    },
    organismes: [
      { fr: "Chef de cabinet du wali", ar: "رئيس ديوان الوالي" },
      { fr: "Radio locale", ar: "الإذاعة المحلية" },
    ],
    rehabilitation: true,
  },
  {
    id: "module-5",
    no: 5,
    nom: { fr: "Solidarité, activités humanitaires et ravitaillement", ar: "التضامن والعمل الإنساني والتموين" },
    mission: {
      fr: "Besoins alimentaires des sinistrés et des équipes ; réception et distribution des dons en nature.",
      ar: "الاحتياجات الغذائية للمنكوبين والفرق؛ استلام وتوزيع المساعدات العينية.",
    },
    organismes: [
      { fr: "Direction du commerce", ar: "مديرية التجارة" },
      { fr: "Direction de l'action sociale et de la solidarité", ar: "مديرية العمل الاجتماعي والتضامن" },
      { fr: "Direction des affaires religieuses et des wakfs", ar: "مديرية الشؤون الدينية والأوقاف" },
    ],
    rehabilitation: false,
  },
  {
    id: "module-6",
    no: 6,
    nom: { fr: "Énergie", ar: "الطاقة" },
    mission: {
      fr: "Approvisionnement en énergie et en électricité des sinistrés, de la population et des secours ; coupures de gaz.",
      ar: "تزويد المنكوبين والسكان وفرق الإنقاذ بالطاقة والكهرباء؛ قطع الغاز.",
    },
    organismes: [{ fr: "Direction de l'énergie", ar: "مديرية الطاقة" }],
    rehabilitation: true,
  },
  {
    id: "module-7",
    no: 7,
    nom: { fr: "Hébergement provisoire", ar: "الإيواء المؤقت" },
    mission: {
      fr: "Hébergement des sinistrés : choix des sites ; aménagement des camps de toile avec les travaux publics.",
      ar: "إيواء المنكوبين: اختيار المواقع؛ تهيئة مخيمات الخيام بالتعاون مع الأشغال العمومية.",
    },
    organismes: [
      { fr: "Direction du logement", ar: "مديرية السكن" },
      { fr: "Direction de la jeunesse et des sports", ar: "مديرية الشباب والرياضة" },
      { fr: "Direction du tourisme", ar: "مديرية السياحة" },
      { fr: "Direction de l'éducation", ar: "مديرية التربية" },
      { fr: "Direction de la formation professionnelle", ar: "مديرية التكوين المهني" },
      { fr: "Direction des affaires religieuses", ar: "مديرية الشؤون الدينية" },
      { fr: "Direction des œuvres universitaires", ar: "مديرية الخدمات الجامعية" },
    ],
    rehabilitation: true,
  },
  {
    id: "module-8",
    no: 8,
    nom: { fr: "Travaux publics", ar: "الأشغال العمومية" },
    mission: {
      fr: "Appui des secours en engins de travaux publics ; aménagement des sites d'accueil des sinistrés.",
      ar: "دعم فرق الإنقاذ بآليات الأشغال العمومية؛ تهيئة مواقع استقبال المنكوبين.",
    },
    organismes: [{ fr: "Direction des travaux publics", ar: "مديرية الأشغال العمومية" }],
    rehabilitation: true,
  },
  {
    id: "module-9",
    no: 9,
    nom: { fr: "Alimentation en eau potable", ar: "التزويد بمياه الشرب" },
    mission: {
      fr: "Approvisionnement en eau de la zone sinistrée et des secours ; contrôle de la qualité de l'eau.",
      ar: "تزويد المنطقة المنكوبة وفرق الإنقاذ بالمياه؛ مراقبة جودة المياه.",
    },
    organismes: [
      { fr: "Direction des ressources en eau", ar: "مديرية الموارد المائية" },
      { fr: "Direction du commerce", ar: "مديرية التجارة" },
    ],
    rehabilitation: true,
  },
  {
    id: "module-10",
    no: 10,
    nom: { fr: "Matériels et équipements divers", ar: "العناد والتجهيزات المتنوعة" },
    mission: {
      fr: "Fourniture aux services de secours des moyens qui leur manquent.",
      ar: "تزويد خدمات الإنقاذ بالوسائل الناقصة.",
    },
    organismes: [
      { fr: "Direction de l'administration locale", ar: "مديرية الإدارة المحلية" },
      { fr: "Conservation des forêts", ar: "محافظة الغابات" },
      { fr: "Présidents des APC", ar: "رؤساء المجالس الشعبية البلدية" },
    ],
    rehabilitation: false,
  },
  {
    id: "module-11",
    no: 11,
    nom: { fr: "Liaisons et télécommunications", ar: "الاتصالات السلكية واللاسلكية" },
    mission: {
      fr: "Appui des secours et des modules en moyens de transmission et de communication.",
      ar: "دعم فرق الإنقاذ والوحدات بوسائل الإرسال والاتصال.",
    },
    organismes: [
      { fr: "Direction des transmissions de la wilaya", ar: "مديرية الإرسال للولاية" },
      { fr: "Direction de la poste, des télécommunications, des technologies et du numérique", ar: "مديرية البريد والاتصالات والتكنولوجيا والرقمنة" },
    ],
    rehabilitation: true,
  },
  {
    id: "module-12",
    no: 12,
    nom: { fr: "Transport", ar: "النقل" },
    mission: {
      fr: "Appui des secours et des modules en moyens de transport ; transport des personnes et des biens vers les centres d'accueil.",
      ar: "دعم فرق الإنقاذ والوحدات بوسائل النقل؛ نقل الأشخاص والممتلكات نحو مراكز الاستقبال.",
    },
    organismes: [{ fr: "Direction des transports", ar: "مديرية النقل" }],
    rehabilitation: true,
  },
  {
    id: "module-13",
    no: 13,
    nom: { fr: "Expertises, évaluation et bilan", ar: "الخبرة والتقييم والحصيلة" },
    mission: {
      fr: "Collecte, dès le début, des données de tous les modules pour une image globale de la catastrophe, en vue du rapport détaillé.",
      ar: "جمع بيانات جميع الوحدات منذ البداية لتكوين صورة شاملة عن الكارثة تحضيراً للتقرير المفصّل.",
    },
    organismes: [
      { fr: "Direction de la programmation et du suivi budgétaire", ar: "مديرية البرمجة ومتابعة الميزانية" },
      { fr: "Direction des domaines", ar: "مديرية أملاك الدولة" },
      { fr: "Trésorerie de wilaya", ar: "خزينة الولاية" },
      { fr: "Direction de l'urbanisme, de l'architecture et de la construction", ar: "مديرية التعمير والعمارة والبناء" },
      { fr: "Direction des travaux publics", ar: "مديرية الأشغال العمومية" },
    ],
    rehabilitation: true,
  },
];

export const MODULE_BY_NO: Record<ModuleNo, ModuleDef> = Object.fromEntries(
  MODULES.map((module) => [module.no, module]),
) as Record<ModuleNo, ModuleDef>;

export const MODULE_NOS: ModuleNo[] = MODULES.map((module) => module.no);

export function moduleByNo(no: number): ModuleDef | undefined {
  return MODULES.find((module) => module.no === no);
}

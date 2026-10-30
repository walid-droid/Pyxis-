/**
 * Données de démonstration de l'espace organisme.
 * Aucun backend : les écrans illustrent les rôles et parcours du cahier des charges.
 */

import type { Lang } from "../../i18n";

export type Localized = { fr: string; ar: string };

export function loc(lang: Lang, value: Localized): string {
  return value[lang];
}

export type PersonaId =
  | "organisme"
  | "directeur"
  | "unite"
  | "pc"
  | "medical"
  | "evacuation"
  | "previsionniste"
  | "forestier"
  | "agent"
  | "engin"
  | "security"
  | "cotedan"
  | "urgentiste"
  | "pcf";

export type OrgPage =
  | "reports"
  | "missions"
  | "resources"
  | "reinforcements"
  | "watch"
  | "victims"
  | "evacuation"
  | "pco"
  | "vehicle"
  | "pcf"
  | "history";

export type Persona = {
  id: PersonaId;
  name: Localized;
  role: Localized;
  org: Localized;
  scope: Localized;
  pages: OrgPage[];
  duties: Localized[];
};

export const PERSONAS: Persona[] = [
  {
    id: "organisme",
    name: LocalizedValue("Compte organisme", "حساب الهيئة"),
    role: LocalizedValue("Organisme (S1)", "هيئة (S1)"),
    org: LocalizedValue("Protection civile · Béjaïa", "الحماية المدنية · بجاية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["reports", "missions", "resources"],
    duties: [
      LocalizedValue(
        "Recevoir et traiter les signalements de l'organisme.",
        "استلام تبليغات الهيئة ومعالجتها.",
      ),
      LocalizedValue(
        "Confirmer ou rejeter un signalement, avec justification.",
        "تأكيد أو رفض التبليغ مع التبرير.",
      ),
      LocalizedValue(
        "Fixer ou modifier la gravité, avec justification obligatoire.",
        "تحديد أو تعديل الخطورة بتبرير إلزامي.",
      ),
    ],
  },
  {
    id: "directeur",
    name: LocalizedValue("Colonel A. Mansouri", "العقيد أ. منصوري"),
    role: LocalizedValue("Directeur d'organisme", "مدير الهيئة"),
    org: LocalizedValue("Protection civile · Béjaïa", "الحماية المدنية · بجاية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["reports", "missions", "resources", "reinforcements", "history"],
    duties: [
      LocalizedValue(
        "Gérer les équipes et les moyens de l'organisme.",
        "إدارة فرق الهيئة ووسائلها.",
      ),
      LocalizedValue(
        "Traiter les signalements de son organisme.",
        "معالجة تبليغات الهيئة.",
      ),
      LocalizedValue(
        "Autoriser l'engagement d'une équipe déjà mobilisée.",
        "ترخيص مشاركة فريق مشارك مسبقاً.",
      ),
      LocalizedValue(
        "Transmettre ou traiter les renforts au PCF.",
        "إحالة التعزيزات إلى مركز القيادة أو معالجتها.",
      ),
    ],
  },
  {
    id: "unite",
    name: LocalizedValue("Capitaine S. Haddad", "النقيب س. حداد"),
    role: LocalizedValue("Responsable d'unité", "مسؤول الوحدة"),
    org: LocalizedValue("Unité d'intervention n° 3", "وحدة التدخل رقم 3"),
    scope: LocalizedValue("Commune de Béjaïa", "بلدية بجاية"),
    pages: ["missions", "resources", "reinforcements"],
    duties: [
      LocalizedValue(
        "Créer et affecter les missions de l'unité.",
        "إنشاء مهام الوحدة وإسنادها.",
      ),
      LocalizedValue(
        "Demander un renfort à son directeur.",
        "طلب تعزيز من المدير.",
      ),
      LocalizedValue(
        "Rendre compte au PCO.",
        "رفع التقرير إلى مركز القيادة العملياتي.",
      ),
    ],
  },
  {
    id: "pc",
    name: LocalizedValue("Commandant R. Amrani", "الرائد ر. عمراني"),
    role: LocalizedValue("Responsable de la Protection civile", "مسؤول الحماية المدنية"),
    org: LocalizedValue("PCO · Protection civile", "مركز القيادة · الحماية المدنية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["missions", "resources", "reinforcements", "victims", "evacuation", "pco", "history"],
    duties: [
      LocalizedValue(
        "Créer les missions et diriger le PCO.",
        "إنشاء المهام وقيادة مركز القيادة.",
      ),
      LocalizedValue(
        "Coordonner les organismes et rendre compte au PCF.",
        "تنسيق الهيئات ورفع التقرير إلى مركز القيادة الجهوي.",
      ),
      LocalizedValue(
        "Demander le déclenchement du plan.",
        "طلب إطلاق الخطة.",
      ),
      LocalizedValue(
        "Saisir le plan de la commission.",
        "تسجيل خطة اللجنة.",
      ),
    ],
  },
  {
    id: "medical",
    name: LocalizedValue("Dr L. Meziane", "الدكتور ل. مزيان"),
    role: LocalizedValue("Responsable médical", "المسؤول الطبي"),
    org: LocalizedValue("Direction de la santé · Béjaïa", "مديرية الصحة · بجاية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["missions", "resources", "victims"],
    duties: [
      LocalizedValue(
        "Suivre le bilan des victimes et leur état clinique.",
        "متابعة حصيلة الضحايا وحالتهم السريرية.",
      ),
      LocalizedValue(
        "Demander les renforts médicaux.",
        "طلب التعزيزات الطبية.",
      ),
      LocalizedValue(
        "Coordonner les ambulances et les évacuations sanitaires.",
        "تنسيق الإسعاف وعمليات الإخلاء الصحي.",
      ),
    ],
  },
  {
    id: "evacuation",
    name: LocalizedValue("Cne N. Cherif", "النقيب ن. شريف"),
    role: LocalizedValue("Responsable des évacuations", "مسؤول الإخلاء"),
    org: LocalizedValue("Protection civile · Béjaïa", "الحماية المدنية · بجاية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["missions", "resources", "evacuation"],
    duties: [
      LocalizedValue(
        "Gérer les itinéraires et les déviations.",
        "إدارة المسارات والتحويلات.",
      ),
      LocalizedValue(
        "Piloter les zones de rassemblement.",
        "إدارة نقاط التجمع.",
      ),
      LocalizedValue(
        "Organiser les déplacements des populations.",
        "تنظيم تنقلات السكان.",
      ),
    ],
  },
  {
    id: "previsionniste",
    name: LocalizedValue("Mme H. Taleb", "السيدة ح. طالب"),
    role: LocalizedValue("Prévisionniste", "المتنبئ"),
    org: LocalizedValue("Cellule de veille · ANRH", "خلية اليقظة · الوكالة الوطنية للموارد المائية"),
    scope: LocalizedValue("Bassins de la Soummam", "أحواض سومام"),
    pages: ["watch"],
    duties: [
      LocalizedValue(
        "Saisir les barrages, oueds et niveaux d'eau.",
        "تسجيل السدود والأودية ومناسيب المياه.",
      ),
      LocalizedValue(
        "Tenir à jour les seuils d'alerte.",
        "تحديث عتبات الإنذار.",
      ),
      LocalizedValue(
        "Proposer une alerte de crue à l'autorité quand un seuil est dépassé.",
        "اقتراح إنذار فيضان على السلطة عند تجاوز العتبة.",
      ),
    ],
  },
  {
    id: "forestier",
    name: LocalizedValue("M. K. Zidane", "السيد ك. زيدان"),
    role: LocalizedValue("Agent forestier", "العون الغابي"),
    org: LocalizedValue("Conservation des forêts · Béjaïa", "محافظة الغابات · بجاية"),
    scope: LocalizedValue("Massifs de Béjaïa", "غابات بجاية"),
    pages: ["watch", "resources"],
    duties: [
      LocalizedValue(
        "Signaler les risques forestiers.",
        "الإبلاغ عن المخاطر الغابية.",
      ),
      LocalizedValue(
        "Recenser les moyens de lutte.",
        "إحصاء وسائل المكافحة.",
      ),
      LocalizedValue(
        "Proposer une alerte forestière à l'autorité.",
        "اقتراح إنذار غابي على السلطة.",
      ),
    ],
  },
  {
    id: "agent",
    name: LocalizedValue("Agent Y. Meziane", "العون ي. مزيان"),
    role: LocalizedValue("Agent de terrain", "عون ميداني"),
    org: LocalizedValue("Unité d'intervention n° 3", "وحدة التدخل رقم 3"),
    scope: LocalizedValue("Commune de Béjaïa", "بلدية بجاية"),
    pages: ["missions", "resources"],
    duties: [
      LocalizedValue(
        "Voir et exécuter ses missions.",
        "عرض مهامه وتنفيذها.",
      ),
      LocalizedValue(
        "Envoyer un compte rendu, même hors ligne.",
        "إرسال تقرير حتى دون اتصال.",
      ),
      LocalizedValue(
        "Mettre à jour ses moyens.",
        "تحديث وسائله.",
      ),
    ],
  },
  {
    id: "engin",
    name: LocalizedValue("Sgt B. Saidi", "الرقيب ب. سعيدي"),
    role: LocalizedValue("Chef d'engin", "قائد العربة"),
    org: LocalizedValue("Parc engins · Protection civile", "حظيرة العربات · الحماية المدنية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["missions", "vehicle"],
    duties: [
      LocalizedValue(
        "Suivre son véhicule et ses équipements.",
        "متابعة مركبته وتجهيزاتها.",
      ),
      LocalizedValue(
        "Vérifier la disponibilité avant engagement.",
        "التحقق من التوفر قبل المشاركة.",
      ),
      LocalizedValue(
        "Signaler toute panne ou indisponibilité.",
        "الإبلاغ عن أي عطب أو عدم توفر.",
      ),
    ],
  },
  {
    id: "security",
    name: LocalizedValue("Commissaire T. Saidi", "المفوض ط. سعيدي"),
    role: LocalizedValue("Police / Gendarmerie / Travaux publics", "الشرطة / الدرك / الأشغال العمومية"),
    org: LocalizedValue("Sécurité publique · Béjaïa", "الأمن العمومي · بجاية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["missions", "evacuation"],
    duties: [
      LocalizedValue(
        "Sécuriser les zones sinistrées.",
        "تأمين المناطق المتضررة.",
      ),
      LocalizedValue(
        "Signaler les routes bloquées.",
        "الإبلاغ عن الطرق المغلقة.",
      ),
      LocalizedValue(
        "Confirmer la réouverture d'une route.",
        "تأكيد إعادة فتح الطريق.",
      ),
    ],
  },
  {
    id: "cotedan",
    name: LocalizedValue("Major A. Bouzid", "الرئيس أ. بوزيد"),
    role: LocalizedValue("Garde-côtes", "حرس السواحل"),
    org: LocalizedValue("Garde-côtes · Béjaïa", "حرس السواحل · بجاية"),
    scope: LocalizedValue("Littoral de Béjaïa", "ساحل بجاية"),
    pages: ["missions", "resources"],
    duties: [
      LocalizedValue(
        "Intervenir en mer et sur le littoral.",
        "التدخل في البحر وعلى الساحل.",
      ),
      LocalizedValue(
        "Sécuriser les zones de baignade et les accès portuaires.",
        "تأمين مناطق السباحة ومداخل الميناء.",
      ),
      LocalizedValue(
        "Rendre compte des opérations de sauvetage en mer.",
        "رفع تقارير عمليات الإنقاذ البحري.",
      ),
    ],
  },
  {
    id: "pcf",
    name: LocalizedValue("Général M. Larbi", "اللواء م. العربي"),
    role: LocalizedValue("Directeur du PCF", "مدير مركز القيادة الجهوي"),
    org: LocalizedValue("PCF · Protection civile", "مركز القيادة · الحماية المدنية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["pcf", "reinforcements", "history"],
    duties: [
      LocalizedValue(
        "Conduire la phase d'activation et les modules concernés.",
        "قيادة مرحلة التفعيل والوحدات المعنية.",
      ),
      LocalizedValue(
        "Suivre les renforts entrants et sortants.",
        "متابعة التعزيزات الواردة والصادرة.",
      ),
      LocalizedValue(
        "Habiliter une personne pour représenter le PCF.",
        "تأهيل شخص لتمثيل مركز القيادة.",
      ),
    ],
  },
  {
    id: "urgentiste",
    name: LocalizedValue("Dr S. Kaci", "الدكتورة س. قاسي"),
    role: LocalizedValue("Médecin urgentiste (S7)", "طبيب استعجالات (S7)"),
    org: LocalizedValue("SAMU · CHU Béjaïa", "الإسعاف الطبي · المستشفى الجامعي ببجاية"),
    scope: LocalizedValue("Wilaya de Béjaïa", "ولاية بجاية"),
    pages: ["missions", "victims"],
    duties: [
      LocalizedValue(
        "Enregistrer les victimes et leur état clinique.",
        "تسجيل الضحايا وحالتهم السريرية.",
      ),
      LocalizedValue(
        "Signaler les urgences au PCO.",
        "الإبلاغ عن الاستعجالات إلى مركز القيادة.",
      ),
      LocalizedValue(
        "Orienter les victimes vers les établissements de santé.",
        "توجيه الضحايا إلى المؤسسات الصحية.",
      ),
    ],
  },
];

function LocalizedValue(fr: string, ar: string): Localized {
  return { fr, ar };
}

/* ------------------------------------------------------------------ */
/* Signalements                                                        */
/* ------------------------------------------------------------------ */

export type Severity = "low" | "medium" | "high" | "critical";
export type ReportStatus = "received" | "confirmed" | "rejected";

export type ReportHistory = {
  at: string;
  action: Localized;
  by: string;
};

export type OrgReport = {
  id: string;
  ref: string;
  title: Localized;
  summary: Localized;
  place: Localized;
  source: Localized;
  reporter: string;
  receivedAt: string;
  severity: Severity;
  status: ReportStatus;
  reason?: Localized;
  history: ReportHistory[];
};

export const REPORTS: OrgReport[] = [
  {
    id: "r1",
    ref: "SIG-2026-1042",
    title: LocalizedValue(
      "Crue soudaine de l'oued Soummam",
      "فيضان مفاجئ لواد سومام",
    ),
    summary: LocalizedValue(
      "Montée des eaux sur la RN26, trois véhicules immobilisés et habitations menacées au quartier Iheddaden.",
      "ارتفاع المياه على الطريق الوطنية 26، ثلاث مركبات عالقة ومنازل مهددة بحي إحدادن.",
    ),
    place: LocalizedValue("Akbou · RN26", "أقبو · الطريق الوطنية 26"),
    source: LocalizedValue("Citoyen", "مواطن"),
    reporter: "M. A. Ferhat",
    receivedAt: "30/10/2026 · 08:42",
    severity: "critical",
    status: "received",
    history: [
      {
        at: "30/10/2026 · 08:42",
        action: LocalizedValue("Signalement reçu", "تم استلام التبليغ"),
        by: "Plateforme citoyenne",
      },
    ],
  },
  {
    id: "r2",
    ref: "SIG-2026-1039",
    title: LocalizedValue(
      "Fumée suspecte en lisière de forêt",
      "دخان مشبوه على حدود الغابة",
    ),
    summary: LocalizedValue(
      "Fumée dense signalée près du massif de Gouraya, accès par le chemin des Crêtes.",
      "دخان كثيف قرب غابة قورايا، الوصول عبر طريق القمم.",
    ),
    place: LocalizedValue("Béjaïa · Gouraya", "بجاية · قورايا"),
    source: LocalizedValue("Agent forestier", "عون غابي"),
    reporter: "M. K. Zidane",
    receivedAt: "30/10/2026 · 07:55",
    severity: "high",
    status: "received",
    history: [
      {
        at: "30/10/2026 · 07:55",
        action: LocalizedValue("Signalement reçu", "تم استلام التبليغ"),
        by: "Cellule de veille",
      },
    ],
  },
  {
    id: "r3",
    ref: "SIG-2026-1028",
    title: LocalizedValue(
      "Route départementale coupée par un éboulement",
      "طريق ولائي مغلق بفعل انهيار",
    ),
    summary: LocalizedValue(
      "Éboulement sur la RD101 entre Tichy et Aokas. Aucune victime, circulation interrompue.",
      "انهيار على الطريق الولائي 101 بين تيشي وأوقاس. لا ضحايا، الحركة متوقفة.",
    ),
    place: LocalizedValue("Tichy · RD101", "تيشي · الطريق الولائي 101"),
    source: LocalizedValue("Gendarmerie", "الدرك"),
    reporter: "Brigade d'Aokas",
    receivedAt: "29/10/2026 · 18:20",
    severity: "medium",
    status: "confirmed",
    history: [
      {
        at: "29/10/2026 · 18:20",
        action: LocalizedValue("Signalement reçu", "تم استلام التبليغ"),
        by: "Gendarmerie",
      },
      {
        at: "29/10/2026 · 18:34",
        action: LocalizedValue("Confirmé par l'organisme", "أكدته الهيئة"),
        by: "Capitaine S. Haddad",
      },
    ],
  },
  {
    id: "r4",
    ref: "SIG-2026-1015",
    title: LocalizedValue(
      "Odeur de gaz près d'un dépôt",
      "رائحة غاز قرب مستودع",
    ),
    summary: LocalizedValue(
      "Odeur persistante signalée à proximité du dépôt de carburant. Vérification demandée.",
      "رائحة مستمرة قرب مستودع الوقود. طُلب التحقق.",
    ),
    place: LocalizedValue("Béjaïa · Zone industrielle", "بجاية · المنطقة الصناعية"),
    source: LocalizedValue("Citoyen", "مواطن"),
    reporter: "Mme R. Ouali",
    receivedAt: "28/10/2026 · 21:10",
    severity: "medium",
    status: "rejected",
    reason: LocalizedValue(
      "Aucune fuite détectée après deux passages de l'équipe technique ; signalement classé sans suite.",
      "لم يُكتشف أي تسرب بعد مرور فريقين تقنيين؛ صُنّف التبليغ دون متابعة.",
    ),
    history: [
      {
        at: "28/10/2026 · 21:10",
        action: LocalizedValue("Signalement reçu", "تم استلام التبليغ"),
        by: "Plateforme citoyenne",
      },
      {
        at: "29/10/2026 · 09:05",
        action: LocalizedValue("Rejeté avec motif", "رُفض مع السبب"),
        by: "Colonel A. Mansouri",
      },
    ],
  },
  {
    id: "r5",
    ref: "SIG-2026-1007",
    title: LocalizedValue(
      "Effondrement partiel d'un mur de soutènement",
      "انهيار جزئي لجدار ساند",
    ),
    summary: LocalizedValue(
      "Mur menaçant une habitation occupée par une famille de six personnes.",
      "جدار يهدد مسكناً تقطنه أسرة من ستة أشخاص.",
    ),
    place: LocalizedValue("Béjaïa · Iheddaden", "بجاية · إحدادن"),
    source: LocalizedValue("APC", "البلدية"),
    reporter: "Service technique APC",
    receivedAt: "27/10/2026 · 14:05",
    severity: "high",
    status: "received",
    history: [
      {
        at: "27/10/2026 · 14:05",
        action: LocalizedValue("Signalement reçu", "تم استلام التبليغ"),
        by: "APC de Béjaïa",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Missions                                                            */
/* ------------------------------------------------------------------ */

export type MissionStatus = "todo" | "active" | "done";
export type MissionPriority = "low" | "medium" | "high";

export type Mission = {
  id: string;
  ref: string;
  title: Localized;
  place: Localized;
  unit: Localized;
  assignee: Localized | null;
  priority: MissionPriority;
  status: MissionStatus;
  due: string;
  report?: Localized;
  reportPosition?: string;
  reportPhotos?: number;
  offline?: boolean;
};

export const MISSIONS: Mission[] = [
  {
    id: "m1",
    ref: "MIS-2026-311",
    title: LocalizedValue(
      "Sécuriser les abords de l'oued et baliser la RN26",
      "تأمين ضفاف الوادي ووضع علامات على الطريق الوطنية 26",
    ),
    place: LocalizedValue("Akbou · RN26", "أقبو · الطريق الوطنية 26"),
    unit: LocalizedValue("Unité d'intervention n° 3", "وحدة التدخل رقم 3"),
    assignee: LocalizedValue("Capitaine S. Haddad", "النقيب س. حداد"),
    priority: "high",
    status: "active",
    due: "30/10/2026 · 12:00",
  },
  {
    id: "m2",
    ref: "MIS-2026-310",
    title: LocalizedValue(
      "Évacuer les habitations du quartier Iheddaden",
      "إخلاء منازل حي إحدادن",
    ),
    place: LocalizedValue("Béjaïa · Iheddaden", "بجاية · إحدادن"),
    unit: LocalizedValue("Unité évacuation", "وحدة الإخلاء"),
    assignee: LocalizedValue("Cne N. Cherif", "النقيب ن. شريف"),
    priority: "high",
    status: "active",
    due: "30/10/2026 · 13:30",
  },
  {
    id: "m3",
    ref: "MIS-2026-309",
    title: LocalizedValue(
      "Reconnaissance du massif de Gouraya",
      "استطلاع غابة قورايا",
    ),
    place: LocalizedValue("Béjaïa · Gouraya", "بجاية · قورايا"),
    unit: LocalizedValue("Unité forestière", "الوحدة الغابية"),
    assignee: LocalizedValue("Agent Y. Meziane", "العون ي. مزيان"),
    priority: "medium",
    status: "todo",
    due: "30/10/2026 · 15:00",
  },
  {
    id: "m4",
    ref: "MIS-2026-305",
    title: LocalizedValue(
      "Mettre en place le poste médical avancé",
      "نصب المركز الطبي المتقدم",
    ),
    place: LocalizedValue("Akbou · Salle omnisports", "أقبو · القاعة المتعددة الرياضات"),
    unit: LocalizedValue("SAMU · CHU Béjaïa", "الإسعاف الطبي · المستشفى الجامعي"),
    assignee: LocalizedValue("Dr L. Meziane", "الدكتور ل. مزيان"),
    priority: "medium",
    status: "done",
    due: "30/10/2026 · 10:00",
    report: LocalizedValue(
      "Poste médical avancé opérationnel à 09:40. Deux médecins et six infirmiers engagés.",
      "المركز الطبي المتقدم جاهز عند 09:40. طبيبان وستة ممرضين مشاركون.",
    ),
  },
  {
    id: "m5",
    ref: "MIS-2026-301",
    title: LocalizedValue(
      "Ravitailler l'engin pompe en carburant",
      "تموين عربة الضخ بالوقود",
    ),
    place: LocalizedValue("Béjaïa · Parc engins", "بجاية · حظيرة العربات"),
    unit: LocalizedValue("Logistique", "اللوجستيك"),
    assignee: LocalizedValue("Sgt B. Saidi", "الرقيب ب. سعيدي"),
    priority: "low",
    status: "done",
    due: "29/10/2026 · 17:00",
    report: LocalizedValue(
      "Plein effectué, niveaux vérifiés. Engin disponible.",
      "تم التموين والتحقق من المستويات. العربة متاحة.",
    ),
    offline: true,
  },
];

/* ------------------------------------------------------------------ */
/* Moyens                                                              */
/* ------------------------------------------------------------------ */

export type ResourceStatus = "available" | "engaged" | "maintenance";

export type Team = {
  id: string;
  name: Localized;
  type: Localized;
  status: ResourceStatus;
  members: number;
  contact: string;
  mission: Localized | null;
};

export type Vehicle = {
  id: string;
  name: Localized;
  type: Localized;
  status: ResourceStatus;
  fuel: number;
  position: Localized;
  driver: string;
};

export type Equipment = {
  id: string;
  name: Localized;
  quantity: number;
  status: ResourceStatus;
};

export const TEAMS: Team[] = [
  {
    id: "t1",
    name: LocalizedValue("Unité d'intervention n° 3", "وحدة التدخل رقم 3"),
    type: LocalizedValue("Secours et sauvetage", "إنقاذ وإغاثة"),
    status: "engaged",
    members: 12,
    contact: "14 21",
    mission: LocalizedValue("RN26 · Akbou", "الطريق الوطنية 26 · أقبو"),
  },
  {
    id: "t2",
    name: LocalizedValue("Équipe médicale mobile", "الفريق الطبي المتنقل"),
    type: LocalizedValue("Santé", "الصحة"),
    status: "engaged",
    members: 8,
    contact: "14 15",
    mission: LocalizedValue("Poste médical avancé · Akbou", "المركز الطبي المتقدم · أقبو"),
  },
  {
    id: "t3",
    name: LocalizedValue("Unité évacuation", "وحدة الإخلاء"),
    type: LocalizedValue("Évacuation", "الإخلاء"),
    status: "engaged",
    members: 10,
    contact: "14 22",
    mission: LocalizedValue("Iheddaden", "إحدادن"),
  },
  {
    id: "t4",
    name: LocalizedValue("Unité forestière", "الوحدة الغابية"),
    type: LocalizedValue("Feux de forêt", "حرائق الغابات"),
    status: "available",
    members: 9,
    contact: "14 30",
    mission: null,
  },
  {
    id: "t5",
    name: LocalizedValue("Équipe logistique", "فريق اللوجستيك"),
    type: LocalizedValue("Logistique", "اللوجستيك"),
    status: "available",
    members: 6,
    contact: "14 40",
    mission: null,
  },
];

export const VEHICLES: Vehicle[] = [
  {
    id: "v1",
    name: LocalizedValue("Engin pompe FPT-03", "عربة الضخ FPT-03"),
    type: LocalizedValue("Fourgon pompe-tonne", "شاحنة ضخ"),
    status: "engaged",
    fuel: 72,
    position: LocalizedValue("Akbou · RN26", "أقبو · الطريق الوطنية 26"),
    driver: "Sgt B. Saidi",
  },
  {
    id: "v2",
    name: LocalizedValue("Ambulance SAMU-12", "إسعاف SAMU-12"),
    type: LocalizedValue("Ambulance médicalisée", "إسعاف طبي"),
    status: "engaged",
    fuel: 58,
    position: LocalizedValue("Akbou · Salle omnisports", "أقبو · القاعة المتعددة الرياضات"),
    driver: "M. R. Bouzid",
  },
  {
    id: "v3",
    name: LocalizedValue("Véhicule de commandement PC-01", "مركبة القيادة PC-01"),
    type: LocalizedValue("PC mobile", "مركز قيادة متنقل"),
    status: "available",
    fuel: 90,
    position: LocalizedValue("Béjaïa · PCO", "بجاية · مركز القيادة"),
    driver: "Cdt R. Amrani",
  },
  {
    id: "v4",
    name: LocalizedValue("Camion-citerne CC-07", "صهريج CC-07"),
    type: LocalizedValue("Ravitaillement", "التموين"),
    status: "maintenance",
    fuel: 34,
    position: LocalizedValue("Béjaïa · Parc engins", "بجاية · حظيرة العربات"),
    driver: "M. K. Aït Ali",
  },
];

export const EQUIPMENT: Equipment[] = [
  {
    id: "e1",
    name: LocalizedValue("Tronçonneuses", "مناشير"),
    quantity: 6,
    status: "available",
  },
  {
    id: "e2",
    name: LocalizedValue("Motopompes", "مضخات"),
    quantity: 4,
    status: "engaged",
  },
  {
    id: "e3",
    name: LocalizedValue("Tentes de rassemblement", "خيام التجمع"),
    quantity: 24,
    status: "available",
  },
  {
    id: "e4",
    name: LocalizedValue("Brancards", "نقالات"),
    quantity: 14,
    status: "available",
  },
  {
    id: "e5",
    name: LocalizedValue("Groupes électrogènes", "مولدات كهربائية"),
    quantity: 3,
    status: "maintenance",
  },
];

/* ------------------------------------------------------------------ */
/* Renforts                                                            */
/* ------------------------------------------------------------------ */

export type ReinforcementStatus =
  | "requested"
  | "authorized"
  | "transmitted"
  | "processed"
  | "refused";

export type Reinforcement = {
  id: string;
  ref: string;
  from: Localized;
  type: Localized;
  quantity: number;
  urgency: "low" | "medium" | "high";
  mission: Localized;
  status: ReinforcementStatus;
  at: string;
  note: Localized;
};

export const REINFORCEMENTS: Reinforcement[] = [
  {
    id: "ren1",
    ref: "REN-2026-088",
    from: LocalizedValue("Unité d'intervention n° 3", "وحدة التدخل رقم 3"),
    type: LocalizedValue("Équipe de secours", "فريق إنقاذ"),
    quantity: 2,
    urgency: "high",
    mission: LocalizedValue("RN26 · Akbou", "الطريق الوطنية 26 · أقبو"),
    status: "requested",
    at: "30/10/2026 · 09:10",
    note: LocalizedValue(
      "Montée des eaux rapide, besoin de deux équipes supplémentaires avec embarcations.",
      "ارتفاع سريع للمياه، الحاجة إلى فريقين إضافيين مع قوارب.",
    ),
  },
  {
    id: "ren2",
    ref: "REN-2026-086",
    from: LocalizedValue("SAMU · CHU Béjaïa", "الإسعاف الطبي · المستشفى الجامعي"),
    type: LocalizedValue("Ambulance médicalisée", "إسعاف طبي"),
    quantity: 1,
    urgency: "medium",
    mission: LocalizedValue("Poste médical avancé", "المركز الطبي المتقدم"),
    status: "authorized",
    at: "30/10/2026 · 08:55",
    note: LocalizedValue(
      "Renfort pour l'évacuation des urgences absolues vers le CHU.",
      "تعزيز لإخلاء الاستعجالات المطلقة نحو المستشفى الجامعي.",
    ),
  },
  {
    id: "ren3",
    ref: "REN-2026-081",
    from: LocalizedValue("Unité forestière", "الوحدة الغابية"),
    type: LocalizedValue("Camion-citerne", "صهريج"),
    quantity: 1,
    urgency: "medium",
    mission: LocalizedValue("Massif de Gouraya", "غابة قورايا"),
    status: "transmitted",
    at: "30/10/2026 · 07:20",
    note: LocalizedValue(
      "Appui en eau pour la reconnaissance du massif.",
      "دعم بالمياه لاستطلاع الغابة.",
    ),
  },
  {
    id: "ren4",
    ref: "REN-2026-076",
    from: LocalizedValue("Unité évacuation", "وحدة الإخلاء"),
    type: LocalizedValue("Bus de transport", "حافلات نقل"),
    quantity: 3,
    urgency: "low",
    mission: LocalizedValue("Iheddaden", "إحدادن"),
    status: "processed",
    at: "29/10/2026 · 19:40",
    note: LocalizedValue(
      "Transport des familles vers la zone de rassemblement.",
      "نقل العائلات إلى نقطة التجمع.",
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Cellule de veille                                                   */
/* ------------------------------------------------------------------ */

export type HydroStation = {
  id: string;
  name: Localized;
  kind: "dam" | "oued" | "station";
  level: number;
  vigilance: number;
  threshold: number;
  trend: "rising" | "stable" | "falling";
  updated: string;
  alertProposed: boolean;
  /** Lâcher d'eau en m³/s (BF27), 0 si aucun. */
  release?: number;
  /** Dernières mesures pour le graphique d'évolution. */
  history: number[];
  /** Zones inondables associées, affichées sur la carte. */
  floodZones?: Localized[];
};

export const HYDRO_STATIONS: HydroStation[] = [
  {
    id: "h1",
    name: LocalizedValue("Barrage de Tichy Haf", "سد تيشي حاف"),
    kind: "dam",
    level: 84.2,
    vigilance: 78,
    threshold: 82,
    trend: "rising",
    updated: "30/10/2026 · 08:30",
    alertProposed: false,
    release: 45,
    history: [76.1, 77.4, 78.8, 79.6, 80.9, 81.7, 82.6, 83.4, 84.2],
    floodZones: [
      LocalizedValue("Vallée de la Soummam · Akbou", "وادي سومام · أقبو"),
      LocalizedValue("Basse plaine de Tichy", "سهل تيشي المنخفض"),
    ],
  },
  {
    id: "h2",
    name: LocalizedValue("Oued Soummam · Akbou", "واد سومام · أقبو"),
    kind: "oued",
    level: 4.8,
    vigilance: 3.6,
    threshold: 4.2,
    trend: "rising",
    updated: "30/10/2026 · 08:45",
    alertProposed: true,
    release: 0,
    history: [2.9, 3.1, 3.4, 3.8, 4.0, 4.3, 4.5, 4.6, 4.8],
    floodZones: [
      LocalizedValue("Quartier Iheddaden", "حي إحدادن"),
      LocalizedValue("Berges de la RN26", "ضفاف الطريق الوطنية 26"),
    ],
  },
  {
    id: "h3",
    name: LocalizedValue("Oued Sahel · Amizour", "واد الساحل · أميزور"),
    kind: "oued",
    level: 2.1,
    vigilance: 2.8,
    threshold: 3.5,
    trend: "stable",
    updated: "30/10/2026 · 08:15",
    alertProposed: false,
    release: 0,
    history: [1.8, 1.9, 2.0, 2.2, 2.1, 2.3, 2.2, 2.1, 2.1],
    floodZones: [LocalizedValue("Plaine d'Amizour", "سهل أميزور")],
  },
  {
    id: "h4",
    name: LocalizedValue("Station de jaugeage d'Aokas", "محطة قياس أوقاس"),
    kind: "station",
    level: 1.6,
    vigilance: 2.2,
    threshold: 2.8,
    trend: "falling",
    updated: "30/10/2026 · 07:50",
    alertProposed: false,
    release: 0,
    history: [2.2, 2.0, 1.9, 1.8, 1.9, 1.7, 1.6, 1.7, 1.6],
    floodZones: [LocalizedValue("Embouchure d'Aokas", "مصب أوقاس")],
  },
];

export type RoadClosure = {
  id: string;
  name: Localized;
  kind: "road" | "bridge";
  reason: Localized;
  alternate: Localized;
  reportedBy: string;
  updated: string;
  status: "blocked" | "reopened";
  confirmedBy?: string;
};

/** Routes et ponts coupés (BF29), confirmés par la police ou la gendarmerie (RG14). */
export const ROAD_CLOSURES: RoadClosure[] = [
  {
    id: "rc1",
    name: LocalizedValue("RN26 · Akbou → Béjaïa", "الطريق الوطنية 26 · أقبو ← بجاية"),
    kind: "road",
    reason: LocalizedValue("Chaussée submergée", "الطريق مغمور"),
    alternate: LocalizedValue("RN74 via El Kseur", "الطريق الوطنية 74 عبر القصر"),
    reportedBy: "Gendarmerie · Akbou",
    updated: "30/10/2026 · 09:15",
    status: "blocked",
  },
  {
    id: "rc2",
    name: LocalizedValue("Pont de Tichy", "جسر تيشي"),
    kind: "bridge",
    reason: LocalizedValue("Affouillement d'une pile", "تآكل إحدى الدعامات"),
    alternate: LocalizedValue("RD101 via Aokas", "الطريق الولائية 101 عبر أوقاس"),
    reportedBy: "Police · Tichy",
    updated: "30/10/2026 · 08:40",
    status: "blocked",
  },
  {
    id: "rc3",
    name: LocalizedValue("CW12 · Iheddaden", "الطريق البلدية 12 · إحدادن"),
    kind: "road",
    reason: LocalizedValue("Dégagement terminé", "انتهت أعمال الإزالة"),
    alternate: LocalizedValue("—", "—"),
    reportedBy: "Protection civile",
    updated: "30/10/2026 · 08:05",
    status: "reopened",
    confirmedBy: "Commissaire T. Saidi",
  },
];

export type HealthFacility = {
  id: string;
  name: Localized;
  beds: number;
  occupied: number;
  emergencies: number;
  orientation: Localized;
};

/** Établissements de santé : capacités et orientation (BF10, RG05). */
export const HEALTH_FACILITIES: HealthFacility[] = [
  {
    id: "hf1",
    name: LocalizedValue("CHU Béjaïa", "المستشفى الجامعي ببجاية"),
    beds: 120,
    occupied: 94,
    emergencies: 18,
    orientation: LocalizedValue("Traumatologie · réanimation", "جراحة الرضوح · الإنعاش"),
  },
  {
    id: "hf2",
    name: LocalizedValue("EPH Akbou", "المؤسسة العمومية الاستشفائية أقبو"),
    beds: 60,
    occupied: 57,
    emergencies: 11,
    orientation: LocalizedValue("Urgences · chirurgie générale", "الاستعجالات · الجراحة العامة"),
  },
  {
    id: "hf3",
    name: LocalizedValue("EPH Tichy", "المؤسسة العمومية الاستشفائية تيشي"),
    beds: 40,
    occupied: 21,
    emergencies: 4,
    orientation: LocalizedValue("Médecine générale · pédiatrie", "الطب العام · طب الأطفال"),
  },
];

export type ForestSignal = {
  id: string;
  name: Localized;
  place: Localized;
  risk: "low" | "medium" | "high" | "critical";
  area: string;
  detected: string;
  status: "watching" | "proposed" | "validated";
};

export const FOREST_SIGNALS: ForestSignal[] = [
  {
    id: "f1",
    name: LocalizedValue("Fumée en lisière de Gouraya", "دخان على حدود قورايا"),
    place: LocalizedValue("Béjaïa · Gouraya", "بجاية · قورايا"),
    risk: "high",
    area: "12 ha",
    detected: "30/10/2026 · 07:55",
    status: "proposed",
  },
  {
    id: "f2",
    name: LocalizedValue("Sécheresse marquée · massif de Toudja", "جفاف واضح · غابة توجة"),
    place: LocalizedValue("Toudja", "توجة"),
    risk: "medium",
    area: "340 ha",
    detected: "29/10/2026 · 16:20",
    status: "watching",
  },
  {
    id: "f3",
    name: LocalizedValue("Piste d'accès dégradée · Akfadou", "مسار وصول متدهور · أكفادو"),
    place: LocalizedValue("Akfadou", "أكفادو"),
    risk: "low",
    area: "—",
    detected: "28/10/2026 · 11:10",
    status: "watching",
  },
];

export type ForestMean = {
  id: string;
  name: Localized;
  quantity: number;
  status: ResourceStatus;
};

export const FOREST_MEANS: ForestMean[] = [
  {
    id: "fm1",
    name: LocalizedValue("Camions-citernes", "صهاريج"),
    quantity: 3,
    status: "available",
  },
  {
    id: "fm2",
    name: LocalizedValue("Équipes de première intervention", "فرق التدخل الأول"),
    quantity: 18,
    status: "engaged",
  },
  {
    id: "fm3",
    name: LocalizedValue("Postes de vigie", "أبراج المراقبة"),
    quantity: 7,
    status: "available",
  },
];

export type WeatherAlert = {
  id: string;
  name: Localized;
  level: "low" | "medium" | "high" | "critical";
  zone: Localized;
  validity: string;
  status: "proposed" | "validated";
};

export const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: "w1",
    name: LocalizedValue("Pluies orageuses intenses", "أمطار عاصفية غزيرة"),
    level: "high",
    zone: LocalizedValue("Béjaïa et littoral", "بجاية والساحل"),
    validity: "30/10 · 06:00 → 31/10 · 06:00",
    status: "proposed",
  },
  {
    id: "w2",
    name: LocalizedValue("Vents forts sur les crêtes", "رياح قوية على القمم"),
    level: "medium",
    zone: LocalizedValue("Massifs de Béjaïa", "غابات بجاية"),
    validity: "30/10 · 12:00 → 30/10 · 22:00",
    status: "validated",
  },
];

/* ------------------------------------------------------------------ */
/* Victimes et moyens médicaux                                         */
/* ------------------------------------------------------------------ */

export type Triage = "absolute" | "relative" | "urgent" | "deceased";
export type VictimStatus = "waiting" | "treating" | "evacuated" | "hospitalized";

export type Victim = {
  id: string;
  name: string;
  age: number;
  triage: Triage;
  status: VictimStatus;
  hospital: Localized;
  team: Localized;
  updated: string;
};

export const VICTIMS: Victim[] = [
  {
    id: "p1",
    name: "A. Bensalem",
    age: 34,
    triage: "absolute",
    status: "treating",
    hospital: LocalizedValue("CHU Béjaïa", "المستشفى الجامعي ببجاية"),
    team: LocalizedValue("SAMU-12", "SAMU-12"),
    updated: "30/10/2026 · 09:42",
  },
  {
    id: "p2",
    name: "M. Ould Ali",
    age: 61,
    triage: "absolute",
    status: "evacuated",
    hospital: LocalizedValue("CHU Béjaïa", "المستشفى الجامعي ببجاية"),
    team: LocalizedValue("SAMU-12", "SAMU-12"),
    updated: "30/10/2026 · 09:35",
  },
  {
    id: "p3",
    name: "S. Haddad",
    age: 27,
    triage: "relative",
    status: "waiting",
    hospital: LocalizedValue("Poste médical avancé", "المركز الطبي المتقدم"),
    team: LocalizedValue("Équipe médicale mobile", "الفريق الطبي المتنقل"),
    updated: "30/10/2026 · 09:20",
  },
  {
    id: "p4",
    name: "R. Kaci",
    age: 45,
    triage: "urgent",
    status: "hospitalized",
    hospital: LocalizedValue("EPH Akbou", "المؤسسة العمومية الاستشفائية أقبو"),
    team: LocalizedValue("Ambulance SAMU-12", "إسعاف SAMU-12"),
    updated: "30/10/2026 · 08:55",
  },
  {
    id: "p5",
    name: "N. Cherif",
    age: 72,
    triage: "relative",
    status: "treating",
    hospital: LocalizedValue("Poste médical avancé", "المركز الطبي المتقدم"),
    team: LocalizedValue("Équipe médicale mobile", "الفريق الطبي المتنقل"),
    updated: "30/10/2026 · 08:40",
  },
];

export type Ambulance = {
  id: string;
  callSign: string;
  status: ResourceStatus;
  position: Localized;
  crew: string;
  victim: string;
};

export const AMBULANCES: Ambulance[] = [
  {
    id: "a1",
    callSign: "SAMU-12",
    status: "engaged",
    position: LocalizedValue("Akbou · RN26", "أقبو · الطريق الوطنية 26"),
    crew: "Dr S. Kaci · 2 infirmiers",
    victim: "A. Bensalem",
  },
  {
    id: "a2",
    callSign: "SAMU-07",
    status: "available",
    position: LocalizedValue("CHU Béjaïa", "المستشفى الجامعي ببجاية"),
    crew: "Dr L. Meziane · 1 infirmier",
    victim: "—",
  },
  {
    id: "a3",
    callSign: "PC-AMB-03",
    status: "maintenance",
    position: LocalizedValue("Parc engins", "حظيرة العربات"),
    crew: "—",
    victim: "—",
  },
];

/* ------------------------------------------------------------------ */
/* Évacuation                                                          */
/* ------------------------------------------------------------------ */

export type RouteStatus = "blocked" | "restricted" | "open";

export type EvacRoute = {
  id: string;
  name: Localized;
  status: RouteStatus;
  alternate: Localized;
  updated: string;
  confirmedBy?: string;
};

export const EVAC_ROUTES: EvacRoute[] = [
  {
    id: "rt1",
    name: LocalizedValue("RN26 · Akbou → Béjaïa", "الطريق الوطنية 26 · أقبو ← بجاية"),
    status: "blocked",
    alternate: LocalizedValue("RN74 via El Kseur", "الطريق الوطنية 74 عبر القصر"),
    updated: "30/10/2026 · 09:15",
  },
  {
    id: "rt2",
    name: LocalizedValue("RD101 · Tichy → Aokas", "الطريق الولائي 101 · تيشي ← أوقاس"),
    status: "restricted",
    alternate: LocalizedValue("Route communale n° 12", "الطريق البلدية رقم 12"),
    updated: "30/10/2026 · 08:50",
  },
  {
    id: "rt3",
    name: LocalizedValue("CW12 · Iheddaden → Salle omnisports", "الطريق البلدية 12 · إحدادن ← القاعة المتعددة الرياضات"),
    status: "open",
    alternate: LocalizedValue("—", "—"),
    updated: "30/10/2026 · 08:30",
    confirmedBy: "Commissaire T. Saidi",
  },
];

export type EvacZone = {
  id: string;
  name: Localized;
  capacity: number;
  occupancy: number;
  status: "open" | "full" | "standby";
};

export const EVAC_ZONES: EvacZone[] = [
  {
    id: "z1",
    name: LocalizedValue("Salle omnisports d'Akbou", "القاعة المتعددة الرياضات بأقبو"),
    capacity: 450,
    occupancy: 310,
    status: "open",
  },
  {
    id: "z2",
    name: LocalizedValue("CEM Iheddaden", "متوسطة إحدادن"),
    capacity: 200,
    occupancy: 198,
    status: "full",
  },
  {
    id: "z3",
    name: LocalizedValue("Centre culturel de Tichy", "المركز الثقافي بتيشي"),
    capacity: 150,
    occupancy: 0,
    status: "standby",
  },
];

export type Movement = {
  id: string;
  from: Localized;
  to: Localized;
  people: number;
  status: "planned" | "running" | "done";
  eta: string;
};

export const MOVEMENTS: Movement[] = [
  {
    id: "mv1",
    from: LocalizedValue("Iheddaden", "إحدادن"),
    to: LocalizedValue("Salle omnisports d'Akbou", "القاعة المتعددة الرياضات بأقبو"),
    people: 86,
    status: "running",
    eta: "10:05",
  },
  {
    id: "mv2",
    from: LocalizedValue("Akbou centre", "وسط أقبو"),
    to: LocalizedValue("CEM Iheddaden", "متوسطة إحدادن"),
    people: 42,
    status: "planned",
    eta: "10:40",
  },
  {
    id: "mv3",
    from: LocalizedValue("Tichy", "تيشي"),
    to: LocalizedValue("Centre culturel de Tichy", "المركز الثقافي بتيشي"),
    people: 28,
    status: "done",
    eta: "09:20",
  },
];

/* ------------------------------------------------------------------ */
/* PCO                                                                 */
/* ------------------------------------------------------------------ */

export type PcoRequest = {
  id: string;
  ref: string;
  subject: Localized;
  urgency: "high" | "medium";
  at: string;
  status: "pending" | "accepted";
};

export const PCO_REQUESTS: PcoRequest[] = [
  {
    id: "pcr1",
    ref: "PCO-2026-044",
    subject: LocalizedValue(
      "Renfort en embarcations pour la RN26",
      "تعزيز بقوارب للطريق الوطنية 26",
    ),
    urgency: "high",
    at: "30/10/2026 · 09:18",
    status: "pending",
  },
  {
    id: "pcr2",
    ref: "PCO-2026-043",
    subject: LocalizedValue(
      "Appui médical pour le poste avancé d'Akbou",
      "دعم طبي للمركز المتقدم بأقبو",
    ),
    urgency: "medium",
    at: "30/10/2026 · 08:50",
    status: "accepted",
  },
];

export const PCO_FEED: { at: string; text: Localized }[] = [
  {
    at: "09:45",
    text: LocalizedValue(
      "Le module secours signale trois véhicules immobilisés, deux équipes sur place.",
      "وحدة الإنقاذ تبلغ عن ثلاث مركبات عالقة وفريقين في المكان.",
    ),
  },
  {
    at: "09:30",
    text: LocalizedValue(
      "Le PCO demande la fermeture de la RN26 dans les deux sens.",
      "مركز القيادة يطلب إغلاق الطريق الوطنية 26 في الاتجاهين.",
    ),
  },
  {
    at: "09:12",
    text: LocalizedValue(
      "Le poste médical avancé est déclaré opérationnel.",
      "المركز الطبي المتقدم يُعلن جاهزاً.",
    ),
  },
  {
    at: "08:55",
    text: LocalizedValue(
      "Le wali est informé du dépassement de seuil à Akbou.",
      "تم إبلاغ الوالي بتجاوز العتبة في أقبو.",
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Engin                                                               */
/* ------------------------------------------------------------------ */

export type VehicleEquipment = {
  id: string;
  name: Localized;
  checked: boolean;
};

export const ENGIN_EQUIPMENT: VehicleEquipment[] = [
  {
    id: "ee1",
    name: LocalizedValue("Pompe haute pression", "مضخة عالية الضغط"),
    checked: true,
  },
  {
    id: "ee2",
    name: LocalizedValue("Tuyaux 2 × 20 m", "خراطيم 2 × 20 م"),
    checked: true,
  },
  {
    id: "ee3",
    name: LocalizedValue("Extincteurs portatifs", "طفايات محمولة"),
    checked: true,
  },
  {
    id: "ee4",
    name: LocalizedValue("Trousse de secours", "حقيبة إسعاف"),
    checked: false,
  },
  {
    id: "ee5",
    name: LocalizedValue("Balises et cônes", "إشارات وأقماع"),
    checked: true,
  },
];

/* ------------------------------------------------------------------ */
/* Simulations (autorité)                                              */
/* ------------------------------------------------------------------ */

export type Simulation = {
  id: string;
  date: string;
  scope: Localized;
  status: "done" | "planned" | "todo";
};

export const AUTHORITY_SIMULATIONS: Simulation[] = [
  {
    id: "s1",
    date: "12/03/2026",
    scope: LocalizedValue("Crue de la Soummam · Akbou", "فيضان سومام · أقبو"),
    status: "done",
  },
  {
    id: "s2",
    date: "18/06/2026",
    scope: LocalizedValue("Feu de forêt · Gouraya", "حريق غابة · قورايا"),
    status: "done",
  },
  {
    id: "s3",
    date: "22/11/2026",
    scope: LocalizedValue("Évacuation de masse · Béjaïa", "إخلاء واسع · بجاية"),
    status: "planned",
  },
];

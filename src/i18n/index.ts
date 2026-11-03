import { createContext, useContext } from "react";
import { ADMIN_AR, ADMIN_FR } from "./admin";
import { AUTHORITY_AR, AUTHORITY_FR } from "./authority";
import { CITIZEN_AR, CITIZEN_FR } from "./citizen";
import { CRISIS_AR, CRISIS_FR } from "./crisis";
import { MODULE_AR, MODULE_FR } from "./module";
import { NOTIF_AR, NOTIF_FR } from "./notifications";

export type Lang = "fr" | "ar";

export const STORAGE_KEY = "cadm-lang";

type Vars = Record<string, string | number>;

const fr: Record<string, string> = {
  "lang.choose": "Choisir la langue",
  "lang.label": "Langue",
  "lang.fr": "Français",
  "lang.ar": "Arabe",

  "common.close": "Fermer",
  "common.back": "Retour",
  "common.cancel": "Annuler",
  "common.save": "Enregistrer",
  "common.online": "En ligne",
  "common.offline": "Hors ligne",
  "offline.title": "Mode hors connexion",
  "offline.lead":
    "Les données du dernier chargement restent consultables et vos saisies sont conservées sur cet appareil jusqu'à la reconnexion.",
  "common.durationHM": "{hours} h {minutes}",
  "common.durationH": "{hours} h",
  "common.durationM": "{minutes} min",
  "common.source": "Source",
  "common.showMapZones": "Afficher la carte et les zones de sécurité",
  "common.viewDetail": "Voir le détail",
  "common.export": "Exporter",
  "common.exportCsv": "Exporter en CSV",
  "common.print": "Imprimer / PDF",
  "common.closePanel": "Fermer le panneau",
  "common.none": "Aucun",
  "common.all": "Tous",
  "common.unknown": "Inconnu",
  "common.required": "Champ obligatoire.",
  "common.confirm": "Confirmer",
  "common.delete": "Supprimer",
  "common.edit": "Modifier",
  "common.add": "Ajouter",
  "common.search": "Rechercher",
  "common.loading": "Chargement…",

  "nav.dashboard": "Tableau de bord",
  "nav.alerts": "Alertes",
  "nav.consignes": "Consignes",
  "nav.resources": "Abris & secours",
  "nav.assistant": "Assistant IA",
  "nav.assistantShort": "AI",
  "nav.closeAssistant": "Fermer l'assistant",
  "nav.events": "Événements",
  "nav.myReports": "Mes signalements",
  "nav.contacts": "Contacts",
  "nav.main": "Navigation principale",
  "nav.showSidebar": "Afficher le menu",
  "nav.hideSidebar": "Réduire le menu",
  "nav.openMenu": "Ouvrir le menu",
  "nav.closeMenu": "Fermer le menu",
  "nav.notFound": "Page introuvable",
  "nav.logout": "Se déconnecter",
  "nav.login": "Se connecter",

  "notFound.kicker": "Erreur 404",
  "notFound.lead": "La page demandée n'existe pas, a été déplacée ou l'adresse est incorrecte.",
  "notFound.home": "Retour à l'accueil",
  "notFound.citizen": "Connexion citoyen",
  "notFound.staff": "Connexion du personnel",

  "theme.toDark": "Activer le mode sombre",
  "theme.toLight": "Activer le mode clair",
  "theme.light": "Clair",
  "theme.dark": "Sombre",

  "severity.low": "Faible",
  "severity.medium": "Moyenne",
  "severity.high": "Élevée",
  "severity.critical": "Critique",
};

const ar: Record<string, string> = {
  "lang.choose": "اختر اللغة",
  "lang.label": "اللغة",
  "lang.fr": "الفرنسية",
  "lang.ar": "العربية",

  "common.close": "إغلاق",
  "common.back": "رجوع",
  "common.cancel": "إلغاء",
  "common.save": "حفظ",
  "common.online": "متصل",
  "common.offline": "غير متصل",
  "offline.title": "وضع عدم الاتصال",
  "offline.lead":
    "تبقى بيانات آخر تحميل قابلة للاطلاع، وتُحفظ إدخالاتكم على هذا الجهاز إلى حين عودة الاتصال.",
  "common.durationHM": "{hours} س {minutes} د",
  "common.durationH": "{hours} س",
  "common.durationM": "{minutes} د",
  "common.source": "المصدر",
  "common.showMapZones": "عرض الخريطة ومناطق السلامة",
  "common.viewDetail": "عرض التفاصيل",
  "common.export": "تصدير",
  "common.exportCsv": "تصدير بصيغة CSV",
  "common.print": "طباعة / PDF",
  "common.closePanel": "إغلاق اللوحة",
  "common.none": "لا شيء",
  "common.all": "الكل",
  "common.unknown": "غير معروف",
  "common.required": "حقل إلزامي.",
  "common.confirm": "تأكيد",
  "common.delete": "حذف",
  "common.edit": "تعديل",
  "common.add": "إضافة",
  "common.search": "بحث",
  "common.loading": "جارٍ التحميل…",

  "nav.dashboard": "لوحة التحكم",
  "nav.alerts": "التنبيهات",
  "nav.consignes": "الإرشادات",
  "nav.resources": "المآوي والإغاثة",
  "nav.assistant": "المساعد الذكي",
  "nav.assistantShort": "AI",
  "nav.closeAssistant": "إغلاق المساعد",
  "nav.events": "الفعاليات",
  "nav.myReports": "بلاغاتي",
  "nav.contacts": "جهات الاتصال",
  "nav.main": "التنقل الرئيسي",
  "nav.showSidebar": "إظهار القائمة",
  "nav.hideSidebar": "تقليص القائمة",
  "nav.openMenu": "فتح القائمة",
  "nav.closeMenu": "إغلاق القائمة",
  "nav.notFound": "الصفحة غير موجودة",
  "nav.logout": "تسجيل الخروج",
  "nav.login": "تسجيل الدخول",

  "notFound.kicker": "خطأ 404",
  "notFound.lead": "الصفحة المطلوبة غير موجودة أو تم نقلها أو أن العنوان غير صحيح.",
  "notFound.home": "العودة إلى الرئيسية",
  "notFound.citizen": "دخول المواطن",
  "notFound.staff": "دخول الموظفين",

  "theme.toDark": "تفعيل الوضع الداكن",
  "theme.toLight": "تفعيل الوضع الفاتح",
  "theme.light": "فاتح",
  "theme.dark": "داكن",

  "severity.low": "منخفضة",
  "severity.medium": "متوسطة",
  "severity.high": "مرتفعة",
  "severity.critical": "حرجة",
};

const dictionaries: Record<Lang, Record<string, string>> = {
  fr: {
    ...fr,
    ...CITIZEN_FR,
    ...CRISIS_FR,
    ...AUTHORITY_FR,
    ...MODULE_FR,
    ...ADMIN_FR,
    ...NOTIF_FR,
  },
  ar: {
    ...ar,
    ...CITIZEN_AR,
    ...CRISIS_AR,
    ...AUTHORITY_AR,
    ...MODULE_AR,
    ...ADMIN_AR,
    ...NOTIF_AR,
  },
};

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function getInitialLanguage(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "ar" || fromUrl === "fr") return fromUrl;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "fr") return saved;
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
  return "fr";
}

export function applyLanguage(lang: Lang): void {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  root.dataset.lang = lang;
}

export function translate(lang: Lang, key: string, vars?: Vars): string {
  const text = dictionaries[lang][key] ?? dictionaries.fr[key] ?? key;
  return interpolate(text, vars);
}

export function hasTranslation(lang: Lang, key: string): boolean {
  return key in dictionaries[lang];
}

export type I18nContextValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Vars) => string;
  tc: (text: string) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

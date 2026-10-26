import { useI18n } from "../i18n";

/**
 * Contenu éditorial de la landing, en français et en arabe.
 * La langue active reste gérée par le provider i18n global : ce fichier
 * ne fait que fournir les textes propres à la page publique.
 */
export const LANDING_COPY = {
  fr: {
    title: "CADM — L'information fiable, quand elle compte vraiment",
    skip: "Aller au contenu",
    call: "Appeler le 14",
    header: {
      home: "CADM, accueil",
      login: "Se connecter",
      report: "Signaler un incident",
    },
    hero: {
      eyebrow: "Prévention et alertes en Algérie",
      title: "Les bonnes informations, au bon moment.",
      lead: "Retrouvez les alertes, les consignes de sécurité et les informations utiles dans votre commune et votre wilaya.",
      searchPlaceholder: "Rechercher une commune ou une wilaya",
      search: "Rechercher",
      locating: "Localisation en cours…",
      locate: "Utiliser ma position",
      pause: "Mettre l'animation en pause",
      play: "Relancer l'animation",
      quick: [
        { label: "Que se passe-t-il ?", href: "#alerte" },
        { label: "Suis-je concerné ?", href: "#risques" },
        { label: "Que dois-je faire ?", href: "#sit" },
      ],
      emergency: {
        title: "En cas de danger immédiat",
        civil: "Protection civile",
        gendarmerie: "Gendarmerie nationale",
        note: "Si vous autorisez la géolocalisation lors d'un signalement, votre position pourra y être jointe pour aider les services à localiser l'incident. Un signalement en ligne ne remplace pas l'appel aux secours.",
        cta: "Envoyer un signalement",
      },
    },
    situation: {
      eyebrow: "Les bons gestes",
      title: "Avant, pendant et après une catastrophe",
      lead: "Découvrez les gestes à adopter à chaque étape pour mieux vous protéger et protéger vos proches.",
      tablistLabel: "Avant, pendant, après",
      tabs: ["Avant", "Pendant", "Après"],
      panels: [
        {
          title: "Se préparer",
          text: "Connaître les risques de sa commune, préparer un kit d'urgence, repérer les itinéraires et les lieux de mise à l'abri.",
          items: [
            { label: "Consulter les zones à risque de ma commune", to: "/resources" },
            { label: "Voir le plan d'évacuation de mon quartier", to: "/resources" },
            { label: "Consulter les consignes de sécurité", to: "/consignes" },
            {
              label: "Signaler une personne vulnérable à protéger",
              to: "/submit-alert",
              auth: true,
            },
            { label: "Créer un compte pour recevoir les alertes", to: "/register" },
          ],
        },
        {
          title: "Se protéger et signaler",
          text: "Suivre les consignes des autorités, éviter les zones dangereuses et appeler les secours en cas d'urgence.",
          items: [
            {
              label: "Signaler un incident avec une photo, ma position et une description",
              to: "/submit-alert",
              auth: true,
            },
            {
              label: "Trouver l'abri ou l'établissement de santé le plus proche",
              to: "/resources",
            },
            { label: "Consulter les alertes et communiqués officiels", to: "/alerts" },
            { label: "Suivre l'état de mon signalement", tracking: true },
          ],
        },
        {
          title: "Agir avec prudence",
          text: "Éviter les zones sinistrées, signaler les dangers persistants et suivre les consignes avant de rentrer chez soi.",
          items: [
            { label: "Déclarer les dégâts de mon logement", to: "/submit-alert", auth: true },
            {
              label: "Signaler une personne disparue ou rechercher un proche",
              to: "/submit-alert",
              auth: true,
            },
            { label: "Trouver un hébergement d'urgence", to: "/resources" },
            {
              label: "Devenir bénévole et consulter les missions disponibles",
              to: "/contacts",
            },
            { label: "Faire un don", to: "/contacts" },
          ],
        },
      ],
    },
    risks: {
      eyebrow: "Consignes de sécurité",
      title: "Que faire en cas de catastrophe ?",
      lead: "Séisme, inondation, incendie… Consultez les consignes à suivre pour savoir comment vous protéger et protéger vos proches.",
      items: [
        "Séisme",
        "Inondation",
        "Incendie de forêt",
        "Glissement de terrain",
        "Canicule",
        "Vents violents et tempêtes de sable",
        "Vague de froid",
        "Accident industriel",
      ],
      allLabel: "Tous",
      allText: "Voir tous les risques et les consignes de sécurité",
    },
    alerts: {
      eyebrow: "Comprendre les alertes",
      title: "Une alerte, des informations claires",
      lead: "Chaque alerte présente les mêmes informations essentielles pour vous permettre de comprendre rapidement la situation et de savoir quoi faire.",
      card: {
        tag: "Niveau orange",
        fictional: "Exemple fictif · démonstration",
        title: "Alerte orange : risque d'incendie de forêt",
        byLabel: "Émise par :",
        byValue: "Cellule de crise de la wilaya (exemple)",
        zoneLabel: "Zone concernée",
        zoneValue: "Secteur forestier d'exemple",
        validLabel: "Valable jusqu'au",
        validValue: "14 août, 20 h (exemple)",
        instructions: [
          "Évitez les zones boisées concernées par l'alerte.",
          "N'allumez pas de feu en plein air.",
          "Si vous apercevez un départ de feu, éloignez-vous et alertez les secours.",
          "En cas d'ordre d'évacuation, suivez les indications des autorités.",
        ],
        link: "Voir les abris ouverts et l'itinéraire d'évacuation",
        caption: "Exemple fictif présenté à titre d'illustration, sans valeur opérationnelle.",
      },
      levels: ["Jaune", "Orange", "Rouge"],
      steps: [
        {
          title: "Niveau de vigilance",
          text: "La couleur permet d'identifier rapidement le niveau de vigilance.",
          levels: true,
        },
        {
          title: "Source de l'alerte",
          text: "L'autorité à l'origine de l'alerte est clairement indiquée.",
        },
        {
          title: "Zone et durée",
          text: "Vous savez où l'alerte s'applique et jusqu'à quand elle est valable.",
        },
        {
          title: "Les consignes",
          text: "Les actions à suivre sont présentées simplement, par ordre de priorité.",
        },
        {
          title: "Où aller",
          text: "Lorsque c'est nécessaire, les abris et les itinéraires sont accessibles depuis la carte.",
        },
      ],
    },
    tracking: {
      eyebrow: "Suivi des signalements",
      title: "Que devient votre signalement ?",
      lead: "Chaque signalement peut être suivi depuis son enregistrement jusqu'à sa clôture. Consultez les étapes de son traitement pour savoir où en est votre demande.",
      steps: [
        ["Reçu", "Votre signalement a été enregistré."],
        ["En cours de vérification", "Les informations sont en cours d'examen."],
        ["Équipe mobilisée", "Une équipe a été envoyée sur les lieux."],
        ["Intervention en cours", "Les équipes interviennent sur place."],
        ["Clôturé", "Le traitement du signalement est terminé."],
      ],
      report: "Signaler un incident",
      follow: "Suivre mon signalement",
    },
    sources: {
      eyebrow: "Sources et responsabilité",
      title: "Des informations claires, des décisions humaines",
      columns: [
        {
          number: "01",
          title: "Pourquoi CADM ?",
          paragraphs: [
            "L'Algérie est exposée à plusieurs risques naturels et technologiques. CADM facilite l'accès aux informations sur les risques et vise à améliorer la transmission des signalements entre les citoyens et les services concernés.",
          ],
        },
        {
          number: "02",
          title: "Le cadre réglementaire",
          paragraphs: [
            "CADM est conçu en tenant compte de la réglementation algérienne relative à la prévention des risques de catastrophes et à la protection des données personnelles.",
          ],
        },
        {
          number: "03",
          title: "Le rôle de l'intelligence artificielle",
          paragraphs: [
            "L'intelligence artificielle peut aider à analyser les signalements et à repérer les informations qui nécessitent une attention particulière.",
            "Les informations importantes doivent être vérifiées par les personnes habilitées.",
          ],
        },
      ],
      quote: "Les décisions concernant les alertes et les interventions restent du ressort des services compétents.",
    },
    footer: {
      tagline: "L'information fiable, quand elle compte vraiment.",
      emergencyTitle: "En cas de danger immédiat",
      civil: "Protection civile",
      gendarmerie: "Gendarmerie nationale",
      citizens: "Citoyens",
      riskMap: "Carte des risques",
      consignes: "Consignes",
      report: "Signaler un incident",
      account: "Compte",
      login: "Se connecter",
      register: "Créer un compte",
      resp: "Espace responsable",
      info: "Informations",
      about: "À propos",
      sources: "Sources",
      privacy: "Confidentialité",
      copy: "© 2026 CADM · Pensé pour les citoyens en Algérie",
    },
    modals: {
      close: "Fermer",
      auth: {
        eyebrow: "Accès citoyen",
        title: "Connectez-vous pour signaler un incident",
        text: "Le signalement est réservé aux membres connectés : c'est ce qui permet à nos équipes de vous recontacter et de vous informer du traitement de votre demande. La création du compte est gratuite.",
        login: "Se connecter",
        register: "Créer un compte",
        noteBefore: "En cas de danger immédiat, appelez la Protection civile au",
        noteAfter: ".",
      },
      privacy: {
        eyebrow: "Informations",
        title: "Confidentialité",
        paragraphs: [
          "CADM collecte uniquement les informations nécessaires au traitement des signalements : description, localisation et coordonnées que vous choisissez de fournir.",
        ],
        bullets: [
          "Vos données ne sont pas utilisées à des fins commerciales.",
          "Elles sont accessibles aux services habilités et conservées le temps nécessaire au traitement du signalement.",
          "Vous pouvez demander l'accès, la rectification ou la suppression de vos données depuis votre espace citoyen.",
        ],
        note: "Version de démonstration : les informations de session restent dans votre navigateur et ne sont transmises à aucun serveur.",
        contact: "Nous contacter",
      },
      tracking: {
        eyebrow: "Suivi des signalements",
        title: "Suivre mon signalement",
        paragraphs: [
          "Le suivi détaillé de votre signalement est disponible dans votre espace citoyen : vous y retrouvez sa référence, les étapes de son traitement et les messages des équipes.",
        ],
        bullets: [
          "La référence reçue lors de l'envoi de votre signalement.",
          "L'état d'avancement, de la réception à la clôture.",
          "Les informations transmises par les services concernés.",
        ],
        open: "Ouvrir mes signalements",
        login: "Se connecter",
        register: "Créer un compte",
        note: "Version de démonstration : le suivi détaillé sera activé avec le raccordement aux services. En cas de danger immédiat, appelez la Protection civile au 14.",
      },
    },
  },
  ar: {
    title: "CADM — معلومات موثوقة، عندما تكون في أمسّ الحاجة إليها",
    skip: "الانتقال إلى المحتوى",
    call: "اتصل بالرقم 14",
    header: {
      home: "CADM، الصفحة الرئيسية",
      login: "تسجيل الدخول",
      report: "الإبلاغ عن حادث",
    },
    hero: {
      eyebrow: "الوقاية والتنبيهات في الجزائر",
      title: "المعلومات الصحيحة، في الوقت المناسب.",
      lead: "اطّلع على التنبيهات وتعليمات السلامة والمعلومات المفيدة في بلديتك وولايتك.",
      searchPlaceholder: "ابحث عن بلدية أو ولاية",
      search: "بحث",
      locating: "جارٍ تحديد الموقع…",
      locate: "استخدام موقعي",
      pause: "إيقاف الحركة مؤقتًا",
      play: "إعادة تشغيل الحركة",
      quick: [
        { label: "ماذا يحدث؟", href: "#alerte" },
        { label: "هل أنا معني؟", href: "#risques" },
        { label: "ماذا يجب أن أفعل؟", href: "#sit" },
      ],
      emergency: {
        title: "في حالة خطر وشيك",
        civil: "الحماية المدنية",
        gendarmerie: "الدرك الوطني",
        note: "إذا سمحت بتحديد الموقع أثناء الإبلاغ، يمكن إرفاق موقعك لمساعدة المصالح على تحديد الحادث. الإبلاغ عبر الإنترنت لا يعوّض الاتصال بالطوارئ.",
        cta: "إرسال بلاغ",
      },
    },
    situation: {
      eyebrow: "السلوكيات الصحيحة",
      title: "قبل وأثناء وبعد الكارثة",
      lead: "اكتشف الإجراءات الواجب اتباعها في كل مرحلة لحماية نفسك وأحبائك بشكل أفضل.",
      tablistLabel: "قبل، أثناء، بعد",
      tabs: ["قبل", "أثناء", "بعد"],
      panels: [
        {
          title: "الاستعداد",
          text: "معرفة مخاطر البلدية، وإعداد حقيبة طوارئ، وتحديد المسارات وأماكن الإيواء.",
          items: [
            { label: "الاطلاع على مناطق الخطر في بلديتي", to: "/resources" },
            { label: "عرض خطة إخلاء حيّي", to: "/resources" },
            { label: "الاطلاع على تعليمات السلامة", to: "/consignes" },
            {
              label: "الإبلاغ عن شخص هشّ يحتاج إلى حماية",
              to: "/submit-alert",
              auth: true,
            },
            { label: "إنشاء حساب لتلقي التنبيهات", to: "/register" },
          ],
        },
        {
          title: "الحماية والإبلاغ",
          text: "اتباع تعليمات السلطات، وتجنب المناطق الخطرة، والاتصال بالطوارئ عند الحاجة.",
          items: [
            {
              label: "الإبلاغ عن حادث مع صورة وموقعي ووصف",
              to: "/submit-alert",
              auth: true,
            },
            {
              label: "العثور على أقرب مأوى أو مؤسسة صحية",
              to: "/resources",
            },
            { label: "الاطلاع على التنبيهات والبيانات الرسمية", to: "/alerts" },
            { label: "متابعة حالة بلاغي", tracking: true },
          ],
        },
        {
          title: "التصرف بحذر",
          text: "تجنب المناطق المنكوبة، والإبلاغ عن المخاطر المستمرة، واتباع التعليمات قبل العودة إلى المنزل.",
          items: [
            { label: "الإبلاغ عن أضرار مسكني", to: "/submit-alert", auth: true },
            {
              label: "الإبلاغ عن شخص مفقود أو البحث عن قريب",
              to: "/submit-alert",
              auth: true,
            },
            { label: "العثور على إيواء طارئ", to: "/resources" },
            {
              label: "التطوع والاطلاع على المهام المتاحة",
              to: "/contacts",
            },
            { label: "التبرع", to: "/contacts" },
          ],
        },
      ],
    },
    risks: {
      eyebrow: "تعليمات السلامة",
      title: "ماذا تفعل في حالة كارثة؟",
      lead: "زلزال، فيضان، حريق… اطّلع على التعليمات الواجب اتباعها لمعرفة كيفية حماية نفسك وأحبائك.",
      items: [
        "زلزال",
        "فيضان",
        "حريق غابة",
        "انزلاق أرضي",
        "موجة حر",
        "رياح قوية وعواصف رملية",
        "موجة برد",
        "حادث صناعي",
      ],
      allLabel: "الكل",
      allText: "عرض جميع المخاطر وتعليمات السلامة",
    },
    alerts: {
      eyebrow: "فهم التنبيهات",
      title: "تنبيه واحد، معلومات واضحة",
      lead: "كل تنبيه يعرض المعلومات الأساسية نفسها لمساعدتك على فهم الوضع بسرعة ومعرفة ما يجب فعله.",
      card: {
        tag: "المستوى البرتقالي",
        fictional: "مثال افتراضي · عرض توضيحي",
        title: "تنبيه برتقالي: خطر حريق غابة",
        byLabel: "صادر عن:",
        byValue: "خلية أزمة الولاية (مثال)",
        zoneLabel: "المنطقة المعنية",
        zoneValue: "قطاع غابي تجريبي",
        validLabel: "صالح حتى",
        validValue: "14 غشت، الساعة 20:00 (مثال)",
        instructions: [
          "تجنّب المناطق الغابية المشمولة بالتنبيه.",
          "لا تُشعل النار في الهواء الطلق.",
          "إذا لاحظت اندلاع حريق، ابتعد عن المكان وأبلغ الطوارئ.",
          "في حال صدور أمر بالإخلاء، اتبع تعليمات السلطات.",
        ],
        link: "عرض الملاجئ المفتوحة ومسار الإخلاء",
        caption: "مثال افتراضي معروض للتوضيح فقط، دون قيمة عملياتية.",
      },
      levels: ["أصفر", "برتقالي", "أحمر"],
      steps: [
        {
          title: "مستوى اليقظة",
          text: "يتيح اللون تحديد مستوى اليقظة بسرعة.",
          levels: true,
        },
        {
          title: "مصدر التنبيه",
          text: "السلطة التي أصدرت التنبيه مذكورة بوضوح.",
        },
        {
          title: "المنطقة والمدة",
          text: "تعرف أين ينطبق التنبيه وإلى متى يكون ساريًا.",
        },
        {
          title: "التعليمات",
          text: "الإجراءات الواجب اتباعها معروضة ببساطة حسب الأولوية.",
        },
        {
          title: "إلى أين تذهب",
          text: "عند الحاجة، يمكن الوصول إلى الملاجئ والمسارات من الخريطة.",
        },
      ],
    },
    tracking: {
      eyebrow: "متابعة البلاغات",
      title: "ماذا يحدث لبلاغك؟",
      lead: "يمكن متابعة كل بلاغ من لحظة تسجيله حتى إغلاقه. اطّلع على مراحل معالجته لمعرفة أين وصل طلبك.",
      steps: [
        ["تم الاستلام", "تم تسجيل بلاغك."],
        ["قيد التحقق", "يجري فحص المعلومات."],
        ["تم تعبئة فريق", "أُرسل فريق إلى عين المكان."],
        ["التدخل جارٍ", "تتدخل الفرق في المكان."],
        ["مغلق", "انتهت معالجة البلاغ."],
      ],
      report: "الإبلاغ عن حادث",
      follow: "متابعة بلاغي",
    },
    sources: {
      eyebrow: "المصادر والمسؤولية",
      title: "معلومات واضحة، قرارات بشرية",
      columns: [
        {
          number: "01",
          title: "لماذا CADM؟",
          paragraphs: [
            "الجزائر معرّضة لعدة مخاطر طبيعية وتكنولوجية. تسهّل CADM الوصول إلى معلومات المخاطر وتهدف إلى تحسين نقل البلاغات بين المواطنين والمصالح المعنية.",
          ],
        },
        {
          number: "02",
          title: "الإطار التنظيمي",
          paragraphs: [
            "صُمّمت CADM مع مراعاة التشريع الجزائري المتعلق بالوقاية من مخاطر الكوارث وحماية المعطيات الشخصية.",
          ],
        },
        {
          number: "03",
          title: "دور الذكاء الاصطناعي",
          paragraphs: [
            "يمكن للذكاء الاصطناعي المساعدة في تحليل البلاغات وتحديد المعلومات التي تتطلب اهتمامًا خاصًا.",
            "يجب التحقق من المعلومات المهمة من قبل الأشخاص المخوّلين.",
          ],
        },
      ],
      quote: "تبقى القرارات المتعلقة بالتنبيهات والتدخلات من اختصاص المصالح المختصة.",
    },
    footer: {
      tagline: "المعلومات الموثوقة، عندما تكون في أمسّ الحاجة إليها.",
      emergencyTitle: "في حالة خطر وشيك",
      civil: "الحماية المدنية",
      gendarmerie: "الدرك الوطني",
      citizens: "المواطنون",
      riskMap: "خريطة المخاطر",
      consignes: "التعليمات",
      report: "الإبلاغ عن حادث",
      account: "الحساب",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      resp: "فضاء المسؤول",
      info: "معلومات",
      about: "حول المنصة",
      sources: "المصادر",
      privacy: "الخصوصية",
      copy: "© 2026 CADM · مصمّم للمواطنين في الجزائر",
    },
    modals: {
      close: "إغلاق",
      auth: {
        eyebrow: "وصول المواطن",
        title: "سجّل الدخول للإبلاغ عن حادث",
        text: "الإبلاغ مخصص للأعضاء المسجلين: فهو يتيح لفرقنا التواصل معك وإبلاغك بمعالجة طلبك. إنشاء الحساب مجاني.",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        noteBefore: "في حالة خطر وشيك، اتصل بالحماية المدنية على الرقم",
        noteAfter: ".",
      },
      privacy: {
        eyebrow: "معلومات",
        title: "الخصوصية",
        paragraphs: [
          "تجمع CADM فقط المعلومات اللازمة لمعالجة البلاغات: الوصف والموقع وبيانات الاتصال التي تختار تقديمها.",
        ],
        bullets: [
          "لا تُستخدم بياناتك لأغراض تجارية.",
          "يمكن للمصالح المخوّلة الوصول إليها، وتُحفظ للمدة اللازمة لمعالجة البلاغ.",
          "يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها من فضائك كمواطن.",
        ],
        note: "نسخة تجريبية: تبقى معلومات الجلسة في متصفحك ولا تُرسل إلى أي خادم.",
        contact: "اتصل بنا",
      },
      tracking: {
        eyebrow: "متابعة البلاغات",
        title: "متابعة بلاغي",
        paragraphs: [
          "المتابعة التفصيلية لبلاغك متاحة في فضائك كمواطن: تجد فيها مرجعه ومراحل معالجته ورسائل الفرق.",
        ],
        bullets: [
          "المرجع الذي تلقيته عند إرسال بلاغك.",
          "حالة التقدم، من الاستلام إلى الإغلاق.",
          "المعلومات التي أرسلتها المصالح المعنية.",
        ],
        open: "فتح بلاغاتي",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        note: "نسخة تجريبية: ستُفعّل المتابعة التفصيلية عند الربط بالمصالح. في حالة خطر وشيك، اتصل بالحماية المدنية على الرقم 14.",
      },
    },
  },
};

export function useLandingCopy() {
  const { lang } = useI18n();
  return LANDING_COPY[lang] ?? LANDING_COPY.fr;
}

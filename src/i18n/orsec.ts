// Textes de l'interface — orsec (généré par découpage de i18n/index.ts).

export const ORSEC_FR: Record<string, string> = {
  "orsec.level.switchLabel": "Niveau du plan",
  "orsec.level.commune": "Plan communal",
  "orsec.level.wilaya": "Plan de wilaya",
  "orsec.level.national": "Plan national",
  "orsec.level.site": "Plan du site",
  "orsec.level.communeScope": "Commune de Béjaïa",
  "orsec.level.wilayaScope": "Wilaya de Béjaïa",
  "orsec.level.nationalScope": "Territoire national",
  "orsec.level.siteScope": "Complexe industriel d'Arzew",

  "orsec.status.draft": "Saisi",
  "orsec.status.pending": "En attente d'approbation",
  "orsec.status.approved": "Approuvé",
  "orsec.status.alert": "En état d'alerte",
  "orsec.status.active": "Déclenché",
  "orsec.status.notRequired": "Non requis",
  "orsec.status.notApplicable": "Non applicable",

  "orsec.statusShort.draft": "Saisi",
  "orsec.statusShort.pending": "En attente",
  "orsec.statusShort.approved": "Approuvé",
  "orsec.statusShort.alert": "Alerte",
  "orsec.statusShort.active": "Déclenché",

  "orsec.step.label": "Cycle de vie du plan ORSEC",
  "orsec.step.draft": "Saisi",
  "orsec.step.approved": "Approuvé",
  "orsec.step.alert": "Alerte",
  "orsec.step.active": "Déclenché",
  "orsec.step.lifted": "Levé",

  "orsec.phase.urgence": "Urgence",
  "orsec.phase.evaluation": "Évaluation et contrôle",
  "orsec.phase.rehabilitation": "Réhabilitation",

  "orsec.action.approve": "Approuver le plan",
  "orsec.action.setAlert": "Mettre en état d'alerte",
  "orsec.action.activate": "Déclencher le plan",
  "orsec.action.changePhase": "Changer de phase",
  "orsec.action.lift": "Lever le plan",
  "orsec.action.designate": "Désigner",
  "orsec.action.reassign": "Remplacer",
  "orsec.action.cancel": "Annuler",

  "orsec.lifecycle.title": "Cycle de vie",
  "orsec.lifecycle.lead":
    "Saisi, approuvé, alerté, déclenché puis levé (RG-O13, RG-O14).",

  "orsec.hint.draft":
    "Le plan est en cours de rédaction : il doit être approuvé avant tout déclenchement.",
  "orsec.hint.pending":
    "Le plan est saisi mais n'est pas encore approuvé : il ne peut pas être déclenché (RG-O14).",
  "orsec.hint.approved":
    "Plan approuvé : il peut être mis en état d'alerte ou déclenché par l'autorité compétente.",
  "orsec.hint.alert":
    "Plan en état d'alerte : les modules concernés sont prévenus, le déclenchement reste à décider.",
  "orsec.hint.active":
    "Plan déclenché : le PCF et le PCO sont ouverts et les modules engagés sont consignés.",
  "orsec.hint.activeNoPosts":
    "Plan déclenché : les modules engagés sont consignés et les autorités informées ; ce niveau n'ouvre ni PCF ni PCO.",
  "orsec.hint.lifted":
    "Plan levé : le rapport détaillé est créé et reste à compléter puis à transmettre (RG-O07).",
  "orsec.hint.nationalReady":
    "Plan national : il agrège les plans des wilayas et peut être mis en état d'alerte ou déclenché par le ministre de l'Intérieur (RG-O01).",

  "orsec.fact.reference": "Référence",
  "orsec.fact.version": "Version",
  "orsec.fact.scope": "Périmètre",
  "orsec.fact.approvedBy": "Approuvé par",
  "orsec.fact.approvedAt": "Date d'approbation",
  "orsec.fact.posts": "PCF / PCO",
  "orsec.fact.postsOpen": "Ouverts",
  "orsec.fact.postsClosed": "Fermés",
  "orsec.fact.revision": "Prochaine révision",
  "orsec.fact.revisionBadge": "RG-O11",
  "orsec.fact.phase": "Phase",
  "orsec.fact.decidedBy": "Décision de",
  "orsec.fact.incidents": "Incidents concernés",

  "orsec.modules.count": "{count} / {total} modules désignés",
  "orsec.modules.missing":
    "{count} module(s) sans responsable seront signalés à l'autorité (RG-O04).",
  "orsec.modules.missingShort": "{count} sans responsable",
  "orsec.modules.allDesignated": "Tous désignés",
  "orsec.modules.noOwner": "Responsable non désigné",
  "orsec.modules.engaged": "Engagé",
  "orsec.modules.nationalNotice":
    "Le plan national regroupe les plans des wilayas : la désignation des modules se fait au niveau de chaque wilaya (art. 5).",
  "orsec.modules.history": "Désignations précédentes",
  "orsec.modules.noHistory":
    "Aucune désignation enregistrée pour ce module.",

  "orsec.readiness.ready": "Prêt",
  "orsec.readiness.partial": "Partiel",
  "orsec.readiness.missing": "À compléter",

  "orsec.approve.title": "Approuver le plan",
  "orsec.approve.lead":
    "L'approbation rend le plan utilisable. Elle est enregistrée avec son auteur et sa date.",
  "orsec.approve.rule":
    "RG-O14 : un plan n'est utilisable qu'après son approbation par le wali ou le président de l'APC. Le plan national n'a pas d'approbation propre.",
  "orsec.approve.confirm": "Approuver et enregistrer",

  "orsec.alert.title": "Mettre le plan en état d'alerte",
  "orsec.alert.lead":
    "L'état d'alerte prévient les autorités et les modules concernés, sans encore engager les secours.",
  "orsec.alert.rule":
    "RG-O02 : la mise en état d'alerte et le déclenchement notifient les autorités prévues par le décret ; pour un plan de wilaya, le ministre de l'Intérieur est notifié dès la mise en état d'alerte.",
  "orsec.alert.confirm": "Mettre en état d'alerte",

  "orsec.activate.title": "Déclencher le plan ORSEC",
  "orsec.activate.lead":
    "Le déclenchement ouvre les postes de commandement prévus et notifie les autorités.",
  "orsec.activate.reason": "Motif du déclenchement",
  "orsec.activate.reason.occurrence": "Survenance de la catastrophe",
  "orsec.activate.reason.insufficient": "Moyens insuffisants",
  "orsec.activate.reason.complementary": "Moyens complémentaires",
  "orsec.activate.incidents": "Incidents concernés",
  "orsec.activate.incidentsHint":
    "Sélectionnez au moins un incident à l'origine du déclenchement.",
  "orsec.activate.modules": "Modules concernés",
  "orsec.activate.modulesCount": "{count} / {total} sélectionnés",
  "orsec.activate.modulesHint":
    "Seuls les responsables des modules choisis sont prévenus (RG-O17).",
  "orsec.activate.recipients": "Autorités informées",
  "orsec.activate.posts":
    "Le PCF (dirigé par l'autorité) et le PCO (dirigé par la Protection civile) seront ouverts (RG-O03).",
  "orsec.activate.confirm": "Confirmer le déclenchement",
  "orsec.activate.errorIncidents": "Sélectionnez au moins un incident.",
  "orsec.activate.errorModules": "Sélectionnez au moins un module.",

  "orsec.lift.title": "Lever le plan ORSEC",
  "orsec.lift.lead":
    "La levée ferme les postes de commandement et met fin aux désignations de l'activation.",
  "orsec.lift.startedAt": "Déclenché le",
  "orsec.lift.engaged": "Modules engagés",
  "orsec.lift.engagedValue": "{count} module(s)",
  "orsec.lift.pending":
    "1 demande de renfort est encore en attente : elle sera signalée avant la levée (UC-04, 1a).",
  "orsec.lift.reportNotice":
    "Un rapport détaillé « à compléter » sera créé et adressé au destinataire prévu (RG-O07).",
  "orsec.lift.confirm": "Confirmer la levée",

  "orsec.phase.title": "Changer de phase",
  "orsec.phase.lead":
    "Les phases d'une activation sont enregistrées et datées (RG-O13).",
  "orsec.phase.label": "Nouvelle phase",
  "orsec.phase.confirm": "Enregistrer la phase",

  "orsec.designate.title": "Désigner un responsable de module",
  "orsec.designate.lead":
    "Le responsable de module est en général le directeur de l'organisme concerné (art. 43).",
  "orsec.designate.endNotice":
    "La désignation de {name} (depuis le {date}) prendra fin et la nouvelle commencera immédiatement.",
  "orsec.designate.person": "Utilisateur désigné",
  "orsec.designate.choose": "Choisir un utilisateur",
  "orsec.designate.territory":
    "Seuls les utilisateurs rattachés au territoire du plan peuvent être désignés (RG-O09).",
  "orsec.designate.confirm": "Enregistrer la désignation",
  "orsec.designate.error": "Choisissez un utilisateur.",

  "orsec.report.title": "Rapports détaillés",
  "orsec.report.lead":
    "Créés à la levée du plan, ils restent « à compléter » jusqu'à leur transmission (RG-O07).",
  "orsec.report.count": "{count} rapport(s)",
  "orsec.report.empty":
    "Aucun rapport : il sera créé automatiquement à la levée du plan.",
  "orsec.report.created": "Créé le {date}",
  "orsec.report.send": "Transmettre",
  "orsec.report.statBadge": "À transmettre",
  "orsec.report.allSent": "Aucun en attente",
  "orsec.report.status.draft": "À compléter",
  "orsec.report.status.sent": "Transmis",

  "orsec.log.title": "Journal du plan",
  "orsec.log.lead": "5 dernières actions",
  "orsec.log.created": "Plan saisi",
  "orsec.log.submitted": "Plan transmis pour approbation",
  "orsec.log.approved": "Plan approuvé",
  "orsec.log.alertSet": "Plan mis en état d'alerte",
  "orsec.log.activated": "Plan déclenché",
  "orsec.log.phaseChanged": "Phase modifiée",
  "orsec.log.lifted": "Plan levé · rapport créé",
  "orsec.log.designated": "Responsable de module désigné",
  "orsec.log.reportSent": "Rapport détaillé transmis",

  "orsec.recipient.minister": "Ministre de l'Intérieur",
  "orsec.recipient.wali": "Wali",
  "orsec.recipient.apc": "Président de l'APC",
  "orsec.recipient.pc": "Protection civile",
  "orsec.recipient.limitrophes": "Walis limitrophes (proposition)",
  "orsec.recipient.walis": "Walis des wilayas concernées",

  "orsec.incident.forest": "Incendie de forêt",
  "orsec.incident.flood": "Inondation",
  "orsec.incident.quake": "Séisme",
  "orsec.incident.landslide": "Glissement de terrain",
  "orsec.incident.gas": "Fuite de gaz",

  "orsec.module.securite": "Sécurité et ordre public",
  "orsec.module.secours": "Secours, sauvetage et évacuation",
  "orsec.module.sante": "Prise en charge hospitalière",
  "orsec.module.materiaux": "Matériels et équipements divers",
  "orsec.module.communication": "Communication et information",
  "orsec.module.travaux": "Travaux publics",
  "orsec.module.telecom": "Liaisons et télécommunications",
  "orsec.module.transports": "Transports",
  "orsec.module.humanitaire": "Solidarité, action humanitaire",
  "orsec.module.energie": "Énergie",
  "orsec.module.eau": "Alimentation en eau potable",
  "orsec.module.hebergement": "Hébergement provisoire",
  "orsec.module.expertises": "Expertises, évaluations et bilans",

  "orsec.moduleOrg.securite": "Police · Gendarmerie",
  "orsec.moduleOrg.secours": "Protection civile",
  "orsec.moduleOrg.sante": "Santé",
  "orsec.moduleOrg.materiaux": "Agents d'organismes",
  "orsec.moduleOrg.communication": "Communication",
  "orsec.moduleOrg.travaux": "Travaux publics",
  "orsec.moduleOrg.telecom": "Télécommunications",
  "orsec.moduleOrg.transports": "Transports",
  "orsec.moduleOrg.humanitaire": "Action humanitaire",
  "orsec.moduleOrg.energie": "Énergie",
  "orsec.moduleOrg.eau": "Eau",
  "orsec.moduleOrg.hebergement": "Éducation · APC",
  "orsec.moduleOrg.expertises": "Expertises et bilans",

  "orsec.org.protectionCivile": "Protection civile",
  "orsec.org.gendarmerie": "Gendarmerie nationale",
  "orsec.org.police": "Police",
  "orsec.org.sante": "Direction de la santé",
  "orsec.org.materiaux": "Direction des moyens",
  "orsec.org.communication": "Direction de la communication",
  "orsec.org.travauxPublics": "Travaux publics",
  "orsec.org.telecom": "Télécommunications",
  "orsec.org.transports": "Direction des transports",
  "orsec.org.humanitaire": "Croissant-Rouge algérien",
  "orsec.org.energie": "Direction de l'énergie",
  "orsec.org.eau": "Direction de l'eau",
  "orsec.org.education": "Direction de l'éducation",
  "orsec.org.expertises": "Expertises et bilans",

};

export const ORSEC_AR: Record<string, string> = {
  "orsec.level.switchLabel": "مستوى المخطط",
  "orsec.level.commune": "المخطط البلدي",
  "orsec.level.wilaya": "المخطط الولائي",
  "orsec.level.national": "المخطط الوطني",
  "orsec.level.site": "مخطط الموقع",
  "orsec.level.communeScope": "بلدية بجاية",
  "orsec.level.wilayaScope": "ولاية بجاية",
  "orsec.level.nationalScope": "التراب الوطني",
  "orsec.level.siteScope": "المركب الصناعي بأرزيو",

  "orsec.status.draft": "مُحرَّر",
  "orsec.status.pending": "في انتظار المصادقة",
  "orsec.status.approved": "مُصادق عليه",
  "orsec.status.alert": "في حالة تأهب",
  "orsec.status.active": "مُفعَّل",
  "orsec.status.notRequired": "غير مطلوب",
  "orsec.status.notApplicable": "لا ينطبق",

  "orsec.statusShort.draft": "مُحرَّر",
  "orsec.statusShort.pending": "قيد الانتظار",
  "orsec.statusShort.approved": "مُصادق",
  "orsec.statusShort.alert": "تأهب",
  "orsec.statusShort.active": "مُفعَّل",

  "orsec.step.label": "دورة حياة مخطط ORSEC",
  "orsec.step.draft": "التحرير",
  "orsec.step.approved": "المصادقة",
  "orsec.step.alert": "التأهب",
  "orsec.step.active": "التفعيل",
  "orsec.step.lifted": "الرفع",

  "orsec.phase.urgence": "الطوارئ",
  "orsec.phase.evaluation": "التقييم والمراقبة",
  "orsec.phase.rehabilitation": "إعادة التأهيل",

  "orsec.action.approve": "المصادقة على المخطط",
  "orsec.action.setAlert": "الوضع في حالة تأهب",
  "orsec.action.activate": "تفعيل المخطط",
  "orsec.action.changePhase": "تغيير المرحلة",
  "orsec.action.lift": "رفع المخطط",
  "orsec.action.designate": "تعيين",
  "orsec.action.reassign": "استبدال",
  "orsec.action.cancel": "إلغاء",

  "orsec.lifecycle.title": "دورة الحياة",
  "orsec.lifecycle.lead":
    "تحرير، مصادقة، تأهب، تفعيل ثم رفع (RG-O13، RG-O14).",

  "orsec.hint.draft": "المخطط قيد التحرير: يجب المصادقة عليه قبل أي تفعيل.",
  "orsec.hint.pending":
    "المخطط مُحرَّر لكنه لم يُصادق عليه بعد: لا يمكن تفعيله (RG-O14).",
  "orsec.hint.approved":
    "المخطط مُصادق عليه: يمكن للسلطة المختصة وضعه في حالة تأهب أو تفعيله.",
  "orsec.hint.alert":
    "المخطط في حالة تأهب: عُلم مسؤولو الوحدات المعنية، ويبقى قرار التفعيل معلّقًا.",
  "orsec.hint.active":
    "المخطط مُفعَّل: مركز القيادة الثابت ومركز القيادة العملياتي مفتوحان، والوحدات المشاركة مسجّلة.",
  "orsec.hint.activeNoPosts":
    "المخطط مُفعَّل: الوحدات المشاركة مسجّلة والسلطات مُعلمة؛ هذا المستوى لا يفتح مركز قيادة ثابت ولا عملياتي.",
  "orsec.hint.lifted":
    "تم رفع المخطط: أُنشئ التقرير المفصّل ويبقى بحاجة إلى استكمال وإرسال (RG-O07).",
  "orsec.hint.nationalReady":
    "المخطط الوطني: يجمع مخططات الولايات ويمكن لوزير الداخلية وضعه في حالة تأهب أو تفعيله (RG-O01).",

  "orsec.fact.reference": "المرجع",
  "orsec.fact.version": "النسخة",
  "orsec.fact.scope": "النطاق",
  "orsec.fact.approvedBy": "صادق عليه",
  "orsec.fact.approvedAt": "تاريخ المصادقة",
  "orsec.fact.posts": "PCF / PCO",
  "orsec.fact.postsOpen": "مفتوحان",
  "orsec.fact.postsClosed": "مغلقان",
  "orsec.fact.revision": "المراجعة القادمة",
  "orsec.fact.revisionBadge": "RG-O11",
  "orsec.fact.phase": "المرحلة",
  "orsec.fact.decidedBy": "قرار",
  "orsec.fact.incidents": "الحوادث المعنية",

  "orsec.modules.count": "{count} / {total} وحدة معيّنة",
  "orsec.modules.missing":
    "{count} وحدة بدون مسؤول ستُبلَّغ إلى السلطة (RG-O04).",
  "orsec.modules.missingShort": "{count} بدون مسؤول",
  "orsec.modules.allDesignated": "الكل معيّن",
  "orsec.modules.noOwner": "المسؤول غير معيّن",
  "orsec.modules.engaged": "مشارك",
  "orsec.modules.nationalNotice":
    "المخطط الوطني يجمع مخططات الولايات: يتم تعيين الوحدات على مستوى كل ولاية (المادة 5).",
  "orsec.modules.history": "التعيينات السابقة",
  "orsec.modules.noHistory": "لا يوجد تعيين مسجّل لهذه الوحدة.",

  "orsec.readiness.ready": "جاهز",
  "orsec.readiness.partial": "جزئي",
  "orsec.readiness.missing": "بحاجة إلى استكمال",

  "orsec.approve.title": "المصادقة على المخطط",
  "orsec.approve.lead":
    "المصادقة تجعل المخطط قابلًا للاستخدام، وتُسجَّل مع صاحبها وتاريخها.",
  "orsec.approve.rule":
    "RG-O14: لا يكون المخطط قابلًا للاستخدام إلا بعد مصادقة الوالي أو رئيس المجلس الشعبي البلدي. المخطط الوطني ليس له مصادقة خاصة.",
  "orsec.approve.confirm": "المصادقة والتسجيل",

  "orsec.alert.title": "وضع المخطط في حالة تأهب",
  "orsec.alert.lead":
    "حالة التأهب تُعلم السلطات والوحدات المعنية دون إشراك وسائل الإغاثة بعد.",
  "orsec.alert.rule":
    "RG-O02: الوضع في حالة التأهب والتفعيل يُعلمان السلطات المقررة في المرسوم؛ وبالنسبة للمخطط الولائي يُعلم وزير الداخلية منذ الوضع في حالة التأهب.",
  "orsec.alert.confirm": "الوضع في حالة تأهب",

  "orsec.activate.title": "تفعيل مخطط ORSEC",
  "orsec.activate.lead": "التفعيل يفتح مراكز القيادة المقررة ويُعلم السلطات.",
  "orsec.activate.reason": "سبب التفعيل",
  "orsec.activate.reason.occurrence": "وقوع الكارثة",
  "orsec.activate.reason.insufficient": "الوسائل غير كافية",
  "orsec.activate.reason.complementary": "وسائل تكميلية",
  "orsec.activate.incidents": "الحوادث المعنية",
  "orsec.activate.incidentsHint":
    "اختر حادثًا واحدًا على الأقل سببًا للتفعيل.",
  "orsec.activate.modules": "الوحدات المعنية",
  "orsec.activate.modulesCount": "{count} / {total} مختارة",
  "orsec.activate.modulesHint": "يُعلم فقط مسؤولو الوحدات المختارة (RG-O17).",
  "orsec.activate.recipients": "السلطات المُعلمة",
  "orsec.activate.posts":
    "سيُفتح مركز القيادة الثابت (بقيادة السلطة) ومركز القيادة العملياتي (بقيادة الحماية المدنية) (RG-O03).",
  "orsec.activate.confirm": "تأكيد التفعيل",
  "orsec.activate.errorIncidents": "اختر حادثًا واحدًا على الأقل.",
  "orsec.activate.errorModules": "اختر وحدة واحدة على الأقل.",

  "orsec.lift.title": "رفع مخطط ORSEC",
  "orsec.lift.lead": "الرفع يغلق مراكز القيادة وينهي تعيينات التفعيل.",
  "orsec.lift.startedAt": "فُعّل في",
  "orsec.lift.engaged": "الوحدات المشاركة",
  "orsec.lift.engagedValue": "{count} وحدة",
  "orsec.lift.pending":
    "لا يزال طلب دعم واحد قيد الانتظار: سيُشار إليه قبل الرفع (UC-04، 1a).",
  "orsec.lift.reportNotice":
    "سيُنشأ تقرير مفصّل «بحاجة إلى استكمال» ويُوجَّه إلى الجهة المعنية (RG-O07).",
  "orsec.lift.confirm": "تأكيد الرفع",

  "orsec.phase.title": "تغيير المرحلة",
  "orsec.phase.lead": "تُسجَّل مراحل التفعيل مع تاريخها (RG-O13).",
  "orsec.phase.label": "المرحلة الجديدة",
  "orsec.phase.confirm": "تسجيل المرحلة",

  "orsec.designate.title": "تعيين مسؤول وحدة",
  "orsec.designate.lead":
    "مسؤول الوحدة هو عادةً مدير الهيئة المعنية (المادة 43).",
  "orsec.designate.endNotice":
    "سينتهي تعيين {name} (منذ {date}) ويبدأ التعيين الجديد فورًا.",
  "orsec.designate.person": "المستخدم المعيّن",
  "orsec.designate.choose": "اختر مستخدمًا",
  "orsec.designate.territory":
    "لا يمكن تعيين إلا المستخدمين المرتبطين بنطاق المخطط (RG-O09).",
  "orsec.designate.confirm": "تسجيل التعيين",
  "orsec.designate.error": "اختر مستخدمًا.",

  "orsec.report.title": "التقارير المفصّلة",
  "orsec.report.lead":
    "تُنشأ عند رفع المخطط وتبقى «بحاجة إلى استكمال» حتى إرسالها (RG-O07).",
  "orsec.report.count": "{count} تقرير",
  "orsec.report.empty": "لا يوجد تقرير: سيُنشأ تلقائيًا عند رفع المخطط.",
  "orsec.report.created": "أُنشئ في {date}",
  "orsec.report.send": "إرسال",
  "orsec.report.statBadge": "للإرسال",
  "orsec.report.allSent": "لا شيء قيد الانتظار",
  "orsec.report.status.draft": "بحاجة إلى استكمال",
  "orsec.report.status.sent": "مُرسل",

  "orsec.log.title": "سجل المخطط",
  "orsec.log.lead": "آخر 5 إجراءات",
  "orsec.log.created": "تحرير المخطط",
  "orsec.log.submitted": "إرسال المخطط للمصادقة",
  "orsec.log.approved": "المصادقة على المخطط",
  "orsec.log.alertSet": "وضع المخطط في حالة تأهب",
  "orsec.log.activated": "تفعيل المخطط",
  "orsec.log.phaseChanged": "تغيير المرحلة",
  "orsec.log.lifted": "رفع المخطط · إنشاء التقرير",
  "orsec.log.designated": "تعيين مسؤول وحدة",
  "orsec.log.reportSent": "إرسال التقرير المفصّل",

  "orsec.recipient.minister": "وزير الداخلية",
  "orsec.recipient.wali": "الوالي",
  "orsec.recipient.apc": "رئيس المجلس الشعبي البلدي",
  "orsec.recipient.pc": "الحماية المدنية",
  "orsec.recipient.limitrophes": "ولاة الولايات المجاورة (اقتراح)",
  "orsec.recipient.walis": "ولاة الولايات المعنية",

  "orsec.incident.forest": "حريق غابة",
  "orsec.incident.flood": "فيضان",
  "orsec.incident.quake": "زلزال",
  "orsec.incident.landslide": "انزلاق أرضي",
  "orsec.incident.gas": "تسرب غاز",

  "orsec.module.securite": "الأمن والنظام العام",
  "orsec.module.secours": "الإغاثة والإنقاذ والإخلاء",
  "orsec.module.sante": "التكفل الاستشفائي",
  "orsec.module.materiaux": "المواد والتجهيزات المتنوعة",
  "orsec.module.communication": "الاتصال والإعلام",
  "orsec.module.travaux": "الأشغال العمومية",
  "orsec.module.telecom": "الاتصالات السلكية واللاسلكية",
  "orsec.module.transports": "النقل",
  "orsec.module.humanitaire": "التضامن والعمل الإنساني",
  "orsec.module.energie": "الطاقة",
  "orsec.module.eau": "التزويد بمياه الشرب",
  "orsec.module.hebergement": "الإيواء المؤقت",
  "orsec.module.expertises": "الخبرات والتقييمات والحصائل",

  "orsec.moduleOrg.securite": "الشرطة · الدرك",
  "orsec.moduleOrg.secours": "الحماية المدنية",
  "orsec.moduleOrg.sante": "الصحة",
  "orsec.moduleOrg.materiaux": "أعوان الهيئات",
  "orsec.moduleOrg.communication": "الاتصال",
  "orsec.moduleOrg.travaux": "الأشغال العمومية",
  "orsec.moduleOrg.telecom": "الاتصالات",
  "orsec.moduleOrg.transports": "النقل",
  "orsec.moduleOrg.humanitaire": "العمل الإنساني",
  "orsec.moduleOrg.energie": "الطاقة",
  "orsec.moduleOrg.eau": "المياه",
  "orsec.moduleOrg.hebergement": "التربية · البلدية",
  "orsec.moduleOrg.expertises": "الخبرات والحصائل",

  "orsec.org.protectionCivile": "الحماية المدنية",
  "orsec.org.gendarmerie": "الدرك الوطني",
  "orsec.org.police": "الشرطة",
  "orsec.org.sante": "مديرية الصحة",
  "orsec.org.materiaux": "مديرية الوسائل",
  "orsec.org.communication": "مديرية الاتصال",
  "orsec.org.travauxPublics": "الأشغال العمومية",
  "orsec.org.telecom": "الاتصالات",
  "orsec.org.transports": "مديرية النقل",
  "orsec.org.humanitaire": "الهلال الأحمر الجزائري",
  "orsec.org.energie": "مديرية الطاقة",
  "orsec.org.eau": "مديرية المياه",
  "orsec.org.education": "مديرية التربية",
  "orsec.org.expertises": "الخبرات والحصائل",

};

import { DEMO_ACCOUNTS, STAFF_DEMO_ACCOUNTS } from "../auth/demoAccounts";
import type { Role } from "../auth/roles";
import { DEFAULT_MATRIX } from "../data/moduleMatrix";
import { MODULES } from "../data/modules";
import { FIRST_WAVE } from "../data/moduleParType";
import {
  TERRITORIES,
  VOISINAGE,
  territoryById,
} from "../data/territories";
import { TYPES_CATASTROPHE } from "../data/types";
import { GENESIS_HASH, mainCouranteHash, sealHash } from "./hash";
import type {
  Communique,
  Db,
  Gravity,
  JournalEntry,
  MainCouranteEntry,
  ModuleSnapshot,
  Notification,
  Requisition,
  Routage,
  Signalement,
  SituationTransition,
  User,
} from "./model";

const DB_VERSION = 2;

function iso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function typeLabel(code: string): { fr: string; ar: string } {
  const type = TYPES_CATASTROPHE.find((item) => item.code === code);
  return type?.libelle ?? { fr: code, ar: code };
}

function territoryLabel(id: string): { fr: string; ar: string } {
  const territory = territoryById(id);
  return territory?.nom ?? { fr: id, ar: id };
}

type SeedMainCouranteRow = Omit<MainCouranteEntry, "id" | "prevHash" | "hash" | "assignmentId">;

function buildMainCourante(rows: SeedMainCouranteRow[]): MainCouranteEntry[] {
  let previous = GENESIS_HASH;
  const entries = rows.map((row, index) => {
    const base = {
      ...row,
      id: `mc-2026-${String(index + 1).padStart(4, "0")}`,
      assignmentId: `aff-${row.authorId}-seed`,
      prevHash: previous,
    };
    const hash = mainCouranteHash({
      at: base.at,
      authorId: base.authorId,
      scope: base.scope,
      category: base.category,
      messageFr: base.message.fr,
      messageAr: base.message.ar,
      prevHash: base.prevHash,
      moduleId: base.moduleId,
      planId: base.planId,
      coordinates: base.coordinates,
      amendmentOf: base.amendmentOf,
    });
    previous = hash;
    return { ...base, hash };
  });
  return entries.reverse();
}

function usersFromAccounts(): User[] {
  return DEMO_ACCOUNTS.map((account) => ({
    id: account.id,
    nom: account.nom,
    prenom: account.prenom,
    email: account.email,
    role: account.role,
    moduleId: account.moduleId,
    territoryId: account.territory?.id,
    disponible: account.available,
    actif: true,
    createdAt: iso(60 * 24 * 30),
  }));
}

function userTerritoryCovers(user: User, communeId: string): boolean {
  if (!user.territoryId) return false;
  const userTerritory = territoryById(user.territoryId);
  if (!userTerritory) return false;
  const commune = territoryById(communeId);
  if (userTerritory.niveau === "national") return true;
  if (userTerritory.niveau === "commune") return userTerritory.id === communeId;
  if (userTerritory.niveau === "wilaya") return commune?.parentId === userTerritory.id;
  return false;
}

const MODULE_ROLES: Role[] = ["module_agent", "module_manager", "module_director"];

function recipientsFor(moduleNo: number, communeId: string, users: User[]): User[] {
  const moduleId = `module-${moduleNo}`;
  return users.filter(
    (user) =>
      user.actif &&
      MODULE_ROLES.includes(user.role) &&
      user.moduleId === moduleId &&
      userTerritoryCovers(user, communeId),
  );
}

export function createSeedDb(): Db {
  const users = usersFromAccounts();

  const signalements: Signalement[] = [
    {
      id: "sig-2026-0001",
      auteurId: "u-citizen",
      typeId: "C2",
      description:
        "L'oued est sorti de son lit près du quartier des Oliviers. L'eau monte rapidement et plusieurs habitations sont isolées.",
      communeId: "commune-bejaia",
      latitude: 36.7509,
      longitude: 5.0567,
      personnesConcernees: 24,
      etat: "non_verifie",
      creeLe: iso(38),
      suggestion: { typeId: "C2", gravite: "elevee", confiance: 0.86 },
    },
    {
      id: "sig-2026-0002",
      auteurId: "u-citizen",
      typeId: "C7",
      description:
        "Plusieurs cas de gastro-entérite signalés dans le village. L'eau du réseau local a un aspect trouble.",
      communeId: "commune-tichy",
      latitude: 36.6641,
      longitude: 5.1621,
      personnesConcernees: 9,
      etat: "non_verifie",
      creeLe: iso(125),
    },
    {
      id: "sig-2026-0003",
      auteurId: "u-citizen",
      typeId: "C4",
      description:
        "Départ de feu sur la crête boisée au-dessus d'Akbou. Le vent pousse les flammes vers les habitations.",
      communeId: "commune-akbou",
      latitude: 36.4581,
      longitude: 4.5303,
      personnesConcernees: 60,
      gravite: "elevee",
      etat: "confirme",
      creeLe: iso(26 * 60),
      confirmeLe: iso(25 * 60),
      traiteParModuleId: "module-1",
    },
    {
      id: "sig-2026-0004",
      auteurId: "u-citizen",
      typeId: "C10",
      description:
        "Un attroupement important perturbe la circulation à l'entrée du stade. Aucun blessé signalé.",
      communeId: "commune-bejaia",
      latitude: 36.7522,
      longitude: 5.0844,
      personnesConcernees: 3,
      gravite: "faible",
      etat: "rejete",
      creeLe: iso(48 * 60),
      rejeteLe: iso(47 * 60),
      traiteParModuleId: "module-2",
    },
    {
      id: "sig-2026-0005",
      auteurId: "u-citizen",
      typeId: "C5",
      description:
        "Fuite de gaz de grande ampleur sur la zone industrielle. Une odeur forte est perçue sur plusieurs centaines de mètres.",
      communeId: "commune-bejaia",
      latitude: 36.7358,
      longitude: 5.0902,
      personnesConcernees: 40,
      gravite: "critique",
      etat: "confirme",
      creeLe: iso(5 * 60),
      confirmeLe: iso(Math.round(4.5 * 60)),
      traiteParModuleId: "module-1",
    },
  ];

  const routages: Routage[] = [];
  const notifications: Notification[] = [];
  let routageNo = 1;
  let notificationNo = 1;

  signalements.forEach((signalement) => {
    FIRST_WAVE[signalement.typeId].forEach((moduleNo) => {
      const moduleId = `module-${moduleNo}`;
      const recipients = recipientsFor(moduleNo, signalement.communeId, users);
      recipients.forEach((destinataire) => {
        routages.push({
          id: `rout-${routageNo++}`,
          signalementId: signalement.id,
          moduleId,
          destinataireId: destinataire.id,
          envoyeLe: signalement.creeLe,
          luLe:
            signalement.etat === "non_verifie" || destinataire.role === "module_agent"
              ? undefined
              : signalement.confirmeLe,
        });
        notifications.push({
          id: `notif-${notificationNo++}`,
          destinataireId: destinataire.id,
          typeEvenement: "alerte_module",
          objet: { fr: `Alerte module — ${signalement.typeId}`, ar: `تنبيه وحدة — ${signalement.typeId}` },
          message: {
            fr: `${typeLabel(signalement.typeId).fr} signalé à ${territoryLabel(signalement.communeId).fr}. Signalement ${signalement.id}.`,
            ar: `${typeLabel(signalement.typeId).ar} مُبلّغ عنه في ${territoryLabel(signalement.communeId).ar}. التبليغ ${signalement.id}.`,
          },
          canal: "app",
          creeLe: signalement.creeLe,
          lueLe:
            signalement.etat === "non_verifie"
              ? undefined
              : new Date(Date.parse(signalement.creeLe) + 15 * 60_000).toISOString(),
        });
      });
    });
  });

  // Confirmation / rejet : notification au citoyen.
  notifications.push(
    {
      id: `notif-${notificationNo++}`,
      destinataireId: "u-citizen",
      typeEvenement: "systeme",
      objet: { fr: "Signalement confirmé", ar: "تم تأكيد التبليغ" },
      message: {
        fr: `Votre signalement ${signalements[2].id} a été confirmé par le module Secours. Gravité : élevée.`,
        ar: `تم تأكيد تبليغكم ${signalements[2].id} من طرف وحدة الإغاثة. الخطورة: مرتفعة.`,
      },
      canal: "app",
      creeLe: signalements[2].confirmeLe ?? iso(25 * 60),
      lueLe: iso(24 * 60),
    },
    {
      id: `notif-${notificationNo++}`,
      destinataireId: "u-citizen",
      typeEvenement: "refus",
      objet: { fr: "Signalement rejeté", ar: "تم رفض التبليغ" },
      message: {
        fr: `Votre signalement ${signalements[3].id} a été rejeté : aucun dispositif de sécurité n'était nécessaire.`,
        ar: `تم رفض تبليغكم ${signalements[3].id}: لم تكن هناك حاجة لجهاز أمني.`,
      },
      canal: "app",
      creeLe: signalements[3].rejeteLe ?? iso(47 * 60),
      lueLe: iso(46 * 60),
    },
  );

  const planNotice: Notification = {
    id: `notif-${notificationNo++}`,
    destinataireId: "u-apc-bejaia",
    typeEvenement: "plan_declenche",
    objet: { fr: "Plan communal déclenché", ar: "تم إطلاق المخطط البلدي" },
    message: {
      fr: "Le plan communal de Béjaïa est déclenché en situation C. Les modules sont mobilisés.",
      ar: "تم إطلاق المخطط البلدي لبجاية في الحالة C. تم استدعاء الوحدات.",
    },
    canal: "app",
    creeLe: iso(46),
    lueLe: iso(45),
  };
  notifications.push(planNotice);

  const escalationRequest: Notification = {
    id: `notif-${notificationNo++}`,
    destinataireId: "u-wali",
    typeEvenement: "demande_declenchement",
    objet: { fr: "Demande de plan de wilaya", ar: "طلب مخطط الولاية" },
    message: {
      fr: "Le président de l'APC de Béjaïa demande le plan de wilaya : la fuite de gaz dépasse les capacités communales.",
      ar: "رئيس بلدية بجاية يطلب مخطط الولاية: تسرب الغاز يتجاوز قدرات البلدية.",
    },
    canal: "app",
    creeLe: iso(20),
  };
  notifications.push(escalationRequest);

  const journal: JournalEntry[] = [
    {
      id: "j-1",
      acteurId: "u-citizen",
      action: "CREATION_SIGNALEMENT",
      objet: signalements[0].id,
      details: "Signalement C2 reçu et routé automatiquement vers les modules 1 et 8.",
      date: signalements[0].creeLe,
    },
    {
      id: "j-2",
      acteurId: "u-manager-pc",
      action: "CONFIRMATION_SIGNALEMENT",
      objet: signalements[2].id,
      details: "Signalement C4 confirmé, gravité élevée.",
      date: signalements[2].confirmeLe ?? iso(25 * 60),
    },
    {
      id: "j-3",
      acteurId: "u-manager-pc",
      action: "LANCEMENT_INTERVENTION",
      objet: "int-2026-0001",
      details: "Intervention du module 1 lancée sur le signalement sig-2026-0003.",
      date: iso(24 * 60),
    },
    {
      id: "j-4",
      acteurId: "u-manager-pc",
      action: "HORS_DE_CONTROLE",
      objet: "int-2026-0002",
      details: "Situation déclarée hors de contrôle : fuite de gaz majeure. Demande transmise à l'APC de Béjaïa.",
      date: iso(50),
    },
  ];

  journal.push(
    {
      id: "j-5",
      acteurId: "u-apc-bejaia",
      action: "DECLENCHEMENT_PLAN",
      objet: "plan-2026-0001",
      details: "Plan communal de Béjaïa déclenché en situation C, 13 modules mobilisés.",
      date: iso(46),
    },
    {
      id: "j-6",
      acteurId: "u-apc-bejaia",
      action: "TRANSITION_SITUATION",
      objet: "sit-2026-0002",
      details: "Situation B → C : urgence active, justification et signature scellées.",
      date: iso(46),
    },
    {
      id: "j-7",
      acteurId: "u-apc-bejaia",
      action: "SIGNATURE_REQUISITION",
      objet: "req-2026-0001",
      details: "Réquisition d'une grue mobile 30 t signée au titre de l'article 70.",
      date: iso(35),
    },
    {
      id: "j-8",
      acteurId: "u-wali",
      action: "PUBLICATION_COMMUNIQUE",
      objet: "com-2026-0001",
      details: "Communiqué d'évacuation publié sur push, SMS et site public.",
      date: iso(30),
    },
    {
      id: "j-9",
      acteurId: "u-apc-bejaia",
      action: "DEMANDE_PLAN_SUPERIEUR",
      objet: "dem-2026-0002",
      details: "Demande de plan de wilaya transmise au wali pour mutualiser les moyens.",
      date: iso(20),
    },
  );

  const planCommuneId = "plan-2026-0001";
  const planWilayaId = "plan-2026-0002";
  const mobilizedModules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

  const situationTransitions: SituationTransition[] = [
    {
      id: "sit-2026-0001",
      from: "A",
      to: "B",
      at: iso(176),
      byId: "u-apc-bejaia",
      role: "apc_president",
      justification: {
        fr: "Vigilance orange de l'ONM et indice de risque élevé sur le littoral : pré-alerte des 13 modules.",
        ar: "إنذار برتقالي من الديوان الوطني للأرصاد الجوية ومؤشر خطر مرتفع على الساحل: إنذار مسبق للوحدات الـ13.",
      },
      signatureHash: sealHash("plan-2026-0001", "A", "B", "u-apc-bejaia", "pre-alerte"),
      source: "BMS ONM — vigilance orange",
      moduleIds: mobilizedModules.map((no) => `module-${no}`),
      planId: planCommuneId,
    },
    {
      id: "sit-2026-0002",
      from: "B",
      to: "C",
      at: iso(46),
      byId: "u-apc-bejaia",
      role: "apc_president",
      justification: {
        fr: "Fuite de gaz majeure et évacuation de populations : déclenchement du plan communal en urgence active.",
        ar: "تسرب غاز كبير وإخلاء سكان: إطلاق المخطط البلدي في حالة الاستعجال النشط.",
      },
      signatureHash: sealHash("plan-2026-0001", "B", "C", "u-apc-bejaia", "urgence-active"),
      source: "Déclaration signée du président de l'APC",
      moduleIds: mobilizedModules.map((no) => `module-${no}`),
      planId: planCommuneId,
    },
  ];

  const mainCourante = buildMainCourante([
    {
      at: iso(175),
      authorId: "u-apc-bejaia",
      role: "apc_president",
      scope: "pcf",
      planId: planCommuneId,
      category: "decision",
      message: {
        fr: "Pré-alerte activée après le BMS ONM. Les 13 responsables de module sont informés et accusent réception.",
        ar: "تم تفعيل الإنذار المسبق بعد نشرة الأرصاد الجوية. تم إبلاغ مسؤولي الوحدات الـ13 وهم يؤكدون الاستلام.",
      },
      syncStatus: "synced",
    },
    {
      at: iso(60),
      authorId: "u-manager-pc",
      role: "module_manager",
      scope: "pco",
      moduleId: "module-1",
      planId: planCommuneId,
      category: "operation",
      message: {
        fr: "Périmètre de sécurité de 300 m établi autour de la zone industrielle. Trois accès fermés, déviation par la RN9.",
        ar: "تم إنشاء محيط أمني بقطر 300 م حول المنطقة الصناعية. إغلاق ثلاثة مداخل وتحويل المرور عبر الطريق الوطنية 9.",
      },
      coordinates: [36.7358, 5.0902],
      syncStatus: "synced",
    },
    {
      at: iso(44),
      authorId: "u-agent-pc",
      role: "module_agent",
      scope: "module",
      moduleId: "module-1",
      planId: planCommuneId,
      category: "victime",
      message: {
        fr: "Évacuation de 12 familles du quartier des Oliviers vers le centre d'accueil de l'école primaire. Aucun blessé grave.",
        ar: "إخلاء 12 عائلة من حي الزيتون نحو مركز الاستقبال بالمدرسة الابتدائية. لا توجد إصابات خطيرة.",
      },
      coordinates: [36.7509, 5.0567],
      syncStatus: "synced",
    },
    {
      at: iso(38),
      authorId: "u-agent-sante",
      role: "module_agent",
      scope: "module",
      moduleId: "module-3",
      planId: planCommuneId,
      category: "victime",
      message: {
        fr: "PMA ouvert à l'hôpital de Béjaïa : 6 rouges, 14 jaunes, 21 verts et 2 noirs. Trois lits de réanimation disponibles.",
        ar: "فتح مركز طبي متقدم بمستشفى بجاية: 6 حالات حمراء، 14 صفراء، 21 خضراء و2 سوداء. ثلاثة أسرّة إنعاش متاحة.",
      },
      syncStatus: "synced",
    },
    {
      at: iso(30),
      authorId: "u-wali",
      role: "wali",
      scope: "authority",
      planId: planCommuneId,
      category: "communication",
      message: {
        fr: "Premier communiqué public publié : évacuation du quartier des Oliviers et consignes de confinement.",
        ar: "نشر أول بلاغ عمومي: إخلاء حي الزيتون وإرشادات الحجر الصحي.",
      },
      syncStatus: "synced",
    },
    {
      at: iso(22),
      authorId: "u-manager-tp",
      role: "module_manager",
      scope: "pco",
      moduleId: "module-8",
      planId: planCommuneId,
      category: "moyen",
      message: {
        fr: "Besoin de deux groupes électrogènes et d'une pompe de 500 m³/h. Demande de réquisition préparée pour le PCF.",
        ar: "الحاجة إلى مولدي كهرباء ومضخة بسعة 500 م³/س. تم إعداد طلب تزويد لفائدة المركز الثابت للقيادة.",
      },
      syncStatus: "local",
    },
    {
      at: iso(14),
      authorId: "u-agent-tp",
      role: "module_agent",
      scope: "module",
      moduleId: "module-8",
      planId: planCommuneId,
      category: "operation",
      message: {
        fr: "Déblaiement de l'axe principal engagé : 40 % réalisé, deux engins lourds sur site.",
        ar: "بدء تنظيف المحور الرئيسي: إنجاز 40٪، آلتان ثقيلتان في الموقع.",
      },
      syncStatus: "synced",
    },
    {
      at: iso(6),
      authorId: "u-apc-bejaia",
      role: "apc_president",
      scope: "pcf",
      planId: planCommuneId,
      category: "decision",
      message: {
        fr: "Point de situation de 14 h 00 : situation C maintenue, demande de plan de wilaya transmise au wali.",
        ar: "نقطة الوضع الساعة 14:00: الحالة C مستمرة، وتم إرسال طلب مخطط الولاية إلى الوالي.",
      },
      syncStatus: "synced",
    },
  ]);

  const requisitions: Requisition[] = [
    {
      id: "req-2026-0001",
      planId: planCommuneId,
      moduleId: "module-8",
      demandeurId: "u-manager-tp",
      nature: { fr: "Engin de levage lourd", ar: "آلة رفع ثقيلة" },
      moyen: "Grue mobile 30 t — BTP Khellaf",
      proprietaire: "BTP Khellaf",
      identifiant: "NIN 109 876 543",
      lieu: { fr: "Zone industrielle de Béjaïa", ar: "المنطقة الصناعية ببجاية" },
      debut: iso(30),
      fin: iso(-360),
      baseLegale: "Article 70 — Loi 24-04",
      etat: "signee",
      urgence: "critique",
      creeLe: iso(40),
      signeeLe: iso(35),
      signeeParId: "u-apc-bejaia",
      notificationLe: iso(35),
      hash: sealHash("req-2026-0001", "30t", "BTP Khellaf", "u-apc-bejaia"),
    },
    {
      id: "req-2026-0002",
      planId: planCommuneId,
      moduleId: "module-1",
      demandeurId: "u-manager-pc",
      nature: { fr: "Groupe électrogène de secours", ar: "مولد كهرباء احتياطي" },
      moyen: "Groupe 250 kVA — Sonelgaz",
      proprietaire: "Sonelgaz",
      identifiant: "NIN 201 554 987",
      lieu: { fr: "Centre de commandement — Béjaïa", ar: "مركز القيادة — بجاية" },
      debut: iso(10),
      fin: iso(-720),
      baseLegale: "Article 70 — Loi 24-04",
      etat: "proposee",
      urgence: "haute",
      creeLe: iso(20),
    },
  ];

  const communiques: Communique[] = [
    {
      id: "com-2026-0001",
      titre: {
        fr: "Évacuation du quartier des Oliviers",
        ar: "إخلاء حي الزيتون",
      },
      message: {
        fr: "En raison de la fuite de gaz, les habitants du quartier des Oliviers doivent évacuer vers l'école primaire. Restez à distance de la zone industrielle et suivez les consignes des secours.",
        ar: "بسبب تسرب الغاز، على سكان حي الزيتون الإخلاء نحو المدرسة الابتدائية. ابتعدوا عن المنطقة الصناعية واتبعوا إرشادات فرق الإغاثة.",
      },
      zoneIds: ["commune-bejaia"],
      canaux: ["push", "sms", "site"],
      etat: "publie",
      auteurId: "u-wali",
      valideParId: "u-wali",
      creeLe: iso(35),
      publieLe: iso(30),
      couverture: 78,
    },
    {
      id: "com-2026-0002",
      titre: {
        fr: "Consignes de confinement — fuite de gaz",
        ar: "إرشادات الحجر الصحي — تسرب الغاز",
      },
      message: {
        fr: "Fermez fenêtres et portes, coupez le gaz et l'électricité, ne prenez pas l'ascenseur. Un point de situation sera publié à 16 h.",
        ar: "أغلقوا النوافذ والأبواب، اقطعوا الغاز والكهرباء، ولا تستعملوا المصعد. ستُنشر نقطة وضع عند الساعة 16:00.",
      },
      zoneIds: ["commune-bejaia"],
      canaux: ["push", "site"],
      etat: "brouillon",
      auteurId: "u-apc-bejaia",
      creeLe: iso(10),
      couverture: 0,
    },
  ];

  const moduleSnapshots: ModuleSnapshot[] = [
    {
      id: "snap-module-1",
      moduleId: "module-1",
      planId: planCommuneId,
      statut: "operationnel",
      responsableId: "u-director-pc",
      effectifEngage: 18,
      effectifDisponible: 6,
      dernierRapportLe: iso(12),
      note: {
        fr: "Trois équipes engagées, deux pompes et un hélicoptère en attente.",
        ar: "ثلاث فرق مشاركة، مضختان وطائرة مروحية في الانتظار.",
      },
      metrics: [
        { key: "engins", value: 4 },
        { key: "victimes_extraites", value: 12 },
        { key: "pompes", value: 2 },
      ],
    },
    {
      id: "snap-module-2",
      moduleId: "module-2",
      planId: planCommuneId,
      statut: "operationnel",
      responsableId: "u-director-securite",
      effectifEngage: 26,
      effectifDisponible: 8,
      dernierRapportLe: iso(18),
      metrics: [
        { key: "perimetres", value: 3 },
        { key: "deviations", value: 5 },
      ],
    },
    {
      id: "snap-module-3",
      moduleId: "module-3",
      planId: planCommuneId,
      statut: "sature",
      responsableId: "u-director-sante",
      effectifEngage: 22,
      effectifDisponible: 4,
      dernierRapportLe: iso(8),
      note: {
        fr: "Service des urgences saturé : demande de transferts vers Akbou.",
        ar: "قسم الاستعجالات مشبع: طلب تحويلات نحو أقبو.",
      },
      metrics: [
        { key: "victimes_decedes", value: 2 },
        { key: "victimes_blessees", value: 37 },
        { key: "victimes_disparues", value: 3 },
        { key: "triage_rouge", value: 6 },
        { key: "triage_jaune", value: 14 },
        { key: "triage_vert", value: 21 },
        { key: "triage_noir", value: 2 },
        { key: "lits_rea_disponibles", value: 3 },
        { key: "lits_total", value: 40 },
        { key: "sang_poches", value: 18 },
        { key: "transferts_en_cours", value: 7 },
      ],
    },
    {
      id: "snap-module-4",
      moduleId: "module-4",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 5,
      effectifDisponible: 3,
      dernierRapportLe: iso(9),
      metrics: [
        { key: "communiques", value: 2 },
        { key: "rumeurs", value: 1 },
      ],
    },
    {
      id: "snap-module-5",
      moduleId: "module-5",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 14,
      effectifDisponible: 5,
      dernierRapportLe: iso(25),
      metrics: [
        { key: "rations", value: 1200 },
        { key: "couvertures", value: 450 },
        { key: "points_distribution", value: 2 },
      ],
    },
    {
      id: "snap-module-6",
      moduleId: "module-6",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 9,
      effectifDisponible: 3,
      dernierRapportLe: iso(16),
      metrics: [
        { key: "coupures", value: 3 },
        { key: "sites_prioritaires", value: 7 },
        { key: "groupes_electrogenes", value: 5 },
      ],
    },
    {
      id: "snap-module-7",
      moduleId: "module-7",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 16,
      effectifDisponible: 6,
      dernierRapportLe: iso(21),
      metrics: [
        { key: "centres_ouverts", value: 2 },
        { key: "capacite_accueil", value: 320 },
        { key: "occupation_accueil", value: 214 },
        { key: "familles_hebergees", value: 58 },
      ],
    },
    {
      id: "snap-module-8",
      moduleId: "module-8",
      planId: planCommuneId,
      statut: "operationnel",
      responsableId: "u-director-tp",
      effectifEngage: 12,
      effectifDisponible: 4,
      dernierRapportLe: iso(14),
      metrics: [
        { key: "engins_lourds", value: 6 },
        { key: "axes_coupes", value: 3 },
        { key: "deblaiement", value: 40 },
      ],
    },
    {
      id: "snap-module-9",
      moduleId: "module-9",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 8,
      effectifDisponible: 3,
      dernierRapportLe: iso(28),
      metrics: [
        { key: "camions_citernes", value: 4 },
        { key: "conduites_touchees", value: 2 },
        { key: "potabilite", value: 92 },
      ],
    },
    {
      id: "snap-module-10",
      moduleId: "module-10",
      planId: planCommuneId,
      statut: "operationnel",
      responsableId: "u-director-forets",
      effectifEngage: 7,
      effectifDisponible: 5,
      dernierRapportLe: iso(33),
      metrics: [
        { key: "requisitions", value: 2 },
        { key: "parc", value: 14 },
      ],
    },
    {
      id: "snap-module-11",
      moduleId: "module-11",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 6,
      effectifDisponible: 2,
      dernierRapportLe: iso(26),
      metrics: [
        { key: "radios", value: 40 },
        { key: "antennes", value: 2 },
      ],
    },
    {
      id: "snap-module-12",
      moduleId: "module-12",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 10,
      effectifDisponible: 4,
      dernierRapportLe: iso(24),
      metrics: [
        { key: "bus", value: 6 },
        { key: "rotations", value: 18 },
      ],
    },
    {
      id: "snap-module-13",
      moduleId: "module-13",
      planId: planCommuneId,
      statut: "operationnel",
      effectifEngage: 5,
      effectifDisponible: 3,
      dernierRapportLe: iso(19),
      note: {
        fr: "Consolidation des bilans en cours pour le rapport détaillé.",
        ar: "جارٍ توحيد الحصائل تحضيراً للتقرير المفصّل.",
      },
      metrics: [
        { key: "batiments_inspectes", value: 12 },
        { key: "sinistres", value: 58 },
        { key: "estimation_mda", value: 120 },
      ],
    },
  ];

  return {
    version: DB_VERSION,
    users,
    signalements,
    routages,
    interventions: [
      {
        id: "int-2026-0001",
        signalementId: "sig-2026-0003",
        moduleId: "module-1",
        responsableId: "u-manager-pc",
        etat: "en_cours",
        debut: iso(24 * 60),
      },
      {
        id: "int-2026-0002",
        signalementId: "sig-2026-0005",
        moduleId: "module-1",
        responsableId: "u-manager-pc",
        etat: "hors_de_controle",
        debut: iso(4 * 60),
        motifHorsControle:
          "Fuite de gaz de grande ampleur : le périmètre dépasse les moyens du module et les populations voisines doivent être évacuées.",
        horsControleLe: iso(50),
        horsControleParId: "u-manager-pc",
      },
    ],
    affectations: [
      {
        id: "affect-1",
        interventionId: "int-2026-0001",
        agentId: "u-agent-pc",
        etatTache: "en_cours",
        compteRendu: "Progression vers la crête, reconnaissance des accès en cours.",
        affecteLe: iso(23 * 60),
        majLe: iso(80),
      },
    ],
    demandesAppui: [],
    demandes: [
      {
        id: "dem-2026-0001",
        niveauDemande: "commune",
        territoireId: "commune-bejaia",
        origine: "hors_de_controle",
        auteurId: "u-manager-pc",
        interventionId: "int-2026-0002",
        motif:
          "Fuite de gaz majeure : le module 1 ne peut plus contenir seul la situation. Déclenchement du plan communal demandé.",
        etat: "traitee",
        planId: planCommuneId,
        creeLe: iso(50),
        traiteLe: iso(46),
        traiteParId: "u-apc-bejaia",
        relances: [],
      },
      {
        id: "dem-2026-0002",
        niveauDemande: "wilaya",
        territoireId: "wilaya-bejaia",
        origine: "maire",
        auteurId: "u-apc-bejaia",
        motif:
          "La fuite de gaz dépasse les capacités communales et touche les communes voisines. Le plan de wilaya est demandé pour mutualiser les moyens.",
        etat: "en_attente",
        creeLe: iso(20),
        relances: [],
      },
    ],
    plans: [
      {
        id: planCommuneId,
        niveau: "commune",
        territoireId: "commune-bejaia",
        phase: "urgence",
        etat: "declenche",
        situation: "C",
        creeLe: iso(176),
        majLe: iso(6),
        exercice: false,
      },
      {
        id: planWilayaId,
        niveau: "wilaya",
        territoireId: "wilaya-bejaia",
        phase: "urgence",
        etat: "en_alerte",
        situation: "B",
        creeLe: iso(45),
        majLe: iso(12),
        exercice: false,
      },
    ],
    modulesMobilises: mobilizedModules.map((no) => ({
      planId: planCommuneId,
      moduleId: `module-${no}`,
      mobiliseLe: iso(46),
    })),
    misesEnAlerte: [
      {
        id: "alerte-2026-0001",
        territoireId: "commune-akbou",
        planSourceId: planCommuneId,
        raison: "limitrophe",
        debut: iso(45),
      },
      {
        id: "alerte-2026-0002",
        territoireId: "commune-tichy",
        planSourceId: planCommuneId,
        raison: "limitrophe",
        debut: iso(45),
      },
    ],
    participations: [
      {
        id: "part-2026-0001",
        planId: planCommuneId,
        agentId: "u-agent-pc",
        moduleId: "module-1",
        etat: "confirme",
        appeleLe: iso(46),
        confirmeLe: iso(44),
      },
      {
        id: "part-2026-0002",
        planId: planCommuneId,
        agentId: "u-agent-tp",
        moduleId: "module-8",
        etat: "confirme",
        appeleLe: iso(46),
        confirmeLe: iso(40),
      },
      {
        id: "part-2026-0003",
        planId: planCommuneId,
        agentId: "u-agent-sante",
        moduleId: "module-3",
        etat: "appele",
        appeleLe: iso(46),
      },
    ],
    situationTransitions,
    mainCourante,
    requisitions,
    communiques,
    moduleSnapshots,
    notifications,
    journal,
    reference: {
      modules: clone(MODULES),
      types: clone(TYPES_CATASTROPHE),
      territories: clone(TERRITORIES),
      voisinage: clone(VOISINAGE),
      matrix: clone(DEFAULT_MATRIX),
    },
  };
}

/** Comptes autorité ajoutés au seed pour les scénarios de démonstration. */
export const SEEDED_STAFF_ROLES = STAFF_DEMO_ACCOUNTS.map((account) => account.role);

export function seedGravityOrder(value: Gravity): number {
  return ["faible", "moyenne", "elevee", "critique"].indexOf(value);
}

export function seedModuleNo(moduleId: string | undefined): number {
  const match = /^module-(\d+)$/.exec(moduleId ?? "");
  return match ? Number(match[1]) : 0;
}

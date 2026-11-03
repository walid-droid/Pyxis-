/**
 * Comptes de démonstration (aucun backend) : chaque compte fixe un rôle, un
 * module et un territoire. Ils alimentent la connexion du personnel, le
 * sélecteur de démonstration et le journal (auteur des décisions).
 */

import type { Localized } from "../data/locale";
import type { Role } from "./roles";
import type { NewSession } from "./session";

export type DemoAccount = {
  id: string;
  label: Localized;
  role: Role;
  email: string;
  nom: Localized;
  prenom: Localized;
  moduleId?: string;
  territory?: NewSession["territory"];
  available?: boolean;
};

const COMMUNE_BEJAIA = { level: "commune", id: "commune-bejaia" } as const;
const COMMUNE_AKBOU = { level: "commune", id: "commune-akbou" } as const;
const WILAYA_BEJAIA = { level: "wilaya", id: "wilaya-bejaia" } as const;
const NATIONAL = { level: "national", id: "dz" } as const;

export const CITIZEN_DEMO_ACCOUNT: DemoAccount = {
  id: "u-citizen",
  label: { fr: "Citoyen · Béjaïa", ar: "مواطن · بجاية" },
  role: "citizen",
  email: "citoyen@cadm.dz",
  nom: { fr: "Benali", ar: "بن علي" },
  prenom: { fr: "Amine", ar: "أمين" },
  territory: COMMUNE_BEJAIA,
};

export const ADMIN_DEMO_ACCOUNT: DemoAccount = {
  id: "u-admin",
  label: { fr: "Administrateur système", ar: "مسؤول النظام" },
  role: "admin",
  email: "admin@cadm.dz",
  nom: { fr: "Système", ar: "النظام" },
  prenom: { fr: "CADM", ar: "CADM" },
};

export const STAFF_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "u-wali",
    label: { fr: "Wali · Béjaïa", ar: "والي · بجاية" },
    role: "wali",
    email: "wali@bejaia.dz",
    nom: { fr: "Mansouri", ar: "منصوري" },
    prenom: { fr: "Karim", ar: "كريم" },
    territory: WILAYA_BEJAIA,
  },
  {
    id: "u-apc-bejaia",
    label: { fr: "Président APC · Béjaïa", ar: "رئيس APC · بجاية" },
    role: "apc_president",
    email: "apc.bejaia@commune.dz",
    nom: { fr: "Haddad", ar: "حداد" },
    prenom: { fr: "Nadia", ar: "نادية" },
    territory: COMMUNE_BEJAIA,
  },
  {
    id: "u-apc-akbou",
    label: { fr: "Président APC · Akbou", ar: "رئيس APC · أقبو" },
    role: "apc_president",
    email: "apc.akbou@commune.dz",
    nom: { fr: "Belaïd", ar: "بلعيد" },
    prenom: { fr: "Samir", ar: "سمير" },
    territory: COMMUNE_AKBOU,
  },
  {
    id: "u-minister",
    label: { fr: "Ministre de l'Intérieur", ar: "وزير الداخلية" },
    role: "minister",
    email: "ministre@interieur.dz",
    nom: { fr: "Zerouali", ar: "زروالي" },
    prenom: { fr: "Mourad", ar: "مراد" },
    territory: NATIONAL,
  },
  {
    id: "u-agent-pc",
    label: { fr: "Agent · Protection civile · Béjaïa", ar: "عون · الحماية المدنية · بجاية" },
    role: "module_agent",
    email: "agent.pc@protection-civile.dz",
    nom: { fr: "Cherif", ar: "شريف" },
    prenom: { fr: "Yacine", ar: "ياسين" },
    moduleId: "module-1",
    territory: COMMUNE_BEJAIA,
    available: true,
  },
  {
    id: "u-agent-tp",
    label: { fr: "Agent · Travaux publics · Akbou", ar: "عون · الأشغال العمومية · أقبو" },
    role: "module_agent",
    email: "agent.tp@travaux-publics.dz",
    nom: { fr: "Ouali", ar: "والي" },
    prenom: { fr: "Lila", ar: "ليلى" },
    moduleId: "module-8",
    territory: COMMUNE_AKBOU,
    available: true,
  },
  {
    id: "u-agent-sante",
    label: { fr: "Agent · Santé · Béjaïa", ar: "عون · الصحة · بجاية" },
    role: "module_agent",
    email: "agent.sante@sante.dz",
    nom: { fr: "Saïdi", ar: "سعيدي" },
    prenom: { fr: "Rania", ar: "رانيا" },
    moduleId: "module-3",
    territory: WILAYA_BEJAIA,
    available: true,
  },
  {
    id: "u-manager-pc",
    label: { fr: "Responsable PCO · Protection civile · Béjaïa", ar: "مسؤول PCO · الحماية المدنية · بجاية" },
    role: "module_manager",
    email: "pco.pc@protection-civile.dz",
    nom: { fr: "Kaci", ar: "قاسي" },
    prenom: { fr: "Sofiane", ar: "سفيان" },
    moduleId: "module-1",
    territory: COMMUNE_BEJAIA,
  },
  {
    id: "u-manager-tp",
    label: { fr: "Responsable PCO · Travaux publics · Akbou", ar: "مسؤول PCO · الأشغال العمومية · أقبو" },
    role: "module_manager",
    email: "pco.tp@travaux-publics.dz",
    nom: { fr: "Bouzid", ar: "بوزيد" },
    prenom: { fr: "Hakim", ar: "حكيم" },
    moduleId: "module-8",
    territory: COMMUNE_AKBOU,
  },
  {
    id: "u-director-pc",
    label: { fr: "Directeur PCF · Protection civile · Béjaïa", ar: "مدير PCF · الحماية المدنية · بجاية" },
    role: "module_director",
    email: "pcf.pc@protection-civile.dz",
    nom: { fr: "Meziane", ar: "مزيان" },
    prenom: { fr: "Farid", ar: "فريد" },
    moduleId: "module-1",
    territory: WILAYA_BEJAIA,
  },
  {
    id: "u-director-tp",
    label: { fr: "Directeur PCF · Travaux publics · Béjaïa", ar: "مدير PCF · الأشغال العمومية · بجاية" },
    role: "module_director",
    email: "pcf.tp@travaux-publics.dz",
    nom: { fr: "Aït Ali", ar: "آيت علي" },
    prenom: { fr: "Djamel", ar: "جمال" },
    moduleId: "module-8",
    territory: WILAYA_BEJAIA,
  },
  {
    id: "u-director-sante",
    label: { fr: "Directeur PCF · Santé · Béjaïa", ar: "مدير PCF · الصحة · بجاية" },
    role: "module_director",
    email: "pcf.sante@sante.dz",
    nom: { fr: "Bensalem", ar: "بن سالم" },
    prenom: { fr: "Leïla", ar: "ليلى" },
    moduleId: "module-3",
    territory: WILAYA_BEJAIA,
  },
  {
    id: "u-director-forets",
    label: { fr: "Directeur PCF · Forêts · Béjaïa", ar: "مدير PCF · الغابات · بجاية" },
    role: "module_director",
    email: "pcf.forets@forets.dz",
    nom: { fr: "Amrani", ar: "العمراني" },
    prenom: { fr: "Youcef", ar: "يوسف" },
    moduleId: "module-10",
    territory: WILAYA_BEJAIA,
  },
  {
    id: "u-director-securite",
    label: { fr: "Directeur PCF · Sécurité · Béjaïa", ar: "مدير PCF · الأمن · بجاية" },
    role: "module_director",
    email: "pcf.securite@securite.dz",
    nom: { fr: "Guerroudj", ar: "قرواج" },
    prenom: { fr: "Nabil", ar: "نبيل" },
    moduleId: "module-2",
    territory: WILAYA_BEJAIA,
  },
];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  CITIZEN_DEMO_ACCOUNT,
  ADMIN_DEMO_ACCOUNT,
  ...STAFF_DEMO_ACCOUNTS,
];

export function demoAccountById(id: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((account) => account.id === id);
}

export function demoAccountByEmail(email: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((account) => account.email === email);
}

export function sessionFromAccount(account: DemoAccount, email = account.email): NewSession {
  return {
    email,
    userId: account.id,
    role: account.role,
    moduleId: account.moduleId,
    territory: account.territory,
    available: account.available,
  };
}

/**
 * Comptes de démonstration (aucun backend) : chaque compte fixe un rôle, un
 * rattachement et d'éventuelles désignations. Ils servent à la page de
 * connexion du personnel et au sélecteur de rôle du mode démo.
 */

import type { NewSession } from "./session";
import type { DesignationFn } from "./permissions";
import type { Localized, Role } from "./roles";

export type DemoAccount = {
  id: string;
  label: Localized;
  role: Role;
  designations: DesignationFn[];
  organismId?: string;
  territory?: NewSession["territory"];
  siteId?: string;
};

export const DEMO_WILAYA = { level: "wilaya", id: "wilaya-bejaia" } as const;
export const DEMO_COMMUNE = { level: "commune", id: "commune-bejaia" } as const;
export const DEMO_ORGANISM = "org-protection-civile";

export const AUTHORITY_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "wali",
    label: { fr: "Wali · Béjaïa", ar: "والي · بجاية" },
    role: "wali",
    designations: [],
    territory: DEMO_WILAYA,
  },
  {
    id: "apc_president",
    label: { fr: "Président de l'APC · Béjaïa", ar: "رئيس المجلس الشعبي البلدي · بجاية" },
    role: "apc_president",
    designations: [],
    territory: DEMO_COMMUNE,
  },
  {
    id: "minister",
    label: { fr: "Ministre de l'Intérieur", ar: "وزير الداخلية" },
    role: "minister",
    designations: [],
  },
  {
    id: "site_operator",
    label: { fr: "Exploitant de site sensible", ar: "مستغل موقع حساس" },
    role: "site_operator",
    designations: [],
    territory: DEMO_COMMUNE,
    siteId: "site-demo",
  },
];

export const ADMIN_DEMO_ACCOUNT: DemoAccount = {
  id: "admin",
  label: { fr: "Administrateur système", ar: "مسؤول النظام" },
  role: "admin",
  designations: [],
};

export function sessionFromAccount(account: DemoAccount, email: string): NewSession {
  return {
    email,
    userId: account.id,
    role: account.role,
    designations: account.designations,
    organismId: account.organismId,
    territory: account.territory,
    siteId: account.siteId,
  };
}

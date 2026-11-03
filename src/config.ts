// Chemins de l'application CADM v3.0.
// Un seul rôle par compte, un module et un territoire de rattachement.

// Espace citoyen
export const DASHBOARD_PATH = "/dashboard";
export const MY_REPORTS_PATH = "/my-reports";
export const SUBMIT_ALERT_PATH = "/submit-alert";
export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/register";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const ASSISTANT_PATH = "/assistant";
export const PUBLIC_INFO_PATH = "/information";

// Connexion du personnel (autorités et rôles de module)
export const STAFF_LOGIN_PATH = "/personnel/login";
export const LEGACY_RESP_PATH = "/responsable";

/**
 * Anciennes URL de connexion du personnel, fautes de frappe comprises.
 * Elles redirigent toutes vers `STAFF_LOGIN_PATH` (voir `App.tsx`).
 */
export const STAFF_LOGIN_ALIAS_PATHS: readonly string[] = [
  "/personel",
  "/personel/login",
  "/personnel",
  "/staff",
  "/staff/login",
  "/resp",
  "/resp/login",
  LEGACY_RESP_PATH,
  `${LEGACY_RESP_PATH}/login`,
];

// Mode démo
export const DEMO_MODE: boolean =
  Boolean(import.meta.env?.DEV) || import.meta.env?.VITE_DEMO === "1";

// Espace module (agent, responsable PCO, directeur PCF)
export const MODULE_DASHBOARD_PATH = "/module";
export const MODULE_ALERTS_PATH = "/module/alertes";
export const MODULE_INTERVENTIONS_PATH = "/module/interventions";
export const MODULE_TASKS_PATH = "/module/taches";
export const MODULE_AVAILABILITY_PATH = "/module/disponibilite";
export const MODULE_CALLS_PATH = "/module/appels";
export const MODULE_HISTORY_PATH = "/module/historique";

// Espace autorité (APC, wali, ministre)
export const AUTHORITY_DASHBOARD_PATH = "/autorite";
export const AUTHORITY_REQUESTS_PATH = "/autorite/demandes";
export const AUTHORITY_PLANS_PATH = "/autorite/plans";
export const AUTHORITY_ESCALATION_PATH = "/autorite/escalade";
export const AUTHORITY_ALERTS_PATH = "/autorite/alertes";
export const AUTHORITY_STAFF_PATH = "/autorite/effectifs";
export const AUTHORITY_EXERCISES_PATH = "/autorite/exercices";
export const AUTHORITY_SITUATION_PATH = "/autorite/situation";

// Espace administrateur système
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DASHBOARD_PATH = "/admin";
export const ADMIN_ACCOUNTS_PATH = "/admin/comptes";
export const ADMIN_ROLES_PATH = "/admin/roles";
export const ADMIN_TERRITORIES_PATH = "/admin/territoires";
export const ADMIN_MODULES_PATH = "/admin/modules";
export const ADMIN_TYPES_PATH = "/admin/types";
export const ADMIN_MATRIX_PATH = "/admin/matrice";
export const ADMIN_JOURNAL_PATH = "/admin/journal";

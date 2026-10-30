// Path of the citizen dashboard in the React app.
// Used after login ("Se connecter") and registration.
export const DASHBOARD_PATH = "/dashboard";

// Suivi des signalements envoyés par le citoyen connecté.
export const MY_REPORTS_PATH = "/my-reports";

// Authentication pages.
// "Se connecter" → /login, "Créer un compte" → /register.
export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/register";
export const FORGOT_PASSWORD_PATH = "/forgot-password";

// Espace citoyen : assistant accessible depuis l'en-tête.
export const ASSISTANT_PATH = "/assistant";

// Espace responsable de crise : connexion et accueil dédiés.
export const RESP_LOGIN_PATH = "/responsable/login";
export const RESP_DASHBOARD_PATH = "/responsable";
export const RESP_ASSISTANT_PATH = "/responsable/assistant";

// Espace autorité (wali, président de l'APC, ministre de l'Intérieur).
export const AUTHORITY_DASHBOARD_PATH = "/autorite";
export const AUTHORITY_PLAN_PATH = "/autorite/plan";
export const AUTHORITY_SITUATION_PATH = "/autorite/situation";
export const AUTHORITY_DECISIONS_PATH = "/autorite/decisions";
export const AUTHORITY_ALERTS_PATH = "/autorite/alertes";
export const AUTHORITY_CRISIS_PATH = "/autorite/crise";

// Espace site sensible (exploitant).
export const SITE_DASHBOARD_PATH = "/site";
export const SITE_PLAN_PATH = "/site/plan";
export const SITE_SIMULATIONS_PATH = "/site/simulations";
export const SITE_CONSIGNES_PATH = "/site/consignes";

// Espace organisme (S1, S3, S5, S7) : rôles de gestion, de veille et de terrain.
export const ORG_DASHBOARD_PATH = "/organisme";
export const ORG_REPORTS_PATH = "/organisme/signalements";
export const ORG_MISSIONS_PATH = "/organisme/missions";
export const ORG_RESOURCES_PATH = "/organisme/moyens";
export const ORG_REINFORCEMENTS_PATH = "/organisme/renforts";
export const ORG_WATCH_PATH = "/organisme/veille";
export const ORG_VICTIMS_PATH = "/organisme/victimes";
export const ORG_EVACUATION_PATH = "/organisme/evacuations";
export const ORG_PCO_PATH = "/organisme/pco";
export const ORG_PCF_PATH = "/organisme/pcf";
export const ORG_VEHICLE_PATH = "/organisme/engin";
export const ORG_HISTORY_PATH = "/organisme/historique";

// Espace administrateur système (S1).
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DASHBOARD_PATH = "/admin";
export const ADMIN_ASSISTANT_PATH = "/admin/assistant";
export const ADMIN_USERS_PATH = "/admin/utilisateurs";
export const ADMIN_TERRITORIES_PATH = "/admin/territoires";
export const ADMIN_ORGANISATIONS_PATH = "/admin/organisations";
export const ADMIN_SETTINGS_PATH = "/admin/parametres";
export const ADMIN_DOCUMENTS_PATH = "/admin/documents";
export const ADMIN_JOURNAL_PATH = "/admin/journal";

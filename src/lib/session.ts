// Session utilisateur (démo) : l'application n'a pas encore de backend d'authentification.
// On conserve un simple indicateur dans le localStorage pour savoir si le visiteur
// est connecté, afin de pouvoir conditionner l'accès à certaines pages.

const SESSION_KEY = "cadm-session";

export type Session = {
  email: string;
  phone?: string;
  createdAt: number;
};

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return typeof parsed?.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function signIn(email: string, phone?: string): void {
  try {
    const session: Session = { email, phone, createdAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

export function signOut(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

/* ------------------------------------------------------------------
   Espace responsable de crise — session indépendante de celle du
   citoyen, avec sa propre page de connexion.
   ------------------------------------------------------------------ */

const RESP_SESSION_KEY = "cadm-resp-session";

export type RespSession = {
  email: string;
  role: "responsable";
  createdAt: number;
};

export function getRespSession(): RespSession | null {
  try {
    const raw = localStorage.getItem(RESP_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RespSession;
    return typeof parsed?.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function signInResp(email: string): void {
  try {
    const session: RespSession = {
      email,
      role: "responsable",
      createdAt: Date.now(),
    };
    localStorage.setItem(RESP_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

export function signOutResp(): void {
  try {
    localStorage.removeItem(RESP_SESSION_KEY);
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

/* ------------------------------------------------------------------
   Espace administrateur système (S1) — session indépendante.
   ------------------------------------------------------------------ */

const ADMIN_SESSION_KEY = "cadm-admin-session";

export type AdminSession = {
  email: string;
  role: "admin";
  createdAt: number;
};

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    return typeof parsed?.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function signInAdmin(email: string): void {
  try {
    const session: AdminSession = {
      email,
      role: "admin",
      createdAt: Date.now(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

export function signOutAdmin(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

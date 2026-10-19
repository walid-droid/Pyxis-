// Session utilisateur (démo) : l'application n'a pas encore de backend d'authentification.
// On conserve un simple indicateur dans le localStorage pour savoir si le visiteur
// est connecté, afin de pouvoir conditionner l'accès à certaines pages.

const SESSION_KEY = "safedz-session";

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

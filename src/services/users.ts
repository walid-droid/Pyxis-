import type { Role } from "../auth/roles";
import { ROLE_DEFS } from "../auth/roles";
import { updateSession } from "../auth/session";
import type { User } from "./model";
import { appendJournal, newId, nowIso, updateDb } from "./store";

export type UserInput = {
  prenom: { fr: string; ar: string };
  nom: { fr: string; ar: string };
  email: string;
  role: Role;
  moduleId?: string;
  territoryId?: string;
  actif?: boolean;
};

/** Empreinte locale de démonstration (jamais un mot de passe en clair). */
export function hashPassword(password: string): string {
  let hash = 2166136261;
  for (let index = 0; index < password.length; index += 1) {
    hash ^= password.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16)}`;
}

export function createUser(input: UserInput, actorId: string, password = "cadm-demo"): User | undefined {
  return updateDb((db) => {
    if (db.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
      return undefined;
    }
    const user: User = {
      id: newId("u"),
      nom: input.nom,
      prenom: input.prenom,
      email: input.email,
      motDePasseHash: hashPassword(password),
      role: input.role,
      moduleId: ROLE_DEFS[input.role].needsModule ? input.moduleId : undefined,
      territoryId: input.territoryId,
      disponible: input.role === "module_agent" ? false : undefined,
      actif: input.actif ?? true,
      createdAt: nowIso(),
    };
    db.users.push(user);
    appendJournal(
      db,
      actorId,
      "CREATION_COMPTE",
      user.id,
      `Compte ${input.email} créé avec le rôle ${input.role}.`,
    );
    return user;
  });
}

export function updateUser(
  userId: string,
  input: Partial<UserInput>,
  actorId: string,
): User | undefined {
  return updateDb((db) => {
    const user = db.users.find((item) => item.id === userId);
    if (!user) return undefined;
    if (input.nom) user.nom = input.nom;
    if (input.prenom) user.prenom = input.prenom;
    if (input.email) user.email = input.email;
    if (input.role) {
      user.role = input.role;
      if (!ROLE_DEFS[input.role].needsModule) user.moduleId = undefined;
    }
    if (input.moduleId !== undefined || (input.role && !ROLE_DEFS[input.role].needsModule)) {
      user.moduleId = input.moduleId;
    }
    if (input.territoryId !== undefined) user.territoryId = input.territoryId;
    if (input.actif !== undefined) user.actif = input.actif;
    appendJournal(db, actorId, "MODIFICATION_COMPTE", user.id, `Compte ${user.email} modifié.`);
    return user;
  });
}

export function setUserActive(userId: string, actif: boolean, actorId: string): void {
  updateDb((db) => {
    const user = db.users.find((item) => item.id === userId);
    if (!user) return;
    user.actif = actif;
    appendJournal(
      db,
      actorId,
      actif ? "ACTIVATION_COMPTE" : "DESACTIVATION_COMPTE",
      user.id,
      `Compte ${user.email} ${actif ? "activé" : "désactivé"}.`,
    );
  });
}

/** L'agent bascule sa disponibilité ; la session reflète immédiatement l'état. */
export function toggleAvailability(userId: string): boolean {
  let next = false;
  updateDb((db) => {
    const user = db.users.find((item) => item.id === userId);
    if (!user) return;
    user.disponible = !user.disponible;
    next = user.disponible;
    appendJournal(
      db,
      userId,
      "DISPONIBILITE",
      user.id,
      `Disponibilité : ${user.disponible ? "disponible" : "indisponible"}.`,
    );
  });
  updateSession({ available: next });
  return next;
}

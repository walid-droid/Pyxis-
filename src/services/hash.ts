/**
 * Scellement de démonstration pour les pièces d'audit ORSEC.
 * Un vrai déploiement utiliserait SHA-256 côté serveur ; ici le calcul reste
 * local, déterministe et vérifiable pour illustrer le chaînage append-only.
 */

export const GENESIS_HASH = "00000000";

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function sealHash(...parts: Array<string | number | undefined>): string {
  const payload = parts.map((part) => (part === undefined ? "" : String(part))).join("|");
  return `${fnv1a(payload)}${fnv1a(`salt:${payload}`)}`;
}

export type MainCouranteSealInput = {
  at: string;
  authorId: string;
  scope: string;
  category: string;
  messageFr: string;
  messageAr: string;
  prevHash: string;
  moduleId?: string;
  planId?: string;
  coordinates?: [number, number];
  amendmentOf?: string;
};

/** Empreinte d'une entrée de main courante, identique au seed et au service. */
export function mainCouranteHash(input: MainCouranteSealInput): string {
  return sealHash(
    input.at,
    input.authorId,
    input.scope,
    input.category,
    input.messageFr,
    input.messageAr,
    input.prevHash,
    input.moduleId,
    input.planId,
    input.coordinates ? input.coordinates.join(",") : undefined,
    input.amendmentOf,
  );
}


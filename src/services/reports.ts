import { FIRST_WAVE } from "../data/moduleParType";
import type { User } from "./model";
import type { Db, Gravity, NewSignalementInput, Signalement } from "./model";
import { pushNotification } from "./notifications";
import { userCoversCommune } from "./scope";
import { appendJournal, newId, nowIso, updateDb } from "./store";
import { findType, findUser } from "./selectors";

function communeName(db: Db, id: string): { fr: string; ar: string } {
  const territory = db.reference.territories.find((item) => item.id === id);
  return territory?.nom ?? { fr: id, ar: id };
}

function typeName(db: Db, code: string): { fr: string; ar: string } {
  return findType(db, code as Signalement["typeId"])?.libelle ?? { fr: code, ar: code };
}

export function moduleRecipients(db: Db, moduleId: string, communeId: string): User[] {
  return db.users.filter(
    (user) =>
      user.actif &&
      user.moduleId === moduleId &&
      ["module_agent", "module_manager", "module_director"].includes(user.role) &&
      userCoversCommune(db, user, communeId),
  );
}

/**
 * Étape 1 : crée le signalement et le route vers les modules de premier envoi.
 * Aucune notification n'est envoyée au maire ni au wali (RG-O02/RG-O07/RG-O18).
 */
export function createSignalement(input: NewSignalementInput): Signalement {
  return updateDb((db) => {
    const signalement: Signalement = {
      id: newId("sig"),
      auteurId: input.auteurId,
      typeId: input.typeId,
      description: input.description,
      communeId: input.communeId,
      latitude: input.latitude,
      longitude: input.longitude,
      photo: input.photo,
      personnesConcernees: input.personnesConcernees,
      etat: "non_verifie",
      creeLe: nowIso(),
      suggestion: input.suggestion,
    };
    db.signalements.unshift(signalement);

    const modules = FIRST_WAVE[input.typeId] ?? [];
    modules.forEach((moduleNo) => {
      const moduleId = `module-${moduleNo}`;
      const recipients = moduleRecipients(db, moduleId, input.communeId);
      if (recipients.length === 0) {
        db.routages.push({
          id: newId("rout"),
          signalementId: signalement.id,
          moduleId,
          destinataireId: "",
          envoyeLe: signalement.creeLe,
        });
        return;
      }
      recipients.forEach((recipient) => {
        db.routages.push({
          id: newId("rout"),
          signalementId: signalement.id,
          moduleId,
          destinataireId: recipient.id,
          envoyeLe: signalement.creeLe,
        });
        pushNotification(
          db,
          recipient.id,
          "alerte_module",
          {
            fr: `Alerte module — ${input.typeId}`,
            ar: `تنبيه وحدة — ${input.typeId}`,
          },
          {
            fr: `${typeName(db, input.typeId).fr} signalé à ${communeName(db, input.communeId).fr}. Signalement ${signalement.id}.`,
            ar: `${typeName(db, input.typeId).ar} مُبلّغ عنه في ${communeName(db, input.communeId).ar}. التبليغ ${signalement.id}.`,
          },
        );
      });
    });

    appendJournal(
      db,
      input.auteurId,
      "CREATION_SIGNALEMENT",
      signalement.id,
      `Signalement ${input.typeId} reçu et routé automatiquement vers les modules ${modules.join(", ")}.`,
    );
    return signalement;
  });
}

export function confirmSignalement(
  signalementId: string,
  acteurId: string,
  gravite: Gravity,
  moduleId: string,
): Signalement | undefined {
  return updateDb((db) => {
    const signalement = db.signalements.find((item) => item.id === signalementId);
    if (!signalement || signalement.etat !== "non_verifie") return undefined;
    signalement.etat = "confirme";
    signalement.gravite = gravite;
    signalement.confirmeLe = nowIso();
    signalement.traiteParModuleId = moduleId;
    db.routages
      .filter((routage) => routage.signalementId === signalementId)
      .forEach((routage) => {
        if (!routage.luLe) routage.luLe = signalement.confirmeLe;
      });

    const module = db.reference.modules.find((item) => item.id === moduleId);
    pushNotification(
      db,
      signalement.auteurId,
      "systeme",
      { fr: "Signalement confirmé", ar: "تم تأكيد التبليغ" },
      {
        fr: `Votre signalement ${signalement.id} a été confirmé par le module ${module?.nom.fr ?? moduleId}. Gravité : ${gravite}.`,
        ar: `تم تأكيد تبليغكم ${signalement.id} من طرف وحدة ${module?.nom.ar ?? moduleId}. الخطورة: ${gravite}.`,
      },
    );
    appendJournal(
      db,
      acteurId,
      "CONFIRMATION_SIGNALEMENT",
      signalement.id,
      `Signalement confirmé par ${moduleId}, gravité ${gravite}.`,
    );
    return signalement;
  });
}

export function rejectSignalement(
  signalementId: string,
  acteurId: string,
  moduleId: string,
  motif?: string,
): Signalement | undefined {
  return updateDb((db) => {
    const signalement = db.signalements.find((item) => item.id === signalementId);
    if (!signalement || signalement.etat !== "non_verifie") return undefined;
    signalement.etat = "rejete";
    signalement.rejeteLe = nowIso();
    signalement.traiteParModuleId = moduleId;
    pushNotification(
      db,
      signalement.auteurId,
      "refus",
      { fr: "Signalement rejeté", ar: "تم رفض التبليغ" },
      {
        fr: `Votre signalement ${signalement.id} a été rejeté.${motif ? ` Motif : ${motif}` : ""}`,
        ar: `تم رفض تبليغكم ${signalement.id}.${motif ? ` السبب: ${motif}` : ""}`,
      },
    );
    appendJournal(
      db,
      acteurId,
      "REJET_SIGNALEMENT",
      signalement.id,
      `Signalement rejeté par ${moduleId}${motif ? ` : ${motif}` : "."}`,
    );
    return signalement;
  });
}

export function changeGravity(
  signalementId: string,
  acteurId: string,
  gravite: Gravity,
  motif: string,
): void {
  updateDb((db) => {
    const signalement = db.signalements.find((item) => item.id === signalementId);
    if (!signalement) return;
    const previous = signalement.gravite;
    signalement.gravite = gravite;
    appendJournal(
      db,
      acteurId,
      "CHANGEMENT_GRAVITE",
      signalement.id,
      `Gravité ${previous ?? "non fixée"} → ${gravite}. Motif : ${motif}.`,
    );
  });
}

export function markRoutingRead(routageId: string): void {
  updateDb((db) => {
    const routage = db.routages.find((item) => item.id === routageId);
    if (routage && !routage.luLe) routage.luLe = nowIso();
  });
}

export function reportModules(db: Db, signalementId: string): string[] {
  return Array.from(
    new Set(
      db.routages
        .filter((routage) => routage.signalementId === signalementId)
        .map((routage) => routage.moduleId),
    ),
  );
}

export function reportAuthor(db: Db, signalement: Signalement): User | undefined {
  return findUser(db, signalement.auteurId);
}

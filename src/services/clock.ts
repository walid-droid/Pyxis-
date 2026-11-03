import type { DemandeDeclenchement } from "./model";
import { pushNotification } from "./notifications";
import { authorityOf } from "./scope";
import { appendJournal, getDb, nowIso, updateDb } from "./store";

/** Délai configurable avant relance de l'Horloge (spec §4, constante). */
export const ESCALATION_REMINDER_MINUTES = 30;

export function minutesSince(iso: string, now = Date.now()): number {
  return Math.floor((now - Date.parse(iso)) / 60_000);
}

export function reminderDue(demande: DemandeDeclenchement, now = Date.now()): boolean {
  if (demande.etat !== "en_attente") return false;
  const last = demande.relances.length > 0 ? demande.relances[demande.relances.length - 1] : demande.creeLe;
  return minutesSince(last, now) >= ESCALATION_REMINDER_MINUTES;
}

/**
 * Horloge de la plateforme : relance les autorités qui n'ont pas répondu.
 * Appelée à l'ouverture de l'espace autorité ; elle n'agit que sur les
 * demandes en attente et n'invente aucune décision.
 */
export function runClock(): number {
  const pending = getDb().demandes.filter((demande) => reminderDue(demande));
  if (pending.length === 0) return 0;

  let reminded = 0;
  updateDb((db) => {
    db.demandes.forEach((demande) => {
      if (!reminderDue(demande)) return;
      const relance = nowIso();
      demande.relances.push(relance);
      authorityOf(db, demande.niveauDemande, demande.territoireId).forEach((autorite) => {
        pushNotification(
          db,
          autorite.id,
          "relance",
          { fr: "Relance — demande sans réponse", ar: "تذكير — طلب دون رد" },
          {
            fr: `La demande ${demande.id} attend toujours une décision depuis ${minutesSince(demande.creeLe)} minutes.`,
            ar: `الطلب ${demande.id} ينتظر قراراً منذ ${minutesSince(demande.creeLe)} دقيقة.`,
          },
        );
      });
      appendJournal(
        db,
        "systeme-horloge",
        "RELANCE_HORLOGE",
        demande.id,
        `Relance automatique après ${ESCALATION_REMINDER_MINUTES} minutes sans réponse.`,
      );
      reminded += 1;
    });
  });
  return reminded;
}

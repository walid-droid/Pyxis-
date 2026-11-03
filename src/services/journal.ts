import type { Db, JournalEntry } from "./model";

/** Journal en lecture seule : jamais modifié ni supprimé par l'application. */
export function journalEntries(db: Db): JournalEntry[] {
  return [...db.journal].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function journalFor(db: Db, acteurId: string): JournalEntry[] {
  return journalEntries(db).filter((entry) => entry.acteurId === acteurId);
}

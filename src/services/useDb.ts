import { useSyncExternalStore } from "react";
import { getDb, subscribeDb } from "./store";

/** Abonnement React à la base locale (mock + localStorage). */
export function useDb() {
  return useSyncExternalStore(subscribeDb, getDb, getDb);
}

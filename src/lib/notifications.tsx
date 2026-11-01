import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadReadNotificationIds,
  NOTIFICATIONS_STORAGE_KEY,
  NotificationsContext,
  SEED_NOTIFICATIONS,
  type AppNotification,
  type NotificationsContextValue,
} from "./notificationsContext";

/** Fournit l'état des notifications à toute l'application. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [readIds, setReadIds] = useState<string[]>(loadReadNotificationIds);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(readIds));
    } catch {
      // Stockage indisponible (navigation privée) : l'état reste en mémoire.
    }
  }, [readIds]);

  const markRead = useCallback((id: string) => {
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((current) => {
      const merged = new Set(current);
      items.forEach((item) => merged.add(item.id));
      return [...merged];
    });
  }, [items]);

  const push = useCallback(
    (notification: Omit<AppNotification, "id" | "time">) => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
      const id = `n-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((current) => [{ ...notification, id, time }, ...current]);
    },
    [],
  );

  const value = useMemo<NotificationsContextValue>(() => {
    const readSet = new Set(readIds);
    return {
      items,
      unreadCount: items.filter((item) => !readSet.has(item.id)).length,
      isRead: (id: string) => readSet.has(id),
      markRead,
      markAllRead,
      push,
    };
  }, [items, readIds, markRead, markAllRead, push]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

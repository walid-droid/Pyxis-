import { createContext, useContext } from "react";

/** Nature d'une notification : détermine sa couleur et son icône. */
export type NotificationKind =
  | "alert"
  | "mission"
  | "reinforcement"
  | "plan"
  | "system";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  /** Clé i18n du titre (voir src/i18n/notifications.ts). */
  titleKey: string;
  /** Clé i18n du détail. */
  detailKey: string;
  /** Heure d'émission, déjà formatée pour la démonstration. */
  time: string;
};

export const NOTIFICATIONS_STORAGE_KEY = "cadm-notifications-read";

/** Notifications de démonstration communes à tous les espaces. */
export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "seed-alert-1",
    kind: "alert",
    titleKey: "notif.seed.alert.title",
    detailKey: "notif.seed.alert.detail",
    time: "08:50",
  },
  {
    id: "seed-plan-1",
    kind: "plan",
    titleKey: "notif.seed.plan.title",
    detailKey: "notif.seed.plan.detail",
    time: "08:12",
  },
  {
    id: "seed-mission-1",
    kind: "mission",
    titleKey: "notif.seed.mission.title",
    detailKey: "notif.seed.mission.detail",
    time: "07:45",
  },
  {
    id: "seed-reinforcement-1",
    kind: "reinforcement",
    titleKey: "notif.seed.reinforcement.title",
    detailKey: "notif.seed.reinforcement.detail",
    time: "07:20",
  },
];

export function loadReadNotificationIds(): string[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export type NotificationsContextValue = {
  items: AppNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** Ajoute une notification en tête de liste (action utilisateur). */
  push: (notification: Omit<AppNotification, "id" | "time">) => void;
};

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  }
  return context;
}

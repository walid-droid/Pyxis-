import type { Localized } from "../data/locale";
import type { Db, Notification, NotificationEvent } from "./model";
import { newId, nowIso, updateDb } from "./store";

export function pushNotification(
  db: Db,
  destinataireId: string,
  typeEvenement: NotificationEvent,
  objet: Localized,
  message: Localized,
  canal: Notification["canal"] = "app",
): Notification {
  const notification: Notification = {
    id: newId("notif"),
    destinataireId,
    typeEvenement,
    objet,
    message,
    canal,
    creeLe: nowIso(),
  };
  db.notifications.unshift(notification);
  return notification;
}

export function markNotificationRead(notificationId: string): void {
  updateDb((db) => {
    const notification = db.notifications.find((item) => item.id === notificationId);
    if (notification && !notification.lueLe) notification.lueLe = nowIso();
  });
}

export function markAllNotificationsRead(userId: string): void {
  updateDb((db) => {
    db.notifications.forEach((notification) => {
      if (notification.destinataireId === userId && !notification.lueLe) {
        notification.lueLe = nowIso();
      }
    });
  });
}

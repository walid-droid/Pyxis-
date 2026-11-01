import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useNotifications } from "../lib/notificationsContext";
import type { NotificationKind } from "../lib/notificationsContext";
import "./NotificationCenter.css";

const KIND_LABEL_KEY: Record<NotificationKind, string> = {
  alert: "notif.kind.alert",
  mission: "notif.kind.mission",
  reinforcement: "notif.kind.reinforcement",
  plan: "notif.kind.plan",
  system: "notif.kind.system",
};

/**
 * Cloche de notifications avec panneau déroulant.
 * Socle commun : présent dans la barre supérieure de tous les espaces.
 */
export default function NotificationCenter() {
  const { t } = useI18n();
  const { items, unreadCount, isRead, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="notif" ref={rootRef}>
      <button
        type="button"
        className={`notif__bell${open ? " is-open" : ""}`}
        aria-label={t("notif.open")}
        title={t("notif.bell")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="notif-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="notif__count" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id="notif-panel"
          className="notif__panel"
          role="dialog"
          aria-label={t("notif.title")}
        >
          <header className="notif__head">
            <p className="notif__title">{t("notif.title")}</p>
            {unreadCount > 0 ? (
              <span className="notif__unread">
                {t("notif.unread", { count: unreadCount })}
              </span>
            ) : null}
          </header>

          {items.length === 0 ? (
            <p className="notif__empty">{t("notif.empty")}</p>
          ) : (
            <ul className="notif__list">
              {items.map((item) => {
                const read = isRead(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`notif__item${read ? " is-read" : ""}`}
                      onClick={() => markRead(item.id)}
                    >
                      <span
                        className={`notif__dot notif__dot--${item.kind}`}
                        aria-hidden="true"
                      />
                      <span className="notif__body">
                        <span className="notif__item-title">
                          {t(item.titleKey)}
                        </span>
                        <span className="notif__item-detail">
                          {t(item.detailKey)}
                        </span>
                        <span className="notif__meta">
                          <span className="notif__kind">
                            {t(KIND_LABEL_KEY[item.kind])}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.time}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className="notif__foot">
            <button
              type="button"
              className="notif__mark"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              {t("notif.markAll")}
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

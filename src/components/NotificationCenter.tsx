import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n";
import { markAllNotificationsRead, markNotificationRead } from "../services/notifications";
import { notificationsFor } from "../services/selectors";
import { useDb } from "../services/useDb";
import type { NotificationEvent } from "../services/model";
import "./NotificationCenter.css";

type Kind = "alert" | "mission" | "reinforcement" | "plan" | "system";

const KIND_LABEL_KEY: Record<Kind, string> = {
  alert: "notif.kind.alert",
  mission: "notif.kind.mission",
  reinforcement: "notif.kind.reinforcement",
  plan: "notif.kind.plan",
  system: "notif.kind.system",
};

function kindOf(event: NotificationEvent): Kind {
  if (event === "alerte_module" || event === "demande_declenchement" || event === "relance") {
    return "alert";
  }
  if (event === "participation") return "mission";
  if (event === "appui") return "reinforcement";
  if (event === "plan_declenche" || event === "plan_en_alerte" || event === "mise_en_alerte" || event === "levee") {
    return "plan";
  }
  return "system";
}

function formatTime(iso: string, lang: "fr" | "ar"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cloche de notifications avec panneau déroulant.
 * Les notifications sont stockées dans la base locale, par destinataire.
 */
export default function NotificationCenter() {
  const { t, lang } = useI18n();
  const { session } = useAuth();
  const db = useDb();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const items = session ? notificationsFor(db, session.userId) : [];
  const unreadCount = items.filter((item) => !item.lueLe).length;

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
                const read = Boolean(item.lueLe);
                const kind = kindOf(item.typeEvenement);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`notif__item${read ? " is-read" : ""}`}
                      onClick={() => markNotificationRead(item.id)}
                    >
                      <span className={`notif__dot notif__dot--${kind}`} aria-hidden="true" />
                      <span className="notif__body">
                        <span className="notif__item-title">{item.objet[lang]}</span>
                        <span className="notif__item-detail">{item.message[lang]}</span>
                        <span className="notif__meta">
                          <span className="notif__kind">{t(KIND_LABEL_KEY[kind])}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatTime(item.creeLe, lang)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {unreadCount > 0 && session ? (
            <button
              type="button"
              className="notif__mark-all"
              onClick={() => markAllNotificationsRead(session.userId)}
            >
              {t("notif.markAll")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

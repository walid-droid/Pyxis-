import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import {
  PERMISSION_GROUPS,
  type BadgeTone,
} from "./adminData";

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

export type IconName =
  | "dashboard"
  | "users"
  | "map"
  | "building"
  | "settings"
  | "document"
  | "plus"
  | "search"
  | "shield"
  | "check"
  | "close"
  | "edit"
  | "trash"
  | "link"
  | "unlink"
  | "upload"
  | "refresh"
  | "eye"
  | "download"
  | "arrow"
  | "globe"
  | "lock"
  | "activity"
  | "alert"
  | "database"
  | "sparkles"
  | "clock"
  | "mail"
  | "phone"
  | "layers"
  | "key"
  | "power"
  | "filter"
  | "userPlus"
  | "more"
  | "arrowUp"
  | "arrowDown"
  | "reject"
  | "calendar"
  | "userCheck"
  | "flag";

function paths(name: IconName): ReactNode {
  switch (name) {
    case "dashboard":
      return (
        <>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </>
      );
    case "users":
      return (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M16 5.5a3 3 0 0 1 0 5" />
          <path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
        </>
      );
    case "map":
      return (
        <>
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
          <path d="M9 4v14M15 6v14" />
        </>
      );
    case "building":
      return (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.7h.09A1.7 1.7 0 0 0 10.12 3.1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.3 9v.09a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </>
      );
    case "document":
      return (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </>
      );
    case "plus":
      return <path d="M12 5v14M5 12h14" />;
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
    case "check":
      return <path d="m5 12 5 5L20 7" />;
    case "close":
      return <path d="M18 6 6 18M6 6l12 12" />;
    case "edit":
      return (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
      );
    case "trash":
      return (
        <>
          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
          <path d="M10 11v5M14 11v5" />
        </>
      );
    case "link":
      return (
        <>
          <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1L11 5" />
          <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1L13 19" />
        </>
      );
    case "unlink":
      return (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 13.4a5 5 0 0 0 7 0l1.5-1.5a5 5 0 0 0-1.4-8" />
          <path d="M13.4 10.6a5 5 0 0 0-7 0L4.9 12a5 5 0 0 0 1.4 8" />
        </>
      );
    case "upload":
      return (
        <>
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </>
      );
    case "refresh":
      return (
        <>
          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
          <path d="M21 3v6h-6" />
        </>
      );
    case "eye":
      return (
        <>
          <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </>
      );
    case "download":
      return (
        <>
          <path d="M12 4v12M7 11l5 5 5-5" />
          <path d="M4 20h16" />
        </>
      );
    case "arrow":
      return <path d="M5 12h14M13 6l6 6-6 6" />;
    case "globe":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </>
      );
    case "lock":
      return (
        <>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
        </>
      );
    case "activity":
      return <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />;
    case "alert":
      return (
        <>
          <path d="M12 3 2 20h20L12 3Z" />
          <path d="M12 9v5M12 17.5v.1" />
        </>
      );
    case "database":
      return (
        <>
          <ellipse cx="12" cy="5.5" rx="8" ry="2.5" />
          <path d="M4 5.5v13c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-13" />
          <path d="M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5" />
        </>
      );
    case "sparkles":
      return (
        <>
          <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
          <path d="M18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16Z" />
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      );
    case "mail":
      return (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </>
      );
    case "phone":
      return (
        <path d="M6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2L21 15v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />
      );
    case "layers":
      return (
        <>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 13 9 5 9-5M3 17l9 5 9-5" />
        </>
      );
    case "key":
      return (
        <>
          <circle cx="8" cy="8" r="4" />
          <path d="m11 11 9 9M17 17l2-2M14 14l2-2" />
        </>
      );
    case "power":
      return (
        <>
          <path d="M12 3v8" />
          <path d="M6.3 6.3a8 8 0 1 0 11.4 0" />
        </>
      );
    case "filter":
      return <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />;
    case "userPlus":
      return (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M18 8v6M15 11h6" />
        </>
      );
    case "more":
      return (
        <>
          <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </>
      );
    case "arrowUp":
      return <path d="M12 19V5M6 11l6-6 6 6" />;
    case "arrowDown":
      return <path d="M12 5v14M6 13l6 6 6-6" />;
    case "reject":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6M15 9l-6 6" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </>
      );
    case "userCheck":
      return (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="m16 11 2 2 4-4" />
        </>
      );
    case "flag":
      return (
        <>
          <path d="M5 21V4" />
          <path d="M5 5h11l-1.5 4L16 13H5" />
        </>
      );
    default:
      return null;
  }
}

export function AdminIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={className ? `ad-icon ${className}` : "ad-icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths(name)}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau de page                                                     */
/* ------------------------------------------------------------------ */

export function AdminHero({
  eyebrow,
  title,
  lead,
  chips,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  chips?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="ad-hero">
      <div className="ad-hero__text">
        <p className="ad-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="ad-hero__lead">{lead}</p>
        {chips && <div className="ad-hero__meta">{chips}</div>}
      </div>
      {actions && <div className="ad-hero__aside">{actions}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Petits éléments                                                     */
/* ------------------------------------------------------------------ */

export function AdminBadge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span className={`ad-badge ad-badge--${tone}`}>{children}</span>
  );
}

/* ------------------------------------------------------------------ */
/* Menu d'actions secondaires                                          */
/* ------------------------------------------------------------------ */

export type AdminActionItem = {
  id: string;
  label: string;
  icon?: IconName;
  tone?: "danger";
  disabled?: boolean;
  onSelect: () => void;
};

export function AdminActionMenu({
  label,
  items,
}: {
  label: string;
  items: AdminActionItem[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span className="ad-menu-wrap" ref={root}>
      <button
        type="button"
        className="ad-icon-btn"
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <AdminIcon name="more" />
      </button>

      {open && (
        <span className="ad-menu" role="menu" aria-label={label}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={`ad-menu__item${
                item.tone === "danger" ? " ad-menu__item--danger" : ""
              }`}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon && <AdminIcon name={item.icon} />}
              {item.label}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* En-tête de colonne triable                                          */
/* ------------------------------------------------------------------ */

export type SortDirection = "asc" | "desc";

export function AdminSortHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <th aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className={`ad-sort${active ? " is-active" : ""}`}
        onClick={onClick}
      >
        {label}
        <AdminIcon name={active && direction === "desc" ? "arrowDown" : "arrowUp"} />
      </button>
    </th>
  );
}

export function AdminToggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`ad-switch${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="ad-switch__track" aria-hidden="true">
        <span className="ad-switch__thumb" />
      </span>
      {label && <span className="ad-switch__label">{label}</span>}
    </button>
  );
}

export function AdminProgress({
  value,
  label,
  valueLabel,
  tone = "green",
  showHeader = true,
}: {
  value: number;
  label: string;
  valueLabel?: string;
  tone?: "green" | "amber" | "red" | "blue" | "violet";
  showHeader?: boolean;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="ad-progress">
      {showHeader && (
        <div className="ad-progress__top">
          <span className="ad-progress__label">{label}</span>
          <span className="ad-progress__value">
            {valueLabel ?? `${percent} %`}
          </span>
        </div>
      )}
      <span className="ad-progress__track" aria-label={label}>
        <span
          className={`ad-progress__fill ad-progress__fill--${tone}`}
          style={{ width: `${percent}%` }}
        />
      </span>
    </div>
  );
}

export function AdminEmpty({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ad-empty">
      <span className="ad-empty__icon">
        <AdminIcon name="search" />
      </span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function AdminSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className="ad-search">
      <AdminIcon name="search" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function AdminField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="ad-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="ad-field__hint">{hint}</p>}
    </div>
  );
}

export function AdminToast({
  message,
  tone = "success",
}: {
  message: string;
  tone?: "success" | "warning";
}) {
  return (
    <p className={`ad-toast ad-toast--${tone}`} role="status">
      <AdminIcon name={tone === "success" ? "check" : "alert"} />
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Permission matrix                                                   */
/* ------------------------------------------------------------------ */

export function PermissionMatrix({
  selected,
  onToggle,
  disabled = false,
  excluded = [],
}: {
  selected: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
  excluded?: string[];
}) {
  const { t } = useI18n();

  return (
    <div className="ad-perm-grid">
      {PERMISSION_GROUPS.map((group) => (
        <fieldset key={group.id} className="ad-perm-group">
          <legend>{t(group.labelKey)}</legend>
          <div className="ad-perm-list">
            {group.permissions.map((permission) => {
              const inherited = excluded.includes(permission.id);
              const checked =
                inherited || selected.includes(permission.id);
              return (
                <label
                  key={permission.id}
                  className={`ad-perm${checked ? " is-checked" : ""}${
                    inherited ? " is-locked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || inherited}
                    onChange={() => onToggle(permission.id)}
                  />
                  <span className="ad-perm__box" aria-hidden="true">
                    {checked && <AdminIcon name="check" />}
                  </span>
                  <span>{t(permission.labelKey)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modale                                                              */
/* ------------------------------------------------------------------ */

export function AdminModal({
  title,
  onClose,
  children,
  className,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      className={className ? `ad-modal ${className}` : "ad-modal"}
    >
      {children}
    </Modal>
  );
}

export function AdminModalActions({
  onClose,
  submitLabel,
  submitType = "submit",
  onConfirm,
  disabled = false,
  tone = "green",
}: {
  onClose: () => void;
  submitLabel: string;
  submitType?: "submit" | "button";
  onConfirm?: () => void;
  disabled?: boolean;
  tone?: "green" | "danger" | "primary";
}) {
  const { t } = useI18n();
  return (
    <div className="ad-modal__actions">
      <button type="button" className="ad-btn ad-btn--soft" onClick={onClose}>
        {t("common.cancel")}
      </button>
      <button
        type={submitType}
        className={`ad-btn ad-btn--${tone}`}
        disabled={disabled}
        onClick={onConfirm}
      >
        {submitLabel}
      </button>
    </div>
  );
}

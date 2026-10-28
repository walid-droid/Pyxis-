import type { KeyboardEvent, ReactNode } from "react";
import type { Severity, Warning } from "../mockdata/warning.ts";
import { useI18n } from "../i18n";
import "./WarningCard.css";

type WarningCardStatus = {
  label: string;
  icon?: ReactNode;
  className?: string;
};

type WarningCardProps = {
  warning: Warning;
  /** When provided, the card becomes selectable (used to locate it on the map). */
  onClick?: () => void;
  active?: boolean;
  /** Extra class for contextual variants (for example, staff report cards). */
  className?: string;
  /** Replaces the verification label in the top-right corner. */
  status?: WarningCardStatus;
  /** Replaces the incident icon with contextual media (for example, a photo). */
  media?: ReactNode;
  /** Adds a meta entry before the location. */
  metaExtra?: ReactNode;
  /** i18n key for the source label. */
  sourceLabelKey?: string;
  /** Extra content rendered after the source block. */
  extra?: ReactNode;
  /** Replaces the default "view map" action. */
  actions?: ReactNode;
};

/**
 * Impact wording is a presentation label derived directly from the existing
 * severity level. The data model does not store a separate impact assessment.
 */
const SEVERITY_META: Record<
  Severity,
  { gravityKey: string; impactKey: string }
> = {
  Low: { gravityKey: "alerts.gravity.low", impactKey: "alerts.impact.low" },
  Medium: {
    gravityKey: "alerts.gravity.medium",
    impactKey: "alerts.impact.medium",
  },
  High: { gravityKey: "alerts.gravity.high", impactKey: "alerts.impact.high" },
  Critical: {
    gravityKey: "alerts.gravity.critical",
    impactKey: "alerts.impact.critical",
  },
};

type IncidentKind =
  | "water"
  | "rain"
  | "fire"
  | "earthquake"
  | "road"
  | "storm"
  | "heat"
  | "snow"
  | "gas"
  | "dam"
  | "alert";

/**
 * The warning model has no incident type, so the icon is chosen from the
 * existing title vocabulary already used to classify reports.
 */
function incidentKind(title: string): IncidentKind {
  const value = title.toLowerCase();

  if (value.includes("barrage") || value.includes("débordement")) return "dam";
  if (value.includes("eau") || value.includes("canalisation")) return "water";
  if (value.includes("pluie") || value.includes("inondation")) return "rain";
  if (
    value.includes("feu") ||
    value.includes("incendie") ||
    value.includes("fumée")
  ) {
    return "fire";
  }
  if (
    value.includes("sismique") ||
    value.includes("secousse") ||
    value.includes("séisme") ||
    value.includes("fissure")
  ) {
    return "earthquake";
  }
  if (
    value.includes("route") ||
    value.includes("chaussée") ||
    value.includes("voirie")
  ) {
    return "road";
  }
  if (value.includes("tempête") || value.includes("vent")) return "storm";
  if (value.includes("canicule") || value.includes("chaleur")) return "heat";
  if (value.includes("neige") || value.includes("verglas")) return "snow";
  if (value.includes("gaz") || value.includes("odeur")) return "gas";
  return "alert";
}

function Icon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function IncidentIcon({ kind }: { kind: IncidentKind }) {
  return (
    <Icon>
      {kind === "water" && (
        <>
          <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
          <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
        </>
      )}
      {kind === "rain" && (
        <>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 14v6" />
          <path d="M8 14v6" />
          <path d="M12 16v6" />
        </>
      )}
      {kind === "fire" && (
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      )}
      {kind === "earthquake" && (
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
      )}
      {kind === "road" && (
        <>
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="5" r="2" />
          <path d="M8 19h5.5a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7H16" />
        </>
      )}
      {kind === "storm" && (
        <>
          <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
          <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
          <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
        </>
      )}
      {kind === "heat" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </>
      )}
      {kind === "snow" && (
        <>
          <path d="M12 2v20" />
          <path d="m4.93 4.93 14.14 14.14" />
          <path d="m19.07 4.93-14.14 14.14" />
          <path d="M2 12h20" />
        </>
      )}
      {kind === "gas" && (
        <>
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 17H7" />
          <path d="M17 21H9" />
        </>
      )}
      {kind === "dam" && (
        <>
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </>
      )}
      {kind === "alert" && (
        <>
          <path d="m10.29 3.86-8.1 14.14A2 2 0 0 0 3.9 21h16.2a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      )}
    </Icon>
  );
}

function VerificationIcon({ verified }: { verified: boolean }) {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      {verified ? (
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      ) : (
        <>
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </>
      )}
    </Icon>
  );
}

function SeverityIcon({ severity }: { severity: Severity }) {
  return (
    <Icon className="warning-card__severity-icon">
      {severity === "Low" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8" />
          <path d="m8.5 12.5 3.5 3.5 3.5-3.5" />
        </>
      )}
      {severity === "Medium" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8" />
        </>
      )}
      {severity === "High" && (
        <>
          <path d="m10.29 3.86-8.1 14.14A2 2 0 0 0 3.9 21h16.2a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      )}
      {severity === "Critical" && (
        <>
          <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2Z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </>
      )}
    </Icon>
  );
}

function MapPinIcon() {
  return (
    <Icon>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  );
}

function ClockIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

function SourceIcon() {
  return (
    <Icon>
      <path d="M3 21h18" />
      <path d="M5 21V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v17" />
      <path d="M13 21V11h4a2 2 0 0 1 2 2v8" />
      <path d="M8 21v-3h3v3" />
    </Icon>
  );
}

function MapIcon() {
  return (
    <Icon>
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </Icon>
  );
}

function capitalizeFirst(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

function WarningCard({
  warning,
  onClick,
  active = false,
  className,
  status,
  media,
  metaExtra,
  sourceLabelKey = "alerts.sourceLabel",
  extra,
  actions,
}: WarningCardProps) {
  const { t, tc } = useI18n();
  const severity = SEVERITY_META[warning.severity];
  const verified = warning.verification === "verified";

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  const cardClassName = [
    "warning-card",
    `warning-card--${warning.severity.toLowerCase()}`,
    warning.verification,
    onClick ? "is-clickable" : "",
    active ? "is-active" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cardClassName}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? active : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="warning-card__top">
        {media ? (
          <span className="warning-card__media">{media}</span>
        ) : (
          <span className="warning-card__incident-icon">
            <IncidentIcon kind={incidentKind(warning.title)} />
          </span>
        )}

        {status ? (
          <span
            className={`warning-card__verification${status.className ? ` ${status.className}` : ""}`}
          >
            {status.icon}
            {status.label}
          </span>
        ) : (
          <span className="warning-card__verification">
            <VerificationIcon verified={verified} />
            {verified
              ? t("verification.verified")
              : t("verification.unverified")}
          </span>
        )}
      </div>

      <div className="warning-card__title-block">
        <h3>{tc(warning.title)}</h3>

        <p className="warning-card__severity-line">
          <SeverityIcon severity={warning.severity} />
          <span className="warning-card__severity-label">
            {t(severity.gravityKey)}
          </span>
          <span className="warning-card__separator" aria-hidden="true">
            ·
          </span>
          <span className="warning-card__impact">{t(severity.impactKey)}</span>
        </p>
      </div>

      <p className="warning-card__description">{tc(warning.description)}</p>

      <div className="warning-card__details">
        <div className="warning-card__meta-row">
          {metaExtra}
          <span className="warning-card__meta-item">
            <MapPinIcon />
            {tc(warning.location)}
          </span>
          <span className="warning-card__meta-item warning-card__meta-time">
            <ClockIcon />
            {capitalizeFirst(tc(warning.issuedAt))}
          </span>
        </div>

        <div className="warning-card__source">
          <span className="warning-card__source-icon">
            <SourceIcon />
          </span>
          <span className="warning-card__source-text">
            <span className="warning-card__source-label">
              {t(sourceLabelKey)}
            </span>
            <span className="warning-card__source-name">
              {tc(warning.source)}
            </span>
          </span>
        </div>

        {extra}
      </div>

      {actions ? (
        <div className="warning-card__actions">{actions}</div>
      ) : (
        onClick && (
          <div className="warning-card__actions">
            <span className="warning-card__cta">
              <MapIcon />
              {t("alerts.showMap")}
            </span>
          </div>
        )
      )}
    </article>
  );
}

export default WarningCard;

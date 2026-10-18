import type { KeyboardEvent } from "react";
import type { Warning } from "../mockdata/warning.ts";
import { useI18n } from "../i18n";
import "./WarningCard.css";

type WarningCardProps = {
  warning: Warning;
  /** When provided, the card becomes selectable (used to locate it on the map). */
  onClick?: () => void;
  active?: boolean;
};

const SEVERITY_KEYS: Record<string, string> = {
  Low: "severity.low",
  Medium: "severity.medium",
  High: "severity.high",
  Critical: "severity.critical",
};

function WarningCard({ warning, onClick, active = false }: WarningCardProps) {
  const { t, tc } = useI18n();

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
            <article
        className={`warning-card ${warning.verification}${onClick ? " is-clickable" : ""}${active ? " is-active" : ""}`}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? active : undefined}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
      >
        <div className="warning-card__top">
            <span className="warning-card__severity">
            {t(SEVERITY_KEYS[warning.severity])}
            </span>

            <span className="warning-card__verification">
            {warning.verification === "verified"
                ? t("verification.verified")
                : t("verification.unverified")}
            </span>
        </div>

        <h3>{tc(warning.title)}</h3>

        <p>{tc(warning.description)}</p>

        <div className="warning-card__footer">
            <span>{tc(warning.location)}</span>
            <span>{tc(warning.issuedAt)}</span>
        </div>

        <div className="warning-card__meta">
            <small>{t("common.source")} : {tc(warning.source)}</small>
            {onClick && (
              <span className="warning-card__cta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("alerts.showMap")}
              </span>
            )}
        </div>
        </article>
  );
}

export default WarningCard;

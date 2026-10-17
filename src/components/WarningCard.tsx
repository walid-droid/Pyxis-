import type { KeyboardEvent } from "react";
import type { Warning } from "../mockdata/warning.ts";
import "./WarningCard.css";

type WarningCardProps = {
  warning: Warning;
  /** When provided, the card becomes selectable (used to locate it on the map). */
  onClick?: () => void;
  active?: boolean;
};

const SEVERITY_FR: Record<string, string> = {
  Low: "Faible",
  Medium: "Moyenne",
  High: "Élevée",
  Critical: "Critique",
};

function WarningCard({ warning, onClick, active = false }: WarningCardProps) {
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
            {SEVERITY_FR[warning.severity]}
            </span>

            <span className="warning-card__verification">
            {warning.verification === "verified"
                ? "Vérifiée"
                : "Non vérifiée"}
            </span>
        </div>

        <h3>{warning.title}</h3>

        <p>{warning.description}</p>

        <div className="warning-card__footer">
            <span>{warning.location}</span>
            <span>{warning.issuedAt}</span>
        </div>

        <div className="warning-card__meta">
            <small>Source : {warning.source}</small>
            {onClick && (
              <span className="warning-card__cta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Voir la carte
              </span>
            )}
        </div>
        </article>
  );
}

export default WarningCard;

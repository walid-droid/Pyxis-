import type { Warning } from "../mockdata/warning.ts";
import "./WarningCard.css";

type WarningCardProps = {
  warning: Warning;
};

const SEVERITY_FR: Record<string, string> = {
  Low: "Faible",
  Medium: "Moyenne",
  High: "Élevée",
  Critical: "Critique",
};

function WarningCard({ warning }: WarningCardProps) {
  return (
            <article className={`warning-card ${warning.verification}`}>
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

        <small>Source : {warning.source}</small>
        </article>
  );
}

export default WarningCard;
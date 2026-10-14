import type { Warning } from "../mockdata/warning.ts";
import "./WarningCard.css";

type WarningCardProps = {
  warning: Warning;
};

function WarningCard({ warning }: WarningCardProps) {
  return (
            <article className={`warning-card ${warning.verification}`}>
        <div className="warning-card__top">
            <span className="warning-card__severity">
            {warning.severity}
            </span>

            <span className="warning-card__verification">
            {warning.verification === "verified"
                ? "Verified"
                : "Unverified"}
            </span>
        </div>

        <h3>{warning.title}</h3>

        <p>{warning.description}</p>

        <div className="warning-card__footer">
            <span>{warning.location}</span>
            <span>{warning.issuedAt}</span>
        </div>

        <small>Source: {warning.source}</small>
        </article>
  );
}

export default WarningCard;
import { useI18n } from "../i18n";
import "./AlertRow.css";

export type AlertRowTone =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "active"
  | "escalating"
  | "stabilising"
  | "recovery";

type AlertRowProps = {
  /** Severity or status tone — drives the dot and label color. */
  tone: AlertRowTone;
  title: string;
  /** Short severity/status word shown in the tone color. */
  label: string;
  /** Location + time (or status) line. */
  meta: string;
  /** Full accessible description of the row. */
  ariaLabel: string;
  selected?: boolean;
  /** When provided, the row becomes a button that opens the alert on the map. */
  onClick?: () => void;
};

function AlertRow({
  tone,
  title,
  label,
  meta,
  ariaLabel,
  selected = false,
  onClick,
}: AlertRowProps) {
  const { t } = useI18n();
  const content = (
    <>
      <span className="alert-row__dot" aria-hidden="true" />
      <span className="alert-row__title">{title}</span>
      <span className="alert-row__label">{label}</span>
      <span className="alert-row__meta">{meta}</span>
      {onClick && (
        <svg
          className="alert-row__pin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )}
    </>
  );

  return (
    <li>
      {onClick ? (
        <button
          type="button"
          className={`alert-row alert-row--${tone}${selected ? " is-selected" : ""}`}
          aria-label={ariaLabel}
          title={t("common.showMapZones")}
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <div className={`alert-row alert-row--${tone}`} aria-label={ariaLabel}>
          {content}
        </div>
      )}
    </li>
  );
}

export default AlertRow;

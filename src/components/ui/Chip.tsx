import type { ReactNode } from "react";
import "./ui.css";

export type ChipTone = "neutral" | "ok" | "warn" | "critical" | "live";

type ChipProps = {
  children: ReactNode;
  tone?: ChipTone;
  /** Puces posées sur un bandeau photo : verre blanc. */
  onMedia?: boolean;
  className?: string;
};

/** Pastille arrondie, même langage que les puces de la landing. */
export function Chip({
  children,
  tone = "neutral",
  onMedia = false,
  className,
}: ChipProps) {
  return (
    <span
      className={[
        "ui-chip",
        `ui-chip--${tone}`,
        onMedia ? "ui-chip--onMedia" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tone !== "neutral" && <i className="ui-chip__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Chip;

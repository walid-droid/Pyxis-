export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** À utiliser sur un fond photo / sombre : verre blanc au lieu du verre de surface. */
  onMedia?: boolean;
};

/** Classes partagées, réutilisables sur un <Link> ou un <a>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  onMedia = false,
}: ButtonStyleOptions = {}): string {
  return [
    "ui-btn",
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    onMedia ? "ui-btn--onMedia" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

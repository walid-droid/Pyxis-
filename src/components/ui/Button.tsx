import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";
import "./ui.css";

export type { ButtonSize, ButtonVariant } from "./buttonStyles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** À utiliser sur un fond photo / sombre : verre blanc au lieu du verre de surface. */
  onMedia?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
};

/** Bouton unique : rouge landing + halo, verre secondaire, ou fantôme. */
export function Button({
  variant = "primary",
  size = "md",
  onMedia = false,
  icon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[buttonClasses({ variant, size, onMedia }), className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon}
      {children}
      {trailingIcon}
    </button>
  );
}

export default Button;

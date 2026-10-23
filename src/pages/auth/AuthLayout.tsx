import type { ReactNode } from "react";
import { Link } from "react-router";
import logo from "../../assets/Logo CADM.png";
import LanguageToggle from "../../components/LanguageToggle";
import { useI18n } from "../../i18n";
import "./AuthLayout.css";

type AuthLayoutProps = {
  farTitle: string;
  farText: string;
  children: ReactNode;
  /** Petite étiquette au-dessus du titre (espace responsable). */
  eyebrow?: string;
  /** Liste de points forts ; par défaut les trois arguments citoyens. */
  points?: string[];
  variant?: "citizen" | "crisis";
};

/** Shared shell for the login and registration pages. */
function AuthLayout({
  farTitle,
  farText,
  children,
  eyebrow,
  points,
  variant = "citizen",
}: AuthLayoutProps) {
  const { t } = useI18n();
  const bullets = points ?? [t("auth.point1"), t("auth.point2"), t("auth.point3")];

  return (
    <main
      className={`auth-page${variant === "crisis" ? " auth-page--resp" : ""}`}
    >
      <aside className="auth-aside">
        <div className="auth-lang">
          <LanguageToggle />
        </div>

        <Link to="/" className="auth-back">
          {t("auth.back")}
        </Link>

        <Link to="/" className="auth-brand" aria-label={t("auth.brandAria")}>
          <img src={logo} alt="" />
          <span>CADM</span>
        </Link>

        <div className="auth-aside-body">
          {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
          <h1>{farTitle}</h1>
          <p>{farText}</p>

          <ul className="auth-points">
            {bullets.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <p className="auth-aside-foot">{t("auth.foot")}</p>
      </aside>

      <section className="auth-main">
        <div className="auth-card">{children}</div>
      </section>
    </main>
  );
}

export default AuthLayout;

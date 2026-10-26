import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import logo from "../../assets/Logo CADM.png";
import LanguageToggle from "../../components/LanguageToggle";
import { useI18n } from "../../i18n";
import "./AuthLayout.css";

type AuthLayoutProps = {
  children: ReactNode;
  variant?: "citizen" | "crisis" | "admin";
  /** Fait disparaître la page en douceur avant la redirection. */
  leaving?: boolean;
  /** Remonte légèrement la carte pour les formulaires plus hauts (inscription). */
  raised?: boolean;
};

/** La vidéo est ignorée si l'utilisateur limite les animations ou sa connexion. */
function shouldSkipVideo() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return !!(connection && (connection.saveData || /2g|3g/.test(connection.effectiveType ?? "")));
}

/** Shared shell for the login and registration pages. */
function AuthLayout({
  children,
  variant = "citizen",
  leaving = false,
  raised = false,
}: AuthLayoutProps) {
  const { t } = useI18n();
  // "loading" -> "ready" quand la vidéo peut démarrer, "removed" si absente ou connexion lente
  const [video, setVideo] = useState<"loading" | "ready" | "removed">(() =>
    shouldSkipVideo() ? "removed" : "loading",
  );
  return (
    <main
      className={`auth-page${video === "ready" ? " auth-page--video" : ""}${
        variant === "crisis" ? " auth-page--resp" : ""
      }${variant === "admin" ? " auth-page--admin" : ""}${
        raised ? " auth-page--raised" : ""
      }${leaving ? " auth-page--leaving" : ""}`}
    >
      <div className="auth-media" aria-hidden="true">
        {video !== "removed" && (
          <video
            className="auth-video"
            src={`${import.meta.env.BASE_URL}video.mp4`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideo((state) => (state === "loading" ? "ready" : state))}
            onError={() => setVideo("removed")}
          />
        )}
        <div className="auth-scrim" />
      </div>

      <header className="auth-topbar">
        <Link to="/" className="auth-brand" aria-label={t("auth.brandAria")}>
          <img src={logo} alt="" />
          <span>CADM</span>
        </Link>

        <div className="auth-actions">
          <Link to="/" className="auth-back">
            {t("auth.back")}
          </Link>
          <div className="auth-lang">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <section className="auth-main">
        <div className="auth-card">{children}</div>
      </section>

      <p className="auth-foot">{t("auth.foot")}</p>
    </main>
  );
}

export default AuthLayout;

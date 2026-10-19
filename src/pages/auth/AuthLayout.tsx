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
};

/** Shared shell for the login and registration pages. */
function AuthLayout({ farTitle, farText, children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <main className="auth-page">
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
          <h1>{farTitle}</h1>
          <p>{farText}</p>

          <ul className="auth-points">
            <li>{t("auth.point1")}</li>
            <li>{t("auth.point2")}</li>
            <li>{t("auth.point3")}</li>
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

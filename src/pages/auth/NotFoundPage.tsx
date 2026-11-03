import { Link } from "react-router";
import { LOGIN_PATH, STAFF_LOGIN_PATH } from "../../config";
import { useI18n } from "../../i18n";
import AuthLayout from "./AuthLayout";

/**
 * Page affichée pour toute URL inconnue. Elle reste accessible sans session
 * et propose les deux points d'entrée : citoyen et personnel.
 */
function NotFoundPage() {
  const { t } = useI18n();

  return (
    <AuthLayout>
      <header className="auth-card-head">
        <span className="auth-kicker">{t("notFound.kicker")}</span>
        <h1>{t("nav.notFound")}</h1>
        <p>{t("notFound.lead")}</p>
      </header>

      <div className="auth-form">
        <Link className="auth-submit auth-submit--link" to="/">
          {t("notFound.home")}
        </Link>

        <p className="auth-switch">
          <Link to={LOGIN_PATH}>{t("notFound.citizen")}</Link>
          {" · "}
          <Link to={STAFF_LOGIN_PATH}>{t("notFound.staff")}</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default NotFoundPage;

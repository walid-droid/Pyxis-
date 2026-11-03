import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { findUser } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { toggleAvailability } from "../../services/users";
import { formatDateTime } from "../shared/v3/helpers";

export default function ModuleAvailabilityPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [notice, setNotice] = useState(false);

  if (!session) return null;
  const user = findUser(db, session.userId);
  const available = Boolean(user?.disponible);

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("module.availability.title")}</p>
          <h1 className="v3-title">{t("module.availability.title")}</h1>
          <p className="v3-lead">{t("module.availability.lead")}</p>
        </div>
      </header>

      <section className="v3-card">
        <div className="v3-row" style={{ justifyContent: "space-between" }}>
          <div>
            <p className="v3-card__title">
              {available
                ? t("module.availability.available")
                : t("module.availability.unavailable")}
            </p>
            <p className="v3-card__hint">
              {user ? `${user.prenom[lang]} ${user.nom[lang]}` : session.email}
              {user?.createdAt ? ` · ${formatDateTime(user.createdAt, lang)}` : ""}
            </p>
          </div>
          <button
            type="button"
            className={`v3-btn ${available ? "v3-btn--danger" : "v3-btn--primary"}`}
            aria-pressed={available}
            onClick={() => {
              toggleAvailability(session.userId);
              setNotice(true);
            }}
          >
            {t("module.availability.toggle")}
          </button>
        </div>
        {notice ? (
          <p className="v3-note" role="status" style={{ marginTop: 14 }}>
            {t("module.availability.updated")}
          </p>
        ) : null}
      </section>
    </main>
  );
}

import { useSyncExternalStore } from "react";
import { useI18n } from "../i18n";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/**
 * Bandeau affiché en mode hors connexion : rappelle que l'application
 * reste utilisable et que les saisies sont conservées localement.
 */
export default function OfflineBanner() {
  const { t } = useI18n();
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, () => true);

  if (online) return null;

  return (
    <div className="app-offline" role="status">
      <span className="app-offline__dot" aria-hidden="true" />
      <div>
        <strong>{t("offline.title")}</strong>
        <span>{t("offline.lead")}</span>
      </div>
    </div>
  );
}

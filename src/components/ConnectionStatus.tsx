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

/** Pastille de connexion réseau affichée dans la barre du haut. */
function ConnectionStatus() {
  const { t } = useI18n();
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, () => true);
  const label = t(online ? "common.online" : "common.offline");

  return (
    <span
      className={`app-connection${online ? "" : " is-offline"}`}
      role="status"
      aria-label={label}
      title={label}
    >
      <span className="app-connection__dot" aria-hidden="true" />
      <span className="app-connection__label" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}

export default ConnectionStatus;

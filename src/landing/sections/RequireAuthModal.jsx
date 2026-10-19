import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { LOGIN_PATH, REGISTER_PATH } from "../../config";

const FROM = "/submit-alert";

// Sur la landing (page publique), le signalement est réservé aux membres connectés :
// on affiche une fenêtre asking de se connecter au lieu d'ouvrir le formulaire.
export default function RequireAuthModal({ onClose }) {
  const cardRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    // Le défilement de la page se fait sur <html> : on le bloque pendant l'ouverture.
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // Le focus part sur l'action principale, et revient sur le bouton d'origine à la fermeture.
    restoreFocusRef.current = document.activeElement;
    cardRef.current?.querySelector("a")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      if (restoreFocusRef.current instanceof HTMLElement) restoreFocusRef.current.focus();
    };
  }, [onClose]);

  return (
    <div className="lmodal" onClick={onClose}>
      <div
        className="lmodal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lmodal-title"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lmodal-x" type="button" aria-label="Fermer" onClick={onClose}>
          &times;
        </button>
        <p className="eyebrow">Accès citoyen</p>
        <h2 id="lmodal-title">Connectez-vous pour signaler un incident</h2>
        <p className="lmodal-txt">
          Le signalement est réservé aux membres connectés : c&apos;est ce qui permet à nos équipes de vous
          recontacter et de vous informer du traitement de votre demande. La création du compte est gratuite.
        </p>
        <div className="lmodal-acts">
          <Link className="btn red" to={LOGIN_PATH} state={{ from: FROM }} onClick={onClose}>
            Se connecter
          </Link>
          <Link className="btn out" to={REGISTER_PATH} state={{ from: FROM }} onClick={onClose}>
            Créer un compte
          </Link>
        </div>
        <p className="lmodal-note">
          En cas de danger immédiat, appelez la Protection civile au <b className="num">14</b>.
        </p>
      </div>
    </div>
  );
}

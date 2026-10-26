import { useEffect, useRef } from "react";
import { useI18n } from "../../i18n";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Coquille commune aux fenêtres de la landing : fond, carte, fermeture,
 * verrouillage du défilement, piège à focus et retour du focus à la fermeture.
 */
export default function LandingModal({
  titleId,
  onClose,
  children,
  wide = false,
  initialFocusRef,
}) {
  const cardRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const card = cardRef.current;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !card) return;

      const nodes = Array.from(card.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (nodes.length === 0) {
        event.preventDefault();
        card.focus();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!card.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    // Le défilement de la page se fait sur <html> : on le bloque pendant l'ouverture.
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // Le focus part sur l'action principale et revient sur l'élément d'origine à la fermeture.
    restoreFocusRef.current = document.activeElement;
    const target = initialFocusRef?.current || card?.querySelector(FOCUSABLE);
    (target || card)?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      if (restoreFocusRef.current instanceof HTMLElement) restoreFocusRef.current.focus();
    };
  }, [initialFocusRef, onClose]);

  return (
    <div className="lmodal" onClick={onClose}>
      <div
        className={"lmodal-card" + (wide ? " lmodal-card--wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={cardRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="lmodal-x" type="button" aria-label={t("common.close")} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

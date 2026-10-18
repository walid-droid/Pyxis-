import { useEffect, type ReactNode } from "react";
import { useI18n } from "../i18n";
import "./Modal.css";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

function Modal({ title, onClose, children, className }: ModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={className ? `modal ${className}` : "modal"}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

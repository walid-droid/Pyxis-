import type { ReactNode } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";

type ConfirmDialogProps = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  tone?: "primary" | "green" | "danger";
  /** Empêche la validation tant qu'une information obligatoire manque. */
  confirmDisabled?: boolean;
};

/** Petite boîte de confirmation réutilisée par les actions sensibles. */
function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
  tone = "primary",
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Modal title={title} onClose={onClose} className="rc-modal">
      <div className="rc-confirm">
        <div className="rc-confirm__body">{children}</div>
        <div className="rc-confirm__actions">
          <button type="button" className="rc-btn rc-btn--soft" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={`rc-btn rc-btn--${tone}`}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

import { useState, type FormEvent } from "react";
import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import { useOperator } from "./useOperator";
import "./ops.css";

export default function HandoverPanel({ toDefault }: { toDefault?: string }) {
  const { t, tc } = useI18n();
  const operator = useOperator();
  const { handovers, createHandover } = useOrsecOps();
  const [to, setTo] = useState(toDefault ?? "");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (to.trim().length < 3 || notes.trim().length < 8) return;
    createHandover(operator.name, to.trim(), notes.trim());
    setNotes("");
    setToast(t("ops.handover.created"));
  };

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.handover.title")}</h2>
        <span className="ops-card__hint">
          {t("ops.common.count", { count: handovers.length })}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.handover.lead")}</p>
      <p className="ops-muted">{t("ops.handover.hint")}</p>

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <form className="ops-form" onSubmit={submit}>
        <div className="ops-form__row">
          <label className="ops-field">
            <span>{t("ops.handover.from")}</span>
            <input value={operator.name} readOnly />
          </label>
          <label className="ops-field">
            <span>{t("ops.handover.to")} *</span>
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Capitaine S. Haddad"
              minLength={3}
              required
            />
          </label>
        </div>
        <label className="ops-field">
          <span>{t("ops.handover.notes")} *</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="ops-btn ops-btn--primary"
            disabled={to.trim().length < 3 || notes.trim().length < 8}
          >
            {t("ops.handover.create")}
          </button>
        </div>
      </form>

      {handovers.length === 0 ? (
        <p className="ops-empty">{t("ops.handover.empty")}</p>
      ) : (
        <ul className="ops-list ops-scroll">
          {handovers.map((handover) => (
            <li key={handover.id} className="ops-list__item">
              <div className="ops-list__head">
                <span className="ops-list__title">
                  {handover.from} → {handover.to}
                </span>
                <span className="ops-list__meta">{handover.at}</span>
              </div>
              <p className="ops-list__body">{tc(handover.notes)}</p>
              <p className="ops-list__meta">
                {t("ops.handover.signature")} ·{" "}
                <span className="ops-code">{handover.signature}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

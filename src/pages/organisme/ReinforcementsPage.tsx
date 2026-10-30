import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  REINFORCEMENTS,
  loc,
  type Reinforcement,
  type ReinforcementStatus,
} from "./organismeData";

const STATUS_TONE: Record<ReinforcementStatus, string> = {
  requested: "medium",
  authorized: "high",
  transmitted: "deployed",
  processed: "low",
  refused: "critical",
};

const STATUS_KEY = "org.reinforcements.status";

/** Demandes de renfort : demande, autorisation, transmission et traitement. */
export default function ReinforcementsPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const [requests, setRequests] = useState<Reinforcement[]>(REINFORCEMENTS);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState<Reinforcement["urgency"]>("medium");
  const [mission, setMission] = useState("");
  const [note, setNote] = useState("");

  const update = (id: string, status: ReinforcementStatus, message: string) => {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
    setToast(message);
  };

  const create = () => {
    if (type.trim().length < 3) return;
    const created: Reinforcement = {
      id: `ren-${Date.now()}`,
      ref: `REN-2026-${89 + requests.length}`,
      from: { fr: loc(lang, persona.org), ar: loc(lang, persona.org) },
      type: { fr: type, ar: type },
      quantity,
      urgency,
      mission: { fr: mission || "—", ar: mission || "—" },
      status: "requested",
      at: "30/10/2026 · maintenant",
      note: { fr: note || "—", ar: note || "—" },
    };
    setRequests((current) => [created, ...current]);
    setModal(false);
    setToast(t("org.reinforcements.created"));
  };

  const canDirector = persona.id === "directeur";
  const canPc = persona.id === "pc";

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.reinforcements.eyebrow")}
        title={t("org.reinforcements.title")}
        lead={t("org.reinforcements.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {requests.filter((request) => request.status === "requested").length}{" "}
              {t("org.reinforcements.status.requested").toLowerCase()}
            </span>
            <span className="rc-chip">{t("org.reinforcements.pcHint")}</span>
          </>
        }
        aside={
          <button type="button" className="rc-btn rc-btn--primary" onClick={() => setModal(true)}>
            + {t("org.reinforcements.new")}
          </button>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.reinforcements.title")}</h2>
          <span className="rc-card__hint">
            {canPc
              ? t("org.reinforcements.pcHint")
              : canDirector
                ? t("org.reinforcements.createLead")
                : t("org.reinforcements.lead")}
          </span>
        </div>

        <p className="rc-card__lead">{t("org.reinforcements.lead")}</p>

        {requests.length === 0 ? (
          <p className="rc-empty">{t("org.reinforcements.empty")}</p>
        ) : (
          <ul className="org-request-list">
            {requests.map((request) => (
              <li key={request.id} className="org-request">
                <div className="org-request__main">
                  <div className="org-request__head">
                    <span className="org-cell__ref">{request.ref}</span>
                    <span className={`rc-badge rc-badge--${STATUS_TONE[request.status]}`}>
                      {t(`${STATUS_KEY}.${request.status}`)}
                    </span>
                    <span className={`rc-badge rc-badge--${request.urgency === "high" ? "critical" : request.urgency === "medium" ? "medium" : "low"}`}>
                      {t(`org.reinforcements.urgency.${request.urgency}`)}
                    </span>
                  </div>
                  <h3 className="org-request__title">
                    {request.quantity} × {loc(lang, request.type)}
                  </h3>
                  <p className="org-request__meta">
                    <span>{loc(lang, request.from)}</span>
                    <span>{loc(lang, request.mission)}</span>
                    <span>{request.at}</span>
                  </p>
                  <p className="org-request__note">{loc(lang, request.note)}</p>
                </div>

                <div className="org-request__actions">
                  {canDirector && request.status === "requested" ? (
                    <>
                      <button
                        type="button"
                        className="rc-btn rc-btn--primary rc-btn--small"
                        onClick={() =>
                          update(request.id, "authorized", t("org.reinforcements.authorized"))
                        }
                      >
                        {t("org.common.authorize")}
                      </button>
                      <button
                        type="button"
                        className="rc-btn rc-btn--soft rc-btn--small"
                        onClick={() =>
                          update(request.id, "transmitted", t("org.reinforcements.transmitted"))
                        }
                      >
                        {t("org.common.transmit")}
                      </button>
                    </>
                  ) : null}

                  {canDirector && request.status === "authorized" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--soft rc-btn--small"
                      onClick={() =>
                        update(request.id, "transmitted", t("org.reinforcements.transmitted"))
                      }
                    >
                      {t("org.common.transmit")}
                    </button>
                  ) : null}

                  {(canPc || canDirector) &&
                  (request.status === "transmitted" || request.status === "authorized") ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--primary rc-btn--small"
                      onClick={() =>
                        update(request.id, "processed", t("org.reinforcements.processed"))
                      }
                    >
                      {t("org.common.process")}
                    </button>
                  ) : null}

                  {(canDirector || canPc) &&
                  request.status !== "processed" &&
                  request.status !== "refused" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--ghost-danger rc-btn--small"
                      onClick={() =>
                        update(request.id, "refused", t("org.reinforcements.refused"))
                      }
                    >
                      {t("org.common.refuse")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      {modal ? (
        <Modal title={t("org.reinforcements.createTitle")} onClose={() => setModal(false)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              create();
            }}
          >
            <p className="org-muted">{t("org.reinforcements.createLead")}</p>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="ren-type">{t("org.reinforcements.typeField")} *</label>
                <input
                  id="ren-type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  required
                  minLength={3}
                />
              </div>
              <div className="rc-field">
                <label htmlFor="ren-qty">{t("org.reinforcements.qtyField")}</label>
                <input
                  id="ren-qty"
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </div>
            </div>
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="ren-urgency">{t("org.common.urgency")}</label>
                <select
                  id="ren-urgency"
                  value={urgency}
                  onChange={(event) =>
                    setUrgency(event.target.value as Reinforcement["urgency"])
                  }
                >
                  <option value="low">{t("org.reinforcements.urgency.low")}</option>
                  <option value="medium">{t("org.reinforcements.urgency.medium")}</option>
                  <option value="high">{t("org.reinforcements.urgency.high")}</option>
                </select>
              </div>
              <div className="rc-field">
                <label htmlFor="ren-mission">{t("org.reinforcements.missionField")}</label>
                <input
                  id="ren-mission"
                  value={mission}
                  onChange={(event) => setMission(event.target.value)}
                />
              </div>
            </div>
            <div className="rc-field">
              <label htmlFor="ren-note">{t("org.common.note")}</label>
              <textarea
                id="ren-note"
                value={note}
                placeholder={t("org.reinforcements.notePlaceholder")}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(false)}>
                {t("org.common.cancel")}
              </button>
              <button type="submit" className="rc-btn rc-btn--primary" disabled={type.trim().length < 3}>
                {t("org.common.send")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

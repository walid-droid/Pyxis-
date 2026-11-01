import { useMemo, useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrsecOps, type Requisition, type RequisitionState } from "../../lib/orsecOps";
import { ORSEC_MODULES, type ModuleId } from "../shared/plan/orsecPlan";
import OpsHero from "../shared/ops/OpsHero";
import "./authority.css";

const STATES: RequisitionState[] = [
  "draft",
  "signed",
  "notified",
  "acknowledged",
  "in_progress",
  "completed",
  "refused",
  "timeout",
  "cancelled",
];

const BADGE: Record<RequisitionState, string> = {
  draft: "muted",
  signed: "info",
  notified: "warn",
  acknowledged: "ok",
  in_progress: "warn",
  completed: "ok",
  refused: "danger",
  timeout: "danger",
  cancelled: "muted",
};

export default function RequisitionsPage() {
  const { t, lang } = useI18n();
  const {
    requisitions,
    createRequisition,
    signRequisition,
    notifyRequisition,
    acknowledgeRequisition,
    completeRequisition,
    refuseRequisition,
    cancelRequisition,
    forceTimeout,
  } = useOrsecOps();
  const [filter, setFilter] = useState<RequisitionState | "all">("all");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [action, setAction] = useState<{
    id: string;
    kind: "refuse" | "cancel";
  } | null>(null);
  const [reason, setReason] = useState("");

  const [moduleId, setModuleId] = useState<ModuleId>("travaux");
  const [resource, setResource] = useState("");
  const [owner, setOwner] = useState("");
  const [ownerNin, setOwnerNin] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [compensation, setCompensation] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState("15");

  const visible = useMemo(
    () =>
      filter === "all"
        ? requisitions
        : requisitions.filter((item) => item.status === filter),
    [requisitions, filter],
  );

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (
      resource.trim().length < 3 ||
      owner.trim().length < 3 ||
      location.trim().length < 3
    ) {
      return;
    }
    createRequisition({
      moduleId,
      resource: { fr: resource, ar: resource },
      owner: { fr: owner, ar: owner },
      ownerNin: ownerNin || "—",
      location: { fr: location, ar: location },
      start: start || "—",
      end: end || "—",
      compensation: compensation || "Barème ORSEC",
      timeoutSeconds: Number(timeoutSeconds) || 15,
    });
    setModal(false);
    setResource("");
    setOwner("");
    setOwnerNin("");
    setLocation("");
    setStart("");
    setEnd("");
    setCompensation("");
    setToast(t("ops.req.created"));
  };

  const act = (
    _item: Requisition,
    callback: () => void,
    messageKey: string,
  ) => {
    callback();
    setAction(null);
    setReason("");
    setToast(t(messageKey));
  };

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.req.title")}
        title={t("ops.req.title")}
        lead={t("ops.req.lead")}
        chips={
          <>
            <span className="ops-chip">
              {t("ops.req.filter")} : {t(`ops.req.status.${filter === "all" ? "draft" : filter}`)}
            </span>
            <span className="ops-chip">
              {t("ops.common.count", { count: visible.length })}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            className="ops-btn ops-btn--primary"
            onClick={() => setModal(true)}
          >
            {t("ops.req.new")}
          </button>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.req.title")}</h2>
          <select
            className="ops-btn"
            value={filter}
            aria-label={t("ops.req.filter")}
            onChange={(event) =>
              setFilter(event.target.value as RequisitionState | "all")
            }
          >
            <option value="all">{t("ops.common.all")}</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {t(`ops.req.status.${state}`)}
              </option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <p className="ops-empty">{t("ops.req.empty")}</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("ops.req.ref")}</th>
                  <th>{t("ops.req.module")}</th>
                  <th>{t("ops.req.resource")}</th>
                  <th>{t("ops.req.owner")}</th>
                  <th>{t("ops.req.status")}</th>
                  <th>{t("ops.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.ref}</strong>
                      {item.fallbackOf ? (
                        <div className="ops-list__meta">
                          {t("ops.req.fallback", { ref: item.fallbackOf })}
                        </div>
                      ) : null}
                      <div className="ops-list__meta">{item.createdAt}</div>
                    </td>
                    <td>{t(`orsec.module.${item.moduleId}`)}</td>
                    <td>
                      <strong>{item.resource[lang]}</strong>
                      <div className="ops-list__meta">{item.location[lang]}</div>
                      <div className="ops-list__meta">
                        {item.start} → {item.end}
                      </div>
                    </td>
                    <td>
                      {item.owner[lang]}
                      <div className="ops-list__meta">{item.ownerNin}</div>
                      <div className="ops-list__meta">{item.compensation}</div>
                    </td>
                    <td>
                      <span className={`ops-badge ops-badge--${BADGE[item.status]}`}>
                        {t(`ops.req.status.${item.status}`)}
                      </span>
                      {item.timeoutAt ? (
                        <div className="ops-list__meta">
                          {t("ops.req.deadline")} {item.timeoutAt}
                        </div>
                      ) : null}
                      {item.signatureHash ? (
                        <div className="ops-list__meta">
                          <span className="ops-code">{item.signatureHash}</span>
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div className="ops-table__actions">
                        {item.status === "draft" ? (
                          <button
                            type="button"
                            className="ops-btn ops-btn--small ops-btn--primary"
                            onClick={() =>
                              act(item, () => signRequisition(item.id, "Autorité compétente"), "ops.req.signed")
                            }
                          >
                            {t("ops.req.sign")}
                          </button>
                        ) : null}
                        {item.status === "signed" ? (
                          <button
                            type="button"
                            className="ops-btn ops-btn--small"
                            onClick={() =>
                              act(item, () => notifyRequisition(item.id, "PCF · cellule réquisitions"), "ops.req.notified")
                            }
                          >
                            {t("ops.req.notify")}
                          </button>
                        ) : null}
                        {item.status === "notified" ? (
                          <>
                            <button
                              type="button"
                              className="ops-btn ops-btn--small ops-btn--primary"
                              onClick={() =>
                                act(item, () => acknowledgeRequisition(item.id, item.owner[lang]), "ops.req.acknowledged")
                              }
                            >
                              {t("ops.req.ack")}
                            </button>
                            <button
                              type="button"
                              className="ops-btn ops-btn--small"
                              onClick={() =>
                                act(item, () => forceTimeout(item.id), "ops.req.timedOut")
                              }
                            >
                              {t("ops.req.timeout")}
                            </button>
                            <button
                              type="button"
                              className="ops-btn ops-btn--small"
                              onClick={() => {
                                setAction({ id: item.id, kind: "refuse" });
                                setReason("");
                              }}
                            >
                              {t("ops.req.refuse")}
                            </button>
                          </>
                        ) : null}
                        {item.status === "acknowledged" || item.status === "in_progress" ? (
                          <button
                            type="button"
                            className="ops-btn ops-btn--small"
                            onClick={() =>
                              act(item, () => completeRequisition(item.id, "PCF · cellule réquisitions"), "ops.req.completed")
                            }
                          >
                            {t("ops.req.complete")}
                          </button>
                        ) : null}
                        {item.status === "draft" ||
                        item.status === "signed" ||
                        item.status === "notified" ? (
                          <button
                            type="button"
                            className="ops-btn ops-btn--small"
                            onClick={() => {
                              setAction({ id: item.id, kind: "cancel" });
                              setReason("");
                            }}
                          >
                            {t("ops.req.cancel")}
                          </button>
                        ) : null}
                        {item.note ? (
                          <span className="ops-list__meta">{item.note}</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="ops-muted">{t("ops.req.timeoutHint")}</p>
      </section>

      {modal ? (
        <Modal title={t("ops.req.new")} onClose={() => setModal(false)}>
          <form className="ops-form" onSubmit={create}>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.req.module")}</span>
                <select
                  value={moduleId}
                  onChange={(event) => setModuleId(event.target.value as ModuleId)}
                >
                  {ORSEC_MODULES.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.index}. {t(module.nameKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ops-field">
                <span>{t("ops.req.seconds")}</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={timeoutSeconds}
                  onChange={(event) => setTimeoutSeconds(event.target.value)}
                />
              </label>
            </div>
            <label className="ops-field">
              <span>{t("ops.req.resource")} *</span>
              <input
                value={resource}
                onChange={(event) => setResource(event.target.value)}
                minLength={3}
                required
              />
            </label>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.req.owner")} *</span>
                <input
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  minLength={3}
                  required
                />
              </label>
              <label className="ops-field">
                <span>{t("ops.req.nin")}</span>
                <input value={ownerNin} onChange={(event) => setOwnerNin(event.target.value)} />
              </label>
            </div>
            <label className="ops-field">
              <span>{t("ops.req.location")} *</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                minLength={3}
                required
              />
            </label>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.req.start")}</span>
                <input value={start} onChange={(event) => setStart(event.target.value)} placeholder="30/10/2026 09:00" />
              </label>
              <label className="ops-field">
                <span>{t("ops.req.end")}</span>
                <input value={end} onChange={(event) => setEnd(event.target.value)} placeholder="30/10/2026 18:00" />
              </label>
            </div>
            <label className="ops-field">
              <span>{t("ops.req.compensation")}</span>
              <input value={compensation} onChange={(event) => setCompensation(event.target.value)} />
            </label>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setModal(false)}>
                {t("ops.common.cancel")}
              </button>
              <button type="submit" className="ops-btn ops-btn--primary">
                {t("ops.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {action ? (
        <Modal
          title={action.kind === "refuse" ? t("ops.req.refuse") : t("ops.req.cancel")}
          onClose={() => setAction(null)}
        >
          <form
            className="ops-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (reason.trim().length < 8) return;
              if (action.kind === "refuse") {
                refuseRequisition(action.id, "Propriétaire / opérateur", reason.trim());
                setToast(t("ops.req.refused"));
              } else {
                cancelRequisition(action.id, "Autorité compétente", reason.trim());
                setToast(t("ops.req.cancelled"));
              }
              setAction(null);
              setReason("");
            }}
          >
            <label className="ops-field">
              <span>
                {action.kind === "refuse"
                  ? t("ops.req.refuseReason")
                  : t("ops.req.cancelReason")}{" "}
                *
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={8}
                required
              />
            </label>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setAction(null)}>
                {t("ops.common.cancel")}
              </button>
              <button
                type="submit"
                className="ops-btn ops-btn--danger"
                disabled={reason.trim().length < 8}
              >
                {action.kind === "refuse" ? t("ops.req.refuse") : t("ops.req.cancel")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

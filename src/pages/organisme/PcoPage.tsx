import "../shared/crisis/resp-crise.css";
import "./organisme.css";
import "../shared/ops/ops.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import { ORSEC_MODULES, responsibleFor } from "../shared/plan/orsecPlan";
import HandoverPanel from "../shared/ops/HandoverPanel";
import MainCourantePanel from "../shared/ops/MainCourantePanel";
import MapPanel from "../shared/ops/MapPanel";
import MeansPanel from "../shared/ops/MeansPanel";
import PmaPanel from "../shared/ops/PmaPanel";
import SectorsPanel from "../shared/ops/SectorsPanel";
import OrgHero from "./OrgHero";
import { PCO_FEED, PCO_REQUESTS, loc, type Localized, type PcoRequest } from "./organismeData";

type PcoTab = "overview" | "main" | "pma" | "means" | "sectors" | "handover" | "map";

const PCO_TABS: { id: PcoTab; labelKey: string }[] = [
  { id: "overview", labelKey: "ops.tabs.overview" },
  { id: "main", labelKey: "ops.tabs.main" },
  { id: "pma", labelKey: "ops.tabs.pma" },
  { id: "means", labelKey: "ops.tabs.means" },
  { id: "sectors", labelKey: "ops.tabs.sectors" },
  { id: "handover", labelKey: "ops.tabs.handover" },
  { id: "map", labelKey: "ops.tabs.map" },
];

/** Poste de commandement opérationnel (Protection civile). */
export default function PcoPage() {
  const { t, lang } = useI18n();
  const { plans } = useOrsecPlans();
  const plan = plans.wilaya;
  const [commission, setCommission] = useState(
    "1. Priorité secours et mise en sécurité des personnes.\n2. Coordination des modules santé, sécurité et travaux.\n3. Point de situation toutes les 30 minutes au PCF.",
  );
  const [commissionLevel, setCommissionLevel] = useState<"wilaya" | "commune">(
    "wilaya",
  );
  const [commissionEntity, setCommissionEntity] = useState<Localized>({
    fr: "Wilaya de Béjaïa",
    ar: "ولاية بجاية",
  });
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>([
    { id: "att1", name: "Deliberation_commission_wilaya.pdf" },
    { id: "att2", name: "Plan_intervention_Soummam.pdf" },
  ]);
  const [attachmentName, setAttachmentName] = useState("");
  const [requests, setRequests] = useState<PcoRequest[]>(PCO_REQUESTS);
  const [modal, setModal] = useState(false);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<PcoTab>("overview");

  const moduleIds = plan.activation?.moduleIds ?? ["secours", "sante", "securite"];
  const modules = ORSEC_MODULES.filter((module) => moduleIds.includes(module.id));

  const saveCommission = () => {
    setToast(t("org.pco.commissionSaved"));
  };

  const addAttachment = () => {
    if (attachmentName.trim().length < 3) return;
    setAttachments((current) => [
      ...current,
      { id: `att-${Date.now()}`, name: attachmentName.trim() },
    ]);
    setAttachmentName("");
    setToast(t("org.pco.attachmentAdded"));
  };

  const sendTrigger = () => {
    if (reason.trim().length < 8) return;
    setRequests((current) => [
      {
        id: `pcr-${Date.now()}`,
        ref: `PCO-2026-${45 + current.length}`,
        subject: { fr: reason, ar: reason },
        urgency: "high",
        at: "30/10/2026 · maintenant",
        status: "pending",
      },
      ...current,
    ]);
    setModal(false);
    setReason("");
    setToast(t("org.pco.requestSent"));
  };

  const processRequest = (id: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status: "accepted" } : request,
      ),
    );
    setToast(t("org.pco.reportSent"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.pco.eyebrow")}
        title={t("org.pco.title")}
        lead={t("org.pco.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t("org.pco.open")} · {t("org.pco.status")}
            </span>
            <span className="rc-chip">
              {t(`ops.situation.short.${plan.situation}`)}
            </span>
            <span className="rc-chip">
              {t("orsec.statusShort." + plan.status)} · {plan.phase ? t(`orsec.phase.${plan.phase}`) : t("org.pco.status")}
            </span>
          </>
        }
        aside={
          <>
            <button
              type="button"
              className="rc-btn rc-btn--ghost"
              onClick={() => setToast(t("org.pco.reportSent"))}
            >
              {t("org.pco.reportPcf")}
            </button>
            <button
              type="button"
              className="rc-btn rc-btn--primary"
              onClick={() => setModal(true)}
            >
              {t("org.pco.requestTrigger")}
            </button>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <nav className="ops-tabs" aria-label={t("ops.pco.title")}>
        {PCO_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ops-tab${tab === item.id ? " is-active" : ""}`}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <>
      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pco.commissionPlan")}</h2>
            <span className="rc-card__hint">{t("org.pco.lead")}</span>
          </div>
          <p className="rc-card__lead">{t("org.pco.commissionLead")}</p>
          <div className="rc-form__row">
            <div className="rc-field">
              <label htmlFor="pco-commission-level">
                {t("org.pco.commissionLevel")}
              </label>
              <select
                id="pco-commission-level"
                value={commissionLevel}
                onChange={(event) => {
                  const level = event.target.value as "wilaya" | "commune";
                  setCommissionLevel(level);
                  setCommissionEntity(
                    level === "wilaya"
                      ? { fr: "Wilaya de Béjaïa", ar: "ولاية بجاية" }
                      : { fr: "Commune de Béjaïa", ar: "بلدية بجاية" },
                  );
                }}
              >
                <option value="wilaya">{t("org.common.wilaya")}</option>
                <option value="commune">{t("org.common.commune")}</option>
              </select>
            </div>
            <div className="rc-field">
              <label htmlFor="pco-commission-entity">
                {t("org.pco.commissionEntity")}
              </label>
              <input
                id="pco-commission-entity"
                value={loc(lang, commissionEntity)}
                onChange={(event) =>
                  setCommissionEntity({
                    fr: event.target.value,
                    ar: event.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="rc-field">
            <label htmlFor="pco-commission">{t("org.pco.commissionPlan")}</label>
            <textarea
              id="pco-commission"
              value={commission}
              onChange={(event) => setCommission(event.target.value)}
            />
          </div>
          <div className="rc-field">
            <label htmlFor="pco-attachment">{t("org.pco.attachments")}</label>
            <div className="org-actions">
              <input
                id="pco-attachment"
                value={attachmentName}
                placeholder={t("org.pco.attachmentPlaceholder")}
                onChange={(event) => setAttachmentName(event.target.value)}
              />
              <button
                type="button"
                className="rc-btn rc-btn--soft rc-btn--small"
                disabled={attachmentName.trim().length < 3}
                onClick={addAttachment}
              >
                {t("org.common.add")}
              </button>
            </div>
            <ul className="org-signal-list" style={{ marginTop: 8 }}>
              {attachments.map((item) => (
                <li key={item.id} className="org-signal">
                  <p className="org-meta">📎 {item.name}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rc-card__foot">
            <button type="button" className="rc-btn rc-btn--primary rc-btn--small" onClick={saveCommission}>
              {t("org.common.save")}
            </button>
          </div>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pco.modules")}</h2>
            <span className="rc-card__hint">{modules.length}</span>
          </div>
          <ul className="org-module-list">
            {modules.map((module) => {
              const designation = responsibleFor(plan, module.id);
              return (
                <li key={module.id} className="org-module">
                  <span className="org-module__index">{module.index}</span>
                  <div>
                    <strong>{t(module.nameKey)}</strong>
                    <p className="org-meta">
                      {designation
                        ? `${designation.personName} · ${t(designation.orgKey)}`
                        : t("org.missions.unassigned")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="rc-card__foot">
            {modules.length === 0 ? (
              <p className="org-note">{t("org.pco.noModules")}</p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pco.feed")}</h2>
            <span className="rc-card__hint">{t("org.pco.lead")}</span>
          </div>
          <ul className="rc-timeline">
            {PCO_FEED.map((item) => (
              <li className="rc-timeline__item" key={item.at}>
                <span className="rc-timeline__icon" aria-hidden="true">
                  •
                </span>
                <div className="rc-timeline__body">
                  <p className="rc-timeline__reason">{loc(lang, item.text)}</p>
                  <p className="rc-timeline__meta">{item.at}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pco.requests")}</h2>
            <span className="rc-card__hint">
              {requests.filter((request) => request.status === "pending").length}{" "}
              {t("authority.crisis.requestPending").toLowerCase()}
            </span>
          </div>
          <ul className="org-request-list">
            {requests.map((request) => (
              <li key={request.id} className="org-request">
                <div className="org-request__main">
                  <div className="org-request__head">
                    <span className="org-cell__ref">{request.ref}</span>
                    <span
                      className={`rc-badge rc-badge--${
                        request.status === "pending" ? "medium" : "low"
                      }`}
                    >
                      {t(
                        request.status === "pending"
                          ? "authority.crisis.requestPending"
                          : "authority.crisis.requestAccepted",
                      )}
                    </span>
                  </div>
                  <p className="org-request__title">{loc(lang, request.subject)}</p>
                  <p className="org-request__meta">
                    <span>{request.at}</span>
                    <span>{t(`org.reinforcements.urgency.${request.urgency}`)}</span>
                  </p>
                </div>
                {request.status === "pending" ? (
                  <button
                    type="button"
                    className="rc-btn rc-btn--primary rc-btn--small"
                    onClick={() => processRequest(request.id)}
                  >
                    {t("org.common.process")}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </article>
      </section>
        </>
      ) : null}

      {tab === "main" ? (
        <MainCourantePanel scope="pco" showConflicts />
      ) : null}
      {tab === "pma" ? <PmaPanel /> : null}
      {tab === "means" ? <MeansPanel /> : null}
      {tab === "sectors" ? <SectorsPanel /> : null}
      {tab === "handover" ? <HandoverPanel /> : null}
      {tab === "map" ? <MapPanel /> : null}

      {modal ? (
        <Modal title={t("org.pco.requestTitle")} onClose={() => setModal(false)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendTrigger();
            }}
          >
            <p className="org-muted">{t("org.pco.requestLead")}</p>
            <div className="rc-field">
              <label htmlFor="pco-reason">{t("org.pco.requestReason")} *</label>
              <textarea
                id="pco-reason"
                value={reason}
                placeholder={t("org.pco.requestReasonPlaceholder")}
                onChange={(event) => setReason(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setModal(false)}>
                {t("org.common.cancel")}
              </button>
              <button type="submit" className="rc-btn rc-btn--danger" disabled={reason.trim().length < 8}>
                {t("org.common.send")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

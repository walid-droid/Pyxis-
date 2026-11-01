import "../shared/crisis/resp-crise.css";
import "./organisme.css";
import "../shared/plan/plan.css";
import "../shared/ops/ops.css";
import { useState } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import { ORG_MODULES_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useOrganisme } from "./orgContext";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import {
  ORSEC_MODULES,
  SITUATION_KEYS,
  modulesForLevel,
  responsibleFor,
} from "../shared/plan/orsecPlan";
import OrgHero from "./OrgHero";
import { loc, type Localized } from "./organismeData";

type Incoming = {
  id: string;
  ref: string;
  from: Localized;
  means: Localized;
  status: "pending" | "assigned" | "refused";
  unit?: string;
  reason?: Localized;
};

type Outgoing = {
  id: string;
  ref: string;
  to: Localized;
  means: Localized;
  status: "pending" | "transmitted";
};

const INCOMING: Incoming[] = [
  {
    id: "in1",
    ref: "REN-2026-088",
    from: { fr: "Protection civile · Tizi Ouzou", ar: "الحماية المدنية · تيزي وزو" },
    means: { fr: "2 équipes de secours, 1 embarcation", ar: "فريقا إنقاذ، قارب واحد" },
    status: "pending",
  },
  {
    id: "in2",
    ref: "REN-2026-086",
    from: { fr: "Direction de la santé", ar: "مديرية الصحة" },
    means: { fr: "1 ambulance médicalisée", ar: "إسعاف طبي واحد" },
    status: "pending",
  },
];

const OUTGOING: Outgoing[] = [
  {
    id: "out1",
    ref: "REN-2026-091",
    to: { fr: "Wilaya de Sétif", ar: "ولاية سطيف" },
    means: { fr: "1 groupe électrogène", ar: "مولد كهربائي واحد" },
    status: "pending",
  },
];

const UNIT_LEADS = [
  "Capitaine S. Haddad",
  "Cne N. Cherif",
  "Sgt B. Saidi",
];

/** S8 : console du directeur du PCF. */
export default function PcfPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const { plans } = useOrsecPlans();
  const plan = plans.wilaya;

  const [incoming, setIncoming] = useState<Incoming[]>(INCOMING);
  const [outgoing, setOutgoing] = useState<Outgoing[]>(OUTGOING);
  const [modal, setModal] = useState(false);
  const [refuseId, setRefuseId] = useState<string | null>(null);
  const [refusalReason, setRefusalReason] = useState("");
  const [person, setPerson] = useState("");
  const [role, setRole] = useState("");
  const [habilitated, setHabilitated] = useState<
    { id: string; person: string; role: string }[]
  >([
    {
      id: "hab1",
      person: "Commandant R. Amrani",
      role: "Représentant du PCF au PCO",
    },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const phase = plan.phase ?? "urgence";
  const moduleIds =
    plan.activation?.moduleIds ??
    modulesForLevel(plan.level).map((module) => module.id);
  const modules = modulesForLevel(plan.level).filter((module) =>
    moduleIds.includes(module.id),
  );

  const designation = plan.designations.find(
    (item) => item.personName === loc(lang, persona.name),
  );
  const designatedModule = designation
    ? ORSEC_MODULES.find((module) => module.id === designation.moduleId)
    : undefined;

  const assign = (request: Incoming, unit: string) => {
    setIncoming((current) =>
      current.map((item) =>
        item.id === request.id ? { ...item, status: "assigned", unit } : item,
      ),
    );
    setToast(t("org.pcf.assigned"));
  };

  const refuse = (id: string) => {
    if (refusalReason.trim().length < 8) return;
    setIncoming((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "refused",
              reason: { fr: refusalReason, ar: refusalReason },
            }
          : item,
      ),
    );
    setRefuseId(null);
    setRefusalReason("");
    setToast(t("org.pcf.refused"));
  };

  const transmit = (id: string) => {
    setOutgoing((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "transmitted" } : item,
      ),
    );
    setToast(t("org.pcf.transmitted"));
  };

  const habilitate = () => {
    if (person.trim().length < 3 || role.trim().length < 3) return;
    setHabilitated((current) => [
      { id: `hab-${Date.now()}`, person, role },
      ...current,
    ]);
    setModal(false);
    setPerson("");
    setRole("");
    setToast(t("org.pcf.habilitated"));
  };

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.pcf.eyebrow")}
        title={t("org.pcf.title")}
        lead={t("org.pcf.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {t(`org.pcf.phase.${phase}`)}
            </span>
            <span className="rc-chip">
              {modules.length} {t("org.pcf.modules").toLowerCase()}
            </span>
          </>
        }
        aside={
          <>
            <Link className="rc-btn rc-btn--ghost" to={ORG_MODULES_PATH}>
              {t("ops.modules.viewAll")}
            </Link>
            <button
              type="button"
              className="rc-btn rc-btn--primary"
              onClick={() => setModal(true)}
            >
              {t("org.pcf.habilitate")}
            </button>
          </>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      {designatedModule ? (
        <p className="orsec-alert orsec-alert--info" role="status">
          <strong>
            {t("org.pcf.moduleBanner", {
              module: t(designatedModule.nameKey),
            })}
          </strong>
          <span>{t("org.pcf.moduleBannerHint")}</span>
        </p>
      ) : null}

      <section className="ops-situation ops-situation--recovery">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.pcf.situation")}</h2>
          <span className="ops-badge ops-badge--info">{t("ops.pcf.readonly")}</span>
        </div>
        <p className="ops-card__lead">{t("ops.pcf.readonlyHint")}</p>
        <div className="ops-situation__row">
          <span className="ops-situation__code" aria-hidden="true">
            {plan.situation}
          </span>
          <div className="ops-situation__body">
            <span className="ops-situation__name">
              {t(SITUATION_KEYS[plan.situation].nameKey)}
            </span>
            <span className="ops-situation__meta">
              {t(`org.pcf.phase.${phase}`)} ·{" "}
              {plan.transitions[0]?.at ?? t("ops.pcf.noTransition")}
            </span>
          </div>
        </div>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pcf.modules")}</h2>
            <span className="rc-card__hint">{modules.length}</span>
          </div>
          <p className="rc-card__lead">{t("org.pcf.modulesLead")}</p>
          {modules.length === 0 ? (
            <p className="org-note">{t("org.pcf.noModules")}</p>
          ) : (
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
                          : t("orsec.modules.noOwner")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pcf.habilitatedList")}</h2>
            <span className="rc-card__hint">{habilitated.length}</span>
          </div>
          <p className="rc-card__lead">{t("org.pcf.habilitateLead")}</p>
          <ul className="org-signal-list">
            {habilitated.map((item) => (
              <li key={item.id} className="org-signal">
                <div className="org-signal__head">
                  <strong>{item.person}</strong>
                  <span className="rc-badge rc-badge--low">
                    {t("org.pcf.habilitateAdd")}
                  </span>
                </div>
                <p className="org-signal__meta">{item.role}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pcf.incoming")}</h2>
            <span className="rc-card__hint">
              {incoming.filter((item) => item.status === "pending").length}{" "}
              {t("authority.crisis.requestPending").toLowerCase()}
            </span>
          </div>
          <p className="rc-card__lead">{t("org.pcf.reinforcementsLead")}</p>
          {incoming.length === 0 ? (
            <p className="org-note">{t("org.pcf.empty")}</p>
          ) : (
            <ul className="org-request-list">
              {incoming.map((request) => (
                <li key={request.id} className="org-request">
                  <div className="org-request__main">
                    <div className="org-request__head">
                      <span className="org-cell__ref">{request.ref}</span>
                      <span
                        className={`rc-badge rc-badge--${
                          request.status === "pending"
                            ? "medium"
                            : request.status === "refused"
                              ? "critical"
                              : "low"
                        }`}
                      >
                        {t(
                          request.status === "pending"
                            ? "authority.crisis.requestPending"
                            : request.status === "refused"
                              ? "org.pcf.requestRefused"
                              : "authority.crisis.requestAccepted",
                        )}
                      </span>
                    </div>
                    <p className="org-request__title">
                      {loc(lang, request.from)} · {loc(lang, request.means)}
                    </p>
                    {request.unit ? (
                      <p className="org-request__meta">
                        {t("org.pcf.assign")} : {request.unit}
                      </p>
                    ) : null}
                    {request.reason ? (
                      <p className="org-request__meta">
                        {t("org.common.reason")} : {loc(lang, request.reason)}
                      </p>
                    ) : null}
                  </div>
                  {request.status === "pending" ? (
                    <div className="org-actions">
                      <select
                        className="org-select"
                        aria-label={t("org.pcf.assign")}
                        defaultValue=""
                        onChange={(event) => {
                          if (event.target.value) {
                            assign(request, event.target.value);
                          }
                        }}
                      >
                        <option value="">{t("org.pcf.assign")}</option>
                        {UNIT_LEADS.map((lead) => (
                          <option key={lead} value={lead}>
                            {lead}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rc-btn rc-btn--ghost-danger rc-btn--small"
                        onClick={() => {
                          setRefuseId(request.id);
                          setRefusalReason("");
                        }}
                      >
                        {t("org.common.refuse")}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("org.pcf.outgoing")}</h2>
            <span className="rc-card__hint">{outgoing.length}</span>
          </div>
          <ul className="org-request-list">
            {outgoing.map((request) => (
              <li key={request.id} className="org-request">
                <div className="org-request__main">
                  <div className="org-request__head">
                    <span className="org-cell__ref">{request.ref}</span>
                    <span
                      className={`rc-badge rc-badge--${
                        request.status === "transmitted" ? "low" : "medium"
                      }`}
                    >
                      {t(
                        request.status === "transmitted"
                          ? "authority.crisis.reportSent"
                          : "authority.crisis.requestPending",
                      )}
                    </span>
                  </div>
                  <p className="org-request__title">
                    {loc(lang, request.to)} · {loc(lang, request.means)}
                  </p>
                </div>
                {request.status === "pending" ? (
                  <button
                    type="button"
                    className="rc-btn rc-btn--primary rc-btn--small"
                    onClick={() => transmit(request.id)}
                  >
                    {t("org.common.transmit")}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </article>
      </section>

      {modal ? (
        <Modal title={t("org.pcf.habilitateTitle")} onClose={() => setModal(false)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              habilitate();
            }}
          >
            <p className="org-muted">{t("org.pcf.habilitateLead")}</p>
            <div className="rc-field">
              <label htmlFor="pcf-person">{t("org.pcf.person")} *</label>
              <input
                id="pcf-person"
                value={person}
                onChange={(event) => setPerson(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="pcf-role">{t("org.pcf.role")} *</label>
              <input
                id="pcf-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setModal(false)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={person.trim().length < 3 || role.trim().length < 3}
              >
                {t("org.pcf.habilitateAdd")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {refuseId ? (
        <Modal title={t("org.pcf.refuseTitle")} onClose={() => setRefuseId(null)}>
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              refuse(refuseId);
            }}
          >
            <p className="org-muted">{t("org.pcf.refuseLead")}</p>
            <div className="rc-field">
              <label htmlFor="pcf-refusal">{t("org.common.reason")} *</label>
              <textarea
                id="pcf-refusal"
                value={refusalReason}
                onChange={(event) => setRefusalReason(event.target.value)}
                required
                minLength={8}
              />
              <span className="org-field-hint">
                {refusalReason.trim().length < 8
                  ? t("org.common.required")
                  : "✓"}
              </span>
            </div>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setRefuseId(null)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--danger"
                disabled={refusalReason.trim().length < 8}
              >
                {t("org.common.refuse")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

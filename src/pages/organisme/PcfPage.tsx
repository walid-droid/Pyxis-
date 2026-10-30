import "../command/resp-crise.css";
import "./organisme.css";
import { useState } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import {
  modulesForLevel,
  responsibleFor,
  type PlanPhase,
} from "../shared/plan/orsecPlan";
import OrgHero from "./OrgHero";
import { loc, type Localized } from "./organismeData";

type Incoming = {
  id: string;
  ref: string;
  from: Localized;
  means: Localized;
  status: "pending" | "assigned";
  unit?: string;
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
    status: "transmitted",
  },
];

const PHASES: PlanPhase[] = ["urgence", "evaluation", "rehabilitation"];

const UNIT_LEADS = [
  "Capitaine S. Haddad",
  "Cne N. Cherif",
  "Sgt B. Saidi",
];

/** S8 : console du directeur du PCF. */
export default function PcfPage() {
  const { t, lang } = useI18n();
  const { plans, setPhase } = useOrsecPlans();
  const plan = plans.wilaya;

  const [incoming, setIncoming] = useState<Incoming[]>(INCOMING);
  const [outgoing] = useState<Outgoing[]>(OUTGOING);
  const [modal, setModal] = useState(false);
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

  const assign = (request: Incoming, unit: string) => {
    setIncoming((current) =>
      current.map((item) =>
        item.id === request.id ? { ...item, status: "assigned", unit } : item,
      ),
    );
    setToast(t("org.pcf.assigned"));
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
          <button
            type="button"
            className="rc-btn rc-btn--primary"
            onClick={() => setModal(true)}
          >
            {t("org.pcf.habilitate")}
          </button>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.pcf.phase")}</h2>
          <span className="rc-card__hint">{t("org.pcf.phaseHint")}</span>
        </div>
        <div className="orsec-levels" role="group" aria-label={t("org.pcf.phase")}>
          {PHASES.map((value) => (
            <button
              key={value}
              type="button"
              className={`orsec-levels__btn${phase === value ? " is-active" : ""}`}
              aria-pressed={phase === value}
              onClick={() => {
                setPhase(plan.id, value);
                setToast(t(`org.pcf.phase.${value}`));
              }}
            >
              {t(`org.pcf.phase.${value}`)}
            </button>
          ))}
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
                    <p className="org-request__title">
                      {loc(lang, request.from)} · {loc(lang, request.means)}
                    </p>
                    {request.unit ? (
                      <p className="org-request__meta">
                        {t("org.pcf.assign")} : {request.unit}
                      </p>
                    ) : null}
                  </div>
                  {request.status === "pending" ? (
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
                    <span className="rc-badge rc-badge--low">
                      {t("authority.crisis.reportSent")}
                    </span>
                  </div>
                  <p className="org-request__title">
                    {loc(lang, request.to)} · {loc(lang, request.means)}
                  </p>
                </div>
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
    </main>
  );
}

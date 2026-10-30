import "../command/resp-crise.css";
import "../organisme/organisme.css";
import "./authority.css";
import { useState } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import { AUTHORITY_PLAN_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { useOrsecPlans } from "../shared/plan/PlanContext";
import {
  designatedCount,
  modulesForLevel,
  responsibleFor,
} from "../shared/plan/orsecPlan";
import {
  AUTHORITY_SIMULATIONS,
  loc,
  type Localized,
  type Simulation,
} from "../organisme/organismeData";

type Scope = "commune" | "wilaya" | "national";

const SCOPES: Scope[] = ["commune", "wilaya", "national"];

const ACTOR: Record<Scope, string> = {
  commune: "Président de l'APC de Béjaïa",
  wilaya: "Wali de Béjaïa",
  national: "Ministre de l'Intérieur",
};

const RECIPIENT: Record<Scope, Localized> = {
  commune: { fr: "Wali de Béjaïa", ar: "والي بجاية" },
  wilaya: { fr: "Ministre de l'Intérieur", ar: "وزير الداخلية" },
  national: { fr: "Premier ministre", ar: "الوزير الأول" },
};

type ReinforcementRequest = {
  id: string;
  ref: string;
  from: Localized;
  means: Localized;
  quantity: number;
  at: string;
  status: "pending" | "processed";
};

const REINFORCEMENTS: ReinforcementRequest[] = [
  {
    id: "ar1",
    ref: "REN-2026-088",
    from: { fr: "Protection civile · Béjaïa", ar: "الحماية المدنية · بجاية" },
    means: { fr: "Équipes de secours avec embarcations", ar: "فرق إنقاذ مع قوارب" },
    quantity: 2,
    at: "30/10/2026 · 09:10",
    status: "pending",
  },
  {
    id: "ar2",
    ref: "REN-2026-086",
    from: { fr: "Direction de la santé", ar: "مديرية الصحة" },
    means: { fr: "Ambulance médicalisée", ar: "إسعاف طبي" },
    quantity: 1,
    at: "30/10/2026 · 08:55",
    status: "pending",
  },
  {
    id: "ar3",
    ref: "REN-2026-081",
    from: { fr: "Conservation des forêts", ar: "محافظة الغابات" },
    means: { fr: "Camion-citerne", ar: "صهريج" },
    quantity: 1,
    at: "30/10/2026 · 07:20",
    status: "processed",
  },
];

type PcRequest = {
  id: string;
  ref: string;
  subject: Localized;
  at: string;
  status: "pending" | "accepted";
};

const PC_REQUESTS: PcRequest[] = [
  {
    id: "pcr1",
    ref: "PCO-2026-044",
    subject: {
      fr: "Déclenchement du plan de wilaya — crue de la Soummam",
      ar: "إطلاق خطة الولاية — فيضان سومام",
    },
    at: "30/10/2026 · 09:02",
    status: "pending",
  },
  {
    id: "pcr2",
    ref: "PCO-2026-043",
    subject: {
      fr: "Renfort en moyens nautiques et appui médical",
      ar: "تعزيز بالوسائل النهرية والدعم الطبي",
    },
    at: "30/10/2026 · 08:40",
    status: "accepted",
  },
];

type SupportRequest = {
  id: string;
  wilaya: Localized;
  means: Localized;
  status: "sent" | "accepted";
};

const SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: "sup1",
    wilaya: { fr: "Wilaya de Tizi Ouzou", ar: "ولاية تيزي وزو" },
    means: { fr: "2 équipes de secours, 1 ambulance", ar: "فريقا إنقاذ، إسعاف واحد" },
    status: "accepted",
  },
];

type LocalReport = {
  id: string;
  ref: string;
  title: Localized;
  recipient: Localized;
  createdAt: string;
  status: "draft" | "sent";
};

const NOTIFICATIONS = [
  {
    id: "n1",
    wilaya: { fr: "Wilaya de Béjaïa", ar: "ولاية بجاية" },
    text: {
      fr: "Le wali signale 7 incidents actifs et demande l'appui de Tizi Ouzou.",
      ar: "الوالي يبلغ عن 7 حوادث نشطة ويطلب دعم تيزي وزو.",
    },
    at: "30/10/2026 · 09:20",
    status: { fr: "À traiter", ar: "للمعالجة" },
  },
  {
    id: "n2",
    wilaya: { fr: "Wilaya de Tizi Ouzou", ar: "ولاية تيزي وزو" },
    text: {
      fr: "Compte rendu : deux équipes engagées sur l'axe RN26.",
      ar: "تقرير: فريقان مشاركان على محور الطريق الوطنية 26.",
    },
    at: "30/10/2026 · 08:55",
    status: { fr: "Reçu", ar: "مستلم" },
  },
  {
    id: "n3",
    wilaya: { fr: "Wilaya de Sétif", ar: "ولاية سطيف" },
    text: {
      fr: "Aucun incident majeur ; moyens disponibles pour renfort.",
      ar: "لا حوادث كبرى؛ الوسائل متاحة للتعزيز.",
    },
    at: "30/10/2026 · 08:10",
    status: { fr: "Reçu", ar: "مستلم" },
  },
];

/** S8 : activation et conduite de la crise par l'autorité compétente. */
export default function AuthorityCrisisPage() {
  const { t, lang } = useI18n();
  const { plans } = useOrsecPlans();
  const [scope, setScope] = useState<Scope>("wilaya");
  const [reinforcements, setReinforcements] =
    useState<ReinforcementRequest[]>(REINFORCEMENTS);
  const [pcRequests, setPcRequests] = useState<PcRequest[]>(PC_REQUESTS);
  const [support, setSupport] = useState<SupportRequest[]>(SUPPORT_REQUESTS);
  const [simulations, setSimulations] = useState<Simulation[]>(AUTHORITY_SIMULATIONS);
  const [reports, setReports] = useState<LocalReport[]>([]);
  const [supportModal, setSupportModal] = useState(false);
  const [simulationModal, setSimulationModal] = useState(false);
  const [neighbor, setNeighbor] = useState("Tizi Ouzou");
  const [supportMeans, setSupportMeans] = useState("");
  const [supportReason, setSupportReason] = useState("");
  const [simulationDate, setSimulationDate] = useState("30/11/2026");
  const [simulationScope, setSimulationScope] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const plan = plans[scope];
  const designated = designatedCount(plan);
  const planModules = modulesForLevel(plan.level);
  const modules = planModules.filter(
    (module) => !plan.activation || plan.activation.moduleIds.includes(module.id),
  );

  const processReinforcement = (id: string) => {
    setReinforcements((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status: "processed" } : request,
      ),
    );
    setToast(t("authority.crisis.requestProcessed"));
  };

  const processPcRequest = (id: string) => {
    setPcRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status: "accepted" } : request,
      ),
    );
    setToast(t("authority.crisis.requestProcessed"));
  };

  const createSupport = () => {
    if (supportMeans.trim().length < 4 || supportReason.trim().length < 8) return;
    setSupport((current) => [
      {
        id: `sup-${Date.now()}`,
        wilaya: { fr: `Wilaya de ${neighbor}`, ar: `ولاية ${neighbor}` },
        means: { fr: supportMeans, ar: supportMeans },
        status: "sent",
      },
      ...current,
    ]);
    setSupportModal(false);
    setSupportMeans("");
    setSupportReason("");
    setToast(t("authority.crisis.supportSent"));
  };

  const addSimulation = () => {
    if (simulationScope.trim().length < 4) return;
    setSimulations((current) => [
      {
        id: `sim-${Date.now()}`,
        date: simulationDate,
        scope: { fr: simulationScope, ar: simulationScope },
        status: "planned",
      },
      ...current,
    ]);
    setSimulationModal(false);
    setSimulationScope("");
    setToast(t("authority.crisis.simulationAdded"));
  };

  const buildReport = () => {
    setReports((current) => [
      {
        id: `rep-${Date.now()}`,
        ref: `RAP-2026-${String(12 + current.length).padStart(3, "0")}`,
        title: {
          fr: `Rapport détaillé — ${t(`orsec.level.${scope}`)}`,
          ar: `تقرير مفصل — ${t(`orsec.level.${scope}`)}`,
        },
        recipient: RECIPIENT[scope],
        createdAt: "30/10/2026",
        status: "draft",
      },
      ...current,
    ]);
    setToast(t("authority.crisis.reportBuilt"));
  };

  const transmitReport = (id: string) => {
    setReports((current) =>
      current.map((report) =>
        report.id === id ? { ...report, status: "sent" } : report,
      ),
    );
    setToast(t("authority.crisis.reportTransmitted"));
  };

  return (
    <main className="rc-page rc-page--authority">
      <div className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("authority.crisis.eyebrow")}</p>
          <h1>{t("authority.crisis.title")}</h1>
          <p className="rc-hero__lead">{t("authority.crisis.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--high" />
              {ACTOR[scope]} · {t(`orsec.level.${scope}`)}
            </span>
            <span className="rc-chip">
              {t("orsec.statusShort." + plan.status)}
            </span>
          </div>
        </div>
        <div className="rc-hero__aside">
          <Link className="rc-btn rc-btn--primary" to={AUTHORITY_PLAN_PATH}>
            {t("authority.crisis.managePlan")}
          </Link>
        </div>
      </div>

      {toast ? (
        <p className="au-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="orsec-toolbar">
        <div className="orsec-levels" role="group" aria-label={t("authority.crisis.scope")}>
          {SCOPES.map((value) => (
            <button
              key={value}
              type="button"
              className={`orsec-levels__btn${scope === value ? " is-active" : ""}`}
              aria-pressed={scope === value}
              onClick={() => setScope(value)}
            >
              {t(`orsec.level.${value}`)}
            </button>
          ))}
        </div>
        <p className="orsec-toolbar__hint">{t("authority.crisis.scope")}</p>
      </section>

      <section className="stat-grid" aria-label={t("authority.crisis.title")}>
        <StatCard
          value={t(`orsec.statusShort.${plan.status}`)}
          label={t("authority.crisis.statPlan")}
          badge={plan.phase ? t(`orsec.phase.${plan.phase}`) : t(`orsec.level.${scope}`)}
          badgeTone={plan.status === "active" ? "danger" : "info"}
        />
        <StatCard
          value={`${designated}/${planModules.length}`}
          label={t("authority.crisis.statModules")}
          badge={t("authority.crisis.modulesLead")}
          badgeTone={designated > 0 ? "success" : "warning"}
        />
        <StatCard
          value={String(
            reinforcements.filter((request) => request.status === "pending").length,
          )}
          label={t("authority.crisis.statReinforcements")}
          badge={t("authority.crisis.reinforcementsLead")}
          badgeTone="warning"
        />
        <StatCard
          value={String(
            pcRequests.filter((request) => request.status === "pending").length,
          )}
          label={t("authority.crisis.statRequests")}
          badge={t("authority.crisis.pcRequestsLead")}
          badgeTone="danger"
        />
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.crisis.modulesTitle")}</h2>
            <span className="rc-card__hint">
              {designated}/{planModules.length}
            </span>
          </div>
          <p className="rc-card__lead">{t("authority.crisis.modulesLead")}</p>

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
                  <span
                    className={`rc-badge rc-badge--${
                      designation ? "low" : "medium"
                    }`}
                  >
                    {designation
                      ? t("authority.crisis.requestAccepted")
                      : t("authority.crisis.requestPending")}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="rc-card__foot">
            <Link className="rc-btn rc-btn--soft rc-btn--small" to={AUTHORITY_PLAN_PATH}>
              {t("authority.crisis.managePlan")}
            </Link>
          </div>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.crisis.progressTitle")}</h2>
            <span className="rc-badge rc-badge--high">
              {t(`orsec.statusShort.${plan.status}`)}
            </span>
          </div>
          <p className="rc-card__lead">{t("authority.crisis.progressLead")}</p>

          <dl className="org-facts">
            <div>
              <dt>{t("authority.crisis.statPlan")}</dt>
              <dd>{plan.reference} · {plan.version}</dd>
            </div>
            <div>
              <dt>{t("authority.crisis.progressLead")}</dt>
              <dd>{plan.phase ? t(`orsec.phase.${plan.phase}`) : "—"}</dd>
            </div>
            <div>
              <dt>{t("authority.crisis.statModules")}</dt>
              <dd>{plan.activation?.moduleIds.length ?? designated}</dd>
            </div>
            <div>
              <dt>{t("authority.crisis.reportRecipient")}</dt>
              <dd>{loc(lang, RECIPIENT[scope])}</dd>
            </div>
          </dl>

          <ul className="rc-timeline">
            {plan.log.slice(0, 4).map((item) => (
              <li className="rc-timeline__item" key={item.id}>
                <span className="rc-timeline__icon" aria-hidden="true">
                  •
                </span>
                <div className="rc-timeline__body">
                  <p className="rc-timeline__reason">
                    {t(item.actionKey)}
                    {item.subject ? ` — ${item.subject}` : ""}
                  </p>
                  <p className="rc-timeline__meta">{item.at}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.crisis.reinforcementsTitle")}</h2>
            <span className="rc-card__hint">
              {reinforcements.filter((request) => request.status === "pending").length}{" "}
              {t("authority.crisis.requestPending").toLowerCase()}
            </span>
          </div>
          <p className="rc-card__lead">{t("authority.crisis.reinforcementsLead")}</p>

          <ul className="org-request-list">
            {reinforcements.map((request) => (
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
                    {request.quantity} × {loc(lang, request.means)}
                  </p>
                  <p className="org-request__meta">
                    <span>{loc(lang, request.from)}</span>
                    <span>{request.at}</span>
                  </p>
                </div>
                {request.status === "pending" ? (
                  <button
                    type="button"
                    className="rc-btn rc-btn--primary rc-btn--small"
                    onClick={() => processReinforcement(request.id)}
                  >
                    {t("org.common.process")}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="rc-card__foot">
            <button
              type="button"
              className="rc-btn rc-btn--soft rc-btn--small"
              onClick={() => setSupportModal(true)}
            >
              {t("authority.crisis.requestSupport")}
            </button>
          </div>

          {support.length > 0 ? (
            <ul className="org-support-list">
              {support.map((request) => (
                <li key={request.id}>
                  <strong>{loc(lang, request.wilaya)}</strong>
                  <span>{loc(lang, request.means)}</span>
                  <span className="rc-badge rc-badge--low">
                    {t("authority.crisis.supportSent")}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="rc-card org-card--urgent">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.crisis.pcRequestsTitle")}</h2>
            <span className="rc-badge rc-badge--critical">
              {t("authority.crisis.pcRequestsLead")}
            </span>
          </div>
          <p className="rc-card__lead">{t("authority.crisis.pcRequestsLead")}</p>

          <ul className="org-request-list">
            {pcRequests.map((request) => (
              <li key={request.id} className="org-request">
                <div className="org-request__main">
                  <div className="org-request__head">
                    <span className="org-cell__ref">{request.ref}</span>
                    <span
                      className={`rc-badge rc-badge--${
                        request.status === "pending" ? "critical" : "low"
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
                    <span>{t("authority.crisis.requester")}</span>
                    <span>{t("authority.crisis.requestAt")} {request.at}</span>
                  </p>
                </div>
                {request.status === "pending" ? (
                  <button
                    type="button"
                    className="rc-btn rc-btn--danger rc-btn--small"
                    onClick={() => processPcRequest(request.id)}
                  >
                    {t("authority.crisis.processRequest")}
                  </button>
                ) : (
                  <Link className="rc-btn rc-btn--soft rc-btn--small" to={AUTHORITY_PLAN_PATH}>
                    {t("authority.crisis.managePlan")}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rc-grid rc-grid--split">
        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.crisis.simulationsTitle")}</h2>
            <button
              type="button"
              className="rc-btn rc-btn--soft rc-btn--small"
              onClick={() => setSimulationModal(true)}
            >
              {t("authority.crisis.schedule")}
            </button>
          </div>
          <p className="rc-card__lead">{t("authority.crisis.simulationsLead")}</p>

          <ul className="rc-list">
            {simulations.map((simulation) => (
              <li key={simulation.id}>
                <div className="rc-item rc-item--static">
                  <div className="rc-item__body">
                    <p className="rc-item__title">{loc(lang, simulation.scope)}</p>
                    <p className="rc-item__meta">
                      <span>{simulation.date}</span>
                    </p>
                  </div>
                  <span
                    className={`rc-badge rc-badge--${
                      simulation.status === "done"
                        ? "low"
                        : simulation.status === "planned"
                          ? "medium"
                          : "standby"
                    }`}
                  >
                    {t(`authority.crisis.simulationStatus.${simulation.status}`)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rc-card">
          <div className="rc-card__head">
            <h2 className="rc-card__title">{t("authority.crisis.reportTitle")}</h2>
            <button
              type="button"
              className="rc-btn rc-btn--primary rc-btn--small"
              onClick={buildReport}
            >
              {t("authority.crisis.buildReport")}
            </button>
          </div>
          <p className="rc-card__lead">{t("authority.crisis.reportLead")}</p>

          {reports.length === 0 ? (
            <p className="rc-empty">{t("authority.crisis.empty")}</p>
          ) : (
            <ul className="org-report-list">
              {reports.map((report) => (
                <li key={report.id}>
                  <div>
                    <span className="org-cell__ref">{report.ref}</span>
                    <strong>{loc(lang, report.title)}</strong>
                    <p className="org-meta">
                      {report.createdAt} · {t("authority.crisis.reportRecipient")} :{" "}
                      {loc(lang, report.recipient)}
                    </p>
                  </div>
                  <span
                    className={`rc-badge rc-badge--${
                      report.status === "draft" ? "medium" : "low"
                    }`}
                  >
                    {t(
                      report.status === "draft"
                        ? "authority.crisis.reportDraft"
                        : "authority.crisis.reportSent",
                    )}
                  </span>
                  {report.status === "draft" ? (
                    <button
                      type="button"
                      className="rc-btn rc-btn--soft rc-btn--small"
                      onClick={() => transmitReport(report.id)}
                    >
                      {t("authority.crisis.transmitReport")}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("authority.crisis.notificationsTitle")}</h2>
          <span className="rc-card__hint">
            {scope === "national"
              ? t("authority.crisis.notificationsLead")
              : t("authority.crisis.nationalOnly")}
          </span>
        </div>
        <p className="rc-card__lead">{t("authority.crisis.notificationsLead")}</p>

        {scope === "national" ? (
          <ul className="org-notification-list">
            {NOTIFICATIONS.map((notification) => (
              <li key={notification.id}>
                <div>
                  <strong>{loc(lang, notification.wilaya)}</strong>
                  <p>{loc(lang, notification.text)}</p>
                </div>
                <div className="org-notification__side">
                  <span className="org-meta">{notification.at}</span>
                  <span className="rc-badge rc-badge--medium">
                    {loc(lang, notification.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="au-note">{t("authority.crisis.nationalOnly")}</p>
        )}
      </article>

      {supportModal ? (
        <Modal
          title={t("authority.crisis.supportTitle")}
          onClose={() => setSupportModal(false)}
        >
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              createSupport();
            }}
          >
            <p className="org-muted">{t("authority.crisis.supportLead")}</p>
            <div className="rc-field">
              <label htmlFor="support-neighbor">{t("authority.crisis.neighbor")}</label>
              <select
                id="support-neighbor"
                value={neighbor}
                onChange={(event) => setNeighbor(event.target.value)}
              >
                <option value="Tizi Ouzou">Tizi Ouzou</option>
                <option value="Jijel">Jijel</option>
                <option value="Sétif">Sétif</option>
                <option value="Bouira">Bouira</option>
              </select>
            </div>
            <div className="rc-field">
              <label htmlFor="support-means">{t("authority.crisis.requestSupport")} *</label>
              <input
                id="support-means"
                value={supportMeans}
                onChange={(event) => setSupportMeans(event.target.value)}
                required
                minLength={4}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="support-reason">{t("org.common.justification")} *</label>
              <textarea
                id="support-reason"
                value={supportReason}
                onChange={(event) => setSupportReason(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setSupportModal(false)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={supportMeans.trim().length < 4 || supportReason.trim().length < 8}
              >
                {t("org.common.send")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {simulationModal ? (
        <Modal
          title={t("authority.crisis.simulationTitle")}
          onClose={() => setSimulationModal(false)}
        >
          <form
            className="rc-form"
            onSubmit={(event) => {
              event.preventDefault();
              addSimulation();
            }}
          >
            <div className="rc-form__row">
              <div className="rc-field">
                <label htmlFor="simulation-date">{t("authority.crisis.simulationDate")}</label>
                <input
                  id="simulation-date"
                  type="date"
                  value={simulationDate}
                  onChange={(event) => setSimulationDate(event.target.value)}
                />
              </div>
              <div className="rc-field">
                <label htmlFor="simulation-scope">{t("authority.crisis.simulationScope")} *</label>
                <input
                  id="simulation-scope"
                  value={simulationScope}
                  onChange={(event) => setSimulationScope(event.target.value)}
                  required
                  minLength={4}
                />
              </div>
            </div>
            <div className="org-modal-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => setSimulationModal(false)}>
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={simulationScope.trim().length < 4}
              >
                {t("org.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

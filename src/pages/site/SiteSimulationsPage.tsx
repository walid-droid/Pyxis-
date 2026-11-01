import "../shared/crisis/resp-crise.css";
import "./site.css";
import { useState } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import { SITE_DASHBOARD_PATH } from "../../config";
import { useI18n } from "../../i18n";
import { exportCsv, printDocument } from "../../lib/exportData";

type Simulation = {
  key: string;
  date: string;
  status: "done" | "planned" | "todo";
  tone: "low" | "medium" | "standby";
};

type ExerciseReport = {
  key: string;
  date: string;
  duration: string;
  participants: number;
  expected: number;
  evacuationTime: string;
  gaps: string[];
  actions: string[];
};

const SIMULATIONS: Simulation[] = [
  { key: "s1", date: "12/03/2026", status: "done", tone: "low" },
  { key: "s2", date: "18/06/2026", status: "done", tone: "low" },
  { key: "s3", date: "22/09/2026", status: "planned", tone: "medium" },
  { key: "s4", date: "15/12/2026", status: "todo", tone: "standby" },
];

/** Rapports des exercices déjà réalisés (P1 : rendre le bouton opérant). */
const REPORTS: Record<string, ExerciseReport> = {
  s1: {
    key: "s1",
    date: "12/03/2026",
    duration: "1 h 25",
    participants: 186,
    expected: 192,
    evacuationTime: "4 min 40",
    gaps: [
      "site.simulations.report.gap.s1a",
      "site.simulations.report.gap.s1b",
    ],
    actions: [
      "site.simulations.report.action.s1a",
      "site.simulations.report.action.s1b",
    ],
  },
  s2: {
    key: "s2",
    date: "18/06/2026",
    duration: "55 min",
    participants: 42,
    expected: 44,
    evacuationTime: "3 min 10",
    gaps: ["site.simulations.report.gap.s2a"],
    actions: ["site.simulations.report.action.s2a"],
  },
};

/** Programme annuel des simulations du site sensible. */
function SiteSimulationsPage() {
  const { t } = useI18n();
  const [openReport, setOpenReport] = useState<ExerciseReport | null>(null);

  const exportReport = (report: ExerciseReport) => {
    exportCsv(`rapport-exercice-${report.key}`, [
      {
        exercice: t(`site.simulations.${report.key}`),
        date: report.date,
        duree: report.duration,
        participants: report.participants,
        effectif_attendu: report.expected,
        evacuation: report.evacuationTime,
        ecarts: report.gaps.map((key) => t(key)).join(" | "),
        actions: report.actions.map((key) => t(key)).join(" | "),
      },
    ]);
  };

  return (
    <main className="rc-page rc-page--site">
      <Link className="rc-back-link" to={SITE_DASHBOARD_PATH}>
        ← {t("common.back")}
      </Link>

      <section className="rc-hero rc-hero--compact">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("site.simulations.eyebrow")}</p>
          <h1>{t("site.simulations.title")}</h1>
          <p className="rc-hero__lead">{t("site.simulations.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--medium" />
              {t("site.simulations.chip")}
            </span>
          </div>
        </div>
        <div className="rc-hero__aside">
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={() => setOpenReport(REPORTS.s1)}
          >
            {t("site.simulations.report")}
          </button>
        </div>

        <section className="stat-grid" aria-label={t("site.simulations.statsLabel")}>
          <StatCard
            value="2"
            label={t("site.simulations.statDone")}
            badge={t("site.simulations.statDoneBadge")}
            badgeTone="success"
          />
          <StatCard
            value="1"
            label={t("site.simulations.statPlanned")}
            badge={t("site.simulations.statPlannedBadge")}
            badgeTone="warning"
          />
          <StatCard
            value="1"
            label={t("site.simulations.statTodo")}
            badge={t("site.simulations.statTodoBadge")}
            badgeTone="neutral"
          />
          <StatCard
            value="94 %"
            label={t("site.simulations.statParticipation")}
            badge={t("site.simulations.statParticipationBadge")}
            badgeTone="info"
          />
        </section>
      </section>

      <article className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("site.simulations.listTitle")}</h2>
          <span className="rc-card__hint">
            {t("site.simulations.listHint")}
          </span>
        </div>
        <p className="rc-card__lead">{t("site.simulations.listLead")}</p>

        <ul className="rc-list">
          {SIMULATIONS.map((simulation) => (
            <li key={simulation.key}>
              <div className="rc-item rc-item--static">
                <div className="rc-item__body">
                  <p className="rc-item__title">
                    {t(`site.simulations.${simulation.key}`)}
                  </p>
                  <p className="rc-item__meta">
                    <span>{simulation.date}</span>
                    <span>{t(`site.simulations.scope.${simulation.key}`)}</span>
                  </p>
                </div>
                {REPORTS[simulation.key] ? (
                  <button
                    type="button"
                    className="rc-btn rc-btn--soft rc-btn--small"
                    onClick={() => setOpenReport(REPORTS[simulation.key])}
                  >
                    {t("site.simulations.report")}
                  </button>
                ) : (
                  <span className={`rc-badge rc-badge--${simulation.tone}`}>
                    {t(`site.simulations.status.${simulation.status}`)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="rc-card__foot">
          <p className="site-note">{t("site.simulations.note")}</p>
        </div>
      </article>

      {openReport ? (
        <Modal
          title={t("site.simulations.reportTitle", {
            name: t(`site.simulations.${openReport.key}`),
          })}
          onClose={() => setOpenReport(null)}
        >
          <div className="site-report">
            <p className="site-report__lead">
              {t("site.simulations.reportLead", { date: openReport.date })}
            </p>

            <dl className="site-report__facts">
              <div>
                <dt>{t("site.simulations.report.duration")}</dt>
                <dd>{openReport.duration}</dd>
              </div>
              <div>
                <dt>{t("site.simulations.report.participants")}</dt>
                <dd>
                  {openReport.participants} / {openReport.expected}
                </dd>
              </div>
              <div>
                <dt>{t("site.simulations.report.evacuation")}</dt>
                <dd>{openReport.evacuationTime}</dd>
              </div>
            </dl>

            <h3>{t("site.simulations.report.gaps")}</h3>
            <ul className="site-report__list">
              {openReport.gaps.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>

            <h3>{t("site.simulations.report.actions")}</h3>
            <ul className="site-report__list site-report__list--actions">
              {openReport.actions.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>

            <div className="site-report__actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setOpenReport(null)}
              >
                {t("common.close")}
              </button>
              <button
                type="button"
                className="rc-btn rc-btn--soft"
                onClick={() => exportReport(openReport)}
              >
                {t("common.exportCsv")}
              </button>
              <button
                type="button"
                className="rc-btn rc-btn--primary"
                onClick={printDocument}
              >
                {t("common.print")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

export default SiteSimulationsPage;

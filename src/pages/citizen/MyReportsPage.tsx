import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import { listReports } from "../../lib/reports";
import {
  REPORT_STATUS_ORDER,
  type CitizenReport,
  type ReportStatus,
} from "../../mockdata/report";
import "./MyReportsPage.css";

type Filter = "all" | ReportStatus;

function MyReportsPage() {
  const { t, tc, lang } = useI18n();
  const location = useLocation();

  const reports = useMemo(() => listReports(), []);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<CitizenReport | null>(null);
  const submittedId = (location.state as { submitted?: string } | null)?.submitted;
  const [notice, setNotice] = useState<string | null>(submittedId ?? null);

  const counts = useMemo(() => {
    const next = Object.fromEntries(
      REPORT_STATUS_ORDER.map((status) => [status, 0]),
    ) as Record<ReportStatus, number>;
    reports.forEach((report) => {
      next[report.status] += 1;
    });
    return next;
  }, [reports]);

  const activeCount = reports.filter((report) => report.status !== "closed").length;
  const visible =
    filter === "all" ? reports : reports.filter((report) => report.status === filter);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [lang],
  );

  const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

  const statusIndex = (status: ReportStatus) => REPORT_STATUS_ORDER.indexOf(status);

  const placeLabel = (report: CitizenReport) =>
    [report.place, report.commune, report.wilaya]
      .filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0,
      )
      .filter((part, index, all) => all.indexOf(part) === index)
      .map((part) => tc(part))
      .join(" · ");

  return (
    <main className="reports-page">
      <header className="reports-hero">
        <div className="reports-hero-text">
          <p className="reports-hero-eyebrow">{t("reports.eyebrow")}</p>
          <h1>{t("reports.title")}</h1>
          <p className="reports-hero-lead">{t("reports.lead")}</p>
        </div>

        <div className="reports-hero-aside">
          <Link to="/submit-alert" className="reports-hero-cta">
            {t("reports.new")}
          </Link>
        </div>
      </header>

      {notice && (
        <div className="reports-notice" role="status">
          <span>{t("reports.submitted", { id: notice })}</span>
          <button
            type="button"
            className="reports-notice-close"
            aria-label={t("common.close")}
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      <section className="reports-stats" aria-label={t("reports.summary")}>
        <div className="reports-stat">
          <span>{reports.length}</span>
          <small>{t("reports.total")}</small>
        </div>
        <div className="reports-stat reports-stat--active">
          <span>{activeCount}</span>
          <small>{t("reports.active")}</small>
        </div>
        <div className="reports-stat reports-stat--closed">
          <span>{counts.closed}</span>
          <small>{t("reports.closed")}</small>
        </div>
      </section>

      <div className="reports-filters" role="group" aria-label={t("reports.filterAria")}>
        <button
          type="button"
          className={`reports-filter${filter === "all" ? " is-active" : ""}`}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          {t("reports.all")}
          <span className="reports-filter-count">{reports.length}</span>
        </button>

        {REPORT_STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            className={`reports-filter${filter === status ? " is-active" : ""}`}
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {t(`reports.status.${status}`)}
            <span className="reports-filter-count">{counts[status]}</span>
          </button>
        ))}
      </div>

      <p className="reports-count">
        {t(visible.length === 1 ? "reports.count" : "reports.countPlural", {
          count: visible.length,
        })}
      </p>

      {visible.length > 0 ? (
        <ul className="reports-list">
          {visible.map((report) => {
            const current = statusIndex(report.status);
            return (
              <li key={report.id}>
                <article className="report-card">
                  <div className="report-card__head">
                    <span className="report-ref">{report.id}</span>
                    <span className={`report-status report-status--${report.status}`}>
                      {t(`reports.status.${report.status}`)}
                    </span>
                  </div>

                  <h2 className="report-card__title">{tc(report.title)}</h2>
                  <p className="report-card__desc">{tc(report.description)}</p>

                  <dl className="report-card__meta">
                    <div>
                      <dt>{t("reports.type")}</dt>
                      <dd>{t(`submit.type.${report.type}`)}</dd>
                    </div>
                    <div>
                      <dt>{t("reports.severity")}</dt>
                      <dd className={`report-sev report-sev--${report.severity}`}>
                        {t(`severity.${report.severity}`)}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("reports.location")}</dt>
                      <dd>{placeLabel(report)}</dd>
                    </div>
                    <div>
                      <dt>{t("reports.createdAt")}</dt>
                      <dd>{formatDate(report.createdAt)}</dd>
                    </div>
                  </dl>

                  <div className="report-card__foot">
                    <div
                      className="report-progress"
                      role="img"
                      aria-label={t("reports.progress", {
                        current: current + 1,
                        total: REPORT_STATUS_ORDER.length,
                      })}
                    >
                      {REPORT_STATUS_ORDER.map((status, index) => (
                        <span
                          key={status}
                          className={`report-progress-step${
                            index <= current ? " is-done" : ""
                          }${status === report.status ? " is-current" : ""}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="report-card__detail"
                      onClick={() => setSelected(report)}
                    >
                      {t("reports.detail")}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="reports-empty">
          <p>
            {reports.length === 0 ? t("reports.empty") : t("reports.emptyFiltered")}
          </p>
          <Link to="/submit-alert" className="ui-btn ui-btn--primary ui-btn--md">
            {t("reports.create")}
          </Link>
        </div>
      )}

      <p className="reports-note">{t("reports.demoNote")}</p>

      {selected && (
        <Modal title={selected.id} onClose={() => setSelected(null)}>
          <div className="report-detail">
            <div className="report-detail__badges">
              <span className={`report-status report-status--${selected.status}`}>
                {t(`reports.status.${selected.status}`)}
              </span>
              <span className={`report-sev report-sev--${selected.severity}`}>
                {t(`severity.${selected.severity}`)}
              </span>
              <span className="report-detail__type">
                {t(`submit.type.${selected.type}`)}
              </span>
            </div>

            <h3>{tc(selected.title)}</h3>
            <p className="report-detail__desc">{tc(selected.description)}</p>

            <dl className="report-detail__meta">
              <div>
                <dt>{t("reports.location")}</dt>
                <dd>{placeLabel(selected)}</dd>
              </div>
              <div>
                <dt>{t("reports.createdAt")}</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
              </div>
              {selected.latitude != null && selected.longitude != null && (
                <div>
                  <dt>{t("reports.gps")}</dt>
                  <dd>
                    {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
                  </dd>
                </div>
              )}
            </dl>

            {selected.teamMessage && (
              <div className="report-detail__message">
                <strong>{t("reports.teamMessage")}</strong>
                <p>{tc(selected.teamMessage)}</p>
              </div>
            )}

            <h4>{t("reports.timeline")}</h4>
            <ol className="report-timeline">
              {REPORT_STATUS_ORDER.map((status, index) => {
                const step = selected.steps.find((item) => item.status === status);
                const current = statusIndex(selected.status);
                const state =
                  index < current ? "done" : index === current ? "current" : "pending";
                return (
                  <li
                    key={status}
                    className={`report-timeline__item report-timeline__item--${state}`}
                  >
                    <span className="report-timeline__dot" aria-hidden="true" />
                    <div>
                      <strong>{t(`reports.status.${status}`)}</strong>
                      <span>
                        {step ? formatDate(step.at) : t("reports.stepPending")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="report-detail__actions">
              <button
                type="button"
                className="ui-btn ui-btn--secondary ui-btn--md"
                onClick={() => setSelected(null)}
              >
                {t("common.close")}
              </button>
              <Link to="/submit-alert" className="ui-btn ui-btn--primary ui-btn--md">
                {t("reports.create")}
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default MyReportsPage;

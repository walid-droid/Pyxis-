import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import Modal from "../../components/Modal";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import { citizenSignalements, findType } from "../../services/selectors";
import { useDb } from "../../services/useDb";
import { territoryLabel, userName } from "../shared/v3/helpers";
import type { Signalement, SignalState } from "../../services/model";
import "./MyReportsPage.css";

const FILTERS: Array<{ key: string; labelKey: string }> = [
  { key: "all", labelKey: "reports.filterAll" },
  { key: "non_verifie", labelKey: "reports.status.non_verifie" },
  { key: "confirme", labelKey: "reports.status.confirme" },
  { key: "rejete", labelKey: "reports.status.rejete" },
];

function severityClass(severity: string | undefined): string {
  if (severity === "critique") return "critique";
  if (severity === "elevee") return "elevee";
  if (severity === "moyenne") return "moyenne";
  return "faible";
}

export default function MyReportsPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Signalement | null>(null);
  const submittedId = (location.state as { submitted?: string } | null)?.submitted;
  const [notice, setNotice] = useState<string | null>(submittedId ?? null);

  const reports = useMemo(() => {
    if (!session) return [];
    return citizenSignalements(db, session.userId);
  }, [db, session]);

  const visible = useMemo(
    () => reports.filter((report) => filter === "all" || report.etat === filter),
    [reports, filter],
  );

  const statusKey = (status: SignalState) =>
    status === "non_verifie" ? "reports.status.non_verifie" : status;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [lang],
  );

  const formatDate = (iso: string | undefined) =>
    iso ? dateFormatter.format(new Date(iso)) : "—";
  const intervention = selected
    ? db.interventions.find((item) => item.signalementId === selected.id)
    : undefined;

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

      {notice ? (
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
      ) : null}

      <div className="reports-filters" role="group" aria-label={t("reports.filterAria")}>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`reports-filter${filter === item.key ? " is-active" : ""}`}
            aria-pressed={filter === item.key}
            onClick={() => setFilter(item.key)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <p className="reports-count">
        {t(visible.length === 1 ? "reports.count" : "reports.countPlural", {
          count: visible.length,
        })}
      </p>

      {visible.length === 0 ? (
        <div className="reports-empty">
          <p>{reports.length === 0 ? t("reports.empty") : t("reports.emptyFiltered")}</p>
          <Link to="/submit-alert" className="ui-btn ui-btn--primary ui-btn--md">
            {t("reports.create")}
          </Link>
        </div>
      ) : (
        <ul className="reports-list">
          {visible.map((report) => (
            <li key={report.id}>
              <article className="report-card">
                <div className="report-card__head">
                  <span className="report-ref">{report.id}</span>
                  <span className={`report-status report-status--${report.etat}`}>
                    {t(statusKey(report.etat))}
                  </span>
                </div>
                <h2 className="report-card__title">{report.description}</h2>
                <p className="report-card__desc">{report.description}</p>
                <dl className="report-card__meta">
                  <div>
                    <dt>{t("reports.type")}</dt>
                    <dd>{findType(db, report.typeId)?.libelle[lang] ?? report.typeId}</dd>
                  </div>
                  <div>
                    <dt>{t("reports.severity")}</dt>
                    <dd className={`report-sev report-sev--${severityClass(report.gravite)}`}>
                      {t(`gravity.${report.gravite ?? "moyenne"}`)}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("reports.location")}</dt>
                    <dd>{territoryLabel(db, report.communeId, lang)}</dd>
                  </div>
                  <div>
                    <dt>{t("reports.createdAt")}</dt>
                    <dd>{formatDate(report.creeLe)}</dd>
                  </div>
                </dl>
                <div className="report-card__foot">
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
          ))}
        </ul>
      )}

      <p className="reports-note">{t("reports.demoNote")}</p>

      {selected ? (
        <Modal title={selected.id} onClose={() => setSelected(null)}>
          <div className="report-detail">
            <div className="report-detail__badges">
              <span className={`report-status report-status--${selected.etat}`}>
                {t(statusKey(selected.etat))}
              </span>
              <span className={`report-sev report-sev--${severityClass(selected.gravite)}`}>
                {t(`gravity.${selected.gravite ?? "moyenne"}`)}
              </span>
              <span className="report-detail__type">
                {findType(db, selected.typeId)?.libelle[lang] ?? selected.typeId}
              </span>
            </div>

            <h3>{selected.description}</h3>
            <p className="report-detail__desc">{selected.description}</p>

            <dl className="report-detail__meta">
              <div>
                <dt>{t("reports.type")}</dt>
                <dd>{findType(db, selected.typeId)?.libelle[lang] ?? selected.typeId}</dd>
              </div>
              <div>
                <dt>{t("reports.severity")}</dt>
                <dd>{t(`gravity.${selected.gravite ?? "moyenne"}`)}</dd>
              </div>
              <div>
                <dt>{t("reports.location")}</dt>
                <dd>{territoryLabel(db, selected.communeId, lang)}</dd>
              </div>
              <div>
                <dt>{t("reports.createdAt")}</dt>
                <dd>{formatDate(selected.creeLe)}</dd>
              </div>
            </dl>

            {selected.traiteParModuleId ? (
              <div className="report-detail__message">
                <strong>{t("module.alerts.title")}</strong>
                <p>
                  {userName(db, selected.traiteParModuleId, lang)} ·{" "}
                  {findType(db, selected.typeId)?.libelle[lang]}
                </p>
              </div>
            ) : null}

            {intervention ? (
              <div className="report-detail__message">
                <strong>{t("reports.intervention")}</strong>
                <p>{intervention.id}</p>
              </div>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

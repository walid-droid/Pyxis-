import "./resp-crise.css";
import { useState } from "react";
import { useI18n } from "../../i18n";

type DecisionType =
  | "escalation"
  | "validation"
  | "diffusion"
  | "assignment"
  | "closure"
  | "command";

type Decision = {
  id: number;
  date: string;
  time: string;
  daysAgo: number;
  actor: string;
  type: DecisionType;
  textKey: string;
  incident: string;
};

const DECISIONS: Decision[] = [
  { id: 1, date: "23/10", time: "14:38", daysAgo: 0, actor: "R. Amrani", type: "escalation", textKey: "resp.log.d1", incident: "INC-001" },
  { id: 2, date: "23/10", time: "14:22", daysAgo: 0, actor: "S. Kaci", type: "validation", textKey: "resp.log.d2", incident: "INC-024" },
  { id: 3, date: "23/10", time: "14:05", daysAgo: 0, actor: "R. Amrani", type: "diffusion", textKey: "resp.log.d3", incident: "INC-001" },
  { id: 4, date: "23/10", time: "13:49", daysAgo: 0, actor: "N. Belkacem", type: "assignment", textKey: "resp.log.d4", incident: "INC-001" },
  { id: 5, date: "23/10", time: "13:31", daysAgo: 0, actor: "S. Kaci", type: "validation", textKey: "resp.log.d5", incident: "INC-018" },
  { id: 6, date: "23/10", time: "12:58", daysAgo: 0, actor: "R. Amrani", type: "closure", textKey: "resp.log.d6", incident: "INC-009" },
  { id: 7, date: "23/10", time: "12:40", daysAgo: 0, actor: "N. Belkacem", type: "assignment", textKey: "resp.log.d7", incident: "INC-002" },
  { id: 8, date: "23/10", time: "11:56", daysAgo: 0, actor: "R. Amrani", type: "escalation", textKey: "resp.log.d8", incident: "INC-002" },
  { id: 9, date: "23/10", time: "11:12", daysAgo: 0, actor: "S. Kaci", type: "diffusion", textKey: "resp.log.d9", incident: "INC-003" },
  { id: 10, date: "23/10", time: "10:45", daysAgo: 0, actor: "N. Belkacem", type: "closure", textKey: "resp.log.d10", incident: "INC-011" },
  { id: 11, date: "22/10", time: "18:20", daysAgo: 1, actor: "R. Amrani", type: "command", textKey: "resp.log.d11", incident: "INC-001" },
  { id: 12, date: "20/10", time: "09:05", daysAgo: 3, actor: "S. Kaci", type: "escalation", textKey: "resp.log.d12", incident: "INC-002" },
  { id: 13, date: "15/10", time: "16:30", daysAgo: 8, actor: "N. Belkacem", type: "command", textKey: "resp.log.d13", incident: "INC-004" },
];

const TYPE_FILTERS = [
  { id: "all", labelKey: "resp.log.filterAll" },
  { id: "escalation", labelKey: "resp.log.escalation" },
  { id: "command", labelKey: "resp.log.command" },
  { id: "validation", labelKey: "resp.log.validation" },
  { id: "diffusion", labelKey: "resp.log.diffusion" },
  { id: "assignment", labelKey: "resp.log.assignment" },
  { id: "closure", labelKey: "resp.log.closure" },
] as const;

const PERIODS = [
  { id: "today", days: 0, labelKey: "resp.log.periodToday" },
  { id: "7", days: 6, labelKey: "resp.log.period7" },
  { id: "30", days: 29, labelKey: "resp.log.period30" },
  { id: "all", days: null, labelKey: "resp.log.periodAll" },
] as const;

const INCIDENTS = Array.from(
  new Set(DECISIONS.map((decision) => decision.incident)),
).sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));

/** Écran 7 — journal des décisions et export RETEX. */
function JournalReports() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [incident, setIncident] = useState<string>("all");
  const [period, setPeriod] = useState<string>("today");

  const periodDays =
    PERIODS.find((item) => item.id === period)?.days ?? null;
  const periodLabel = t(
    PERIODS.find((item) => item.id === period)?.labelKey ??
      "resp.log.periodToday",
  );

  const visible = DECISIONS.filter((decision) => {
    const typeOk = filter === "all" || decision.type === filter;
    const incidentOk =
      incident === "all" || decision.incident === incident;
    const periodOk = periodDays === null || decision.daysAgo <= periodDays;
    return typeOk && incidentOk && periodOk;
  });

  function exportCsv() {
    const rows = [
      [
        t("resp.log.date"),
        t("resp.log.time"),
        t("resp.log.actor"),
        t("resp.log.type"),
        t("resp.log.decision"),
        t("resp.log.incident"),
      ],
      ...visible.map((decision) => [
        decision.date,
        decision.time,
        decision.actor,
        t(`resp.log.${decision.type}`),
        t(decision.textKey),
        decision.incident,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"),
      )
      .join("\r\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "journal-decisions-cadm.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <main className="rc-page">
      <section className="rc-hero">
        <div className="rc-hero__text">
          <p className="rc-eyebrow">{t("resp.log.eyebrow")}</p>
          <h1>{t("resp.log.title")}</h1>
          <p className="rc-hero__lead">{t("resp.log.lead")}</p>
          <div className="rc-hero__meta">
            <span className="rc-chip">
              {t("resp.log.summary", { count: DECISIONS.length })}
            </span>
            <span className="rc-chip">{periodLabel}</span>
          </div>
        </div>

        <div className="rc-hero__aside">
          <button
            type="button"
            className="rc-btn rc-btn--primary"
            onClick={() => window.print()}
          >
            {t("resp.log.exportPdf")}
          </button>
          <button
            type="button"
            className="rc-btn rc-btn--ghost"
            onClick={exportCsv}
          >
            {t("resp.log.export")}
          </button>
        </div>
      </section>

      <section className="rc-card">
        <div className="rc-toolbar">
          <div className="rc-toolbar__filters">
            <label className="rc-filter">
              <span>{t("resp.log.filterPeriod")}</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                {PERIODS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(item.labelKey)}
                  </option>
                ))}
              </select>
            </label>

            <label className="rc-filter">
              <span>{t("resp.log.filterIncident")}</span>
              <select
                value={incident}
                onChange={(event) => setIncident(event.target.value)}
              >
                <option value="all">{t("resp.log.allIncidents")}</option>
                {INCIDENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <span className="rc-card__hint">
            {t("resp.log.visibleCount", { count: visible.length })}
          </span>
        </div>

        <div className="rc-tabs" role="group" aria-label={t("resp.log.filterLabel")}>
          {TYPE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rc-tab${filter === item.id ? " is-active" : ""}`}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="rc-empty rc-empty--spaced">
            {t("resp.log.empty")}
          </p>
        ) : (
          <div className="rc-table-wrap rc-table-wrap--spaced">
            <table className="rc-table">
              <thead>
                <tr>
                  <th scope="col">{t("resp.log.timestamp")}</th>
                  <th scope="col">{t("resp.log.decision")}</th>
                  <th scope="col">{t("resp.log.actor")}</th>
                  <th scope="col">{t("resp.log.incident")}</th>
                  <th scope="col">{t("resp.log.type")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((decision) => (
                  <tr key={decision.id}>
                    <td>
                      <span className="rc-table__when">
                        <time>{decision.time}</time>
                        <span className="rc-table__date">
                          {decision.date}
                        </span>
                      </span>
                    </td>
                    <td>{t(decision.textKey)}</td>
                    <td>{decision.actor}</td>
                    <td>{decision.incident}</td>
                    <td>
                      <span className="rc-badge">
                        {t(`resp.log.${decision.type}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default JournalReports;

import { useMemo, useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import { useI18n } from "../../i18n";
import {
  assignmentIsActive,
  formatAssignmentDate,
  useAssignments,
  type AssignmentRecord,
} from "../../lib/assignments";
import { useOperator } from "../shared/ops/useOperator";
import OpsHero from "../shared/ops/OpsHero";
import "../shared/ops/ops.css";
import "./admin.css";

const TITLE_TYPES: AssignmentRecord["titleType"][] = [
  "TITULAIRE",
  "SUPPLEANT_1",
  "SUPPLEANT_2",
  "INTERIM",
];

const TITLE_KEYS: Record<AssignmentRecord["titleType"], string> = {
  TITULAIRE: "ops.assign.titulaire",
  SUPPLEANT_1: "ops.assign.suppleant1",
  SUPPLEANT_2: "ops.assign.suppleant2",
  INTERIM: "ops.assign.interim",
};

const BADGE: Record<AssignmentRecord["titleType"], string> = {
  TITULAIRE: "ok",
  SUPPLEANT_1: "info",
  SUPPLEANT_2: "info",
  INTERIM: "warn",
};

/** Administration des affectations : titulaire, suppléant et intérim. */
export default function AssignmentsPage() {
  const { t, lang } = useI18n();
  const operator = useOperator();
  const {
    assignments,
    addAssignment,
    setTitleType,
    closeAssignment,
    removeAssignment,
  } = useAssignments();
  const [filter, setFilter] = useState<"all" | "active" | "closed">("active");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [personName, setPersonName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [organism, setOrganism] = useState("");
  const [titleType, setTitleTypeValue] =
    useState<AssignmentRecord["titleType"]>("TITULAIRE");

  const visible = useMemo(() => {
    if (filter === "all") return assignments;
    return assignments.filter((record) =>
      filter === "active" ? assignmentIsActive(record) : !assignmentIsActive(record),
    );
  }, [assignments, filter]);

  const activeCount = assignments.filter((record) => assignmentIsActive(record)).length;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      personName.trim().length < 3 ||
      roleLabel.trim().length < 3 ||
      organism.trim().length < 3
    ) {
      return;
    }
    addAssignment({
      personName: personName.trim(),
      roleLabel: roleLabel.trim(),
      organism: organism.trim(),
      titleType,
    });
    setModal(false);
    setPersonName("");
    setRoleLabel("");
    setOrganism("");
    setToast(t("ops.assign.added"));
  };

  const rotateType = (record: AssignmentRecord) => {
    const index = TITLE_TYPES.indexOf(record.titleType);
    const next = TITLE_TYPES[(index + 1) % TITLE_TYPES.length];
    setTitleType(record.id, next);
    setToast(t("ops.assign.changed"));
  };

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.assign.title")}
        title={t("ops.assign.title")}
        lead={t("ops.assign.lead")}
        chips={
          <>
            <span className="ops-chip">
              {t("ops.assign.active")} · {activeCount}
            </span>
            <span className="ops-chip">
              {t("ops.common.count", { count: assignments.length })}
            </span>
            <span className="ops-chip">
              {t("ops.assign.continuity")} · {operator.roleLabel}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            className="ops-btn ops-btn--primary"
            onClick={() => setModal(true)}
          >
            {t("ops.assign.add")}
          </button>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <p className="ops-muted">{t("ops.assign.continuityHint")}</p>

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.assign.title")}</h2>
          <select
            className="ops-btn"
            value={filter}
            aria-label={t("ops.assign.filter")}
            onChange={(event) =>
              setFilter(event.target.value as "all" | "active" | "closed")
            }
          >
            <option value="active">{t("ops.assign.active")}</option>
            <option value="closed">{t("ops.assign.closed")}</option>
            <option value="all">{t("ops.common.all")}</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <p className="ops-empty">{t("ops.assign.empty")}</p>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>{t("ops.assign.person")}</th>
                  <th>{t("ops.assign.role")}</th>
                  <th>{t("ops.assign.type")}</th>
                  <th>{t("ops.assign.organism")}</th>
                  <th>{t("ops.assign.from")}</th>
                  <th>{t("ops.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((record) => {
                  const active = assignmentIsActive(record);
                  return (
                    <tr key={record.id}>
                      <td>
                        <strong>{record.personName}</strong>
                        {record.note ? (
                          <div className="ops-list__meta">{record.note}</div>
                        ) : null}
                      </td>
                      <td>
                        {record.roleLabel}
                        {record.designation ? (
                          <div className="ops-list__meta">
                            {t("ops.assign.designation")} · {record.designation}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <span className={`ops-badge ops-badge--${BADGE[record.titleType]}`}>
                          {t(TITLE_KEYS[record.titleType])}
                        </span>
                      </td>
                      <td>{record.organism}</td>
                      <td>
                        {formatAssignmentDate(record.from)}
                        <div className="ops-list__meta">
                          {record.to
                            ? `${t("ops.assign.to")} ${formatAssignmentDate(record.to)}`
                            : t("ops.assign.active")}
                        </div>
                      </td>
                      <td>
                        <div className="ops-table__actions">
                          <button
                            type="button"
                            className="ops-btn ops-btn--small"
                            onClick={() => rotateType(record)}
                          >
                            {t("ops.assign.change")}
                          </button>
                          {active ? (
                            <button
                              type="button"
                              className="ops-btn ops-btn--small"
                              onClick={() => {
                                closeAssignment(record.id);
                                setToast(t("ops.assign.closedToast"));
                              }}
                            >
                              {t("ops.assign.close")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ops-btn ops-btn--small"
                              onClick={() => {
                                removeAssignment(record.id);
                                setToast(t("ops.assign.closedToast"));
                              }}
                            >
                              {t("ops.assign.remove")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal ? (
        <Modal title={t("ops.assign.add")} onClose={() => setModal(false)}>
          <form className="ops-form" onSubmit={submit}>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.assign.person")} *</span>
                <input
                  value={personName}
                  onChange={(event) => setPersonName(event.target.value)}
                  minLength={3}
                  required
                />
              </label>
              <label className="ops-field">
                <span>{t("ops.assign.role")} *</span>
                <input
                  value={roleLabel}
                  onChange={(event) => setRoleLabel(event.target.value)}
                  minLength={3}
                  required
                />
              </label>
            </div>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.assign.organism")} *</span>
                <input
                  value={organism}
                  onChange={(event) => setOrganism(event.target.value)}
                  minLength={3}
                  required
                />
              </label>
              <label className="ops-field">
                <span>{t("ops.assign.type")}</span>
                <select
                  value={titleType}
                  onChange={(event) =>
                    setTitleTypeValue(
                      event.target.value as AssignmentRecord["titleType"],
                    )
                  }
                >
                  {TITLE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {t(TITLE_KEYS[value])}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="ops-muted">
              {t("ops.assign.continuityHint")} · {lang.toUpperCase()}
            </p>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setModal(false)}>
                {t("ops.common.cancel")}
              </button>
              <button
                type="submit"
                className="ops-btn ops-btn--primary"
                disabled={
                  personName.trim().length < 3 ||
                  roleLabel.trim().length < 3 ||
                  organism.trim().length < 3
                }
              >
                {t("ops.common.add")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

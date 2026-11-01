import { Link } from "react-router";
import {
  AUTHORITY_PCF_PATH,
  ORG_PCO_PATH,
} from "../../../config";
import { useAuth } from "../../../auth/AuthContext";
import { DESIGNATION_LABELS } from "../../../auth/permissions";
import { ROLE_DEFS } from "../../../auth/roles";
import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import { useOrsecPlans } from "../plan/PlanContext";
import { SITUATION_KEYS, type PlanLevel } from "../plan/orsecPlan";
import "./ops.css";

function levelForRole(role: string): PlanLevel {
  switch (role) {
    case "wali":
      return "wilaya";
    case "apc_president":
      return "commune";
    case "minister":
      return "national";
    case "site_operator":
      return "site";
    default:
      return "wilaya";
  }
}

const TITLE_KEYS: Record<string, string> = {
  TITULAIRE: "ops.assign.titulaire",
  SUPPLEANT_1: "ops.assign.suppleant1",
  SUPPLEANT_2: "ops.assign.suppleant2",
  INTERIM: "ops.assign.interim",
};

/**
 * Bandeau global : situation ORSEC, affectation scellée, désignations,
 * file hors ligne et mode dégradé. Affiché dans tous les espaces du personnel.
 */
export default function OpsBanners() {
  const { t, lang } = useI18n();
  const { session, can, designations } = useAuth();
  const { plans } = useOrsecPlans();
  const { pendingCount, syncPending, degraded, setDegraded } = useOrsecOps();

  if (!session) return null;
  const space = ROLE_DEFS[session.role].space;
  if (space === "citizen" || space === "admin") return null;

  const level = levelForRole(session.role);
  const plan = plans[level];
  const situation = SITUATION_KEYS[plan.situation];
  const canPilot = can("PILOTER_SITUATION");
  const target = canPilot
    ? AUTHORITY_PCF_PATH
    : space === "organisme"
      ? ORG_PCO_PATH
      : undefined;
  const titleLabel = TITLE_KEYS[session.assignment.titleType] ?? "ops.assign.titulaire";
  const designation =
    designations.length > 0
      ? designations
          .slice(0, 2)
          .map((fn) => DESIGNATION_LABELS[fn][lang])
          .join(" · ")
      : t("ops.banner.noDesignation");

  return (
    <div className="ops-banner" role="status" aria-live="polite">
      <span className="ops-banner__group">
        <span className="ops-banner__label">{t("ops.situation.current")}</span>
        <span
          className={`ops-banner__dot ops-banner__dot--${situation.tone}`}
          aria-hidden="true"
        />
        <span className="ops-banner__value">{t(situation.nameKey)}</span>
        {target ? (
          <Link className="ops-banner__action" to={target}>
            {t("ops.banner.transition")}
          </Link>
        ) : null}
      </span>

      <span className="ops-banner__group">
        <span className="ops-banner__label">{t("ops.banner.assignment")}</span>
        <span className="ops-banner__value">
          {t(titleLabel)} · {session.assignment.id}
        </span>
      </span>

      <span className="ops-banner__group">
        <span className="ops-banner__label">{t("ops.banner.designation")}</span>
        <span className="ops-banner__value">{designation}</span>
      </span>

      {pendingCount > 0 ? (
        <span className="ops-banner__group">
          <span className="ops-banner__value" style={{ color: "var(--color-warning)" }}>
            {t("ops.banner.offline", { count: pendingCount })}
          </span>
          <button
            type="button"
            className="ops-banner__action"
            onClick={() => syncPending()}
          >
            {t("ops.banner.sync")}
          </button>
        </span>
      ) : null}

      <span className="ops-banner__spacer" />

      <span className="ops-banner__group">
        <span className="ops-banner__label">{t("ops.banner.degraded")}</span>
        <button
          type="button"
          className="ops-banner__action"
          aria-pressed={degraded}
          title={t("ops.banner.degradedHint")}
          onClick={() => setDegraded(!degraded)}
        >
          {degraded
            ? t("ops.banner.disableDegraded")
            : t("ops.banner.enableDegraded")}
        </button>
      </span>
    </div>
  );
}

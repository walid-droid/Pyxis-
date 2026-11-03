import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { endSession } from "../../auth/session";
import AppShell, { type ShellNavItem } from "../../components/AppShell";
import {
  MODULE_ALERTS_PATH,
  MODULE_AVAILABILITY_PATH,
  MODULE_CALLS_PATH,
  MODULE_DASHBOARD_PATH,
  MODULE_HISTORY_PATH,
  MODULE_INTERVENTIONS_PATH,
  MODULE_TASKS_PATH,
  STAFF_LOGIN_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { useDb } from "../../services/useDb";
import SituationBanner from "../shared/orsec/SituationBanner";
import { moduleLabel, territoryLabel } from "../shared/v3/helpers";
import "../shared/v3/v3.css";

const OVERVIEW: ShellNavItem = {
  to: MODULE_DASHBOARD_PATH,
  labelKey: "module.nav.overview",
  end: true,
};
const ALERTS: ShellNavItem = { to: MODULE_ALERTS_PATH, labelKey: "module.nav.alerts" };
const INTERVENTIONS: ShellNavItem = {
  to: MODULE_INTERVENTIONS_PATH,
  labelKey: "module.nav.interventions",
};
const TASKS: ShellNavItem = { to: MODULE_TASKS_PATH, labelKey: "module.nav.tasks" };
const AVAILABILITY: ShellNavItem = {
  to: MODULE_AVAILABILITY_PATH,
  labelKey: "module.nav.availability",
};
const CALLS: ShellNavItem = { to: MODULE_CALLS_PATH, labelKey: "module.nav.calls" };
const HISTORY: ShellNavItem = { to: MODULE_HISTORY_PATH, labelKey: "module.nav.history" };

/** Coque de l'espace module (agent, responsable PCO, directeur PCF). */
export default function ModuleLayout() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { lang } = useI18n();
  const db = useDb();

  const navItems = useMemo<ShellNavItem[]>(() => {
    if (session?.role === "module_agent") {
      return [OVERVIEW, ALERTS, TASKS, AVAILABILITY, CALLS, HISTORY];
    }
    return [OVERVIEW, ALERTS, INTERVENTIONS, HISTORY];
  }, [session?.role]);

  const meta = session
    ? [moduleLabel(db, session.moduleId, lang), territoryLabel(db, session.territory?.id, lang)]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <AppShell
      variant="module"
      homePath={MODULE_DASHBOARD_PATH}
      storageKey="cadm-module-sidebar-collapsed"
      navItems={navItems}
      navGroupKey="module.shellGroup"
      authenticated={session !== null}
      topbarExtra={meta ? <span className="v3-topbar-meta">{meta}</span> : undefined}
      banner={<SituationBanner />}
      onSignOut={() => {
        endSession();
        navigate(STAFF_LOGIN_PATH);
      }}
    />
  );
}

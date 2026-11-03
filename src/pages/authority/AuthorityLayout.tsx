import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { roleName } from "../../auth/roles";
import { endSession } from "../../auth/session";
import AppShell, { type ShellNavItem } from "../../components/AppShell";
import {
  AUTHORITY_ALERTS_PATH,
  AUTHORITY_DASHBOARD_PATH,
  AUTHORITY_ESCALATION_PATH,
  AUTHORITY_EXERCISES_PATH,
  AUTHORITY_PLANS_PATH,
  AUTHORITY_REQUESTS_PATH,
  AUTHORITY_STAFF_PATH,
  STAFF_LOGIN_PATH,
} from "../../config";
import { useI18n } from "../../i18n";
import { runClock } from "../../services/clock";
import { useDb } from "../../services/useDb";
import SituationBanner from "../shared/orsec/SituationBanner";
import { territoryLabel } from "../shared/v3/helpers";
import "../shared/v3/v3.css";

const AUTHORITY_NAV: ShellNavItem[] = [
  { to: AUTHORITY_DASHBOARD_PATH, labelKey: "authority.nav.overview", end: true },
  { to: AUTHORITY_REQUESTS_PATH, labelKey: "authority.nav.requests" },
  { to: AUTHORITY_PLANS_PATH, labelKey: "authority.nav.plans" },
  { to: AUTHORITY_ESCALATION_PATH, labelKey: "authority.nav.escalation" },
  { to: AUTHORITY_ALERTS_PATH, labelKey: "authority.nav.alerts" },
  { to: AUTHORITY_STAFF_PATH, labelKey: "authority.nav.staff" },
  { to: AUTHORITY_EXERCISES_PATH, labelKey: "authority.nav.exercises" },
];

/** Coque de l'espace autorité (APC, wali, ministre). */
export default function AuthorityLayout() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { lang } = useI18n();
  const db = useDb();

  useEffect(() => {
    runClock();
  }, []);

  const meta = session
    ? [
        roleName(session.role, lang),
        territoryLabel(db, session.territory?.id, lang),
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <AppShell
      variant="authority"
      homePath={AUTHORITY_DASHBOARD_PATH}
      storageKey="cadm-authority-sidebar-collapsed-v3"
      navItems={AUTHORITY_NAV}
      navGroupKey="authority.shellGroup"
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

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ORSEC_MODULES,
  PEOPLE,
  initialPlans,
  recipientsFor,
  type Activation,
  type OrsecPlan,
  type PlanLevel,
  type PlanReport,
} from "./orsecPlan";
import { PlanContext, type PlanContextValue } from "./PlanContext";

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}

function timeLabel(): string {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

let reportSequence = 0;
function nextReportReference(): string {
  reportSequence += 1;
  return `RAP-${new Date().getFullYear()}-${String(reportSequence).padStart(3, "0")}`;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Record<PlanLevel, OrsecPlan>>(initialPlans);

  const update = useCallback(
    (level: PlanLevel, updater: (plan: OrsecPlan) => OrsecPlan) => {
      setPlans((current) => ({
        ...current,
        [level]: updater(current[level]),
      }));
    },
    [],
  );

  const approve = useCallback<PlanContextValue["approve"]>(
    (level, by) => {
      update(level, (plan) => {
        if (plan.status !== "draft" && plan.status !== "pending") return plan;
        const at = dateLabel();
        return {
          ...plan,
          status: "approved",
          approvedBy: by,
          approvedAt: at,
          log: [
            {
              id: nextId("log"),
              at: `${at} · ${timeLabel()}`,
              actionKey: "orsec.log.approved",
              subject: by,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const setAlert = useCallback<PlanContextValue["setAlert"]>(
    (level) => {
      update(level, (plan) => {
        if (plan.status !== "approved") return plan;
        return {
          ...plan,
          status: "alert",
          liftedAt: null,
          log: [
            {
              id: nextId("log"),
              at: timeLabel(),
              actionKey: "orsec.log.alertSet",
              subjectKey: plan.scopeKey,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const activate = useCallback<PlanContextValue["activate"]>(
    (level, payload, by) => {
      update(level, (plan) => {
        if (plan.status !== "approved" && plan.status !== "alert") return plan;
        const activation: Activation = {
          id: nextId("act"),
          at: `${dateLabel()} · ${timeLabel()}`,
          by,
          reason: payload.reason,
          incidentIds: payload.incidentIds,
          moduleIds: payload.moduleIds,
          phase: "urgence",
          pcf: level === "commune" || level === "wilaya",
          pco: level === "commune" || level === "wilaya",
          recipients: recipientsFor(level),
        };
        return {
          ...plan,
          status: "active",
          phase: "urgence",
          activation,
          liftedAt: null,
          log: [
            {
              id: nextId("log"),
              at: activation.at,
              actionKey: "orsec.log.activated",
              subjectKey: plan.scopeKey,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const setPhase = useCallback<PlanContextValue["setPhase"]>(
    (level, phase) => {
      update(level, (plan) => {
        if (plan.status !== "active" || !plan.activation) return plan;
        return {
          ...plan,
          phase,
          activation: { ...plan.activation, phase },
          log: [
            {
              id: nextId("log"),
              at: timeLabel(),
              actionKey: "orsec.log.phaseChanged",
              subjectKey: `orsec.phase.${phase}`,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const lift = useCallback<PlanContextValue["lift"]>(
    (level) => {
      update(level, (plan) => {
        if (plan.status !== "active") return plan;
        const at = dateLabel();
        const report: PlanReport = {
          id: nextId("rep"),
          reference: nextReportReference(),
          createdAt: at,
          status: "draft",
          recipientKey: recipientsFor(level)[0],
        };
        return {
          ...plan,
          status: "approved",
          phase: null,
          liftedAt: at,
          reports: [report, ...plan.reports],
          log: [
            {
              id: nextId("log"),
              at: `${at} · ${timeLabel()}`,
              actionKey: "orsec.log.lifted",
              subject: report.reference,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const designate = useCallback<PlanContextValue["designate"]>(
    (level, moduleId, personId, by) => {
      update(level, (plan) => {
        const person = PEOPLE.find((item) => item.id === personId);
        const module = ORSEC_MODULES.find((item) => item.id === moduleId);
        if (!person || !module) return plan;
        const at = dateLabel();
        return {
          ...plan,
          designations: [
            {
              id: nextId("des"),
              moduleId,
              personId: person.id,
              personName: person.name,
              orgKey: person.orgKey,
              since: at,
              by,
            },
            ...plan.designations,
          ],
          log: [
            {
              id: nextId("log"),
              at: `${at} · ${timeLabel()}`,
              actionKey: "orsec.log.designated",
              subjectKey: module.nameKey,
              subject: person.name,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const sendReport = useCallback<PlanContextValue["sendReport"]>(
    (level, reportId) => {
      update(level, (plan) => {
        const report = plan.reports.find((item) => item.id === reportId);
        if (!report || report.status === "sent") return plan;
        const at = dateLabel();
        return {
          ...plan,
          reports: plan.reports.map((item) =>
            item.id === reportId
              ? { ...item, status: "sent", sentAt: at }
              : item,
          ),
          log: [
            {
              id: nextId("log"),
              at: `${at} · ${timeLabel()}`,
              actionKey: "orsec.log.reportSent",
              subject: report.reference,
            },
            ...plan.log,
          ],
        };
      });
    },
    [update],
  );

  const value = useMemo<PlanContextValue>(
    () => ({
      plans,
      approve,
      setAlert,
      activate,
      setPhase,
      lift,
      designate,
      sendReport,
    }),
    [
      plans,
      approve,
      setAlert,
      activate,
      setPhase,
      lift,
      designate,
      sendReport,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

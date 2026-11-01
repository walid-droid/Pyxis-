import { createContext, useContext } from "react";
import type {
  ActivationReason,
  ModuleId,
  OrsecPlan,
  PlanLevel,
  PlanPhase,
  SituationCode,
} from "./orsecPlan";

export type ActivationPayload = {
  reason: ActivationReason;
  incidentIds: number[];
  moduleIds: ModuleId[];
};

export type SituationPayload = {
  by: string;
  role: string;
  assignmentId: string;
  justification: string;
  signatureHash: string;
  source?: string;
  moduleIds?: ModuleId[];
  emergency?: boolean;
};

export type PlanContextValue = {
  plans: Record<PlanLevel, OrsecPlan>;
  approve: (level: PlanLevel, by: string) => void;
  setAlert: (level: PlanLevel) => void;
  activate: (level: PlanLevel, payload: ActivationPayload, by: string) => void;
  setPhase: (level: PlanLevel, phase: PlanPhase) => void;
  setSituation: (
    level: PlanLevel,
    to: SituationCode,
    payload: SituationPayload,
  ) => void;
  closeRecovery: (level: PlanLevel, by: string) => void;
  lift: (level: PlanLevel) => void;
  designate: (
    level: PlanLevel,
    moduleId: ModuleId,
    personId: string,
    by: string,
  ) => void;
  sendReport: (level: PlanLevel, reportId: string) => void;
};

export const PlanContext = createContext<PlanContextValue | null>(null);

export function useOrsecPlans(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("useOrsecPlans must be used inside PlanProvider");
  }
  return context;
}

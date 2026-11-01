/**
 * Affectations et intérims (guide ORSEC, fiche « continuité de commandement »).
 * Chaque décision est scellée avec l'affectation active : titulaire, suppléant
 * ou intérim. Les données restent locales à la démonstration.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DesignationFn } from "../auth/permissions";
import type { TitleType } from "../auth/session";

export type AssignmentRecord = {
  id: string;
  personName: string;
  roleLabel: string;
  titleType: TitleType;
  organism: string;
  /** ISO 8601. */
  from: string;
  /** ISO 8601 ; absent = en cours. */
  to?: string;
  designation?: DesignationFn;
  note?: string;
};

type AssignmentsContextValue = {
  assignments: AssignmentRecord[];
  addAssignment: (input: Omit<AssignmentRecord, "id" | "from"> & { from?: string }) => void;
  setTitleType: (id: string, titleType: TitleType, note?: string) => void;
  closeAssignment: (id: string, note?: string) => void;
  removeAssignment: (id: string) => void;
};

const AssignmentsContext = createContext<AssignmentsContextValue | null>(null);

const STORAGE_KEY = "cadm-orsec-assignments";

const SEED: AssignmentRecord[] = [
  {
    id: "aff-wilaya",
    personName: "Wali de Béjaïa",
    roleLabel: "Autorité de wilaya",
    titleType: "TITULAIRE",
    organism: "Wilaya de Béjaïa",
    from: "2026-01-04T08:00:00.000Z",
    designation: "AUTHORITY_REPRESENTATIVE",
  },
  {
    id: "aff-pc",
    personName: "Commandant R. Amrani",
    roleLabel: "Directeur du PCO",
    titleType: "TITULAIRE",
    organism: "Protection civile · Béjaïa",
    from: "2026-01-04T08:00:00.000Z",
    designation: "PCO_DIRECTOR",
  },
  {
    id: "aff-pcf",
    personName: "Colonel A. Mansouri",
    roleLabel: "Directeur du PCF",
    titleType: "TITULAIRE",
    organism: "Protection civile · Béjaïa",
    from: "2026-01-04T08:00:00.000Z",
    designation: "PCF_DIRECTOR",
  },
  {
    id: "aff-medical",
    personName: "Dr L. Benali",
    roleLabel: "Responsable médical",
    titleType: "TITULAIRE",
    organism: "Direction de la santé",
    from: "2026-01-04T08:00:00.000Z",
    designation: "MODULE_MANAGER",
  },
  {
    id: "aff-information",
    personName: "Mme N. Cherif",
    roleLabel: "Chargée de l'information",
    titleType: "TITULAIRE",
    organism: "Cellule communication",
    from: "2026-01-04T08:00:00.000Z",
    designation: "INFORMATION_OFFICER",
  },
  {
    id: "aff-unite",
    personName: "Capitaine S. Haddad",
    roleLabel: "Chef de secteur · Akbou",
    titleType: "SUPPLEANT_1",
    organism: "Protection civile · Béjaïa",
    from: "2026-10-30T07:00:00.000Z",
    designation: "MODULE_REPRESENTATIVE",
  },
  {
    id: "aff-rehab",
    personName: "M. H. Meziane",
    roleLabel: "Chargé de la réhabilitation",
    titleType: "INTERIM",
    organism: "Direction de l'éducation",
    from: "2026-10-30T16:00:00.000Z",
    to: "2026-11-02T16:00:00.000Z",
    designation: "REHABILITATION_OFFICER",
    note: "Intérim pendant le congé du titulaire.",
  },
];

function read(): AssignmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as AssignmentRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function AssignmentsProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>(read);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
      // Stockage indisponible : la démonstration reste en mémoire.
    }
  }, [assignments]);

  const addAssignment = useCallback<AssignmentsContextValue["addAssignment"]>(
    (input) => {
      setAssignments((current) => [
        {
          ...input,
          id: `aff-${Date.now().toString(36)}`,
          from: input.from ?? new Date().toISOString(),
        },
        ...current,
      ]);
    },
    [],
  );

  const setTitleType = useCallback<AssignmentsContextValue["setTitleType"]>(
    (id, titleType, note) => {
      setAssignments((current) =>
        current.map((item) =>
          item.id === id ? { ...item, titleType, note } : item,
        ),
      );
    },
    [],
  );

  const closeAssignment = useCallback<AssignmentsContextValue["closeAssignment"]>(
    (id, note) => {
      setAssignments((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, to: new Date().toISOString(), note: note ?? item.note }
            : item,
        ),
      );
    },
    [],
  );

  const removeAssignment = useCallback((id: string) => {
    setAssignments((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<AssignmentsContextValue>(
    () => ({
      assignments,
      addAssignment,
      setTitleType,
      closeAssignment,
      removeAssignment,
    }),
    [assignments, addAssignment, setTitleType, closeAssignment, removeAssignment],
  );

  return (
    <AssignmentsContext.Provider value={value}>
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments(): AssignmentsContextValue {
  const context = useContext(AssignmentsContext);
  if (!context) {
    throw new Error("useAssignments must be used inside AssignmentsProvider");
  }
  return context;
}

export function formatAssignmentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function assignmentIsActive(
  record: AssignmentRecord,
  at: number = Date.now(),
): boolean {
  const from = Date.parse(record.from);
  const to = record.to ? Date.parse(record.to) : Number.POSITIVE_INFINITY;
  return from <= at && at < to;
}

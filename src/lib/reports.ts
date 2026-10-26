import {
  seedReports,
  type CitizenReport,
  type ReportSeverity,
  type ReportType,
} from "../mockdata/report";
import { getSession } from "./session";

// Les signalements envoyés depuis ce navigateur sont conservés localement,
// par compte, en attendant un backend d'authentification et de stockage.
const STORAGE_PREFIX = "cadm-citizen-reports";
const MAX_STORED = 50;

function storageKey(): string {
  return `${STORAGE_PREFIX}:${getSession()?.email ?? "demo"}`;
}

function isReport(value: unknown): value is CitizenReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Partial<CitizenReport>;
  return (
    typeof report.id === "string" &&
    typeof report.title === "string" &&
    typeof report.status === "string" &&
    typeof report.createdAt === "string"
  );
}

function readStored(): CitizenReport[] {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isReport) : [];
  } catch {
    return [];
  }
}

function writeStored(reports: CitizenReport[]): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(reports.slice(0, MAX_STORED)));
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

/** Signalements du compte connecté, les plus récents en premier. */
export function listReports(): CitizenReport[] {
  return [...readStored(), ...seedReports].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export type NewReportInput = {
  title: string;
  description: string;
  type: ReportType;
  severity: ReportSeverity;
  wilaya: string;
  commune: string;
  place?: string;
  latitude?: number;
  longitude?: number;
};

/** Construit un signalement à l'état « reçu » à partir du formulaire citoyen. */
export function createReport(input: NewReportInput): CitizenReport {
  const now = new Date();
  const reference = `CADM-${now.getFullYear()}-${String(now.getTime()).slice(-4)}`;

  return {
    ...input,
    id: reference,
    status: "received",
    createdAt: now.toISOString(),
    steps: [{ status: "received", at: now.toISOString() }],
    demo: false,
  };
}

/** Enregistre (ou met à jour) un signalement dans le stockage local. */
export function saveReport(report: CitizenReport): void {
  const stored = readStored().filter((item) => item.id !== report.id);
  writeStored([report, ...stored]);
}

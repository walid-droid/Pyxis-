export type ReportStatus =
  | "received"
  | "verifying"
  | "assigned"
  | "in-progress"
  | "closed";

export type ReportType =
  | "flood"
  | "fire"
  | "earthquake"
  | "accident"
  | "storm"
  | "landslide"
  | "other";

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ReportStep = {
  status: ReportStatus;
  /** Date ISO du passage à cette étape. */
  at: string;
};

export type CitizenReport = {
  /** Référence communiquée au citoyen (ex. CADM-2026-0142). */
  id: string;
  title: string;
  description: string;
  type: ReportType;
  severity: ReportSeverity;
  status: ReportStatus;
  createdAt: string;
  wilaya: string;
  commune: string;
  /** Complément d'adresse saisi par le citoyen. */
  place?: string;
  latitude?: number;
  longitude?: number;
  steps: ReportStep[];
  /** Message transmis par les équipes, affiché dans le détail. */
  teamMessage?: string;
  /** Donnée de démonstration livrée avec l'application. */
  demo?: boolean;
};

/** Ordre du suivi, commun à la liste et à la frise de détail. */
export const REPORT_STATUS_ORDER: ReportStatus[] = [
  "received",
  "verifying",
  "assigned",
  "in-progress",
  "closed",
];

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/**
 * Signalements de démonstration, rattachés au compte connecté tant que
 * l'application n'a pas de backend. Les nouveaux signalements envoyés depuis
 * le formulaire citoyen viennent s'ajouter à cette liste (localStorage).
 */
export const seedReports: CitizenReport[] = [
  {
    id: "CADM-2026-0142",
    title: "Fissures dans un bâtiment",
    description:
      "Des fissures sont apparues dans un bâtiment après la secousse de la nuit dernière.",
    type: "earthquake",
    severity: "high",
    status: "in-progress",
    createdAt: hoursAgo(52),
    wilaya: "Mila",
    commune: "Grarem",
    place: "Cité des Oliviers",
    steps: [
      { status: "received", at: hoursAgo(52) },
      { status: "verifying", at: hoursAgo(50) },
      { status: "assigned", at: hoursAgo(44) },
      { status: "in-progress", at: hoursAgo(28) },
    ],
    teamMessage:
      "Une équipe d'évaluation est sur place. Évitez le bâtiment jusqu'à la fin du contrôle.",
    demo: true,
  },
  {
    id: "CADM-2026-0138",
    title: "Fumée observée sur la colline",
    description: "Plusieurs personnes signalent de la fumée près de l'autoroute.",
    type: "fire",
    severity: "medium",
    status: "assigned",
    createdAt: hoursAgo(22),
    wilaya: "Bouira",
    commune: "Bouira",
    place: "Route de Tikjda",
    steps: [
      { status: "received", at: hoursAgo(22) },
      { status: "verifying", at: hoursAgo(21) },
      { status: "assigned", at: hoursAgo(18) },
    ],
    demo: true,
  },
  {
    id: "CADM-2026-0131",
    title: "Ligne électrique tombée",
    description: "Une ligne électrique est tombée sur la rue principale.",
    type: "storm",
    severity: "high",
    status: "verifying",
    createdAt: hoursAgo(3),
    wilaya: "Oran",
    commune: "Es Sénia",
    place: "Rue des Frères Ali",
    steps: [
      { status: "received", at: hoursAgo(3) },
      { status: "verifying", at: hoursAgo(2) },
    ],
    demo: true,
  },
  {
    id: "CADM-2026-0119",
    title: "Caniveau bouché",
    description: "Caniveaux bouchés, l'eau s'accumule sur la route.",
    type: "flood",
    severity: "low",
    status: "closed",
    createdAt: hoursAgo(150),
    wilaya: "Sétif",
    commune: "Sétif",
    place: "Quartier El Hidhab",
    steps: [
      { status: "received", at: hoursAgo(150) },
      { status: "verifying", at: hoursAgo(146) },
      { status: "assigned", at: hoursAgo(132) },
      { status: "in-progress", at: hoursAgo(96) },
      { status: "closed", at: hoursAgo(72) },
    ],
    teamMessage: "L'intervention est terminée : la chaussée a été dégagée.",
    demo: true,
  },
];

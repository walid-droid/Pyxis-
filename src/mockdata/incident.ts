export type Incident = {
  id: number;
  event: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  location: string;
  status: "Reported" | "Responding" | "Contained" | "Resolved";
  /** Ancienneté de l'incident, en minutes (données de démonstration). */
  ageMinutes?: number;
  /** Situation humaine renseignée par les équipes sur place. */
  affected?: number;
  evacuated?: number;
};

export const mockIncidents: Incident[] = [
  { id: 1, event: "Incendie de forêt", severity: "Critical", location: "Béjaïa, Gouraya", status: "Responding", ageMinutes: 130, affected: 64, evacuated: 38 },
  { id: 2, event: "Inondation", severity: "High", location: "Skikda, Azzaba", status: "Responding", ageMinutes: 93, affected: 120, evacuated: 45 },
  { id: 3, event: "Dommages sismiques", severity: "High", location: "Mila, Grarem", status: "Responding", ageMinutes: 168, affected: 35, evacuated: 12 },
  { id: 4, event: "Glissement de terrain", severity: "Medium", location: "Tizi Ouzou, RN12", status: "Contained", ageMinutes: 298, affected: 18, evacuated: 0 },
  { id: 5, event: "Fuite de gaz", severity: "High", location: "Alger, Bab Ezzouar", status: "Contained", ageMinutes: 258, affected: 42, evacuated: 30 },
  { id: 6, event: "Dégâts de tempête", severity: "Medium", location: "Jijel, Taher", status: "Reported", ageMinutes: 43, affected: 23, evacuated: 6 },
  { id: 7, event: "Effondrement de chaussée", severity: "Medium", location: "Médéa, Berrouaghia", status: "Reported", ageMinutes: 36, affected: 12, evacuated: 0 },
  { id: 8, event: "Canicule", severity: "Low", location: "Biskra", status: "Reported", ageMinutes: 398, affected: 180, evacuated: 0 },
  { id: 9, event: "Effondrement de bâtiment", severity: "Critical", location: "Oran, Es Sénia", status: "Responding", ageMinutes: 143, affected: 46, evacuated: 27 },
  { id: 10, event: "Blocage par la neige", severity: "Low", location: "Batna, Chelia", status: "Resolved", ageMinutes: 600, affected: 0, evacuated: 0 },
  // Signalement citoyen accepté à Skikda (cf. fil d'événements).
  { id: 24, event: "Risque de débordement de barrage", severity: "High", location: "Skikda", status: "Reported", ageMinutes: 17, affected: 95, evacuated: 0 },
];

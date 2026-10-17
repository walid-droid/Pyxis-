export type Incident = {
  id: number;
  event: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  location: string;
  status: "Reported" | "Responding" | "Contained" | "Resolved";
};

export const mockIncidents: Incident[] = [
  { id: 1, event: "Incendie de forêt", severity: "Critical", location: "Béjaïa, Gouraya", status: "Responding" },
  { id: 2, event: "Inondation", severity: "High", location: "Skikda, Azzaba", status: "Responding" },
  { id: 3, event: "Dommages sismiques", severity: "High", location: "Mila, Grarem", status: "Responding" },
  { id: 4, event: "Glissement de terrain", severity: "Medium", location: "Tizi Ouzou, RN12", status: "Contained" },
  { id: 5, event: "Fuite de gaz", severity: "High", location: "Alger, Bab Ezzouar", status: "Contained" },
  { id: 6, event: "Dégâts de tempête", severity: "Medium", location: "Jijel, Taher", status: "Reported" },
  { id: 7, event: "Effondrement de chaussée", severity: "Medium", location: "Médéa, Berrouaghia", status: "Reported" },
  { id: 8, event: "Canicule", severity: "Low", location: "Biskra", status: "Reported" },
  { id: 9, event: "Effondrement de bâtiment", severity: "Critical", location: "Oran, Es Sénia", status: "Responding" },
  { id: 10, event: "Blocage par la neige", severity: "Low", location: "Batna, Chelia", status: "Resolved" },
];

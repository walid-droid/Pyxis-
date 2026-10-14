export type Incident = {
  id: number;
  event: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  location: string;
  status: "Reported" | "Responding" | "Contained" | "Resolved";
};

export const mockIncidents: Incident[] = [
  { id: 1, event: "Wildfire", severity: "Critical", location: "Béjaïa, Gouraya", status: "Responding" },
  { id: 2, event: "Flooding", severity: "High", location: "Skikda, Azzaba", status: "Responding" },
  { id: 3, event: "Earthquake damage", severity: "High", location: "Mila, Grarem", status: "Responding" },
  { id: 4, event: "Landslide", severity: "Medium", location: "Tizi Ouzou, RN12", status: "Contained" },
  { id: 5, event: "Gas leak", severity: "High", location: "Alger, Bab Ezzouar", status: "Contained" },
  { id: 6, event: "Storm damage", severity: "Medium", location: "Jijel, Taher", status: "Reported" },
  { id: 7, event: "Road collapse", severity: "Medium", location: "Médéa, Berrouaghia", status: "Reported" },
  { id: 8, event: "Heatwave", severity: "Low", location: "Biskra", status: "Reported" },
  { id: 9, event: "Building collapse", severity: "Critical", location: "Oran, Es Sénia", status: "Responding" },
  { id: 10, event: "Snow blockage", severity: "Low", location: "Batna, Chelia", status: "Resolved" },
];
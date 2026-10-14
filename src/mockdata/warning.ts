export type Severity = "Low" | "Medium" | "High" | "Critical";

export type Warning = {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  verification: "verified" | "unverified";
  location: string;
  issuedAt: string;
  source: string;
};

export const mockWarnings: Warning[] = [
  // ---------- verified ----------
  { id: 1, title: "Heavy rainfall", description: "Heavy rainfall may cause flooding in low-lying areas.", severity: "High", verification: "verified", location: "Béjaïa", issuedAt: "10 min ago", source: "Office National de la Météorologie" },
  { id: 2, title: "Forest fire", description: "A wildfire is spreading near the Gouraya hills. Avoid the area.", severity: "Critical", verification: "verified", location: "Béjaïa", issuedAt: "25 min ago", source: "Protection Civile" },
  { id: 3, title: "Earthquake tremor", description: "Magnitude 4.6 tremor recorded. Stay away from damaged buildings.", severity: "High", verification: "verified", location: "Mila", issuedAt: "1 h ago", source: "CRAAG" },
  { id: 4, title: "Road closure", description: "RN12 closed after a landslide. Use the alternative route.", severity: "Medium", verification: "verified", location: "Tizi Ouzou", issuedAt: "1 h ago", source: "Direction des Travaux Publics" },
  { id: 5, title: "Storm warning", description: "Strong winds up to 90 km/h expected along the coast tonight.", severity: "High", verification: "verified", location: "Jijel", issuedAt: "2 h ago", source: "Office National de la Météorologie" },
  { id: 6, title: "Heatwave", description: "Temperatures above 44°C. Drink water and avoid outdoor work.", severity: "Medium", verification: "verified", location: "Biskra", issuedAt: "3 h ago", source: "Office National de la Météorologie" },
  { id: 7, title: "Water outage", description: "Water supply cut in several districts after a pipe failure.", severity: "Low", verification: "verified", location: "Sétif", issuedAt: "4 h ago", source: "Algérienne des Eaux" },
  { id: 8, title: "Dam overflow risk", description: "Water level near maximum. Residents downstream should be ready to move.", severity: "Critical", verification: "verified", location: "Skikda", issuedAt: "5 h ago", source: "Agence Nationale des Barrages" },
  { id: 9, title: "Snow and ice", description: "Heavy snow blocking mountain roads above 900 m.", severity: "Medium", verification: "verified", location: "Batna", issuedAt: "6 h ago", source: "Gendarmerie Nationale" },
  { id: 10, title: "Gas leak", description: "Gas leak reported in a residential block. Area evacuated.", severity: "High", verification: "verified", location: "Alger", issuedAt: "7 h ago", source: "Protection Civile" },

  // ---------- unverified ----------
  { id: 11, title: "Possible flooding", description: "Residents have reported rising water levels.", severity: "Medium", verification: "unverified", location: "Béjaïa", issuedAt: "5 min ago", source: "Citizen report" },
  { id: 12, title: "Smoke seen on hillside", description: "Several people report smoke near the highway.", severity: "Medium", verification: "unverified", location: "Bouira", issuedAt: "12 min ago", source: "Citizen report" },
  { id: 13, title: "Building cracks", description: "Cracks appeared in a building after last night's tremor.", severity: "High", verification: "unverified", location: "Mila", issuedAt: "30 min ago", source: "Citizen report" },
  { id: 14, title: "Fallen power line", description: "A power line is down on the main street.", severity: "High", verification: "unverified", location: "Oran", issuedAt: "40 min ago", source: "Citizen report" },
  { id: 15, title: "Blocked drain", description: "Drains blocked, water is gathering on the road.", severity: "Low", verification: "unverified", location: "Constantine", issuedAt: "50 min ago", source: "Citizen report" },
  { id: 16, title: "Strange smell", description: "Chemical-like smell near the industrial zone.", severity: "Medium", verification: "unverified", location: "Annaba", issuedAt: "1 h ago", source: "Citizen report" },
  { id: 17, title: "Landslide on road", description: "Rocks on the road after the rain, one lane blocked.", severity: "Medium", verification: "unverified", location: "Kherrata", issuedAt: "2 h ago", source: "Citizen report" },
  { id: 18, title: "Missing hiker", description: "A hiker has not returned from the mountain trail.", severity: "High", verification: "unverified", location: "Tikjda", issuedAt: "3 h ago", source: "Citizen report" },
];
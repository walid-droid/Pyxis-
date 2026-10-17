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
  { id: 1, title: "Fortes pluies", description: "De fortes pluies peuvent provoquer des inondations dans les zones basses.", severity: "High", verification: "verified", location: "Béjaïa", issuedAt: "il y a 10 min", source: "Office National de la Météorologie" },
  { id: 2, title: "Feu de forêt", description: "Un incendie se propage près des collines de Gouraya. Évitez la zone.", severity: "Critical", verification: "verified", location: "Béjaïa", issuedAt: "il y a 25 min", source: "Protection Civile" },
  { id: 3, title: "Secousse sismique", description: "Secousse de magnitude 4,6 enregistrée. Tenez-vous à l'écart des bâtiments endommagés.", severity: "High", verification: "verified", location: "Mila", issuedAt: "il y a 1 h", source: "CRAAG" },
  { id: 4, title: "Route fermée", description: "RN12 fermée après un glissement de terrain. Empruntez l'itinéraire alternatif.", severity: "Medium", verification: "verified", location: "Tizi Ouzou", issuedAt: "il y a 1 h", source: "Direction des Travaux Publics" },
  { id: 5, title: "Alerte tempête", description: "Des vents violents jusqu'à 90 km/h sont attendus sur la côte cette nuit.", severity: "High", verification: "verified", location: "Jijel", issuedAt: "il y a 2 h", source: "Office National de la Météorologie" },
  { id: 6, title: "Canicule", description: "Températures supérieures à 44 °C. Buvez de l'eau et évitez le travail en extérieur.", severity: "Medium", verification: "verified", location: "Biskra", issuedAt: "il y a 3 h", source: "Office National de la Météorologie" },
  { id: 7, title: "Coupure d'eau", description: "Distribution d'eau interrompue dans plusieurs quartiers après une rupture de canalisation.", severity: "Low", verification: "verified", location: "Sétif", issuedAt: "il y a 4 h", source: "Algérienne des Eaux" },
  { id: 8, title: "Risque de débordement de barrage", description: "Le niveau d'eau approche du maximum. Les habitants en aval doivent se tenir prêts à évacuer.", severity: "Critical", verification: "verified", location: "Skikda", issuedAt: "il y a 5 h", source: "Agence Nationale des Barrages" },
  { id: 9, title: "Neige et verglas", description: "Fortes chutes de neige bloquant les routes de montagne au-dessus de 900 m.", severity: "Medium", verification: "verified", location: "Batna", issuedAt: "il y a 6 h", source: "Gendarmerie Nationale" },
  { id: 10, title: "Fuite de gaz", description: "Fuite de gaz signalée dans un immeuble résidentiel. Zone évacuée.", severity: "High", verification: "verified", location: "Alger", issuedAt: "il y a 7 h", source: "Protection Civile" },

  // ---------- unverified ----------
  { id: 11, title: "Risque d'inondation", description: "Des habitants signalent une montée des eaux.", severity: "Medium", verification: "unverified", location: "Béjaïa", issuedAt: "il y a 5 min", source: "Signalement citoyen" },
  { id: 12, title: "Fumée observée sur la colline", description: "Plusieurs personnes signalent de la fumée près de l'autoroute.", severity: "Medium", verification: "unverified", location: "Bouira", issuedAt: "il y a 12 min", source: "Signalement citoyen" },
  { id: 13, title: "Fissures dans un bâtiment", description: "Des fissures sont apparues dans un bâtiment après la secousse de la nuit dernière.", severity: "High", verification: "unverified", location: "Mila", issuedAt: "il y a 30 min", source: "Signalement citoyen" },
  { id: 14, title: "Ligne électrique tombée", description: "Une ligne électrique est tombée sur la rue principale.", severity: "High", verification: "unverified", location: "Oran", issuedAt: "il y a 40 min", source: "Signalement citoyen" },
  { id: 15, title: "Caniveau bouché", description: "Caniveaux bouchés, l'eau s'accumule sur la route.", severity: "Low", verification: "unverified", location: "Constantine", issuedAt: "il y a 50 min", source: "Signalement citoyen" },
  { id: 16, title: "Odeur suspecte", description: "Odeur chimique près de la zone industrielle.", severity: "Medium", verification: "unverified", location: "Annaba", issuedAt: "il y a 1 h", source: "Signalement citoyen" },
  { id: 17, title: "Glissement de terrain sur la route", description: "Des rochers sur la route après la pluie, une voie bloquée.", severity: "Medium", verification: "unverified", location: "Kherrata", issuedAt: "il y a 2 h", source: "Signalement citoyen" },
  { id: 18, title: "Randonneur disparu", description: "Un randonneur n'est pas revenu du sentier de montagne.", severity: "High", verification: "unverified", location: "Tikjda", issuedAt: "il y a 3 h", source: "Signalement citoyen" },
];

export type Team = {
  id: number;
  name: string;
  type: "Fire" | "Medical" | "Rescue" | "Police" | "Logistics";
  members: number;
  location: string;
  status: "Deployed" | "En route" | "Standby";
  /** Temps d'arrivée estimé, uniquement pour les unités en route. */
  etaMinutes?: number;
  /** Canal de contact opérationnel de l'unité. */
  contact?: string;
};

export const mockTeams: Team[] = [
  { id: 1, name: "Unité incendie Alpha", type: "Fire", members: 14, location: "Béjaïa, Gouraya", status: "Deployed", contact: "06 61 24 18 02" },
  { id: 2, name: "Unité incendie Bravo", type: "Fire", members: 12, location: "Béjaïa, Aiguades", status: "En route", etaMinutes: 12, contact: "06 61 24 18 14" },
  { id: 3, name: "Protection civile 07", type: "Rescue", members: 20, location: "Mila, Grarem", status: "Deployed", contact: "06 62 07 41 33" },
  { id: 4, name: "Équipe médicale 03", type: "Medical", members: 8, location: "Skikda", status: "Deployed", contact: "06 63 12 09 87" },
  { id: 5, name: "Sauvetage aquatique 02", type: "Rescue", members: 10, location: "Azzaba", status: "En route", etaMinutes: 20, contact: "06 63 12 09 55" },
  { id: 6, name: "Unité de police routière", type: "Police", members: 6, location: "Tizi Ouzou, RN12", status: "Deployed", contact: "06 64 31 20 11" },
  { id: 7, name: "Convoi de ravitaillement 01", type: "Logistics", members: 9, location: "Alger", status: "Standby", contact: "06 65 40 12 08" },
  { id: 8, name: "Équipe médicale 05", type: "Medical", members: 7, location: "Oran", status: "Standby", contact: "06 65 40 12 19" },
];

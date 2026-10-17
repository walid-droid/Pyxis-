export type Team = {
  id: number;
  name: string;
  type: "Fire" | "Medical" | "Rescue" | "Police" | "Logistics";
  members: number;
  location: string;
  status: "Deployed" | "En route" | "Standby";
};

export const mockTeams: Team[] = [
  { id: 1, name: "Unité incendie Alpha", type: "Fire", members: 14, location: "Béjaïa, Gouraya", status: "Deployed" },
  { id: 2, name: "Unité incendie Bravo", type: "Fire", members: 12, location: "Béjaïa, Aiguades", status: "En route" },
  { id: 3, name: "Protection civile 07", type: "Rescue", members: 20, location: "Mila, Grarem", status: "Deployed" },
  { id: 4, name: "Équipe médicale 03", type: "Medical", members: 8, location: "Skikda", status: "Deployed" },
  { id: 5, name: "Sauvetage aquatique 02", type: "Rescue", members: 10, location: "Azzaba", status: "En route" },
  { id: 6, name: "Unité de police routière", type: "Police", members: 6, location: "Tizi Ouzou, RN12", status: "Deployed" },
  { id: 7, name: "Convoi de ravitaillement 01", type: "Logistics", members: 9, location: "Alger", status: "Standby" },
  { id: 8, name: "Équipe médicale 05", type: "Medical", members: 7, location: "Oran", status: "Standby" },
];

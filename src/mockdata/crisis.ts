export type Crisis = {
  id: number;
  event: string;
  location: string;
  status: "Active" | "Escalating" | "Stabilising" | "Recovery";
};

export const mockCrisis: Crisis[] = [
  { id: 1, event: "Northern forest fire season", location: "Béjaïa, Jijel, Tizi Ouzou", status: "Escalating" },
  { id: 2, event: "Seasonal flooding", location: "Skikda, Annaba, El Tarf", status: "Active" },
  { id: 3, event: "Post-earthquake recovery", location: "Mila", status: "Recovery" },
  { id: 4, event: "Heatwave and drought", location: "Biskra, Ouargla, El Oued", status: "Active" },
  { id: 5, event: "Dam water level alert", location: "Skikda", status: "Stabilising" },
  { id: 6, event: "Landslide risk on mountain roads", location: "Tizi Ouzou, Bouira", status: "Active" },
{ id: 7, event: "Power grid disruption", location: "Oran, Mostaganem", status: "Stabilising" },
{ id: 8, event: "Coastal storm surge", location: "Jijel, Béjaïa", status: "Escalating" },
{ id: 9, event: "Crop damage and drought", location: "Adrar, Tamanrasset", status: "Recovery" },
];
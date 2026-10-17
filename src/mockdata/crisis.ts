export type Crisis = {
  id: number;
  event: string;
  location: string;
  status: "Active" | "Escalating" | "Stabilising" | "Recovery";
};

export const mockCrisis: Crisis[] = [
  { id: 1, event: "Saison des feux de forêt dans le nord", location: "Béjaïa, Jijel, Tizi Ouzou", status: "Escalating" },
  { id: 2, event: "Inondations saisonnières", location: "Skikda, Annaba, El Tarf", status: "Active" },
  { id: 3, event: "Reconstruction post-séisme", location: "Mila", status: "Recovery" },
  { id: 4, event: "Canicule et sécheresse", location: "Biskra, Ouargla, El Oued", status: "Active" },
  { id: 5, event: "Alerte niveau d'eau des barrages", location: "Skikda", status: "Stabilising" },
  { id: 6, event: "Risque de glissement de terrain sur les routes de montagne", location: "Tizi Ouzou, Bouira", status: "Active" },
  { id: 7, event: "Perturbation du réseau électrique", location: "Oran, Mostaganem", status: "Stabilising" },
  { id: 8, event: "Onde de tempête côtière", location: "Jijel, Béjaïa", status: "Escalating" },
  { id: 9, event: "Dommages aux cultures et sécheresse", location: "Adrar, Tamanrasset", status: "Recovery" },
];

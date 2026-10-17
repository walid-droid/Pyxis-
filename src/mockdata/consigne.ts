export type ConsigneVariant =
  | "seismic"
  | "fire"
  | "flood"
  | "gas"
  | "storm"
  | "heat"
  | "road";

export type Consigne = {
  id: number;
  risk: string;
  intro: string;
  steps: string[];
  variant: ConsigneVariant;
};

export const mockConsignes: Consigne[] = [
  {
    id: 1,
    risk: "Séisme",
    intro: "Un tremblement de terre survient sans prévenir. Voici les bons réflexes.",
    variant: "seismic",
    steps: [
      "Pendant la secousse, abritez-vous sous une table solide et protégez votre tête.",
      "Éloignez-vous des fenêtres et des objets suspendus.",
      "N'utilisez pas l'ascenseur, empruntez les escaliers après la secousse.",
      "Une fois dehors, écartez-vous des bâtiments et des lignes électriques.",
      "Coupez le gaz et l'électricité si vous suspectez une fuite.",
    ],
  },
  {
    id: 2,
    risk: "Incendie",
    intro: "Un incendie peut se propager en quelques minutes. Agissez vite et calmement.",
    variant: "fire",
    steps: [
      "Déclenchez l'alarme et appelez le 14 dès que possible.",
      "Fermez les portes derrière vous pour ralentir la propagation du feu.",
      "Restez près du sol, là où l'air est plus respirable.",
      "N'utilisez jamais l'ascenseur.",
      "Si vos vêtements prennent feu, arrêtez-vous, couchez-vous et roulez.",
    ],
  },
  {
    id: 3,
    risk: "Inondation",
    intro: "L'eau monte rapidement : ne sous-estimez jamais la force du courant.",
    variant: "flood",
    steps: [
      "Ne vous engagez jamais sur une route inondée, à pied ou en voiture.",
      "Montez vers les étages supérieurs ou un point haut.",
      "Coupez l'électricité si l'eau menace votre logement et que c'est sécurisé.",
      "N'approchez pas des lignes électriques tombées.",
      "Attendez l'autorisation des autorités avant de rentrer chez vous.",
    ],
  },
  {
    id: 4,
    risk: "Fuite de gaz",
    intro: "Toute étincelle peut provoquer une explosion. Ne prenez aucun risque.",
    variant: "gas",
    steps: [
      "N'allumez ni ne coupez aucun interrupteur, et ne fumez pas.",
      "Ouvrez les fenêtres et évacuez calmement le bâtiment.",
      "Fermez le robinet de gaz si vous le pouvez sans risque.",
      "Appelez Sonelgaz (33 03) depuis l'extérieur.",
      "Ne rentrez pas tant que la zone n'est pas déclarée sûre.",
    ],
  },
  {
    id: 5,
    risk: "Tempête et vents violents",
    intro: "Les vents violents peuvent arracher des objets et faire tomber des lignes.",
    variant: "storm",
    steps: [
      "Restez à l'intérieur et éloignez-vous des fenêtres.",
      "Rangez ou fixez les objets pouvant s'envoler.",
      "Ne vous abritez pas sous les arbres ni près des lignes électriques.",
      "Évitez les déplacements jusqu'à la fin de l'alerte.",
    ],
  },
  {
    id: 6,
    risk: "Canicule",
    intro: "La chaleur extrême est dangereuse, surtout pour les personnes fragiles.",
    variant: "heat",
    steps: [
      "Buvez de l'eau régulièrement, sans attendre la soif.",
      "Restez au frais aux heures les plus chaudes (11 h – 17 h).",
      "Ne laissez jamais personne dans un véhicule stationné.",
      "Protégez les personnes âgées, les enfants et les personnes malades.",
    ],
  },
  {
    id: 7,
    risk: "Accident de la route",
    intro: "Protégez la zone avant tout, puis alertez les secours.",
    variant: "road",
    steps: [
      "Sécurisez la zone et allumez vos feux de détresse.",
      "Appelez le 14 ou le 17 en indiquant le lieu précis.",
      "Ne déplacez pas un blessé, sauf en cas de danger immédiat.",
      "Portez assistance sans vous mettre vous-même en danger.",
    ],
  },
];

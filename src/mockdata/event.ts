export type EventStatus = "Upcoming" | "Ongoing" | "Ended";

export type EventItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  wilaya: string;
  commune: string;
  location: string;
  organizer: string;
  status: EventStatus;
};

export const mockEvents: EventItem[] = [
  {
    id: 1,
    title: "Campagne de sensibilisation aux risques sismiques",
    description: "Rencontre ouverte au public sur les bons réflexes avant, pendant et après un séisme.",
    category: "Sensibilisation",
    date: "12 juin 2026",
    time: "09:00",
    wilaya: "Alger",
    commune: "Bab El Oued",
    location: "Maison de la culture",
    organizer: "Protection Civile",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Exercice de simulation d'évacuation",
    description: "Entraînement grandeur nature à l'évacuation d'un quartier en zone inondable.",
    category: "Exercice",
    date: "18 juin 2026",
    time: "08:30",
    wilaya: "Béjaïa",
    commune: "Gouraya",
    location: "Place centrale",
    organizer: "Protection Civile",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Formation aux premiers secours",
    description: "Atelier pratique gratuit pour apprendre les gestes qui sauvent.",
    category: "Formation",
    date: "22 juin 2026",
    time: "14:00",
    wilaya: "Sétif",
    commune: "Sétif",
    location: "Centre culturel",
    organizer: "Croissant-Rouge Algérien",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Collecte de dons pour les sinistrés",
    description: "Collecte de vivres, couvertures et produits de première nécessité.",
    category: "Collecte",
    date: "10 juin 2026",
    time: "10:00",
    wilaya: "Skikda",
    commune: "Azzaba",
    location: "Salle polyvalente",
    organizer: "Comité de quartier",
    status: "Ongoing",
  },
  {
    id: 5,
    title: "Journée de nettoyage des plages",
    description: "Action citoyenne de nettoyage et de sensibilisation à l'environnement.",
    category: "Communautaire",
    date: "5 juin 2026",
    time: "07:30",
    wilaya: "Jijel",
    commune: "Taher",
    location: "Plage principale",
    organizer: "Association locale",
    status: "Ended",
  },
  {
    id: 6,
    title: "Atelier de préparation aux inondations",
    description: "Conseils pratiques pour protéger son logement et préparer un kit d'urgence.",
    category: "Atelier",
    date: "25 juin 2026",
    time: "16:00",
    wilaya: "Annaba",
    commune: "El Bouni",
    location: "Centre de proximité",
    organizer: "Protection Civile",
    status: "Upcoming",
  },
  {
    id: 7,
    title: "Conférence sur la gestion de crise",
    description: "Échanges entre experts, élus et citoyens sur la coordination des secours.",
    category: "Conférence",
    date: "28 juin 2026",
    time: "09:30",
    wilaya: "Oran",
    commune: "Es Sénia",
    location: "Université d'Oran",
    organizer: "Direction locale",
    status: "Upcoming",
  },
  {
    id: 8,
    title: "Campagne de vaccination de proximité",
    description: "Vaccination gratuite et consultation médicale pour les habitants.",
    category: "Santé",
    date: "2 juin 2026",
    time: "08:00",
    wilaya: "Constantine",
    commune: "Constantine",
    location: "Polyclinique",
    organizer: "Direction de la Santé",
    status: "Ended",
  },
];

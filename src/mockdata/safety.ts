import type { Coords } from "./locations";

export type SafeZone = {
  id: string;
  name: string;
  center: Coords;
  /** Radius in meters. */
  radius: number;
  note: string;
};

export type Shelter = {
  id: string;
  name: string;
  position: Coords;
  /** Capacity in persons. */
  capacity: number;
};

export type RescuePost = {
  id: string;
  name: string;
  position: Coords;
  kind: "Hôpital" | "Protection Civile" | "Police";
};

export type EvacRoute = {
  id: string;
  name: string;
  status: "clear" | "partial";
  destination: string;
  path: Coords[];
};

export type SafetyData = {
  zones: SafeZone[];
  shelters: Shelter[];
  posts: RescuePost[];
  routes: EvacRoute[];
};

const METERS_PER_DEGREE = 111_320;

/** FNV-1a — turns the item id into a stable numeric seed. */
function hashSeed(seed: string): number {
  let hash = 2_166_136_261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG (mulberry32) so a given alert always gets the same layout. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)];
}

/** Moves a point by `distance` meters along a compass bearing. */
function offsetCoords(center: Coords, bearingDeg: number, distanceM: number): Coords {
  const rad = (bearingDeg * Math.PI) / 180;
  const deltaLat = (distanceM * Math.cos(rad)) / METERS_PER_DEGREE;
  const deltaLng =
    (distanceM * Math.sin(rad)) /
    (METERS_PER_DEGREE * Math.cos((center[0] * Math.PI) / 180));
  return [center[0] + deltaLat, center[1] + deltaLng];
}

/** Road-like path between two points with a soft bend away from the straight line. */
function buildRoutePath(
  rng: () => number,
  start: Coords,
  end: Coords,
  bendM: number,
): Coords[] {
  const steps = 4;
  const deltaLat = end[0] - start[0];
  const deltaLng = end[1] - start[1];
  const length = Math.hypot(deltaLat, deltaLng) || 1;
  const normalLat = -deltaLng / length;
  const normalLng = deltaLat / length;

  const points: Coords[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const lat = start[0] + deltaLat * t;
    const lng = start[1] + deltaLng * t;

    if (i === 0 || i === steps) {
      points.push([lat, lng]);
      continue;
    }

    const sway = Math.sin(t * Math.PI) * (rng() - 0.5) * 2 * bendM;
    const dLat = (normalLat * sway) / METERS_PER_DEGREE;
    const dLng =
      (normalLng * sway) /
      (METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180));
    points.push([lat + dLat, lng + dLng]);
  }

  return points;
}

const SHELTER_NAMES = [
  "Salle omnisports",
  "Groupe scolaire Ibn Sina",
  "Maison de jeunes El Amel",
  "Centre culturel communal",
  "Complexe sportif de proximité",
  "École primaire El Feth",
  "Centre de formation professionnelle",
] as const;

const ZONE_NAMES = [
  "Place des Martyrs",
  "Jardin public central",
  "Esplanade du stade",
  "Terrain de proximité",
  "Parc de la cité",
] as const;

const ZONE_NOTES = [
  "Éloignée des bâtiments endommagés",
  "Zone dégagée, point de rassemblement",
  "Terrain ouvert à l'écart des routes",
] as const;

const HOSPITAL_NAMES = [
  "Hôpital de wilaya",
  "Polyclinique centrale",
  "Clinique El Amel",
] as const;

const SAFETY_POST_NAMES = {
  fire: [
    "Protection Civile — unité locale",
    "Poste avancé de la Protection Civile",
    "Caserne des sapeurs-pompiers",
  ],
  police: [
    "Sûreté de wilaya",
    "Poste de police central",
    "Brigade de gendarmerie",
  ],
} as const;

/**
 * Builds the demo safety infrastructure (safe zones, shelters, rescue posts
 * and evacuation routes) laid out around an incident location.
 * Deterministic: the same `seed` always produces the same layout.
 */
export function generateSafetyData(center: Coords, seed: string): SafetyData {
  const rng = mulberry32(hashSeed(seed));

  const baseBearing = rng() * 360;

  const shelterBase = Math.floor(rng() * SHELTER_NAMES.length);
  const shelters: Shelter[] = [0, 1, 2].map((i) => {
    const bearing = baseBearing + i * 105 + rng() * 30;
    const distance = 550 + rng() * 700;
    return {
      id: `shelter-${i}`,
      name: SHELTER_NAMES[(shelterBase + i * 3) % SHELTER_NAMES.length],
      position: offsetCoords(center, bearing, distance),
      capacity: Math.round((90 + rng() * 360) / 10) * 10,
    };
  });

  const zoneBase = Math.floor(rng() * ZONE_NAMES.length);
  const zoneCount = rng() > 0.45 ? 3 : 2;
  const zones: SafeZone[] = Array.from({ length: zoneCount }, (_, i) => {
    const bearing = baseBearing + 50 + i * (360 / zoneCount) + rng() * 40;
    const distance = 600 + rng() * 800;
    return {
      id: `zone-${i}`,
      name: ZONE_NAMES[(zoneBase + i * 2) % ZONE_NAMES.length],
      center: offsetCoords(center, bearing, distance),
      radius: 170 + rng() * 260,
      note: pick(rng, ZONE_NOTES),
    };
  });

  const postBearing = rng() * 360;
  const safetyBranch = rng() > 0.5 ? "fire" : "police";
  const posts: RescuePost[] = [
    {
      id: "post-0",
      name: pick(rng, HOSPITAL_NAMES),
      kind: "Hôpital",
      position: offsetCoords(center, postBearing, 900 + rng() * 700),
    },
    {
      id: "post-1",
      name: pick(rng, SAFETY_POST_NAMES[safetyBranch]),
      kind: safetyBranch === "fire" ? "Protection Civile" : "Police",
      position: offsetCoords(center, postBearing + 170 + rng() * 40, 800 + rng() * 800),
    },
  ];

  const routes: EvacRoute[] = [
    {
      id: "route-0",
      name: "Itinéraire principal",
      status: "clear",
      destination: shelters[0].name,
      path: buildRoutePath(rng, center, shelters[0].position, 180),
    },
    {
      id: "route-1",
      name: "Itinéraire alternatif",
      status: "partial",
      destination: shelters[1].name,
      path: buildRoutePath(rng, center, shelters[1].position, 260),
    },
  ];

  return { zones, shelters, posts, routes };
}

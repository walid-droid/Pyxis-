export type Coords = [number, number];

/**
 * Approximate coordinates for the locations used across the mock data.
 * Keys can be provinces ("Skikda") or more specific spots ("Azzaba").
 */
const LOCATION_COORDS: Record<string, Coords> = {
  // Provinces / cities
  "Adrar": [27.8743, -0.2939],
  "Alger": [36.7538, 3.0588],
  "Annaba": [36.9, 7.7667],
  "Batna": [35.5559, 6.1741],
  "Béjaïa": [36.7509, 5.0567],
  "Biskra": [34.8504, 5.7281],
  "Bouira": [36.3743, 3.9],
  "Constantine": [36.365, 6.6147],
  "El Oued": [33.3683, 6.8674],
  "El Tarf": [36.7672, 8.3138],
  "Jijel": [36.8206, 5.7666],
  "Médéa": [36.2642, 2.7539],
  "Mila": [36.4503, 6.2644],
  "Mostaganem": [35.9315, 0.0892],
  "Oran": [35.6971, -0.6308],
  "Ouargla": [31.9494, 5.3253],
  "Sétif": [36.1911, 5.4137],
  "Skikda": [36.8665, 6.9094],
  "Tamanrasset": [22.785, 5.5228],
  "Tizi Ouzou": [36.7169, 4.0497],

  // Districts / landmarks
  "Azzaba": [36.7394, 7.1072],
  "Bab Ezzouar": [36.7167, 3.1833],
  "Berrouaghia": [36.1375, 2.9142],
  "Chelia": [35.3167, 6.6833],
  "Es Sénia": [35.6483, -0.6236],
  "Gouraya": [36.7756, 5.0845],
  "Grarem": [36.5167, 6.3333],
  "Kherrata": [36.4917, 5.2833],
  "RN12": [36.65, 4.5],
  "Taher": [36.7717, 5.8981],
  "Tikjda": [36.45, 4.15],
};

/** Sétif — used when a location cannot be resolved. */
const FALLBACK_COORDS: Coords = [36.1911, 5.4137];

/**
 * Resolves a free-text location (e.g. "Skikda, Azzaba") into coordinates.
 * The most specific part is preferred, so districts win over provinces.
 */
export function resolveCoords(location: string): Coords {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of [...parts].reverse()) {
    if (LOCATION_COORDS[part]) {
      return LOCATION_COORDS[part];
    }
  }

  return FALLBACK_COORDS;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two coordinates, in kilometers. */
export function distanceKm(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

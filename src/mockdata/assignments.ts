/**
 * Affectations initiales de la démonstration : équipe → incident.
 * Elles sont partagées par le tableau de bord et l'écran Ressources.
 */
export const INITIAL_ASSIGNMENTS: Readonly<Record<number, number>> = {
  1: 1,
  2: 1,
  3: 3,
  4: 2,
  5: 2,
  6: 4,
};

/** Nombre d'équipes rattachées à un incident. */
export function countAssignedTeams(incidentId: number): number {
  return Object.values(INITIAL_ASSIGNMENTS).filter(
    (assignedIncident) => assignedIncident === incidentId,
  ).length;
}

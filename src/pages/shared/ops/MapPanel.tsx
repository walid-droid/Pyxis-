import { useI18n } from "../../../i18n";
import { useOrsecOps } from "../../../lib/orsecOps";
import CrisisMap, { type MapPin } from "../crisis/CrisisMap";
import "./ops.css";

const INCIDENT_COORDS: Record<string, [number, number]> = {
  "inc-flood": [36.45, 4.53],
  "inc-fire": [36.77, 5.08],
  "inc-gas": [36.75, 5.06],
};

const SECTOR_COORDS: Record<string, [number, number]> = {
  "sector-central": [36.751, 5.057],
  "sector-akbou": [36.45, 4.53],
  "sector-gouraya": [36.77, 5.08],
};

const SHELTERS: { id: string; name: string; position: [number, number] }[] = [
  { id: "sh-1", name: "Centre d'accueil · Akbou", position: [36.43, 4.55] },
  { id: "sh-2", name: "Salle omnisports · Béjaïa", position: [36.76, 5.05] },
  { id: "sh-3", name: "École · Oued Ghir", position: [36.72, 5.02] },
];

export default function MapPanel() {
  const { t, lang } = useI18n();
  const { teams, incidents, hazmat, shelters, requisitions } = useOrsecOps();

  const pins: MapPin[] = [
    ...incidents.map((incident) => ({
      id: incident.id,
      position: INCIDENT_COORDS[incident.id] ?? [36.75, 5.06],
      title: incident.name[lang],
      subtitle: `P${incident.priority} · ${incident.sectorId.replace("sector-", "")}`,
      tone: "incident" as const,
      severity:
        incident.priority === 1
          ? ("Critical" as const)
          : incident.priority === 2
            ? ("High" as const)
            : ("Medium" as const),
    })),
    ...teams
      .filter((team) => team.status === "engaged")
      .map((team) => ({
        id: team.id,
        position: SECTOR_COORDS[team.sectorId] ?? [36.75, 5.06],
        title: team.name,
        subtitle: `${team.kind[lang]} · ${team.status}`,
        tone: "team" as const,
      })),
    ...SHELTERS.map((shelter) => ({
      id: shelter.id,
      position: shelter.position,
      title: shelter.name,
      subtitle: `${t("ops.map.shelters")} · ${shelters.occupied}/${shelters.capacity}`,
      tone: "shelter" as const,
    })),
  ];

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.map.title")}</h2>
        <span className="ops-card__hint">
          {t("ops.common.count", { count: pins.length })}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.map.lead")}</p>

      <CrisisMap
        pins={pins}
        perimeter={
          hazmat.active
            ? {
                center: INCIDENT_COORDS["inc-gas"],
                radius: hazmat.radius,
              }
            : undefined
        }
      />

      <div className="ops-grid">
        <div className="ops-kpi ops-kpi--danger">
          <span className="ops-kpi__value">{hazmat.active ? hazmat.radius : "—"}</span>
          <span className="ops-kpi__label">{t("ops.map.perimeter")}</span>
        </div>
        <div className="ops-kpi">
          <span className="ops-kpi__value">{teams.filter((team) => team.status === "engaged").length}</span>
          <span className="ops-kpi__label">{t("ops.means.engaged")}</span>
        </div>
        <div className="ops-kpi">
          <span className="ops-kpi__value">{requisitions.filter((item) => item.status !== "completed" && item.status !== "cancelled").length}</span>
          <span className="ops-kpi__label">{t("ops.pcf.requisitions")}</span>
        </div>
        <div className="ops-kpi ops-kpi--ok">
          <span className="ops-kpi__value">{shelters.capacity - shelters.occupied}</span>
          <span className="ops-kpi__label">{t("ops.pcf.beds")}</span>
        </div>
      </div>

      <div className="ops-hazmat__legend">
        <span>
          <span className="ops-legend-dot" style={{ background: "#dc2626" }} />{" "}
          {t("ops.map.hazmat")}
        </span>
        <span>
          <span className="ops-legend-dot" style={{ background: "#2563eb" }} />{" "}
          {t("ops.means.team")}
        </span>
        <span>
          <span className="ops-legend-dot" style={{ background: "#16a34a" }} />{" "}
          {t("ops.map.shelters")}
        </span>
      </div>
    </section>
  );
}

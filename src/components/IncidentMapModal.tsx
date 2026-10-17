import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { divIcon, latLngBounds } from "leaflet";
import type { DivIcon, Marker as LeafletMarker, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./IncidentMapModal.css";
import Modal from "./Modal";
import { generateSafetyData } from "../mockdata/safety";
import type { EvacRoute, Shelter } from "../mockdata/safety";
import { distanceKm } from "../mockdata/locations";
import type { Coords } from "../mockdata/locations";

export type MapTone = "verified" | "unverified" | "incident" | "crisis";

export type MapItem = {
  id: string;
  title: string;
  /** Short line shown next to the badges, e.g. « Mila · Gravité Élevée ». */
  meta: string;
  tone: MapTone;
  position: Coords;
  badges: { label: string; className: string }[];
  /** Optional details, surfaced only inside this modal. */
  description?: string;
  source?: string;
};

type LayerKey = "zones" | "routes" | "shelters" | "posts";

const LAYER_LABELS: Record<LayerKey, string> = {
  zones: "Zones sûres",
  routes: "Itinéraires d'évacuation",
  shelters: "Abris",
  posts: "Postes de secours",
};

const LAYER_ICONS: Record<LayerKey, ReactNode> = {
  zones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  routes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6" />
    </svg>
  ),
  shelters: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9.5 9-7 9 7" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  ),
  posts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  ),
};

const incidentIconCache = new Map<MapTone, DivIcon>();

function getIncidentIcon(tone: MapTone): DivIcon {
  const cached = incidentIconCache.get(tone);
  if (cached) {
    return cached;
  }

  const icon = divIcon({
    className: `map-pin ${tone} is-active`,
    html: '<span class="map-pin__ring"></span><span class="map-pin__dot"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });

  incidentIconCache.set(tone, icon);
  return icon;
}

const facilityIconCache = new Map<"shelter" | "post", DivIcon>();

function getFacilityIcon(kind: "shelter" | "post"): DivIcon {
  const cached = facilityIconCache.get(kind);
  if (cached) {
    return cached;
  }

  const glyph =
    kind === "shelter"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9.5 9-7 9 7"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-6h4v6"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>';

  const icon = divIcon({
    className: `map-facility map-facility--${kind}`,
    html: `<span class="map-facility__glyph">${glyph}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -15],
  });

  facilityIconCache.set(kind, icon);
  return icon;
}

function routeOptions(status: EvacRoute["status"]): PathOptions {
  return status === "clear"
    ? { color: "#16704a", weight: 4, opacity: 0.85, lineCap: "round" }
    : {
        color: "#a96508",
        weight: 4,
        opacity: 0.85,
        lineCap: "round",
        dashArray: "10 8",
      };
}

/** « 1,2 km » — French decimal separator. */
function formatKm(km: number): string {
  return `${km.toFixed(1).replace(".", ",")} km`;
}

function ShelterGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9.5 9-7 9 7" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11 22 2l-9 19-2-8-8-2z" />
    </svg>
  );
}

type MapControllerProps = {
  framePoints: Coords[];
  incidentRef: RefObject<LeafletMarker | null>;
};

function MapController({ framePoints, incidentRef }: MapControllerProps) {
  const map = useMap();
  const pointsRef = useRef(framePoints);

  useEffect(() => {
    pointsRef.current = framePoints;
  }, [framePoints]);

  // Keep the map sized correctly while the modal animates / on resize.
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  // Frame the incident and the whole safety layout once, then reveal the popup.
  useEffect(() => {
    map.fitBounds(latLngBounds(pointsRef.current), {
      padding: [64, 64],
      maxZoom: 14,
    });

    const timer = setTimeout(() => {
      incidentRef.current?.openPopup();
    }, 600);

    return () => clearTimeout(timer);
  }, [map, incidentRef]);

  return null;
}

type IncidentMapModalProps = {
  item: MapItem;
  onClose: () => void;
};

function IncidentMapModal({ item, onClose }: IncidentMapModalProps) {
  const data = useMemo(() => generateSafetyData(item.position, item.id), [item]);

  const nearestShelter = useMemo(() => {
    let best: { shelter: Shelter; km: number } | null = null;

    for (const shelter of data.shelters) {
      const km = distanceKm(item.position, shelter.position);
      if (!best || km < best.km) {
        best = { shelter, km };
      }
    }

    return best;
  }, [data, item.position]);

  const itineraryUrl = nearestShelter
    ? `https://www.google.com/maps/dir/?api=1&destination=${nearestShelter.shelter.position[0]},${nearestShelter.shelter.position[1]}`
    : null;

  const [visible, setVisible] = useState<Record<LayerKey, boolean>>({
    zones: true,
    routes: true,
    shelters: true,
    posts: true,
  });

  const incidentRef = useRef<LeafletMarker | null>(null);

  const toggles: { key: LayerKey; count: number }[] = [
    { key: "zones", count: data.zones.length },
    { key: "routes", count: data.routes.length },
    { key: "shelters", count: data.shelters.length },
    { key: "posts", count: data.posts.length },
  ];

  const framePoints: Coords[] = [
    item.position,
    ...data.zones.map((zone) => zone.center),
    ...data.shelters.map((shelter) => shelter.position),
    ...data.posts.map((post) => post.position),
  ];

  return (
    <Modal title={item.title} onClose={onClose} className="modal--map">
      <div className="map-modal__info">
        <div className="map-modal__meta">
          {item.badges.map((badge) => (
            <span key={badge.label} className={`pill ${badge.className}`}>
              {badge.label}
            </span>
          ))}
          <span className="map-modal__sub">{item.meta}</span>
        </div>

        {item.description && (
          <p className="map-modal__desc">
            {item.description}
            {item.source && (
              <span className="map-modal__source"> · Source : {item.source}</span>
            )}
          </p>
        )}

        <div className="map-modal__help">
          {nearestShelter && (
            <div className="map-modal__shelter">
              <span className="map-modal__shelter-icon" aria-hidden="true">
                <ShelterGlyph />
              </span>
              <span className="map-modal__shelter-text">
                <small>Abri le plus proche</small>
                <strong>{nearestShelter.shelter.name}</strong>
              </span>
              <span className="map-modal__shelter-dist">
                à {formatKm(nearestShelter.km)}
              </span>
            </div>
          )}

          {nearestShelter && itineraryUrl && (
            <a
              className="map-modal__itinerary"
              href={itineraryUrl}
              target="_blank"
              rel="noreferrer"
            >
              <NavigationIcon />
              Itinéraire
            </a>
          )}

          <div className="map-modal__calls" role="group" aria-label="Numéros d'urgence">
            <span className="map-modal__calls-label">Appel direct</span>
            <a className="map-modal__call" href="tel:14">14 · Secours</a>
            <a className="map-modal__call" href="tel:17">17 · Police</a>
          </div>
        </div>

        <div className="map-modal__layers" role="group" aria-label="Couches de la carte">
          {toggles.map(({ key, count }) => (
            <button
              key={key}
              type="button"
              className={`map-layer ${key}${visible[key] ? " is-on" : ""}`}
              aria-pressed={visible[key]}
              onClick={() =>
                setVisible((current) => ({ ...current, [key]: !current[key] }))
              }
            >
              <span className="map-layer__icon" aria-hidden="true">
                {LAYER_ICONS[key]}
              </span>
              {LAYER_LABELS[key]}
              <span className="map-layer__count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="map-modal__stage"
        role="region"
        aria-label="Carte de la zone et des dispositifs de sécurité"
      >
        <MapContainer
          key={item.id}
          center={item.position}
          zoom={13}
          scrollWheelZoom
          className="safety-map"
        >
          <TileLayer
            attribution="Fonds de carte &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />

          <MapController framePoints={framePoints} incidentRef={incidentRef} />

          <Marker
            position={item.position}
            icon={getIncidentIcon(item.tone)}
            zIndexOffset={600}
            ref={(instance) => {
              incidentRef.current = instance;
            }}
          >
            <Popup>
              <div className="map-pop">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
            </Popup>
          </Marker>

          {visible.routes &&
            data.routes.map((route) => (
              <Polyline
                key={route.id}
                positions={route.path}
                pathOptions={routeOptions(route.status)}
              >
                <Tooltip sticky>
                  <div className="map-tip">
                    <strong>{route.name}</strong>
                    <span>
                      {route.status === "clear"
                        ? "Voie dégagée"
                        : "Partiellement encombrée"}{" "}
                      · vers {route.destination}
                    </span>
                  </div>
                </Tooltip>
              </Polyline>
            ))}

          {visible.zones &&
            data.zones.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  color: "#16704a",
                  weight: 1.5,
                  opacity: 0.65,
                  fillColor: "#16704a",
                  fillOpacity: 0.13,
                }}
              >
                <Tooltip sticky>
                  <div className="map-tip">
                    <strong>{zone.name}</strong>
                    <span>Zone sûre · {zone.note}</span>
                  </div>
                </Tooltip>
              </Circle>
            ))}

          {visible.shelters &&
            data.shelters.map((shelter) => (
              <Marker
                key={shelter.id}
                position={shelter.position}
                icon={getFacilityIcon("shelter")}
              >
                <Popup>
                  <div className="map-pop">
                    <strong>{shelter.name}</strong>
                    <span>Abri · capacité {shelter.capacity} personnes</span>
                  </div>
                </Popup>
              </Marker>
            ))}

          {visible.posts &&
            data.posts.map((post) => (
              <Marker
                key={post.id}
                position={post.position}
                icon={getFacilityIcon("post")}
              >
                <Popup>
                  <div className="map-pop">
                    <strong>{post.name}</strong>
                    <span>{post.kind}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <footer className="map-modal__legend">
        <span className="legend__item zones">
          <i aria-hidden="true" />
          Zones sûres
        </span>
        <span className="legend__item routes">
          <i aria-hidden="true" />
          Itinéraire dégagé
        </span>
        <span className="legend__item routes-alt">
          <i aria-hidden="true" />
          Partiellement encombré
        </span>
        <span className="legend__item shelters">
          <i aria-hidden="true" />
          Abris
        </span>
        <span className="legend__item posts">
          <i aria-hidden="true" />
          Postes de secours
        </span>
        <span className="map-modal__note">
          Dispositif de démonstration généré autour du point sélectionné.
        </span>
      </footer>
    </Modal>
  );
}

export default IncidentMapModal;

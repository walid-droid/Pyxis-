import { useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  divIcon,
  type DivIcon,
  type Marker as LeafletMarker,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "../../i18n";
import type { Coords } from "../../mockdata/locations";

export type MapPinTone =
  | "incident"
  | "team"
  | "shelter"
  | "hospital"
  | "police";

export type MapPin = {
  id: string;
  position: Coords;
  title: string;
  subtitle?: string;
  tone: MapPinTone;
  /** Colore un repère d'incident selon sa gravité. */
  severity?: "Low" | "Medium" | "High" | "Critical";
  /** Repère temporairement mis en avant depuis la liste (ou au survol). */
  highlighted?: boolean;
  /** When set, the popup links to the matching record. */
  href?: string;
};

export type MapPerimeter = {
  center: Coords;
  /** Radius in meters. */
  radius: number;
};

type CrisisMapProps = {
  pins: MapPin[];
  /** "mini" disables the map gestures to keep the page scroll comfortable. */
  variant?: "mini" | "full";
  interactive?: boolean;
  /** Relie un survol de repère à la liste d'incidents (et inversement). */
  onPinHover?: (pinId: string | null) => void;
  /** Périmètre de sécurité affiché sous les repères. */
  perimeter?: MapPerimeter;
};

const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

const ICON_CACHE = new Map<string, DivIcon>();

function makePinIcon(
  tone: MapPinTone,
  severity?: MapPin["severity"],
): DivIcon {
  const key = `${tone}:${severity ?? ""}`;
  const cached = ICON_CACHE.get(key);
  if (cached) return cached;

  const severityClass = severity
    ? ` rc-pin--sev-${severity.toLowerCase()}`
    : "";
  const icon = divIcon({
    className: `rc-pin rc-pin--${tone}${severityClass}`,
    html: '<span class="rc-pin__dot" aria-hidden="true"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
  ICON_CACHE.set(key, icon);
  return icon;
}

type PinMarkerProps = {
  pin: MapPin;
  onPinHover?: (pinId: string | null) => void;
};

/**
 * Marqueur individuel : le surlignage est appliqué directement sur l'élément
 * Leaflet, sans remplacer l'icône (ce qui provoquerait un clignotement au
 * survol et couperait l'événement `mouseover`).
 */
function PinMarker({ pin, onPinHover }: PinMarkerProps) {
  const { t } = useI18n();
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    const element = marker?.getElement();
    if (!marker || !element) return;

    element.classList.toggle("is-highlighted", Boolean(pin.highlighted));
    marker.setZIndexOffset(pin.highlighted ? 1000 : 0);
  }, [pin.highlighted]);

  return (
    <Marker
      ref={markerRef}
      position={pin.position}
      icon={makePinIcon(pin.tone, pin.severity)}
      riseOnHover
      eventHandlers={
        onPinHover
          ? {
              mouseover: () => onPinHover(pin.id),
              mouseout: () => onPinHover(null),
            }
          : undefined
      }
    >
      <Popup>
        <span className="rc-popup__title">{pin.title}</span>
        {pin.subtitle && (
          <span className="rc-popup__meta">{pin.subtitle}</span>
        )}
        {pin.href && (
          <Link className="rc-popup__link" to={pin.href}>
            {t("resp.map.open")}
          </Link>
        )}
      </Popup>
    </Marker>
  );
}

/** Frames every pin as soon as the marker set changes. */
function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  const signature = pins
    .map((pin) => `${pin.position[0]},${pin.position[1]}`)
    .join("|");

  useEffect(() => {
    if (pins.length === 0) return;

    let frame = 0;
    let attempts = 0;
    let fitted = false;
    let cancelled = false;
    const container = map.getContainer();

    // The map can mount before its card has been laid out (0 × 0). Leaflet
    // then computes a nonsense zoom, which used to leave the view lost at
    // sea. Wait for real dimensions, invalidate, then frame every marker.
    const fit = () => {
      if (cancelled || fitted) return;
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        if (attempts < 60) {
          attempts += 1;
          frame = window.requestAnimationFrame(fit);
        }
        return;
      }

      map.invalidateSize({ animate: false });
      if (pins.length === 1) {
        map.setView(pins[0].position, 11, { animate: false });
      } else {
        map.fitBounds(
          pins.map((pin) => pin.position),
          { padding: [42, 42], maxZoom: 12, animate: false },
        );
      }
      fitted = true;
    };

    frame = window.requestAnimationFrame(fit);

    const observer = new ResizeObserver(() => {
      if (cancelled) return;
      if (!fitted) {
        attempts = 0;
        fit();
      } else {
        map.invalidateSize({ animate: false });
      }
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // `signature` already captures the coordinates that matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, signature]);

  return null;
}

/** Carte opérationnelle partagée par le tableau de bord et les ressources. */
function CrisisMap({
  pins,
  variant = "full",
  interactive = true,
  onPinHover,
  perimeter,
}: CrisisMapProps) {
  const { t } = useI18n();
  const center: Coords = pins[0]?.position ?? [36.75, 3.06];

  return (
    <div className={`rc-map rc-map--${variant}`}>
      <MapContainer
        center={center}
        zoom={variant === "mini" ? 6 : 7}
        className="rc-map__canvas"
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
      >
        <TileLayer
          url={TILE_URL}
          attribution={t("map.attribution")}
        />

        {perimeter && (
          <Circle
            center={perimeter.center}
            radius={perimeter.radius}
            pathOptions={{
              color: "#d92d20",
              weight: 2,
              opacity: 0.8,
              fillColor: "#d92d20",
              fillOpacity: 0.08,
              dashArray: "6 8",
            }}
          />
        )}

        {pins.map((pin) => (
          <PinMarker key={pin.id} pin={pin} onPinHover={onPinHover} />
        ))}

        <FitBounds pins={pins} />
      </MapContainer>
    </div>
  );
}

export default CrisisMap;

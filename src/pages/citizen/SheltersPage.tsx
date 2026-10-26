import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { generateSafetyData } from "../../mockdata/safety";
import { distanceKm, resolveCoords } from "../../mockdata/locations";
import type { Coords } from "../../mockdata/locations";
import { useI18n, type Lang } from "../../i18n";
import "./SheltersPage.css";

/** Same demo anchor as the dashboard: "Autour de moi · Sétif". */
const DEMO_CENTER = resolveCoords("Sétif");

/** Reads a coordinate from the URL, ignoring missing or out-of-range values. */
function parseCoord(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

/** « 1,2 km » — French decimal separator, « 1٫2 كم » in Arabic. */
function formatKm(km: number, lang: Lang): string {
  if (lang === "ar") return `${km.toFixed(1).replace(".", "٫")} كم`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** Google Maps directions to a point. */
function routesUrl(position: Coords): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
}

function ShelterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9.5 9-7 9 7" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

function PostIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6" />
    </svg>
  );
}

export default function SheltersPage() {
  const { t, tc, lang } = useI18n();
  const [searchParams] = useSearchParams();

  const lat = parseCoord(searchParams.get("lat"), -90, 90);
  const lng = parseCoord(searchParams.get("lng"), -180, 180);
  const isGeo = lat !== null && lng !== null;

  // La landing transmet la position du visiteur via /resources?lat=…&lng=…
  const center = useMemo<Coords>(() => {
    if (lat !== null && lng !== null) return [lat, lng];
    return DEMO_CENTER;
  }, [lat, lng]);
  const safety = useMemo(() => generateSafetyData(center, "abris-secours"), [center]);

  const shelters = [...safety.shelters].sort(
    (a, b) => distanceKm(center, a.position) - distanceKm(center, b.position),
  );
  const posts = [...safety.posts].sort(
    (a, b) => distanceKm(center, a.position) - distanceKm(center, b.position),
  );

  return (
    <main className="res-page">
      <header className="res-hero">
        <div className="res-hero-text">
          <p className="res-hero-eyebrow">{t("resources.eyebrow")}</p>
          <h1>{t("resources.title")}</h1>
          <p className="res-hero-lead">{t("resources.lead")}</p>
          {isGeo && (
            <p className="res-hero-geo">
              <span className="res-hero-geo-dot" aria-hidden="true" />
              {t("resources.aroundMe")}
              <Link to="/resources">{t("resources.resetPosition")}</Link>
            </p>
          )}
        </div>

        <div className="res-hero-aside">
          <p className="res-hero-alert">
            <span className="res-hero-alert-dot" aria-hidden="true" />
            {t("resources.emergency")}
          </p>

          <Link className="res-hero-link" to="/contacts">
            {t("resources.allNumbers")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <section className="res-section cardSec" aria-labelledby="res-shelters">
        <header className="res-section-head">
          <h2 id="res-shelters">{t("resources.sheltersTitle")}</h2>
          <p>{t("resources.sheltersLead")}</p>
        </header>
        <ul className="res-list">
          {shelters.map((shelter) => (
            <li key={shelter.id} className="res-row">
              <span className="res-row__icon" aria-hidden="true">
                <ShelterIcon />
              </span>
              <span className="res-row__body">
                <span className="res-row__name">{tc(shelter.name)}</span>
                <span className="res-row__meta">
                  {t("resources.capacity", { count: shelter.capacity })}
                </span>
              </span>
              <span className="res-row__side">
                <span className="res-chip">
                  {t("resources.at", { distance: formatKm(distanceKm(center, shelter.position), lang) })}
                </span>
                <a
                  className="res-itin"
                  href={routesUrl(shelter.position)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("resources.routeAria", { name: tc(shelter.name) })}
                >
                  {t("resources.itinerary")} <span aria-hidden="true">→</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="res-section cardSec" aria-labelledby="res-posts">
        <header className="res-section-head">
          <h2 id="res-posts">{t("resources.postsTitle")}</h2>
          <p>{t("resources.postsLead")}</p>
        </header>
        <ul className="res-list">
          {posts.map((post) => (
            <li key={post.id} className="res-row">
              <span className="res-row__icon" aria-hidden="true">
                <PostIcon />
              </span>
              <span className="res-row__body">
                <span className="res-row__name">{tc(post.name)}</span>
                <span className="res-row__meta">{tc(post.kind)}</span>
              </span>
              <span className="res-row__side">
                <span className="res-chip">
                  {t("resources.at", { distance: formatKm(distanceKm(center, post.position), lang) })}
                </span>
                <a
                  className="res-itin"
                  href={routesUrl(post.position)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("resources.routeAria", { name: tc(post.name) })}
                >
                  {t("resources.itinerary")} <span aria-hidden="true">→</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="res-section cardSec" aria-labelledby="res-routes">
        <header className="res-section-head">
          <h2 id="res-routes">{t("resources.routesTitle")}</h2>
          <p>{t("resources.routesLead")}</p>
        </header>
        <ul className="res-list">
          {safety.routes.map((route) => (
            <li key={route.id} className="res-row">
              <span className="res-row__icon" aria-hidden="true">
                <RouteIcon />
              </span>
              <span className="res-row__body">
                <span className="res-row__name">{tc(route.name)}</span>
                <span className="res-row__meta">
                  {t("resources.towards", { destination: tc(route.destination) })}
                </span>
              </span>
              <span className="res-row__side">
                <span className={`res-chip res-chip--${route.status}`}>
                  {route.status === "clear"
                    ? t("resources.clear")
                    : t("resources.partial")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="res-note">
        {isGeo ? t("resources.noteGeoBefore") : t("resources.noteBefore")}
        <Link to="/dashboard">{t("nav.dashboard")}</Link>
        {t("resources.noteAfter")}
      </p>
    </main>
  );
}

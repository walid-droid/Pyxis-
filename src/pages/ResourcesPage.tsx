import { Link } from "react-router";
import { generateSafetyData } from "../mockdata/safety";
import { distanceKm, resolveCoords } from "../mockdata/locations";
import type { Coords } from "../mockdata/locations";
import "./ResourcesPage.css";

/** Same demo anchor as the dashboard: "Autour de moi · Sétif". */
const CENTER = resolveCoords("Sétif");
const SAFETY = generateSafetyData(CENTER, "abris-secours");

/** « 1,2 km » — French decimal separator. */
function formatKm(km: number): string {
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

export default function ResourcesPage() {
  const shelters = [...SAFETY.shelters].sort(
    (a, b) => distanceKm(CENTER, a.position) - distanceKm(CENTER, b.position),
  );
  const posts = [...SAFETY.posts].sort(
    (a, b) => distanceKm(CENTER, a.position) - distanceKm(CENTER, b.position),
  );

  return (
    <main className="res-page">
      <header className="res-hero">
        <div className="res-hero-text">
          <p className="res-hero-eyebrow">Abris &amp; secours</p>
          <h1>Trouvez un abri près de vous.</h1>
          <p className="res-hero-lead">
            Les abris, postes de secours et itinéraires prévus autour de Sétif.
          </p>
        </div>

        <div className="res-hero-aside">
          <p className="res-hero-alert">
            <span className="res-hero-alert-dot" aria-hidden="true" />
            En cas de danger immédiat, appelez d'abord le 14
          </p>

          <Link className="res-hero-link" to="/contacts">
            Tous les numéros
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <section className="res-section cardSec" aria-labelledby="res-shelters">
        <header className="res-section-head">
          <h2 id="res-shelters">Abris à proximité</h2>
          <p>Points de mise à l'abri à rejoindre à pied si nécessaire.</p>
        </header>
        <ul className="res-list">
          {shelters.map((shelter) => (
            <li key={shelter.id} className="res-row">
              <span className="res-row__icon" aria-hidden="true">
                <ShelterIcon />
              </span>
              <span className="res-row__body">
                <span className="res-row__name">{shelter.name}</span>
                <span className="res-row__meta">
                  Capacité {shelter.capacity} personnes
                </span>
              </span>
              <span className="res-row__side">
                <span className="res-chip">
                  à {formatKm(distanceKm(CENTER, shelter.position))}
                </span>
                <a
                  className="res-itin"
                  href={routesUrl(shelter.position)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Itinéraire vers ${shelter.name}`}
                >
                  Itinéraire <span aria-hidden="true">→</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="res-section cardSec" aria-labelledby="res-posts">
        <header className="res-section-head">
          <h2 id="res-posts">Postes de secours</h2>
          <p>Hôpitaux et unités des services de secours les plus proches.</p>
        </header>
        <ul className="res-list">
          {posts.map((post) => (
            <li key={post.id} className="res-row">
              <span className="res-row__icon" aria-hidden="true">
                <PostIcon />
              </span>
              <span className="res-row__body">
                <span className="res-row__name">{post.name}</span>
                <span className="res-row__meta">{post.kind}</span>
              </span>
              <span className="res-row__side">
                <span className="res-chip">
                  à {formatKm(distanceKm(CENTER, post.position))}
                </span>
                <a
                  className="res-itin"
                  href={routesUrl(post.position)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Itinéraire vers ${post.name}`}
                >
                  Itinéraire <span aria-hidden="true">→</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="res-section cardSec" aria-labelledby="res-routes">
        <header className="res-section-head">
          <h2 id="res-routes">Itinéraires d'évacuation</h2>
          <p>Chemins conseillés vers les abris en cas d'évacuation.</p>
        </header>
        <ul className="res-list">
          {SAFETY.routes.map((route) => (
            <li key={route.id} className="res-row">
              <span className="res-row__icon" aria-hidden="true">
                <RouteIcon />
              </span>
              <span className="res-row__body">
                <span className="res-row__name">{route.name}</span>
                <span className="res-row__meta">vers {route.destination}</span>
              </span>
              <span className="res-row__side">
                <span className={`res-chip res-chip--${route.status}`}>
                  {route.status === "clear"
                    ? "Voie dégagée"
                    : "Partiellement encombré"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="res-note">
        Dispositif de démonstration généré autour de Sétif. Pour le voir sur la
        carte, ouvrez une rubrique depuis le <Link to="/dashboard">tableau de bord</Link>.
      </p>
    </main>
  );
}

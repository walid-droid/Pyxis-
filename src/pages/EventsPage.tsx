import { useState } from "react";
import { mockEvents, type EventItem, type EventStatus } from "../mockdata/event";
import "./EventsPage.css";

const STATUS_FR: Record<string, string> = {
  Upcoming: "À venir",
  Ongoing: "En cours",
  Ended: "Terminé",
};

const STATUS_ORDER: EventStatus[] = ["Upcoming", "Ongoing", "Ended"];

function EventCard({ event }: { event: EventItem }) {
  return (
    <li className={`event-item st-${event.status.toLowerCase()}`}>
      <div className="event-item-top">
        <span className="event-category">{event.category}</span>
        <span className={`event-status st-${event.status.toLowerCase()}`}>
          {STATUS_FR[event.status]}
        </span>
      </div>

      <h3>{event.title}</h3>
      <p>{event.description}</p>

      <div className="event-item-meta">
        <span>{event.date} · {event.time}</span>
        <span>{event.wilaya} · {event.commune}</span>
      </div>

      <div className="event-item-foot">
        <span>{event.location}</span>
        <span>{event.organizer}</span>
      </div>
    </li>
  );
}

function EventsPage() {
  const [status, setStatus] = useState<EventStatus | "all">("all");
  const [category, setCategory] = useState<string>("all");

  const categories = Array.from(new Set(mockEvents.map((event) => event.category)));

  const filteredEvents = mockEvents.filter(
    (event) =>
      (status === "all" || event.status === status) &&
      (category === "all" || event.category === category),
  );

  return (
    <main className="events-page">
      <header className="events-hero">
        <div className="events-hero-text">
          <p className="events-hero-eyebrow">Sensibilisation &amp; terrain</p>
          <h1>Événements</h1>
          <p className="events-hero-lead">
            Découvrez les activités de sensibilisation, formations et actions citoyennes.
          </p>
        </div>
      </header>

      <div className="events-layout">
        <aside className="events-filter" aria-label="Filtrer les événements">
          <div className="events-filter-group">
            <p className="events-filter-title">Statut</p>
            <ul className="events-filter-list">
              <li>
                <button
                  type="button"
                  className={`events-filter-btn${status === "all" ? " is-active" : ""}`}
                  onClick={() => setStatus("all")}
                >
                  Tous les événements
                  <span className="events-filter-count">{mockEvents.length}</span>
                </button>
              </li>
              {STATUS_ORDER.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    className={`events-filter-btn${status === value ? " is-active" : ""}`}
                    onClick={() => setStatus(value)}
                  >
                    {STATUS_FR[value]}
                    <span className="events-filter-count">
                      {mockEvents.filter((event) => event.status === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="events-filter-group">
            <p className="events-filter-title">Catégorie</p>
            <ul className="events-filter-list">
              <li>
                <button
                  type="button"
                  className={`events-filter-btn${category === "all" ? " is-active" : ""}`}
                  onClick={() => setCategory("all")}
                >
                  Toutes les catégories
                  <span className="events-filter-count">{mockEvents.length}</span>
                </button>
              </li>
              {categories.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    className={`events-filter-btn${category === value ? " is-active" : ""}`}
                    onClick={() => setCategory(value)}
                  >
                    {value}
                    <span className="events-filter-count">
                      {mockEvents.filter((event) => event.category === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="events-content">
          <p className="events-summary">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""}
          </p>

          {filteredEvents.length > 0 ? (
            <ul className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="events-empty">Aucun événement ne correspond à ce filtre.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventsPage;

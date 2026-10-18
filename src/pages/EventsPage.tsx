import { useState } from "react";
import { mockEvents, type EventItem, type EventStatus } from "../mockdata/event";
import { useI18n } from "../i18n";
import "./EventsPage.css";

const STATUS_KEYS: Record<string, string> = {
  Upcoming: "events.status.upcoming",
  Ongoing: "events.status.ongoing",
  Ended: "events.status.ended",
};

const STATUS_ORDER: EventStatus[] = ["Upcoming", "Ongoing", "Ended"];

function EventCard({ event }: { event: EventItem }) {
  const { t, tc } = useI18n();

  return (
    <li className={`event-item st-${event.status.toLowerCase()}`}>
      <div className="event-item-top">
        <span className="event-category">{tc(event.category)}</span>
        <span className={`event-status st-${event.status.toLowerCase()}`}>
          {t(STATUS_KEYS[event.status])}
        </span>
      </div>

      <h3>{tc(event.title)}</h3>
      <p>{tc(event.description)}</p>

      <div className="event-item-meta">
        <span>{tc(event.date)} · {event.time}</span>
        <span>{tc(event.wilaya)} · {tc(event.commune)}</span>
      </div>

      <div className="event-item-foot">
        <span>{tc(event.location)}</span>
        <span>{tc(event.organizer)}</span>
      </div>
    </li>
  );
}

function EventsPage() {
  const { t, tc } = useI18n();
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
          <p className="events-hero-eyebrow">{t("events.eyebrow")}</p>
          <h1>{t("events.title")}</h1>
          <p className="events-hero-lead">{t("events.lead")}</p>
        </div>
      </header>

      <div className="events-layout">
        <aside className="events-filter" aria-label={t("events.filterAria")}>
          <div className="events-filter-group">
            <p className="events-filter-title">{t("events.status")}</p>
            <ul className="events-filter-list">
              <li>
                <button
                  type="button"
                  className={`events-filter-btn${status === "all" ? " is-active" : ""}`}
                  onClick={() => setStatus("all")}
                >
                  {t("events.all")}
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
                    {t(STATUS_KEYS[value])}
                    <span className="events-filter-count">
                      {mockEvents.filter((event) => event.status === value).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="events-filter-group">
            <p className="events-filter-title">{t("events.category")}</p>
            <ul className="events-filter-list">
              <li>
                <button
                  type="button"
                  className={`events-filter-btn${category === "all" ? " is-active" : ""}`}
                  onClick={() => setCategory("all")}
                >
                  {t("events.allCategories")}
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
                    {tc(value)}
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
            {t(
              filteredEvents.length > 1 ? "events.countPlural" : "events.count",
              { count: filteredEvents.length },
            )}
          </p>

          {filteredEvents.length > 0 ? (
            <ul className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="events-empty">{t("events.empty")}</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventsPage;

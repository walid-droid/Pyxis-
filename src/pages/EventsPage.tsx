import { useState } from "react";
import { mockEvents, type EventItem } from "../mockdata/event";
import Modal from "../components/Modal";
import StatCard from "../components/StatCard";
import "./EventsPage.css";

const STATUS_FR: Record<string, string> = {
  Upcoming: "À venir",
  Ongoing: "En cours",
  Ended: "Terminé",
};

type ModalKey = "total" | "upcoming" | "ongoing" | "ended";

const MODAL_TITLES: Record<ModalKey, string> = {
  total: "Tous les événements",
  upcoming: "Événements à venir",
  ongoing: "Événements en cours",
  ended: "Événements terminés",
};

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
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);

  const upcoming = mockEvents.filter((event) => event.status === "Upcoming");
  const ongoing = mockEvents.filter((event) => event.status === "Ongoing");
  const ended = mockEvents.filter((event) => event.status === "Ended");

  const counters = [
    { key: "total", label: "Total des événements", value: mockEvents.length, tone: "total" },
    { key: "upcoming", label: "À venir", value: upcoming.length, tone: "upcoming" },
    { key: "ongoing", label: "En cours", value: ongoing.length, tone: "ongoing" },
    { key: "ended", label: "Terminés", value: ended.length, tone: "ended" },
  ] as const;

  const currentList =
    activeModal === "upcoming"
      ? upcoming
      : activeModal === "ongoing"
        ? ongoing
        : activeModal === "ended"
          ? ended
          : mockEvents;

  return (
    <main className="events-page">
      <header className="page-header">
        <div>
          <h1>Événements</h1>
          <p>Découvrez les activités de sensibilisation, formations et actions citoyennes.</p>
        </div>
      </header>

      <section className="stat-grid">
        {counters.map((counter) => (
          <StatCard
            key={counter.key}
            value={counter.value}
            label={counter.label}
            tone={counter.tone}
            onClick={() => setActiveModal(counter.key)}
          />
        ))}
      </section>

      {activeModal && (
        <Modal title={MODAL_TITLES[activeModal]} onClose={() => setActiveModal(null)}>
          <ul className="events-grid">
            {currentList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        </Modal>
      )}
    </main>
  );
}

export default EventsPage;

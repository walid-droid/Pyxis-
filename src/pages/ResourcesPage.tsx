
import "../App.css";

function ResourcesPage() {
  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <h1>Resources</h1>
          <p>Find the information and resources you need during an emergency.</p>
        </div>
      </header>

      <section className="cardSec" style={{ padding: 24 }}>
        <h2>Emergency resources</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          Emergency contacts, safety guides, shelters, and useful resources
          will appear here.
        </p>
      </section>
    </main>
  );
}

export default ResourcesPage;

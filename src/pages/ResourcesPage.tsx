
import "../App.css";

function ResourcesPage() {
  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <h1>Ressources</h1>
          <p>Trouvez les informations et ressources utiles en cas d'urgence.</p>
        </div>
      </header>

      <section className="cardSec" style={{ padding: 24 }}>
        <h2>Ressources d'urgence</h2>
        <p style={{ color: "var(--color-text-muted)" }}>
          Les contacts d'urgence, guides de sécurité, abris et ressources
          utiles apparaîtront ici.
        </p>
      </section>
    </main>
  );
}

export default ResourcesPage;

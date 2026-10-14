
import { useNavigate } from "react-router";
import "./AlertsPage.css";

function AlertsPage() {
  const navigate = useNavigate();

  return (
    <main className="alerts-page">
      <header className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>Monitor and manage reported emergencies.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/submit-alert")}
        >
          + Create alert
        </button>
      </header>

      <section className="alert-summary">
        <article className="cardSec">
          <h2>Total alerts</h2>
          <p>24</p>
        </article>

        <article className="cardSec">
          <h2>Unverified</h2>
          <p>8</p>
        </article>

        <article className="cardSec">
          <h2>High severity</h2>
          <p>5</p>
        </article>

        <article className="cardSec">
          <h2>Resolved</h2>
          <p>11</p>
        </article>
      </section>

      <section className="alerts-list cardSec">
        <h2>All alerts</h2>
        <p>Reported emergencies will appear here.</p>
      </section>
    </main>
  );
}

export default AlertsPage;

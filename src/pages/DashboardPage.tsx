import "./DashboardPage.css"
import { useNavigate } from "react-router";
import WarningCard from "../components/WarningCard";
import { mockWarnings } from "../mockdata/warning";
import CrisisMap from "../components/CrisisMap";
import { mockCrisis } from "../mockdata/crisis";
import { mockTeams } from "../mockdata/teams";
import { mockIncidents } from "../mockdata/incident";

function DashboardPage() {
  const navigate = useNavigate();
  return (
  <main className="page-container dashboard-page">

    <section className="alert cardSec">
      <div className="hero-text">
        <span className="live-badge">
          <i className="live-dot" /> Live monitoring
        </span>

        <h2>Stay informed. Stay safe.</h2>
        <p>
          Get verified alerts and report incidents in your area,
          so help can reach you faster.
        </p>

        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/alerts")}
          >
            Submit an alert
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigate("/alerts")}
          >
            View active alerts
          </button>
        </div>
      </div>
    </section>

    <section className="warnings cardSec">
      <div className="warnings-group">
        <h3>Verified alerts</h3>

        <div className="warning-list">
          {mockWarnings
            .filter((warning) => warning.verification === "verified")
            .map((warning) => (
              <WarningCard key={warning.id} warning={warning} />
            ))}
        </div>
      </div>

      <div className="warnings-group">
        <h3>Unverified reports</h3>

        <div className="warning-list">
          {mockWarnings
            .filter((warning) => warning.verification === "unverified")
            .map((warning) => (
              <WarningCard key={warning.id} warning={warning} />
            ))}
        </div>
      </div>
    </section>

    <section className="incidents cardSec">
      <h2>Active incidents</h2>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Severity</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.event}</td>
                <td>
                  <span className={`pill sev-${incident.severity.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                </td>
                <td>{incident.location}</td>
                <td>
                  <span className={`pill st-${incident.status.toLowerCase()}`}>
                    {incident.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="crisis cardSec">
      <h2>Current crisis</h2>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockCrisis.map((crisis) => (
              <tr key={crisis.id}>
                <td>{crisis.event}</td>
                <td>{crisis.location}</td>
                <td>
                  <span className={`pill st-${crisis.status.toLowerCase()}`}>
                    {crisis.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="teams cardSec">
      <h2>Deployed teams</h2>

      <ul className="team-list">
        {mockTeams.map((team) => (
          <li key={team.id} className="team-item">
            <div>
              <strong>{team.name}</strong>
              <span>{team.type} · {team.members} members</span>
              <span>{team.location}</span>
            </div>
            <span className={`pill st-${team.status.toLowerCase().replace(" ", "-")}`}>
              {team.status}
            </span>
          </li>
        ))}
      </ul>
    </section>

    <section className="map cardSec">
      <h2>Map</h2>
      <CrisisMap/>
    </section>

    <section className="action cardedSec">
      <h2>Take action</h2>
    </section>
  </main>);
}

export default DashboardPage;
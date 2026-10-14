import "./DashboardPage.css"
import WarningCard from "../components/WarningCard";
import { mockWarnings } from "../mockdata/warning";
import CrisisMap from "../components/CrisisMap";
import { mockCrisis } from "../mockdata/crisis";
import { mockTeams } from "../mockdata/teams";
import { mockIncidents } from "../mockdata/incident";

function DashboardPage() {
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
          <button className="btn-primary">Submit an alert</button>
          <button className="btn-ghost">View active alerts</button>
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

    
<section className="action cardSec">
  <div className="action-heading">
    <div>
      <h2>Take action</h2>
      <p>Choose what you need to do next.</p>
    </div>
  </div>

  <div className="action-grid">
    <article className="action-card action-card-primary">
      <span className="action-icon">!</span>
      <h3>Report an emergency</h3>
      <p>
        Report an incident so the appropriate response
        team can assess it.
      </p>
      <a href="/alerts" className="action-link">
        Submit an alert →
      </a>
    </article>

    <article className="action-card">
      <span className="action-icon">⌖</span>
      <h3>View active alerts</h3>
      <p>Review reported incidents and their verification status.</p>
      <a href="/alerts" className="action-link">
        View alerts →
      </a>
    </article>

    <article className="action-card">
      <span className="action-icon">＋</span>
      <h3>Find response resources</h3>
      <p>Check available response teams and their deployment status.</p>
      <a href="/resources" className="action-link">
        View resources →
      </a>
    </article>
  </div>
</section>

  </main>);
}

export default DashboardPage;
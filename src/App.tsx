import "./App.css"
import { mockIncidents, mockCrises } from "./mockdata"

function App() {
return (
<>
<header>
<h1 className="Logo">Logo</h1>

    <nav>
      <a href="">Dashboard</a>
      <a href="">AI Assistant</a>
      <a href="">Alertes</a>
      <a href="">Events</a>
      <a href="">Resources</a>
      <a href="">Contacts</a>
    </nav>
  </header>

  <main>
    
    <section className="alert cardSec">
      <h2>welcome citizen</h2>
      <p>submit alert</p>
    </section>

    <section className="warnings cardedSec">
      <h2>official warnings</h2>

    </section>    

    <section className="incidents cardSec">
      <h2>Active incidents</h2>

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
      <td>{incident.severity}</td>
      <td>{incident.location}</td>
      <td>{incident.status}</td>
    </tr>
  ))}
</tbody>
      </table>
    </section>

    <section className="crisis cardSec">
      <h2>Current crisis</h2>

      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  {mockCrises.map((crisis) => (
    <tr key={crisis.id}>
      <td>{crisis.event}</td>
      <td>{crisis.location}</td>
      <td>{crisis.status}</td>
    </tr>
  ))}
</tbody>
      </table>
    </section>

    <section className="teams cardSec">
      <h2>Deployed teams</h2>
    </section>

    <section className="map cardSec">
      <h2>Map</h2>
    </section>

    <section className="action cardedSec">
      <h2>Take action</h2>
    </section>
  </main>
</>

)
}

export default App
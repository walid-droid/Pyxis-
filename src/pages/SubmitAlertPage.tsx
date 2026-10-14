
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import "./SubmitAlertPage.css";

export default function SubmitAlertPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "",
    wilaya: "",
    commune: "",
    location: "",
    description: "",
    severity: "medium",
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Connect this to your backend API to save the alert.
    console.log("Alert submitted:", form);
    alert("Form validated. Connect the backend to save the alert.");
  }

  return (
    <main className="submit-alert-page">
      <button
        className="submit-alert-back"
        type="button"
        onClick={() => navigate("/alerts")}
      >
        ← Back to alerts
      </button>

      <header className="submit-alert-heading">
        <span className="submit-alert-icon">!</span>
        <p className="submit-alert-eyebrow">SAFEDZ · ALERT MANAGEMENT</p>
        <h1>Create an alert</h1>
        <p>
          Provide accurate information about the emergency
          to inform the community.
        </p>
      </header>

      <form className="submit-alert-form" onSubmit={handleSubmit}>
        <section>
          <h2>01. Alert information</h2>

          <label htmlFor="alert-title">Alert title *</label>
          <input
            id="alert-title"
            required
            maxLength={120}
            placeholder="e.g. Flooding in residential area"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <label htmlFor="alert-type">Incident type *</label>
          <select
            id="alert-type"
            required
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option value="">Select incident type</option>
            <option value="flood">Flood</option>
            <option value="fire">Fire</option>
            <option value="earthquake">Earthquake</option>
            <option value="accident">Accident</option>
            <option value="storm">Storm</option>
            <option value="landslide">Landslide</option>
            <option value="other">Other</option>
          </select>

          <label htmlFor="severity">Severity *</label>
          <select
            id="severity"
            required
            value={form.severity}
            onChange={(e) =>
              setForm({ ...form, severity: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </section>

        <section>
          <h2>02. Location</h2>

          <div className="submit-alert-grid">
            <div>
              <label htmlFor="alert-wilaya">Wilaya *</label>
              <input
                id="alert-wilaya"
                required
                placeholder="e.g. Béjaïa"
                value={form.wilaya}
                onChange={(e) =>
                  setForm({ ...form, wilaya: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="alert-commune">Commune *</label>
              <input
                id="alert-commune"
                required
                placeholder="Commune name"
                value={form.commune}
                onChange={(e) =>
                  setForm({ ...form, commune: e.target.value })
                }
              />
            </div>
          </div>

          <label htmlFor="alert-location">Exact location</label>
          <input
            id="alert-location"
            placeholder="Street, neighborhood or landmark"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />
        </section>

        <section>
          <h2>03. Incident details</h2>

          <label htmlFor="alert-description">Description *</label>
          <textarea
            id="alert-description"
            required
            rows={5}
            maxLength={2000}
            placeholder="Describe the incident, its impact and any immediate danger..."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </section>

        <p className="submit-alert-note">
          * Required fields
        </p>

        <div className="submit-alert-actions">
          <button
            type="button"
            className="submit-alert-cancel"
            onClick={() => navigate("/alerts")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-alert-primary">
            Submit alert →
          </button>
        </div>
      </form>
    </main>
  );
}

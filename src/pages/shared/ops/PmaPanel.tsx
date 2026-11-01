import { useMemo, useState, type FormEvent } from "react";
import { useI18n } from "../../../i18n";
import { useOrsecOps, type TriageColor } from "../../../lib/orsecOps";
import "./ops.css";

const COLORS: TriageColor[] = ["red", "yellow", "green", "black"];

export default function PmaPanel() {
  const { t, tc } = useI18n();
  const { patients, updateTriage, addPatient } = useOrsecOps();
  const [name, setName] = useState("");
  const [age, setAge] = useState("30");
  const [location, setLocation] = useState("Béjaïa");
  const [triage, setTriage] = useState<TriageColor>("yellow");
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(
    () =>
      COLORS.reduce<Record<TriageColor, number>>(
        (acc, color) => {
          acc[color] = patients.filter((patient) => patient.triage === color).length;
          return acc;
        },
        { red: 0, yellow: 0, green: 0, black: 0 },
      ),
    [patients],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return;
    addPatient({
      name: name.trim(),
      age: Number(age) || 0,
      triage,
      location: { fr: location, ar: location },
    });
    setName("");
    setToast(t("ops.pma.saved"));
  };

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{t("ops.pma.title")}</h2>
        <span className="ops-card__hint">
          {t("ops.common.count", { count: patients.length })}
        </span>
      </div>
      <p className="ops-card__lead">{t("ops.pma.lead")}</p>

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <div className="ops-tri" aria-label={t("ops.pma.byColor")}>
        {COLORS.map((color) => (
          <div key={color} className={`ops-tri__cell ops-tri--${color}`}>
            <strong>{counts[color]}</strong>
            <span>{t(`ops.pma.${color}`)}</span>
          </div>
        ))}
      </div>

      <form className="ops-form" onSubmit={submit}>
        <div className="ops-form__row">
          <label className="ops-field">
            <span>{t("ops.pma.name")} *</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </label>
          <label className="ops-field">
            <span>{t("ops.pma.age")}</span>
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </label>
          <label className="ops-field">
            <span>{t("ops.pma.location")}</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <label className="ops-field">
            <span>{t("ops.pma.triage")}</span>
            <select
              value={triage}
              onChange={(event) => setTriage(event.target.value as TriageColor)}
            >
              {COLORS.map((color) => (
                <option key={color} value={color}>
                  {t(`ops.pma.${color}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="ops-btn-row">
          <button type="submit" className="ops-btn ops-btn--primary" disabled={name.trim().length < 2}>
            {t("ops.pma.add")}
          </button>
        </div>
      </form>

      {patients.length === 0 ? (
        <p className="ops-empty">{t("ops.pma.empty")}</p>
      ) : (
        <div className="ops-list">
          {patients.map((patient) => (
            <div key={patient.id} className="ops-pma__row">
              <div>
                <strong>{patient.name}</strong>
                <div className="ops-list__meta">
                  {patient.age > 0 ? `${patient.age} ${t("ops.pma.age").toLowerCase()}` : "—"} ·{" "}
                  {tc(patient.location.fr)}
                </div>
                <div className="ops-list__meta">
                  {t("ops.pma.updated")} {patient.updatedAt}
                  {patient.hospital ? ` · ${patient.hospital}` : ` · ${t("ops.pma.notEvacuated")}`}
                </div>
              </div>
              <select
                value={patient.triage}
                aria-label={t("ops.pma.change")}
                onChange={(event) =>
                  updateTriage(patient.id, event.target.value as TriageColor)
                }
                style={{ justifySelf: "start" }}
              >
                {COLORS.map((color) => (
                  <option key={color} value={color}>
                    {t(`ops.pma.${color}`)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

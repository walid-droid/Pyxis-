import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n";
import type { TerritoryLevel } from "../../data/territories";
import { addTerritory, addVoisinage } from "../../services/reference";
import { useDb } from "../../services/useDb";
import { territoryLabel } from "../shared/v3/helpers";

const LEVELS: TerritoryLevel[] = ["commune", "wilaya", "national"];

export default function AdminTerritoriesPage() {
  const { session } = useAuth();
  const { lang, t } = useI18n();
  const db = useDb();
  const [form, setForm] = useState({
    nomFr: "",
    nomAr: "",
    code: "",
    niveau: "commune" as TerritoryLevel,
    parentId: "",
  });
  const [neighbourA, setNeighbourA] = useState("");
  const [neighbourB, setNeighbourB] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...db.reference.territories].sort((a, b) => {
        const order: Record<TerritoryLevel, number> = { national: 0, wilaya: 1, commune: 2 };
        return order[a.niveau] - order[b.niveau] || a.code.localeCompare(b.code);
      }),
    [db.reference.territories],
  );

  const candidates = useMemo(
    () => sorted.filter((item) => item.niveau !== "national"),
    [sorted],
  );

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    if (!form.nomFr.trim() || !form.code.trim()) {
      setError(t("common.required"));
      return;
    }
    const created = addTerritory(
      {
        nom: {
          fr: form.nomFr.trim(),
          ar: form.nomAr.trim() || form.nomFr.trim(),
        },
        code: form.code.trim(),
        niveau: form.niveau,
        parentId: form.parentId || undefined,
      },
      session.userId,
    );
    if (!created) {
      setError(t("admin.territories.duplicate"));
      return;
    }
    setForm({ nomFr: "", nomAr: "", code: "", niveau: "commune", parentId: "" });
    setError(null);
    setNotice(t("admin.territories.created"));
  }

  function addPair() {
    if (!session) return;
    if (!neighbourA || !neighbourB) {
      setError(t("common.required"));
      return;
    }
    if (neighbourA === neighbourB) {
      setError(t("admin.territories.same"));
      return;
    }
    addVoisinage(neighbourA, neighbourB, session.userId);
    setNeighbourA("");
    setNeighbourB("");
    setError(null);
    setNotice(t("admin.territories.neighbourAdded"));
  }

  return (
    <main className="v3-page">
      <header className="v3-header">
        <div className="v3-header__text">
          <p className="v3-eyebrow">{t("admin.territories.title")}</p>
          <h1 className="v3-title">{t("admin.territories.title")}</h1>
          <p className="v3-lead">{t("admin.territories.lead")}</p>
        </div>
      </header>

      {notice ? (
        <div className="v3-banner" role="status">
          <span>{notice}</span>
          <button type="button" className="v3-btn v3-btn--small" onClick={() => setNotice(null)}>
            {t("common.close")}
          </button>
        </div>
      ) : null}

      <section className="v3-grid v3-grid--2">
        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("admin.territories.add")}</h2>
          </header>
          <form className="v3-form v3-form--2" onSubmit={create}>
            <div className="v3-field">
              <label htmlFor="territory-name-fr">{t("admin.territories.nameFr")}</label>
              <input
                id="territory-name-fr"
                value={form.nomFr}
                onChange={(event) => setField("nomFr", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="territory-name-ar">{t("admin.territories.nameAr")}</label>
              <input
                id="territory-name-ar"
                value={form.nomAr}
                onChange={(event) => setField("nomAr", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="territory-code">{t("admin.territories.code")}</label>
              <input
                id="territory-code"
                value={form.code}
                onChange={(event) => setField("code", event.target.value)}
              />
            </div>
            <div className="v3-field">
              <label htmlFor="territory-level">{t("admin.territories.level")}</label>
              <select
                id="territory-level"
                value={form.niveau}
                onChange={(event) => setField("niveau", event.target.value as TerritoryLevel)}
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t(`admin.territories.level.${level}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="v3-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="territory-parent">{t("admin.territories.parent")}</label>
              <select
                id="territory-parent"
                value={form.parentId}
                onChange={(event) => setField("parentId", event.target.value)}
              >
                <option value="">—</option>
                {sorted
                  .filter((territory) =>
                    form.niveau === "commune"
                      ? territory.niveau === "wilaya"
                      : territory.niveau === "national",
                  )
                  .map((territory) => (
                    <option key={territory.id} value={territory.id}>
                      {territory.nom[lang]}
                    </option>
                  ))}
              </select>
            </div>
            {error ? <p className="v3-note v3-note--danger">{error}</p> : null}
            <div className="v3-form__actions" style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="v3-btn v3-btn--primary">
                {t("admin.territories.add")}
              </button>
            </div>
          </form>
        </article>

        <article className="v3-card">
          <header className="v3-card__head">
            <h2 className="v3-card__title">{t("admin.territories.addNeighbour")}</h2>
          </header>
          <div className="v3-form">
            <div className="v3-field">
              <label htmlFor="neighbour-a">{t("admin.territories.neighbourA")}</label>
              <select
                id="neighbour-a"
                value={neighbourA}
                onChange={(event) => setNeighbourA(event.target.value)}
              >
                <option value="">—</option>
                {sorted.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.nom[lang]}
                  </option>
                ))}
              </select>
            </div>
            <div className="v3-field">
              <label htmlFor="neighbour-b">{t("admin.territories.neighbourB")}</label>
              <select
                id="neighbour-b"
                value={neighbourB}
                onChange={(event) => setNeighbourB(event.target.value)}
              >
                <option value="">—</option>
                {sorted.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.nom[lang]}
                  </option>
                ))}
              </select>
            </div>
            <div className="v3-form__actions">
              <button type="button" className="v3-btn v3-btn--primary" onClick={addPair}>
                {t("admin.territories.addAction")}
              </button>
            </div>
          </div>

          <hr className="v3-sep" style={{ margin: "18px 0" }} />

          <p className="v3-card__title">{t("admin.territories.pairs")}</p>
          {db.reference.voisinage.length === 0 ? (
            <p className="v3-empty">{t("admin.territories.empty")}</p>
          ) : (
            <ul className="v3-list">
              {db.reference.voisinage.map((pair, index) => (
                <li key={`${pair.territoireA}-${pair.territoireB}-${index}`} className="v3-list__item">
                  <span className="v3-list__title">
                    {territoryLabel(db, pair.territoireA, lang)}
                    {" ↔ "}
                    {territoryLabel(db, pair.territoireB, lang)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="v3-card">
        <header className="v3-card__head">
          <h2 className="v3-card__title">{t("admin.territories.title")}</h2>
          <span className="v3-badge">{db.reference.territories.length}</span>
        </header>
        {sorted.length === 0 ? (
          <p className="v3-empty">{t("admin.territories.empty")}</p>
        ) : (
          <div className="v3-table-wrap">
            <table className="v3-table">
              <thead>
                <tr>
                  <th>{t("admin.territories.code")}</th>
                  <th>{t("admin.territories.nameFr")}</th>
                  <th>{t("admin.territories.nameAr")}</th>
                  <th>{t("admin.territories.level")}</th>
                  <th>{t("admin.territories.parent")}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((territory) => (
                  <tr key={territory.id}>
                    <td className="v3-table__main">{territory.code}</td>
                    <td>{territory.nom.fr}</td>
                    <td>{territory.nom.ar}</td>
                    <td>{t(`admin.territories.level.${territory.niveau}`)}</td>
                    <td>{territory.parentId ? territoryLabel(db, territory.parentId, lang) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="v3-note">{candidates.length} · {t("admin.territories.neighbours")}</p>
    </main>
  );
}

import { useMemo, useState, type FormEvent } from "react";
import { useI18n } from "../../i18n";
import { useOrsecOps, type MainCouranteCategory } from "../../lib/orsecOps";
import { useOperator } from "../shared/ops/useOperator";
import OpsHero from "../shared/ops/OpsHero";
import "../shared/ops/ops.css";
import "./organisme.css";

const QUICK: { category: MainCouranteCategory; labelKey: string }[] = [
  { category: "operation", labelKey: "ops.mc.category.operation" },
  { category: "victime", labelKey: "ops.mc.category.victime" },
  { category: "moyen", labelKey: "ops.mc.category.moyen" },
  { category: "alerte", labelKey: "ops.mc.category.alerte" },
];

/** Mode terrain : saisie rapide, hors ligne et géolocalisée. */
export default function TerrainPage() {
  const { t, tc, lang } = useI18n();
  const operator = useOperator();
  const { entries, addEntry, pendingCount, syncPending, degraded } = useOrsecOps();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<MainCouranteCategory>("operation");
  const [offline, setOffline] = useState(false);
  const [gps, setGps] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const mine = useMemo(
    () =>
      entries.filter(
        (entry) => entry.scope === "terrain" && entry.authorName === operator.name,
      ),
    [entries, operator.name],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 4) return;
    const attachments = [
      ...(photo
        ? [{ id: `photo-${photo}`, name: photo, kind: "photo" as const }]
        : []),
      ...(audio
        ? [{ id: `audio-${audio}`, name: audio, kind: "audio" as const }]
        : []),
    ];
    addEntry({
      authorName: operator.name,
      assignmentId: operator.assignmentId,
      role: operator.roleLabel,
      scope: "terrain",
      category,
      message: message.trim(),
      coordinates: gps ? [36.7509, 5.0567] : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      offline: offline || degraded,
    });
    setMessage("");
    setPhoto(null);
    setAudio(null);
    setToast(
      offline || degraded
        ? t("ops.terrain.queued")
        : t("ops.terrain.saved"),
    );
  };

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.terrain.title")}
        title={t("ops.terrain.title")}
        lead={t("ops.terrain.lead")}
        chips={
          <>
            <span className={`ops-chip`}>
              <span
                className={`ops-banner__dot ops-banner__dot--${
                  offline || degraded ? "alert" : "normal"
                }`}
              />
              {offline || degraded
                ? t("ops.terrain.offline")
                : t("ops.terrain.online")}
            </span>
            <span className="ops-chip">
              {t("ops.terrain.gps")} · 36.7509, 5.0567
            </span>
            <span className="ops-chip">
              {operator.roleLabel} · {operator.assignmentId}
            </span>
            <span className="ops-chip">
              {t("ops.terrain.battery")} · 82%
            </span>
          </>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      {pendingCount > 0 ? (
        <p className="ops-error">
          {t("ops.banner.offline", { count: pendingCount })}{" "}
          <button
            type="button"
            className="ops-btn ops-btn--small"
            onClick={() => {
              const count = syncPending();
              setToast(t("ops.mc.syncedCount", { count }));
            }}
          >
            {t("ops.banner.sync")}
          </button>
        </p>
      ) : null}

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.terrain.quick")}</h2>
          <span className="ops-card__hint">
            {t("ops.common.count", { count: mine.length })}
          </span>
        </div>

        <div className="ops-btn-row">
          {QUICK.map((item) => (
            <button
              key={item.category}
              type="button"
              className={`ops-btn ops-btn--small${
                category === item.category ? " ops-btn--primary" : ""
              }`}
              onClick={() => setCategory(item.category)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        <form className="ops-form" onSubmit={submit}>
          <label className="ops-field">
            <span>{t("ops.terrain.quick")} *</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("ops.mc.placeholder")}
              minLength={4}
              required
              style={{ minHeight: 120 }}
            />
          </label>

          <div className="ops-form__row">
            <label className="ops-field">
              <span>{t("ops.terrain.photo")}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) =>
                  setPhoto(event.target.files?.[0]?.name ?? null)
                }
              />
            </label>
            <label className="ops-field">
              <span>{t("ops.terrain.audio")}</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(event) =>
                  setAudio(event.target.files?.[0]?.name ?? null)
                }
              />
            </label>
          </div>

          <div className="ops-inline">
            <label className="ops-muted">
              <input
                type="checkbox"
                checked={gps}
                onChange={(event) => setGps(event.target.checked)}
              />{" "}
              {t("ops.terrain.gps")}
            </label>
            <label className="ops-muted">
              <input
                type="checkbox"
                checked={offline}
                onChange={(event) => setOffline(event.target.checked)}
              />{" "}
              {t("ops.terrain.offline")}
            </label>
            {photo ? <span className="ops-badge ops-badge--info">📷 {photo}</span> : null}
            {audio ? <span className="ops-badge ops-badge--info">🎙 {audio}</span> : null}
          </div>

          <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="ops-btn ops-btn--primary"
              disabled={message.trim().length < 4}
            >
              {t("ops.terrain.send")}
            </button>
          </div>
        </form>
      </section>

      <section className="ops-card">
        <div className="ops-card__head">
          <h2 className="ops-card__title">{t("ops.terrain.myEntries")}</h2>
          <span className="ops-card__hint">
            {t("ops.terrain.offlineQueue")} · {pendingCount}
          </span>
        </div>

        {mine.length === 0 ? (
          <p className="ops-empty">{t("ops.terrain.empty")}</p>
        ) : (
          <div className="ops-mc">
            {mine.map((entry) => (
              <article
                key={entry.id}
                className={`ops-mc__item ops-mc__item--${entry.category}`}
              >
                <div className="ops-mc__top">
                  <span className="ops-mc__at">{entry.at}</span>
                  <span
                    className={`ops-badge ops-badge--${
                      entry.syncStatus === "local" ? "warn" : "ok"
                    }`}
                  >
                    {entry.syncStatus === "local"
                      ? t("ops.mc.local")
                      : t("ops.mc.synced")}
                  </span>
                </div>
                <p className="ops-mc__msg">{tc(entry.message)}</p>
                <div className="ops-mc__foot">
                  <span>{t(`ops.mc.category.${entry.category}`)}</span>
                  <span>{t(`ops.mc.scope.${entry.scope}`)}</span>
                  {entry.coordinates ? (
                    <span>GPS {entry.coordinates.join(", ")}</span>
                  ) : null}
                  {entry.attachments?.length ? (
                    <span>📎 {entry.attachments.map((item) => item.name).join(", ")}</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="ops-muted">
        {lang === "ar" ? t("ops.terrain.degradedHint") : t("ops.terrain.degradedHint")}
      </p>
    </main>
  );
}

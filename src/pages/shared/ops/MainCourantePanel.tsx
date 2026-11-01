import { useMemo, useState, type FormEvent } from "react";
import { useI18n } from "../../../i18n";
import {
  useOrsecOps,
  type MainCouranteCategory,
  type Scope,
} from "../../../lib/orsecOps";
import { useOperator } from "./useOperator";
import "./ops.css";

type Props = {
  scope?: Scope;
  sectorId?: string;
  title?: string;
  compact?: boolean;
  limit?: number;
  showConflicts?: boolean;
};

const CATEGORIES: MainCouranteCategory[] = [
  "alerte",
  "operation",
  "victime",
  "moyen",
  "decision",
  "communication",
  "rehabilitation",
];

const SCOPES: Scope[] = ["pcf", "pco", "sector", "module", "authority", "terrain"];

/** Main courante partagée : saisie, chaîne d'intégrité, hors ligne, conflits. */
export default function MainCourantePanel({
  scope,
  sectorId,
  title,
  compact = false,
  limit,
  showConflicts = false,
}: Props) {
  const { t, tc } = useI18n();
  const operator = useOperator();
  const {
    entries,
    conflicts,
    addEntry,
    addAmendment,
    syncPending,
    verifyChain,
    raiseConflict,
    resolveConflict,
    pendingCount,
  } = useOrsecOps();

  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<MainCouranteCategory>("operation");
  const [entryScope, setEntryScope] = useState<Scope>(scope ?? "pco");
  const [offline, setOffline] = useState(false);
  const [gps, setGps] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; name: string; kind: "photo" | "pdf" | "audio" }[]
  >([]);
  const [filter, setFilter] = useState<MainCouranteCategory | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [amendId, setAmendId] = useState<string | null>(null);
  const [amendText, setAmendText] = useState("");
  const [conflictFor, setConflictFor] = useState<string | null>(null);
  const [conflictText, setConflictText] = useState("");

  const visible = useMemo(() => {
    let list = entries;
    if (scope) list = list.filter((entry) => entry.scope === scope);
    if (sectorId) list = list.filter((entry) => entry.sectorId === sectorId);
    if (filter !== "all") list = list.filter((entry) => entry.category === filter);
    return limit ? list.slice(0, limit) : list;
  }, [entries, scope, sectorId, filter, limit]);

  const visibleConflicts = useMemo(
    () =>
      conflicts.filter(
        (conflict) =>
          conflict.status === "open" &&
          (!scope || entries.some((entry) => entry.id === conflict.entryId && entry.scope === scope)),
      ),
    [conflicts, entries, scope],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 4) return;
    addEntry({
      authorName: operator.name,
      assignmentId: operator.assignmentId,
      role: operator.roleLabel,
      scope: scope ?? entryScope,
      sectorId,
      category,
      message: message.trim(),
      coordinates: gps ? [36.7509, 5.0567] : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      offline,
    });
    setMessage("");
    setAttachments([]);
    setToast(offline ? t("ops.terrain.queued") : t("ops.mc.added"));
  };

  const submitAmendment = (event: FormEvent) => {
    event.preventDefault();
    if (!amendId || amendText.trim().length < 4) return;
    addAmendment(amendId, amendText.trim(), operator.name);
    setAmendId(null);
    setAmendText("");
    setToast(t("ops.mc.added"));
  };

  const submitConflict = (event: FormEvent) => {
    event.preventDefault();
    if (!conflictFor || conflictText.trim().length < 4) return;
    raiseConflict(conflictFor, conflictText.trim());
    setConflictFor(null);
    setConflictText("");
    setToast(t("ops.mc.raised"));
  };

  return (
    <section className="ops-card">
      <div className="ops-card__head">
        <h2 className="ops-card__title">{title ?? t("ops.mc.title")}</h2>
        <span className="ops-card__hint">
          {t("ops.common.count", { count: visible.length })}
          {pendingCount > 0 ? ` · ${t("ops.mc.pending")} ${pendingCount}` : ""}
        </span>
      </div>

      {!compact ? <p className="ops-card__lead">{t("ops.mc.lead")}</p> : null}

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      {showConflicts && visibleConflicts.length > 0 ? (
        <div className="ops-card ops-card--muted">
          <div className="ops-card__head">
            <h3 className="ops-card__title">{t("ops.mc.conflicts")}</h3>
            <span className="ops-badge ops-badge--warn">
              {t("ops.mc.conflictOpen")}
            </span>
          </div>
          <ul className="ops-list">
            {visibleConflicts.map((conflict) => (
              <li key={conflict.id} className="ops-list__item">
                <div className="ops-list__head">
                  <span className="ops-list__title">{t("ops.mc.conflict")}</span>
                  <span className="ops-badge ops-badge--danger">
                    {t("ops.mc.conflictOpen")}
                  </span>
                </div>
                <p className="ops-list__meta">
                  <strong>{t("ops.mc.conflictField")}</strong> · {tc(conflict.fieldMessage)}
                </p>
                <p className="ops-list__meta">
                  <strong>{t("ops.mc.conflictPcf")}</strong> · {tc(conflict.pcfMessage)}
                </p>
                <div className="ops-btn-row">
                  <button
                    type="button"
                    className="ops-btn ops-btn--small"
                    onClick={() => {
                      resolveConflict(conflict.id, "field");
                      setToast(t("ops.mc.resolved"));
                    }}
                  >
                    {t("ops.mc.conflictFieldWins")}
                  </button>
                  <button
                    type="button"
                    className="ops-btn ops-btn--small"
                    onClick={() => {
                      resolveConflict(conflict.id, "pcf");
                      setToast(t("ops.mc.resolved"));
                    }}
                  >
                    {t("ops.mc.conflictPcfWins")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="ops-form" onSubmit={submit}>
        <label className="ops-field">
          <span>{t("ops.mc.add")} *</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("ops.mc.placeholder")}
            minLength={4}
            required
          />
        </label>
        <div className="ops-form__row">
          <label className="ops-field">
            <span>{t("ops.mc.category")}</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as MainCouranteCategory)
              }
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {t(`ops.mc.category.${item}`)}
                </option>
              ))}
            </select>
          </label>
          {!scope ? (
            <label className="ops-field">
              <span>{t("ops.mc.scope")}</span>
              <select
                value={entryScope}
                onChange={(event) => setEntryScope(event.target.value as Scope)}
              >
                {SCOPES.map((item) => (
                  <option key={item} value={item}>
                    {t(`ops.mc.scope.${item}`)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="ops-field">
            <span>{t("ops.common.updated")}</span>
            <div className="ops-inline">
              <label className="ops-muted">
                <input
                  type="checkbox"
                  checked={offline}
                  onChange={(event) => setOffline(event.target.checked)}
                />{" "}
                {t("ops.mc.local")}
              </label>
              <label className="ops-muted">
                <input
                  type="checkbox"
                  checked={gps}
                  onChange={(event) => setGps(event.target.checked)}
                />{" "}
                {t("ops.mc.gps")}
              </label>
            </div>
          </label>
        </div>
        <label className="ops-field">
          <span>{t("ops.mc.attachments")}</span>
          <input
            type="file"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setAttachments(
                files.map((file) => ({
                  id: `${file.name}-${file.size}`,
                  name: file.name,
                  kind: file.type.startsWith("image/")
                    ? "photo"
                    : file.type.startsWith("audio/")
                      ? "audio"
                      : "pdf",
                })),
              );
            }}
          />
        </label>
        <div className="ops-btn-row" style={{ justifyContent: "space-between" }}>
          <div className="ops-btn-row">
            <button type="submit" className="ops-btn ops-btn--primary" disabled={message.trim().length < 4}>
              {t("ops.common.add")}
            </button>
            <button
              type="button"
              className="ops-btn"
              onClick={() => {
                const ok = verifyChain();
                setToast(ok ? t("ops.mc.chainOk") : t("ops.mc.chainBroken"));
              }}
            >
              {t("ops.mc.verify")}
            </button>
            {pendingCount > 0 ? (
              <button
                type="button"
                className="ops-btn"
                onClick={() => {
                  const count = syncPending();
                  setToast(t("ops.mc.syncedCount", { count }));
                }}
              >
                {t("ops.mc.sync")}
              </button>
            ) : null}
          </div>
          <select
            className="ops-btn"
            value={filter}
            aria-label={t("ops.common.filter")}
            onChange={(event) =>
              setFilter(event.target.value as MainCouranteCategory | "all")
            }
          >
            <option value="all">{t("ops.common.all")}</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {t(`ops.mc.category.${item}`)}
              </option>
            ))}
          </select>
        </div>
      </form>

      {visible.length === 0 ? (
        <p className="ops-empty">{t("ops.mc.empty")}</p>
      ) : (
        <div className="ops-mc">
          {visible.map((entry) => {
            const hasConflict = conflicts.some(
              (conflict) => conflict.entryId === entry.id,
            );
            return (
              <article
                key={entry.id}
                className={`ops-mc__item ops-mc__item--${entry.category}`}
              >
                <div className="ops-mc__top">
                  <span className="ops-mc__at">{entry.at}</span>
                  <span className={`ops-badge ops-badge--${entry.syncStatus === "local" ? "warn" : "ok"}`}>
                    {entry.syncStatus === "local" ? t("ops.mc.local") : t("ops.mc.synced")}
                  </span>
                </div>
                <p className="ops-mc__msg">{tc(entry.message)}</p>
                <div className="ops-mc__foot">
                  <span>{entry.authorName}</span>
                  <span>{entry.role}</span>
                  <span>{t(`ops.mc.scope.${entry.scope}`)}</span>
                  {entry.coordinates ? <span>GPS {entry.coordinates.join(", ")}</span> : null}
                  {entry.attachments?.length ? (
                    <span>
                      📎 {entry.attachments.map((item) => item.name).join(", ")}
                    </span>
                  ) : null}
                  <span className="ops-mc__hash">
                    {t("ops.mc.hash")} {entry.hash} ← {entry.prevHash}
                  </span>
                </div>
                {entry.amendmentOf ? (
                  <span className="ops-badge ops-badge--info">
                    {t("ops.mc.amendmentOf")}
                  </span>
                ) : null}
                {!hasConflict ? (
                  <div className="ops-btn-row">
                    <button
                      type="button"
                      className="ops-btn ops-btn--small"
                      onClick={() => {
                        setAmendId(entry.id);
                        setAmendText("");
                      }}
                    >
                      {t("ops.mc.amend")}
                    </button>
                    {showConflicts ? (
                      <button
                        type="button"
                        className="ops-btn ops-btn--small"
                        onClick={() => {
                          setConflictFor(entry.id);
                          setConflictText("");
                        }}
                      >
                        {t("ops.mc.conflictRaise")}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {amendId ? (
        <form className="ops-form" onSubmit={submitAmendment}>
          <label className="ops-field">
            <span>{t("ops.mc.amendment")}</span>
            <textarea
              value={amendText}
              onChange={(event) => setAmendText(event.target.value)}
              placeholder={t("ops.mc.amendmentPlaceholder")}
              minLength={4}
              required
            />
          </label>
          <div className="ops-btn-row">
            <button type="button" className="ops-btn" onClick={() => setAmendId(null)}>
              {t("ops.common.cancel")}
            </button>
            <button type="submit" className="ops-btn ops-btn--primary" disabled={amendText.trim().length < 4}>
              {t("ops.common.save")}
            </button>
          </div>
        </form>
      ) : null}

      {conflictFor ? (
        <form className="ops-form" onSubmit={submitConflict}>
          <label className="ops-field">
            <span>{t("ops.mc.newConflict")}</span>
            <textarea
              value={conflictText}
              onChange={(event) => setConflictText(event.target.value)}
              minLength={4}
              required
            />
          </label>
          <div className="ops-btn-row">
            <button type="button" className="ops-btn" onClick={() => setConflictFor(null)}>
              {t("ops.common.cancel")}
            </button>
            <button type="submit" className="ops-btn ops-btn--primary" disabled={conflictText.trim().length < 4}>
              {t("ops.common.send")}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

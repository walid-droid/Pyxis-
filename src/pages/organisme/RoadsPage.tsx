import "../shared/crisis/resp-crise.css";
import "./organisme.css";
import { useMemo, useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import { useI18n } from "../../i18n";
import { exportCsv } from "../../lib/exportData";
import { useNotifications } from "../../lib/notificationsContext";
import { useOrganisme } from "./orgContext";
import OrgHero from "./OrgHero";
import {
  ROAD_CLOSURES,
  loc,
  type RoadClosure,
} from "./organismeData";

type RoadFilter = "all" | "blocked" | "reopened";

type ClosureDraft = {
  name: string;
  kind: "road" | "bridge";
  reason: string;
  alternate: string;
};

const EMPTY_DRAFT: ClosureDraft = {
  name: "",
  kind: "road",
  reason: "",
  alternate: "",
};

function nowLabel(): string {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}/${now.getFullYear()} · ${String(now.getHours()).padStart(
    2,
    "0",
  )}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * Écran « Voirie » des forces de l'ordre et des agents de travaux publics :
 * barrages, routes coupées, déviations et confirmation de réouverture (RG14).
 */
export default function RoadsPage() {
  const { t, lang } = useI18n();
  const { persona } = useOrganisme();
  const { push } = useNotifications();

  const [roads, setRoads] = useState<RoadClosure[]>(ROAD_CLOSURES);
  const [filter, setFilter] = useState<RoadFilter>("all");
  const [reopening, setReopening] = useState<RoadClosure | null>(null);
  const [reopenNote, setReopenNote] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const [draft, setDraft] = useState<ClosureDraft>(EMPTY_DRAFT);
  const [toast, setToast] = useState<string | null>(null);

  const blocked = roads.filter((road) => road.status === "blocked").length;
  const reopened = roads.filter((road) => road.status === "reopened").length;

  const visible = useMemo(
    () => (filter === "all" ? roads : roads.filter((road) => road.status === filter)),
    [filter, roads],
  );

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  };

  const confirmReopen = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reopening) return;

    const confirmedBy = `${loc(lang, persona.name)} · ${loc(lang, persona.org)}`;
    setRoads((current) =>
      current.map((road) =>
        road.id === reopening.id
          ? {
              ...road,
              status: "reopened",
              updated: nowLabel(),
              confirmedBy,
            }
          : road,
      ),
    );
    push({
      kind: "system",
      titleKey: "notif.roadReopened.title",
      detailKey: "notif.roadReopened.detail",
    });
    flash(t("org.roads.reopenedToast"));
    setReopening(null);
    setReopenNote("");
    setPhotoAttached(false);
  };

  const declareClosure = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const road: RoadClosure = {
      id: `rc-${Date.now()}`,
      name: { fr: draft.name.trim(), ar: draft.name.trim() },
      kind: draft.kind,
      reason: { fr: draft.reason.trim(), ar: draft.reason.trim() },
      alternate: {
        fr: draft.alternate.trim() || "—",
        ar: draft.alternate.trim() || "—",
      },
      reportedBy: loc(lang, persona.org),
      updated: nowLabel(),
      status: "blocked",
    };
    setRoads((current) => [road, ...current]);
    push({
      kind: "alert",
      titleKey: "notif.roadBlocked.title",
      detailKey: "notif.roadBlocked.detail",
    });
    flash(t("org.roads.declaredToast"));
    setDeclaring(false);
    setDraft(EMPTY_DRAFT);
  };

  const exportRoads = () => {
    exportCsv(
      "voirie-cadm",
      visible.map((road) => ({
        reference: road.id,
        ouvrage: loc(lang, road.name),
        type: t(road.kind === "bridge" ? "org.watch.bridge" : "org.watch.road"),
        cause: loc(lang, road.reason),
        deviation: loc(lang, road.alternate),
        signale_par: road.reportedBy,
        statut: t(
          road.status === "blocked" ? "org.watch.blocked" : "org.watch.reopened",
        ),
        mis_a_jour: road.updated,
        confirme_par: road.confirmedBy ?? "",
      })),
    );
  };

  const reopenReady = reopenNote.trim().length >= 8 && photoAttached;

  return (
    <main className="rc-page rc-page--org">
      <OrgHero
        eyebrow={t("org.roads.eyebrow")}
        title={t("org.roads.title")}
        lead={t("org.roads.lead")}
        chips={
          <>
            <span className="rc-chip">
              <span className="rc-chip__dot rc-chip__dot--critical" />
              {t("org.roads.chip", { count: blocked })}
            </span>
            <span className="rc-chip">{t("org.roads.rule")}</span>
          </>
        }
        aside={
          <>
            <button
              type="button"
              className="rc-btn rc-btn--ghost"
              onClick={exportRoads}
            >
              {t("org.roads.export")}
            </button>
            <button
              type="button"
              className="rc-btn rc-btn--primary"
              onClick={() => setDeclaring(true)}
            >
              + {t("org.roads.declare")}
            </button>
          </>
        }
        stats={
          <section
            className="stat-grid"
            aria-label={t("org.roads.statsLabel")}
          >
            <StatCard
              value={String(blocked).padStart(2, "0")}
              label={t("org.roads.statBlocked")}
              badge={t("org.roads.statBlockedBadge")}
              badgeTone="danger"
            />
            <StatCard
              value={String(reopened).padStart(2, "0")}
              label={t("org.roads.statReopened")}
              badge={t("org.roads.statReopenedBadge")}
              badgeTone="success"
            />
            <StatCard
              value={String(roads.length).padStart(2, "0")}
              label={t("org.roads.statTotal")}
              badge={t("org.roads.statTotalBadge")}
              badgeTone="info"
            />
          </section>
        }
      />

      {toast ? (
        <p className="org-toast" role="status">
          {toast}
        </p>
      ) : null}

      <section className="rc-card">
        <div className="rc-card__head">
          <h2 className="rc-card__title">{t("org.roads.listTitle")}</h2>
          <div className="rc-tabs" role="group" aria-label={t("org.roads.listTitle")}>
            {(["all", "blocked", "reopened"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rc-tab${filter === value ? " is-active" : ""}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {t(`org.roads.filter.${value}`)}
              </button>
            ))}
          </div>
        </div>
        <p className="rc-card__lead">{t("org.roads.listLead")}</p>

        {visible.length === 0 ? (
          <p className="org-note">{t("org.roads.empty")}</p>
        ) : (
          <div className="rc-table-wrap">
            <table className="rc-table org-table">
              <thead>
                <tr>
                  <th>{t("org.watch.roadName")}</th>
                  <th>{t("org.common.type")}</th>
                  <th>{t("org.watch.reason")}</th>
                  <th>{t("org.evac.alternate")}</th>
                  <th>{t("org.watch.reportedBy")}</th>
                  <th>{t("org.common.status")}</th>
                  <th>{t("org.common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((road) => (
                  <tr key={road.id}>
                    <td>
                      <div className="org-cell">
                        <strong>{loc(lang, road.name)}</strong>
                        <span className="org-cell__meta">{road.updated}</span>
                      </div>
                    </td>
                    <td>
                      {t(
                        road.kind === "bridge"
                          ? "org.watch.bridge"
                          : "org.watch.road",
                      )}
                    </td>
                    <td>{loc(lang, road.reason)}</td>
                    <td>{loc(lang, road.alternate)}</td>
                    <td>{road.reportedBy}</td>
                    <td>
                      <span
                        className={`rc-badge rc-badge--${
                          road.status === "blocked" ? "critical" : "low"
                        }`}
                      >
                        {t(
                          road.status === "blocked"
                            ? "org.watch.blocked"
                            : "org.watch.reopened",
                        )}
                      </span>
                    </td>
                    <td>
                      {road.status === "blocked" ? (
                        <button
                          type="button"
                          className="rc-btn rc-btn--primary rc-btn--small"
                          onClick={() => setReopening(road)}
                        >
                          {t("org.watch.reopen")}
                        </button>
                      ) : (
                        <span className="org-inline-ok">
                          {road.confirmedBy ?? t("org.watch.reopened")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rc-card__foot">
          <p className="org-note">{t("org.roads.note")}</p>
        </div>
      </section>

      {reopening ? (
        <Modal
          title={t("org.roads.reopenTitle")}
          onClose={() => setReopening(null)}
        >
          <form className="rc-form" onSubmit={confirmReopen}>
            <p className="org-muted">{t("org.roads.reopenLead")}</p>
            <p className="org-reopen-summary">
              <strong>{loc(lang, reopening.name)}</strong>
              <span>{t("org.roads.reopenClock", { time: nowLabel() })}</span>
            </p>
            <div className="rc-field">
              <label htmlFor="reopen-note">
                {t("org.roads.reopenField")} *
              </label>
              <textarea
                id="reopen-note"
                value={reopenNote}
                placeholder={t("org.roads.reopenPlaceholder")}
                onChange={(event) => setReopenNote(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <label className="rc-check">
              <input
                type="checkbox"
                checked={photoAttached}
                onChange={(event) => setPhotoAttached(event.target.checked)}
              />
              {t("org.roads.reopenPhoto")}
            </label>
            <p className="org-note">{t("org.roads.reopenRequired")}</p>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setReopening(null)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={!reopenReady}
              >
                {t("org.roads.reopenConfirm")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {declaring ? (
        <Modal
          title={t("org.roads.declareTitle")}
          onClose={() => setDeclaring(false)}
        >
          <form className="rc-form" onSubmit={declareClosure}>
            <p className="org-muted">{t("org.roads.declareLead")}</p>
            <div className="rc-field">
              <label htmlFor="closure-name">{t("org.watch.roadName")} *</label>
              <input
                id="closure-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                required
                minLength={4}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="closure-kind">{t("org.common.type")}</label>
              <select
                id="closure-kind"
                className="org-select"
                value={draft.kind}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    kind: event.target.value as ClosureDraft["kind"],
                  }))
                }
              >
                <option value="road">{t("org.watch.road")}</option>
                <option value="bridge">{t("org.watch.bridge")}</option>
              </select>
            </div>
            <div className="rc-field">
              <label htmlFor="closure-reason">{t("org.watch.reason")} *</label>
              <input
                id="closure-reason"
                value={draft.reason}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, reason: event.target.value }))
                }
                required
                minLength={4}
              />
            </div>
            <div className="rc-field">
              <label htmlFor="closure-alternate">{t("org.evac.alternate")}</label>
              <input
                id="closure-alternate"
                value={draft.alternate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    alternate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="org-modal-actions">
              <button
                type="button"
                className="rc-btn rc-btn--ghost"
                onClick={() => setDeclaring(false)}
              >
                {t("org.common.cancel")}
              </button>
              <button
                type="submit"
                className="rc-btn rc-btn--primary"
                disabled={
                  draft.name.trim().length < 4 || draft.reason.trim().length < 4
                }
              >
                {t("org.roads.declareSubmit")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

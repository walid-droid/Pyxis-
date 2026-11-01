import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import Modal from "../../components/Modal";
import { PUBLIC_INFO_PATH } from "../../config";
import { useI18n } from "../../i18n";
import {
  useOrsecOps,
  type PublicMessage,
  type Rumor,
} from "../../lib/orsecOps";
import OpsHero from "../shared/ops/OpsHero";
import "./authority.css";

const CHANNELS: PublicMessage["channel"][] = ["all", "push", "sms", "public"];

export default function PublicCommunicationPage() {
  const { t, lang, tc } = useI18n();
  const {
    messages,
    publishMessage,
    scheduleMessage,
    createMessage,
    rumors,
    resolveRumor,
  } = useOrsecOps();
  const [tab, setTab] = useState<"messages" | "rumors">("messages");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [zone, setZone] = useState("");
  const [channel, setChannel] = useState<PublicMessage["channel"]>("all");
  const [rumorAction, setRumorAction] = useState<{
    id: string;
    status: Rumor["status"];
  } | null>(null);
  const [response, setResponse] = useState("");

  const stats = useMemo(
    () => ({
      published: messages.filter((message) => message.status === "published").length,
      reach: messages.reduce((total, message) => total + message.reach, 0),
      acks: messages.reduce((total, message) => total + message.acknowledgements, 0),
      openRumors: rumors.filter((rumor) => rumor.status === "checking").length,
    }),
    [messages, rumors],
  );

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 4 || body.trim().length < 12) return;
    createMessage({
      title: { fr: title, ar: title },
      body: { fr: body, ar: body },
      zone: { fr: zone || "Wilaya de Béjaïa", ar: zone || "ولاية بجاية" },
      channel,
    });
    setModal(false);
    setTitle("");
    setBody("");
    setZone("");
    setToast(t("ops.comm.created"));
  };

  return (
    <main className="ops-page">
      <OpsHero
        eyebrow={t("ops.comm.title")}
        title={t("ops.comm.title")}
        lead={t("ops.comm.lead")}
        chips={
          <>
            <span className="ops-chip">
              {t("ops.comm.reach")} · {stats.reach.toLocaleString("fr-FR")}
            </span>
            <span className="ops-chip">
              {t("ops.comm.acks")} · {stats.acks.toLocaleString("fr-FR")}
            </span>
            <span className="ops-chip">
              {t("ops.comm.rumors")} · {stats.openRumors}
            </span>
          </>
        }
        actions={
          <>
            <Link className="ops-btn" to={PUBLIC_INFO_PATH} target="_blank">
              {t("ops.comm.openPortal")}
            </Link>
            <button
              type="button"
              className="ops-btn ops-btn--primary"
              onClick={() => setModal(true)}
            >
              {t("ops.comm.new")}
            </button>
          </>
        }
      />

      {toast ? (
        <p className="ops-toast" role="status">
          {toast}
        </p>
      ) : null}

      <nav className="ops-tabs" aria-label={t("ops.comm.title")}>
        <button
          type="button"
          className={`ops-tab${tab === "messages" ? " is-active" : ""}`}
          onClick={() => setTab("messages")}
        >
          {t("ops.comm.messages")}
        </button>
        <button
          type="button"
          className={`ops-tab${tab === "rumors" ? " is-active" : ""}`}
          onClick={() => setTab("rumors")}
        >
          {t("ops.comm.rumors")} · {rumors.length}
        </button>
      </nav>

      {tab === "messages" ? (
        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.comm.messages")}</h2>
            <span className="ops-card__hint">{t("ops.comm.publishHint")}</span>
          </div>
          {messages.length === 0 ? (
            <p className="ops-empty">{t("ops.comm.empty")}</p>
          ) : (
            <ul className="ops-list">
              {messages.map((message) => (
                <li key={message.id} className="ops-list__item">
                  <div className="ops-list__head">
                    <span className="ops-list__title">{tc(message.title[lang])}</span>
                    <span
                      className={`ops-badge ops-badge--${
                        message.status === "published"
                          ? "ok"
                          : message.status === "scheduled"
                            ? "warn"
                            : "muted"
                      }`}
                    >
                      {t(`ops.comm.${message.status}`)}
                    </span>
                  </div>
                  <p className="ops-list__body">{tc(message.body[lang])}</p>
                  <div className="ops-mc__foot">
                    <span>
                      {t("ops.comm.zoneField")} · {tc(message.zone[lang])}
                    </span>
                    <span>
                      {t("ops.comm.channelField")} · {t(`ops.comm.channel.${message.channel}`)}
                    </span>
                    <span>
                      {t("ops.comm.reach")} · {message.reach.toLocaleString("fr-FR")}
                    </span>
                    {message.publishedAt ? <span>{message.publishedAt}</span> : null}
                  </div>
                  {message.status !== "published" ? (
                    <div className="ops-btn-row">
                      <button
                        type="button"
                        className="ops-btn ops-btn--small ops-btn--primary"
                        onClick={() => {
                          publishMessage(message.id);
                          setToast(t("ops.comm.published"));
                        }}
                      >
                        {t("ops.comm.publish")}
                      </button>
                      {message.status === "draft" ? (
                        <button
                          type="button"
                          className="ops-btn ops-btn--small"
                          onClick={() => {
                            scheduleMessage(message.id);
                            setToast(t("ops.comm.scheduled"));
                          }}
                        >
                          {t("ops.comm.schedule")}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="ops-card">
          <div className="ops-card__head">
            <h2 className="ops-card__title">{t("ops.comm.rumors")}</h2>
            <span className="ops-card__hint">{t("ops.comm.lead")}</span>
          </div>
          <ul className="ops-list">
            {rumors.map((rumor) => (
              <li key={rumor.id} className="ops-list__item">
                <div className="ops-list__head">
                  <span className="ops-list__title">{tc(rumor.claim[lang])}</span>
                  <span
                    className={`ops-badge ops-badge--${
                      rumor.status === "denied"
                        ? "ok"
                        : rumor.status === "confirmed"
                          ? "danger"
                          : "warn"
                    }`}
                  >
                    {t(`ops.comm.rumor.${rumor.status}`)}
                  </span>
                </div>
                <p className="ops-list__meta">
                  {t("ops.comm.rumorSource")} · {rumor.source} · {rumor.at}
                </p>
                {rumor.response ? (
                  <p className="ops-list__body">
                    <strong>{t("ops.comm.rumorResponse")} · </strong>
                    {tc(rumor.response[lang])}
                  </p>
                ) : null}
                <div className="ops-btn-row">
                  <button
                    type="button"
                    className="ops-btn ops-btn--small"
                    onClick={() => {
                      setRumorAction({ id: rumor.id, status: "denied" });
                      setResponse("");
                    }}
                  >
                    {t("ops.comm.rumor.denied")}
                  </button>
                  <button
                    type="button"
                    className="ops-btn ops-btn--small"
                    onClick={() => {
                      setRumorAction({ id: rumor.id, status: "confirmed" });
                      setResponse("");
                    }}
                  >
                    {t("ops.comm.rumor.confirmed")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {modal ? (
        <Modal title={t("ops.comm.new")} onClose={() => setModal(false)}>
          <form className="ops-form" onSubmit={create}>
            <label className="ops-field">
              <span>{t("ops.comm.titleField")} *</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={4}
                required
              />
            </label>
            <label className="ops-field">
              <span>{t("ops.comm.bodyField")} *</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                minLength={12}
                required
              />
            </label>
            <div className="ops-form__row">
              <label className="ops-field">
                <span>{t("ops.comm.zoneField")}</span>
                <input value={zone} onChange={(event) => setZone(event.target.value)} />
              </label>
              <label className="ops-field">
                <span>{t("ops.comm.channelField")}</span>
                <select
                  value={channel}
                  onChange={(event) =>
                    setChannel(event.target.value as PublicMessage["channel"])
                  }
                >
                  {CHANNELS.map((item) => (
                    <option key={item} value={item}>
                      {t(`ops.comm.channel.${item}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setModal(false)}>
                {t("ops.common.cancel")}
              </button>
              <button type="submit" className="ops-btn ops-btn--primary">
                {t("ops.comm.create")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {rumorAction ? (
        <Modal title={t("ops.comm.resolve")} onClose={() => setRumorAction(null)}>
          <form
            className="ops-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (response.trim().length < 8) return;
              resolveRumor(rumorAction.id, rumorAction.status, response.trim());
              setRumorAction(null);
              setResponse("");
              setToast(t("ops.comm.resolved"));
            }}
          >
            <label className="ops-field">
              <span>{t("ops.comm.rumorResponse")} *</span>
              <textarea
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                minLength={8}
                required
              />
            </label>
            <div className="ops-btn-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="ops-btn" onClick={() => setRumorAction(null)}>
                {t("ops.common.cancel")}
              </button>
              <button
                type="submit"
                className="ops-btn ops-btn--primary"
                disabled={response.trim().length < 8}
              >
                {t("ops.common.save")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

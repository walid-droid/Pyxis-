import { useEffect, useRef, useState } from "react";
import logo from "../../assets/Logo CADM.png";
import { useI18n } from "../../i18n";
import "./AssistantPage.css";

type Message = { role: "assistant" | "user"; text: string };

// TODO : branchez ici votre API IA. Cette fonction doit renvoyer le texte de la réponse.
// Tant qu'elle lève une erreur, le chat affiche le message d'erreur ci-dessous.
async function askAssistant(_question: string): Promise<string> {
  throw new Error("Assistant IA non connecté");
}

type AssistantPageProps = {
  /** Ferme l'assistant lorsqu'il est affiché dans une fenêtre modale. */
  onClose?: () => void;
};

export default function AssistantPage({ onClose }: AssistantPageProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Numéro de la requête en cours : une réponse qui n'est plus la dernière est ignorée.
  const requestRef = useRef(0);

  // Si on quitte la page, la réponse en attente est ignorée.
  useEffect(
    () => () => {
      requestRef.current += 1;
    },
    []
  );

  // Garde le dernier message visible : seule la zone de messages défile.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, loading]);

  // Le champ de saisie grandit avec le texte (jusqu'à 160 px, puis il défile).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [question]);

  async function sendMessage() {
    const value = question.trim();
    if (!value || loading) return;
    const id = ++requestRef.current;
    setMessages((prev) => [...prev, { role: "user", text: value }]);
    setQuestion("");
    setLoading(true);

    let answer: string;
    try {
      answer = await askAssistant(value);
    } catch {
      answer = t("assistant.error");
    }

    // Nouvelle conversation ou page quittée pendant l'attente : on n'affiche rien.
    if (id !== requestRef.current) return;
    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    setLoading(false);
  }

  function startNewChat() {
    requestRef.current += 1; // ignore la réponse encore en attente
    setMessages([]);
    setQuestion("");
    setLoading(false);
  }

  return (
    <main className={`assistant-page${onClose ? " assistant-page--popup" : ""}`}>
      <aside className="assistant-sidebar">
        <div className="assistant-side-title">
          <img className="assistant-logo" src={logo} alt="" />
          <div>
            <strong>CADM-AI</strong>
            <small>{t("assistant.crisis")}</small>
          </div>
        </div>
        <button type="button" className="assistant-new-chat" onClick={startNewChat}>
          <span aria-hidden="true">＋</span> {t("assistant.newChat")}
        </button>
        <div className="assistant-sidebar-label">{t("assistant.yourAssistant")}</div>
        <div className="assistant-sidebar-note">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>{t("assistant.safetyTips")}</strong>
            <p>{t("assistant.safetyTipsText")}</p>
          </div>
        </div>
        <div className="assistant-sidebar-bottom">
          <span className="assistant-status-dot" aria-hidden="true" /> {t("assistant.demo")}
        </div>
      </aside>

      <section className="assistant-main">
        <div className="assistant-topbar">
          <div className="assistant-mobile-brand">
            <img className="assistant-logo" src={logo} alt="" /> CADM-AI
          </div>
          <span className="assistant-topbar-title">{t("nav.assistant")}</span>
          <div className="assistant-topbar-actions">
            {messages.length > 0 && (
              <button type="button" className="assistant-mobile-new" onClick={startNewChat}>
                <span aria-hidden="true">＋</span> {t("assistant.new")}
              </button>
            )}
            <div className="assistant-online">
              <span aria-hidden="true" /> {t("assistant.online")}
            </div>
            {onClose && (
              <button
                type="button"
                className="assistant-close"
                onClick={onClose}
                aria-label={t("common.close")}
                title={t("common.close")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Zone qui défile : accueil ou conversation */}
        <div className="assistant-scroll" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <div className="assistant-orb" aria-hidden="true"><span>✳</span></div>
              <div className="assistant-eyebrow">{t("assistant.preventEyebrow")}</div>
              <h1>{t("assistant.hello")}<br /><em>{t("assistant.help")}</em></h1>
              <p className="assistant-intro">{t("assistant.intro")}</p>
            </div>
          ) : (
            <div className="assistant-chat" role="log" aria-live="polite" aria-label={t("assistant.conversationAria")}>
              <div className="assistant-chat-heading">
                <span className="assistant-mini-orb" aria-hidden="true">✳</span>
                <div>
                  <strong>{t("assistant.yourConversation")}</strong>
                  <small>{t("assistant.conversationSub")}</small>
                </div>
              </div>
              {messages.map((message, index) => (
                <div className={`assistant-message-row ${message.role}`} key={`${index}-${message.role}`}>
                  {message.role === "assistant" && <span className="assistant-avatar" aria-hidden="true">✳</span>}
                  <div className="assistant-message">
                    <div className="assistant-message-author">{message.role === "user" ? t("assistant.you") : t("assistant.bot")}</div>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="assistant-message-row assistant">
                  <span className="assistant-avatar" aria-hidden="true">✳</span>
                  <div className="assistant-message assistant-typing" role="status">
                    <span className="assistant-dots" aria-hidden="true"><i /><i /><i /></span>
                    {t("assistant.typing")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Saisie : toujours visible en bas, hors de la zone qui défile */}
        <div className="assistant-composer-area">
          <div className="assistant-composer-wrap">
            <form
              className="assistant-composer"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
                textareaRef.current?.focus();
              }}
            >
              <textarea
                ref={textareaRef}
                value={question}
                rows={1}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={t("assistant.placeholder")}
                aria-label={t("assistant.questionAria")}
              />
              <button
                type="submit"
                className="assistant-send"
                disabled={!question.trim() || loading}
                aria-label={t("assistant.sendAria")}
              >
                <span className="assistant-send-label">{t("assistant.send")}</span>
                <span className="assistant-send-icon" aria-hidden="true">↑</span>
              </button>
            </form>
            <p className="assistant-disclaimer">
              {t("assistant.disclaimer")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
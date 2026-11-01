import { useEffect, useRef, useState } from "react";
import logo from "../../assets/Logo CADM.png";
import { useI18n } from "../../i18n";
import "./AssistantPage.css";

type Message = {
  role: "assistant" | "user";
  text: string;
  sources?: string[];
};

type Translate = (key: string, vars?: Record<string, string | number>) => string;

type Topic = {
  keywords: string[];
  answerKey: string;
  sourceKeys: string[];
};

/**
 * Base de connaissances locale de démonstration : aucune requête réseau.
 * L'assistant cite ses sources et ne prend jamais de décision (RG09).
 */
const TOPICS: Topic[] = [
  {
    keywords: [
      "crue", "inondation", "oued", "seuil", "vigilance",
      "فيضان", "وادي", "سومام", "مستوى", "يقظة",
    ],
    answerKey: "assistant.answer.flood",
    sourceKeys: ["assistant.source.bf26", "assistant.source.rg13"],
  },
  {
    keywords: [
      "renfort", "appui", "moyens", "unité", "unite",
      "تعزيز", "دعم", "وسائل", "وحدة",
    ],
    answerKey: "assistant.answer.reinforcement",
    sourceKeys: ["assistant.source.procedure", "assistant.source.rg04"],
  },
  {
    keywords: [
      "victime", "médical", "medical", "santé", "sante", "triage",
      "ضحايا", "طبي", "صحة", "إسعاف", "فرز",
    ],
    answerKey: "assistant.answer.medical",
    sourceKeys: ["assistant.source.bf10", "assistant.source.rg05"],
  },
  {
    keywords: [
      "évacuation", "evacuation", "centre", "accueil", "capacité", "capacite",
      "إجلاء", "استقبال", "مركز", "طاقة", "إشغال",
    ],
    answerKey: "assistant.answer.evacuation",
    sourceKeys: ["assistant.source.bf11", "assistant.source.rg10"],
  },
  {
    keywords: [
      "route", "pont", "circulation", "réouverture", "reouverture",
      "طريق", "جسر", "مرور", "إعادة الفتح",
    ],
    answerKey: "assistant.answer.road",
    sourceKeys: ["assistant.source.bf29", "assistant.source.rg14"],
  },
  {
    keywords: [
      "plan", "orséc", "orsec", "module", "phase", "activation",
      "خطة", "أورسيك", "مرحلة", "تفعيل",
    ],
    answerKey: "assistant.answer.plan",
    sourceKeys: ["assistant.source.decree", "assistant.source.bf17"],
  },
  {
    keywords: [
      "alerte", "diffusion", "population", "autorité", "autorite",
      "إنذار", "بث", "سكان", "سلطة",
    ],
    answerKey: "assistant.answer.alert",
    sourceKeys: ["assistant.source.rg13", "assistant.source.rg09"],
  },
];

async function askAssistant(
  question: string,
  t: Translate,
): Promise<{ text: string; sources: string[] }> {
  const normalized = question.toLowerCase();
  const topic = TOPICS.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (!topic) {
    return {
      text: t("assistant.answer.generic"),
      sources: [t("assistant.source.local")],
    };
  }

  return {
    text: t(topic.answerKey),
    sources: topic.sourceKeys.map((key) => t(key)),
  };
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

    let answer: { text: string; sources: string[] };
    try {
      answer = await askAssistant(value, t);
    } catch {
      answer = { text: t("assistant.error"), sources: [] };
    }

    // Nouvelle conversation ou page quittée pendant l'attente : on n'affiche rien.
    if (id !== requestRef.current) return;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: answer.text, sources: answer.sources },
    ]);
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
              <div className="assistant-eyebrow">{t("assistant.preventEyebrow")}</div>
              <h1>{t("assistant.hello")}<br /><em>{t("assistant.help")}</em></h1>
              <p className="assistant-intro">{t("assistant.intro")}</p>
            </div>
          ) : (
            <div className="assistant-chat" role="log" aria-live="polite" aria-label={t("assistant.conversationAria")}>
              <div className="assistant-chat-heading">
                <div>
                  <strong>{t("assistant.yourConversation")}</strong>
                  <small>{t("assistant.conversationSub")}</small>
                </div>
              </div>
              {messages.map((message, index) => (
                <div className={`assistant-message-row ${message.role}`} key={`${index}-${message.role}`}>
                  <div className="assistant-message">
                    <div className="assistant-message-author">{message.role === "user" ? t("assistant.you") : t("assistant.bot")}</div>
                    <p>{message.text}</p>
                    {message.sources && message.sources.length > 0 ? (
                      <div className="assistant-sources">
                        <strong>{t("assistant.sources")}</strong>
                        <ul>
                          {message.sources.map((source) => (
                            <li key={source}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="assistant-message-row assistant">
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
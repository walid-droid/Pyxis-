import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo SafeDZ.png";
import "./AssistantPage.css";

type Message = { role: "assistant" | "user"; text: string };

// TODO : branchez ici votre API IA. Cette fonction doit renvoyer le texte de la réponse.
// Tant qu'elle lève une erreur, le chat affiche le message d'erreur ci-dessous.
async function askAssistant(_question: string): Promise<string> {
  throw new Error("Assistant IA non connecté");
}

const ERROR_ANSWER =
  "Désolé, je n’ai pas pu répondre pour le moment. En cas de danger immédiat, contactez directement les services de secours.";

export default function AssistantPage() {
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
      answer = ERROR_ANSWER;
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
    <main className="assistant-page">
      <aside className="assistant-sidebar">
        <div className="assistant-side-title">
          <img className="assistant-logo" src={logo} alt="" />
          <div>
            <strong>SafeAI</strong>
            <small>Assistant de crise</small>
          </div>
        </div>
        <button type="button" className="assistant-new-chat" onClick={startNewChat}>
          <span aria-hidden="true">＋</span> Nouvelle conversation
        </button>
        <div className="assistant-sidebar-label">VOTRE ASSISTANT</div>
        <div className="assistant-sidebar-note">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>Conseils de sécurité</strong>
            <p>Des informations pratiques pour mieux réagir face aux situations d’urgence.</p>
          </div>
        </div>
        <div className="assistant-sidebar-bottom">
          <span className="assistant-status-dot" aria-hidden="true" /> Assistant disponible en mode démo
        </div>
      </aside>

      <section className="assistant-main">
        <div className="assistant-topbar">
          <div className="assistant-mobile-brand">
            <img className="assistant-logo" src={logo} alt="" /> SafeDZ
          </div>
          <div className="assistant-topbar-actions">
            {messages.length > 0 && (
              <button type="button" className="assistant-mobile-new" onClick={startNewChat}>
                <span aria-hidden="true">＋</span> Nouvelle
              </button>
            )}
            <div className="assistant-online">
              <span aria-hidden="true" /> En ligne
            </div>
          </div>
        </div>

        {/* Zone qui défile : accueil ou conversation */}
        <div className="assistant-scroll" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <div className="assistant-orb" aria-hidden="true"><span>✳</span></div>
              <div className="assistant-eyebrow">VOTRE ASSISTANT DE PRÉVENTION</div>
              <h1>Comment puis-je<br /><em>vous aider ?</em></h1>
              <p className="assistant-intro">
                Obtenez des conseils pratiques pour vous préparer aux crises et savoir comment réagir en toute sécurité.
              </p>
            </div>
          ) : (
            <div className="assistant-chat" role="log" aria-live="polite" aria-label="Conversation">
              <div className="assistant-chat-heading">
                <span className="assistant-mini-orb" aria-hidden="true">✳</span>
                <div>
                  <strong>Votre conversation</strong>
                  <small>Conseils de prévention et de sécurité</small>
                </div>
              </div>
              {messages.map((message, index) => (
                <div className={`assistant-message-row ${message.role}`} key={`${index}-${message.role}`}>
                  {message.role === "assistant" && <span className="assistant-avatar" aria-hidden="true">✳</span>}
                  <div className="assistant-message">
                    <div className="assistant-message-author">{message.role === "user" ? "Vous" : "SafeDZ · Assistant IA"}</div>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="assistant-message-row assistant">
                  <span className="assistant-avatar" aria-hidden="true">✳</span>
                  <div className="assistant-message assistant-typing" role="status">
                    <span className="assistant-dots" aria-hidden="true"><i /><i /><i /></span>
                    Préparation de la réponse…
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
                placeholder="Posez votre question…"
                aria-label="Votre question"
              />
              <button
                type="submit"
                className="assistant-send"
                disabled={!question.trim() || loading}
                aria-label="Envoyer le message"
              >
                <span className="assistant-send-label">Envoyer</span>
                <span className="assistant-send-icon" aria-hidden="true">↑</span>
              </button>
            </form>
            <p className="assistant-disclaimer">
              Les réponses sont informatives et ne remplacent pas les consignes officielles des autorités.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
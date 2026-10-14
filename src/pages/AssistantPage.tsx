import { useState } from "react";
import "./AssistantPage.css";

type Message = { role: "assistant" | "user"; text: string };

const suggestions = [
  { icon: "🌊", title: "Inondation", text: "Que faire en cas d’inondation ?" },
  { icon: "🔥", title: "Incendie", text: "Quels sont les gestes en cas d’incendie ?" },
  { icon: "🌍", title: "Séisme", text: "Que faire pendant un tremblement de terre ?" },
  { icon: "🩹", title: "Premiers secours", text: "Quels sont les premiers gestes de secours ?" },
];

function getLocalAnswer(question: string) {
  const q = question.toLowerCase();
  if (q.includes("incend") || q.includes("feu")) {
    return "En cas d’incendie :\\n1. Éloignez-vous de la fumée et évacuez par les sorties sûres.\\n2. N’utilisez pas l’ascenseur.\\n3. Fermez les portes derrière vous si possible, sans vous mettre en danger.\\n4. Une fois à l’extérieur, éloignez-vous du bâtiment et appelez les services de secours locaux.\\n\\nSi le feu bloque votre sortie, restez dans une pièce protégée, fermez la porte et signalez votre présence.";
  }
  if (q.includes("inond") || q.includes("eau")) {
    return "En cas d’inondation :\\n1. Rejoignez un endroit élevé et suivez les consignes officielles.\\n2. Ne traversez jamais une route ou un cours d’eau inondé, à pied ou en voiture.\\n3. Éloignez-vous des installations électriques et ne touchez pas un appareil mouillé.\\n4. Préparez vos médicaments, documents essentiels et téléphone si une évacuation est demandée.\\n\\nSuivez les alertes des autorités locales : les conditions peuvent évoluer rapidement.";
  }
  if (q.includes("séisme") || q.includes("seisme") || q.includes("tremblement")) {
    return "Pendant un séisme :\\n1. Baissez-vous, protégez votre tête et votre cou, puis abritez-vous sous un meuble solide si possible.\\n2. Éloignez-vous des fenêtres et des objets qui peuvent tomber.\\n3. Restez à l’intérieur jusqu’à la fin des secousses ; n’utilisez pas l’ascenseur.\\n4. À l’extérieur, éloignez-vous des bâtiments, murs et lignes électriques.\\n\\nAprès les secousses, attendez-vous à des répliques et suivez les consignes officielles.";
  }
  if (q.includes("secour") || q.includes("bless") || q.includes("saign")) {
    return "Pour aider une personne :\\n1. Vérifiez que la zone est sûre avant de vous approcher.\\n2. Appelez les services de secours locaux si la situation est grave.\\n3. Si la personne saigne abondamment, exercez une pression ferme et continue sur la plaie avec un tissu propre, si possible.\\n4. Ne déplacez pas une personne suspectée d’avoir une blessure à la tête, au cou ou au dos, sauf danger immédiat.\\n\\nNe réalisez que les gestes que vous connaissez et suivez les instructions des secours.";
  }
  return "Je peux vous aider avec des conseils généraux de préparation et de sécurité en cas de crise. Précisez le type de situation (inondation, incendie, séisme, blessure…) et indiquez si le danger est immédiat.\\n\\nEn cas de danger immédiat, mettez-vous en sécurité et contactez directement les services de secours locaux. Je ne remplace pas les autorités ni les professionnels de secours.";
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  function sendMessage(text = question) {
    const value = text.trim();
    if (!value || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: value }]);
    setQuestion("");
    setLoading(true);
    // Démo locale : remplacez getLocalAnswer par votre API IA lorsque le backend sera prêt.
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: getLocalAnswer(value) }]);
      setLoading(false);
    }, 350);
  }

  function startNewChat() {
    setMessages([]);
    setQuestion("");
  }

  return (
    <main className="assistant-page">
      <aside className="assistant-sidebar">
        <div className="assistant-side-title"><span className="assistant-logo">✳</span><div><strong>SafeAI</strong><small>Assistant de crise</small></div></div>
        <button className="assistant-new-chat" onClick={startNewChat}><span>＋</span> Nouvelle conversation</button>
        <div className="assistant-sidebar-label">VOTRE ASSISTANT</div>
        <div className="assistant-sidebar-note"><span>✦</span><div><strong>Conseils de sécurité</strong><p>Des informations pratiques pour mieux réagir face aux situations d’urgence.</p></div></div>
        <div className="assistant-sidebar-bottom"><span className="assistant-status-dot" /> Assistant disponible en mode démo</div>
      </aside>

      <section className="assistant-main">
        <header className="assistant-topbar">
          <div className="assistant-mobile-brand"><span className="assistant-logo">✳</span> SafeeDZ</div>
          <div className="assistant-breadcrumb">Espace citoyen <span>/</span> <strong>Assistant IA</strong></div>
          <div className="assistant-online"><span /> En ligne</div>
        </header>

        <div className={`assistant-content ${messages.length ? "has-messages" : ""}`}>
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <div className="assistant-orb"><span>✳</span></div>
              <div className="assistant-eyebrow">VOTRE ASSISTANT DE PRÉVENTION</div>
              <h1>Comment puis-je<br /><em>vous aider ?</em></h1>
              <p className="assistant-intro">Obtenez des conseils pratiques pour vous préparer aux crises et savoir comment réagir en toute sécurité.</p>
              <div className="assistant-suggestions-title">PAR QUOI SOUHAITEZ-VOUS COMMENCER ?</div>
              <div className="assistant-suggestions">
                {suggestions.map((item) => (
                  <button className="assistant-suggestion" key={item.title} onClick={() => sendMessage(item.text)}>
                    <span className="assistant-suggestion-icon">{item.icon}</span><span className="assistant-suggestion-copy"><strong>{item.title}</strong><small>{item.text}</small></span><span className="assistant-suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="assistant-chat" aria-live="polite">
              <div className="assistant-chat-heading"><span className="assistant-mini-orb">✳</span><div><strong>Votre conversation</strong><small>Conseils de prévention et de sécurité</small></div></div>
              {messages.map((message, index) => (
                <div className={`assistant-message-row ${message.role}`} key={`${index}-${message.role}`}>
                  {message.role === "assistant" && <span className="assistant-avatar">✳</span>}
                  <div className="assistant-message"><div className="assistant-message-author">{message.role === "user" ? "Vous" : "SafeDZ · Assistant IA"}</div><p>{message.text}</p></div>
                </div>
              ))}
              {loading && <div className="assistant-message-row assistant"><span className="assistant-avatar">✳</span><div className="assistant-message assistant-typing">Préparation de la réponse…</div></div>}
            </div>
          )}
          <div className="assistant-composer-wrap">
            <form className="assistant-composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Posez votre question sur une situation de crise…" rows={2} aria-label="Votre question" />
              <div className="assistant-composer-footer"><span><span className="assistant-composer-spark">✦</span> Des conseils clairs pour mieux vous préparer</span><button type="submit" disabled={!question.trim() || loading} aria-label="Envoyer le message">Envoyer <span>↑</span></button></div>
            </form>
            <p className="assistant-disclaimer">Les réponses sont informatives et ne remplacent pas les consignes officielles des autorités.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

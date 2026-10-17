import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import FieldCanvas from "../FieldCanvas";
import { noop } from "../utils";

const TITLE = "Les bonnes informations, au bon moment.";

function shouldSkipVideo(reducedMotion) {
  const c = navigator.connection;
  return reducedMotion || !!(c && (c.saveData || /2g|3g/.test(c.effectiveType || "")));
}

export default function Hero({ reducedMotion }) {
  const [paused, setPaused] = useState(false);
  // "loading" -> "ready" quand la vidéo peut démarrer, "removed" si absente ou connexion lente
  const [video, setVideo] = useState(() => (shouldSkipVideo(reducedMotion) ? "removed" : "loading"));
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || video !== "ready") return;
    if (paused) {
      v.pause();
    } else {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    }
  }, [paused, video]);

  const ready = video === "ready";

  return (
    <section className={"hero" + (ready ? " hvid" : "")}>
      {video !== "removed" && (
        <video
          className="hv"
          id="hv"
          ref={videoRef}
          src={`${import.meta.env.BASE_URL}video.mp4`}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onCanPlay={() => setVideo((v) => (v === "loading" ? "ready" : v))}
          onError={() => setVideo("removed")}
        />
      )}
      <div className="scrim" />
      <FieldCanvas paused={paused} reducedMotion={reducedMotion} hidden={ready} />
      <button
        className="pz"
        id="pz"
        type="button"
        aria-pressed={paused}
        aria-label={paused ? "Relancer l'animation" : "Mettre l'animation en pause"}
        onClick={() => setPaused((p) => !p)}
      />
      <div className="wrap">
        <p className="eyebrow">Prévention et alertes en Algérie</p>
        <h1 aria-label={TITLE}>
          {TITLE.split(" ").map((w, i) => (
            <span className="w" key={i}>
              <i style={{ "--i": i }} aria-hidden="true">{w}</i>
            </span>
          ))}
        </h1>
        <p className="lead rv" style={{ "--d": ".9s" }}>
          Retrouvez les alertes, les consignes de sécurité et les informations utiles dans votre commune et votre wilaya.
        </p>
        <form className="search rv" style={{ "--d": "1.05s" }} onSubmit={noop} role="search">
          <input
            type="search"
            placeholder="Rechercher une commune ou une wilaya"
            aria-label="Rechercher une commune ou une wilaya"
          />
          <button type="submit">Rechercher</button>
        </form>
        <div>
          <a className="loc rv" style={{ "--d": "1.15s" }} href="#" onClick={noop}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8" />
              <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
            </svg>
            Utiliser ma position
          </a>
        </div>
        <div className="q3 rv" style={{ "--d": "1.3s" }}>
          <a href="#alerte">Que se passe-t-il ?</a>
          <a href="#risques">Suis-je concerné ?</a>
          <a href="#sit">Que dois-je faire ?</a>
        </div>
      </div>
      <div className="ems dark" id="signalement">
        <div className="wrap">
          <b>En cas de danger immédiat</b>
          <a className="n" href="tel:14">
            <small>Protection civile</small>
            <span className="num">14 <em>·</em> 1021</span>
          </a>
          <a className="n" href="tel:1055">
            <small>Gendarmerie nationale</small>
            <span className="num">1055</span>
          </a>
          <div className="sp" />
          <p className="note">
            Si vous autorisez la géolocalisation lors d'un signalement, votre position pourra y être jointe pour aider les services à localiser l'incident. Un signalement en ligne ne remplace pas l'appel aux secours.
          </p>
          <Link className="btn red" to="/submit-alert">Envoyer un signalement</Link>
        </div>
      </div>
    </section>
  );
}

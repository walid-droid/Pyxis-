import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import FieldCanvas from "../FieldCanvas";
import { useLandingCopy } from "../landingCopy";

function shouldSkipVideo(reducedMotion) {
  const c = navigator.connection;
  return reducedMotion || !!(c && (c.saveData || /2g|3g/.test(c.effectiveType || "")));
}

export default function Hero({ reducedMotion, onRequestSubmit }) {
  const navigate = useNavigate();
  const copy = useLandingCopy();
  const hero = copy.hero;
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [geo, setGeo] = useState("idle");
  // "loading" -> "ready" quand la vidéo peut démarrer, "removed" si absente ou connexion lente
  const [video, setVideo] = useState(() => (shouldSkipVideo(reducedMotion) ? "removed" : "loading"));
  const videoRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

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

  // La recherche de la landing est branchée sur la liste des alertes.
  const submitSearch = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/alerts?q=${encodeURIComponent(q)}` : "/alerts");
  };

  // La géolocalisation recentre les abris et postes de secours sur la position du visiteur.
  const locate = () => {
    if (!("geolocation" in navigator)) {
      navigate("/resources");
      return;
    }

    setGeo("locating");
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          if (!aliveRef.current) return;
          navigate(
            `/resources?lat=${coords.latitude.toFixed(5)}&lng=${coords.longitude.toFixed(5)}`,
          );
        },
        () => {
          if (!aliveRef.current) return;
          // Position refusée ou indisponible : on affiche le dispositif de démonstration.
          navigate("/resources");
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    } catch {
      if (aliveRef.current) navigate("/resources");
    }
  };

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
        aria-label={paused ? hero.play : hero.pause}
        onClick={() => setPaused((p) => !p)}
      />
      <div className="wrap">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 aria-label={hero.title}>
          {hero.title.split(" ").map((w, i) => (
            <span className="w" key={i}>
              <i style={{ "--i": i }} aria-hidden="true">{w}</i>
            </span>
          ))}
        </h1>
        <p className="lead rv" style={{ "--d": ".9s" }}>
          {hero.lead}
        </p>
        <form className="search rv" style={{ "--d": "1.05s" }} onSubmit={submitSearch} role="search">
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={hero.searchPlaceholder}
            aria-label={hero.searchPlaceholder}
          />
          <button type="submit">{hero.search}</button>
        </form>
        <div>
          <button
            className="loc rv"
            style={{ "--d": "1.15s" }}
            type="button"
            onClick={locate}
            disabled={geo === "locating"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8" />
              <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
            </svg>
            {geo === "locating" ? hero.locating : hero.locate}
          </button>
        </div>
        <div className="q3 rv" style={{ "--d": "1.3s" }}>
          {hero.quick.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <div className="ems dark" id="signalement">
        <div className="wrap">
          <b>{hero.emergency.title}</b>
          <a className="n" href="tel:14">
            <small>{hero.emergency.civil}</small>
            <span className="num">14 <em>·</em> 1021</span>
          </a>
          <a className="n" href="tel:1055">
            <small>{hero.emergency.gendarmerie}</small>
            <span className="num">1055</span>
          </a>
          <div className="sp" />
          <p className="note">{hero.emergency.note}</p>
          <Link className="btn red" to="/submit-alert" onClick={onRequestSubmit}>
            {hero.emergency.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

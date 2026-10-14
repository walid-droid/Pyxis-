import { useEffect, useRef, useState } from "react";

const RM_QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(RM_QUERY).matches
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(RM_QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// Appelle `callback` au montage, puis à chaque scroll / resize (une fois par frame).
export function useRafScroll(callback) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      ref.current();
    };
    const onEvent = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    window.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent);
    ref.current();
    return () => {
      window.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

// Ajoute la classe "in" aux éléments ".rv" quand ils entrent dans l'écran.
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    root.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

import { useEffect, useRef } from "react";

// Lignes ondulantes du hero, avec une ondulation rouge qui se propage.
const OPT = {
  rows: (h) => Math.round(h / 15),
  f: 0.006,
  a: 5,
  s: 0.5,
  top: 0.04,
  ink: "rgba(11,11,11,.16)",
  lw: 1,
};

export default function FieldCanvas({ paused, reducedMotion, hidden }) {
  const cvRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const cv = cvRef.current;
    const x = cv.getContext("2d");
    const o = OPT;
    let W = 0;
    let H = 0;
    let t = 0;
    let last = 0;
    let vis = true;
    let raf = 0;
    let rips = [];

    function size() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * d;
      cv.height = H * d;
      x.setTransform(d, 0, 0, d, 0, 0);
      if (reducedMotion) draw(performance.now());
    }

    function draw(now) {
      x.clearRect(0, 0, W, H);
      const rows = o.rows(H);
      const step = W < 700 ? 10 : 6;
      for (let r = 0; r < rows; r++) {
        const base = H * o.top + r * ((H * (1 - o.top * 2)) / rows);
        const pts = [];
        for (let i = 0; i <= W; i += step) {
          let off =
            Math.sin(i * o.f + r * 0.32 + t * o.s) * o.a +
            Math.sin(i * o.f * 2.3 - t * o.s * 0.7 + r * 0.15) * o.a * 0.5;
          let hot = 0;
          for (let k = 0; k < rips.length; k++) {
            const rp = rips[k];
            const age = now - rp.t;
            const rad = age * 0.32;
            const dd = Math.hypot(i - rp.x, base - rp.y);
            const w = Math.exp(-Math.pow((dd - rad) / 55, 2)) * Math.max(0, 1 - age / 3200);
            off -= w * o.a * 4;
            if (w > hot) hot = w;
          }
          pts.push([i, base + off, hot]);
        }
        x.beginPath();
        pts.forEach((p, j) => (j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
        x.strokeStyle = o.ink;
        x.lineWidth = o.lw;
        x.stroke();
        for (let j = 1; j < pts.length; j++) {
          const hh = pts[j][2];
          if (hh > 0.12) {
            x.beginPath();
            x.moveTo(pts[j - 1][0], pts[j - 1][1]);
            x.lineTo(pts[j][0], pts[j][1]);
            x.strokeStyle = "rgba(217,45,32," + Math.min(1, hh * 1.6) + ")";
            x.lineWidth = o.lw + 1.2 * hh;
            x.stroke();
          }
        }
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      if (!vis || pausedRef.current) return;
      t += dt;
      rips = rips.filter((r) => now - r.t < 3200);
      draw(now);
    }

    const spawn = (px, py) => rips.push({ x: px, y: py, t: performance.now() });

    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const io = new IntersectionObserver((e) => {
      vis = e[0].isIntersecting;
    });
    io.observe(cv);

    let timeout = 0;
    let interval = 0;
    if (reducedMotion) {
      draw(performance.now());
    } else {
      timeout = setTimeout(() => spawn(W * 0.72, H * 0.42), 1200);
      interval = setInterval(() => {
        if (vis) spawn(W * (0.45 + Math.random() * 0.5), H * (0.15 + Math.random() * 0.6));
      }, 4800);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      clearInterval(interval);
      ro.disconnect();
      io.disconnect();
    };
  }, [reducedMotion]);

  return <canvas id="field" ref={cvRef} aria-hidden="true" style={hidden ? { display: "none" } : undefined} />;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Pour les liens "href=#" qui ne mènent encore nulle part : évite le saut en haut de page.
export const noop = (e) => e.preventDefault();

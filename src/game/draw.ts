// Low-level isometric drawing primitives shared by sprites and the live scene.
export const HW = 32; // half tile width
export const HH = 16; // half tile height
export type Pt = { x: number; y: number };
export const P = (u: number, v: number, h = 0): Pt => ({ x: (u - v) * HW, y: (u + v) * HH - h });

let C!: CanvasRenderingContext2D;
export const setCtx = (c: CanvasRenderingContext2D) => { C = c; };
export const ctx = () => C;

function clamp(n: number) { return Math.max(0, Math.min(255, Math.round(n))); }
const cache = new Map<string, string>();
/** Lighten (amt>0) or darken (amt<0) a hex colour. */
export function shade(hex: string, amt: number) {
  const k = hex + amt;
  const c = cache.get(k); if (c) return c;
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  const out = `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
  cache.set(k, out); return out;
}

export const EDGE = "rgba(50,35,25,0.35)";

export function poly(pts: Pt[], fill: string | CanvasGradient, stroke: string | null = EDGE, lw = 0.8) {
  C.beginPath(); C.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) C.lineTo(pts[i].x, pts[i].y);
  C.closePath(); C.fillStyle = fill; C.fill();
  if (stroke) { C.strokeStyle = stroke; C.lineWidth = lw; C.lineJoin = "round"; C.stroke(); }
}
export function line(a: Pt, b: Pt, col: string, lw = 1) {
  C.beginPath(); C.moveTo(a.x, a.y); C.lineTo(b.x, b.y); C.strokeStyle = col; C.lineWidth = lw; C.lineCap = "round"; C.stroke();
}
export function circle(c: Pt, r: number, fill: string, stroke: string | null = null) {
  C.beginPath(); C.arc(c.x, c.y, r, 0, Math.PI * 2); C.fillStyle = fill; C.fill();
  if (stroke) { C.strokeStyle = stroke; C.lineWidth = 0.8; C.stroke(); }
}
export function ellipse(c: Pt, rx: number, ry: number, fill: string) {
  C.beginPath(); C.ellipse(c.x, c.y, rx, ry, 0, 0, Math.PI * 2); C.fillStyle = fill; C.fill();
}

/** Ground quad between tile coords. */
export function flat(u0: number, v0: number, u1: number, v1: number, fill: string | CanvasGradient, h = 0, stroke: string | null = null) {
  poly([P(u0, v0, h), P(u1, v0, h), P(u1, v1, h), P(u0, v1, h)], fill, stroke);
}

/** Box: left face at v1 (lit), right face at u1 (shaded). */
export function box(u0: number, v0: number, u1: number, v1: number, h0: number, h1: number, col: string, top?: string) {
  poly([P(u0, v1, h0), P(u1, v1, h0), P(u1, v1, h1), P(u0, v1, h1)], shade(col, -0.04));
  poly([P(u1, v1, h0), P(u1, v0, h0), P(u1, v0, h1), P(u1, v1, h1)], shade(col, -0.25));
  poly([P(u0, v0, h1), P(u1, v0, h1), P(u1, v1, h1), P(u0, v1, h1)], top ?? shade(col, 0.12));
}

export function shadow(u0: number, v0: number, u1: number, v1: number, h: number) {
  const s = Math.min(1.4, h / 45);
  poly([P(u0, v0 + 0.05), P(u1 + s, v0 + 0.05 - s * 0.2), P(u1 + s, v1 + s * 0.15), P(u1, v1 + 0.08), P(u0, v1 + 0.08)], "rgba(25,55,20,0.22)", null);
}

/** Window on left face (plane v). */
export function winL(u0: number, u1: number, v: number, h0: number, h1: number, glass = "#9fd8f2", frame = "#ffffff") {
  poly([P(u0, v, h0), P(u1, v, h0), P(u1, v, h1), P(u0, v, h1)], frame, EDGE, 0.6);
  const du = (u1 - u0) * 0.14, dh = (h1 - h0) * 0.14;
  poly([P(u0 + du, v, h0 + dh), P(u1 - du, v, h0 + dh), P(u1 - du, v, h1 - dh), P(u0 + du, v, h1 - dh)], glass, null);
  line(P(u0 + du * 2, v, h1 - dh * 2), P(u0 + (u1 - u0) * 0.45, v, h0 + dh * 3), "rgba(255,255,255,0.55)", 1);
}
/** Window on right face (plane u). */
export function winR(u: number, v0: number, v1: number, h0: number, h1: number, glass = "#7cbcd8", frame = "#e9e9e9") {
  poly([P(u, v0, h0), P(u, v1, h0), P(u, v1, h1), P(u, v0, h1)], frame, EDGE, 0.6);
  const dv = (v1 - v0) * 0.14, dh = (h1 - h0) * 0.14;
  poly([P(u, v0 + dv, h0 + dh), P(u, v1 - dv, h0 + dh), P(u, v1 - dv, h1 - dh), P(u, v0 + dv, h1 - dh)], glass, null);
}
export function doorL(u0: number, u1: number, v: number, h: number, col = "#8a5a36") {
  poly([P(u0, v, 0), P(u1, v, 0), P(u1, v, h), P(u0, v, h)], col);
  circle(P(u1 - (u1 - u0) * 0.2, v, h * 0.45), 0.9, "#f3d36b");
}

/** Gable roof. alongU: ridge runs along x and the gable faces right. */
export function gable(u0: number, v0: number, u1: number, v1: number, h: number, rh: number, alongU: boolean, roof: string, wall: string, o = 0.08) {
  if (alongU) {
    const vm = (v0 + v1) / 2;
    poly([P(u0 - o, v0 - o, h), P(u1 + o, v0 - o, h), P(u1 + o, vm, h + rh), P(u0 - o, vm, h + rh)], shade(roof, -0.3));
    poly([P(u1, v0, h), P(u1, v1, h), P(u1, vm, h + rh)], shade(wall, -0.25));
    poly([P(u0 - o, v1 + o, h), P(u1 + o, v1 + o, h), P(u1 + o, vm, h + rh), P(u0 - o, vm, h + rh)], roof);
    for (let i = 1; i < 4; i++) {
      const v = vm + (v1 + o - vm) * (i / 4), hh = h + rh * (1 - i / 4);
      line(P(u0 - o, v, hh), P(u1 + o, v, hh), shade(roof, -0.15), 0.8);
    }
    line(P(u0 - o, vm, h + rh), P(u1 + o, vm, h + rh), shade(roof, 0.25), 1.4);
  } else {
    const um = (u0 + u1) / 2;
    poly([P(u0 - o, v0 - o, h), P(u0 - o, v1 + o, h), P(um, v1 + o, h + rh), P(um, v0 - o, h + rh)], shade(roof, 0.08));
    poly([P(u0, v1, h), P(u1, v1, h), P(um, v1, h + rh)], shade(wall, -0.04));
    poly([P(u1 + o, v0 - o, h), P(u1 + o, v1 + o, h), P(um, v1 + o, h + rh), P(um, v0 - o, h + rh)], shade(roof, -0.22));
    for (let i = 1; i < 4; i++) {
      const u = um + (u1 + o - um) * (i / 4), hh = h + rh * (1 - i / 4);
      line(P(u, v0 - o, hh), P(u, v1 + o, hh), shade(roof, -0.35), 0.8);
    }
    line(P(um, v0 - o, h + rh), P(um, v1 + o, h + rh), shade(roof, 0.3), 1.4);
  }
}
/** Hip / pyramid roof. */
export function hip(u0: number, v0: number, u1: number, v1: number, h: number, rh: number, roof: string, o = 0.08) {
  const a = { u0: u0 - o, v0: v0 - o, u1: u1 + o, v1: v1 + o };
  const w = a.u1 - a.u0, d = a.v1 - a.v0, k = Math.min(w, d) / 2;
  const r0 = w >= d ? P(a.u0 + k, a.v0 + k, h + rh) : P(a.u0 + k, a.v0 + k, h + rh);
  const r1 = w >= d ? P(a.u1 - k, a.v0 + k, h + rh) : P(a.u0 + k, a.v1 - k, h + rh);
  const T = P(a.u0, a.v0, h), R = P(a.u1, a.v0, h), B = P(a.u1, a.v1, h), L = P(a.u0, a.v1, h);
  if (w >= d) {
    poly([T, R, r1, r0], shade(roof, -0.3)); poly([L, T, r0], shade(roof, 0.05));
    poly([R, B, r1], shade(roof, -0.22)); poly([L, B, r1, r0], roof);
  } else {
    poly([T, R, r0], shade(roof, -0.3)); poly([T, L, r1, r0], shade(roof, 0.05));
    poly([L, B, r1], roof); poly([R, B, r1, r0], shade(roof, -0.22));
  }
  line(r0, r1, shade(roof, 0.3), 1.2);
}
export function flatRoof(u0: number, v0: number, u1: number, v1: number, h: number, col: string) {
  box(u0, v0, u1, v1, h, h + 4, col);
  flat(u0 + 0.08, v0 + 0.08, u1 - 0.08, v1 - 0.08, shade(col, -0.18), h + 4, null);
}

export function cyl(u: number, v: number, r: number, h0: number, h1: number, col: string, topCol?: string) {
  const c = P(u, v), rx = r * 45, ry = r * 22.5;
  const g = C.createLinearGradient(c.x - rx, 0, c.x + rx, 0);
  g.addColorStop(0, shade(col, 0.15)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.35));
  C.beginPath(); C.moveTo(c.x - rx, c.y - h1); C.lineTo(c.x - rx, c.y - h0);
  C.ellipse(c.x, c.y - h0, rx, ry, 0, Math.PI, 0, true);
  C.lineTo(c.x + rx, c.y - h1); C.closePath(); C.fillStyle = g; C.fill();
  C.strokeStyle = EDGE; C.lineWidth = 0.7; C.stroke();
  C.beginPath(); C.ellipse(c.x, c.y - h1, rx, ry, 0, 0, Math.PI * 2); C.fillStyle = topCol ?? shade(col, 0.2); C.fill(); C.stroke();
}
export function ring(u: number, v: number, r: number, h: number, col: string, lw = 1.5) {
  const c = P(u, v); C.beginPath(); C.ellipse(c.x, c.y - h, r * 45, r * 22.5, 0, 0, Math.PI); C.strokeStyle = col; C.lineWidth = lw; C.stroke();
}

export function tree(u: number, v: number, s = 1, hue = 0) {
  const c = P(u, v);
  ellipse({ x: c.x + 6 * s, y: c.y + 2 }, 14 * s, 6 * s, "rgba(25,55,20,0.25)");
  C.fillStyle = "#7a5230"; C.fillRect(c.x - 2 * s, c.y - 14 * s, 4 * s, 14 * s);
  const greens = hue ? ["#3f8a3a", "#58a843", "#79c457"] : ["#3c8a35", "#55a83e", "#86cc55"];
  circle({ x: c.x - 7 * s, y: c.y - 18 * s }, 9 * s, greens[0]);
  circle({ x: c.x + 7 * s, y: c.y - 19 * s }, 9 * s, greens[0]);
  circle({ x: c.x, y: c.y - 26 * s }, 11 * s, greens[1]);
  circle({ x: c.x - 4 * s, y: c.y - 19 * s }, 8 * s, greens[1]);
  circle({ x: c.x - 4 * s, y: c.y - 29 * s }, 5 * s, greens[2]);
  circle({ x: c.x - 9 * s, y: c.y - 20 * s }, 3 * s, greens[2]);
}
export function pine(u: number, v: number, s = 1) {
  const c = P(u, v);
  ellipse({ x: c.x + 5 * s, y: c.y + 2 }, 11 * s, 5 * s, "rgba(25,55,20,0.25)");
  C.fillStyle = "#6b4426"; C.fillRect(c.x - 2 * s, c.y - 8 * s, 4 * s, 8 * s);
  const layers = [[0, 14, 30], [10, 11, 26], [19, 8, 20]];
  for (const [y, w, hh] of layers) {
    poly([{ x: c.x - w * s, y: c.y - (6 + y) * s }, { x: c.x + w * s, y: c.y - (6 + y) * s }, { x: c.x, y: c.y - (6 + y + hh * 0.7) * s }], "#2f7a3e", null);
    poly([{ x: c.x - w * s, y: c.y - (6 + y) * s }, { x: c.x, y: c.y - (6 + y) * s }, { x: c.x, y: c.y - (6 + y + hh * 0.7) * s }], "#3f9a4c", null);
  }
}
export function bush(u: number, v: number, s = 1, col = "#4f9e3c") {
  const c = P(u, v);
  circle({ x: c.x - 4 * s, y: c.y - 4 * s }, 5 * s, shade(col, -0.1));
  circle({ x: c.x + 4 * s, y: c.y - 4 * s }, 5 * s, shade(col, -0.15));
  circle({ x: c.x, y: c.y - 7 * s }, 5 * s, col);
  circle({ x: c.x - 2 * s, y: c.y - 9 * s }, 2 * s, shade(col, 0.3));
}
export function fence(u0: number, v0: number, u1: number, v1: number, col = "#f4ead8", front = true) {
  const edges: [number, number, number, number][] = [[u0, v0, u1, v0], [u0, v0, u0, v1]];
  if (front) edges.push([u0, v1, u1, v1], [u1, v0, u1, v1]);
  for (const [a, b, c, d] of edges) {
    const n = Math.max(2, Math.round(Math.hypot(c - a, d - b) * 4));
    for (let i = 0; i <= n; i++) { const u = a + (c - a) * (i / n), v = b + (d - b) * (i / n); line(P(u, v), P(u, v, 8), shade(col, -0.25), 1.6); }
    line(P(a, b, 6), P(c, d, 6), col, 1.4); line(P(a, b, 3), P(c, d, 3), col, 1.2);
  }
}
